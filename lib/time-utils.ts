import type { TimeBudget } from './sat-types'

// Parse a "8:00 AM" style time into minutes since midnight.
export function parseTimeToMinutes(time: string): number | null {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return null
  let hours = Number.parseInt(match[1], 10)
  const minutes = Number.parseInt(match[2], 10)
  const meridiem = match[3].toUpperCase()
  if (meridiem === 'PM' && hours !== 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0
  return hours * 60 + minutes
}

// Format minutes since midnight (can be negative or > 1440) into "8:00 AM".
export function formatMinutes(totalMinutes: number): string {
  let m = ((totalMinutes % 1440) + 1440) % 1440
  let hours = Math.floor(m / 60)
  const minutes = m % 60
  const meridiem = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12
  return `${hours}:${minutes.toString().padStart(2, '0')} ${meridiem}`
}

// Build the list of test-start options from 7:00 AM to 10:00 AM in 1-hour increments.
export function buildTestTimeOptions(): string[] {
  const options: string[] = []
  for (let m = 7 * 60; m <= 10 * 60; m += 60) {
    options.push(formatMinutes(m))
  }
  return options
}

export interface DerivedTimes {
  sleepDeadlineMinutes: number
  wakeUpMinutes: number
  sleepDeadlineLabel: string
  wakeUpLabel: string
}

// sleep deadline = test start minus 8.5 hours; wake-up = test start minus 45 minutes.
export function deriveTimes(testStartTime: string): DerivedTimes | null {
  const start = parseTimeToMinutes(testStartTime)
  if (start === null) return null
  const sleepDeadlineMinutes = start - 8.5 * 60
  const wakeUpMinutes = start - 45
  return {
    sleepDeadlineMinutes,
    wakeUpMinutes,
    sleepDeadlineLabel: formatMinutes(sleepDeadlineMinutes),
    wakeUpLabel: formatMinutes(wakeUpMinutes),
  }
}

// Returns the next Date today/tomorrow for a target minutes-of-day, relative to now.
// The sleep deadline is the evening before the test, so we anchor it to "tonight".
export function nextOccurrence(targetMinutes: number, now: Date): Date {
  const d = new Date(now)
  const normalized = ((targetMinutes % 1440) + 1440) % 1440
  d.setHours(Math.floor(normalized / 60), normalized % 60, 0, 0)
  // For a late-night study session, the sleep deadline (e.g. 11pm) is today;
  // an early wake-up (e.g. 7am) is tomorrow.
  if (d.getTime() < now.getTime() - 2 * 60 * 60 * 1000) {
    d.setDate(d.getDate() + 1)
  }
  return d
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '0h 0m 0s'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  return `${minutes}m ${seconds}s`
}

export const TIME_BUDGET_LABELS: Record<TimeBudget, string> = {
  'all-day': 'All day + tonight (~12 hrs)',
  evening: 'Just this evening (~5–7 hrs)',
  'few-hours': 'Only a few hours (~2–3 hrs)',
  sprint: 'Less than 1 hour — sprint mode',
}

export const TIME_BUDGET_HOURS: Record<TimeBudget, number> = {
  'all-day': 12,
  evening: 6,
  'few-hours': 2.5,
  sprint: 0.75,
}
