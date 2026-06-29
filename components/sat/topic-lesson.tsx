'use client'

import { useMemo, useRef, useState } from 'react'
import type { Challenge, TopicLesson as TopicLessonData } from '@/lib/topic-lessons'
import { isHighlightCorrect } from '@/lib/topic-lessons'
import { LessonGraph } from './lesson-graph'

interface Props {
  lesson: TopicLessonData
  completed: boolean
  onComplete: () => void
}

export function TopicLesson({ lesson, completed, onComplete }: Props) {
  const targets = lesson.targets
  // Index of the target currently being worked on. When completed, jump to the
  // end-state summary.
  const [current, setCurrent] = useState(completed ? targets.length : 0)
  // Each target runs as a mini-lesson: 'learn' shows the tip + worked example,
  // 'practice' shows the hands-on challenge.
  const [phase, setPhase] = useState<'learn' | 'practice'>('learn')

  const allDone = current >= targets.length

  function handleSolved() {
    if (current + 1 >= targets.length) {
      setCurrent(targets.length)
      onComplete()
    } else {
      setCurrent((c) => c + 1)
      setPhase('learn')
    }
  }

  if (allDone) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-5 text-center dark:border-emerald-800 dark:bg-emerald-950/30">
        <span className="ti ti-circle-check-filled text-3xl text-emerald-500" aria-hidden="true" />
        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
          All {targets.length} targets complete
        </p>
        <p className="text-xs text-emerald-700 dark:text-emerald-300">
          Nice work! You finished every learning target in this topic.
        </p>
        <button
          type="button"
          onClick={() => {
            setCurrent(0)
            setPhase('learn')
          }}
          className="mt-1 text-xs font-semibold text-emerald-700 underline underline-offset-2 dark:text-emerald-300"
        >
          Review the targets again
        </button>
      </div>
    )
  }

  const target = targets[current]

  return (
    <div className="flex flex-col gap-4">
      {/* Target progress dots */}
      <div className="flex items-center gap-2">
        {targets.map((t, i) => {
          const state = i < current ? 'done' : i === current ? 'active' : 'todo'
          return (
            <div key={t.title} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  state === 'active'
                    ? 'bg-primary text-primary-foreground'
                    : state === 'done'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {state === 'done' ? <span className="ti ti-check" aria-hidden="true" /> : i + 1}
              </span>
              {i < targets.length - 1 && <span className="h-px flex-1 bg-border" />}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="ti ti-target-arrow text-primary" aria-hidden="true" />
          Target {current + 1} of {targets.length}: {target.title}
        </p>
        {/* Mini step indicator: Learn → Practice */}
        <div className="flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide">
          <span className={phase === 'learn' ? 'text-primary' : 'text-muted-foreground'}>Learn</span>
          <span className="ti ti-chevron-right text-muted-foreground" aria-hidden="true" />
          <span className={phase === 'practice' ? 'text-primary' : 'text-muted-foreground'}>Practice</span>
        </div>
      </div>

      {phase === 'learn' ? (
        <div className="flex flex-col gap-4">
          {/* Tip banner */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
              <span className="ti ti-bulb" aria-hidden="true" />
              Learning tip
            </p>
            <p className="text-sm leading-relaxed text-foreground">{target.tip}</p>
          </div>

          {/* Worked example */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-foreground">
              <span className="ti ti-pencil text-primary" aria-hidden="true" />
              Worked example
            </p>
            <p className="mb-3 text-sm font-medium leading-relaxed text-foreground">
              {target.example.problem}
            </p>
            {target.example.graph && (
              <div className="mb-3 flex justify-center">
                <LessonGraph data={target.example.graph} />
              </div>
            )}
            <ol className="flex flex-col gap-2">
              {target.example.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-3 flex gap-2 rounded-lg bg-primary/5 p-3">
              <span className="ti ti-bookmark mt-0.5 text-primary" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-foreground">
                <span className="font-bold">On the SAT: </span>
                {target.example.satStrategy}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPhase('practice')}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
          >
            Try the practice question
            <span className="ti ti-arrow-right" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Compact tip reminder during practice */}
          <div className="flex gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
            <span className="ti ti-bulb mt-0.5 text-primary" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-foreground">{target.tip}</p>
          </div>

          {/* Challenge — keyed so all internal state resets between targets */}
          <ChallengeView
            key={current}
            challenge={target.challenge}
            onSolved={handleSolved}
            last={current + 1 >= targets.length}
          />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

function ChallengeView({
  challenge,
  onSolved,
  last,
}: {
  challenge: Challenge
  onSolved: () => void
  last: boolean
}) {
  switch (challenge.kind) {
    case 'mc':
      return <MultipleChoice challenge={challenge} onSolved={onSolved} last={last} />
    case 'highlight':
      return <Highlight challenge={challenge} onSolved={onSolved} last={last} />
    case 'order':
      return <Order challenge={challenge} onSolved={onSolved} last={last} />
    case 'fill-blank':
      return <FillBlank challenge={challenge} onSolved={onSolved} last={last} />
    default:
      return null
  }
}

function AdvanceButton({ onSolved, last }: { onSolved: () => void; last: boolean }) {
  return (
    <button
      type="button"
      onClick={onSolved}
      className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white"
    >
      {last ? 'Complete & unlock next' : 'Next target'}
      <span className={`ti ${last ? 'ti-lock-open' : 'ti-arrow-right'}`} aria-hidden="true" />
    </button>
  )
}

function Feedback({ correct, children }: { correct: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-xl border p-3 text-sm leading-relaxed ${
        correct
          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200'
          : 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200'
      }`}
    >
      {children}
    </div>
  )
}

// ---- Multiple choice -------------------------------------------------------

function MultipleChoice({
  challenge,
  onSolved,
  last,
}: {
  challenge: Extract<Challenge, { kind: 'mc' }>
  onSolved: () => void
  last: boolean
}) {
  const [picked, setPicked] = useState<number | null>(null)
  const isRight = picked === challenge.correctIndex

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium leading-relaxed text-foreground">{challenge.prompt}</p>
      {challenge.graph && (
        <div className="flex justify-center">
          <LessonGraph data={challenge.graph} />
        </div>
      )}
      <div className="flex flex-col gap-2">
        {challenge.choices.map((choice, i) => {
          const isPicked = picked === i
          const isCorrect = i === challenge.correctIndex
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
        <Feedback correct={isRight}>
          <p className="mb-1 font-bold">{isRight ? 'Correct!' : 'Not quite. Try again.'}</p>
          {challenge.explanation}
        </Feedback>
      )}
      {isRight && <AdvanceButton onSolved={onSolved} last={last} />}
    </div>
  )
}

// ---- Highlight -------------------------------------------------------------

function Highlight({
  challenge,
  onSolved,
  last,
}: {
  challenge: Extract<Challenge, { kind: 'highlight' }>
  onSolved: () => void
  last: boolean
}) {
  const [selectedText, setSelectedText] = useState('')
  const [checked, setChecked] = useState(false)
  const passageRef = useRef<HTMLParagraphElement>(null)
  const correct = isHighlightCorrect(selectedText, challenge.answers)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium leading-relaxed text-foreground">{challenge.prompt}</p>
      <p
        ref={passageRef}
        onMouseUp={() => captureSelection(passageRef, setSelectedText, setChecked)}
        onTouchEnd={() => captureSelection(passageRef, setSelectedText, setChecked)}
        className="cursor-text select-text rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground"
      >
        {renderPassage(challenge.passage, selectedText)}
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
          <Feedback correct={correct}>
            <p className="mb-1 font-bold">
              {correct ? 'Correct! That is the evidence.' : 'Not the strongest evidence. Re-read and try again.'}
            </p>
            {challenge.explanation}
          </Feedback>
          {correct ? (
            <AdvanceButton onSolved={onSolved} last={last} />
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
    </div>
  )
}

// ---- Order (tap into sequence) ---------------------------------------------

function Order({
  challenge,
  onSolved,
  last,
}: {
  challenge: Extract<Challenge, { kind: 'order' }>
  onSolved: () => void
  last: boolean
}) {
  // Present a shuffled pool; the user taps items to build their sequence.
  const shuffled = useMemo(() => shuffle(challenge.items), [challenge])
  const [built, setBuilt] = useState<string[]>([])
  const [checked, setChecked] = useState(false)

  const remaining = shuffled.filter((item) => !built.includes(item))
  const correct =
    built.length === challenge.items.length &&
    built.every((item, i) => item === challenge.items[i])

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium leading-relaxed text-foreground">{challenge.prompt}</p>

      {/* Built sequence */}
      <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-3">
        {built.length === 0 && (
          <p className="text-center text-xs text-muted-foreground">Tap the steps below in order.</p>
        )}
        {built.map((item, i) => (
          <div
            key={item}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {i + 1}
            </span>
            <span className="flex-1">{item}</span>
            {!checked && (
              <button
                type="button"
                aria-label="Remove step"
                onClick={() => setBuilt((b) => b.filter((x) => x !== item))}
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="ti ti-x" aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Remaining pool */}
      {remaining.length > 0 && !checked && (
        <div className="flex flex-col gap-2">
          {remaining.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setBuilt((b) => [...b, item])}
              className="flex min-h-[44px] items-center gap-2 rounded-xl border border-border bg-card px-4 text-left text-sm font-medium hover:border-primary/50"
            >
              <span className="ti ti-plus text-muted-foreground" aria-hidden="true" />
              {item}
            </button>
          ))}
        </div>
      )}

      {remaining.length === 0 && !checked && (
        <button
          type="button"
          onClick={() => setChecked(true)}
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
        >
          <span className="ti ti-check" aria-hidden="true" />
          Check my order
        </button>
      )}

      {checked && (
        <>
          <Feedback correct={correct}>
            <p className="mb-1 font-bold">{correct ? 'Perfect sequence!' : 'Not quite. Reset and try again.'}</p>
            {challenge.explanation}
          </Feedback>
          {correct ? (
            <AdvanceButton onSolved={onSolved} last={last} />
          ) : (
            <button
              type="button"
              onClick={() => {
                setChecked(false)
                setBuilt([])
              }}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold text-foreground"
            >
              <span className="ti ti-refresh" aria-hidden="true" />
              Reset
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ---- Fill in the blank (tap a chip) ----------------------------------------

function FillBlank({
  challenge,
  onSolved,
  last,
}: {
  challenge: Extract<Challenge, { kind: 'fill-blank' }>
  onSolved: () => void
  last: boolean
}) {
  const [chosen, setChosen] = useState<string | null>(null)
  const correct = chosen === challenge.correct
  const filled = challenge.template.replace('___', chosen ?? '____')

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium leading-relaxed text-foreground">{challenge.prompt}</p>

      <div className="rounded-xl border border-border bg-muted/40 p-4 text-center text-base font-semibold text-foreground">
        {filled}
      </div>

      <div className="flex flex-wrap gap-2">
        {challenge.options.map((opt) => {
          const isChosen = chosen === opt
          const isCorrect = opt === challenge.correct
          let cls = 'border-border bg-card hover:border-primary/50'
          if (isChosen && isCorrect) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
          else if (isChosen && !isCorrect) cls = 'border-red-400 bg-red-50 dark:bg-red-950/30'
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setChosen(opt)}
              className={`min-h-[44px] rounded-xl border px-4 text-sm font-semibold transition-colors ${cls}`}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {chosen !== null && (
        <Feedback correct={correct}>
          <p className="mb-1 font-bold">{correct ? 'Correct!' : 'Not quite. Try another chip.'}</p>
          {challenge.explanation}
        </Feedback>
      )}
      {correct && <AdvanceButton onSolved={onSolved} last={last} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  // Guard against the (rare) case where the shuffle equals the original order.
  if (a.length > 1 && a.every((v, i) => v === arr[i])) {
    ;[a[0], a[1]] = [a[1], a[0]]
  }
  return a
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
