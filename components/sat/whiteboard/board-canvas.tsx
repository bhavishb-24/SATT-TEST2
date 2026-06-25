'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { AiDrawing } from './ai-drawing'
import { AiSolution } from './ai-solution'
import type { SolveResult } from './lesson-data'

type Tool = 'pen' | 'highlighter' | 'eraser' | 'laser' | 'text' | 'shape'

interface ToolDef {
  tool: Tool | null
  action?: 'graph' | 'geometry' | 'undo' | 'redo' | 'clear'
  label: string
  icon: string
}

const TOOLS: ToolDef[] = [
  { tool: 'pen', label: 'Pen', icon: 'ti-pencil' },
  { tool: 'highlighter', label: 'Highlighter', icon: 'ti-highlight' },
  { tool: 'shape', label: 'Shapes', icon: 'ti-shape' },
  { tool: null, action: 'graph', label: 'Graph', icon: 'ti-chart-dots' },
  { tool: null, action: 'geometry', label: 'Geometry — ask AI to draw', icon: 'ti-triangle' },
  { tool: 'text', label: 'Text', icon: 'ti-typography' },
  { tool: 'laser', label: 'Laser pointer', icon: 'ti-pointer' },
  { tool: 'eraser', label: 'Eraser', icon: 'ti-eraser' },
]

interface BoardCanvasProps {
  aiStep: number
  isPlaying: boolean
  totalSteps: number
  /** When set, render this live AI solution instead of the demo triangle. */
  solution: SolveResult | null
  /** Whether any lesson has started (controls the playback bar visibility). */
  hasLesson: boolean
  /** "Geometry" tool asks the AI to (re)draw the diagram. */
  onAskAiDraw: () => void
  /** Playback: toggle play/pause of the explanation animation. */
  onTogglePlay: () => void
  /** Playback: jump the board to a specific step index. */
  onStepTo: (step: number) => void
  /** Send the student's drawing (as an image) to the AI for feedback. Null = blank board. */
  onReviewDrawing?: (imageDataUrl: string | null) => void
  /** True while the AI is reviewing the student's drawing. */
  reviewing?: boolean
}

export function BoardCanvas({
  aiStep,
  isPlaying,
  totalSteps,
  solution,
  hasLesson,
  onAskAiDraw,
  onTogglePlay,
  onStepTo,
  onReviewDrawing,
  reviewing,
}: BoardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const drawing = useRef(false)
  const lastPt = useRef<{ x: number; y: number } | null>(null)
  const shapeStart = useRef<{ x: number; y: number } | null>(null)
  const snapshotBeforeShape = useRef<ImageData | null>(null)

  const [tool, setTool] = useState<Tool>('pen')
  const [showGrid, setShowGrid] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [laser, setLaser] = useState<{ x: number; y: number } | null>(null)
  const [textBox, setTextBox] = useState<{ x: number; y: number; cx: number; cy: number } | null>(null)
  const [textValue, setTextValue] = useState('')

  // Undo / redo history of canvas bitmaps.
  const undoStack = useRef<ImageData[]>([])
  const redoStack = useRef<ImageData[]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const syncHistoryFlags = () => {
    setCanUndo(undoStack.current.length > 1)
    setCanRedo(redoStack.current.length > 0)
  }

  const getCtx = () => ctxRef.current

  const snapshot = useCallback(() => {
    const ctx = getCtx()
    const canvas = canvasRef.current
    if (!ctx || !canvas) return
    undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
    if (undoStack.current.length > 40) undoStack.current.shift()
    redoStack.current = []
    syncHistoryFlags()
  }, [])

  // Set up the canvas bitmap at device resolution and keep it sized to the box.
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const setup = () => {
      const rect = wrap.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const prev = ctxRef.current?.getImageData(0, 0, canvas.width, canvas.height)
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.scale(dpr, dpr)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctxRef.current = ctx
      if (prev) ctx.putImageData(prev, 0, 0)
      if (undoStack.current.length === 0) {
        undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
        syncHistoryFlags()
      }
    }

    setup()
    const ro = new ResizeObserver(setup)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  // Map a pointer event to canvas-local CSS pixels (zoom/pan handled by rect).
  const toLocal = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * (canvas.width / (window.devicePixelRatio || 1)),
      y: ((e.clientY - rect.top) / rect.height) * (canvas.height / (window.devicePixelRatio || 1)),
    }
  }

  const strokeStyleFor = (ctx: CanvasRenderingContext2D) => {
    if (tool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = 'rgba(245, 200, 66, 0.4)'
      ctx.lineWidth = 18
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
      ctx.lineWidth = 24
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = 2.5
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (tool === 'laser') return
    const ctx = getCtx()
    if (!ctx) return

    if (tool === 'text') {
      const local = toLocal(e)
      setTextBox({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, cx: local.x, cy: local.y })
      setTextValue('')
      return
    }

    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    drawing.current = true
    const pt = toLocal(e)
    lastPt.current = pt

    if (tool === 'shape') {
      shapeStart.current = pt
      const canvas = canvasRef.current!
      snapshotBeforeShape.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
      return
    }

    strokeStyleFor(ctx)
    ctx.beginPath()
    ctx.moveTo(pt.x, pt.y)
    ctx.lineTo(pt.x + 0.01, pt.y + 0.01)
    ctx.stroke()
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (tool === 'laser') {
      setLaser({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })
      return
    }
    if (!drawing.current) return
    const ctx = getCtx()
    if (!ctx) return
    const pt = toLocal(e)

    if (tool === 'shape') {
      const start = shapeStart.current
      const snap = snapshotBeforeShape.current
      if (!start || !snap) return
      ctx.putImageData(snap, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = 2.5
      ctx.strokeRect(start.x, start.y, pt.x - start.x, pt.y - start.y)
      return
    }

    strokeStyleFor(ctx)
    ctx.beginPath()
    ctx.moveTo(lastPt.current!.x, lastPt.current!.y)
    ctx.lineTo(pt.x, pt.y)
    ctx.stroke()
    lastPt.current = pt
  }

  const endStroke = () => {
    if (!drawing.current) return
    drawing.current = false
    lastPt.current = null
    shapeStart.current = null
    snapshotBeforeShape.current = null
    snapshot()
  }

  const commitText = () => {
    const ctx = getCtx()
    if (ctx && textBox && textValue.trim()) {
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#1a1a1a'
      ctx.font = '600 22px Inter, system-ui, sans-serif'
      ctx.textBaseline = 'top'
      ctx.fillText(textValue, textBox.cx, textBox.cy)
      snapshot()
    }
    setTextBox(null)
    setTextValue('')
  }

  const restore = (data: ImageData | undefined) => {
    const ctx = getCtx()
    if (!ctx || !data) return
    ctx.putImageData(data, 0, 0)
  }

  const undo = () => {
    if (undoStack.current.length <= 1) return
    const current = undoStack.current.pop()!
    redoStack.current.push(current)
    restore(undoStack.current[undoStack.current.length - 1])
    syncHistoryFlags()
  }

  const redo = () => {
    const next = redoStack.current.pop()
    if (!next) return
    undoStack.current.push(next)
    restore(next)
    syncHistoryFlags()
  }

  const clear = () => {
    const ctx = getCtx()
    const canvas = canvasRef.current
    if (!ctx || !canvas) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    snapshot()
  }

  // Flatten the student's drawing onto a white background and export it as an
  // image the vision model can read. Returns null if the board has no ink.
  const captureDrawing = (): string | null => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return null

    // Quick scan for any drawn pixels (sampled for speed).
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let hasInk = false
    for (let i = 3; i < data.length; i += 32) {
      if (data[i] !== 0) {
        hasInk = true
        break
      }
    }
    if (!hasInk) return null

    const out = document.createElement('canvas')
    out.width = canvas.width
    out.height = canvas.height
    const octx = out.getContext('2d')
    if (!octx) return null
    octx.fillStyle = '#ffffff'
    octx.fillRect(0, 0, out.width, out.height)
    octx.drawImage(canvas, 0, 0)
    return out.toDataURL('image/jpeg', 0.82)
  }

  const handleToolClick = (def: ToolDef) => {
    if (def.action === 'graph') return setShowGrid((g) => !g)
    if (def.action === 'geometry') return onAskAiDraw()
    if (def.action === 'undo') return undo()
    if (def.action === 'redo') return redo()
    if (def.action === 'clear') return clear()
    if (def.tool) {
      setTool(def.tool)
      setLaser(null)
    }
  }

  const cursorClass =
    tool === 'laser' ? 'cursor-none' : tool === 'text' ? 'cursor-text' : 'cursor-crosshair'

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {/* Floating toolbar */}
      <div className="no-scrollbar absolute left-1/2 top-4 z-30 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-2xl border border-border bg-card/95 p-1.5 shadow-lg backdrop-blur">
        {TOOLS.map((def) => {
          const active = def.tool && def.tool === tool
          const isGrid = def.action === 'graph' && showGrid
          return (
            <button
              key={def.label}
              type="button"
              title={def.label}
              aria-label={def.label}
              onClick={() => handleToolClick(def)}
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[1.05rem] transition-colors',
                active || isGrid
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <i className={cn('ti', def.icon)} aria-hidden="true" />
            </button>
          )
        })}
        <span className="mx-0.5 h-6 w-px shrink-0 bg-border" aria-hidden="true" />
        <button
          type="button"
          title="Undo"
          aria-label="Undo"
          onClick={undo}
          disabled={!canUndo}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[1.05rem] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
        >
          <i className="ti ti-arrow-back-up" aria-hidden="true" />
        </button>
        <button
          type="button"
          title="Redo"
          aria-label="Redo"
          onClick={redo}
          disabled={!canRedo}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[1.05rem] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
        >
          <i className="ti ti-arrow-forward-up" aria-hidden="true" />
        </button>
        <button
          type="button"
          title="Clear board"
          aria-label="Clear board"
          onClick={clear}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[1.05rem] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <i className="ti ti-trash" aria-hidden="true" />
        </button>
      </div>

      {/* Board surface */}
      <div className="relative flex-1 overflow-hidden rounded-3xl border border-border bg-card">
        <div
          ref={wrapRef}
          className="absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease-out',
          }}
        >
          {/* Grid layer */}
          <div className={cn('absolute inset-0', showGrid && 'board-grid')} aria-hidden="true" />

          {/* AI drawing layer (non-interactive) — live solution or demo triangle */}
          {solution ? (
            <AiSolution
              title={solution.title}
              steps={solution.steps}
              visual={solution.visual}
              diagram={solution.diagram}
              graph={solution.graph}
              annotation={solution.annotation}
              step={aiStep}
              answer={solution.answer}
            />
          ) : (
            <AiDrawing step={aiStep} />
          )}

          {/* Student drawing layer (captures pointer) */}
          <canvas
            ref={canvasRef}
            className={cn('absolute inset-0 h-full w-full touch-none', cursorClass)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endStroke}
            onPointerLeave={() => {
              endStroke()
              if (tool === 'laser') setLaser(null)
            }}
          />

          {/* Laser pointer dot */}
          {tool === 'laser' && laser && (
            <span
              className="pointer-events-none absolute z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive shadow-[0_0_12px_4px_rgba(217,64,64,0.6)]"
              style={{ left: laser.x, top: laser.y }}
              aria-hidden="true"
            />
          )}

          {/* Inline text input */}
          {textBox && (
            <input
              autoFocus
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onBlur={commitText}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitText()
                if (e.key === 'Escape') {
                  setTextBox(null)
                  setTextValue('')
                }
              }}
              placeholder="Type…"
              className="absolute z-20 min-w-[8rem] rounded-md border border-primary/60 bg-card px-2 py-1 text-[22px] font-semibold text-foreground outline-none"
              style={{ left: textBox.x, top: textBox.y }}
            />
          )}
        </div>

        {/* Status pill — top left */}
        <div className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
          <span
            className={cn('h-2 w-2 rounded-full bg-primary', isPlaying && 'status-dot')}
            aria-hidden="true"
          />
          {isPlaying ? 'Tutor is drawing…' : 'Infinite whiteboard'}
        </div>

        {/* Zoom / pan controls — bottom left */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 rounded-xl border border-border bg-card/95 p-1 shadow-sm backdrop-blur">
          <button
            type="button"
            aria-label="Zoom out"
            title="Zoom out"
            onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <i className="ti ti-minus" aria-hidden="true" />
          </button>
          <button
            type="button"
            title="Reset view"
            onClick={() => {
              setZoom(1)
              setPan({ x: 0, y: 0 })
            }}
            className="min-w-[3rem] rounded-lg px-1 text-center text-xs font-semibold tabular-nums text-foreground hover:bg-muted"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            aria-label="Zoom in"
            title="Zoom in"
            onClick={() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <i className="ti ti-plus" aria-hidden="true" />
          </button>
          <span className="mx-0.5 h-5 w-px bg-border" aria-hidden="true" />
          <div className="flex items-center" role="group" aria-label="Pan board">
            <button
              type="button"
              aria-label="Pan left"
              onClick={() => setPan((p) => ({ ...p, x: p.x + 40 }))}
              className="flex h-8 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <i className="ti ti-chevron-left" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Pan right"
              onClick={() => setPan((p) => ({ ...p, x: p.x - 40 }))}
              className="flex h-8 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <i className="ti ti-chevron-right" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Step-by-step playback controls — bottom right (only once a lesson exists) */}
        <div
          className={cn(
            'absolute bottom-4 right-4 z-20 flex items-center gap-1 rounded-xl border border-border bg-card/95 p-1 shadow-lg backdrop-blur transition-opacity',
            hasLesson ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <button
            type="button"
            aria-label="Restart explanation"
            title="Restart"
            onClick={() => onStepTo(0)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <i className="ti ti-player-skip-back" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Previous step"
            title="Previous step"
            onClick={() => onStepTo(aiStep - 1)}
            disabled={aiStep <= 0}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
          >
            <i className="ti ti-player-track-prev" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={isPlaying ? 'Pause explanation' : 'Play explanation'}
            title={isPlaying ? 'Pause' : 'Play'}
            onClick={onTogglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90"
          >
            <i
              className={cn('ti text-lg', isPlaying ? 'ti-player-pause' : 'ti-player-play')}
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            aria-label="Next step"
            title="Next step"
            onClick={() => onStepTo(aiStep + 1)}
            disabled={aiStep >= totalSteps}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
          >
            <i className="ti ti-player-track-next" aria-hidden="true" />
          </button>
          <span className="mx-1 min-w-[2.75rem] text-center text-xs font-semibold tabular-nums text-muted-foreground">
            {aiStep}/{totalSteps}
          </span>
        </div>

        {/* Check my work — bottom center. Sends the student's drawing to the AI. */}
        {onReviewDrawing && hasLesson && (
          <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
            <button
              type="button"
              onClick={() => onReviewDrawing(captureDrawing())}
              disabled={reviewing}
              className="flex items-center gap-2 rounded-xl border border-primary bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-lg transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {reviewing ? (
                <>
                  <i className="ti ti-loader-2 animate-spin text-base" aria-hidden="true" />
                  Reading your work…
                </>
              ) : (
                <>
                  <i className="ti ti-eye-check text-base" aria-hidden="true" />
                  Check my work
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
