'use client'

import { getPanicTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'
import type { PlanResponse, TriageData } from '@/lib/sat-types'
import { deriveTimes, TIME_BUDGET_HOURS } from '@/lib/time-utils'

interface CoachWelcomeProps {
  triage: TriageData
  response: PlanResponse
  onReady: () => void
}

export function CoachWelcome({ triage, response, onReady }: CoachWelcomeProps) {
  const theme = getPanicTheme(triage.panic)
  const times = deriveTimes(triage.testStartTime)
  const hours = TIME_BUDGET_HOURS[triage.timeBudget]
  const timeLabel =
    hours >= 6
      ? 'all evening'
      : hours >= 2
        ? `about ${Math.round(hours)} hours`
        : 'under an hour'

  const testTime = triage.testStartTime

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-12">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 text-center">
        {/* Panic badge */}
        <span
          className={cn(
            'mx-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
            theme.badge,
          )}
        >
          <span className="ti ti-heart-rate-monitor" aria-hidden="true" />
          {theme.label}
        </span>

        {/* Greeting */}
        <div className="flex flex-col gap-4">
          <h1 className="font-serif text-4xl font-normal leading-tight tracking-tight text-foreground sm:text-5xl">
            Hi. I&apos;ve got your plan ready.
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            You have <strong className="text-foreground">{timeLabel}</strong> and your SAT starts at{' '}
            <strong className="text-foreground">{testTime}</strong>.
            {times && (
              <>
                {' '}
                You need to be asleep by{' '}
                <strong className="text-foreground">{times.sleepDeadlineLabel}</strong>.
              </>
            )}
          </p>
          <p className="text-base leading-relaxed text-muted-foreground">
            You don&apos;t have to figure anything out. Just follow me. I&apos;ll show you one
            thing at a time.
          </p>
          {triage.panic >= 4 && (
            <p className="rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
              I can see you&apos;re stressed. That&apos;s okay. We&apos;ve got this. One step at a
              time.
            </p>
          )}
        </div>

        {/* Plan summary pill */}
        <div className="flex items-center justify-center gap-6 rounded-2xl border border-border bg-card px-6 py-4">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {response.plan.topics.length}
            </span>
            <span className="text-xs text-muted-foreground">topics</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {response.plan.topics.reduce((s, t) => s + t.time_minutes, 0)}
            </span>
            <span className="text-xs text-muted-foreground">minutes</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {Math.max(...response.plan.topics.map((t) => t.score_impact_percent))}%
            </span>
            <span className="text-xs text-muted-foreground">max impact</span>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onReady}
          className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:opacity-80"
        >
          I&apos;m ready. Let&apos;s go
          <span className="ti ti-arrow-right" aria-hidden="true" />
        </button>

        {/* Escape hatch */}
        <button
          type="button"
          onClick={onReady}
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          See full plan overview instead
        </button>
      </div>
    </div>
  )
}
