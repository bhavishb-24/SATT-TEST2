import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

export const maxDuration = 30

interface IncomingMessage {
  role:    'user' | 'assistant'
  content: string
}

export async function POST(req: Request) {
  let body: {
    messages?:  IncomingMessage[]
    roomName?:  string
    exam?:      string
    topic?:     string
  }

  try {
    body = await req.json()
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  const { messages = [], roomName, exam, topic } = body

  if (!messages.length) {
    return new Response('No messages', { status: 400 })
  }

  const context = [
    roomName && `Room: "${roomName}"`,
    exam     && `Exam: ${exam}`,
    topic    && `Topic: ${topic}`,
  ].filter(Boolean).join(' | ')

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `You are Sage AI, a friendly expert ${exam ?? 'SAT'} tutor inside a live collaborative study room.${context ? ` Context — ${context}.` : ''}

Your job:
- Answer student questions clearly and concisely (2–4 sentences unless a step-by-step solution is needed).
- Explain concepts, solve problems, and give study tips relevant to the ${exam ?? 'SAT'}.
- For math problems work through them step by step, numbering each step.
- Use **bold** for key terms or formulas.
- Keep an encouraging, peer-like tone — never robotic or overly formal.
- Never fabricate information; if unsure, say so.

Math formatting rules — FOLLOW THESE EXACTLY:
- Use LaTeX for ALL mathematical expressions, variables, and formulas.
- Inline math: wrap in \\( and \\)  — example: \\(x^2 + 3x - 4 = 0\\)
- Display (block) math: wrap in \\[ and \\] — example: \\[x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}\\]
- NEVER write raw LaTeX without these delimiters (e.g., never write "\\frac" outside of delimiters).
- NEVER use dollar signs ($) for math.

Reply in plain text otherwise. Do NOT use markdown headers or bullet points unless showing numbered solution steps.`,
    // Use ModelMessage format directly — no conversion needed
    messages: messages.map((m) => ({
      role:    m.role as 'user' | 'assistant',
      content: m.content,
    })),
  })

  return result.toUIMessageStreamResponse()
}
