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

  // drag state stored in refs to avoid re-render on every mousemove
  const dragging = useRef(false)
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 })

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
          width: DEFAULT_W,
          zIndex: 9999,
        }
      : { position: 'fixed', bottom: 24, right: 24, width: DEFAULT_W, zIndex: 9999 }

  return (
    <div
      ref={panelRef}
      style={style}
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl',
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

      {/* ── Iframe body (hidden when minimized) ────────────────────────── */}
      {!isMin && (
        <iframe
          title="Desmos scientific calculator"
          src="https://www.desmos.com/scientific"
          className="flex-1 border-0"
          style={{ height: isMax ? '100%' : DEFAULT_H }}
          allow="clipboard-read; clipboard-write"
        />
      )}
    </div>
  )
}
