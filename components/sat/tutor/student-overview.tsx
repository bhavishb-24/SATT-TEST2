'use client'

import { cn } from '@/lib/utils'
import type { TriageData } from '@/lib/sat-types'
import type { AppStats } from '@/lib/sat-types'
import type { DashboardView } from '@/lib/sat-types'

interface QuickLink {
  icon: string
  label: string
  view: DashboardView
}

const QUICK_LINKS: QuickLink[] = [
  { icon: 'ti-layout-dashboard', label: 'Dashboard', view: 'home' },
  { icon: 'ti-pencil-question', label: 'Practice', view: 'practice' },
  { icon: 'ti-cards', label: 'Flashcards', view: 'flashcards' },
  { icon: 'ti-stack-2', label: 'Question Bank', view: 'community' },
  { icon: 'ti-brain', label: 'Learning Brain', view: 'brain' },
  { icon: 'ti-clipboard-check', label: 'Mock Tests', view: 'mocktest' },
]

interface Props {
  triage: TriageData
  stats: AppStats
  countdown: string
  streak: number
  studySeconds: number
  predictedScore: number | null
  onNavigate: (view: DashboardView) => void
}

function fmt(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function confidenceLabel(pct: number): string {
  if (pct >= 80) return 'High'
  if (pct >= 55) return 'Growing'
  if (pct >= 30) return 'Building'
  return 'Early stage'
}

function confidenceColor(pct: number): string {
  if (pct >= 80) return 'text-emerald-600'
  if (pct >= 55) return 'text-amber-600'
  return 'text-rose-500'
}

export function StudentOverview({
  triage,
  stats,
  countdown,
  streak,
  studySeconds,
  predictedScore,
  onNavigate,
}: Props) {
  const accuracy =
    stats.practiceAnswered > 0
      ? Math.round((stats.practiceCorrect / stats.practiceAnswered) * 100)
      : 0

  const focusTopic = triage.weakAreas[0] ?? null

  const statItems = [
    {
      icon: 'ti-clock-hour-3',
      label: "Today's Goal",
      value: countdown,
      sub: 'until exam',
    },
    {
      icon: 'ti-flame',
      label: 'Study Streak',
      value: `${streak} day${streak !== 1 ? 's' : ''}`,
      sub: streak === 0 ? 'Start today' : streak >= 7 ? 'On fire' : 'Keep it up',
    },
    {
      icon: 'ti-clock',
      label: "Today's Study Time",
      value: fmt(studySeconds),
      sub: 'this session',
    },
    ...(predictedScore
      ? [
          {
            icon: 'ti-target',
            label: 'Predicted Score',
            value: `${predictedScore}`,
            sub: '/ 1600',
          },
        ]
      : []),
    ...(focusTopic
      ? [
          {
            icon: 'ti-crosshair',
            label: 'Current Focus',
            value: focusTopic,
            sub: 'weakest topic',
          },
        ]
      : []),
    {
      icon: 'ti-chart-bar',
      label: 'Confidence',
      value: confidenceLabel(accuracy),
      sub: `${accuracy}% practice accuracy`,
      valueClass: confidenceColor(accuracy),
    },
  ]

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <i className="ti ti-user-circle text-primary text-base" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Student Overview
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-1 px-3 py-3">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60"
          >
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <i className={cn('ti', item.icon, 'text-primary text-sm')} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className={cn('truncate text-sm font-semibold text-foreground', item.valueClass)}>
                {item.value}
              </p>
              {item.sub && (
                <p className="truncate text-[11px] text-muted-foreground/70">{item.sub}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-border" />

      {/* Quick Navigation */}
      <div className="px-3 py-3">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Navigation
        </p>
        <div className="flex flex-col gap-0.5">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.view}
              type="button"
              onClick={() => onNavigate(link.view)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <i className={cn('ti', link.icon, 'text-base')} aria-hidden="true" />
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-border" />

      {/* Pinned / Saved */}
      <div className="px-3 py-3">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Pinned
        </p>

        {/* Bookmarks empty state */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground">
            <i className="ti ti-bookmark text-base" aria-hidden="true" />
            <span className="text-xs">Saved Sessions</span>
          </div>
          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-3 text-center">
            <p className="text-xs text-muted-foreground/70">
              Sessions you save will appear here.
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
