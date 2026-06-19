'use client'

import { useEffect, useState } from 'react'
import type { DiagnosticResult, PracticeQuestion, TriageData } from '@/lib/sat-types'
import type { PanicTheme } from '@/lib/theme'
import { diagnosticFallback } from '@/lib/practice-bank'
import { cn } from '@/lib/utils'

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

  useEffect(() => {
    let cancelled = false
    async function fetchSection(section: 'Math' | 'Reading & Writing', count: number): Promise<PracticeQuestion[]> {
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
        // Fetch both sections in parallel
        const [mathQs, rwQs] = await Promise.all([
          fetchSection('Math', MATH_COUNT),
          fetchSection('Reading & Writing', RW_COUNT),
        ])
        // Interleave: Math 1, R&W 1, Math 2, R&W 2, …
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
    return () => { cancelled = true }
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

  const total = questions.length
  const progress = Math.round(((index + (selected !== null ? 1 : 0)) / total) * 100)
  const isLast = index + 1 >= total

  function choose(i: number) {
    setSelected(i)
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
    setIndex((i) => i + 1)
    setSelected(updated[index + 1] ?? null)
  }

  function back() {
    if (index === 0) return
    const updated = [...answers]
    updated[index] = selected
    setAnswers(updated)
    setIndex((i) => i - 1)
    setSelected(updated[index - 1] ?? null)
  }

  return (
    <main className="animate-fade-in mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-6 px-5 py-8 lg:py-12">
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
        <p className="text-sm text-muted-foreground">
          15 Math + 15 Reading &amp; Writing — answer honestly, we are finding your highest-impact
          topics, not grading you.
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-3 flex items-center gap-2">
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
        </div>

        <p className="text-base font-medium leading-relaxed text-pretty text-foreground">
          {current.prompt}
        </p>

        <div className="mt-5 flex flex-col gap-2">
          {current.choices.map((choice, i) => {
            const isSelected = selected === i
            return (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                  isSelected
                    ? cn(theme.accentBorder, theme.accentBgSoft)
                    : 'border-border bg-background hover:border-foreground/30',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                    isSelected
                      ? cn(theme.accentBg, 'border-transparent text-card')
                      : 'border-border text-muted-foreground',
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-foreground">{choice}</span>
              </button>
            )
          })}
        </div>
      </div>

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
          <i className={isLast ? 'ti ti-sparkles' : 'ti ti-arrow-right'} aria-hidden="true" />
        </button>
      </div>
    </main>
  )
}
