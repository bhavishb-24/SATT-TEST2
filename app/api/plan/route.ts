import { generateText, Output } from 'ai'
import type { LanguageModel } from 'ai'
import { z } from 'zod'
import { buildFallbackPlan } from '@/lib/fallback-plan'
import { textModelChain } from '@/lib/ai-providers'
import type { StudyPlan } from '@/lib/sat-types'

export const maxDuration = 60

const topicSchema = z.object({
  name: z.string(),
  section: z.string(),
  time_minutes: z.number(),
  score_impact_percent: z.number(),
  difficulty: z.string(),
  why_it_matters: z.string(),
  action_steps: z.array(z.string()),
  stuck_explanation: z.string(),
  confidence_low_steps: z.array(z.string()),
  morning_reminder: z.string(),
})

const planSchema = z.object({
  summary: z.object({
    motivational_message: z.string(),
    estimated_score_improvement: z.string().nullable(),
    sleep_deadline: z.string(),
    wake_up_time: z.string(),
    total_topics: z.number(),
  }),
  topics: z.array(topicSchema),
  skip_topics: z.array(z.object({ name: z.string(), reason: z.string() })),
  top_math_tips: z.array(z.string()),
  top_rw_tips: z.array(z.string()),
})

const SYSTEM = `You are an expert SAT tutor building an emergency, night-before study plan for a stressed high-school student. 
Be specific, kind, and practical. Rules:
- Maximum 5 topics, ranked by score impact per hour of study.
- Tailor the action steps to the student's stated learning style.
- If panic level is 4 or 5, keep steps short and confidence-building.
- Provide at least 3 skip_topics only if you can justify skipping them tonight.
- Every action_steps array must end with a "Self-check:" question.
- Each action step must be doable in 5-15 minutes with no external resources, written in the second person.
- Do NOT invent fake score gains. Only fill estimated_score_improvement if you can reasonably justify a range; otherwise set it to null.
- score_impact_percent is your estimate of how high-yield the topic is (0-100).`

function buildUserPrompt(d: any): string {
  return `Emergency SAT study plan needed. Student situation:

Panic level: ${d.panic}
Test start time: ${d.testStartTime}
Study time available: ${d.timeBudgetLabel}${d.sprint ? ' (SPRINT MODE: only 1-2 quick-win topics, max 3 action steps each)' : ''}
Last Math score: ${d.lastMath || 'unknown'}
Last R&W score: ${d.lastRW || 'unknown'}
Math goal: ${d.goalMath || 'unknown'}
R&W goal: ${d.goalRW || 'unknown'}
Weak areas: ${(d.weakAreas || []).join(', ') || 'unknown'}
Learning style: ${d.learningStyle || 'unknown'}
Previous prep: ${(d.previousPrep || []).join(', ') || 'none'}
${d.scoreReportText ? `Score report notes: ${d.scoreReportText}` : ''}

Use these EXACT values in the summary:
sleep_deadline: "${d.sleepLabel}"
wake_up_time: "${d.wakeLabel}"`
}

// Deterministic normalization (the "human-in-the-loop / validation" guardrails).
function normalize(plan: StudyPlan, sprint: boolean, sleepLabel: string, wakeLabel: string): StudyPlan {
  let topics = [...plan.topics].sort(
    (a, b) => b.score_impact_percent - a.score_impact_percent,
  )
  const maxTopics = sprint ? 2 : 5
  topics = topics.slice(0, maxTopics).map((t) => ({
    ...t,
    score_impact_percent: Math.max(0, Math.min(100, Math.round(t.score_impact_percent))),
    action_steps: sprint ? t.action_steps.slice(0, 3) : t.action_steps,
  }))
  return {
    ...plan,
    summary: {
      ...plan.summary,
      sleep_deadline: sleepLabel,
      wake_up_time: wakeLabel,
      total_topics: topics.length,
    },
    topics,
  }
}

async function tryModel(
  model: LanguageModel,
  label: string,
  system: string,
  prompt: string,
): Promise<StudyPlan | null> {
  try {
    const { experimental_output } = await generateText({
      model,
      system,
      prompt,
      experimental_output: Output.object({ schema: planSchema }),
    })
    return experimental_output as StudyPlan
  } catch (err) {
    console.log(`[v0] Provider ${label} failed:`, (err as Error).message)
    return null
  }
}

export async function POST(req: Request) {
  const data = await req.json()
  const sprint = data.sprint === true
  const sleepLabel = data.sleepLabel || ''
  const wakeLabel = data.wakeLabel || ''
  const system = SYSTEM
  const prompt = buildUserPrompt(data)

  // Direct provider keys with automatic rotation: Claude leads, GPT-4o backs up,
  // each across up to three keys.
  const chain = textModelChain()

  for (const { model, provider } of chain) {
    const result = await tryModel(model, provider, system, prompt)
    if (result) {
      const plan = normalize(result, sprint, sleepLabel, wakeLabel)
      return Response.json({
        plan,
        source: 'ai',
        provider,
        validatedBy: 'structure + sprint guardrails',
        note: null,
      })
    }
  }

  // All providers failed -> clearly labeled generic fallback.
  return Response.json({
    plan: buildFallbackPlan(sleepLabel, wakeLabel, sprint),
    source: 'fallback',
    provider: null,
    validatedBy: null,
    note: 'We couldn’t reach the AI — here’s our standard high-yield plan instead.',
  })
}
