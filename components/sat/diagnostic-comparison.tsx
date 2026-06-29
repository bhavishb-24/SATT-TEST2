'use client'

import { useState } from 'react'
import type { DiagnosticRecord } from '@/lib/sat-types'
import type { DiagnosticComparison as Comparison, SectionDelta } from '@/lib/diagnostic-compare'
import type { PanicTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

interface Props {
  comparison: Comparison | null
  post: DiagnosticRecord
  theme: PanicTheme
  onClose: () => void
  onRebuildPlan: () => void
}

export function DiagnosticComparison({
  comparison,
  post,
  theme,
  onClose,
  onRebuildPlan,
}: Props) {
  const [rebuilding, setRebuilding] = useState(false)
  const postPct = post.total > 0 ? Math.round((post.correct / post.total) * 100) : 0

  return (
    <main className="animate-fade-in mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 py-8 lg:py-12">
      <header className="flex flex-col items-center gap-3 text-center">
        <span
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full',
            theme.accentBgSoft,
          )}
        >
          <i
            className={cn(
              'ti text-3xl',
              comparison?.verdict === 'improved'
                ? 'ti-trophy text-emerald-500'
                : cn('ti-progress-check', theme.accentText),
            )}
            aria-hidden="true"
          />
        </span>
        <h1 className="font-serif text-3xl font-normal tracking-tight lg:text-4xl">
          Progress check complete
        </h1>
        <p className="text-pretty text-sm text-muted-foreground">
          {comparison
            ? comparison.headline
            : `You scored ${post.correct} of ${post.total} (${postPct}%) on your progress check.`}
        </p>
      </header>

      {/* Before / after section deltas */}
      {comparison ? (
        <div className="flex flex-col gap-3">
          <DeltaRow delta={comparison.overall} theme={theme} highlight />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DeltaRow delta={comparison.math} theme={theme} />
            <DeltaRow delta={comparison.rw} theme={theme} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <SoloCard label="Overall" value={`${post.correct}/${post.total}`} sub={`${postPct}%`} theme={theme} />
          <SoloCard label="Math" value={`${post.mathCorrect}/${post.mathTotal}`} theme={theme} />
          <SoloCard label="Reading & Writing" value={`${post.rwCorrect}/${post.rwTotal}`} theme={theme} />
        </div>
      )}

      {/* What you did well */}
      {comparison && (comparison.improvedTopics.length > 0 || comparison.consistentStrengths.length > 0) && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 dark:border-emerald-900 dark:bg-emerald-950/30">
          <h2 className="flex items-center gap-2 text-base font-bold text-emerald-800 dark:text-emerald-200">
            <i className="ti ti-confetti" aria-hidden="true" />
            What you did well
          </h2>
          {comparison.improvedTopics.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Turned around since your first try
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {comparison.improvedTopics.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
                  >
                    <i className="ti ti-arrow-up-right text-[11px]" aria-hidden="true" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {comparison.consistentStrengths.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Strong both times
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {comparison.consistentStrengths.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-emerald-300 bg-transparent px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:text-emerald-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Keep studying */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
          <i className={cn('ti ti-target', theme.accentText)} aria-hidden="true" />
          Keep studying these
        </h2>
        {comparison && comparison.stillStudyTopics.length === 0 ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            You did not miss a single topic this time. Outstanding work. Review your strengths so they stay sharp.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              These topics still tripped you up. They are the highest-value place to spend your remaining time.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(comparison ? comparison.stillStudyTopics : post.review.identified_weak_areas).map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {t}
                  </span>
                ),
              )}
            </div>
          </>
        )}
        <div className={cn('mt-4 rounded-lg p-4', theme.accentBgSoft)}>
          <p className={cn('text-sm font-semibold', theme.accentText)}>
            {post.review.recommended_focus}
          </p>
          <p className="mt-1 text-sm text-foreground">{post.review.encouragement}</p>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 text-base font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <i className="ti ti-arrow-left" aria-hidden="true" />
          Back to checklist
        </button>
        <button
          type="button"
          onClick={() => {
            setRebuilding(true)
            onRebuildPlan()
          }}
          disabled={rebuilding}
          className={cn(
            'flex min-h-[52px] flex-[2] items-center justify-center gap-2 rounded-xl px-6 text-base font-semibold text-card transition-opacity hover:opacity-90 disabled:opacity-60',
            theme.accentBg,
          )}
        >
          {rebuilding ? (
            <>
              <i className="ti ti-loader-2 animate-spin" aria-hidden="true" />
              Building your new plan…
            </>
          ) : (
            <>
              <i className="ti ti-refresh" aria-hidden="true" />
              Build a new study plan
            </>
          )}
        </button>
      </div>
    </main>
  )
}

function DeltaRow({
  delta,
  theme,
  highlight,
}: {
  delta: SectionDelta
  theme: PanicTheme
  highlight?: boolean
}) {
  const up = delta.delta > 0
  const down = delta.delta < 0
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-2xl border bg-card p-4',
        highlight ? cn(theme.accentBorder) : 'border-border',
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-bold text-foreground">{delta.label}</p>
        <p className="text-xs text-muted-foreground">
          {delta.preFraction} → {delta.postFraction}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Before</p>
          <p className="text-sm font-semibold tabular-nums text-muted-foreground">{delta.prePct}%</p>
        </div>
        <i className="ti ti-arrow-right text-muted-foreground" aria-hidden="true" />
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Now</p>
          <p className={cn('text-lg font-bold tabular-nums', theme.accentText)}>{delta.postPct}%</p>
        </div>
        <span
          className={cn(
            'flex min-w-[3.5rem] items-center justify-center gap-0.5 rounded-full px-2 py-1 text-xs font-bold tabular-nums',
            up && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
            down && 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
            !up && !down && 'bg-muted text-muted-foreground',
          )}
        >
          <i
            className={cn(
              'ti text-[11px]',
              up ? 'ti-trending-up' : down ? 'ti-trending-down' : 'ti-minus',
            )}
            aria-hidden="true"
          />
          {up ? '+' : ''}
          {delta.delta}
        </span>
      </div>
    </div>
  )
}

function SoloCard({
  label,
  value,
  sub,
  theme,
}: {
  label: string
  value: string
  sub?: string
  theme: PanicTheme
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-4 text-center">
      <span className={cn('text-2xl font-bold tabular-nums', theme.accentText)}>{value}</span>
      {sub && <span className="text-xs font-medium text-muted-foreground">{sub}</span>}
      <span className="mt-1 text-[11px] font-medium leading-tight text-muted-foreground">{label}</span>
    </div>
  )
}
