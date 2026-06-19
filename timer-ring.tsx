'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  minutes: number
  onComplete: () => void
  accentClass?: string // tailwind text-* color for the ring stroke
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Circular SVG pomodoro timer with start / pause / resume / mark done.
export function TimerRing({ minutes, onComplete, accentClass = 'text-primary' }: Props) {
  const total = Math.max(1, Math.round(minutes * 60))
  const [remaining, setRemaining] = useState(total)
  const [running, setRunning] = useState(false)
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timer)
          if (!completedRef.current) {
            completedRef.current = true
            onCompleteRef.current()
          }
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [running])

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const progress = remaining / total
  const dashoffset = circumference * (1 - progress)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-40 w-40">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="8"
            className="stroke-muted"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            className={`${accentClass} stroke-current transition-[stroke-dashoffset] duration-1000 ease-linear`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums">{fmt(remaining)}</span>
          <span className="text-xs text-muted-foreground">
            {running ? 'focus' : remaining === 0 ? 'done' : 'paused'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {!running && remaining > 0 && (
          <button
            type="button"
            onClick={() => setRunning(true)}
            className="flex min-h-[44px] items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            <span className="ti ti-player-play" aria-hidden="true" />
            {remaining === total ? 'Start' : 'Resume'}
          </button>
        )}
        {running && (
          <button
            type="button"
            onClick={() => setRunning(false)}
            className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border bg-card px-4 text-sm font-semibold"
          >
            <span className="ti ti-player-pause" aria-hidden="true" />
            Pause
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setRunning(false)
            if (!completedRef.current) {
              completedRef.current = true
              setRemaining(0)
              onCompleteRef.current()
            }
          }}
          className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border bg-card px-4 text-sm font-semibold"
        >
          <span className="ti ti-check" aria-hidden="true" />
          Mark done
        </button>
      </div>
    </div>
  )
}
