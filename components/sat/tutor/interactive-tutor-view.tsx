'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { cn } from '@/lib/utils'
import type { TriageData, AppStats, DashboardView } from '@/lib/sat-types'
import type { GamificationState } from '@/lib/use-gamification'
import { StudentOverview } from './student-overview'
import { SessionPanel, type SessionStats } from './session-panel'

// ─── Types ────────────────────────────────────────────────────────────────────

type WelcomeAction = 'continue' | 'new' | 'weak' | 'whiteboard' | 'ask' | 'sprint'

// ─── Math Renderer ────────────────────────────────────────────────────────────

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

function getMessageText(msg: { parts?: Array<{ type: string; text?: string }>, content?: string }): string {
  if (msg.parts && Array.isArray(msg.parts)) {
    return msg.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('')
  }
  return msg.content ?? ''
}

// ─── Welcome Screen ───────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

interface WelcomeScreenProps {
  studentName: string
  weakTopics: string[]
  onAction: (action: WelcomeAction, message?: string) => void
}

function WelcomeScreen({ studentName, weakTopics, onAction }: WelcomeScreenProps) {
  const recommendedTopic = weakTopics[0] ?? null

  const quickActions = [
    {
      id: 'continue' as WelcomeAction,
      icon: 'ti-player-play',
      label: 'Continue Lesson',
      message: 'Let\'s continue where we left off.',
    },
    {
      id: 'new' as WelcomeAction,
      icon: 'ti-sparkles',
      label: 'Start New Lesson',
      message: 'I\'d like to start a fresh new lesson.',
    },
    {
      id: 'weak' as WelcomeAction,
      icon: 'ti-crosshair',
      label: 'Practice Weak Topics',
      message: recommendedTopic
        ? `Help me practice ${recommendedTopic}. It's my weakest area.`
        : 'Help me practice my weakest topics.',
    },
    {
      id: 'whiteboard' as WelcomeAction,
      icon: 'ti-chalkboard',
      label: 'Whiteboard AI',
      message: 'Open the whiteboard.',
    },
    {
      id: 'ask' as WelcomeAction,
      icon: 'ti-message-question',
      label: 'Ask a Question',
      message: '',
    },
    {
      id: 'sprint' as WelcomeAction,
      icon: 'ti-bolt',
      label: 'Sprint Mode',
      message: 'Start a 10-minute sprint on my weakest topic.',
    },
  ]

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-12">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-sm ring-1 ring-primary/20">
            <i className="ti ti-sparkles text-primary text-2xl" aria-hidden="true" />
          </div>
          <h2 className="text-balance text-2xl font-bold text-foreground">
            {getGreeting()}, {studentName}.
          </h2>
          <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
            Ready to continue preparing for your SAT?
          </p>
          {recommendedTopic && (
            <p className="mt-1 text-sm text-muted-foreground">
              Today I recommend focusing on{' '}
              <span className="font-semibold text-primary">{recommendedTopic}</span>
              {'. It currently has your lowest confidence score.'}
            </p>
          )}
        </div>

        {/* Actions grid */}
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => onAction(action.id, action.message)}
              className={cn(
                'flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left',
                'shadow-sm transition-all duration-200',
                'hover:border-primary/30 hover:bg-primary/5 hover:shadow-md hover:-translate-y-0.5',
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

        {/* AI Insight card */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <i className="ti ti-brain text-primary mt-0.5 shrink-0" aria-hidden="true" />
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
    <div className="flex items-end gap-3 px-4 py-2">
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

interface BubbleProps {
  role: 'user' | 'assistant'
  text: string
  timestamp?: number
  studentName: string
}

function MessageBubble({ role, text, timestamp, studentName }: BubbleProps) {
  const isAI = role === 'assistant'

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
      <div className={cn('max-w-[75%]', !isAI && 'flex flex-col items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 shadow-sm',
            isAI
              ? 'rounded-bl-sm border border-border bg-card text-foreground'
              : 'rounded-br-sm bg-primary text-primary-foreground',
          )}
        >
          {isAI ? (
            <div
              className="text-[15px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderContent(text) }}
            />
          ) : (
            <p className="text-[15px] leading-relaxed">{text}</p>
          )}
        </div>
        {timestamp && (
          <p className={cn('mt-1 text-[11px] text-muted-foreground/60', !isAI && 'text-right')}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Smart Actions bar ────────────────────────────────────────────────────────

const SMART_ACTIONS = [
  { label: 'Explain Simpler', message: 'Can you explain that more simply?' },
  { label: 'Explain Visually', message: 'Can you explain that visually?' },
  { label: 'Give Me a Hint', message: 'Give me a small hint without giving the answer.' },
  { label: 'Challenge Me', message: 'Give me a harder version of this problem.' },
  { label: 'Create Quiz', message: 'Create a short 3-question quiz on this topic.' },
  { label: 'Similar Questions', message: 'Generate 2 similar SAT practice questions.' },
  { label: 'Open Whiteboard', message: 'whiteboard' },
  { label: 'Review Previous', message: 'Let\'s review the most recent concept we covered.' },
]

// ─── Main View ────────────────────────────────────────────────────────────────

interface Props {
  triage: TriageData
  stats: AppStats
  gamification: GamificationState
  onNavigate: (view: DashboardView) => void
}

export function InteractiveTutorView({ triage, stats, gamification, onNavigate }: Props) {
  const studentName =
    typeof window !== 'undefined'
      ? (() => {
          try {
            const guest = localStorage.getItem('ser:guest-user')
            if (guest) return (JSON.parse(guest) as { name: string }).name
          } catch { /* ignore */ }
          return 'Student'
        })()
      : 'Student'

  const [input, setInput] = useState('')
  const [showSmartActions, setShowSmartActions] = useState(false)
  const [sessionStart] = useState(() => Date.now())
  const [hints, setHints] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [concepts, setConcepts] = useState<string[]>([])
  const [currentTopic, setCurrentTopic] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Compute tutor context passed to the API on every send
  const tutorContext = useMemo(() => ({
    studentName,
    weakTopics: triage.weakAreas,
    currentTopic: currentTopic ?? triage.weakAreas[0],
    learningStyle: triage.learningStyle,
    streak: gamification.streak,
  }), [studentName, triage, currentTopic, gamification.streak])

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/tutor',
      prepareSendMessagesRequest: ({ messages: msgs }) => ({
        body: {
          messages: msgs,
          data: { context: tutorContext },
        },
      }),
    }),
  })

  const isStreaming = status === 'streaming' || status === 'submitted'
  const hasMessages = messages.length > 0

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }, [input])

  // Detect hints used and mistakes corrected from assistant messages
  useEffect(() => {
    const last = messages.at(-1)
    if (!last || last.role !== 'assistant') return
    const text = getMessageText(last).toLowerCase()
    if (text.includes('hint') && !text.includes('give me')) setHints((h) => h + 1)
    if (text.includes('mistake') || text.includes('incorrect') || text.includes('not quite')) {
      setMistakes((m) => m + 1)
    }
    // Simple topic detection
    const topicMatches = text.match(/(?:about|on|covering|topic:|focuses on)\s+([A-Z][a-z]+(?: [A-Za-z]+){0,2})/g)
    if (topicMatches) {
      const topic = topicMatches[0].replace(/^(?:about|on|covering|topic:|focuses on)\s+/i, '').trim()
      setCurrentTopic(topic)
    }
  }, [messages])

  const doSend = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return
    sendMessage({ text: trimmed })
  }, [isStreaming, sendMessage])

  const handleSend = useCallback(() => {
    doSend(input)
    setInput('')
    setShowSmartActions(false)
  }, [input, doSend])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleWelcomeAction = useCallback((action: WelcomeAction, message?: string) => {
    if (action === 'whiteboard') { onNavigate('whiteboard' as DashboardView); return }
    if (message) { doSend(message) }
    else { textareaRef.current?.focus() }
  }, [doSend, onNavigate])

  const handleSmartAction = useCallback((msg: string) => {
    if (msg === 'whiteboard') { onNavigate('whiteboard' as DashboardView); return }
    doSend(msg)
    setShowSmartActions(false)
  }, [doSend, onNavigate])

  // Session stats
  const sessionSeconds = Math.floor((Date.now() - sessionStart) / 1000)
  const questionsAnswered = messages.filter((m) => m.role === 'user').length
  const accuracy = questionsAnswered > 0
    ? Math.round((questionsAnswered - mistakes) / questionsAnswered * 100)
    : 0

  const sessionStats: SessionStats = {
    topic: currentTopic ?? triage.weakAreas[0] ?? null,
    timeStudied: sessionSeconds,
    questionsAnswered,
    confidence: accuracy,
    hintsUsed: hints,
    mistakesCorrected: mistakes,
    conceptsLearned: concepts,
    estimatedImprovement: questionsAnswered >= 5 ? Math.min(30, questionsAnswered * 2) : null,
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left sidebar — Student Overview */}
      <StudentOverview
        triage={triage}
        stats={stats}
        countdown={''}
        streak={gamification.streak}
        studySeconds={stats.focusSeconds}
        predictedScore={null}
        onNavigate={onNavigate}
      />

      {/* Center — Main Conversation */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Sub-header */}
        <div className="flex h-12 items-center justify-between border-b border-border bg-card/60 px-5 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="status-dot h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
            <span className="text-sm font-semibold text-foreground">Sage AI Tutor</span>
            {isStreaming && (
              <span className="text-xs text-muted-foreground">thinking...</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSmartActions((v) => !v)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                showSmartActions
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-primary',
              )}
            >
              <i className="ti ti-sparkles text-sm" aria-hidden="true" />
              Smart Actions
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            <WelcomeScreen
              studentName={studentName}
              weakTopics={triage.weakAreas}
              onAction={handleWelcomeAction}
            />
          ) : (
            <div className="flex flex-col pb-4 pt-4">
              {messages.map((msg) => {
                const text = getMessageText(msg)
                if (!text) return null
                return (
                  <MessageBubble
                    key={msg.id}
                    role={msg.role as 'user' | 'assistant'}
                    text={text}
                    studentName={studentName}
                  />
                )
              })}
              {isStreaming && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Smart Actions bar */}
        {showSmartActions && (
          <div className="border-t border-border bg-card/80 px-4 py-2 backdrop-blur">
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              {SMART_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => handleSmartAction(action.message)}
                  className="shrink-0 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border bg-card px-4 py-3">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-background px-4 py-2 shadow-sm transition focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Sage anything about the SAT…"
              rows={1}
              disabled={isStreaming}
              className="flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 disabled:opacity-60"
              style={{ minHeight: '36px', maxHeight: '160px' }}
              aria-label="Message to AI tutor"
            />
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

      {/* Right sidebar — Session Panel */}
      <SessionPanel
        session={sessionStats}
        hasMessages={hasMessages}
        onGenerateFlashcards={() => {
          doSend('Generate 5 flashcards from what we covered in this session.')
        }}
        onSaveSession={() => {
          // Saved state would persist to Supabase in a production version
          alert('Session saved! (connect Supabase to enable persistence)')
        }}
        onExportNotes={() => {
          const text = messages
            .map((m) => `${m.role === 'assistant' ? 'Sage' : 'You'}: ${getMessageText(m)}`)
            .join('\n\n')
          const blob = new Blob([text], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'sat-tutor-session.txt'
          a.click()
          URL.revokeObjectURL(url)
        }}
      />
    </div>
  )
}
