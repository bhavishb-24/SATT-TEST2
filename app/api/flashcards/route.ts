import { generateText, Output } from 'ai'
import type { LanguageModel } from 'ai'
import { z } from 'zod'
import { textModelChain } from '@/lib/ai-providers'
import { FLASHCARDS } from '@/lib/flashcard-data'
import type { Flashcard, Section } from '@/lib/sat-types'

export const maxDuration = 45

const flashcardSchema = z.object({
  flashcards: z.array(
    z.object({
      front: z.string(),
      back: z.string(),
      category: z.string(),
      section: z.string(),
    }),
  ),
})

const SYSTEM = `You are an expert SAT tutor creating targeted flashcards for a student studying the night before their SAT.
Rules:
- Each front must be a clear, concise question or prompt — the kind a student would quiz themselves on.
- Each back must be a short, memorable answer (1-2 sentences max) that teaches the core concept.
- category is the specific SAT skill (e.g. "Quadratics", "Comma Rules", "Linear Equations", "Transitions").
- section must be exactly "Math" or "Reading & Writing".
- Vary card types: definitions, formulas, rules, worked mini-examples.
- Do NOT copy real SAT questions — these are concept review cards, not practice problems.
- Prioritize the specific weak areas provided.`

function buildPrompt(weakAreas: string[], section: string, count: number): string {
  return `Generate ${count} SAT flashcards for a student reviewing tonight.
${section !== 'Both' ? `Focus on the ${section} section.` : 'Mix Math and Reading & Writing.'}
${weakAreas.length > 0 ? `Prioritize these weak areas: ${weakAreas.join(', ')}.` : 'Cover high-yield SAT concepts.'}
Make them specific, practical, and easy to memorize quickly.`
}

async function tryModel(
  model: LanguageModel,
  label: string,
  prompt: string,
): Promise<Flashcard[] | null> {
  try {
    const { experimental_output } = await generateText({
      model,
      system: SYSTEM,
      prompt,
      experimental_output: Output.object({ schema: flashcardSchema }),
    })
    const out = experimental_output as z.infer<typeof flashcardSchema>
    if (!out.flashcards?.length) return null
    return out.flashcards.map((c, i) => ({
      id: `ai-fc-${Date.now()}-${i}`,
      front: c.front,
      back: c.back,
      category: c.category,
      section: (c.section === 'Math' ? 'Math' : 'Reading & Writing') as Section,
    }))
  } catch (err) {
    console.log(`[v0] Flashcard provider ${label} failed:`, (err as Error).message)
    return null
  }
}

export async function POST(req: Request) {
  const { weakAreas = [], section = 'Both', count = 20 } = await req.json()

  for (const { model, provider } of textModelChain()) {
    const result = await tryModel(model, provider, buildPrompt(weakAreas, section, count))
    if (result && result.length > 0) {
      return Response.json({ flashcards: result, source: 'ai', provider })
    }
  }

  // Fallback: return the static bank filtered to relevant section
  const pool =
    section === 'Both'
      ? FLASHCARDS
      : FLASHCARDS.filter((c) => c.section === section)
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count)
  return Response.json({ flashcards: shuffled, source: 'fallback', provider: null })
}
