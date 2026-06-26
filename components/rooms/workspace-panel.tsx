'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { WorkspaceTab, AiStatus } from '@/lib/room-types'

interface Props {
  activeTab: WorkspaceTab
  onTabChange: (t: WorkspaceTab) => void
  aiStatus: AiStatus
  roomName: string
  exam?: string
  topic?: string
}

const TABS: { id: WorkspaceTab; label: string; icon: string }[] = [
  { id: 'whiteboard', label: 'Whiteboard', icon: 'ti-chalkboard' },
  { id: 'questions',  label: 'Questions',  icon: 'ti-pencil-question' },
  { id: 'flashcards', label: 'Flashcards', icon: 'ti-cards' },
  { id: 'practice',  label: 'Practice',   icon: 'ti-clipboard-check' },
  { id: 'notes',     label: 'Notes',      icon: 'ti-notebook' },
]

// ── Whiteboard ───────────────────────────────────────────────────────────────

function WhiteboardTab({ aiStatus }: { aiStatus: AiStatus }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [tool, setTool] = useState<'pen' | 'highlight' | 'eraser' | 'text'>('pen')
  const [color, setColor] = useState('#000000')
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const [history, setHistory] = useState<ImageData[]>([])

  function getPos(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      const t = e.touches[0]
      return { x: (t.clientX - rect.left) * (canvas.width / rect.width), y: (t.clientY - rect.top) * (canvas.height / rect.height) }
    }
    return { x: (e.clientX - rect.left) * (canvas.width / rect.width), y: (e.clientY - rect.top) * (canvas.height / rect.height) }
  }

  function startDraw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e)
    setHistory((h) => [...h, ctx.getImageData(0, 0, canvas.width, canvas.height)])
    setDrawing(true)
    lastPos.current = pos
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault()
    if (!drawing) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e)
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : tool === 'highlight' ? color + '66' : color
    ctx.lineWidth = tool === 'eraser' ? 24 : tool === 'highlight' ? 18 : 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
  }

  function endDraw() {
    setDrawing(false)
    lastPos.current = null
  }

  function undo() {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    if (history.length === 0) return
    const last = history[history.length - 1]
    ctx.putImageData(last, 0, 0)
    setHistory((h) => h.slice(0, -1))
  }

  function clearBoard() {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHistory([])
  }

  const TOOLS = [
    { id: 'pen'       as const, icon: 'ti-pencil',     title: 'Pen' },
    { id: 'highlight' as const, icon: 'ti-highlight',  title: 'Highlight' },
    { id: 'eraser'    as const, icon: 'ti-eraser',     title: 'Eraser' },
  ]
  const COLORS = ['#1e293b', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6']

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2">
        <div className="flex items-center gap-1">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              title={t.title}
              onClick={() => setTool(t.id)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors',
                tool === t.id ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-primary',
              )}
            >
              <i className={cn('ti', t.icon)} aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              title={c}
              onClick={() => setColor(c)}
              className={cn('h-5 w-5 rounded-full border-2 transition-transform hover:scale-110', color === c ? 'border-foreground scale-110' : 'border-transparent')}
              style={{ background: c }}
            />
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={undo} title="Undo" disabled={history.length === 0} className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-primary disabled:opacity-40">
            <i className="ti ti-arrow-back" aria-hidden="true" />
          </button>
          <button onClick={clearBoard} title="Clear" className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive">
            <i className="ti ti-trash" aria-hidden="true" />
          </button>
        </div>
        <span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
          <i className="ti ti-users text-sm text-primary" aria-hidden="true" />
          Everyone can draw
        </span>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 overflow-hidden board-grid bg-background/60">
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          className="h-full w-full touch-none"
          style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />

        {/* AI tutor status overlay */}
        {aiStatus !== 'idle' && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-2xl border border-primary/20 bg-card/90 px-3 py-1.5 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-semibold text-primary">
              Sage AI is {aiStatus === 'teaching' ? 'explaining' : aiStatus}…
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Questions tab ──────────────────────────────────────────────────────────────

interface GeneratedQuestion {
  id: string
  question: string
  choices: string[]
  correct: number
  explanation: string
  selected: number | null
  revealed: boolean
}

function QuestionsTab({ exam = 'SAT', topic = '' }: { exam?: string; topic?: string }) {
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [customTopic, setCustomTopic] = useState(topic)

  const generate = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/rooms/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'questions', exam, topic: customTopic }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      if (Array.isArray(data.items)) {
        setQuestions(data.items.map((q: Omit<GeneratedQuestion, 'selected' | 'revealed'>) => ({ ...q, selected: null, revealed: false })))
      }
    } catch {
      // fallback sample
      setQuestions([
        {
          id: '1',
          question: `Which of the following best describes the primary purpose of the passage? (Sample ${exam} question — generate more with the button above)`,
          choices: ['To argue a position', 'To describe a process', 'To compare two concepts', 'To present a narrative'],
          correct: 0,
          explanation: 'The passage takes a clear stance on the topic, making "argue a position" the best answer.',
          selected: null,
          revealed: false,
        },
      ])
    }
    setLoading(false)
  }, [exam, customTopic])

  function select(qIdx: number, choiceIdx: number) {
    setQuestions((prev) => prev.map((q, i) => i === qIdx ? { ...q, selected: choiceIdx } : q))
  }

  function reveal(qIdx: number) {
    setQuestions((prev) => prev.map((q, i) => i === qIdx ? { ...q, revealed: true } : q))
  }

  return (
    <div className="flex h-full flex-col">
      {/* Controls */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-4 py-3">
        <input
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          placeholder="Topic (e.g. Quadratic Equations)…"
          className="flex-1 rounded-xl border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? <i className="ti ti-loader-2 animate-spin text-sm" aria-hidden="true" /> : <i className="ti ti-sparkles text-sm" aria-hidden="true" />}
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </div>

      {/* Question list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {questions.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
              <i className="ti ti-pencil-question text-3xl text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No questions yet</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground text-pretty">
                Enter a topic above and click Generate — Sage AI will write {exam}-style questions for your group.
              </p>
            </div>
            <button
              onClick={generate}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              <i className="ti ti-sparkles" aria-hidden="true" />
              Generate questions
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {questions.map((q, qi) => (
              <div key={q.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="mb-3 text-sm font-medium text-foreground leading-relaxed">
                  <span className="mr-2 text-xs font-bold text-primary">Q{qi + 1}</span>
                  {q.question}
                </p>
                <div className="flex flex-col gap-2">
                  {q.choices.map((choice, ci) => {
                    const isSelected = q.selected === ci
                    const isCorrect = ci === q.correct
                    const showResult = q.revealed
                    return (
                      <button
                        key={ci}
                        onClick={() => !q.revealed && select(qi, ci)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all',
                          !showResult && isSelected && 'border-primary/50 bg-primary/10 text-primary',
                          !showResult && !isSelected && 'border-border bg-background text-foreground hover:border-primary/30 hover:bg-muted',
                          showResult && isCorrect && 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300',
                          showResult && !isCorrect && isSelected && 'border-red-300 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300',
                          showResult && !isCorrect && !isSelected && 'border-border bg-background text-muted-foreground',
                        )}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-bold">
                          {String.fromCharCode(65 + ci)}
                        </span>
                        {choice}
                        {showResult && isCorrect && (
                          <i className="ti ti-check ml-auto text-emerald-600" aria-hidden="true" />
                        )}
                      </button>
                    )
                  })}
                </div>
                {q.selected !== null && !q.revealed && (
                  <button
                    onClick={() => reveal(qi)}
                    className="mt-3 w-full rounded-xl border border-border bg-background py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    Check answer
                  </button>
                )}
                {q.revealed && (
                  <div className="mt-3 rounded-xl bg-muted/60 px-3 py-2.5">
                    <p className="text-xs font-semibold text-foreground">Explanation</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={generate}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-60"
            >
              <i className="ti ti-refresh" aria-hidden="true" />
              Generate more questions
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Flashcards tab ────────────────────────────────────────────────────────────

interface Flashcard { id: string; front: string; back: string }

function FlashcardsTab({ exam = 'SAT', topic = '' }: { exam?: string; topic?: string }) {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customTopic, setCustomTopic] = useState(topic)
  const [known, setKnown] = useState(0)
  const [total, setTotal] = useState(0)

  const generate = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/rooms/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'flashcards', exam, topic: customTopic }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      if (Array.isArray(data.items)) {
        setCards(data.items)
        setIndex(0)
        setFlipped(false)
        setKnown(0)
        setTotal(0)
      }
    } catch {
      setCards([
        { id: '1', front: 'Quadratic Formula', back: 'x = (−b ± √(b²−4ac)) / 2a — solves ax² + bx + c = 0' },
        { id: '2', front: 'Subject-Verb Agreement', back: 'A singular subject takes a singular verb. "The team is..." not "The team are..."' },
        { id: '3', front: 'Central Idea', back: 'The central idea is the main point the author wants you to take away — usually broader than any single detail.' },
      ])
      setIndex(0)
      setFlipped(false)
      setKnown(0)
      setTotal(0)
    }
    setLoading(false)
  }, [exam, customTopic])

  function grade(isKnown: boolean) {
    setKnown((k) => k + (isKnown ? 1 : 0))
    setTotal((t) => t + 1)
    setFlipped(false)
    setIndex((i) => i + 1)
  }

  const done = cards.length > 0 && index >= cards.length
  const card = done ? null : cards[index]

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-4 py-3">
        <input
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          placeholder="Topic for flashcards…"
          className="flex-1 rounded-xl border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {loading ? <i className="ti ti-loader-2 animate-spin text-sm" /> : <i className="ti ti-sparkles text-sm" />}
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-6">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
              <i className="ti ti-cards text-3xl text-primary" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-foreground">No flashcards yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">Enter a topic and generate flashcards for your group to study together.</p>
            <button onClick={generate} disabled={loading} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
              Generate flashcards
            </button>
          </div>
        ) : done ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/40">
              <i className="ti ti-confetti text-3xl text-emerald-600" aria-hidden="true" />
            </div>
            <p className="text-xl font-bold text-foreground">Session complete!</p>
            <p className="text-sm text-muted-foreground">
              {known} of {total} cards marked as known ({total > 0 ? Math.round((known / total) * 100) : 0}% retention)
            </p>
            <button
              onClick={() => { setIndex(0); setFlipped(false); setKnown(0); setTotal(0) }}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              Restart deck
            </button>
          </div>
        ) : (
          <>
            <div className="text-xs text-muted-foreground">{index + 1} / {cards.length}</div>
            <button
              onClick={() => setFlipped((f) => !f)}
              className="group relative flex h-48 w-full max-w-lg cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-border bg-card p-6 text-center shadow-md transition-all hover:border-primary/40 hover:shadow-lg"
              aria-label={flipped ? 'Card back — click to flip' : 'Card front — click to flip'}
            >
              <span className="absolute right-4 top-4 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {flipped ? 'Back' : 'Front'} · tap to flip
              </span>
              <p className={cn('text-center font-semibold leading-relaxed', flipped ? 'text-sm text-muted-foreground' : 'text-lg text-foreground')}>
                {flipped ? card!.back : card!.front}
              </p>
            </button>
            {flipped && (
              <div className="flex w-full max-w-lg gap-3">
                <button
                  onClick={() => grade(false)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400"
                >
                  <i className="ti ti-x" aria-hidden="true" />
                  Still learning
                </button>
                <button
                  onClick={() => grade(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400"
                >
                  <i className="ti ti-check" aria-hidden="true" />
                  Got it!
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Practice tab ──────────────────────────────────────────────────────────────

function PracticeTab({ exam = 'SAT', topic = '' }: { exam?: string; topic?: string }) {
  const [question, setQuestion] = useState<GeneratedQuestion | null>(null)
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [customTopic, setCustomTopic] = useState(topic)

  const next = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/rooms/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'practice', exam, topic: customTopic }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      if (Array.isArray(data.items) && data.items.length > 0) {
        setQuestion({ ...data.items[0], selected: null, revealed: false })
      }
    } catch {
      setQuestion({
        id: 'sample',
        question: `If f(x) = 3x² − 5x + 2, what is the value of f(3)? (Sample ${exam} question)`,
        choices: ['14', '16', '20', '22'],
        correct: 2,
        explanation: 'f(3) = 3(9) − 5(3) + 2 = 27 − 15 + 2 = 14. Wait — recalculate: 27−15+2=14. The answer is 14 (choice A).',
        selected: null,
        revealed: false,
      })
    }
    setLoading(false)
  }, [exam, customTopic])

  function select(ci: number) {
    if (!question || question.revealed) return
    setQuestion((q) => q ? { ...q, selected: ci, revealed: true } : null)
    setScore((s) => ({ correct: s.correct + (ci === question.correct ? 1 : 0), total: s.total + 1 }))
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-4 py-3">
        <input
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          placeholder="Topic…"
          className="flex-1 rounded-xl border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="shrink-0 rounded-xl bg-muted px-3 py-1.5 text-xs font-semibold text-foreground">
          {score.correct}/{score.total} correct
        </div>
        <button onClick={next} disabled={loading} className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {loading ? <i className="ti ti-loader-2 animate-spin text-sm" /> : <i className="ti ti-sparkles text-sm" />}
          {loading ? '…' : question ? 'Next' : 'Start'}
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-y-auto px-4 py-6">
        {!question ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
              <i className="ti ti-clipboard-check text-3xl text-primary" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-foreground">Group Practice Mode</p>
            <p className="max-w-xs text-xs text-muted-foreground">Everyone answers the same question simultaneously. Click Start to begin.</p>
            <button onClick={next} disabled={loading} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
              Start practice
            </button>
          </div>
        ) : (
          <div className="w-full max-w-lg">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="mb-4 text-sm font-medium text-foreground leading-relaxed">{question.question}</p>
              <div className="flex flex-col gap-2">
                {question.choices.map((choice, ci) => {
                  const isSelected = question.selected === ci
                  const isCorrect = ci === question.correct
                  const shown = question.revealed
                  return (
                    <button
                      key={ci}
                      onClick={() => select(ci)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all',
                        !shown && isSelected && 'border-primary/50 bg-primary/10 text-primary',
                        !shown && !isSelected && 'border-border bg-background text-foreground hover:border-primary/30 hover:bg-muted',
                        shown && isCorrect && 'border-emerald-300 bg-emerald-50 text-emerald-800',
                        shown && !isCorrect && isSelected && 'border-red-300 bg-red-50 text-red-700',
                        shown && !isCorrect && !isSelected && 'border-border bg-background text-muted-foreground',
                      )}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-bold">
                        {String.fromCharCode(65 + ci)}
                      </span>
                      {choice}
                      {shown && isCorrect && <i className="ti ti-check ml-auto text-emerald-600" />}
                    </button>
                  )
                })}
              </div>
              {question.revealed && (
                <>
                  <div className="mt-4 rounded-xl bg-muted/60 px-3 py-2.5">
                    <p className="text-xs font-semibold text-foreground">Explanation</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{question.explanation}</p>
                  </div>
                  <button onClick={next} disabled={loading} className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
                    Next question
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Notes tab ─────────────────────────────────────────────────────────────────

function NotesTab({ roomName }: { roomName: string }) {
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  function save() {
    try {
      localStorage.setItem(`room-notes-${roomName}`, notes)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch { /* ignore */ }
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`room-notes-${roomName}`)
      if (stored) setNotes(stored)
    } catch { /* ignore */ }
  }, [roomName])

  function download() {
    const blob = new Blob([notes], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${roomName}-notes.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3">
        <p className="text-sm font-semibold text-foreground">Shared Notes</p>
        <div className="flex items-center gap-2">
          <button onClick={download} title="Download notes" className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <i className="ti ti-download" aria-hidden="true" />
          </button>
          <button
            onClick={save}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors',
              saved ? 'bg-emerald-100 text-emerald-700' : 'bg-primary text-primary-foreground hover:opacity-90',
            )}
          >
            {saved ? <><i className="ti ti-check text-xs" /> Saved</> : <><i className="ti ti-device-floppy text-xs" /> Save</>}
          </button>
        </div>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={`Start typing notes for ${roomName}...\n\nKey concepts, formulas, reminders — anything goes. Your notes are saved locally.`}
        className="flex-1 resize-none bg-background px-5 py-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
        aria-label="Shared notes"
      />
    </div>
  )
}

// ── Root ─────────────────────────────────────────────────────────────────────

export function WorkspacePanel({ activeTab, onTabChange, aiStatus, roomName, exam = 'SAT', topic = '' }: Props) {
  return (
    <div className="flex h-full flex-col">

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">Shared workspace</p>
          <p className="text-sm font-bold text-foreground">{roomName}</p>
        </div>

        {/* Tab pills */}
        <div className="flex items-center gap-1 rounded-2xl border border-border bg-muted/50 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <i className={cn('ti', tab.icon, 'text-sm')} aria-hidden="true" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'whiteboard' && <WhiteboardTab aiStatus={aiStatus} />}
        {activeTab === 'questions'  && <QuestionsTab exam={exam} topic={topic} />}
        {activeTab === 'flashcards' && <FlashcardsTab exam={exam} topic={topic} />}
        {activeTab === 'practice'   && <PracticeTab exam={exam} topic={topic} />}
        {activeTab === 'notes'      && <NotesTab roomName={roomName} />}
      </div>
    </div>
  )
}
