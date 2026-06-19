'use client'

import { useEffect, useRef, useState } from 'react'

type Phase = 'inhale' | 'hold' | 'exhale' | 'done'

const PHASE_CONFIG: Record<Exclude<Phase, 'done'>, { seconds: number; label: string; next: Phase }> = {
  inhale: { seconds: 4, label: 'Breathe in', next: 'hold' },
  hold: { seconds: 7, label: 'Hold', next: 'exhale' },
  exhale: { seconds: 8, label: 'Breathe out', next: 'inhale' },
}

interface Props {
  cycles?: number
  speak?: (text: string) => void
  onComplete?: () => void
  onSkip?: () => void
  showSkip?: boolean
  completeMessage?: string
}

// Reusable 4-7-8 breathing exercise. Inhale 4s, hold 7s, exhale 8s.
export function BreathingAnimation({
  cycles = 3,
  speak,
  onComplete,
  onSkip,
  showSkip = false,
  completeMessage = 'Good. You did it.',
}: Props) {
  const [phase, setPhase] = useState<Phase>('inhale')
  const [cycle, setCycle] = useState(1)
  const [count, setCount] = useState(PHASE_CONFIG.inhale.seconds)
  const speakRef = useRef(speak)
  const onCompleteRef = useRef(onComplete)
  speakRef.current = speak
  onCompleteRef.current = onComplete

  // Announce each phase when it starts.
  useEffect(() => {
    if (phase === 'done') {
      speakRef.current?.(completeMessage)
      onCompleteRef.current?.()
      return
    }
    const cfg = PHASE_CONFIG[phase]
    speakRef.current?.(`${cfg.label}`)
    setCount(cfg.seconds)
  }, [phase, completeMessage])

  // Per-second countdown driving phase transitions.
  useEffect(() => {
    if (phase === 'done') return
    const timer = setInterval(() => {
      setCount((c) => {
        if (c > 1) return c - 1
        // phase ended -> advance
        const cfg = PHASE_CONFIG[phase]
        if (phase === 'exhale') {
          if (cycle >= cycles) {
            setPhase('done')
          } else {
            setCycle((n) => n + 1)
            setPhase('inhale')
          }
        } else {
          setPhase(cfg.next)
        }
        return c
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [phase, cycle, cycles])

  const scale =
    phase === 'inhale' ? 'scale-100' : phase === 'hold' ? 'scale-100' : 'scale-75'
  const duration =
    phase === 'inhale'
      ? 'duration-[4000ms]'
      : phase === 'exhale'
        ? 'duration-[8000ms]'
        : 'duration-1000'

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="ti ti-circle-check text-5xl text-emerald-500" aria-hidden="true" />
        <p className="text-lg font-semibold">{completeMessage}</p>
      </div>
    )
  }

  const cfg = PHASE_CONFIG[phase]

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Cycle {cycle} of {cycles}
      </p>
      <div className="flex h-56 w-56 items-center justify-center">
        <div
          className={`flex h-48 w-48 items-center justify-center rounded-full bg-blue-500/15 transition-transform ease-in-out ${scale} ${duration}`}
        >
          <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-blue-600 text-white">
            <span className="text-sm font-medium">{cfg.label}</span>
            <span className="text-4xl font-bold tabular-nums">{count}</span>
          </div>
        </div>
      </div>
      {showSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="min-h-[44px] text-sm font-medium text-muted-foreground underline underline-offset-4"
        >
          Skip break
        </button>
      )}
    </div>
  )
}
