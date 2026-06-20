import { generateText, Output } from 'ai'
import { z } from 'zod'
import { textModelChain } from '@/lib/ai-providers'

export const maxDuration = 45

const reviewSchema = z.object({
  overall_summary: z.string(),
  identified_weak_areas: z.array(z.string()),
  strengths: z.array(z.string()),
  recommended_focus: z.string(),
  encouragement: z.string(),
})

type Review = z.infer<typeof reviewSchema>

const SYSTEM = `You are an expert SAT diagnostic analyst reviewing a student's just-completed 15-question diagnostic (Math + Reading & Writing).
You are given each question's topic, section, difficulty, whether the student answered correctly, and what they chose.
Your job:
- Identify the specific topics/skills the student is weakest in, based ONLY on the questions they missed. Use concrete topic names (e.g. "Linear equations", "Comma rules").
- Note 1-3 genuine strengths based on what they got right.
- Write a short, warm, honest overall_summary (2-3 sentences) referencing their actual performance.
- recommended_focus: one sentence on what to drill first tonight.
- encouragement: one short kind, calming line.
Never invent topics that were not in the diagnostic. Be specific and practical.`

function buildPrompt(d: any): string {
  const lines = (d.results || []).map((r: any, i: number) => {
    return `Q${i + 1} [${r.section} · ${r.topic} · ${r.difficulty}]: ${
      r.correct ? 'CORRECT' : 'WRONG'
    }`
  })
  return `Here is the student's diagnostic performance:

Total correct: ${d.correct} / ${d.total}
Math correct: ${d.mathCorrect} / ${d.mathTotal}
Reading & Writing correct: ${d.rwCorrect} / ${d.rwTotal}

Per-question:
${lines.join('\n')}

Analyze the results and return the structured review.`
}

async function tryModel(
  model: string,
  label: string,
  prompt: string,
): Promise<Review | null> {
  try {
    const { experimental_output } = await generateText({
      model,
      system: SYSTEM,
      prompt,
      experimental_output: Output.object({ schema: reviewSchema }),
    })
    return experimental_output as Review
  } catch (err) {
    console.log(`[v0] Diagnostic review ${label} failed:`, (err as Error).message)
    return null
  }
}

export async function POST(req: Request) {
  const data = await req.json()
  const prompt = buildPrompt(data)

  for (const { model, provider } of textModelChain()) {
    const result = await tryModel(model, provider, prompt)
    if (result) {
      return Response.json({ review: result, source: 'ai', provider })
    }
  }

  // Deterministic fallback: derive weak areas straight from the missed topics.
  const missed: string[] = []
  const strong: string[] = []
  for (const r of data.results || []) {
    if (r.correct) {
      if (!strong.includes(r.topic)) strong.push(r.topic)
    } else if (!missed.includes(r.topic)) {
      missed.push(r.topic)
    }
  }
  const review: Review = {
    overall_summary: `You answered ${data.correct} of ${data.total} correct (${data.mathCorrect}/${data.mathTotal} Math, ${data.rwCorrect}/${data.rwTotal} Reading & Writing). We'll target the topics you missed first.`,
    identified_weak_areas: missed.slice(0, 6),
    strengths: strong.slice(0, 3),
    recommended_focus:
      missed.length > 0
        ? `Start with ${missed[0]} — it's your biggest quick win tonight.`
        : 'Reinforce your strongest areas and review pacing.',
    encouragement: "You showed up the night before — that's already a win. Let's get focused.",
  }
  return Response.json({ review, source: 'fallback', provider: null })
}
