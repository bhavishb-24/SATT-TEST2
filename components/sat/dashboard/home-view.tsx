'use client'

import { useEffect, useRef, useState } from 'react'
import type { AppStats, DashboardView, PlanResponse, TriageData } from '@/lib/sat-types'
import type { PanicTheme } from '@/lib/theme'
import type { GamificationState } from '@/lib/use-gamification'
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
  gamification: GamificationState
}

// Animated XP counter
function XpCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  const raf = useRef<number | null>(null)
  const start = useRef(0)
  const from = useRef(0)

  useEffect(() => {
    from.current = display
    start.current = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start.current
      const duration = 800
      const progress = Math.min(1, elapsed / duration)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(from.current + (value - from.current) * ease))
      if (progress < 1) raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <span className="tabular-nums">{display.toLocaleString()}</span>
}

// Animated fill bar
function FillBar({
  pct,
  color = 'bg-primary',
  height = 'h-2',
  className,
}: {
  pct: number
  color?: string
  height?: string
  className?: string
}) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 120)
    return () => clearTimeout(t)
  }, [pct])
  return (
    <div className={cn('w-full overflow-hidden rounded-full bg-muted', height, className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-700 ease-out', color)}
        style={{ width: `${width}%` }}
        role="presentation"
      />
    </div>
  )
}

// Stat hero card
function HeroStat({
  label,
  value,
  sub,
  icon,
  iconColor,
}: {
  label: string
  value: React.ReactNode
  sub?: string
  icon: string
  iconColor: string
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', iconColor)}>
          <i className={cn('ti', icon, 'text-base')} aria-hidden="true" />
        </span>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="text-2xl font-bold leading-none text-foreground">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

const QUICK_LINKS: { id: DashboardView; title: string; desc: string; icon: string }[] = [
  { id: 'plan', title: 'Study Plan', desc: 'Your prioritized topics', icon: 'ti-list-check' },
  { id: 'practice', title: 'Practice Drills', desc: 'AI questions on weak spots', icon: 'ti-target-arrow' },
  { id: 'flashcards', title: 'Flashcards', desc: 'Rapid-fire review', icon: 'ti-cards' },
  { id: 'achievements', title: 'Achievements', desc: 'Milestones & badges', icon: 'ti-trophy' },
]

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
  gamification,
}: HomeViewProps) {
  const {
    xp,
    level,
    levelTitle,
    levelProgress,
    xpForNextLevel,
    streak,
    weeklyXp,
    confidenceScore,
    estimatedSAT,
    studyMinutesToday,
    dailyGoalPct,
    satDaysRemaining,
    quests,
  } = gamification

  const activeQuests = quests.filter((q) => q.status === 'active').slice(0, 2)

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* ── Hero greeting + countdown ───────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Left copy */}
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Ready to study?</p>
            <h1 className="mt-1 font-serif text-3xl font-bold leading-tight text-foreground text-balance sm:text-4xl">
              {satDaysRemaining > 0 ? (
                <>SAT in <span className="text-primary">{satDaysRemaining} days.</span></>
              ) : (
                <>{"Let's get started."}</>
              )}
            </h1>

            {/* Daily goal progress */}
            <div className="mt-5 max-w-sm">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">{"Today's Goal"}</p>
                <p className="text-xs font-bold text-primary">{dailyGoalPct}%</p>
              </div>
              <FillBar pct={dailyGoalPct} height="h-3" />
              <p className="mt-1 text-[11px] text-muted-foreground">
                {studyMinutesToday} min studied · goal: 60 min
              </p>
            </div>

            {/* Level progress bar */}
            <div className="mt-4 max-w-sm">
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {level}
                  </span>
                  <p className="text-xs font-semibold text-foreground">{levelTitle}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  <XpCounter value={xp} /> / {xpForNextLevel.toLocaleString()} XP
                </p>
              </div>
              <FillBar pct={levelProgress} color="bg-amber-400" height="h-2" />
            </div>
          </div>

          {/* Right stats cluster */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 lg:w-72">
            <HeroStat
              label="Study Time"
              value={`${studyMinutesToday}m`}
              sub="today"
              icon="ti-clock-hour-4"
              iconColor="bg-blue-50 text-blue-600"
            />
            <HeroStat
              label="Confidence"
              value={confidenceScore > 0 ? `${confidenceScore}%` : 'N/A'}
              sub={confidenceScore > 0 ? 'based on your answers' : 'answer questions to see'}
              icon="ti-brain"
              iconColor="bg-purple-50 text-purple-600"
            />
            <HeroStat
              label="Est. SAT"
              value={estimatedSAT > 0 ? estimatedSAT.toLocaleString() : 'N/A'}
              sub={estimatedSAT > 0 ? 'projected' : 'start practicing'}
              icon="ti-chart-line"
              iconColor="bg-emerald-50 text-primary"
            />
            <HeroStat
              label="Streak"
              value={`${streak}d`}
              sub="days studied"
              icon="ti-flame"
              iconColor="bg-orange-50 text-orange-500"
            />
            <HeroStat
              label="Weekly XP"
              value={<XpCounter value={weeklyXp} />}
              sub="this week"
              icon="ti-star"
              iconColor="bg-amber-50 text-amber-500"
            />
            <HeroStat
              label="Until test"
              value={satDaysRemaining}
              sub="days"
              icon="ti-calendar-event"
              iconColor="bg-red-50 text-red-500"
            />
          </div>
        </div>
      </section>

      {/* ── Active quests ───────────────────────────────────────────────── */}
      <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Active Quests
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('achievements' as DashboardView)}
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </button>
          </div>
          {activeQuests.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activeQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <i className={cn('ti', quest.icon, 'text-lg')} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{quest.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{quest.description}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <FillBar pct={quest.progress} height="h-1.5" className="flex-1" />
                      <span className="shrink-0 text-[10px] font-bold text-primary">
                        {quest.current}/{quest.target}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-bold text-amber-500">+{quest.xpReward}</p>
                    <p className="text-[10px] text-muted-foreground">XP</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-border bg-card/50 p-4 text-sm text-muted-foreground text-center">
              All quests complete for today. Keep practicing to earn XP.
            </p>
          )}
        </section>

      {/* ── Quick links ─────────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Jump back in
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => onNavigate(link.id)}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <span className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                'bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground',
              )}>
                <i className={cn('ti', link.icon, 'text-lg')} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">{link.title}</span>
                <span className="block text-xs text-muted-foreground">{link.desc}</span>
              </span>
              <i className="ti ti-chevron-right ml-auto text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
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
