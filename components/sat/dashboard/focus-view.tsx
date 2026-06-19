'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { PanicTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

interface FocusViewProps {
  theme: PanicTheme
  onSessionComplete: (seconds: number) => void
  speak?: (text: string) => void
  voiceEnabled?: boolean
}

type Mode = 'focus' | 'short' | 'long'

const DURATIONS: Record<Mode, number> = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
}

const MODE_LABELS: Record<Mode, string> = {
  focus: 'Focus',
  short: 'Short break',
  long: 'Long break',
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function FocusView({
  theme,
  onSessionComplete,
  speak,
  voiceEnabled,
}: FocusViewProps) {
  const [mode, setMode] = useState<Mode>('focus')
  const [remaining, setRemaining] = useState(DURATIONS.focus)
  const [running, setRunning] = useState(false)
  const [completedFocus, setCompletedFocus] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = DURATIONS[mode]
  const progress = 1 - remaining / total

  const switchMode = useCallback((next: Mode) => {
    setMode(next)
    setRemaining(DURATIONS[next])
    setRunning(false)
  }, [])

  const handleComplete = useCallback(() => {
    setRunning(false)
    if (mode === 'focus') {
      onSessionComplete(DURATIONS.focus)
      setCompletedFocus((c) => {
        const next = c + 1
        // Every 4th focus block earns a long break.
        const upcoming: Mode = next % 4 === 0 ? 'long' : 'short'
        setMode(upcoming)
        setRemaining(DURATIONS[upcoming])
        return next
      })
      if (voiceEnabled && speak) speak('Great focus block. Time for a short break.')
    } else {
      setMode('focus')
      setRemaining(DURATIONS.focus)
      if (voiceEnabled && speak) speak('Break over. Let us get back to it.')
    }
  }, [mode, onSessionComplete, speak, voiceEnabled])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  useEffect(() => {
    if (remaining === 0 && running) {
      handleComplete()
    }
  }, [remaining, running, handleComplete])

  const radius = 130
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-5 text-center">
        <h2 className="text-xl font-bold text-foreground">Focus Timer</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pomodoro blocks keep your cram session sharp, not frantic.
        </p>
      </div>

      {/* Mode switch */}
      <div className="mb-6 flex justify-center gap-2">
        {(Object.keys(DURATIONS) as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
              mode === m
                ? cn(theme.accentBg, 'text-card border-transparent')
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Ring */}
      <div
        className={cn(
          'relative mx-auto flex h-72 w-72 items-center justify-center',
          mode === 'focus' ? theme.accentText : 'text-blue-500',
        )}
      >
        <svg className="h-full w-full -rotate-90" viewBox="0 0 300 300">
          <circle
            cx="150"
            cy="150"
            r={radius}
            fill="none"
            strokeWidth="14"
            className="stroke-muted-foreground/20"
          />
          <circle
            cx="150"
            cy="150"
            r={radius}
            fill="none"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            stroke="currentColor"
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        <div className={cn('absolute inset-0 flex flex-col items-center justify-center')}>
          <span className="text-5xl font-bold tabular-nums text-foreground">
            {fmt(remaining)}
          </span>
          <span className="mt-1 text-sm text-muted-foreground">{MODE_LABELS[mode]}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className={cn(
            'flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-card transition-opacity hover:opacity-90',
            theme.accentBg,
          )}
        >
          <i className={cn('ti', running ? 'ti-player-pause' : 'ti-player-play')} aria-hidden="true" />
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          type="button"
          onClick={() => switchMode(mode)}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-muted"
        >
          <i className="ti ti-refresh" aria-hidden="true" />
          Reset
        </button>
      </div>

      {/* Session dots */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <span className="text-xs text-muted-foreground">Focus blocks done:</span>
        <div className="flex gap-1">
          {Array.from({ length: Math.max(4, completedFocus) }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-2.5 w-2.5 rounded-full',
                i < completedFocus ? theme.accentBg : 'bg-muted',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
