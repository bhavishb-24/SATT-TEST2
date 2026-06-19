'use client'

import { useEffect, useRef, useState } from 'react'
import type { DiagnosticResult, PracticeQuestion, TriageData } from '@/lib/sat-types'
import type { PanicTheme } from '@/lib/theme'
import { diagnosticFallback } from '@/lib/practice-bank'
import { cn } from '@/lib/utils'
import { MathText } from '@/components/sat/math-text'
import { DesmosPanel } from '@/components/sat/desmos-panel'

const MATH_COUNT = 15
const RW_COUNT = 15
const QUESTION_COUNT = MATH_COUNT + RW_COUNT

interface Props {
  triage: TriageData
  theme: PanicTheme
  onComplete: (results: DiagnosticResult[]) => void
}

export function DiagnosticTest({ triage, theme, onComplete }: Props) {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [selected, setSelected] = useState<number | null>(null)

  // Per-question state — keyed by question index
  const [eliminated, setEliminated] = useState<Record<number, Set<number>>>({})
  const [highlighted, setHighlighted] = useState<Record<number, boolean>>({})
  const [calcOpen, setCalcOpen] = useState(false)

  // Highlight tool mode
  const [highlightMode, setHighlightMode] = useState(false)
  const promptRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchSection(
      section: 'Math' | 'Reading & Writing',
      count: number,
    ): Promise<PracticeQuestion[]> {
      const res = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, topics: triage.weakAreas, count }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      const data = await res.json()
      return (data.questions || []) as PracticeQuestion[]
    }

    async function load() {
      try {
        const [mathQs, rwQs] = await Promise.all([
          fetchSection('Math', MATH_COUNT),
          fetchSection('Reading & Writing', RW_COUNT),
        ])
        const merged: PracticeQuestion[] = []
        const max = Math.max(mathQs.length, rwQs.length)
        for (let i = 0; i < max; i++) {
          if (mathQs[i]) merged.push(mathQs[i])
          if (rwQs[i]) merged.push(rwQs[i])
        }
        const qs = merged.slice(0, QUESTION_COUNT)
        if (!cancelled) {
          setQuestions(qs.length >= QUESTION_COUNT ? qs : diagnosticFallback(QUESTION_COUNT))
          setAnswers(new Array(QUESTION_COUNT).fill(null))
          setLoading(false)
        }
      } catch (err) {
        console.log('[v0] diagnostic fetch failed, using fallback:', err)
        if (!cancelled) {
          setQuestions(diagnosticFallback(QUESTION_COUNT))
          setAnswers(new Array(QUESTION_COUNT).fill(null))
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [triage.weakAreas])

  if (loading) {
    return (
      <main className="animate-fade-in flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border border-border bg-card p-10">
          <i
            className={cn('ti ti-loader-2 animate-spin text-3xl', theme.accentText)}
            aria-hidden="true"
          />
          <div>
            <p className="text-lg font-bold text-foreground">Building your diagnostic</p>
            <p className="mt-1 text-sm text-muted-foreground">
              30 questions — 15 Math and 15 Reading &amp; Writing — so we can pinpoint exactly
              where to focus.
            </p>
          </div>
        </div>
      </main>
    )
  }

  const current = questions[index]
  if (!current) return null

  const isMath = current.section === 'Math'
  const total = questions.length
  const progress = Math.round(((index + (selected !== null ? 1 : 0)) / total) * 100)
  const isLast = index + 1 >= total
  const eliminatedForQ = eliminated[index] ?? new Set<number>()
  const isHighlighted = highlighted[index] ?? false

  function choose(i: number) {
    if (eliminatedForQ.has(i)) return // can't select an eliminated choice
    setSelected(i)
  }

  function toggleEliminate(choiceIndex: number) {
    setEliminated((prev) => {
      const current = new Set(prev[index] ?? [])
      if (current.has(choiceIndex)) {
        current.delete(choiceIndex)
      } else {
        current.add(choiceIndex)
        // Also deselect if it was selected
        if (selected === choiceIndex) setSelected(null)
      }
      return { ...prev, [index]: current }
    })
  }

  function toggleHighlight() {
    setHighlighted((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  function next() {
    const updated = [...answers]
    updated[index] = selected
    setAnswers(updated)

    if (isLast) {
      const results: DiagnosticResult[] = questions.map((q, i) => {
        const sel = i === index ? selected : updated[i]
        return {
          question: q,
          selectedIndex: sel,
          correct: sel === q.correctIndex,
        }
      })
      onComplete(results)
      return
    }
    setIndex((prev) => prev + 1)
    setSelected(updated[index + 1] ?? null)
    setCalcOpen(false) // close calc when navigating
  }

  function back() {
    if (index === 0) return
    const updated = [...answers]
    updated[index] = selected
    setAnswers(updated)
    setIndex((prev) => prev - 1)
    setSelected(updated[index - 1] ?? null)
    setCalcOpen(false)
  }

  return (
    <main className="animate-fade-in mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-4 px-5 py-8 lg:py-12">
      {/* Header */}
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl font-normal tracking-tight lg:text-3xl">
            Diagnostic test
          </h1>
          <span className="text-sm font-medium tabular-nums text-muted-foreground">
            {index + 1} / {total}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn('h-full rounded-full transition-[width] duration-300', theme.accentBg)}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            15 Math + 15 Reading &amp; Writing — be honest, we are finding weak spots, not grading you.
          </p>
        </div>
      </header>

      {/* Desmos (Math only) */}
      {isMath && (
        <DesmosPanel
          open={calcOpen}
          onClose={() => setCalcOpen(false)}
          accentBg={theme.accentBg}
          accentText={theme.accentText}
        />
      )}

      {/* Question card */}
      <div className={cn(
        'rounded-2xl border border-border bg-card p-6 sm:p-8 transition-colors',
        isHighlighted && 'ring-2 ring-yellow-400/60 bg-yellow-50/60',
      )}>
        {/* Section badge + tools row */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-semibold',
              theme.accentBgSoft,
              theme.accentText,
            )}
          >
            {current.section}
          </span>
          <span className="text-xs text-muted-foreground">{current.topic}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs font-medium text-muted-foreground">{current.difficulty}</span>

          {/* Spacer */}
          <div className="ml-auto flex items-center gap-1.5">
            {/* Highlight toggle */}
            <button
              type="button"
              onClick={toggleHighlight}
              title={isHighlighted ? 'Remove highlight' : 'Highlight question'}
              aria-pressed={isHighlighted}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors',
                isHighlighted
                  ? 'border-yellow-400 bg-yellow-100 text-yellow-700'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <i className="ti ti-highlight text-sm" aria-hidden="true" />
              <span className="hidden sm:inline">Highlight</span>
            </button>

            {/* Calculator (Math only) */}
            {isMath && (
              <button
                type="button"
                onClick={() => setCalcOpen((v) => !v)}
                title={calcOpen ? 'Close calculator' : 'Open calculator'}
                aria-pressed={calcOpen}
                className={cn(
                  'flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors',
                  calcOpen
                    ? cn(theme.accentBgSoft, theme.accentText, 'border-transparent')
                    : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <i className="ti ti-calculator text-sm" aria-hidden="true" />
                <span className="hidden sm:inline">Calculator</span>
              </button>
            )}
          </div>
        </div>

        {/* Question prompt with KaTeX rendering */}
        <p
          ref={promptRef}
          className="text-base font-medium leading-relaxed text-pretty text-foreground"
        >
          <MathText>{current.prompt}</MathText>
        </p>

        {/* Answer choices */}
        <div className="mt-6 flex flex-col gap-2.5" role="radiogroup" aria-label="Answer choices">
          {current.choices.map((choice, i) => {
            const isSelected = selected === i
            const isEliminated = eliminatedForQ.has(i)
            const letter = String.fromCharCode(65 + i)

            return (
              <div key={i} className="group flex items-stretch gap-2">
                {/* Main choice button */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => choose(i)}
                  disabled={isEliminated}
                  className={cn(
                    'flex flex-1 items-start gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all',
                    isEliminated
                      ? 'cursor-not-allowed border-border bg-muted opacity-40'
                      : isSelected
                        ? cn(theme.accentBorder, theme.accentBgSoft, 'shadow-sm')
                        : 'border-border bg-background hover:border-foreground/25 hover:bg-muted/40',
                  )}
                >
                  {/* Letter bubble */}
                  <span
                    className={cn(
                      'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors',
                      isEliminated
                        ? 'border-border text-muted-foreground line-through'
                        : isSelected
                          ? cn(theme.accentBg, 'border-transparent text-card')
                          : 'border-border text-muted-foreground',
                    )}
                  >
                    {isEliminated ? (
                      <i className="ti ti-x text-[10px]" aria-hidden="true" />
                    ) : (
                      letter
                    )}
                  </span>
                  {/* Choice text with math rendering */}
                  <span className={cn(isEliminated && 'line-through')}>
                    <MathText>{choice}</MathText>
                  </span>
                </button>

                {/* Eliminate button — shown on hover or when eliminated */}
                <button
                  type="button"
                  onClick={() => toggleEliminate(i)}
                  title={isEliminated ? 'Restore choice' : 'Eliminate choice'}
                  className={cn(
                    'flex w-9 shrink-0 items-center justify-center rounded-xl border text-xs transition-all',
                    isEliminated
                      ? 'border-red-300 bg-red-50 text-red-500 hover:bg-red-100'
                      : 'border-border bg-background text-muted-foreground opacity-0 group-hover:opacity-100 hover:border-red-300 hover:bg-red-50 hover:text-red-500',
                  )}
                  aria-label={
                    isEliminated
                      ? `Restore choice ${letter}`
                      : `Eliminate choice ${letter}`
                  }
                >
                  <i
                    className={cn(
                      'ti text-sm',
                      isEliminated ? 'ti-restore' : 'ti-circle-minus',
                    )}
                    aria-hidden="true"
                  />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Eliminated hint */}
      {eliminatedForQ.size > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {eliminatedForQ.size} choice{eliminatedForQ.size > 1 ? 's' : ''} eliminated —{' '}
          <button
            type="button"
            className="font-medium underline underline-offset-2 hover:text-foreground"
            onClick={() =>
              setEliminated((prev) => {
                const next = { ...prev }
                delete next[index]
                return next
              })
            }
          >
            clear
          </button>
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={back}
          disabled={index === 0}
          className="flex min-h-[48px] items-center justify-center gap-1 rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
        >
          <i className="ti ti-arrow-left" aria-hidden="true" />
          Back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={selected === null}
          className={cn(
            'flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl px-6 text-base font-semibold text-card transition-opacity hover:opacity-90 disabled:opacity-40',
            theme.accentBg,
          )}
        >
          {isLast ? 'Finish & review with AI' : 'Next question'}
          <i
            className={isLast ? 'ti ti-sparkles' : 'ti ti-arrow-right'}
            aria-hidden="true"
          />
        </button>
      </div>
    </main>
  )
}
