'use client'

import { useState } from 'react'
import type { PracticeQuestion, Section, TriageData } from '@/lib/sat-types'
import type { PanicTheme } from '@/lib/theme'
import { fallbackQuestions } from '@/lib/practice-bank'
import { cn } from '@/lib/utils'
import { QuestionCard } from '@/components/sat/question-card'

interface PracticeViewProps {
  triage: TriageData
  theme: PanicTheme
  onAnswer: (section: string, correct: boolean) => void
}

type SectionChoice = Section | 'Both'

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
      <QuestionCard
        question={current}
        questionNumber={index + 1}
        selected={selected}
        onSelect={handleSelect}
        revealed={revealed}
        onSubmit={handleSubmit}
        onNext={handleNext}
        isLastQuestion={index + 1 >= questions.length}
        accentTheme={theme}
      />

      {source === 'fallback' && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Showing curated practice questions (AI offline).
        </p>
      )}
    </div>
  )
}
