'use client'

import { useEffect, useState } from 'react'
import { formatCountdown, nextOccurrence } from '@/lib/time-utils'

interface Props {
  sleepDeadlineMinutes: number
  wakeUpLabel: string
  sleepLabel: string
}

export function SleepBanner({ sleepDeadlineMinutes, wakeUpLabel, sleepLabel }: Props) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!now) {
    return (
      <section className="rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-semibold text-muted-foreground">
          Loading your sleep deadline…
        </p>
      </section>
    )
  }

  const deadline = nextOccurrence(sleepDeadlineMinutes, now)
  const msLeft = deadline.getTime() - now.getTime()
  const past = msLeft <= 0

  if (past) {
    return (
      <section className="rounded-2xl border border-red-400 bg-red-600 p-5 text-white">
        <div className="flex items-center gap-2">
          <span className="ti ti-moon-filled text-xl" aria-hidden="true" />
          <p className="text-base font-bold">It’s past your sleep deadline.</p>
        </div>
        <p className="mt-2 text-sm leading-relaxed">
          The best thing you can do right now is sleep. Close this app.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-primary/30 bg-primary/10 p-5">
      <div className="flex items-center gap-2">
        <span className="ti ti-moon-filled text-xl text-primary" aria-hidden="true" />
        <div className="flex flex-1 items-center justify-between gap-2">
          <p className="text-sm font-bold text-foreground">Sleep by {sleepLabel}</p>
          <p className="text-sm font-bold text-muted-foreground">Wake up by {wakeUpLabel}</p>
        </div>
      </div>
      <div className="mt-3 rounded-xl bg-primary/10 p-3 text-center">
        <p className="text-xs text-muted-foreground">Time until your sleep deadline</p>
        <p className="text-2xl font-bold tabular-nums text-primary">
          {formatCountdown(msLeft)}
        </p>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        After your sleep deadline, sleep beats studying. This is the one decision your AI coach
        won&apos;t make for you.
      </p>
    </section>
  )
}
