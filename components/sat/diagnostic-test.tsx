'use client'

import { useEffect, useRef, useState } from 'react'
import type { DiagnosticResult, PracticeQuestion, TriageData } from '@/lib/sat-types'
import type { PanicTheme } from '@/lib/theme'
import { diagnosticFallback } from '@/lib/practice-bank'
import { cn } from '@/lib/utils'
import { MathText } from '@/components/sat/math-text'
import { DesmosPanel } from '@/components/sat/desmos-panel'
import { ReportQuestionModal } from '@/components/sat/report-question-modal'

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
  const [calcOpen, setCalcOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

  // Highlight tool: when active, mouseup over the question text applies a <mark>
  const [highlightMode, setHighlightMode] = useState(false)
  // Store highlighted HTML per question index so navigating preserves marks
  const [highlightedHtml, setHighlightedHtml] = useState<Record<number, string>>({})
  const promptRef = useRef<HTMLDivElement>(null)

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

  // Restore saved highlight marks whenever the question index changes.
  // Must be declared before any conditional return to comply with Rules of Hooks.
  useEffect(() => {
    if (!promptRef.current) return
    const saved = highlightedHtml[index]
    if (saved) {
      promptRef.current.innerHTML = saved
    }
  }, [index]) // eslint-disable-line react-hooks/exhaustive-deps

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
  const isAIGenerated = current.id.startsWith('ai-')
  const total = questions.length
  const progress = Math.round(((index + (selected !== null ? 1 : 0)) / total) * 100)
  const isLast = index + 1 >= total
  const eliminatedForQ = eliminated[index] ?? new Set<number>()

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

  // Apply a <mark> span around whatever the user has selected inside the prompt.
  // We persist the resulting innerHTML so navigating away and back keeps marks.
  function applyHighlight() {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !promptRef.current) return
    // Ensure selection is inside the prompt container
    if (!promptRef.current.contains(sel.anchorNode)) return

    const range = sel.getRangeAt(0)
    const mark = document.createElement('mark')
    mark.style.backgroundColor = 'rgba(250,204,21,0.5)' // yellow-400/50
    mark.style.borderRadius = '2px'
    mark.style.padding = '0 1px'
    try {
      range.surroundContents(mark)
    } catch {
      // surroundContents fails when the selection spans multiple elements;
      // fall back to extracting and re-inserting wrapped content.
      const fragment = range.extractContents()
      mark.appendChild(fragment)
      range.insertNode(mark)
    }
    sel.removeAllRanges()
    // Persist the highlighted HTML for this question
    setHighlightedHtml((prev) => ({ ...prev, [index]: promptRef.current!.innerHTML }))
  }

  function clearHighlights() {
    if (!promptRef.current) return
    // Replace every <mark> with its plain text content
    const marks = promptRef.current.querySelectorAll('mark')
    marks.forEach((m) => {
      const text = document.createTextNode(m.textContent ?? '')
      m.replaceWith(text)
    })
    setHighlightedHtml((prev) => {
      const next = { ...prev }
      delete next[index]
      return next
    })
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
    setCalcOpen(false)
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
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
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

          {/* AI generated badge */}
          {isAIGenerated && (
            <span className="flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <i className="ti ti-sparkles text-[10px]" aria-hidden="true" />
              AI Generated
            </span>
          )}

          {/* Spacer */}
          <div className="ml-auto flex items-center gap-1.5">
            {/* Report button */}
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              title="Report an issue with this question"
              className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >
              <i className="ti ti-flag text-sm" aria-hidden="true" />
              <span className="hidden sm:inline">Report</span>
            </button>
            {/* Highlight toggle — activates text-selection highlighting mode */}
            <button
              type="button"
              onClick={() => setHighlightMode((v) => !v)}
              title={highlightMode ? 'Exit highlight mode' : 'Highlight text (select text to mark it)'}
              aria-pressed={highlightMode}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors',
                highlightMode
                  ? 'border-yellow-400 bg-yellow-100 text-yellow-700'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <i className="ti ti-highlight text-sm" aria-hidden="true" />
              <span className="hidden sm:inline">{highlightMode ? 'Highlighting' : 'Highlight'}</span>
            </button>
            {/* Clear highlights (only shown when there are saved highlights) */}
            {highlightedHtml[index] && (
              <button
                type="button"
                onClick={clearHighlights}
                title="Clear all highlights on this question"
                className="flex h-8 items-center gap-1.5 rounded-lg border border-yellow-300 bg-yellow-50 px-2.5 text-xs font-medium text-yellow-700 transition-colors hover:bg-yellow-100"
              >
                <i className="ti ti-eraser text-sm" aria-hidden="true" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}

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

        {/* Highlight mode banner */}
        {highlightMode && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-700 border border-yellow-200">
            <i className="ti ti-highlight shrink-0" aria-hidden="true" />
            Select any text in the question below to highlight it. Click &quot;Highlighting&quot; again to exit.
          </div>
        )}

        {/* Question prompt — div so we can set innerHTML to restore <mark> spans.
            MathText renders the initial content; the useEffect patches in saved
            highlight marks on top without triggering a React re-render clash. */}
        <div
          ref={promptRef}
          onMouseUp={highlightMode ? applyHighlight : undefined}
          className={cn(
            'text-base font-medium leading-relaxed text-foreground',
            highlightMode && 'cursor-text select-text',
          )}
        >
          <MathText>{current.prompt}</MathText>
        </div>

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

      {/* Report modal */}
      {reportOpen && (
        <ReportQuestionModal
          question={current}
          questionNumber={index + 1}
          onClose={() => setReportOpen(false)}
        />
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
