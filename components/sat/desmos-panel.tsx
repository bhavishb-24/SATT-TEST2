'use client'

/**
 * DesmosPanel — a floating, draggable, minimizable/maximizable Desmos
 * scientific calculator. Renders in a fixed overlay so it floats above the
 * question card without pushing layout. Does NOT open a new tab.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  accentBg: string
  accentText: string
}

const DEFAULT_W = 420
const DEFAULT_H = 460
const MIN_W = 300
const MIN_H = 320

type Size = 'normal' | 'minimized' | 'maximized'

export function DesmosPanel({ open, onClose, accentBg, accentText }: Props) {
  const [mounted, setMounted] = useState(false)
  const [size, setSize] = useState<Size>('normal')
  // Position of the top-left corner of the panel
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Dimensions (only used when not maximized)
  const [dims, setDims] = useState({ w: DEFAULT_W, h: DEFAULT_H })

  // drag state stored in refs to avoid re-render on every mousemove
  const dragging = useRef(false)
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 })

  // resize state
  const resizing = useRef(false)
  const resizeStart = useRef({ mx: 0, my: 0, w: 0, h: 0, x: 0, y: 0, edge: '' })

  // Mount lazily on first open
  useEffect(() => {
    if (open && !mounted) {
      setMounted(true)
      // Default position: bottom-right corner with some padding
      setPos({
        x: Math.max(0, window.innerWidth - DEFAULT_W - 24),
        y: Math.max(0, window.innerHeight - DEFAULT_H - 24),
      })
    }
  }, [open, mounted])

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (size === 'maximized') return
    e.preventDefault()
    const panel = panelRef.current
    if (!panel) return
    const rect = panel.getBoundingClientRect()
    dragging.current = true
    dragStart.current = { mx: e.clientX, my: e.clientY, px: rect.left, py: rect.top }

    function onMove(ev: MouseEvent) {
      if (!dragging.current) return
      const dx = ev.clientX - dragStart.current.mx
      const dy = ev.clientY - dragStart.current.my
      const nx = Math.max(0, Math.min(window.innerWidth - MIN_W, dragStart.current.px + dx))
      const ny = Math.max(0, Math.min(window.innerHeight - 48, dragStart.current.py + dy))
      setPos({ x: nx, y: ny })
    }

    function onUp() {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [size])

  // ── Resize handlers ────────────────────────────────────────────────────────

  const onResizeStart = useCallback(
    (e: React.MouseEvent, edge: string) => {
      if (size === 'maximized' || !pos) return
      e.preventDefault()
      e.stopPropagation()
      resizing.current = true
      resizeStart.current = { mx: e.clientX, my: e.clientY, w: dims.w, h: dims.h, x: pos.x, y: pos.y, edge }

      function onMove(ev: MouseEvent) {
        if (!resizing.current || !resizeStart.current) return
        const dx = ev.clientX - resizeStart.current.mx
        const dy = ev.clientY - resizeStart.current.my
        const edge = resizeStart.current.edge

        let newW = resizeStart.current.w
        let newH = resizeStart.current.h
        let newX = resizeStart.current.x
        let newY = resizeStart.current.y

        // Handle horizontal edges
        if (edge.includes('e')) {
          newW = Math.max(MIN_W, resizeStart.current.w + dx)
        }
        if (edge.includes('w')) {
          const potentialW = resizeStart.current.w - dx
          if (potentialW >= MIN_W) {
            newW = potentialW
            newX = resizeStart.current.x + dx
          }
        }

        // Handle vertical edges
        if (edge.includes('s')) {
          newH = Math.max(MIN_H, resizeStart.current.h + dy)
        }
        if (edge.includes('n')) {
          const potentialH = resizeStart.current.h - dy
          if (potentialH >= MIN_H) {
            newH = potentialH
            newY = resizeStart.current.y + dy
          }
        }

        // Constrain position to viewport
        newX = Math.max(0, Math.min(window.innerWidth - MIN_W, newX))
        newY = Math.max(0, Math.min(window.innerHeight - 48, newY))

        setPos({ x: newX, y: newY })
        setDims({ w: newW, h: newH })
      }

      function onUp() {
        resizing.current = false
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [size, pos, dims],
  )

  if (!mounted || !open) return null

  const isMin = size === 'minimized'
  const isMax = size === 'maximized'

  const style: React.CSSProperties = isMax
    ? { position: 'fixed', inset: 16, width: 'auto', height: 'auto', zIndex: 9999 }
    : pos
      ? {
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          width: dims.w,
          height: dims.h,
          zIndex: 9999,
        }
      : { position: 'fixed', bottom: 24, right: 24, width: dims.w, height: dims.h, zIndex: 9999 }

  return (
    <div
      ref={panelRef}
      style={style}
      className={cn(
        'relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl',
        'transition-shadow duration-200',
      )}
      role="dialog"
      aria-label="Desmos calculator"
      aria-modal="false"
    >
      {/* ── Title bar (drag handle) ─────────────────────────────────────── */}
      <div
        onMouseDown={onMouseDown}
        className={cn(
          'flex shrink-0 cursor-grab select-none items-center gap-2 border-b border-border px-3 py-2 active:cursor-grabbing',
          isMax && 'cursor-default',
        )}
      >
        <i className={cn('ti ti-calculator text-base', accentText)} aria-hidden="true" />
        <span className="text-sm font-semibold text-foreground">Calculator</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          Desmos
        </span>

        {/* window controls */}
        <div className="ml-auto flex items-center gap-1">
          {/* Minimize */}
          <button
            type="button"
            onClick={() => setSize((s) => (s === 'minimized' ? 'normal' : 'minimized'))}
            title={isMin ? 'Restore' : 'Minimize'}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={isMin ? 'Restore calculator' : 'Minimize calculator'}
          >
            <i className={cn('ti text-sm', isMin ? 'ti-square' : 'ti-minus')} aria-hidden="true" />
          </button>

          {/* Maximize / restore */}
          <button
            type="button"
            onClick={() => setSize((s) => (s === 'maximized' ? 'normal' : 'maximized'))}
            title={isMax ? 'Restore' : 'Maximize'}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={isMax ? 'Restore calculator' : 'Maximize calculator'}
          >
            <i
              className={cn('ti text-sm', isMax ? 'ti-window-minimize' : 'ti-maximize')}
              aria-hidden="true"
            />
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-100 hover:text-red-600"
            aria-label="Close calculator"
          >
            <i className="ti ti-x text-sm" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ── Resize handles (8 edges) ──────────────────────────────────── */}
      {!isMax && !isMin && (
        <>
          {/* Top-left corner */}
          <div
            onMouseDown={(e) => onResizeStart(e, 'nw')}
            className="absolute left-0 top-0 h-1.5 w-1.5 cursor-nwse-resize hover:bg-primary/50"
            style={{ pointerEvents: 'auto' }}
          />
          {/* Top edge */}
          <div
            onMouseDown={(e) => onResizeStart(e, 'n')}
            className="absolute left-1.5 right-1.5 top-0 h-1 cursor-ns-resize hover:bg-primary/40"
            style={{ pointerEvents: 'auto' }}
          />
          {/* Top-right corner */}
          <div
            onMouseDown={(e) => onResizeStart(e, 'ne')}
            className="absolute right-0 top-0 h-1.5 w-1.5 cursor-nesw-resize hover:bg-primary/50"
            style={{ pointerEvents: 'auto' }}
          />
          {/* Right edge */}
          <div
            onMouseDown={(e) => onResizeStart(e, 'e')}
            className="absolute bottom-1.5 right-0 top-1.5 w-1 cursor-ew-resize hover:bg-primary/40"
            style={{ pointerEvents: 'auto' }}
          />
          {/* Bottom-right corner */}
          <div
            onMouseDown={(e) => onResizeStart(e, 'se')}
            className="absolute bottom-0 right-0 h-1.5 w-1.5 cursor-se-resize hover:bg-primary/50"
            style={{ pointerEvents: 'auto' }}
          />
          {/* Bottom edge */}
          <div
            onMouseDown={(e) => onResizeStart(e, 's')}
            className="absolute bottom-0 left-1.5 right-1.5 h-1 cursor-ns-resize hover:bg-primary/40"
            style={{ pointerEvents: 'auto' }}
          />
          {/* Bottom-left corner */}
          <div
            onMouseDown={(e) => onResizeStart(e, 'sw')}
            className="absolute bottom-0 left-0 h-1.5 w-1.5 cursor-sw-resize hover:bg-primary/50"
            style={{ pointerEvents: 'auto' }}
          />
          {/* Left edge */}
          <div
            onMouseDown={(e) => onResizeStart(e, 'w')}
            className="absolute left-0 top-1.5 bottom-1.5 w-1 cursor-ew-resize hover:bg-primary/40"
            style={{ pointerEvents: 'auto' }}
          />
        </>
      )}

      {/* ── Iframe body (hidden when minimized) ────────────────────────── */}
      {!isMin && (
        <iframe
          title="Desmos scientific calculator"
          src="https://www.desmos.com/scientific"
          className="flex-1 border-0"
          style={{ height: isMax ? '100%' : dims.h - 44 }}
          allow="clipboard-read; clipboard-write"
        />
      )}
    </div>
  )
}
