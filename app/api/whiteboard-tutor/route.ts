import { openai } from '@ai-sdk/openai'
import { streamText, type ModelMessage } from 'ai'

// Never use the edge runtime with the AI SDK.
export const maxDuration = 30

interface IncomingMessage {
  role: 'student' | 'assistant' | 'user'
  content: string
}

interface TutorRequest {
  messages: IncomingMessage[]
  question?: {
    number?: number
    section?: string
    prompt?: string
  }
}

const SYSTEM_PROMPT = `You are Whiteboard AI, a warm, encouraging SAT tutor inside a visual whiteboard app called SAT Sage.

Your teaching style is Socratic and step-by-step:
- NEVER give the final numeric answer immediately. Guide the student toward it with one small, clear hint or question at a time.
- Ask a guiding question, wait for the student, then build on their response.
- Keep replies short and conversational — usually 1-3 sentences. This is a chat, not an essay.
- Use plain language a high-schooler understands. Define jargon briefly.
- When you reference a formula, write it cleanly (e.g. a² + b² = c²).
- Celebrate progress and gently correct mistakes without making the student feel bad.
- If the student is clearly stuck after a couple of hints, walk them through the next single step, then check their understanding.
- Stay focused on the SAT question at hand and general SAT strategy. Politely redirect off-topic requests.
- You can describe what you would draw on the whiteboard, but keep it brief.

Use **bold** (with double asterisks) to emphasize key terms or formulas, since the UI renders it.`

export async function POST(req: Request) {
  let body: TutorRequest
  try {
    body = (await req.json()) as TutorRequest
  } catch {
    return new Response('Invalid request body', { status: 400 })
  }

  const { messages = [], question } = body

  const modelMessages: ModelMessage[] = messages
    .filter((m) => typeof m.content === 'string' && m.content.trim().length > 0)
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }))

  const questionContext = question?.prompt
    ? `The student is currently working on SAT Question ${question.number ?? ''} (${
        question.section ?? ''
      }): "${question.prompt}". Keep your guidance anchored to this problem unless the student asks about something else.`
    : 'The student is working through an SAT problem on the whiteboard.'

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `${SYSTEM_PROMPT}\n\n${questionContext}`,
    messages: modelMessages,
  })

  return result.toTextStreamResponse()
}
