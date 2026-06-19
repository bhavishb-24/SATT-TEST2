'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useCallback as useRefCallback } from 'react'
import type { PracticeQuestion } from '@/lib/sat-types'
import { cn } from '@/lib/utils'
import { MathText } from '@/components/sat/math-text'
import { DesmosPanel } from '@/components/sat/desmos-panel'
import { ReportQuestionModal } from '@/components/sat/report-question-modal'

interface QuestionCardProps {
  question: PracticeQuestion
  questionNumber: number
  selected: number | null
  onSelect: (choiceIndex: number) => void
  revealed: boolean
  onSubmit: () => void
  onNext: () => void
  isLastQuestion: boolean
  /**
   * 'practice' (default): Check answer + reveal explanation flow with built-in buttons.
   * 'test': selection only, no feedback or buttons (parent controls navigation).
   * 'review': always revealed (shows correct answer + explanation), no buttons.
   */
  mode?: 'practice' | 'test' | 'review'
  accentTheme?: {
    accentBg: string
    accentBorder: string
    accentBgSoft: string
    accentText?: string
  }
}

export function QuestionCard({
  question,
  questionNumber,
  selected,
  onSelect,
  revealed,
  onSubmit,
  onNext,
  isLastQuestion,
  mode = 'practice',
  accentTheme = {
    accentBg: 'bg-primary text-primary-foreground',
    accentBorder: 'border-primary',
    accentBgSoft: 'border-primary/30 bg-primary/5',
  },
}: QuestionCardProps) {
  const isMath = question.section === 'Math'
  const isAIGenerated = question.id.startsWith('ai-')

  // In review mode the answer is always shown; in test mode it is never shown
  // during the test; in practice mode it follows the `revealed` prop.
  const rev = mode === 'review' ? true : mode === 'test' ? false : revealed
  const showActions = mode === 'practice'
  
  // Calculator state
  const [calcOpen, setCalcOpen] = useState(false)
  
  // Highlighting state
  const [highlightMode, setHighlightMode] = useState(false)
  const [highlightedHtml, setHighlightedHtml] = useState<string>('')
  const promptRef = useRef<HTMLDivElement>(null)
  
  // Elimination state
  const [eliminated, setEliminated] = useState<Set<number>>(new Set())
  
  // Report state
  const [reportOpen, setReportOpen] = useState(false)

  // Apply highlight to selected text
  const applyHighlight = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !promptRef.current) return
    if (!promptRef.current.contains(sel.anchorNode)) return

    const range = sel.getRangeAt(0)
    const mark = document.createElement('mark')
    mark.style.backgroundColor = 'rgba(250,204,21,0.5)'
    mark.style.borderRadius = '2px'
    mark.style.padding = '0 1px'
    try {
      range.surroundContents(mark)
    } catch {
      const fragment = range.extractContents()
      mark.appendChild(fragment)
      range.insertNode(mark)
    }
    sel.removeAllRanges()
    setHighlightedHtml(promptRef.current!.innerHTML)
  }, [])

  // Clear highlights
  const clearHighlights = useCallback(() => {
    if (!promptRef.current) return
    const marks = promptRef.current.querySelectorAll('mark')
    marks.forEach((m) => {
      const text = document.createTextNode(m.textContent ?? '')
      m.replaceWith(text)
    })
    setHighlightedHtml('')
  }, [])

  // Restore highlights on mount
  useEffect(() => {
    if (!promptRef.current || !highlightedHtml) return
    promptRef.current.innerHTML = highlightedHtml
  }, [highlightedHtml])

  const toggleEliminate = (choiceIndex: number) => {
    const newEliminated = new Set(eliminated)
    if (newEliminated.has(choiceIndex)) {
      newEliminated.delete(choiceIndex)
    } else {
      newEliminated.add(choiceIndex)
    }
    setEliminated(newEliminated)
  }

  const DIFFICULTY_COLORS: Record<string, string> = {
    Easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    Hard: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  }

  return (
    <>
      {/* Progress header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-semibold',
              DIFFICULTY_COLORS[question.difficulty] ?? DIFFICULTY_COLORS.Medium,
            )}
          >
            {question.difficulty}
          </span>
          <span className="text-xs text-muted-foreground">{question.topic}</span>
          {isAIGenerated && (
            <span className="flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <i className="ti ti-sparkles text-[10px]" aria-hidden="true" />
              AI
            </span>
          )}
        </div>
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          Q{questionNumber}
        </span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {/* Highlighting toggle */}
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

          {/* Clear highlights */}
          {highlightedHtml && (
            <button
              type="button"
              onClick={clearHighlights}
              title="Clear all highlights"
              className="flex h-8 items-center gap-1.5 rounded-lg border border-yellow-300 bg-yellow-50 px-2.5 text-xs font-medium text-yellow-700 transition-colors hover:bg-yellow-100"
            >
              <i className="ti ti-eraser text-sm" aria-hidden="true" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          {/* Calculator button */}
          {isMath && (
            <button
              type="button"
              onClick={() => setCalcOpen((v) => !v)}
              title="Open calculator"
              className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <i className="ti ti-calculator text-sm" aria-hidden="true" />
              <span className="hidden sm:inline">Calculator</span>
            </button>
          )}

          {/* Report button */}
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            title="Report an issue with this question"
            className="ml-auto flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            <i className="ti ti-flag text-sm" aria-hidden="true" />
            <span className="hidden sm:inline">Report</span>
          </button>
        </div>

        {/* Highlight mode banner */}
        {highlightMode && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-700 border border-yellow-200">
            <i className="ti ti-highlight shrink-0" aria-hidden="true" />
            Select any text in the question below to highlight it. Click &quot;Highlighting&quot; again to exit.
          </div>
        )}

        {/* Question prompt */}
        <div
          ref={promptRef}
          onMouseUp={highlightMode ? applyHighlight : undefined}
          className={cn(
            'text-base font-medium leading-relaxed text-foreground',
            highlightMode && 'cursor-text select-text',
          )}
        >
          <MathText>{question.prompt}</MathText>
        </div>

        {/* Choices */}
        <div className="mt-5 flex flex-col gap-2">
          {question.choices.map((choice, i) => {
            const isSelected = selected === i
            const isCorrect = i === question.correctIndex
            const isEliminated = eliminated.has(i)
            
            let stateClass = 'border-border bg-background hover:border-foreground/30'
            if (rev) {
              if (isCorrect)
                stateClass = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
              else if (isSelected)
                stateClass = 'border-red-400 bg-red-50 dark:bg-red-950/40'
              else stateClass = 'border-border bg-background opacity-60'
            } else if (isSelected) {
              stateClass = cn(accentTheme.accentBorder, accentTheme.accentBgSoft)
            } else if (isEliminated) {
              stateClass = 'border-border bg-background opacity-40 line-through'
            }

            return (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  disabled={rev}
                  className={cn(
                    'flex flex-1 items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                    stateClass,
                  )}
                >
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                      isSelected && !rev
                        ? cn(accentTheme.accentBg, 'text-card border-transparent')
                        : 'border-border text-muted-foreground',
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-foreground">{choice}</span>
                  {rev && isCorrect && (
                    <i
                      className="ti ti-check ml-auto text-emerald-600 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                  )}
                  {rev && isSelected && !isCorrect && (
                    <i
                      className="ti ti-x ml-auto text-red-600 dark:text-red-400"
                      aria-hidden="true"
                    />
                  )}
                </button>
                {!rev && (
                  <button
                    type="button"
                    onClick={() => toggleEliminate(i)}
                    title={isEliminated ? 'Un-eliminate this choice' : 'Eliminate this choice'}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg border transition-colors',
                      isEliminated
                        ? 'border-red-300 bg-red-50 text-red-600'
                        : 'border-border bg-background text-muted-foreground hover:border-red-200 hover:bg-red-50 hover:text-red-500',
                    )}
                  >
                    <i className="ti ti-x text-sm" aria-hidden="true" />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Explanation */}
        {rev && (
          <div className="mt-4 rounded-lg bg-muted p-4 animate-fade-in">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {selected === question.correctIndex ? 'Correct' : 'Explanation'}
            </p>
            <p className="mt-1 text-sm text-foreground leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}

        {/* Action buttons (practice mode only) */}
        {showActions && (
        <div className="mt-6">
          {!revealed ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={selected === null}
              className={cn(
                'w-full rounded-lg px-4 py-3 text-sm font-semibold text-card transition-opacity hover:opacity-90 disabled:opacity-40',
                accentTheme.accentBg,
              )}
            >
              Check answer
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-card transition-opacity hover:opacity-90',
                accentTheme.accentBg,
              )}
            >
              {isLastQuestion ? 'Finish' : 'Next question'}
              <i className="ti ti-arrow-right" aria-hidden="true" />
            </button>
          )}
        </div>
        )}
      </div>

      {/* Calculator panel */}
      {isMath && (
        <DesmosPanel
          open={calcOpen}
          onClose={() => setCalcOpen(false)}
          accentBg={accentTheme.accentBg}
          accentText={accentTheme.accentText ?? 'text-primary-foreground'}
        />
      )}

      {/* Report modal */}
      {reportOpen && (
        <ReportQuestionModal
          question={question}
          questionNumber={questionNumber}
          onClose={() => setReportOpen(false)}
        />
      )}
    </>
  )
}
