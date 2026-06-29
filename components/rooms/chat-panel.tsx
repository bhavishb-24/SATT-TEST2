'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { cn } from '@/lib/utils'
import type { LivePoll } from '@/lib/room-types'

interface Props {
  poll:      LivePoll | null
  roomCode:  string
  roomName?: string
  exam?:     string
  topic?:    string
  username?: string
}

const REACTIONS = ['👍', '💡', '❓', '🔥', '✅']

const STARTER_PROMPTS = [
  'Explain the quadratic formula',
  'What is the SAT Reading strategy?',
  'Solve: 2x² − 5x + 3 = 0',
]

/**
 * Render AI output: supports LaTeX \\(...\\) inline and \\[...\\] display,
 * **bold**, numbered steps, and plain newlines.
 */
function renderText(text: string): { __html: string } {
  const DISPLAY_RE = /\\\[([\s\S]+?)\\\]/g
  const INLINE_RE  = /\\\((.+?)\\\)/gs

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

  const parts = tokens2.map((tok) => {
    if (tok.type === 'display') {
      try {
        return `<div style="overflow-x:auto;padding:4px 0">${katex.renderToString(tok.content.trim(), { displayMode: true, throwOnError: false })}</div>`
      } catch { return `<code>${tok.content}</code>` }
    }
    if (tok.type === 'inline') {
      try {
        return katex.renderToString(tok.content.trim(), { displayMode: false, throwOnError: false })
      } catch { return `<code>${tok.content}</code>` }
    }
    return tok.content
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^(\d+)\.\s+(.+)$/gm,
        '<div style="display:flex;gap:6px;margin-top:4px"><span style="font-weight:700;flex-shrink:0">$1.</span><span>$2</span></div>')
      .replace(/\n/g, '<br />')
  })

  return { __html: parts.join('') }
}

export function ChatPanel({
  poll,
  roomCode,
  roomName,
  exam,
  topic,
  username = 'you',
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')

  // useChat with DefaultChatTransport handles AI SDK v6 SSE stream decoding correctly.
  // We pass extra room context via prepareSendMessagesRequest so the API knows
  // which room/exam/topic to use.
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/rooms/chat',
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          // The API expects { messages, roomName, exam, topic }
          // We pass the full message history plus room context.
          messages: messages.map((m) => ({
            role: m.role,
            content: m.parts
              ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
              .map((p) => p.text)
              .join('') ?? '',
          })),
          roomName,
          exam,
          topic,
        },
      }),
    }),
  })

  const isStreaming = status === 'streaming' || status === 'submitted'

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handle = username.replace(/\s+/g, '').toLowerCase()

  const send = useCallback((text?: string) => {
    const trimmed = (text ?? inputValue).trim()
    if (!trimmed || isStreaming) return
    if (!text) setInputValue('')
    sendMessage({ text: trimmed })
  }, [inputValue, isStreaming, sendMessage])

  return (
    <aside className="flex h-full flex-col border-l border-border bg-card">

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-[11px] font-bold text-primary-foreground">
            S
          </div>
          <p className="text-sm font-bold text-foreground">Sage AI Chat</p>
          {isStreaming && (
            <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              Thinking
            </span>
          )}
        </div>
        <button
          title="Copy room code"
          onClick={() => navigator.clipboard.writeText(roomCode).catch(() => {})}
          className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[11px] font-bold text-primary transition-colors hover:bg-secondary"
        >
          {roomCode}
        </button>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
              <i className="ti ti-sparkles text-2xl text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Ask @SageAI anything</p>
              <p className="mt-1 max-w-[200px] text-xs text-muted-foreground text-pretty">
                Type a question below and Sage AI will answer in real time.
              </p>
            </div>
            <div className="flex w-full max-w-[220px] flex-col gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => send(prompt)}
                  className="rounded-2xl border border-border bg-background px-3 py-2 text-left text-xs text-muted-foreground transition-all hover:border-primary/30 hover:bg-secondary hover:text-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isAI = msg.role === 'assistant'
            // Extract text content from parts array (AI SDK v6 UIMessage format)
            const textContent = msg.parts
              ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
              .map((p) => p.text)
              .join('') ?? ''

            // Streaming placeholder — show typing dots when content is empty
            if (isAI && !textContent && isStreaming) {
              return (
                <div key={msg.id} className="flex gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary text-[11px] font-bold text-primary-foreground">
                    S
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-0.5 text-[11px] font-semibold text-primary">@SageAI</p>
                    <div className="flex items-center gap-1 rounded-2xl bg-secondary px-3 py-2.5">
                      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/70" />
                      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/70" />
                      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/70" />
                    </div>
                  </div>
                </div>
              )
            }

            if (!textContent) return null

            return (
              <div key={msg.id} className="flex gap-2.5">
                <div
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold',
                    isAI ? 'bg-primary text-primary-foreground' : 'bg-emerald-600 text-white',
                  )}
                  aria-hidden="true"
                >
                  {isAI ? 'S' : handle.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    'mb-0.5 text-[11px] font-semibold',
                    isAI ? 'text-primary' : 'text-muted-foreground',
                  )}>
                    {isAI ? '@SageAI' : `@${handle}`}
                  </p>
                  <div
                    className={cn(
                      'rounded-2xl px-3 py-2 text-sm leading-relaxed',
                      isAI
                        ? 'bg-secondary text-foreground'
                        : 'bg-primary text-primary-foreground',
                    )}
                    // User messages are plain text; only AI messages get HTML rendering
                    {...(isAI
                      ? { dangerouslySetInnerHTML: renderText(textContent) }
                      : {}
                    )}
                  >
                    {!isAI && textContent}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Live poll */}
      {poll && poll.options.length > 0 && (
        <div className="shrink-0 border-t border-border px-3 py-3">
          <p className="mb-2 text-xs font-semibold text-foreground">{poll.question}</p>
          <div className="flex flex-col gap-1.5">
            {poll.options.map((opt) => (
              <div key={opt.id} className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground">
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reactions */}
      <div className="flex shrink-0 items-center gap-1 border-t border-border px-3 py-2">
        {REACTIONS.map((r) => (
          <button
            key={r}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-base transition-all hover:scale-125"
            aria-label={`React with ${r}`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border px-3 pb-3 pt-2">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/50 py-1.5 pl-3 pr-1.5 transition-shadow focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
            }}
            placeholder="Ask @SageAI a question…"
            disabled={isStreaming}
            aria-label="Chat input"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
          />
          <button
            onClick={() => send()}
            disabled={!inputValue.trim() || isStreaming}
            title="Send"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40 hover:opacity-90"
          >
            <i className="ti ti-send-2 text-sm" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
          Sage AI answers live. Ask anything about {exam ?? 'your exam'}.
        </p>
      </div>
    </aside>
  )
}
