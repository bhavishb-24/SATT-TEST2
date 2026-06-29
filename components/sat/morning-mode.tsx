'use client'

import { useEffect, useState } from 'react'
import type { StudyPlan, TriageData } from '@/lib/sat-types'
import {
  formatCountdown,
  nextOccurrence,
  parseTimeToMinutes,
} from '@/lib/time-utils'

interface Props {
  plan: StudyPlan
  triage: TriageData
}

const WARMUP_STEPS = [
  'Eat your breakfast. No phone. Just eat.',
  'Read your top 3 math reminders.',
  'Read your top 3 reading & writing reminders.',
  'Confirm your bag is packed.',
  'You’re done preparing. Lock in.',
]

export function MorningMode({ plan, triage }: Props) {
  const [now, setNow] = useState<Date | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [stepSeconds, setStepSeconds] = useState(120)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Per-step 2-minute timer.
  useEffect(() => {
    setStepSeconds(120)
    const timer = setInterval(() => {
      setStepSeconds((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [stepIndex])

  const testMinutes = parseTimeToMinutes(triage.testStartTime)
  const countdown =
    now && testMinutes != null
      ? formatCountdown(nextOccurrence(testMinutes, now).getTime() - now.getTime())
      : 'N/A'

  const mathReminder = plan.top_math_tips[0] ?? 'Isolate the variable one step at a time.'
  const rwReminder = plan.top_rw_tips[0] ?? 'Support every answer with a line from the passage.'
  const studiedReminder =
    plan.topics[0]?.morning_reminder ?? 'Trust the work you put in tonight.'

  if (finished) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 rounded-2xl border border-primary/30 bg-primary/10 px-8 py-16 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {now ? now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''}
        </p>
        <h1 className="text-4xl font-extrabold leading-tight text-balance text-foreground">
          Go get it.
        </h1>
        <p className="text-lg text-muted-foreground">You put in the work.</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="rounded-2xl border border-primary/30 bg-primary/10 p-5">
        <p className="text-sm font-medium text-muted-foreground">T-minus until your SAT</p>
        <p className="text-3xl font-extrabold tabular-nums text-primary">{countdown}</p>
        <p className="mt-2 text-base font-semibold text-foreground">You&apos;re ready. Here&apos;s your morning.</p>
      </header>

      {/* 10-minute warm-up */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            10-minute warm-up
          </h2>
          <span className="text-xs font-semibold tabular-nums text-muted-foreground">
            Step {stepIndex + 1} / {WARMUP_STEPS.length}
          </span>
        </div>
        <p className="mt-4 text-lg font-semibold leading-relaxed text-balance">
          {WARMUP_STEPS[stepIndex]}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-2xl font-bold tabular-nums text-primary">
            {Math.floor(stepSeconds / 60)}:{(stepSeconds % 60).toString().padStart(2, '0')}
          </span>
          {stepIndex < WARMUP_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStepIndex((i) => i + 1)}
              className="ml-auto min-h-[44px] rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              Next step
            </button>
          ) : (
            <span className="ml-auto text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Last one
            </span>
          )}
        </div>
      </section>

      {/* Confidence cards */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Your reminders
        </h2>
        <ConfidenceCard icon="ti-math" section="Math" reminder={mathReminder} />
        <ConfidenceCard
          icon="ti-book-2"
          section="Reading & Writing"
          reminder={rwReminder}
        />
        <ConfidenceCard
          icon="ti-bulb"
          section="Your #1 focus tonight"
          reminder={studiedReminder}
        />
      </section>

      <button
        type="button"
        onClick={() => setFinished(true)}
        className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-lg font-bold text-primary-foreground"
      >
        I’m ready
      </button>
    </div>
  )
}

function ConfidenceCard({
  icon,
  section,
  reminder,
}: {
  icon: string
  section: string
  reminder: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className={`${icon} ti text-lg text-primary`} aria-hidden="true" />
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {section}
        </span>
      </div>
      <p className="mt-2 text-sm font-medium leading-relaxed">{reminder}</p>
    </div>
  )
}
