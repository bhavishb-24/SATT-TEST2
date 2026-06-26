import { experimental_generateSpeech as generateSpeech } from 'ai'
import { openai } from '@ai-sdk/openai'

// Never use the edge runtime with the AI SDK.
export const maxDuration = 30

interface TtsRequest {
  text: string
  voice?: string
}

export async function POST(req: Request) {
  let body: TtsRequest
  try {
    body = (await req.json()) as TtsRequest
  } catch {
    return new Response('Invalid request body', { status: 400 })
  }

  const text = (body.text ?? '').trim()
  if (!text) return new Response('Missing text', { status: 400 })

  if (!process.env.OPENAI_API_KEY) {
    return new Response('TTS unavailable — OPENAI_API_KEY not configured', { status: 503 })
  }

  try {
    const { audio } = await generateSpeech({
      model: openai.speech('gpt-4o-mini-tts'),
      text,
      voice: body.voice ?? 'nova',
      instructions:
        'Speak in a warm, encouraging, patient tone like a friendly tutor explaining to a high-school student. Natural pacing.',
    })

    return new Response(Buffer.from(audio.uint8Array), {
      headers: {
        'Content-Type': audio.mediaType || 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.log('[v0] tts error:', err)
    return new Response('TTS failed', { status: 500 })
  }
}
