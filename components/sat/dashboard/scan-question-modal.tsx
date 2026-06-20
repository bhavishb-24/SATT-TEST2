'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { cn } from '@/lib/utils'
import type { PanicTheme } from '@/lib/theme'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ScanQuestionModalProps {
  theme: PanicTheme
}

type Phase = 'upload' | 'chat'

// Demo SAT question — judges can click this to pre-load without a camera
const DEMO_IMAGE_PATH = '/demo-question.png'

export function ScanQuestionModal({ theme }: ScanQuestionModalProps) {
  const [phase, setPhase] = useState<Phase>('upload')
  const [image, setImage] = useState<string | null>(null)
  const [imageCollapsed, setImageCollapsed] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  useEffect(() => {
    if (phase === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [phase])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleRetake() {
    setImage(null)
    fileInputRef.current?.click()
  }

  async function loadDemo() {
    // Fetch the demo image from /public and convert to base64
    try {
      const res = await fetch(DEMO_IMAGE_PATH)
      const blob = await res.blob()
      const reader = new FileReader()
      reader.onload = () => setImage(reader.result as string)
      reader.readAsDataURL(blob)
    } catch {
      // Fallback: use the URL directly (will be a public path, not base64,
      // but the API accepts URLs too via the image field)
      setImage(DEMO_IMAGE_PATH)
    }
  }

  async function startChat(showAnswer = false) {
    if (!image) return
    setPhase('chat')
    await sendToAPI([], showAnswer)
  }

  async function sendMessage() {
    if (!input.trim() || streaming || !image) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    await sendToAPI(nextMessages)
  }

  async function requestAnswer() {
    if (streaming || !image) return
    const userMsg: Message = { role: 'user', content: 'Just show me the full answer and solution.' }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    await sendToAPI(nextMessages, true)
  }

  const sendToAPI = useCallback(
    async (currentMessages: Message[], showAnswer = false) => {
      setStreaming(true)
      setError(null)
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      try {
        const res = await fetch('/api/scan-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image, messages: currentMessages, showAnswer }),
        })

        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `HTTP ${res.status}`)
        }

        if (!res.body) throw new Error('No response body')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let assembled = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          assembled += decoder.decode(value, { stream: true })
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: 'assistant', content: assembled }
            return updated
          })
        }
      } catch (err) {
        const msg = (err as Error).message
        setError(msg)
        setMessages((prev) => prev.slice(0, -1))
      } finally {
        setStreaming(false)
      }
    },
    [image],
  )

  function handleReset() {
    setPhase('upload')
    setImage(null)
    setMessages([])
    setInput('')
    setError(null)
    setImageCollapsed(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Upload phase ──────────────────────────────────────────────────────────
  if (phase === 'upload') {
    return (
      <div className="flex w-full flex-col items-center gap-8 py-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={handleFileChange}
          aria-label="Upload question photo"
        />

        {!image ? (
          <div className="flex w-full max-w-sm flex-col gap-4">
            {/* Primary upload zone */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex w-full flex-col items-center gap-4 rounded-2xl border-2 border-dashed px-6 py-12 transition-colors hover:bg-muted/50',
                theme.accentBorder,
              )}
            >
              <span
                className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-full text-3xl',
                  theme.accentBgSoft,
                  theme.accentText,
                )}
                aria-hidden="true"
              >
                <i className="ti ti-camera" />
              </span>
              <div className="text-center">
                <p className="text-base font-semibold text-foreground">
                  Take a photo or upload an image
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Point your camera at the question you&apos;re stuck on
                </p>
              </div>
            </button>

            {/* Demo shortcut for judges */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or try a demo</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <button
              onClick={loadDemo}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <i className={cn('ti ti-file-text text-base', theme.accentText)} aria-hidden="true" />
              Load demo SAT question
            </button>
          </div>
        ) : (
          /* Preview + confirm */
          <div className="flex w-full max-w-sm flex-col gap-4">
            <div className="overflow-hidden rounded-xl border border-border shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt="Question preview"
                className="max-h-72 w-full object-contain"
              />
            </div>
            <div className="flex w-full gap-3">
              <button
                onClick={handleRetake}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                <i className="ti ti-refresh text-sm" aria-hidden="true" />
                Retake
              </button>
              <button
                onClick={() => startChat()}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90',
                  theme.accentBg,
                )}
              >
                <i className="ti ti-brain text-sm" aria-hidden="true" />
                Help me with this
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Chat phase ─────────────────────────────────────────────────────────────
  return (
    <div className="flex w-full flex-col" style={{ height: 'calc(100dvh - 8rem)' }}>
      {/* Pinned image (collapsible) + new question button */}
      <div className="shrink-0 rounded-xl border border-border bg-card mb-4">
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={() => setImageCollapsed((c) => !c)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <i className="ti ti-photo text-xs" aria-hidden="true" />
            Question image
            <i
              className={cn(
                'ti text-xs transition-transform',
                imageCollapsed ? 'ti-chevron-down' : 'ti-chevron-up',
              )}
              aria-hidden="true"
            />
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            <i className="ti ti-refresh text-xs" aria-hidden="true" />
            New question
          </button>
        </div>
        {!imageCollapsed && image && (
          <div className="px-4 pb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="Question"
              className="max-h-40 w-auto rounded-lg object-contain"
            />
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 pb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex',
                msg.role === 'user' ? 'justify-end' : 'justify-start',
              )}
            >
              {msg.role === 'assistant' && (
                <span
                  className={cn(
                    'mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs text-white',
                    theme.accentBg,
                  )}
                  aria-hidden="true"
                >
                  <i className="ti ti-brain text-xs" />
                </span>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-foreground text-background'
                    : 'rounded-tl-sm bg-card text-foreground shadow-sm',
                  msg.role === 'assistant' && !msg.content && 'min-w-[4rem]',
                )}
              >
                {msg.content ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
                      ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
                      li: ({ children }) => <li>{children}</li>,
                      code: ({ children }) => (
                        <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">{children}</code>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <span className="flex items-center gap-1" aria-label="Thinking">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className={cn('h-1.5 w-1.5 animate-bounce rounded-full', theme.accentBg)}
                        style={{ animationDelay: `${d * 0.15}s` }}
                      />
                    ))}
                  </span>
                )}
              </div>
            </div>
          ))}
          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border bg-background pt-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer or ask a follow-up…"
            rows={1}
            disabled={streaming}
            className="flex-1 resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            style={{ maxHeight: '8rem', overflowY: 'auto' }}
            onInput={(e) => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = `${Math.min(el.scrollHeight, 128)}px`
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || streaming}
            aria-label="Send"
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-opacity disabled:opacity-40',
              theme.accentBg,
            )}
          >
            <i className="ti ti-send-2 text-base" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <button
            onClick={requestAnswer}
            disabled={streaming}
            className="text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground disabled:opacity-40"
          >
            Just show me the answer
          </button>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <i className="ti ti-alert-triangle text-[11px]" aria-hidden="true" />
            AI can make mistakes &mdash; always double-check
          </span>
        </div>
      </div>
    </div>
  )
}
