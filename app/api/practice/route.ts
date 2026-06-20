import { generateText, Output } from 'ai'
import { z } from 'zod'
import { fallbackQuestions } from '@/lib/practice-bank'
import { textModelChain } from '@/lib/ai-providers'
import type { PracticeQuestion, Section } from '@/lib/sat-types'

export const maxDuration = 60

const questionSchema = z.object({
  questions: z.array(
    z.object({
      section: z.string(),
      topic: z.string(),
      difficulty: z.string(),
      prompt: z.string(),
      choices: z.array(z.string()).length(4),
      correctIndex: z.number().min(0).max(3),
      explanation: z.string(),
    }),
  ),
})

const SYSTEM = `You are an SAT item writer. Generate original, exam-realistic multiple-choice questions.
Rules:
- Exactly 4 answer choices per question.
- Exactly one correct answer; correctIndex is its 0-based position.
- Math questions must be solvable without a calculator unless trivial arithmetic.
- Keep prompts concise and unambiguous.
- The explanation must teach the concept in 1-2 sentences, not just state the answer.
- Vary difficulty across the set.
- Do not reuse famous published SAT questions; write fresh ones.`

function buildPrompt(section: string, topics: string[], count: number): string {
  return `Write ${count} SAT practice questions.
Section focus: ${section}
${topics.length ? `Prioritize these weak areas: ${topics.join(', ')}` : 'Cover a mix of common topics.'}
Return them in the structured format requested.`
}

async function tryModel(
  model: string,
  label: string,
  prompt: string,
): Promise<PracticeQuestion[] | null> {
  try {
    const { experimental_output } = await generateText({
      model,
      system: SYSTEM,
      prompt,
      experimental_output: Output.object({ schema: questionSchema }),
    })
    const out = experimental_output as z.infer<typeof questionSchema>
    return out.questions.map((q, i) => ({
      id: `ai-${Date.now()}-${i}`,
      section: (q.section.toLowerCase().includes('read') ||
      q.section.toLowerCase().includes('writing')
        ? 'Reading & Writing'
        : 'Math') as Section,
      topic: q.topic,
      difficulty: (['Easy', 'Medium', 'Hard'].includes(q.difficulty)
        ? q.difficulty
        : 'Medium') as PracticeQuestion['difficulty'],
      prompt: q.prompt,
      choices: q.choices,
      correctIndex: Math.max(0, Math.min(3, q.correctIndex)),
      explanation: q.explanation,
    }))
  } catch (err) {
    console.log(`[v0] Practice provider ${label} failed:`, (err as Error).message)
    return null
  }
}

export async function POST(req: Request) {
  const { section = 'Both', topics = [], count = 5 } = await req.json()
  const sectionLabel =
    section === 'Math'
      ? 'Math'
      : section === 'Reading & Writing'
        ? 'Reading & Writing'
        : 'Both Math and Reading & Writing'
  const prompt = buildPrompt(sectionLabel, topics, count)

  const chain = textModelChain()

  for (const { model, provider } of chain) {
    const result = await tryModel(model, provider, prompt)
    if (result && result.length > 0) {
      return Response.json({ questions: result, source: 'ai', provider })
    }
  }

  return Response.json({
    questions: fallbackQuestions(section, count),
    source: 'fallback',
    provider: null,
  })
}
