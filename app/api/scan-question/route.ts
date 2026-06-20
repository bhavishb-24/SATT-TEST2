import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'

export const maxDuration = 45

const SYSTEM_PROMPT = `You are a patient SAT tutor. The student has photographed a question they are stuck on. Do NOT give the final answer right away. Start by asking one guiding question that points at the underlying concept, without revealing the method. Wait for the student's reply. React to what they actually say — confirm if they are on the right track, gently correct if not, and only escalate to a stronger hint or the full step-by-step solution if they ask for it or get stuck again after a follow-up nudge. Once they reach the answer (with help or on their own), confirm it clearly and add one short "trick for next time" tip. If the image is unclear or is not a recognizable SAT-style question, say so and ask them to retake the photo.`

const ANSWER_PROMPT = `The student has asked to skip straight to the answer. Walk them through the complete step-by-step solution now. Be clear, concise, and finish with one short "trick for next time" tip they can use on similar questions.`

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: Request) {
  const { image, messages, showAnswer } = await req.json() as {
    image: string
    messages: ChatMessage[]
    showAnswer?: boolean
  }

  if (!image || typeof image !== 'string') {
    return new Response('No image provided', { status: 400 })
  }

  const openai = process.env.OPENAI_API_KEY
    ? createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null

  if (!openai) {
    return new Response('AI is not configured — please add your OPENAI_API_KEY.', { status: 503 })
  }

  // Build the message list. The first user message always includes the image.
  // Subsequent turns are text-only but carry the full history.
  const builtMessages: Parameters<typeof streamText>[0]['messages'] = [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          image,
        },
        {
          type: 'text',
          text: showAnswer
            ? ANSWER_PROMPT
            : "Here is the question I'm stuck on. Please help me work through it.",
        },
      ],
    },
    // Replay the prior turns (skip the first if it was the initial image message)
    ...messages.slice(1).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ]

  const result = streamText({
    model: openai('gpt-4o'),
    system: SYSTEM_PROMPT,
    messages: builtMessages,
  })

  return result.toTextStreamResponse()
}
