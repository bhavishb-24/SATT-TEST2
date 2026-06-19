'use client'

import { useEffect, useMemo, useState } from 'react'
import type { PracticeQuestion } from '@/lib/sat-types'
import type { PanicTheme } from '@/lib/theme'
import { buildMockTests, type MockTest } from '@/lib/mock-test-bank'
import { QuestionCard } from '@/components/sat/question-card'
import { cn } from '@/lib/utils'

interface MockTestViewProps {
  theme: PanicTheme
  onAnswer: (section: string, correct: boolean) => void
}

type Stage = 'select' | 'loading' | 'taking' | 'results'

// Seconds allotted per question (digital SAT pacing ~1.25 min/question).
const SECONDS_PER_QUESTION = 75

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MockTestView({ theme, onAnswer }: MockTestViewProps) {
  // Tests are built once per mount; revisiting the view reshuffles the bank.
  const tests = useMemo(() => buildMockTests(), [])

  const [stage, setStage] = useState<Stage>('select')
  const [activeTest, setActiveTest] = useState<MockTest | null>(null)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [source, setSource] = useState<'ai' | 'fallback'>('ai')

  const totalQuestions = activeTest?.questions.length ?? 0

  // Countdown timer during the test.
  useEffect(() => {
    if (stage !== 'taking') return
    if (secondsLeft <= 0) {
      finishTest()
      return
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, secondsLeft])

  // Begin a test: ask OpenAI for a fresh SAT-style set, falling back to the
  // curated static test if the AI is unavailable.
  async function startTest(test: MockTest, testNumber: number) {
    setStage('loading')
    let questions = test.questions
    let src: 'ai' | 'fallback' = 'fallback'
    try {
      const res = await fetch('/api/mock-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testNumber }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        questions = data.questions
        src = data.source === 'ai' ? 'ai' : 'fallback'
      }
    } catch (err) {
      console.log('[v0] mock-test fetch failed, using curated test:', err)
    }
    setSource(src)
    beginWith({ ...test, questions })
  }

  // Reset and start the test that's already loaded (used for "Retake").
  function restartCurrent() {
    if (activeTest) beginWith(activeTest)
  }

  function beginWith(test: MockTest) {
    setActiveTest(test)
    setIndex(0)
    setAnswers({})
    setReviewIndex(0)
    setSecondsLeft(test.questions.length * SECONDS_PER_QUESTION)
    setStage('taking')
  }

  function selectAnswer(choiceIndex: number) {
    setAnswers((prev) => ({ ...prev, [index]: choiceIndex }))
  }

  function finishTest() {
    if (!activeTest) return
    // Record each answered question for dashboard stats.
    activeTest.questions.forEach((q, i) => {
      const a = answers[i]
      if (a !== undefined) onAnswer(q.section, a === q.correctIndex)
    })
    setStage('results')
  }

  const answeredCount = Object.keys(answers).length

  // ─────────────────────────── Test selection ───────────────────────────
  if (stage === 'select') {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl',
                theme.accentBgSoft,
              )}
            >
              <i className={cn('ti ti-clipboard-check text-2xl', theme.accentText)} aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">Mock Tests</h2>
                <span className="flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <i className="ti ti-sparkles text-[10px]" aria-hidden="true" />
                  AI generated
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Full-length, SAT-style practice tests to take when you&apos;re ready
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Each test is freshly written by AI to mirror the digital SAT — a mix of Math and
            Reading &amp; Writing questions, no immediate answers, a running timer, and a full
            score breakdown with review at the end. Use the highlighter, calculator, and
            answer-elimination tools just like the real thing.
          </p>

          <ul className="mt-6 flex flex-col gap-3">
            {tests.map((test, i) => {
              const mathCount = test.questions.filter((q) => q.section === 'Math').length
              const rwCount = test.questions.length - mathCount
              const minutes = Math.round((test.questions.length * SECONDS_PER_QUESTION) / 60)
              return (
                <li key={test.id}>
                  <button
                    type="button"
                    onClick={() => startTest(test, i + 1)}
                    className="group flex w-full items-center gap-4 rounded-xl border border-border bg-background p-4 text-left transition-colors hover:border-foreground/30 hover:bg-muted"
                  >
                    <span
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-lg font-bold',
                        theme.accentBgSoft,
                        theme.accentText,
                      )}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{test.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {test.questions.length} questions · {mathCount} Math · {rwCount} Reading &amp; Writing · ~{minutes} min
                      </p>
                    </div>
                    <i
                      className="ti ti-arrow-right text-lg text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    )
  }

  // ─────────────────────────── Generating (loading) ───────────────────────────
  if (stage === 'loading') {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <i
            className={cn('ti ti-loader-2 text-3xl animate-spin', theme.accentText)}
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-medium text-foreground">
            Generating your SAT-style mock test…
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            AI is writing fresh Math and Reading &amp; Writing questions. This can take a moment.
          </p>
        </div>
      </div>
    )
  }

  // ─────────────────────────── Taking the test ───────────────────────────
  if (stage === 'taking' && activeTest) {
    const current = activeTest.questions[index]
    const selected = answers[index] ?? null
    const isLast = index + 1 >= totalQuestions
    const lowTime = secondsLeft <= 60

    return (
      <div className="mx-auto w-full max-w-2xl">
        {/* Test status bar */}
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{activeTest.name}</p>
            <p className="text-xs text-muted-foreground">
              {answeredCount} of {totalQuestions} answered
            </p>
          </div>
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 tabular-nums',
              lowTime ? 'bg-red-100 text-red-700' : theme.accentBgSoft,
            )}
          >
            <i className={cn('ti ti-clock', lowTime ? '' : theme.accentText)} aria-hidden="true" />
            <span className={cn('text-sm font-bold', lowTime ? '' : theme.accentText)}>
              {formatTime(secondsLeft)}
            </span>
          </div>
        </div>

        {source === 'fallback' && (
          <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <i className="ti ti-info-circle" aria-hidden="true" />
            Showing curated SAT-style questions (AI offline).
          </p>
        )}

        {/* Question palette */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {activeTest.questions.map((_, i) => {
            const isAnswered = answers[i] !== undefined
            const isCurrent = i === index
            return (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to question ${i + 1}`}
                aria-current={isCurrent ? 'true' : undefined}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold transition-colors',
                  isCurrent
                    ? cn(theme.accentBg, 'text-card')
                    : isAnswered
                      ? cn(theme.accentBgSoft, theme.accentText)
                      : 'border border-border bg-background text-muted-foreground hover:bg-muted',
                )}
              >
                {i + 1}
              </button>
            )
          })}
        </div>

        <QuestionCard
          key={current.id}
          question={current}
          questionNumber={index + 1}
          selected={selected}
          onSelect={selectAnswer}
          revealed={false}
          onSubmit={() => {}}
          onNext={() => {}}
          isLastQuestion={isLast}
          mode="test"
          accentTheme={theme}
        />

        {/* Navigation */}
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
          >
            <i className="ti ti-arrow-left" aria-hidden="true" />
            Previous
          </button>

          {!isLast ? (
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(totalQuestions - 1, i + 1))}
              className={cn(
                'ml-auto flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-card transition-opacity hover:opacity-90',
                theme.accentBg,
              )}
            >
              Next
              <i className="ti ti-arrow-right" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={finishTest}
              className={cn(
                'ml-auto flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-card transition-opacity hover:opacity-90',
                theme.accentBg,
              )}
            >
              <i className="ti ti-flag-check" aria-hidden="true" />
              Submit test
            </button>
          )}
        </div>

        {/* Persistent submit shortcut */}
        {!isLast && (
          <button
            type="button"
            onClick={finishTest}
            className="mt-3 w-full rounded-lg border border-border bg-background py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Submit test early ({answeredCount}/{totalQuestions} answered)
          </button>
        )}
      </div>
    )
  }

  // ─────────────────────────── Results & review ───────────────────────────
  if (stage === 'results' && activeTest) {
    const questions = activeTest.questions
    let correct = 0
    let mathCorrect = 0
    let mathTotal = 0
    let rwCorrect = 0
    let rwTotal = 0
    questions.forEach((q, i) => {
      const a = answers[i]
      const isRight = a === q.correctIndex
      if (isRight) correct++
      if (q.section === 'Math') {
        mathTotal++
        if (isRight) mathCorrect++
      } else {
        rwTotal++
        if (isRight) rwCorrect++
      }
    })
    const total = questions.length
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0

    // Rough estimated SAT score (200–800 per section, scaled by accuracy).
    const mathScaled = 200 + Math.round((mathTotal ? mathCorrect / mathTotal : 0) * 600)
    const rwScaled = 200 + Math.round((rwTotal ? rwCorrect / rwTotal : 0) * 600)
    const estScore = mathScaled + rwScaled

    const reviewQ = questions[reviewIndex]

    return (
      <div className="mx-auto w-full max-w-2xl">
        {/* Score summary */}
        <div className="rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
          <div
            className={cn(
              'mx-auto flex h-16 w-16 items-center justify-center rounded-full',
              theme.accentBgSoft,
            )}
          >
            <i className={cn('ti ti-clipboard-check text-3xl', theme.accentText)} aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-foreground">{activeTest.name} complete</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You answered {correct} of {total} correct ({pct}%).
          </p>

          <div className="mt-5 rounded-xl bg-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Estimated SAT score
            </p>
            <p className="mt-1 text-4xl font-bold tabular-nums text-foreground">~{estScore}</p>
            <p className="mt-1 text-xs text-muted-foreground">out of 1600 (rough estimate)</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground">Math</p>
              <p className="text-lg font-bold text-foreground">
                {mathCorrect}/{mathTotal}
              </p>
              <p className="text-xs text-muted-foreground">~{mathScaled}</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground">Reading &amp; Writing</p>
              <p className="text-lg font-bold text-foreground">
                {rwCorrect}/{rwTotal}
              </p>
              <p className="text-xs text-muted-foreground">~{rwScaled}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={restartCurrent}
              className={cn(
                'rounded-lg px-4 py-2.5 text-sm font-semibold text-card',
                theme.accentBg,
              )}
            >
              Retake this test
            </button>
            <button
              type="button"
              onClick={() => setStage('select')}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Back to tests
            </button>
          </div>
        </div>

        {/* Review */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Review answers
          </h3>

          {/* Review palette */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {questions.map((q, i) => {
              const wasRight = answers[i] === q.correctIndex
              const isCurrent = i === reviewIndex
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setReviewIndex(i)}
                  aria-label={`Review question ${i + 1}`}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold transition-colors',
                    isCurrent && 'ring-2 ring-offset-1 ring-foreground/40',
                    wasRight
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
                  )}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>

          <QuestionCard
            key={`review-${reviewQ.id}`}
            question={reviewQ}
            questionNumber={reviewIndex + 1}
            selected={answers[reviewIndex] ?? null}
            onSelect={() => {}}
            revealed
            onSubmit={() => {}}
            onNext={() => {}}
            isLastQuestion={reviewIndex + 1 >= total}
            mode="review"
            accentTheme={theme}
          />

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setReviewIndex((i) => Math.max(0, i - 1))}
              disabled={reviewIndex === 0}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <i className="ti ti-arrow-left" aria-hidden="true" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setReviewIndex((i) => Math.min(total - 1, i + 1))}
              disabled={reviewIndex + 1 >= total}
              className="ml-auto flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              Next
              <i className="ti ti-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
