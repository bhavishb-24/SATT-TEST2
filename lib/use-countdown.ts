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
