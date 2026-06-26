'use client'

import { useEffect, useRef, useState } from 'react'
import type { AppStats, DashboardView, TriageData } from '@/lib/sat-types'
import type { GamificationState } from '@/lib/use-gamification'
import { cn } from '@/lib/utils'

// ── Shared helpers ──────────────────────────────────────────────────────────

function FillBar({ pct, className }: { pct: number; className?: string }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW(pct), 80); return () => clearTimeout(t) }, [pct])
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn('h-full rounded-full transition-all duration-700 ease-out', className ?? 'bg-primary')}
        style={{ width: `${w}%` }}
      />
    </div>
  )
}

function StatPill({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
      <i className={cn('ti', icon, 'text-lg text-primary')} aria-hidden="true" />
      <span className="text-lg font-bold tabular-nums text-foreground">{value}</span>
      <span className="text-center text-[11px] text-muted-foreground">{label}</span>
    </div>
  )
}

const LEAGUE_META: Record<string, { label: string; color: string; icon: string }> = {
  bronze:  { label: 'Bronze',  color: 'text-amber-700',   icon: 'ti-medal' },
  silver:  { label: 'Silver',  color: 'text-slate-500',   icon: 'ti-medal' },
  gold:    { label: 'Gold',    color: 'text-yellow-500',  icon: 'ti-medal-2' },
  diamond: { label: 'Diamond', color: 'text-sky-500',     icon: 'ti-diamond' },
  master:  { label: 'Master',  color: 'text-purple-500',  icon: 'ti-crown' },
  legend:  { label: 'Legend',  color: 'text-primary',     icon: 'ti-star' },
}

// ── Profile component ──────────────────────────────────────────────────────

interface ProfileViewProps {
  triage: TriageData
  stats: AppStats
  gamification: GamificationState
  onNavigate: (view: DashboardView) => void
}

type ProfileTab = 'overview' | 'achievements' | 'history' | 'subjects'

export function ProfileView({ triage, stats, gamification, onNavigate }: ProfileViewProps) {
  const [tab, setTab] = useState<ProfileTab>('overview')
  const [editingName, setEditingName] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingName) nameRef.current?.focus()
  }, [editingName])

  const accuracy = stats.practiceAnswered > 0
    ? Math.round((stats.practiceCorrect / stats.practiceAnswered) * 100)
    : 0

  const cardRetention = stats.flashcardsReviewed > 0
    ? Math.round((stats.flashcardsKnown / stats.flashcardsReviewed) * 100)
    : 0

  const hoursStudied = Math.round(stats.focusSeconds / 3600)
  const leagueMeta = LEAGUE_META[gamification.league] ?? LEAGUE_META.bronze

  // Weak vs strong sections from sectionStats
  const sectionEntries = Object.entries(stats.sectionStats)
    .filter(([, v]) => v.answered > 0)
    .map(([section, v]) => ({
      section,
      pct: Math.round((v.correct / v.answered) * 100),
    }))
    .sort((a, b) => a.pct - b.pct)

  const weakest  = sectionEntries.slice(0, 3)
  const strongest = [...sectionEntries].sort((a, b) => b.pct - a.pct).slice(0, 3)

  // Unlocked achievements
  const unlocked = gamification.achievements.filter((a) => a.unlocked)

  const TABS: { id: ProfileTab; label: string; icon: string }[] = [
    { id: 'overview',      label: 'Overview',      icon: 'ti-layout-dashboard' },
    { id: 'achievements',  label: 'Achievements',  icon: 'ti-trophy' },
    { id: 'history',       label: 'Journey',       icon: 'ti-timeline' },
    { id: 'subjects',      label: 'Subjects',      icon: 'ti-chart-bar' },
  ]

  return (
    <div className="animate-fade-in flex flex-col gap-6">

      {/* ── Hero card ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {/* Background banner strip — fixed height so it doesn't overflow name */}
        <div className="h-20 w-full bg-secondary" aria-hidden="true" />

        <div className="relative px-6 pb-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end -mt-10">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-background bg-secondary text-3xl font-bold text-primary shadow-md">
                {displayName ? displayName.charAt(0).toUpperCase() : '?'}
              </div>
              {/* Level badge */}
              <div className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-primary text-[11px] font-bold text-primary-foreground shadow">
                {gamification.level}
              </div>
            </div>

            {/* Name + title */}
            <div className="flex flex-1 flex-col gap-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={nameRef}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onBlur={() => setEditingName(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
                    className="rounded-lg border border-border bg-background px-2 py-1 text-xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Your name"
                    aria-label="Display name"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingName(true)}
                  className="group flex items-center gap-2 text-left"
                  aria-label="Edit display name"
                >
                  <h1 className="text-2xl font-bold text-foreground">
                    {displayName || 'Your Name'}
                  </h1>
                  <i className="ti ti-pencil text-sm text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                </button>
              )}
              <p className="text-sm font-medium text-primary">{gamification.levelTitle}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <i className={cn('ti', leagueMeta.icon, leagueMeta.color)} aria-hidden="true" />
                <span className={leagueMeta.color}>{leagueMeta.label} League</span>
                <span>·</span>
                <i className="ti ti-flame text-orange-500" aria-hidden="true" />
                <span>{gamification.streak} day streak</span>
              </div>
            </div>

            {/* XP + level bar */}
            <div className="flex flex-col gap-1.5 sm:w-48">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                  {gamification.xp.toLocaleString()} XP
                </span>
                <span className="text-muted-foreground">
                  Level {gamification.level + 1} at {gamification.xpForNextLevel.toLocaleString()}
                </span>
              </div>
              <FillBar pct={gamification.levelProgress} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick stats row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        <StatPill
          icon="ti-target"
          label="Estimated SAT"
          value={gamification.estimatedSAT > 0 ? gamification.estimatedSAT : '—'}
        />
        <StatPill
          icon="ti-pencil"
          label="Questions answered"
          value={stats.practiceAnswered.toLocaleString()}
        />
        <StatPill
          icon="ti-clock"
          label="Hours studied"
          value={hoursStudied}
        />
        <StatPill
          icon="ti-cards"
          label="Cards reviewed"
          value={stats.flashcardsReviewed.toLocaleString()}
        />
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar rounded-xl border border-border bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              tab === t.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <i className={cn('ti', t.icon)} aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview tab ─────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="flex flex-col gap-4">
          {/* Score targets */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Score targets</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Current Math', value: triage.lastMath || '—', sub: 'self-reported' },
                { label: 'Goal Math', value: triage.goalMath || '—', sub: 'target' },
                { label: 'Current R&W', value: triage.lastRW || '—', sub: 'self-reported' },
                { label: 'Goal R&W', value: triage.goalRW || '—', sub: 'target' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-0.5 rounded-xl bg-muted/50 p-3">
                  <span className="text-[11px] text-muted-foreground">{item.label}</span>
                  <span className="text-2xl font-bold tabular-nums text-foreground">{item.value}</span>
                  <span className="text-[11px] text-muted-foreground">{item.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Accuracy bars */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Performance overview</h2>
            {stats.practiceAnswered === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <i className="ti ti-pencil-question text-3xl text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  No practice sessions yet. Head to Practice to begin.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('practice')}
                  className="mt-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Start practising
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Practice accuracy', pct: accuracy, color: 'bg-primary' },
                  { label: 'Flashcard retention', pct: cardRetention, color: 'bg-chart-2' },
                  { label: 'Daily goal progress', pct: gamification.dailyGoalPct, color: 'bg-chart-4' },
                  { label: 'Level progress', pct: gamification.levelProgress, color: 'bg-chart-3' },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-semibold tabular-nums text-foreground">{row.pct}%</span>
                    </div>
                    <FillBar pct={row.pct} className={row.color} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weak areas from triage */}
          {triage.weakAreas.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Focus areas</h2>
              <div className="flex flex-wrap gap-2">
                {triage.weakAreas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Achievements tab ─────────────────────────────────────────── */}
      {tab === 'achievements' && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Earned badges
            </h2>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
              {unlocked.length} / {gamification.achievements.length}
            </span>
          </div>
          {unlocked.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <i className="ti ti-trophy text-4xl text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">No badges yet</p>
              <p className="text-xs text-muted-foreground">
                Complete practice sessions, streaks, and quests to earn badges.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('achievements')}
                className="mt-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                View all achievements
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {unlocked.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-3 text-center"
                >
                  <span className="text-2xl" role="img" aria-label={a.title}>{a.icon}</span>
                  <p className="text-xs font-semibold text-foreground">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground">{a.description}</p>
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                    a.difficulty === 'bronze'   && 'bg-amber-100 text-amber-700',
                    a.difficulty === 'silver'   && 'bg-slate-100 text-slate-600',
                    a.difficulty === 'gold'     && 'bg-yellow-100 text-yellow-600',
                    a.difficulty === 'platinum' && 'bg-sky-100 text-sky-600',
                  )}>
                    {a.difficulty}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Journey tab ──────────────────────────────────────────────── */}
      {tab === 'history' && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Learning journey</h2>
          {gamification.journey.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <i className="ti ti-timeline text-4xl text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Your journey starts with the first question you answer.</p>
            </div>
          ) : (
            <ol className="flex flex-col gap-0" aria-label="Journey milestones">
              {gamification.journey.map((m, i) => (
                <li key={m.id} className="flex gap-4">
                  {/* Timeline spine */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm',
                      m.done
                        ? 'border-primary bg-secondary text-primary'
                        : 'border-border bg-muted text-muted-foreground',
                    )}>
                      <i className={cn('ti', m.icon, 'text-sm')} aria-hidden="true" />
                    </div>
                    {i < gamification.journey.length - 1 && (
                      <div className={cn('mt-1 w-0.5 flex-1', m.done ? 'bg-primary/30' : 'bg-border')} />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-5">
                    <p className={cn('text-sm font-medium', m.done ? 'text-foreground' : 'text-muted-foreground')}>
                      {m.event}
                    </p>
                    {m.reachedAt && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(m.reachedAt).toLocaleDateString()}
                      </p>
                    )}
                    {!m.done && (
                      <p className="text-xs text-muted-foreground">Not yet reached</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* ── Subjects tab ─────────────────────────────────────────────── */}
      {tab === 'subjects' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Strongest areas</h2>
            {strongest.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Complete practice questions to see your strongest topics.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {strongest.map((s) => (
                  <div key={s.section}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{s.section}</span>
                      <span className="tabular-nums text-primary">{s.pct}%</span>
                    </div>
                    <FillBar pct={s.pct} className="bg-primary" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Needs work</h2>
            {weakest.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Complete practice questions to see areas for improvement.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {weakest.map((s) => (
                  <div key={s.section}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{s.section}</span>
                      <span className="tabular-nums text-orange-600">{s.pct}%</span>
                    </div>
                    <FillBar pct={s.pct} className="bg-orange-400" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confidence tree branches */}
          {gamification.treeBranches.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Mastery map</h2>
              <div className="flex flex-col gap-3">
                {gamification.treeBranches.map((b) => (
                  <div key={b.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{b.label}</span>
                      <span className="tabular-nums font-medium text-foreground">{b.mastery}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${b.mastery}%`, backgroundColor: b.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
