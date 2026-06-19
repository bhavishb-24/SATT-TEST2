'use client'

import { useState } from 'react'
import type { PracticeQuestion, Section, TriageData } from '@/lib/sat-types'
import type { PanicTheme } from '@/lib/theme'
import { fallbackQuestions } from '@/lib/practice-bank'
import { cn } from '@/lib/utils'

interface PracticeViewProps {
  triage: TriageData
  theme: PanicTheme
  onAnswer: (section: string, correct: boolean) => void
}

type SectionChoice = Section | 'Both'

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Hard: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}

export function PracticeView({ triage, theme, onAnswer }: PracticeViewProps) {
  const [sectionChoice, setSectionChoice] = useState<SectionChoice>('Both')
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState<'ai' | 'fallback' | null>(null)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionDone, setSessionDone] = useState(0)
  const [started, setStarted] = useState(false)

  const current = questions[index]

  async function loadQuestions() {
    setLoading(true)
    setStarted(true)
    try {
      const res = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: sectionChoice,
          topics: triage.weakAreas,
          count: 6,
        }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      const data = await res.json()
      setQuestions(data.questions)
      setSource(data.source)
    } catch (err) {
      console.log('[v0] practice fetch failed, using fallback:', err)
      setQuestions(fallbackQuestions(sectionChoice, 6))
      setSource('fallback')
    } finally {
      setIndex(0)
      setSelected(null)
      setRevealed(false)
      setSessionCorrect(0)
      setSessionDone(0)
      setLoading(false)
    }
  }

  function handleSelect(i: number) {
    if (revealed) return
    setSelected(i)
  }

  function handleSubmit() {
    if (selected === null || !current) return
    const correct = selected === current.correctIndex
    setRevealed(true)
    setSessionDone((d) => d + 1)
    if (correct) setSessionCorrect((c) => c + 1)
    onAnswer(current.section, correct)
  }

  function handleNext() {
    if (index + 1 >= questions.length) {
      // session complete -> show summary by clearing current via index overflow
      setIndex(questions.length)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setRevealed(false)
  }

  // Intro / section picker
  if (!started) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-xl font-bold text-foreground">Practice Drills</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Fresh AI-generated questions targeting your weak areas
            {triage.weakAreas.length > 0
              ? `: ${triage.weakAreas.slice(0, 3).join(', ')}${triage.weakAreas.length > 3 ? '…' : ''}`
              : '.'}
          </p>

          <fieldset className="mt-6">
            <legend className="text-sm font-medium text-foreground mb-2">
              Which section?
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {(['Both', 'Math', 'Reading & Writing'] as SectionChoice[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSectionChoice(s)}
                  className={cn(
                    'rounded-lg border px-3 py-3 text-sm font-medium transition-colors',
                    sectionChoice === s
                      ? cn(theme.accentBg, 'text-card border-transparent')
                      : 'border-border bg-background text-muted-foreground hover:text-foreground',
                  )}
                >
                  {s === 'Reading & Writing' ? 'Reading/Writing' : s}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            onClick={loadQuestions}
            className={cn(
              'mt-6 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-card transition-opacity hover:opacity-90',
              theme.accentBg,
            )}
          >
            <i className="ti ti-bolt" aria-hidden="true" />
            Generate questions
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <i
            className={cn('ti ti-loader-2 text-3xl animate-spin', theme.accentText)}
            aria-hidden="true"
          />
          <p className="mt-3 text-sm text-muted-foreground">
            Writing fresh practice questions for you…
          </p>
        </div>
      </div>
    )
  }

  // Session summary
  if (index >= questions.length && questions.length > 0) {
    const pct = sessionDone > 0 ? Math.round((sessionCorrect / sessionDone) * 100) : 0
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <div
            className={cn(
              'mx-auto flex h-16 w-16 items-center justify-center rounded-full',
              theme.accentBgSoft,
            )}
          >
            <i
              className={cn('ti ti-circle-check text-3xl', theme.accentText)}
              aria-hidden="true"
            />
          </div>
          <h2 className="mt-4 text-xl font-bold text-foreground">Set complete</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You got {sessionCorrect} of {sessionDone} correct ({pct}%).
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              type="button"
              onClick={loadQuestions}
              className={cn(
                'rounded-lg px-4 py-2.5 text-sm font-semibold text-card',
                theme.accentBg,
              )}
            >
              New set
            </button>
            <button
              type="button"
              onClick={() => setStarted(false)}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Change section
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!current) return null

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-semibold',
              DIFFICULTY_COLORS[current.difficulty] ?? DIFFICULTY_COLORS.Medium,
            )}
          >
            {current.difficulty}
          </span>
          <span className="text-xs text-muted-foreground">{current.topic}</span>
        </div>
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {index + 1} / {questions.length}
        </span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <p className="text-base font-medium text-foreground leading-relaxed text-pretty">
          {current.prompt}
        </p>

        <div className="mt-5 flex flex-col gap-2">
          {current.choices.map((choice, i) => {
            const isSelected = selected === i
            const isCorrect = i === current.correctIndex
            let stateClass =
              'border-border bg-background hover:border-foreground/30'
            if (revealed) {
              if (isCorrect)
                stateClass =
                  'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
              else if (isSelected)
                stateClass = 'border-red-400 bg-red-50 dark:bg-red-950/40'
              else stateClass = 'border-border bg-background opacity-60'
            } else if (isSelected) {
              stateClass = cn(theme.accentBorder, theme.accentBgSoft)
            }
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(i)}
                disabled={revealed}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                  stateClass,
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                    isSelected && !revealed
                      ? cn(theme.accentBg, 'text-card border-transparent')
                      : 'border-border text-muted-foreground',
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-foreground">{choice}</span>
                {revealed && isCorrect && (
                  <i
                    className="ti ti-check ml-auto text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                )}
                {revealed && isSelected && !isCorrect && (
                  <i
                    className="ti ti-x ml-auto text-red-600 dark:text-red-400"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>

        {revealed && (
          <div className="mt-4 rounded-lg bg-muted p-4 animate-fade-in">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {selected === current.correctIndex ? 'Correct' : 'Explanation'}
            </p>
            <p className="mt-1 text-sm text-foreground leading-relaxed">
              {current.explanation}
            </p>
          </div>
        )}

        <div className="mt-6">
          {!revealed ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={selected === null}
              className={cn(
                'w-full rounded-lg px-4 py-3 text-sm font-semibold text-card transition-opacity hover:opacity-90 disabled:opacity-40',
                theme.accentBg,
              )}
            >
              Check answer
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-card transition-opacity hover:opacity-90',
                theme.accentBg,
              )}
            >
              {index + 1 >= questions.length ? 'Finish set' : 'Next question'}
              <i className="ti ti-arrow-right" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {source === 'fallback' && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Showing curated practice questions (AI offline).
        </p>
      )}
    </div>
  )
}
