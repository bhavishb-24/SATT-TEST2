import { openai } from '@ai-sdk/openai'
import { streamText, type ModelMessage } from 'ai'
import { PERSONAS, type PersonaKey } from '@/components/sat/whiteboard/lesson-data'

// Never use the edge runtime with the AI SDK.
export const maxDuration = 30

interface IncomingMessage {
  role: 'student' | 'assistant' | 'user'
  content: string
}

interface TutorRequest {
  messages: IncomingMessage[]
  persona?: PersonaKey
  question?: {
    number?: number
    section?: string
    prompt?: string
  }
}

const BASE_PROMPT = `You are Whiteboard AI, an SAT tutor inside a visual whiteboard app called SAT Sage.

Your teaching style is step-by-step:
- NEVER give the final numeric answer immediately. Guide the student toward it with one small, clear hint or question at a time.
- Build on the student's responses.
- Keep replies short and conversational — usually 1-3 sentences. This is a chat, not an essay.
- Use plain language a high-schooler understands. Define jargon briefly.
- When you reference a formula, write it cleanly (e.g. a² + b² = c²).
- Gently correct mistakes without making the student feel bad.
- Stay focused on the SAT question at hand and general SAT strategy. Politely redirect off-topic requests.

Use **bold** (with double asterisks) to emphasize key terms or formulas, since the UI renders it.`

export function personaInstruction(persona?: PersonaKey): string {
  const p = PERSONAS.find((x) => x.key === persona)
  return p ? `\n\nTONE & PERSONALITY: ${p.instruction}` : ''
}

export function questionContextFor(question?: TutorRequest['question']): string {
  return question?.prompt
    ? `The student is currently working on SAT Question ${question.number ?? ''} (${
        question.section ?? ''
      }): "${question.prompt}". Keep your guidance anchored to this problem unless the student asks about something else.`
    : 'The student is working through an SAT problem on the whiteboard.'
}

export async function POST(req: Request) {
  let body: TutorRequest
  try {
    body = (await req.json()) as TutorRequest
  } catch {
    return new Response('Invalid request body', { status: 400 })
  }

  const { messages = [], question, persona } = body

  const modelMessages: ModelMessage[] = messages
    .filter((m) => typeof m.content === 'string' && m.content.trim().length > 0)
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }))

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `${BASE_PROMPT}${personaInstruction(persona)}\n\n${questionContextFor(question)}`,
    messages: modelMessages,
  })

  return result.toTextStreamResponse()
}
