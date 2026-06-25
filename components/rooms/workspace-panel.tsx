'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { WorkspaceTab, AiStatus } from '@/lib/room-types'

interface Props {
  activeTab: WorkspaceTab
  onTabChange: (t: WorkspaceTab) => void
  aiStatus: AiStatus
  roomName: string
}

const TABS: { id: WorkspaceTab; label: string; icon: string }[] = [
  { id: 'whiteboard', label: 'Whiteboard', icon: 'ti-chalkboard' },
  { id: 'questions',  label: 'Questions',  icon: 'ti-pencil-question' },
  { id: 'flashcards', label: 'Flashcards', icon: 'ti-cards' },
  { id: 'practice',  label: 'Practice',   icon: 'ti-clipboard-check' },
  { id: 'notes',     label: 'Notes',      icon: 'ti-notebook' },
]

// ── Minimal shared whiteboard UI ─────────────────────────────────────────────
// Renders an animated dot-grid canvas with a fake AI stroke illustration,
// live cursor dots, and a toolbar. No actual canvas drawing in this milestone.

interface Cursor {
  id: string
  name: string
  color: string
  x: number
  y: number
}

const SEED_CURSORS: Cursor[] = [
  { id: 'p2', name: 'Priya',  color: '#3b82f6', x: 42, y: 28 },
  { id: 'p1', name: 'Jordan', color: '#10b981', x: 61, y: 55 },
]

function WhiteboardTab({ aiStatus }: { aiStatus: AiStatus }) {
  const [cursors, setCursors] = useState<Cursor[]>(SEED_CURSORS)
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Gently drift the cursor positions for the live feel
  useEffect(() => {
    function drift() {
      setCursors((prev) =>
        prev.map((c) => ({
          ...c,
          x: Math.min(90, Math.max(5, c.x + (Math.random() - 0.5) * 2)),
          y: Math.min(85, Math.max(5, c.y + (Math.random() - 0.5) * 2)),
        })),
      )
      animRef.current = setTimeout(drift, 1200)
    }
    animRef.current = setTimeout(drift, 1200)
    return () => { if (animRef.current) clearTimeout(animRef.current) }
  }, [])

  return (
    <div className="flex h-full flex-col">
      {/* toolbar */}
      <div className="flex shrink-0 items-center gap-1 border-b border-border bg-card px-4 py-2">
        {[
          { icon: 'ti-pencil',     title: 'Draw' },
          { icon: 'ti-highlight',  title: 'Highlight' },
          { icon: 'ti-circle',     title: 'Circle' },
          { icon: 'ti-eraser',     title: 'Erase' },
          { icon: 'ti-text-size',  title: 'Text' },
          { icon: 'ti-arrow-back', title: 'Undo' },
        ].map((tool, i) => (
          <button
            key={tool.title}
            title={tool.title}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors hover:bg-secondary hover:text-primary',
              i === 0 ? 'bg-secondary text-primary' : 'text-muted-foreground',
            )}
          >
            <i className={cn('ti', tool.icon)} aria-hidden="true" />
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">Everyone can draw</span>
          <i className="ti ti-users text-sm text-primary" aria-hidden="true" />
        </div>
      </div>

      {/* board surface */}
      <div className="relative flex-1 overflow-hidden board-grid bg-background/60">

        {/* AI drawing illustration */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 800 480"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          {/* Axis lines */}
          <line x1="120" y1="380" x2="680" y2="380" stroke="#0e8a6a" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <line x1="120" y1="380" x2="120" y2="80" stroke="#0e8a6a" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

          {/* Parabola path */}
          <path
            d="M 160 340 Q 400 30 640 340"
            fill="none"
            stroke="#0e8a6a"
            strokeWidth="2.5"
            strokeLinecap="round"
            pathLength="100"
            className="ai-stroke"
            style={{ strokeDasharray: 100, strokeDashoffset: 0 }}
          />

          {/* Vertex dot */}
          <circle cx="400" cy="56" r="5" fill="#0e8a6a" opacity="0.8" className="ai-ink" />

          {/* Labels */}
          <text x="410" y="52" fontSize="13" fill="#0e8a6a" fontFamily="'Inter', sans-serif" className="ai-ink" opacity="0.9">
            vertex
          </text>
          <text x="690" y="385" fontSize="13" fill="#0e8a6a" fontFamily="'Inter', sans-serif" opacity="0.7">x</text>
          <text x="110" y="75" fontSize="13" fill="#0e8a6a" fontFamily="'Inter', sans-serif" opacity="0.7">y</text>

          {/* Equation label */}
          <text x="460" y="220" fontSize="18" fill="#1a1a1a" fontFamily="'Instrument Serif', serif" fontWeight="bold" opacity="0.85">
            y = ax² + bx + c
          </text>
          <text x="460" y="248" fontSize="13" fill="#6f6f6b" fontFamily="'Inter', sans-serif">
            opens up when a {">"} 0
          </text>

          {/* AI cursor dot */}
          <circle cx="400" cy="56" r="8" fill="none" stroke="#0e8a6a" strokeWidth="1.5" className="ink-pulse" opacity="0.6" />
        </svg>

        {/* Live cursors */}
        {cursors.map((c) => (
          <div
            key={c.id}
            className="pointer-events-none absolute transition-all duration-[1200ms] ease-in-out"
            style={{ left: `${c.x}%`, top: `${c.y}%` }}
          >
            {/* cursor arrow */}
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M1 1 L14 6 L8 8 L6 14 Z" fill={c.color} stroke="white" strokeWidth="1" />
            </svg>
            <span
              className="mt-0.5 block rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
              style={{ background: c.color }}
            >
              {c.name}
            </span>
          </div>
        ))}

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

function QuestionsTab() {
  return (
    <div className="flex h-full flex-col gap-4 p-5 overflow-y-auto">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Group Practice · Question 4 of 10</p>
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="mb-1 text-xs font-medium text-primary">SAT Math · Algebra</p>
        <p className="font-serif text-lg font-bold text-foreground leading-snug">
          If 3x − 7 = 2(x + 5), what is the value of x?
        </p>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {[
            { label: 'A', value: '7' },
            { label: 'B', value: '12' },
            { label: 'C', value: '17' },
            { label: 'D', value: '3' },
          ].map((opt) => (
            <button
              key={opt.label}
              className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-left transition-all hover:border-primary/40 hover:bg-secondary"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs font-bold text-muted-foreground">
                {opt.label}
              </span>
              <span className="text-sm font-medium text-foreground">{opt.value}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <i className="ti ti-clock text-primary" aria-hidden="true" />
          <span className="font-mono font-bold text-foreground tabular-nums">0:42</span>
          <span>remaining</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <i className="ti ti-users text-xs text-primary" aria-hidden="true" />
          3 / 4 answered
        </div>
      </div>
    </div>
  )
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary">
        <i className="ti ti-sparkles text-3xl text-primary" aria-hidden="true" />
      </div>
      <div>
        <p className="font-serif text-xl font-bold text-foreground">{label}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          The AI tutor will populate this when you need it. Start by asking a question in chat.
        </p>
      </div>
    </div>
  )
}

export function WorkspacePanel({ activeTab, onTabChange, aiStatus, roomName }: Props) {
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
        {activeTab === 'questions'  && <QuestionsTab />}
        {activeTab === 'flashcards' && <PlaceholderTab label="Group Flashcards" />}
        {activeTab === 'practice'   && <PlaceholderTab label="Practice Test" />}
        {activeTab === 'notes'      && <PlaceholderTab label="Shared Notes" />}
      </div>
    </div>
  )
}
