'use client'

import { useState } from 'react'
import type { DiagnosticRecord } from '@/lib/sat-types'
import type { PanicTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'
import { MathText } from '@/components/sat/math-text'
import { ReportQuestionModal } from '@/components/sat/report-question-modal'

interface Props {
  record: DiagnosticRecord
  theme: PanicTheme
  onSeePlan: () => void
  generatingPlan: boolean
}

export function DiagnosticResults({ record, theme, onSeePlan, generatingPlan }: Props) {
  const [mode, setMode] = useState<'summary' | 'answers'>('summary')
  const [reportingQuestion, setReportingQuestion] = useState<{ q: typeof record.results[0]['question']; num: number } | null>(null)
  const { review, results, correct, total, mathCorrect, mathTotal, rwCorrect, rwTotal } = record
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0

  if (mode === 'answers') {
    return (
      <main className="animate-fade-in mx-auto flex w-full max-w-2xl flex-col gap-5 px-5 py-8 lg:py-12">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-normal tracking-tight lg:text-3xl">
              Your answers
            </h1>
            <p className="text-sm text-muted-foreground">
              {correct} of {total} correct ({pct}%)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMode('summary')}
            className="flex min-h-[44px] items-center gap-1 rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted"
          >
            <i className="ti ti-arrow-left" aria-hidden="true" />
            Back
          </button>
        </div>

        <ol className="flex flex-col gap-4">
          {results.map((r, i) => {
            const yourChoice =
              r.selectedIndex !== null ? r.question.choices[r.selectedIndex] : 'No answer'
            const correctChoice = r.question.choices[r.question.correctIndex]
            return (
              <li
                key={r.question.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      r.correct
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
                    )}
                  >
                    <i
                      className={r.correct ? 'ti ti-check' : 'ti ti-x'}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Q{i + 1} · {r.question.section} · {r.question.topic}
                  </span>
                  {r.question.id.startsWith('ai-') && (
                    <span className="flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      <i className="ti ti-sparkles text-[10px]" aria-hidden="true" />
                      AI Generated
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setReportingQuestion({ q: r.question, num: i + 1 })}
                    title="Report an issue with this question"
                    className="ml-auto flex h-7 items-center gap-1 rounded-lg border border-border bg-background px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                  >
                    <i className="ti ti-flag text-[11px]" aria-hidden="true" />
                    Report
                  </button>
                </div>
                <p className="text-sm font-medium leading-relaxed text-pretty text-foreground">
                  <MathText>{r.question.prompt}</MathText>
                </p>

                {/* All choices listed so it's easy to cross-reference */}
                <ol className="mt-3 flex flex-col gap-1.5">
                  {r.question.choices.map((ch, ci) => {
                    const letter = String.fromCharCode(65 + ci)
                    const isYours = r.selectedIndex === ci
                    const isCorrect = r.question.correctIndex === ci
                    return (
                      <li
                        key={ci}
                        className={cn(
                          'flex items-start gap-2 rounded-lg px-3 py-2 text-sm',
                          isCorrect
                            ? 'bg-emerald-50 text-emerald-800'
                            : isYours && !r.correct
                              ? 'bg-red-50 text-red-800'
                              : 'text-muted-foreground',
                        )}
                      >
                        <span className="mt-0.5 shrink-0 font-bold">{letter}.</span>
                        <span className="leading-relaxed">
                          <MathText>{ch}</MathText>
                        </span>
                        {isCorrect && (
                          <i className="ti ti-check ml-auto mt-0.5 shrink-0 text-emerald-600" aria-label="Correct answer" />
                        )}
                        {isYours && !r.correct && (
                          <i className="ti ti-x ml-auto mt-0.5 shrink-0 text-red-500" aria-label="Your answer" />
                        )}
                      </li>
                    )
                  })}
                </ol>

                <div className="mt-3 rounded-lg border border-border bg-muted/60 p-4">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Explanation
                  </p>
                  <p className="text-sm leading-relaxed text-foreground">
                    <MathText>{r.question.explanation}</MathText>
                  </p>
                </div>
              </li>
            )
          })}
        </ol>

        {/* Report modal */}
        {reportingQuestion && (
          <ReportQuestionModal
            question={reportingQuestion.q}
            questionNumber={reportingQuestion.num}
            onClose={() => setReportingQuestion(null)}
          />
        )}

        <button
          type="button"
          onClick={onSeePlan}
          disabled={generatingPlan}
          className={cn(
            'sticky bottom-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl px-6 text-base font-semibold text-card shadow-lg transition-opacity hover:opacity-90 disabled:opacity-60',
            theme.accentBg,
          )}
        >
          {generatingPlan ? (
            <>
              <i className="ti ti-loader-2 animate-spin" aria-hidden="true" />
              Building your plan…
            </>
          ) : (
            <>
              See your study plan
              <i className="ti ti-arrow-right" aria-hidden="true" />
            </>
          )}
        </button>
      </main>
    )
  }

  return (
    <main className="animate-fade-in mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 py-8 lg:py-12">
      <header className="flex flex-col items-center gap-3 text-center">
        <span
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full',
            theme.accentBgSoft,
          )}
        >
          <i className={cn('ti ti-clipboard-check text-3xl', theme.accentText)} aria-hidden="true" />
        </span>
        <h1 className="font-serif text-3xl font-normal tracking-tight lg:text-4xl">
          Diagnostic complete
        </h1>
        <p className="text-pretty text-sm text-muted-foreground">
          Your coach reviewed every answer and logged the results to build your plan.
        </p>
      </header>

      {/* Score cards */}
      <div className="grid grid-cols-3 gap-3">
        <ScoreCard label="Overall" value={`${correct}/${total}`} sub={`${pct}%`} theme={theme} />
        <ScoreCard label="Math" value={`${mathCorrect}/${mathTotal}`} theme={theme} />
        <ScoreCard label="Reading & Writing" value={`${rwCorrect}/${rwTotal}`} theme={theme} />
      </div>

      {/* AI review */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <i className={cn('ti ti-sparkles', theme.accentText)} aria-hidden="true" />
          <h2 className="text-base font-bold text-foreground">Your coach&apos;s read</h2>
          {record.source === 'fallback' && (
            <span className="ml-auto text-xs text-muted-foreground">offline analysis</span>
          )}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-foreground">{review.overall_summary}</p>

        {review.identified_weak_areas.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Focus areas tonight
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {review.identified_weak_areas.map((area) => (
                <span
                  key={area}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {review.strengths.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Already strong
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {review.strengths.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className={cn('mt-4 rounded-lg p-4', theme.accentBgSoft)}>
          <p className={cn('text-sm font-semibold', theme.accentText)}>
            {review.recommended_focus}
          </p>
          <p className="mt-1 text-sm text-foreground">{review.encouragement}</p>
        </div>
      </section>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => setMode('answers')}
          className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 text-base font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <i className="ti ti-list-details" aria-hidden="true" />
          See questions &amp; answers
        </button>
        <button
          type="button"
          onClick={onSeePlan}
          disabled={generatingPlan}
          className={cn(
            'flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl px-6 text-base font-semibold text-card transition-opacity hover:opacity-90 disabled:opacity-60',
            theme.accentBg,
          )}
        >
          {generatingPlan ? (
            <>
              <i className="ti ti-loader-2 animate-spin" aria-hidden="true" />
              Building your plan…
            </>
          ) : (
            <>
              See your study plan
              <i className="ti ti-arrow-right" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </main>
  )
}

function ScoreCard({
  label,
  value,
  sub,
  theme,
}: {
  label: string
  value: string
  sub?: string
  theme: PanicTheme
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-4 text-center">
      <span className={cn('text-2xl font-bold tabular-nums', theme.accentText)}>{value}</span>
      {sub && <span className="text-xs font-medium text-muted-foreground">{sub}</span>}
      <span className="mt-1 text-[11px] font-medium leading-tight text-muted-foreground">
        {label}
      </span>
    </div>
  )
}
