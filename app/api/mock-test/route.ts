import { buildMockTests } from '@/lib/mock-test-bank'

/**
 * Mock test questions are served directly from the curated static banks —
 * no AI involved. testNumber (1-based) selects which pre-built test to return.
 */
export async function POST(req: Request) {
  let testNumber = 1
  try {
    const body = await req.json()
    if (typeof body?.testNumber === 'number') testNumber = body.testNumber
  } catch {
    // no body — default to test 1
  }

  const tests = buildMockTests()
  const index = Math.max(0, Math.min(tests.length - 1, testNumber - 1))
  const questions = tests[index]?.questions ?? []

  return Response.json({ questions, source: 'bank', provider: null })
}
