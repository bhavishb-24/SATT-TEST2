import { generateObject } from 'ai'
import { z } from 'zod'

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

  // Extract base64 data and mediaType from the data URL (e.g. "data:image/png;base64,...")
  const match = image.match(/^data:([^;]+);base64,(.+)$/)
  const mediaType = (match?.[1] ?? 'image/png') as `image/${string}`
  const imageData = match ? match[2] : image

  try {
    const { object } = await generateObject({
      model: 'openai/gpt-4o',
      schema,
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
            {
              type: 'image',
              image: imageData,
              mediaType,
            },
          ],
        },
      ],
    })
    return Response.json(object)
  } catch (err) {
    console.error('[score-report] generateObject failed:', (err as Error).message)
    return Response.json({
      readable: false,
      math_score: null,
      rw_score: null,
      weak_areas_text: null,
    })
  }
}
