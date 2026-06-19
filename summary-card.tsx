'use client'

import type { StudyPlan, TriageData } from '@/lib/sat-types'
import { getPanicTheme } from '@/lib/theme'
import { TIME_BUDGET_LABELS } from '@/lib/time-utils'

interface Props {
  plan: StudyPlan
  triage: TriageData
}

export function SummaryCard({ plan, triage }: Props) {
  const theme = getPanicTheme(triage.panic)
  const { summary } = plan

  const headline =
    triage.panic >= 4
      ? 'Deep breath. Here’s your focused plan.'
      : triage.panic === 3
        ? 'You’ve got this. Here’s the plan.'
        : 'Nice and calm. Here’s your plan.'

  return (
    <section className={`rounded-2xl border p-5 ${theme.accentBorder} ${theme.accentBgSoft}`}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-extrabold leading-tight text-balance">{headline}</h2>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${theme.badge}`}>
          {theme.label}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat icon="ti-hourglass" label="Study time" value={TIME_BUDGET_LABELS[triage.timeBudget].split('(')[0].trim()} />
        <Stat icon="ti-list-check" label="Topics to cover" value={`${summary.total_topics}`} />
        <Stat icon="ti-sunrise" label="Wake up by" value={summary.wake_up_time} />
        <Stat icon="ti-moon" label="Sleep by" value={summary.sleep_deadline} />
      </div>

      {summary.estimated_score_improvement && (
        <div className="mt-3 rounded-xl bg-card p-3">
          <p className="text-xs text-muted-foreground">Estimated improvement (approximate)</p>
          <p className="text-sm font-semibold">{summary.estimated_score_improvement}</p>
        </div>
      )}

      <p className={`mt-4 text-sm font-medium ${theme.accentText}`}>
        {summary.motivational_message}
      </p>
    </section>
  )
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-card p-3">
      <span className={`${icon} ti text-base text-muted-foreground`} aria-hidden="true" />
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-sm font-bold leading-tight">{value}</span>
    </div>
  )
}
