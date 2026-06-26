import { streamText, convertToModelMessages } from 'ai'
import type { UIMessage } from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, roomName, exam, topic }: {
    messages: UIMessage[]
    roomName?: string
    exam?: string
    topic?: string
  } = await req.json()

  const context = [
    roomName && `Room: "${roomName}"`,
    exam && `Exam: ${exam}`,
    topic && `Topic: ${topic}`,
  ].filter(Boolean).join(' | ')

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    system: `You are Sage AI, a friendly and expert SAT tutor inside a live collaborative study room. ${context ? `Context — ${context}.` : ''}

Your job:
- Answer student questions clearly and concisely (2–4 sentences max unless a step-by-step solution is needed)
- Explain SAT concepts, solve problems, and give study tips
- If shown a math problem, work through it step by step
- Use **bold** for key terms or formulas
- Keep an encouraging, peer-like tone — not robotic or formal
- Never make up information; if unsure, say so

Reply in plain text. Do NOT use markdown headers or bullet lists unless showing solution steps.`,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
