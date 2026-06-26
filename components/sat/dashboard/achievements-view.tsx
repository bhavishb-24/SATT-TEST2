'use client'

import { useEffect, useRef, useState } from 'react'
import type {
  Achievement,
  AchievementCategory,
  GamificationApi,
  GamificationState,
  JourneyMilestone,
  League,
  Quest,
  TreeBranch,
} from '@/lib/use-gamification'
import { cn } from '@/lib/utils'

// ─── Shared primitives ────────────────────────────────────────────────────────

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
    const t = setTimeout(() => setWidth(pct), 80)
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

function XpPill({ xp }: { xp: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-600 border border-amber-200">
      <i className="ti ti-star text-[10px]" aria-hidden="true" />
      +{xp} XP
    </span>
  )
}

// ─── Section tab bar ──────────────────────────────────────────────────────────

type Tab = 'overview' | 'achievements' | 'quests' | 'journey' | 'profile'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'ti-layout-dashboard' },
  { id: 'achievements', label: 'Achievements', icon: 'ti-trophy' },
  { id: 'quests', label: 'Quests', icon: 'ti-map-pin' },
  { id: 'journey', label: 'Journey', icon: 'ti-route' },
  { id: 'profile', label: 'Profile', icon: 'ti-user-circle' },
]

// ─── League metadata ──────────────────────────────────────────────────────────

const LEAGUE_META: Record<League, { label: string; color: string; bg: string; icon: string; nextAt: number }> = {
  bronze: { label: 'Bronze', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: 'ti-medal', nextAt: 500 },
  silver: { label: 'Silver', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200', icon: 'ti-medal-2', nextAt: 1200 },
  gold: { label: 'Gold', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', icon: 'ti-crown', nextAt: 2500 },
  diamond: { label: 'Diamond', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', icon: 'ti-diamond', nextAt: 5000 },
  master: { label: 'Master', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', icon: 'ti-shield-star', nextAt: 10000 },
  legend: { label: 'Legend', color: 'text-primary', bg: 'bg-emerald-50 border-emerald-200', icon: 'ti-star', nextAt: 10000 },
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ state, api }: { state: GamificationState; api: GamificationApi }) {
  const {
    xp,
    level,
    levelTitle,
    levelProgress,
    xpForNextLevel,
    xpForCurrentLevel,
    streak,
    longestStreak,
    weeklyXp,
    confidenceScore,
    estimatedSAT,
    studyMinutesToday,
    dailyGoalPct,
    satDaysRemaining,
    achievements,
    quests,
    league,
  } = state

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const activeQuests = quests.filter((q) => q.status === 'active')
  const xpSpan = xpForNextLevel - xpForCurrentLevel
  const xpEarned = xp - xpForCurrentLevel

  return (
    <div className="flex flex-col gap-6">
      {/* Level card */}
      <div className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-lg">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" aria-hidden="true" />
        <div className="absolute -bottom-6 -left-4 h-32 w-32 rounded-full bg-white/5" aria-hidden="true" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium opacity-80">Current Level</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-serif text-5xl font-bold leading-none">{level}</span>
              <span className="text-xl font-semibold opacity-90">{levelTitle}</span>
            </div>
            <p className="mt-3 text-sm opacity-70">
              {xpEarned.toLocaleString()} / {xpSpan.toLocaleString()} XP to next level
            </p>
            <div className="mt-2 w-full max-w-xs overflow-hidden rounded-full bg-white/20 h-2.5">
              <div
                className="h-full rounded-full bg-white transition-all duration-700"
                style={{ width: `${levelProgress}%` }}
                role="presentation"
              />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="rounded-2xl bg-white/15 px-4 py-2 text-center">
              <p className="text-2xl font-bold">{xp.toLocaleString()}</p>
              <p className="text-xs opacity-70">Total XP</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-2 text-center">
              <p className="text-2xl font-bold">{weeklyXp.toLocaleString()}</p>
              <p className="text-xs opacity-70">This Week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Streak', value: `${streak}d`, sub: `Best: ${longestStreak}d`, icon: 'ti-flame', color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Study Today', value: `${studyMinutesToday}m`, sub: `${dailyGoalPct}% of goal`, icon: 'ti-clock-hour-4', color: 'text-blue-600', bg: 'bg-blue-50' },
          {
            label: 'Confidence',
            value: confidenceScore > 0 ? `${confidenceScore}%` : '—',
            sub: confidenceScore > 0 ? 'based on your answers' : 'answer questions to see this',
            icon: 'ti-brain', color: 'text-purple-600', bg: 'bg-purple-50',
          },
          {
            label: 'Est. SAT',
            value: estimatedSAT > 0 ? estimatedSAT.toLocaleString() : '—',
            sub: estimatedSAT > 0
              ? (satDaysRemaining > 0 ? `${satDaysRemaining}d until test` : 'projected')
              : 'answer questions to see this',
            icon: 'ti-chart-line',
            color: 'text-primary',
            bg: 'bg-emerald-50',
          },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', s.bg, s.color)}>
                <i className={cn('ti', s.icon, 'text-sm')} aria-hidden="true" />
              </span>
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            </div>
            <p className="text-2xl font-bold text-foreground leading-none">{s.value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick achievements + quests */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent achievements */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Achievements</h3>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              {unlockedCount}/{achievements.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {achievements.filter((a) => a.unlocked).slice(0, 4).map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <span className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base',
                  difficultyBg(a.difficulty),
                )}>
                  <i className={cn('ti', a.icon)} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{a.description}</p>
                </div>
                <XpPill xp={a.xpReward} />
              </div>
            ))}
            {unlockedCount === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Complete quests and study to earn your first achievement.
              </p>
            )}
          </div>
        </div>

        {/* Active quests */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Active Quests</h3>
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-600 border border-amber-200">
              {activeQuests.length} active
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {activeQuests.slice(0, 4).map((q) => (
              <QuestRow key={q.id} quest={q} onClaim={() => api.completeQuest(q.id)} />
            ))}
            {activeQuests.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                All quests complete for now — check back tomorrow.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* League badge */}
      <LeagueHeroBadge league={league} weeklyXp={weeklyXp} />
    </div>
  )
}

// ─── Achievement helpers ──────────────────────────────────────────────────────

function difficultyBg(d: Achievement['difficulty']) {
  return {
    bronze: 'bg-amber-50 text-amber-600',
    silver: 'bg-slate-50 text-slate-500',
    gold: 'bg-yellow-50 text-yellow-600',
    platinum: 'bg-emerald-50 text-primary',
  }[d]
}

function difficultyLabel(d: Achievement['difficulty']) {
  return { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', platinum: 'Platinum' }[d]
}

// ─── Achievements tab ─────────────────────────────────────────────────────────

const CATEGORY_META: Record<AchievementCategory, { label: string; icon: string }> = {
  consistency: { label: 'Consistency', icon: 'ti-flame' },
  accuracy: { label: 'Accuracy', icon: 'ti-target-arrow' },
  improvement: { label: 'Improvement', icon: 'ti-trending-up' },
  mastery: { label: 'Mastery', icon: 'ti-books' },
  whiteboard: { label: 'Whiteboard AI', icon: 'ti-chalkboard' },
  speed: { label: 'Speed', icon: 'ti-bolt' },
  challenge: { label: 'Challenge', icon: 'ti-shield' },
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const { unlocked, title, description, icon, difficulty, progress, xpReward } = achievement
  return (
    <div className={cn(
      'group relative flex flex-col gap-3 rounded-2xl border p-4 shadow-sm transition-all',
      unlocked
        ? 'border-border bg-card hover:-translate-y-0.5 hover:shadow-md'
        : 'border-border/50 bg-muted/30 opacity-60',
    )}>
      <div className="flex items-start justify-between">
        <span className={cn(
          'flex h-12 w-12 items-center justify-center rounded-2xl text-xl transition-transform',
          unlocked ? difficultyBg(difficulty) : 'bg-muted text-muted-foreground',
          unlocked && 'group-hover:scale-110',
        )}>
          {unlocked
            ? <i className={cn('ti', icon)} aria-hidden="true" />
            : <i className="ti ti-lock" aria-hidden="true" />
          }
        </span>
        {unlocked && (
          <span className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
            difficultyBg(difficulty),
          )}>
            {difficultyLabel(difficulty)}
          </span>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
      </div>

      {!unlocked && <FillBar pct={progress} height="h-1.5" />}
      <div className="flex items-center justify-between">
        {unlocked
          ? <span className="flex items-center gap-1 text-[11px] text-primary font-semibold">
              <i className="ti ti-check-circle text-xs" aria-hidden="true" /> Earned
            </span>
          : <span className="text-[11px] text-muted-foreground">{progress}% there</span>
        }
        <XpPill xp={xpReward} />
      </div>

      {unlocked && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-primary/0 transition-all group-hover:ring-primary/20" />
      )}
    </div>
  )
}

function AchievementsTab({ achievements }: { achievements: Achievement[] }) {
  const [filter, setFilter] = useState<AchievementCategory | 'all'>('all')

  const categories = ['all', ...Object.keys(CATEGORY_META)] as (AchievementCategory | 'all')[]
  const filtered = filter === 'all'
    ? achievements
    : achievements.filter((a) => a.category === filter)

  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <i className="ti ti-trophy text-xl" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{unlockedCount} of {achievements.length} unlocked</p>
          <FillBar
            pct={achievements.length > 0 ? Math.round(unlockedCount / achievements.length * 100) : 0}
            className="mt-1 max-w-48"
            height="h-1.5"
          />
        </div>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={cn(
              'shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
              filter === cat
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {cat !== 'all' && (
              <i className={cn('ti', CATEGORY_META[cat as AchievementCategory].icon, 'text-[11px]')} aria-hidden="true" />
            )}
            {cat === 'all' ? 'All' : CATEGORY_META[cat as AchievementCategory].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <AchievementCard key={a.id} achievement={a} />
        ))}
      </div>
    </div>
  )
}

// ─── Quest row ────────────────────────────────────────────────────────────────

function QuestRow({ quest, onClaim }: { quest: Quest; onClaim: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-3">
      <span className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base',
        quest.status === 'complete' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary',
      )}>
        <i className={cn('ti', quest.icon)} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate">{quest.title}</p>
          <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
            {quest.refreshes}
          </span>
        </div>
        <FillBar pct={quest.progress} height="h-1.5" className="mt-1" />
        <p className="mt-0.5 text-[11px] text-muted-foreground">{quest.current}/{quest.target} {quest.unit}</p>
      </div>
      {quest.status === 'complete' ? (
        <button
          type="button"
          onClick={onClaim}
          className="shrink-0 flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-bold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <i className="ti ti-gift text-xs" aria-hidden="true" />
          Claim
        </button>
      ) : (
        <XpPill xp={quest.xpReward} />
      )}
    </div>
  )
}

// ─── Quests tab ───────────────────────────────────────────────────────────────

function QuestsTab({ quests, api }: { quests: Quest[]; api: GamificationApi }) {
  const daily = quests.filter((q) => q.refreshes === 'daily')
  const weekly = quests.filter((q) => q.refreshes === 'weekly')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <i className="ti ti-sun text-amber-500 text-base" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-foreground">Daily Quests</h3>
          <span className="ml-auto text-[11px] text-muted-foreground">Resets at midnight</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {daily.map((q) => <QuestRow key={q.id} quest={q} onClaim={() => api.completeQuest(q.id)} />)}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <i className="ti ti-calendar-week text-primary text-base" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-foreground">Weekly Quests</h3>
          <span className="ml-auto text-[11px] text-muted-foreground">Resets Sunday</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {weekly.map((q) => <QuestRow key={q.id} quest={q} onClaim={() => api.completeQuest(q.id)} />)}
        </div>
      </div>
    </div>
  )
}

// ─── League badge ─────────────────────────────────────────────────────────────

function LeagueHeroBadge({ league, weeklyXp }: { league: League; weeklyXp: number }) {
  const meta = LEAGUE_META[league]
  const pct = Math.min(100, Math.round(weeklyXp / meta.nextAt * 100))
  return (
    <div className={cn('flex items-center gap-4 rounded-2xl border p-5 shadow-sm', meta.bg)}>
      <span className={cn('flex h-14 w-14 items-center justify-center rounded-2xl text-3xl', meta.bg, meta.color)}>
        <i className={cn('ti', meta.icon)} aria-hidden="true" />
      </span>
      <div className="flex-1">
        <p className={cn('text-xs font-bold uppercase tracking-widest', meta.color)}>{meta.label} League</p>
        <p className="mt-0.5 text-lg font-bold text-foreground">
          {weeklyXp > 0 ? `${weeklyXp.toLocaleString()} XP this week` : 'No XP yet this week'}
        </p>
        <FillBar pct={pct} className="mt-2 max-w-xs" height="h-1.5" color={league === 'legend' ? 'bg-primary' : 'bg-foreground/30'} />
        {league !== 'legend' && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            {meta.nextAt.toLocaleString()} XP needed for next league
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Journey tab ──────────────────────────────────────────────────────────────
// Every milestone is derived from real stats — no hardcoded dates or events.

function JourneyTab({ journey }: { journey: JourneyMilestone[] }) {
  const doneMilestones = journey.filter((m) => m.done)
  const upcomingMilestones = journey.filter((m) => !m.done)

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-foreground">Your Learning Journey</h3>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
            {doneMilestones.length}/{journey.length} reached
          </span>
        </div>

        {doneMilestones.length === 0 && (
          <div className="py-8 text-center">
            <i className="ti ti-map-2 text-3xl text-muted-foreground/40" aria-hidden="true" />
            <p className="mt-3 text-sm text-muted-foreground">
              Your journey starts the moment you begin studying.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Answer a practice question or review a flashcard to mark your first milestone.
            </p>
          </div>
        )}

        <ol className="relative flex flex-col gap-0" aria-label="Learning milestones">
          {journey.map((m, i) => (
            <li key={m.id} className="relative flex gap-4 pb-6 last:pb-0">
              {i < journey.length - 1 && (
                <div className={cn(
                  'absolute left-4 top-9 bottom-0 w-0.5 -translate-x-1/2',
                  m.done ? 'bg-primary/30' : 'bg-border',
                )} aria-hidden="true" />
              )}
              <span className={cn(
                'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm',
                m.done
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground',
              )}>
                {m.done
                  ? <i className={cn('ti', m.icon)} aria-hidden="true" />
                  : <i className="ti ti-lock text-xs" aria-hidden="true" />
                }
              </span>
              <div className="flex-1 pt-0.5">
                <p className={cn('text-sm font-semibold', m.done ? 'text-foreground' : 'text-muted-foreground')}>
                  {m.event}
                </p>
                {m.done && (
                  <p className="text-[11px] text-primary font-medium mt-0.5">Completed</p>
                )}
                {!m.done && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">Not yet reached</p>
                )}
              </div>
            </li>
          ))}
        </ol>

        {upcomingMilestones.length > 0 && doneMilestones.length > 0 && (
          <p className="mt-4 text-xs text-muted-foreground text-center">
            {upcomingMilestones.length} milestone{upcomingMilestones.length !== 1 ? 's' : ''} ahead — keep going.
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Confidence Tree ──────────────────────────────────────────────────────────
// Branches are derived from real practice/flashcard/topic stats — no hardcoded %.

function ConfidenceTree({ branches }: { branches: TreeBranch[] }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200)
    return () => clearTimeout(t)
  }, [])

  const avgMastery = branches.length > 0
    ? Math.round(branches.reduce((s, b) => s + b.mastery, 0) / branches.length)
    : 0

  // No data yet
  if (avgMastery === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Confidence Tree</h3>
        <div className="flex flex-col items-center gap-3 py-8">
          <i className="ti ti-tree text-4xl text-muted-foreground/30" aria-hidden="true" />
          <p className="text-sm text-muted-foreground text-center">
            Your tree grows as you study.
          </p>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Answer practice questions and review flashcards to grow each branch.
          </p>
        </div>
      </div>
    )
  }

  const trunkH = 60 + avgMastery * 0.8

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Confidence Tree</h3>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
          {avgMastery}% avg
        </span>
      </div>

      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-8">
        <svg
          viewBox="0 0 260 320"
          className="w-64 shrink-0"
          aria-label="Confidence tree visualization"
          aria-hidden="true"
        >
          <ellipse cx="130" cy="305" rx="55" ry="8" fill="var(--color-muted)" />
          <rect
            x="118" y={305 - trunkH} width="24" rx="6"
            height={animated ? trunkH : 0}
            fill="#8B6914"
            className="transition-all duration-700 ease-out"
          />
          {branches.map((b, i) => {
            const side = i % 2 === 0 ? -1 : 1
            const row = Math.floor(i / 2)
            const rootY = 305 - trunkH + 30 + row * 50
            const tipX = 130 + side * (40 + b.mastery * 0.5)
            const tipY = rootY - 25 - b.mastery * 0.35
            const r = 14 + b.mastery * 0.22
            return (
              <g key={b.label}>
                <line
                  x1="130" y1={rootY}
                  x2={tipX} y2={tipY}
                  stroke="#8B6914"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={animated ? 'none' : '0 100'}
                  className="transition-all duration-500 ease-out"
                  style={{ transitionDelay: `${i * 80}ms` }}
                />
                <circle
                  cx={tipX} cy={tipY}
                  r={animated ? r : 0}
                  fill={b.color}
                  opacity={0.75 + b.mastery * 0.002}
                  className="transition-all duration-500 ease-out"
                  style={{ transitionDelay: `${i * 80 + 200}ms` }}
                />
                {b.mastery > 60 && (
                  <circle
                    cx={tipX} cy={tipY}
                    r={animated ? 4 : 0}
                    fill="#fff"
                    opacity={0.9}
                    className="transition-all duration-300"
                    style={{ transitionDelay: `${i * 80 + 400}ms` }}
                  />
                )}
              </g>
            )
          })}
        </svg>

        <div className="flex-1 flex flex-col gap-2.5">
          <p className="text-[11px] text-muted-foreground mb-1">
            Based on your practice and flashcard accuracy. Estimated per section.
          </p>
          {branches.map((b) => (
            <div key={b.label} className="flex items-center gap-3">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: b.color }}
                aria-hidden="true"
              />
              <p className="w-20 text-xs font-medium text-foreground">{b.label}</p>
              <FillBar pct={animated ? b.mastery : 0} color="bg-primary" height="h-1.5" className="flex-1" />
              <p className="w-8 text-right text-xs font-bold text-foreground">{b.mastery}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Profile tab ──────────────────────────────────────────────────────────────

function ProfileTab({ state }: { state: GamificationState }) {
  const {
    level, levelTitle, xp, streak, longestStreak,
    confidenceScore, estimatedSAT, achievements, league,
    studyMinutesToday, weeklyXp,
  } = state

  const unlockedAchievements = achievements.filter((a) => a.unlocked)
  const leagueMeta = LEAGUE_META[league]

  return (
    <div className="flex flex-col gap-5">
      {/* Profile hero — no fake name; shows level and stats only */}
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-6 text-center shadow-sm sm:flex-row sm:text-left">
        <div className="relative shrink-0">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-lg">
            <i className="ti ti-user text-3xl" aria-hidden="true" />
          </div>
          <span className={cn(
            'absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card text-xs font-bold',
            leagueMeta.bg, leagueMeta.color,
          )}>
            {level}
          </span>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">Your Profile</h2>
          <p className="text-sm text-muted-foreground">Level {level} · {levelTitle}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className={cn('flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold', leagueMeta.bg, leagueMeta.color)}>
              <i className={cn('ti', leagueMeta.icon)} aria-hidden="true" />
              {leagueMeta.label} League
            </span>
            {streak > 0 && (
              <span className="flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">
                <i className="ti ti-flame" aria-hidden="true" />
                {streak}d streak
              </span>
            )}
            {xp > 0 && (
              <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
                <i className="ti ti-star" aria-hidden="true" />
                {xp.toLocaleString()} XP
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          {
            label: 'Est. SAT',
            value: estimatedSAT > 0 ? estimatedSAT.toLocaleString() : '—',
            icon: 'ti-chart-line',
            color: 'text-primary bg-emerald-50',
          },
          {
            label: 'Confidence',
            value: confidenceScore > 0 ? `${confidenceScore}%` : '—',
            icon: 'ti-brain',
            color: 'text-purple-600 bg-purple-50',
          },
          {
            label: 'Longest Streak',
            value: longestStreak > 0 ? `${longestStreak}d` : '—',
            icon: 'ti-flame',
            color: 'text-orange-500 bg-orange-50',
          },
          {
            label: 'Weekly XP',
            value: weeklyXp > 0 ? weeklyXp.toLocaleString() : '0',
            icon: 'ti-star',
            color: 'text-amber-600 bg-amber-50',
          },
          {
            label: 'Study Today',
            value: studyMinutesToday > 0 ? `${studyMinutesToday}m` : '0m',
            icon: 'ti-clock-hour-4',
            color: 'text-blue-600 bg-blue-50',
          },
          {
            label: 'Achievements',
            value: `${unlockedAchievements.length}`,
            icon: 'ti-trophy',
            color: 'text-primary bg-emerald-50',
          },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <span className={cn('flex h-8 w-8 items-center justify-center rounded-xl text-sm mb-2', s.color)}>
              <i className={cn('ti', s.icon)} aria-hidden="true" />
            </span>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Badge shelf */}
      {unlockedAchievements.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Badges Earned</h3>
          <div className="flex flex-wrap gap-3">
            {unlockedAchievements.map((a) => (
              <div
                key={a.id}
                title={`${a.title} — ${a.description}`}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-2xl text-xl',
                  'shadow-sm ring-2 ring-white hover:scale-110 transition-transform cursor-default',
                  difficultyBg(a.difficulty),
                )}
              >
                <i className={cn('ti', a.icon)} aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center">
          <i className="ti ti-shield text-2xl text-muted-foreground/40" aria-hidden="true" />
          <p className="mt-2 text-sm text-muted-foreground">No badges yet.</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Study consistently to earn your first one.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Achievement unlock toast ─────────────────────────────────────────────────

export function AchievementToast({
  achievement,
  onDismiss,
}: {
  achievement: Achievement
  onDismiss: () => void
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, 5000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [onDismiss])

  return (
    <div
      className="achievement-toast pointer-events-auto flex items-center gap-4 rounded-2xl border border-primary/30 bg-card px-5 py-4 shadow-xl"
      role="alert"
      aria-live="polite"
    >
      <span className={cn(
        'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ring-4 ring-primary/20',
        difficultyBg(achievement.difficulty),
      )}>
        <i className={cn('ti', achievement.icon)} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Achievement Unlocked</p>
        <p className="mt-0.5 text-sm font-bold text-foreground">{achievement.title}</p>
        <p className="text-[11px] text-muted-foreground">{achievement.description}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <XpPill xp={achievement.xpReward} />
        <button
          type="button"
          onClick={onDismiss}
          className="text-[10px] text-muted-foreground hover:text-foreground"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

// ─── Main AchievementsView ────────────────────────────────────────────────────

interface AchievementsViewProps {
  api: GamificationApi
}

export function AchievementsView({ api }: AchievementsViewProps) {
  const { state } = api
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Tab nav */}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-2xl border border-border bg-card p-1.5 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all',
              tab === t.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <i className={cn('ti', t.icon, 'text-sm')} aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab state={state} api={api} />}
      {tab === 'achievements' && <AchievementsTab achievements={state.achievements} />}
      {tab === 'quests' && <QuestsTab quests={state.quests} api={api} />}
      {tab === 'journey' && (
        <div className="flex flex-col gap-5">
          <JourneyTab journey={state.journey} />
          <ConfidenceTree branches={state.treeBranches} />
        </div>
      )}
      {tab === 'profile' && <ProfileTab state={state} />}
    </div>
  )
}
