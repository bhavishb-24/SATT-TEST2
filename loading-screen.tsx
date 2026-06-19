'use client'

import { useEffect, useState } from 'react'

const MESSAGES = [
  'Reading your weak spots...',
  'Calculating highest-yield topics...',
  'Building your time-block schedule...',
  'Adding immediate action steps...',
  'Preparing your voice coach...',
  'Setting up your anxiety toolkit...',
  'Your plan is almost ready...',
]

export function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const duration = 8000
    const tick = setInterval(() => {
      const elapsed = Date.now() - start
      setProgress(Math.min(100, (elapsed / duration) * 100))
    }, 80)
    const msgTimer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length)
    }, 1500)
    return () => {
      clearInterval(tick)
      clearInterval(msgTimer)
    }
  }, [])

  return (
    <main className="animate-fade-in flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <div className="flex w-full max-w-lg flex-col items-center gap-8 rounded-2xl border border-border bg-card p-8 lg:p-12">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-30" />
          <span className="absolute inline-flex h-16 w-16 rounded-full bg-primary/15" />
          <span
            className="ti ti-heartbeat relative text-4xl text-primary"
            aria-hidden="true"
          />
        </div>

        <div className="w-full">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p
          key={msgIndex}
          className="animate-fade-in min-h-[1.5rem] text-sm font-medium text-muted-foreground"
        >
          {MESSAGES[msgIndex]}
        </p>

        <p className="text-lg font-bold">Your coach is building your plan</p>
      </div>
    </main>
  )
}
