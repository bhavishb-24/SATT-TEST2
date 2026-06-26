import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

export const maxDuration = 30

type GenerateType = 'questions' | 'flashcards' | 'practice'

export async function POST(req: Request) {
  let body: { type?: GenerateType; exam?: string; topic?: string }
  try {
    body = await req.json()
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  const { type = 'questions', exam = 'SAT', topic = '' } = body
  const topicStr = topic.trim() || 'mixed topics'

  let prompt = ''

  if (type === 'questions') {
    prompt = `Generate 5 ${exam}-style multiple-choice questions about: ${topicStr}.

Each question must have exactly 4 answer choices. Return a JSON array of objects with keys:
- id: string (unique, e.g. "q-1")
- question: string (the full question text, self-contained, no images needed)
- choices: array of exactly 4 strings
- correct: number (0-indexed position of the correct answer)
- explanation: string (1-2 sentence explanation of why the correct answer is right)

Rules:
- Questions must be self-contained (no graphs, images, or external references needed).
- Math: use plain text notation (e.g. "x^2", "sqrt(x)", "3/4").
- Reading & Writing: include a short 2-4 sentence passage before the question.
- Return ONLY the JSON array. No other text.`
  } else if (type === 'flashcards') {
    prompt = `Generate 8 flashcards for studying ${topicStr} on the ${exam}.

Return a JSON array of objects with keys:
- id: string (unique, e.g. "f-1")
- front: string (term, concept, or formula name — short, max 10 words)
- back: string (clear definition or explanation, 1-3 sentences, self-contained)

Rules:
- Cover the most important and frequently tested concepts for the topic.
- Be concise but complete — each card should be a standalone study unit.
- Return ONLY the JSON array. No other text.`
  } else {
    // practice — single question
    prompt = `Generate 1 ${exam}-style multiple-choice question about: ${topicStr}.

Return a JSON array with exactly 1 object with keys:
- id: string ("p-1")
- question: string (full question, self-contained)
- choices: array of exactly 4 strings
- correct: number (0-indexed)
- explanation: string (1-2 sentences explaining the correct answer)

Return ONLY the JSON array. No other text.`
  }

  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      temperature: 0.7,
    })

    const jsonStart = text.indexOf('[')
    const jsonEnd = text.lastIndexOf(']') + 1
    if (jsonStart === -1 || jsonEnd === 0) {
      return Response.json({ items: [] })
    }

    const items = JSON.parse(text.slice(jsonStart, jsonEnd))
    return Response.json({ items: Array.isArray(items) ? items : [] })
  } catch {
    return Response.json({ items: [] })
  }
}
