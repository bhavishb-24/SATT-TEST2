import { fallbackQuestions } from '@/lib/practice-bank'
import type { Section } from '@/lib/sat-types'

/**
 * Practice questions are served directly from the curated PRACTICE_BANK —
 * no AI involved. This guarantees instant, consistent, formatting-safe questions
 * every time and keeps AI credits reserved for plan generation and analysis.
 */
export async function POST(req: Request) {
  const { section = 'Both', count = 5 } = await req.json()

  const sectionArg: Section | 'Both' =
    section === 'Math'
      ? 'Math'
      : section === 'Reading & Writing'
        ? 'Reading & Writing'
        : 'Both'

  const questions = fallbackQuestions(sectionArg, count)

  return Response.json({ questions, source: 'bank', provider: null })
}
