'use client'

import { useEffect, useState } from 'react'
import { formatCountdown, nextOccurrence, parseTimeToMinutes } from './time-utils'

// Live-ticking countdown to the test start time. Returns a formatted label.
export function useCountdown(testStartTime: string): string {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const testMinutes = parseTimeToMinutes(testStartTime)
  if (!now || testMinutes == null) return '—'
  return formatCountdown(nextOccurrence(testMinutes, now).getTime() - now.getTime())
}

export interface UserTimeZone {
  /** IANA identifier, e.g. "America/New_York". */
  id: string
  /** Short label for display, e.g. "EST". */
  label: string
}

// Detects the visitor's timezone from the browser so countdowns and test-day
// times are shown relative to where they actually are. Runs client-side only
// (after mount) to avoid SSR/hydration mismatches.
export function useTimeZone(): UserTimeZone | null {
  const [tz, setTz] = useState<UserTimeZone | null>(null)

  useEffect(() => {
    try {
      const id = Intl.DateTimeFormat().resolvedOptions().timeZone
      const label =
        new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
          .formatToParts(new Date())
          .find((p) => p.type === 'timeZoneName')?.value ?? id
      setTz({ id, label })
    } catch {
      setTz(null)
    }
  }, [])

  return tz
}
