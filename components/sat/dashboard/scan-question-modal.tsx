'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { PanicTheme } from '@/lib/theme'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ScanQuestionModalProps {
  theme: PanicTheme
  onClose: () => void
}

type Phase = 'upload' | 'chat'

export function ScanQuestionModal({ theme, onClose }: ScanQuestionModalProps) {
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

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  // Focus input when chat phase begins
  useEffect(() => {
    if (phase === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [phase])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result as string)
    reader.readAsDataURL(file)
    // Reset value so the same file can be re-selected after retake
    e.target.value = ''
  }

  function handleRetake() {
    setImage(null)
    fileInputRef.current?.click()
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
    // Add a synthetic user message so the history is coherent
    const userMsg: Message = { role: 'user', content: 'Just show me the full answer and solution.' }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    await sendToAPI(nextMessages, true)
  }

  const sendToAPI = useCallback(
    async (currentMessages: Message[], showAnswer = false) => {
      setStreaming(true)
      setError(null)

      // Optimistically add an empty assistant message that we'll stream into
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      try {
        const res = await fetch('/api/scan-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image,
            messages: currentMessages,
            showAnswer,
          }),
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
        // Remove the empty assistant placeholder on error
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

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-label="Scan a question"
    >
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <i className={cn('ti ti-camera text-lg', theme.accentText)} aria-hidden="true" />
          <span className="font-semibold text-foreground">Stuck? Scan it</span>
        </div>
        <div className="flex items-center gap-2">
          {phase === 'chat' && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              <i className="ti ti-refresh text-sm" aria-hidden="true" />
              New question
            </button>
          )}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <i className="ti ti-x text-lg" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Upload phase */}
      {phase === 'upload' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
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
            /* Drop zone */
            <div className="flex w-full max-w-sm flex-col items-center gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 transition-colors',
                  theme.accentBorder,
                  'hover:bg-muted/50',
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
                <p className="text-center text-base font-medium text-foreground">
                  Take a photo or upload an image
                </p>
                <p className="text-center text-sm text-muted-foreground">
                  Point your camera at the question you&apos;re stuck on
                </p>
              </button>
            </div>
          ) : (
            /* Preview + confirm */
            <div className="flex w-full max-w-sm flex-col items-center gap-4">
              <div className="overflow-hidden rounded-xl border border-border">
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
                  <i className="ti ti-check text-sm" aria-hidden="true" />
                  This is my question
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat phase */}
      {phase === 'chat' && (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Pinned image (collapsible) */}
          {image && (
            <div className="shrink-0 border-b border-border bg-card">
              <button
                onClick={() => setImageCollapsed((c) => !c)}
                className="flex w-full items-center justify-between px-4 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/50 sm:px-6"
              >
                <span className="flex items-center gap-1.5">
                  <i className="ti ti-photo text-xs" aria-hidden="true" />
                  Question image
                </span>
                <i
                  className={cn(
                    'ti text-xs transition-transform',
                    imageCollapsed ? 'ti-chevron-down' : 'ti-chevron-up',
                  )}
                  aria-hidden="true"
                />
              </button>
              {!imageCollapsed && (
                <div className="px-4 pb-3 sm:px-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt="Question"
                    className="max-h-40 w-auto rounded-lg object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            <div className="mx-auto flex max-w-2xl flex-col gap-4">
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
                        'mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
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
                      msg.content.split('\n').map((line, j) => (
                        <span key={j}>
                          {line}
                          {j < msg.content.split('\n').length - 1 && <br />}
                        </span>
                      ))
                    ) : (
                      /* Typing indicator */
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

          {/* Input area */}
          <div className="shrink-0 border-t border-border bg-card px-4 py-3 sm:px-6">
            <div className="mx-auto max-w-2xl">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer or question…"
                  rows={1}
                  disabled={streaming}
                  className="flex-1 resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
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
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-opacity',
                    theme.accentBg,
                    'text-white disabled:opacity-40',
                  )}
                >
                  <i className="ti ti-send-2 text-base" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-2 text-center">
                <button
                  onClick={requestAnswer}
                  disabled={streaming}
                  className="text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground disabled:opacity-40"
                >
                  Just show me the answer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
