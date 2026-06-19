'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { PracticeQuestion } from '@/lib/sat-types'

const REPORT_EMAIL = 'kitkatbb20@gmail.com'

const REASONS = [
  { id: 'wrong_answer', label: 'Correct answer is wrong' },
  { id: 'bad_question', label: 'Question is stated incorrectly or is confusing' },
  { id: 'bad_explanation', label: 'Explanation is incorrect or misleading' },
  { id: 'bad_choices', label: 'One or more answer choices are incorrect' },
  { id: 'other', label: 'Other issue' },
]

interface Props {
  question: PracticeQuestion
  questionNumber: number
  onClose: () => void
}

export function ReportQuestionModal({ question, questionNumber, onClose }: Props) {
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [details, setDetails] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSend() {
    if (!selectedReason) return

    setSubmitting(true)
    try {
      const reasonObj = REASONS.find((r) => r.id === selectedReason)
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionNumber,
          section: question.section,
          topic: question.topic,
          difficulty: question.difficulty,
          questionId: question.id,
          prompt: question.prompt,
          choices: question.choices,
          correctIndex: question.correctIndex,
          explanation: question.explanation,
          reason: reasonObj,
          details,
        }),
      })

      if (response.ok) {
        setSent(true)
      } else {
        console.error('Report submission failed')
      }
    } catch (error) {
      console.error('Error submitting report:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Report question"
    >
      <div className="w-full max-w-md animate-fade-in rounded-t-2xl border border-border bg-card p-6 shadow-2xl sm:rounded-2xl">
        {sent ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <i className="ti ti-check text-2xl text-emerald-600" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold text-foreground">Report submitted</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Thank you for reporting this issue. Your feedback has been sent to {REPORT_EMAIL} and will be reviewed shortly.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-80"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-foreground">Report a problem</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Q{questionNumber} &middot; {question.section} &middot; {question.topic}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border hover:bg-muted"
              >
                <i className="ti ti-x text-sm" aria-hidden="true" />
              </button>
            </div>

            {/* Reason list */}
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              What is the issue?
            </p>
            <div className="flex flex-col gap-2">
              {REASONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedReason(r.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                    selectedReason === r.id
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-foreground hover:bg-muted',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                      selectedReason === r.id
                        ? 'border-background bg-background'
                        : 'border-muted-foreground',
                    )}
                  >
                    {selectedReason === r.id && (
                      <span className="h-2 w-2 rounded-full bg-foreground" />
                    )}
                  </span>
                  {r.label}
                </button>
              ))}
            </div>

            {/* Optional details */}
            <div className="mt-4">
              <label
                htmlFor="report-details"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Additional details (optional)
              </label>
              <textarea
                id="report-details"
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe the issue in more detail…"
                className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!selectedReason || submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                {submitting ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="ti ti-send text-sm" aria-hidden="true" />
                    Send report
                  </>
                )}
              </button>
            </div>

            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Reports are sent to {REPORT_EMAIL}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
