'use client'

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AppStats } from '@/lib/sat-types'
import type { PanicTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

interface ProgressViewProps {
  stats: AppStats
  theme: PanicTheme
}

function Metric({
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
      <div className="flex items-center gap-2">
        <i className={cn('ti', icon, accent)} aria-hidden="true" />
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}

export function ProgressView({ stats, theme }: ProgressViewProps) {
  const topicPct =
    stats.topicsTotal > 0
      ? Math.round((stats.topicsCompleted / stats.topicsTotal) * 100)
      : 0
  const practiceAccuracy =
    stats.practiceAnswered > 0
      ? Math.round((stats.practiceCorrect / stats.practiceAnswered) * 100)
      : 0
  const focusMinutes = Math.round(stats.focusSeconds / 60)

  const sectionData = Object.entries(stats.sectionStats).map(([name, s]) => ({
    name: name === 'Reading & Writing' ? 'R&W' : name,
    accuracy: s.answered > 0 ? Math.round((s.correct / s.answered) * 100) : 0,
    answered: s.answered,
  }))

  const donutData = [
    { name: 'Done', value: stats.topicsCompleted },
    {
      name: 'Remaining',
      value: Math.max(0, stats.topicsTotal - stats.topicsCompleted),
    },
  ]

  const hasActivity =
    stats.practiceAnswered > 0 ||
    stats.flashcardsReviewed > 0 ||
    stats.focusSessions > 0 ||
    stats.topicsCompleted > 0

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-foreground">Your Progress</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything you&apos;ve accomplished tonight, at a glance.
        </p>
      </div>

      {!hasActivity ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <i
            className={cn('ti ti-chart-bar text-3xl', theme.accentText)}
            aria-hidden="true"
          />
          <p className="mt-3 text-sm text-muted-foreground">
            Start practicing, reviewing flashcards, or completing topics to see your
            stats here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Metric
              label="Topics done"
              value={`${stats.topicsCompleted}/${stats.topicsTotal}`}
              sub={`${topicPct}% of plan`}
              icon="ti-list-check"
              accent={theme.accentText}
            />
            <Metric
              label="Practice accuracy"
              value={stats.practiceAnswered > 0 ? `${practiceAccuracy}%` : '—'}
              sub={`${stats.practiceCorrect}/${stats.practiceAnswered} correct`}
              icon="ti-target-arrow"
              accent="text-emerald-600 dark:text-emerald-400"
            />
            <Metric
              label="Flashcards"
              value={`${stats.flashcardsKnown}/${stats.flashcardsReviewed}`}
              sub="known / reviewed"
              icon="ti-cards"
              accent="text-blue-600 dark:text-blue-400"
            />
            <Metric
              label="Focus time"
              value={`${focusMinutes}m`}
              sub={`${stats.focusSessions} sessions`}
              icon="ti-clock-hour-4"
              accent="text-amber-600 dark:text-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Plan completion donut */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">Plan completion</h3>
              <div className="relative mt-2 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={85}
                      startAngle={90}
                      endAngle={-270}
                      strokeWidth={0}
                    >
                      <Cell fill={theme.accentHex} />
                      <Cell fill="var(--color-muted)" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-popover)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 8,
                        color: 'var(--color-popover-foreground)',
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-foreground">{topicPct}%</span>
                  <span className="text-xs text-muted-foreground">complete</span>
                </div>
              </div>
            </div>

            {/* Accuracy by section */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">
                Accuracy by section
              </h3>
              <div className="mt-2 h-56">
                {sectionData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Answer some practice questions to see this.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sectionData} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: 'var(--color-muted)' }}
                        contentStyle={{
                          background: 'var(--color-popover)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 8,
                          color: 'var(--color-popover-foreground)',
                          fontSize: 12,
                        }}
                        formatter={(value) => [`${value}%`, 'Accuracy']}
                      />
                      <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} maxBarSize={64}>
                        {sectionData.map((_, i) => (
                          <Cell key={i} fill={theme.accentHex} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
