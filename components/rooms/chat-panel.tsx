'use client'

import { useRef, useEffect, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { cn } from '@/lib/utils'
import type { LivePoll } from '@/lib/room-types'

interface Props {
  poll: LivePoll | null
  roomCode: string
  roomName?: string
  exam?: string
  topic?: string
}

const REACTIONS = ['👍', '💡', '❓', '🔥', '✅']

function getMessageText(msg: { parts?: { type: string; text?: string }[] }): string {
  if (!msg.parts) return ''
  return msg.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

export function ChatPanel({ poll, roomCode, roomName, exam, topic }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  const [input, setInput] = useState('')
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/rooms/chat',
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: { messages, id, roomName, exam, topic },
      }),
    }),
  })

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send() {
    const trimmed = input.trim()
    if (!trimmed || status === 'streaming' || status === 'submitted') return
    sendMessage({ text: trimmed })
    setInput('')
    inputRef.current?.focus()
  }

  const isStreaming = status === 'streaming' || status === 'submitted'

  return (
    <aside className="flex h-full flex-col border-l border-border bg-card">

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
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
      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-3 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
              <i className="ti ti-sparkles text-2xl text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Ask Sage AI anything</p>
              <p className="mt-1 max-w-[200px] text-xs text-muted-foreground text-pretty">
                Type a question below — the AI tutor will answer in real time.
              </p>
            </div>
            {/* Starter prompts */}
            <div className="flex flex-col gap-2 w-full max-w-[220px]">
              {[
                'Explain the quadratic formula',
                'What is the SAT Reading strategy?',
                'Solve: 2x² - 5x + 3 = 0',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => { sendMessage({ text: prompt }); inputRef.current?.focus() }}
                  className="rounded-2xl border border-border bg-background px-3 py-2 text-left text-xs text-muted-foreground transition-all hover:border-primary/30 hover:bg-secondary hover:text-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg: UIMessage) => {
            const isAi   = msg.role === 'assistant'
            const isUser = msg.role === 'user'
            const text   = getMessageText(msg as Parameters<typeof getMessageText>[0])
            if (!text && !isStreaming) return null
            return (
              <div key={msg.id} className={cn('rise-in flex gap-2', isAi && 'flex-row')}>
                <div
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white',
                    isAi ? 'bg-primary' : 'bg-emerald-600',
                  )}
                >
                  {isAi ? 'S' : 'Y'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className={cn('text-xs font-semibold', isAi ? 'text-primary' : 'text-foreground')}>
                      {isAi ? 'Sage AI' : 'You'}
                    </span>
                  </div>
                  <p
                    className={cn(
                      'mt-0.5 rounded-2xl px-3 py-2 text-sm leading-relaxed',
                      isAi
                        ? 'bg-secondary text-foreground'
                        : 'bg-primary text-primary-foreground',
                    )}
                    // Safe: AI output is plain text, bold via ** rendered as <b>
                    dangerouslySetInnerHTML={{
                      __html: text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'),
                    }}
                  />
                </div>
              </div>
            )
          })
        )}

        {/* Streaming indicator when AI is mid-reply */}
        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-bold text-white">
              S
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-primary">Sage AI</span>
              <div className="mt-0.5 flex items-center gap-1 rounded-2xl bg-secondary px-3 py-2">
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Live poll */}
      {poll && poll.options.length > 0 && (
        <div className="shrink-0 border-t border-border px-3 py-3">
          <p className="mb-2 text-xs font-semibold text-foreground">{poll.question}</p>
          <div className="flex flex-col gap-1.5">
            {poll.options.map((opt) => (
              <div
                key={opt.id}
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground"
              >
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
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/50 pl-3 pr-1.5 py-1.5 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask Sage AI a question…"
            disabled={isStreaming}
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
          />
          <button
            onClick={send}
            disabled={!input.trim() || isStreaming}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
          >
            <i className="ti ti-send-2 text-sm" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
          Sage AI answers in real time — ask anything about your exam.
        </p>
      </div>
    </aside>
  )
}
