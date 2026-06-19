import { generateText, Output } from 'ai'
import { z } from 'zod'
import { visionModelChain } from '@/lib/ai-providers'

export const maxDuration = 45

const schema = z.object({
  readable: z.boolean(),
  math_score: z.number().nullable(),
  rw_score: z.number().nullable(),
  weak_areas_text: z.string().nullable(),
})

// Parse an uploaded SAT score report image with a vision model.
// If the model cannot read it, we report that honestly — we never invent weak areas.
export async function POST(req: Request) {
  const { image } = await req.json()
  if (!image || typeof image !== 'string') {
    return Response.json({ readable: false, error: 'No image provided' }, { status: 400 })
  }

  const chain = visionModelChain()

  for (const attempt of chain) {
    try {
      const { experimental_output } = await generateText({
        model: attempt.model,
        system:
          'You extract SAT score information from an uploaded image. If the image is not a readable SAT score report, set readable=false and leave scores null. Never guess or invent scores or weak areas.',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Read this SAT score report. Return the Math section score, the Reading & Writing section score, and any noted weak areas. If you cannot read it clearly, set readable to false.',
              },
              { type: 'image', image },
            ],
          },
        ],
        experimental_output: Output.object({ schema }),
      })
      const out = experimental_output as z.infer<typeof schema>
      return Response.json(out)
    } catch (err) {
      console.log(`[v0] Score report model ${attempt.provider} failed:`, (err as Error).message)
    }
  }

  return Response.json({
    readable: false,
    math_score: null,
    rw_score: null,
    weak_areas_text: null,
    error: 'Could not read the report yet.',
  })
}
