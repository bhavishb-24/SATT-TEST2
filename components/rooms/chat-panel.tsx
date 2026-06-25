'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { ChatMessage, LivePoll } from '@/lib/room-types'

interface Props {
  messages: ChatMessage[]
  poll: LivePoll | null
}

const REACTIONS = ['👍', '💡', '❓', '🔥', '✅']

const AI_SUGGESTIONS = [
  'Try substitution for this system.',
  'Remember: vertex = −b / 2a',
  'Draw the number line to visualise.',
]

export function ChatPanel({ messages: seedMessages, poll }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages)
  const [input, setInput] = useState('')
  const [votedOption, setVotedOption] = useState<string | null>(null)
  const [pollOptions, setPollOptions] = useState(poll?.options ?? [])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send() {
    const trimmed = input.trim()
    if (!trimmed) return
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        authorId: 'me',
        authorName: 'You',
        authorInitial: 'Y',
        authorColor: 'bg-emerald-600',
        text: trimmed,
        ts: 'just now',
      },
    ])
    setInput('')
  }

  function vote(optionId: string) {
    if (votedOption) return
    setVotedOption(optionId)
    setPollOptions((prev) =>
      prev.map((o) => (o.id === optionId ? { ...o, votes: o.votes + 1 } : o)),
    )
  }

  const totalVotes = pollOptions.reduce((s, o) => s + o.votes, 0)

  return (
    <aside className="flex h-full flex-col border-l border-border bg-card">

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-bold text-foreground">Live chat</p>
        <div className="flex items-center gap-1">
          <button className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-primary">
            <i className="ti ti-pin text-sm" aria-hidden="true" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-primary">
            <i className="ti ti-chart-bar text-sm" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* AI suggestions */}
      <div className="shrink-0 border-b border-border px-3 py-2">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          AI suggestions
        </p>
        <div className="flex flex-col gap-1">
          {AI_SUGGESTIONS.map((s) => (
            <button
              key={s}
              className="flex items-start gap-1.5 rounded-xl px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
            >
              <i className="ti ti-sparkles mt-0.5 shrink-0 text-xs text-primary" aria-hidden="true" />
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5">
        {messages.map((msg) => (
          <div key={msg.id} className={cn('rise-in flex gap-2', msg.isAi && 'flex-row')}>
            <div
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white',
                msg.authorColor,
              )}
            >
              {msg.authorInitial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className={cn('text-xs font-semibold', msg.isAi ? 'text-primary' : 'text-foreground')}>
                  {msg.authorName}
                </span>
                <span className="text-[10px] text-muted-foreground">{msg.ts}</span>
                {msg.pinned && (
                  <i className="ti ti-pin-filled text-[10px] text-primary" title="Pinned" aria-hidden="true" />
                )}
              </div>
              <p className={cn(
                'mt-0.5 rounded-2xl px-3 py-2 text-sm leading-relaxed',
                msg.isAi
                  ? 'bg-secondary text-foreground'
                  : msg.authorId === 'me'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground',
              )}>
                {msg.text}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Live poll */}
      {poll && (
        <div className="shrink-0 border-t border-border px-3 py-3">
          <p className="mb-2 text-xs font-semibold text-foreground">{poll.question}</p>
          <div className="flex flex-col gap-1.5">
            {pollOptions.map((opt) => {
              const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0
              const voted = votedOption === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => vote(opt.id)}
                  disabled={!!votedOption}
                  className={cn(
                    'relative w-full overflow-hidden rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all',
                    voted
                      ? 'border-primary/40 bg-secondary text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground',
                  )}
                >
                  {votedOption && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 rounded-xl bg-primary/8 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  )}
                  <span className="relative flex items-center justify-between">
                    {opt.label}
                    {votedOption && <span className="font-bold text-primary">{pct}%</span>}
                  </span>
                </button>
              )
            })}
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask the room or the AI…"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
          >
            <i className="ti ti-send-2 text-sm" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  )
}
