'use client'

import { useRef, useState } from 'react'
import type { TopicLesson } from '@/lib/topic-lessons'
import { isHighlightCorrect } from '@/lib/topic-lessons'
import { LessonGraph } from './lesson-graph'

type Stage = 'tip' | 'example' | 'practice' | 'done'

interface Props {
  lesson: TopicLesson
  completed: boolean
  onComplete: () => void
}

const STAGES: { id: Stage; label: string; icon: string }[] = [
  { id: 'tip', label: 'Tip', icon: 'ti-bulb' },
  { id: 'example', label: 'Example', icon: 'ti-eye' },
  { id: 'practice', label: 'Practice', icon: 'ti-target-arrow' },
]

export function TopicLesson({ lesson, completed, onComplete }: Props) {
  const [stage, setStage] = useState<Stage>(completed ? 'done' : 'tip')

  // Multiple-choice state
  const [picked, setPicked] = useState<number | null>(null)
  // Highlight state
  const [selectedText, setSelectedText] = useState('')
  const [checked, setChecked] = useState(false)
  const passageRef = useRef<HTMLParagraphElement>(null)
  // Free-text state
  const [text, setText] = useState('')
  const [revealed, setRevealed] = useState(false)

  const q = lesson.question

  function finish() {
    setStage('done')
    onComplete()
  }

  // ---- Completed / done summary ----
  if (stage === 'done') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-5 text-center dark:border-emerald-800 dark:bg-emerald-950/30">
        <span className="ti ti-circle-check-filled text-3xl text-emerald-500" aria-hidden="true" />
        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">Lesson complete</p>
        <p className="text-xs text-emerald-700 dark:text-emerald-300">
          Nice work. The next topic is now unlocked.
        </p>
        <button
          type="button"
          onClick={() => {
            setPicked(null)
            setSelectedText('')
            setChecked(false)
            setText('')
            setRevealed(false)
            setStage('tip')
          }}
          className="mt-1 text-xs font-semibold text-emerald-700 underline underline-offset-2 dark:text-emerald-300"
        >
          Review this lesson again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stage progress */}
      <div className="flex items-center gap-2">
        {STAGES.map((s, i) => {
          const activeIdx = STAGES.findIndex((x) => x.id === stage)
          const state = i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'todo'
          return (
            <div key={s.id} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${
                  state === 'active'
                    ? 'bg-primary text-primary-foreground'
                    : state === 'done'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                <span className={`ti ${state === 'done' ? 'ti-check' : s.icon}`} aria-hidden="true" />
              </span>
              <span
                className={`text-xs font-semibold ${
                  state === 'todo' ? 'text-muted-foreground' : 'text-foreground'
                }`}
              >
                {s.label}
              </span>
              {i < STAGES.length - 1 && <span className="h-px flex-1 bg-border" />}
            </div>
          )
        })}
      </div>

      {/* Tip */}
      {stage === 'tip' && (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
              <span className="ti ti-bulb" aria-hidden="true" />
              Learning tip
            </p>
            <h4 className="text-sm font-bold text-foreground">{lesson.tip.title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{lesson.tip.body}</p>
          </div>
          <button
            type="button"
            onClick={() => setStage('example')}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
          >
            See an example
            <span className="ti ti-arrow-right" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Example */}
      {stage === 'example' && (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <span className="ti ti-eye" aria-hidden="true" />
              Example
            </p>
            <h4 className="text-sm font-bold text-foreground">{lesson.example.title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{lesson.example.body}</p>
            {lesson.example.graph && (
              <div className="mt-3 flex justify-center">
                <LessonGraph data={lesson.example.graph} />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStage('tip')}
              className="flex min-h-[48px] items-center justify-center gap-1 rounded-xl border border-border px-4 text-sm font-semibold text-muted-foreground"
            >
              <span className="ti ti-arrow-left" aria-hidden="true" />
              Back
            </button>
            <button
              type="button"
              onClick={() => setStage('practice')}
              className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
            >
              Try a real question
              <span className="ti ti-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Practice */}
      {stage === 'practice' && (
        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
            <span className="ti ti-target-arrow" aria-hidden="true" />
            Your turn
          </p>

          {/* Multiple choice */}
          {q.type === 'multiple-choice' && (
            <>
              <p className="text-sm font-medium leading-relaxed text-foreground">{q.prompt}</p>
              {q.graph && (
                <div className="flex justify-center">
                  <LessonGraph data={q.graph} />
                </div>
              )}
              <div className="flex flex-col gap-2">
                {q.choices.map((choice, i) => {
                  const isPicked = picked === i
                  const isCorrect = i === q.correctIndex
                  let cls = 'border-border bg-card hover:border-primary/50'
                  if (isPicked && isCorrect) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                  else if (isPicked && !isCorrect) cls = 'border-red-400 bg-red-50 dark:bg-red-950/30'
                  else if (picked !== null && isCorrect) cls = 'border-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/20'
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPicked(i)}
                      className={`flex min-h-[48px] items-center gap-3 rounded-xl border px-4 text-left text-sm font-medium transition-colors ${cls}`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {choice}
                    </button>
                  )
                })}
              </div>
              {picked !== null && (
                <div
                  className={`rounded-xl border p-3 text-sm leading-relaxed ${
                    picked === q.correctIndex
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200'
                      : 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200'
                  }`}
                >
                  <p className="mb-1 font-bold">
                    {picked === q.correctIndex ? 'Correct!' : 'Not quite — try again.'}
                  </p>
                  {q.explanation}
                </div>
              )}
              {picked === q.correctIndex && (
                <button
                  type="button"
                  onClick={finish}
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white"
                >
                  Complete &amp; unlock next
                  <span className="ti ti-lock-open" aria-hidden="true" />
                </button>
              )}
            </>
          )}

          {/* Highlight */}
          {q.type === 'highlight' && (
            <>
              <p className="text-sm font-medium leading-relaxed text-foreground">{q.prompt}</p>
              <p
                ref={passageRef}
                onMouseUp={() => captureSelection(passageRef, setSelectedText, setChecked)}
                onTouchEnd={() => captureSelection(passageRef, setSelectedText, setChecked)}
                className="cursor-text select-text rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground"
              >
                {renderPassage(q.passage, selectedText)}
              </p>
              {selectedText && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">You highlighted:</span> “{selectedText.trim()}”
                </p>
              )}
              {!checked && (
                <button
                  type="button"
                  disabled={!selectedText.trim()}
                  onClick={() => setChecked(true)}
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-40"
                >
                  <span className="ti ti-check" aria-hidden="true" />
                  Check my highlight
                </button>
              )}
              {checked && (
                <>
                  <div
                    className={`rounded-xl border p-3 text-sm leading-relaxed ${
                      isHighlightCorrect(selectedText, q.answers)
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200'
                        : 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200'
                    }`}
                  >
                    <p className="mb-1 font-bold">
                      {isHighlightCorrect(selectedText, q.answers)
                        ? 'Correct — that is the evidence!'
                        : 'Not the strongest evidence. Re-read and try again.'}
                    </p>
                    {q.explanation}
                  </div>
                  {isHighlightCorrect(selectedText, q.answers) ? (
                    <button
                      type="button"
                      onClick={finish}
                      className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white"
                    >
                      Complete &amp; unlock next
                      <span className="ti ti-lock-open" aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setChecked(false)
                        setSelectedText('')
                      }}
                      className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold text-foreground"
                    >
                      <span className="ti ti-refresh" aria-hidden="true" />
                      Try again
                    </button>
                  )}
                </>
              )}
            </>
          )}

          {/* Free text */}
          {q.type === 'free-text' && (
            <>
              <p className="text-sm font-medium leading-relaxed text-foreground">{q.prompt}</p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="Type your answer…"
                className="rounded-xl border border-border bg-card p-3 text-sm"
              />
              {!revealed ? (
                <button
                  type="button"
                  disabled={!text.trim()}
                  onClick={() => setRevealed(true)}
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-40"
                >
                  Check my answer
                </button>
              ) : (
                <>
                  <div className="rounded-xl border border-border bg-muted/40 p-3 text-sm leading-relaxed">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Sample strong answer
                    </p>
                    <p className="text-foreground">{q.modelAnswer}</p>
                    <p className="mt-2 text-muted-foreground">{q.explanation}</p>
                  </div>
                  <button
                    type="button"
                    onClick={finish}
                    className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white"
                  >
                    I&apos;ve got it — unlock next
                    <span className="ti ti-lock-open" aria-hidden="true" />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Reads the current text selection if it falls inside the passage element.
function captureSelection(
  ref: React.RefObject<HTMLElement | null>,
  setSelectedText: (s: string) => void,
  setChecked: (b: boolean) => void,
) {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || !ref.current) return
  const text = sel.toString()
  if (!text.trim()) return
  // Only accept selections that originate within the passage.
  if (ref.current.contains(sel.anchorNode) || ref.current.contains(sel.focusNode)) {
    setSelectedText(text)
    setChecked(false)
  }
}

// Renders the passage, wrapping the user's current selection in a <mark>.
function renderPassage(passage: string, selected: string) {
  const sel = selected.trim()
  if (!sel) return passage
  const idx = passage.indexOf(sel)
  if (idx === -1) return passage
  return (
    <>
      {passage.slice(0, idx)}
      <mark className="rounded bg-primary/30 text-foreground">{passage.slice(idx, idx + sel.length)}</mark>
      {passage.slice(idx + sel.length)}
    </>
  )
}
