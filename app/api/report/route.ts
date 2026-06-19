import { NextRequest, NextResponse } from 'next/server'

const REPORT_EMAIL = 'kitkatbb20@gmail.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { questionNumber, section, topic, difficulty, questionId, prompt, choices, correctIndex, explanation, reason, details } = body

    if (!questionNumber || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Build the email content
    const reasonLabel = reason.label || reason
    const choicesText = choices
      .map((choice: string, i: number) => `  ${String.fromCharCode(65 + i)}. ${choice}`)
      .join('\n')

    const emailContent = `
QUESTION REPORT
─────────────────────────────────────
Question #: ${questionNumber}
Section: ${section}
Topic: ${topic}
Difficulty: ${difficulty}
Question ID: ${questionId}

QUESTION TEXT:
${prompt}

ANSWER CHOICES:
${choicesText}

MARKED CORRECT: ${String.fromCharCode(65 + correctIndex)}. ${choices[correctIndex]}

EXPLANATION:
${explanation}
─────────────────────────────────────
ISSUE REPORTED: ${reasonLabel}

ADDITIONAL DETAILS:
${details?.trim() || '(none provided)'}
─────────────────────────────────────

Submitted from: SAT Emergency Room
Timestamp: ${new Date().toISOString()}
    `.trim()

    // For now, we'll just return success and log the report
    // In production, you'd integrate with Resend, SendGrid, or similar
    console.log('[Report API] Question report received:', {
      questionNumber,
      reason: reasonLabel,
      email: REPORT_EMAIL,
    })
    console.log('[Report API] Email content:', emailContent)

    // Mock success response - in production this would actually send the email
    return NextResponse.json(
      {
        success: true,
        message: 'Report received and will be reviewed',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Report API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    )
  }
}
