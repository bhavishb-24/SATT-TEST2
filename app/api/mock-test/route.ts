import { generateText, Output } from 'ai'
import { z } from 'zod'
import { buildMockTests } from '@/lib/mock-test-bank'
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

const MATH_PER_TEST = 10
const RW_PER_TEST = 10

const SYSTEM = `You are an official SAT item writer creating a full-length, digital-SAT-style mock test.
Rules:
- Write questions that closely match the real digital SAT in style, phrasing, length, and difficulty distribution.
- Math: cover Algebra, Advanced Math (quadratics/exponentials), Problem-Solving & Data Analysis, and Geometry/Trig. Most should be solvable by hand; allow a calculator-friendly mix.
- Reading & Writing: short passages (1-3 sentences of context) followed by a question — cover Craft & Structure, Information & Ideas, Standard English Conventions (grammar/punctuation), and Expression of Ideas (transitions).
- Exactly 4 answer choices per question, exactly one correct, correctIndex is its 0-based position.
- Keep prompts self-contained and unambiguous; no figures or images required.
- Each explanation teaches the concept in 1-2 sentences.
- Vary difficulty: roughly 40% Easy, 40% Medium, 20% Hard.
- Write fresh, original questions — never copy published SAT items.`

function buildPrompt(): string {
  return `Generate a complete SAT-style practice test with exactly ${MATH_PER_TEST} Math questions and ${RW_PER_TEST} Reading & Writing questions (${MATH_PER_TEST + RW_PER_TEST} total).
Order them with all Reading & Writing questions first, then all Math questions, mirroring the digital SAT module structure.
Return them in the structured format requested.`
}

function normalizeSection(raw: string): Section {
  const s = raw.toLowerCase()
  return s.includes('read') || s.includes('writ') || s.includes('english')
    ? 'Reading & Writing'
    : 'Math'
}

async function tryModel(
  model: string,
  label: string,
): Promise<PracticeQuestion[] | null> {
  try {
    const { experimental_output } = await generateText({
      model,
      system: SYSTEM,
      prompt: buildPrompt(),
      experimental_output: Output.object({ schema: questionSchema }),
    })
    const out = experimental_output as z.infer<typeof questionSchema>
    if (!out.questions || out.questions.length === 0) return null
    return out.questions.map((q, i) => ({
      id: `ai-mock-${Date.now()}-${i}`,
      section: normalizeSection(q.section),
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
    console.log(`[v0] Mock-test provider ${label} failed:`, (err as Error).message)
    return null
  }
}

export async function POST(req: Request) {
  // testNumber lets the static fallback return a distinct test (1-based).
  let testNumber = 1
  try {
    const body = await req.json()
    if (typeof body?.testNumber === 'number') testNumber = body.testNumber
  } catch {
    // no body — default to test 1
  }

  const chain = textModelChain()

  for (const { model, provider } of chain) {
    const result = await tryModel(model, provider)
    if (result && result.length > 0) {
      return Response.json({ questions: result, source: 'ai', provider })
    }
  }

  // Deterministic fallback: pull one of the pre-built curated tests.
  const tests = buildMockTests()
  const index = Math.max(0, Math.min(tests.length - 1, testNumber - 1))
  return Response.json({
    questions: tests[index]?.questions ?? [],
    source: 'fallback',
    provider: null,
  })
}
