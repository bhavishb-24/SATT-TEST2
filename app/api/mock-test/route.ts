import { generateText } from 'ai'
import { buildMockTests } from '@/lib/mock-test-bank'
import type { PracticeQuestion } from '@/lib/sat-types'

export const maxDuration = 60

const MATH_TOPICS = [
  'Linear Equations', 'Systems of Equations', 'Quadratic Equations', 'Functions',
  'Exponential Functions', 'Geometry', 'Trigonometry', 'Statistics', 'Percentages',
  'Ratios & Proportions', 'Word Problems', 'Inequalities', 'Polynomials',
  'Circles', 'Data Analysis', 'Probability', 'Sequences', 'Absolute Value',
  'Coordinate Geometry', 'Right Triangles', 'Volume & Area', 'Rates',
]
const RW_TOPICS = [
  'Words in Context', 'Main Idea & Purpose', 'Text Structure & Function',
  'Command of Evidence', 'Inference', 'Transitions', 'Rhetorical Synthesis',
  'Boundaries (Punctuation)', 'Form, Structure & Sense', 'Literary Analysis',
]

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

/**
 * Generate one batch of SAT questions via AI.
 * Returns null if generation fails.
 */
async function generateBatch(
  section: 'Math' | 'Reading & Writing',
  topics: string[],
  count: number,
): Promise<PracticeQuestion[] | null> {
  const topicList = topics.join(', ')
  const prompt = `Generate exactly ${count} SAT-style multiple-choice questions for the ${section} section.
Topics to cover (distribute evenly): ${topicList}
Difficulty distribution: 40% Easy, 40% Medium, 20% Hard.

For each question return a JSON object with these exact keys:
- id: string (unique, e.g. "q-1", "q-2")
- section: "${section}"
- topic: string (one from the topics list above)
- difficulty: "Easy" | "Medium" | "Hard"
- prompt: string (the full question text, SAT style, no images needed)
- choices: array of exactly 4 strings (the answer options A-D)
- correctIndex: number (0-3, index of the correct choice)
- explanation: string (brief 1-2 sentence explanation of the correct answer)

Important rules:
- Questions must be self-contained (no graphs, tables, or images required).
- Math: use plain text math notation (e.g., "x^2", "sqrt(x)", fractions like "3/4").
- Reading & Writing: include a short passage (2-5 sentences) followed by the question.
- Do NOT use LaTeX dollar signs. Write numbers and math as plain text.
- Make choices plausible and only one clearly correct.
- Return ONLY a JSON array of ${count} objects, no other text.`

  try {
    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt,
      temperature: 0.7,
    })
    const jsonStart = text.indexOf('[')
    const jsonEnd = text.lastIndexOf(']') + 1
    if (jsonStart === -1 || jsonEnd === 0) return null
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd)) as PracticeQuestion[]
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

/**
 * Returns a full-length SAT mock test.
 * Real SAT: 54 Reading & Writing + 44 Math = 98 questions.
 * We generate in two batches (R&W and Math) and fall back to the static bank
 * if AI is unavailable.
 */
export async function POST(req: Request) {
  let testNumber = 1
  try {
    const body = await req.json()
    if (typeof body?.testNumber === 'number') testNumber = body.testNumber
  } catch { /* default */ }

  const staticTests = buildMockTests()
  const staticIndex = Math.max(0, Math.min(staticTests.length - 1, testNumber - 1))
  const staticTest = staticTests[staticIndex]

  // Attempt to generate full-SAT-length questions via AI
  const rwTopics = pickRandom(RW_TOPICS, 6)
  const mathTopics = pickRandom(MATH_TOPICS, 8)

  const [rwQuestions, mathQuestions] = await Promise.all([
    generateBatch('Reading & Writing', rwTopics, 54),
    generateBatch('Math', mathTopics, 44),
  ])

  if (rwQuestions && mathQuestions && rwQuestions.length > 0 && mathQuestions.length > 0) {
    // Interleave R&W and Math as the real SAT does (modules alternate)
    const allQuestions: PracticeQuestion[] = []
    // Module 1: 27 R&W
    allQuestions.push(...rwQuestions.slice(0, 27).map((q, i) => ({ ...q, id: `gen-rw-m1-${i + 1}` })))
    // Module 2: 22 Math
    allQuestions.push(...mathQuestions.slice(0, 22).map((q, i) => ({ ...q, id: `gen-m-m1-${i + 1}` })))
    // Module 3: 27 R&W (adaptive — remaining)
    allQuestions.push(...rwQuestions.slice(27).map((q, i) => ({ ...q, id: `gen-rw-m2-${i + 1}` })))
    // Module 4: 22 Math (adaptive — remaining)
    allQuestions.push(...mathQuestions.slice(22).map((q, i) => ({ ...q, id: `gen-m-m2-${i + 1}` })))

    return Response.json({ questions: allQuestions, source: 'ai', provider: 'openai' })
  }

  // Fallback: return the static bank (20 questions)
  return Response.json({ questions: staticTest?.questions ?? [], source: 'fallback', provider: null })
}
