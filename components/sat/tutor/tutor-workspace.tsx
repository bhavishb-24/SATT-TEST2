'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { cn } from '@/lib/utils'
import type { TriageData } from '@/lib/sat-types'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TutorMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface TutorContext {
  studentName: string
  examDate?: string
  predictedScore?: number
  weakTopics?: string[]
  strongTopics?: string[]
  currentTopic?: string
  learningStyle?: string
  sessionQuestionsAnswered?: number
  sessionMinutes?: number
  streak?: number
  recentInsight?: string
}

type WelcomeAction =
  | 'continue'
  | 'new'
  | 'weak'
  | 'whiteboard'
  | 'ask'
  | 'sprint'

// ─── Math renderer (same tokenizer pattern as chat-panel) ─────────────────

function renderContent(text: string): string {
  const DISPLAY_RE = /\\\[([\s\S]+?)\\\]/g
  const INLINE_RE = /\\\((.+?)\\\)/gs
  type Token = { type: 'text' | 'display' | 'inline'; content: string }
  const tokens: Token[] = []

  let lastIdx = 0
  let m: RegExpExecArray | null
  DISPLAY_RE.lastIndex = 0
  while ((m = DISPLAY_RE.exec(text)) !== null) {
    if (m.index > lastIdx) tokens.push({ type: 'text', content: text.slice(lastIdx, m.index) })
    tokens.push({ type: 'display', content: m[1] })
    lastIdx = m.index + m[0].length
  }
  if (lastIdx < text.length) tokens.push({ type: 'text', content: text.slice(lastIdx) })

  const tokens2: Token[] = []
  for (const tok of tokens) {
    if (tok.type !== 'text') { tokens2.push(tok); continue }
    INLINE_RE.lastIndex = 0
    let li = 0
    let im: RegExpExecArray | null
    while ((im = INLINE_RE.exec(tok.content)) !== null) {
      if (im.index > li) tokens2.push({ type: 'text', content: tok.content.slice(li, im.index) })
      tokens2.push({ type: 'inline', content: im[1] })
      li = im.index + im[0].length
    }
    if (li < tok.content.length) tokens2.push({ type: 'text', content: tok.content.slice(li) })
  }

  return tokens2.map((tok) => {
    if (tok.type === 'display') {
      try {
        return `<div class="my-3 overflow-x-auto">${katex.renderToString(tok.content.trim(), { displayMode: true, throwOnError: false })}</div>`
      } catch { return `<code class="text-xs bg-muted px-1 rounded">${tok.content}</code>` }
    }
    if (tok.type === 'inline') {
      try {
        return katex.renderToString(tok.content.trim(), { displayMode: false, throwOnError: false })
      } catch { return `<code class="text-xs bg-muted px-1 rounded">${tok.content}</code>` }
    }
    return tok.content
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^(\d+)\.\s+(.+)$/gm,
        '<div class="flex gap-2 mt-2"><span class="font-bold text-primary shrink-0 tabular-nums">$1.</span><span>$2</span></div>')
      .replace(/\n/g, '<br />')
  }).join('')
}

// ─── Welcome Screen ──────────────────────────────────────────────────────────

interface WelcomeScreenProps {
  studentName: string
  weakTopics: string[]
  onAction: (action: WelcomeAction, message?: string) => void
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function WelcomeScreen({ studentName, weakTopics, onAction }: WelcomeScreenProps) {
  const recommendedTopic = weakTopics[0] ?? null

  const quickActions = [
    { id: 'continue' as WelcomeAction, icon: 'ti-player-play', label: 'Continue Lesson', message: 'Let\'s continue where we left off.' },
    { id: 'new' as WelcomeAction, icon: 'ti-sparkles', label: 'Start New Lesson', message: 'I\'d like to start a new lesson.' },
    { id: 'weak' as WelcomeAction, icon: 'ti-crosshair', label: 'Practice Weak Topics', message: recommendedTopic ? `Help me practice ${recommendedTopic}.` : 'Help me practice my weakest topics.' },
    { id: 'whiteboard' as WelcomeAction, icon: 'ti-chalkboard', label: 'Open Whiteboard', message: 'Let\'s work on a problem using the whiteboard.' },
    { id: 'ask' as WelcomeAction, icon: 'ti-message-question', label: 'Ask a Question', message: '' },
    { id: 'sprint' as WelcomeAction, icon: 'ti-bolt', label: 'Sprint Mode', message: 'Start a 10-minute sprint session on my weakest topic.' },
  ]

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        {/* Greeting */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
            <i className="ti ti-sparkles text-primary text-2xl" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {getGreeting()}, {studentName}.
          </h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            Ready to continue preparing for your SAT?
          </p>
          {recommendedTopic && (
            <p className="mt-1 text-sm text-muted-foreground">
              I recommend focusing on{' '}
              <span className="font-semibold text-primary">{recommendedTopic}</span>
              {'. It currently has your lowest confidence score.'}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => onAction(action.id, action.message)}
              className={cn(
                'flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left',
                'shadow-sm transition-all duration-200',
                'hover:border-primary/30 hover:bg-primary/5 hover:shadow-md',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <i className={cn('ti', action.icon, 'text-primary text-lg')} aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-foreground leading-tight">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {/* AI Insight */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <i className="ti ti-sparkles text-primary mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold text-primary mb-0.5">Sage noticed something</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {recommendedTopic
                ? `Your accuracy on ${recommendedTopic} questions is lower than your other topics. Let's work on that today.`
                : 'Start a session and I\'ll begin learning your patterns to give you personalized guidance.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 px-4 py-2 rise-in">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 shadow-sm">
        <i className="ti ti-sparkles text-primary text-sm" aria-hidden="true" />
      </div>
      <div className="rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/60" />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/60" />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/60" />
        </div>
      </div>
    </div>
  )
}

// ─── Message Bubble ────────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: TutorMessage
  studentName: string
}

function MessageBubble({ message, studentName }: MessageBubbleProps) {
  const isAI = message.role === 'assistant'
  const html = isAI ? renderContent(message.content) : null

  return (
    <div
      className={cn(
        'flex items-end gap-3 px-4 py-2 rise-in',
        !isAI && 'flex-row-reverse',
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm',
          isAI ? 'bg-primary/10' : 'bg-secondary',
        )}
        aria-hidden="true"
      >
        {isAI ? (
          <i className="ti ti-sparkles text-primary text-sm" />
        ) : (
          <span className="text-xs font-bold text-primary">
            {studentName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[75%]', !isAI && 'items-end flex flex-col')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 shadow-sm',
            isAI
              ? 'rounded-bl-sm border border-border bg-card text-foreground'
              : 'rounded-br-sm bg-primary text-primary-foreground',
          )}
        >
          {isAI && html ? (
            <div
              className="text-[15px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className="text-[15px] leading-relaxed">{message.content}</p>
          )}
        </div>
        <p
          className={cn(
            'mt-1 text-[11px] text-muted-foreground/60',
            !isAI && 'text-right',
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}

// ─── Main TutorWorkspace ──────────────────────────────────────────────────────

interface Props {
  triage: TriageData
  tutorCtx: TutorContext
  messages: TutorMessage[]
  isStreaming: boolean
  streamingContent: string
  onSend: (text: string) => void
  onNavigate: (view: 'whiteboard' | 'practice' | 'flashcards') => void
  onTopicDetected: (topic: string) => void
}

const SMART_ACTIONS = [
  { label: 'Explain Simpler', message: 'Can you explain that more simply?' },
  { label: 'Explain Visually', message: 'Can you explain that visually?' },
  { label: 'Give Me a Hint', message: 'Give me a small hint, don\'t give the answer.' },
  { label: 'Challenge Me', message: 'Give me a harder version of this problem.' },
  { label: 'Create Quiz', message: 'Create a short 3-question quiz on this topic.' },
  { label: 'Similar Questions', message: 'Generate 2 similar practice questions.' },
]

export function TutorWorkspace({
  triage,
  tutorCtx,
  messages,
  isStreaming,
  streamingContent,
  onSend,
  onNavigate,
  onTopicDetected,
}: Props) {
  const [input, setInput] = useState('')
  const [showSmartActions, setShowSmartActions] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasMessages = messages.length > 0

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming, streamingContent])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }, [input])

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    onSend(text)
    setShowSmartActions(false)
  }, [input, isStreaming, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  const handleWelcomeAction = useCallback(
    (_action: WelcomeAction, message?: string) => {
      if (_action === 'whiteboard') {
        onNavigate('whiteboard')
        return
      }
      if (message) {
        onSend(message)
      } else {
        // "Ask a Question" — focus the input
        textareaRef.current?.focus()
      }
    },
    [onSend, onNavigate],
  )

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <WelcomeScreen
            studentName={tutorCtx.studentName}
            weakTopics={tutorCtx.weakTopics ?? triage.weakAreas}
            onAction={handleWelcomeAction}
          />
        ) : (
          <div className="flex flex-col pb-4 pt-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                studentName={tutorCtx.studentName}
              />
            ))}

            {/* Streaming assistant message */}
            {isStreaming && streamingContent && (
              <div className="flex items-end gap-3 px-4 py-2 rise-in">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 shadow-sm">
                  <i className="ti ti-sparkles text-primary text-sm" aria-hidden="true" />
                </div>
                <div className="max-w-[75%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 shadow-sm">
                  <div
                    className="text-[15px] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderContent(streamingContent) + '<span class="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />' }}
                  />
                </div>
              </div>
            )}

            {/* Typing indicator when no partial content yet */}
            {isStreaming && !streamingContent && <TypingIndicator />}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Smart Actions bar */}
      {hasMessages && showSmartActions && (
        <div className="border-t border-border bg-card/80 px-4 py-2 backdrop-blur">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {SMART_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  onSend(action.message)
                  setShowSmartActions(false)
                }}
                className="shrink-0 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-border bg-card px-4 py-3">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-background px-4 py-2 shadow-sm ring-0 transition focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
          {/* Smart actions toggle */}
          <button
            type="button"
            onClick={() => setShowSmartActions((v) => !v)}
            aria-label="Smart actions"
            className={cn(
              'mb-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
              showSmartActions
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <i className="ti ti-sparkles text-base" aria-hidden="true" />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Sage anything about SAT…"
            rows={1}
            className="flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
            style={{ minHeight: '36px', maxHeight: '160px' }}
            aria-label="Message to AI tutor"
          />

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            aria-label="Send message"
            className={cn(
              'mb-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
              input.trim() && !isStreaming
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'cursor-not-allowed bg-muted text-muted-foreground/50',
            )}
          >
            <i className="ti ti-send-2 text-base" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-1.5 text-center text-[11px] text-muted-foreground/50">
          Sage uses the Socratic method. It guides you to the answer rather than giving it directly.
        </p>
      </div>
    </div>
  )
}
