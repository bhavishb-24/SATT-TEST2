'use client'

import type { AppStats, DashboardView, PlanResponse, TriageData } from '@/lib/sat-types'
import type { PanicTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

interface HomeViewProps {
  triage: TriageData
  response: PlanResponse
  stats: AppStats
  theme: PanicTheme
  countdownLabel: string
  sleepLabel: string
  wakeLabel: string
  timeZoneLabel: string | null
  onNavigate: (view: DashboardView) => void
}

interface QuickLink {
  id: DashboardView
  title: string
  desc: string
  icon: string
}

const QUICK_LINKS: QuickLink[] = [
  { id: 'plan', title: 'Study Plan', desc: 'Your prioritized topics', icon: 'ti-list-check' },
  { id: 'practice', title: 'Practice Drills', desc: 'AI questions on weak spots', icon: 'ti-target-arrow' },
  { id: 'flashcards', title: 'Flashcards', desc: 'Rapid-fire review', icon: 'ti-cards' },
  { id: 'checklist', title: 'Night Checklist', desc: 'Pack & prep for tomorrow', icon: 'ti-checkbox' },
]

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string
  value: string
  sub: string
  icon: string
  accent: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <i className={cn('ti', icon, 'text-lg', accent)} aria-hidden="true" />
      </div>
      <p className="mt-2 text-2xl font-bold text-foreground tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}

export function HomeView({
  triage,
  response,
  stats,
  theme,
  countdownLabel,
  sleepLabel,
  wakeLabel,
  timeZoneLabel,
  onNavigate,
}: HomeViewProps) {
  const practiceAccuracy =
    stats.practiceAnswered > 0
      ? Math.round((stats.practiceCorrect / stats.practiceAnswered) * 100)
      : 0
  const topicPct =
    stats.topicsTotal > 0
      ? Math.round((stats.topicsCompleted / stats.topicsTotal) * 100)
      : 0

  return (
    <div className="flex flex-col gap-6">
      {/* Hero countdown */}
      <section
        className={cn(
          'rounded-2xl border border-border p-6 sm:p-8',
          theme.accentBgSoft,
        )}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
                theme.badge,
              )}
            >
              <i className="ti ti-bolt" aria-hidden="true" />
              {theme.label}
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-balance text-foreground">
              {response.plan.summary.motivational_message ??
                'Your emergency plan is ready'}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">
              {response.plan.summary.estimated_score_improvement
                ? `Potential lift: ${response.plan.summary.estimated_score_improvement}. Work your highest-impact topics, then lock in sleep and logistics.`
                : 'Work through your highest-impact topics, then lock in sleep and logistics.'}
            </p>
          </div>
          <div className="shrink-0 rounded-xl bg-card border border-border p-5 text-center min-w-[180px]">
            <p className="text-xs font-medium text-muted-foreground">Test starts in</p>
            <p className={cn('text-4xl font-bold tabular-nums', theme.accentText)}>
              {countdownLabel}
            </p>
            <div className="mt-3 flex items-center justify-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <i className="ti ti-moon" aria-hidden="true" /> {sleepLabel}
              </span>
              <span className="flex items-center gap-1">
                <i className="ti ti-sun" aria-hidden="true" /> {wakeLabel}
              </span>
            </div>
            {timeZoneLabel && (
              <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                <i className="ti ti-world" aria-hidden="true" />
                Times shown in your timezone ({timeZoneLabel})
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Stat overview */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Tonight at a glance
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard
            label="Plan progress"
            value={`${topicPct}%`}
            sub={`${stats.topicsCompleted}/${stats.topicsTotal} topics done`}
            icon="ti-list-check"
            accent={theme.accentText}
          />
          <StatCard
            label="Practice accuracy"
            value={stats.practiceAnswered > 0 ? `${practiceAccuracy}%` : '—'}
            sub={`${stats.practiceAnswered} questions answered`}
            icon="ti-target-arrow"
            accent="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            label="Cards reviewed"
            value={String(stats.flashcardsReviewed)}
            sub={`${stats.flashcardsKnown} marked known`}
            icon="ti-cards"
            accent="text-blue-600 dark:text-blue-400"
          />
        </div>
      </section>

      {/* Quick links */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Jump back in
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => onNavigate(link.id)}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-foreground/20 hover:bg-muted"
            >
              <span
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
                  theme.accentBgSoft,
                  theme.accentText,
                )}
              >
                <i className={cn('ti', link.icon, 'text-xl')} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">
                  {link.title}
                </span>
                <span className="block text-xs text-muted-foreground">{link.desc}</span>
              </span>
              <i
                className="ti ti-chevron-right ml-auto text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </section>

      {response.source === 'fallback' && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <i className="ti ti-info-circle" aria-hidden="true" />
          Using a proven offline plan. Connect AI for a fully personalized plan.
        </p>
      )}
    </div>
  )
}
