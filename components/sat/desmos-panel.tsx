'use client'

/**
 * DesmosPanel — a collapsible inline Desmos scientific calculator.
 * Loads the official Desmos embed inside an iframe so no API key is required.
 * The panel slides open/closed within the page — it does NOT open a new tab.
 */

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  accentBg: string
  accentText: string
}

export function DesmosPanel({ open, onClose, accentBg, accentText }: Props) {
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Mount after first open so we only create the iframe once
  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  // Trap focus inside panel when open
  useEffect(() => {
    if (open) {
      panelRef.current?.focus()
    }
  }, [open])

  if (!mounted) return null

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border bg-card shadow-xl transition-all duration-300',
        open ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0',
      )}
      role="region"
      aria-label="Desmos calculator"
      aria-hidden={!open}
      tabIndex={-1}
      ref={panelRef}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <i className={cn('ti ti-calculator text-base', accentText)} aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">Desmos Calculator</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Math only
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close calculator"
        >
          <i className="ti ti-x text-sm" aria-hidden="true" />
        </button>
      </div>

      <iframe
        title="Desmos scientific calculator"
        src="https://www.desmos.com/scientific"
        className="h-[420px] w-full border-0"
        allow="clipboard-read; clipboard-write"
        // Prevent the iframe from inheriting click events that would mess with
        // the SAT keyboard navigation.
        tabIndex={open ? 0 : -1}
      />
    </div>
  )
}
