'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { MemoryCards } from './memory-cards'
import {
  SMART_ACTIONS,
  QUESTION,
  MEMORY_NUDGE,
  type SmartAction,
  type PracticeProblem,
  type PracticeFeedback,
} from './lesson-data'

export interface ChatMessage {
  role: 'student' | 'assistant'
  content: string
}

interface TutorPanelProps {
  messages: ChatMessage[]
  thinking: boolean
  /** Label for the button that advances the hint ladder; null when finished. */
  advanceLabel: string | null
  onAdvance: () => void
  mastered: boolean
  onSend: (text: string) => void
  onSmartAction: (action: SmartAction) => void
  onStartVoice: () => void
  onUpload: () => void
  onOpenSummary: () => void
  micActive: boolean
  onToggleMic: () => void
  // Interactive "Why?" explanations
  onWhy: (text: string) => void
  // Escalating live hints
  onHint: () => void
  hintLoading: boolean
  // Practice mode
  practice: PracticeProblem | null
  practiceLoading: boolean
  checkingPractice: boolean
  practiceFeedback: PracticeFeedback | null
  onStartPractice: () => void
  onCheckPractice: (answer: string) => void
  onClosePractice: () => void
}

/** Renders **bold** segments without pulling in a full markdown parser. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i} className="font-semibold text-foreground">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

export function TutorPanel({
  messages,
  thinking,
  advanceLabel,
  onAdvance,
  mastered,
  onSend,
  onSmartAction,
  onStartVoice,
  onUpload,
  onOpenSummary,
  micActive,
  onToggleMic,
  onWhy,
  onHint,
  hintLoading,
  practice,
  practiceLoading,
  checkingPractice,
  practiceFeedback,
  onStartPractice,
  onCheckPractice,
  onClosePractice,
}: TutorPanelProps) {
  const [tab, setTab] = useState<'chat' | 'memory'>('chat')
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  // Index of the last assistant message — only that one gets a "Why?" button.
  const lastAssistantIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return i
    }
    return -1
  })()

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking, tab, practice, practiceFeedback])

  const send = () => {
    if (!input.trim()) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      {/* Header */}
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <i className="ti ti-sparkles text-lg" aria-hidden="true" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-primary status-dot" />
          </span>
          <div>
            <p className="text-sm font-bold leading-tight text-foreground">Whiteboard AI</p>
            <p className="flex items-center gap-1 text-xs text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              Teaching
            </p>
          </div>
        </div>
        {mastered && (
          <button
            type="button"
            onClick={onOpenSummary}
            className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            <i className="ti ti-clipboard-check" aria-hidden="true" />
            Summary
          </button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex shrink-0 gap-1 border-b border-border px-3 py-2">
        {(['chat', 'memory'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors',
              tab === t
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t === 'chat' ? 'Conversation' : 'Memory'}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {tab === 'memory' ? (
          <div className="flex flex-col gap-4">
            <MemoryCards />
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="flex items-start gap-2 text-xs leading-snug text-amber-800">
                <i className="ti ti-history mt-0.5 shrink-0 text-sm" aria-hidden="true" />
                {MEMORY_NUDGE}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Question context chip */}
            <div className="rounded-xl border border-border bg-background px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Question {QUESTION.number} · {QUESTION.section}
              </p>
              <p className="mt-1 text-xs leading-snug text-foreground">{QUESTION.prompt}</p>
            </div>

            {messages.map((m, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div
                  className={cn('flex rise-in', m.role === 'student' ? 'justify-end' : 'justify-start')}
                >
                  {m.role === 'assistant' && (
                    <span className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">
                      <i className="ti ti-sparkles" aria-hidden="true" />
                    </span>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                      m.role === 'student'
                        ? 'rounded-tr-sm bg-foreground text-background'
                        : 'rounded-tl-sm bg-background text-foreground shadow-sm',
                    )}
                  >
                    <RichText text={m.content} />
                  </div>
                </div>

                {/* Why? affordance on the latest tutor message */}
                {m.role === 'assistant' &&
                  i === lastAssistantIndex &&
                  !thinking &&
                  m.content.length > 40 && (
                    <button
                      type="button"
                      onClick={() => onWhy(m.content)}
                      className="ml-8 flex w-fit items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <i className="ti ti-help-circle text-xs" aria-hidden="true" />
                      Why does this work?
                    </button>
                  )}
              </div>
            ))}

            {thinking && (
              <div className="flex justify-start">
                <span className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">
                  <i className="ti ti-sparkles" aria-hidden="true" />
                </span>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-background px-4 py-3 shadow-sm">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Hint ladder advance button */}
            {advanceLabel && !thinking && (
              <button
                type="button"
                onClick={onAdvance}
                className="rise-in mt-1 flex items-center justify-center gap-2 self-end rounded-xl border border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                {advanceLabel}
                <i className="ti ti-arrow-right" aria-hidden="true" />
              </button>
            )}

            {/* Practice ("Your Turn") panel */}
            {(practice || practiceLoading) && (
              <PracticePanel
                practice={practice}
                practiceLoading={practiceLoading}
                checkingPractice={checkingPractice}
                practiceFeedback={practiceFeedback}
                onCheck={onCheckPractice}
                onClose={onClosePractice}
                onNext={onStartPractice}
              />
            )}

            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* Smart actions */}
      <div className="shrink-0 border-t border-border px-3 py-2.5">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={onHint}
            disabled={hintLoading}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
          >
            <i className={cn('ti ti-bulb text-sm', hintLoading && 'animate-pulse')} aria-hidden="true" />
            {hintLoading ? 'Thinking…' : 'Give me a hint'}
          </button>
          <button
            type="button"
            onClick={onStartPractice}
            disabled={practiceLoading}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
          >
            <i
              className={cn('ti ti-pencil-plus text-sm', practiceLoading && 'animate-pulse')}
              aria-hidden="true"
            />
            Your Turn
          </button>
          {SMART_ACTIONS.filter((a) => a.label !== 'Give me a hint').map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => onSmartAction(a)}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <i className={cn('ti', a.icon, 'text-sm text-primary')} aria-hidden="true" />
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Student controls */}
      <div className="shrink-0 border-t border-border bg-card px-3 pb-3 pt-2.5">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-primary/40">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            rows={1}
            placeholder="Ask your tutor anything…"
            className="max-h-28 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            onInput={(e) => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = `${Math.min(el.scrollHeight, 112)}px`
            }}
          />
          <button
            type="button"
            onClick={send}
            disabled={!input.trim()}
            aria-label="Send message"
            className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
          >
            <i className="ti ti-send-2 text-base" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <ControlButton icon="ti-upload" label="Upload SAT question" onClick={onUpload} />
          <ControlButton icon="ti-camera" label="Take photo" onClick={onUpload} />
          <ControlButton
            icon="ti-microphone"
            label="Toggle microphone"
            onClick={onToggleMic}
            active={micActive}
          />
          <button
            type="button"
            onClick={onStartVoice}
            className="ml-auto flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <i className="ti ti-wave-sine" aria-hidden="true" />
            Start Voice Lesson
          </button>
        </div>
      </div>
    </div>
  )
}

function PracticePanel({
  practice,
  practiceLoading,
  checkingPractice,
  practiceFeedback,
  onCheck,
  onClose,
  onNext,
}: {
  practice: PracticeProblem | null
  practiceLoading: boolean
  checkingPractice: boolean
  practiceFeedback: PracticeFeedback | null
  onCheck: (answer: string) => void
  onClose: () => void
  onNext: () => void
}) {
  const [answer, setAnswer] = useState('')
  const [revealed, setRevealed] = useState(false)

  // Reset local state whenever a new problem arrives.
  const promptKey = practice?.prompt ?? ''
  useEffect(() => {
    setAnswer('')
    setRevealed(false)
  }, [promptKey])

  return (
    <div className="rise-in rounded-2xl border border-primary/30 bg-primary/5 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
          <i className="ti ti-pencil-plus" aria-hidden="true" />
          Your Turn
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close practice"
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <i className="ti ti-x text-sm" aria-hidden="true" />
        </button>
      </div>

      {practiceLoading || !practice ? (
        <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
          <i className="ti ti-loader-2 animate-spin" aria-hidden="true" />
          Creating a fresh practice problem…
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {practice.section}
          </p>
          <p className="text-sm leading-relaxed text-foreground">{practice.prompt}</p>

          <div className="flex items-end gap-2">
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && answer.trim() && !checkingPractice) onCheck(answer.trim())
              }}
              placeholder="Your answer…"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="button"
              onClick={() => answer.trim() && onCheck(answer.trim())}
              disabled={!answer.trim() || checkingPractice}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {checkingPractice ? (
                <i className="ti ti-loader-2 animate-spin" aria-hidden="true" />
              ) : (
                <i className="ti ti-check" aria-hidden="true" />
              )}
              Check
            </button>
          </div>

          {practiceFeedback && (
            <div
              className={cn(
                'rise-in flex items-start gap-2 rounded-xl border p-2.5 text-sm leading-relaxed',
                practiceFeedback.correct
                  ? 'border-primary/30 bg-primary/10 text-foreground'
                  : 'border-amber-200 bg-amber-50 text-amber-900',
              )}
            >
              <i
                className={cn(
                  'ti mt-0.5 shrink-0',
                  practiceFeedback.correct ? 'ti-circle-check text-primary' : 'ti-info-circle',
                )}
                aria-hidden="true"
              />
              <span>
                <RichText text={practiceFeedback.feedback} />
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRevealed((r) => !r)}
              className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <i className={cn('ti', revealed ? 'ti-eye-off' : 'ti-eye')} aria-hidden="true" />
              {revealed ? 'Hide answer' : 'Show answer'}
            </button>
            <button
              type="button"
              onClick={onNext}
              className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-primary transition-colors hover:opacity-80"
            >
              <i className="ti ti-refresh" aria-hidden="true" />
              New problem
            </button>
          </div>

          {revealed && (
            <div className="rounded-xl border border-border bg-background p-2.5 text-xs leading-relaxed text-foreground">
              <span className="font-semibold">Answer: </span>
              {practice.answer}
              <p className="mt-1 text-muted-foreground">
                <RichText text={practice.explanation} />
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ControlButton({
  icon,
  label,
  onClick,
  active,
}: {
  icon: string
  label: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-xl border transition-colors',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <i className={cn('ti', icon, 'text-base', active && 'animate-pulse')} aria-hidden="true" />
    </button>
  )
}
