'use client'

import { useMemo, useState } from 'react'
import type { AppStats } from '@/lib/sat-types'
import type { GamificationState } from '@/lib/use-gamification'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────

type NotifCategory =
  | 'all'
  | 'ai'
  | 'reminders'
  | 'achievements'
  | 'community'
  | 'system'

interface Notification {
  id: string
  category: Exclude<NotifCategory, 'all'>
  icon: string
  iconColor: string
  title: string
  body: string
  time: string
  read: boolean
  /** Optional CTA that navigates somewhere */
  action?: string
}

// ── Derive real notifications from live app state ──────────────────────────

function buildNotifications(
  stats: AppStats,
  gamification: GamificationState,
): Notification[] {
  const notes: Notification[] = []

  // Achievement unlocks — real data from gamification state
  for (const a of gamification.achievements.filter((a) => a.unlocked)) {
    notes.push({
      id: `ach-${a.id}`,
      category: 'achievements',
      icon: a.icon,
      iconColor: 'text-yellow-500',
      title: `Badge earned: ${a.title}`,
      body: a.description,
      time: a.unlockedAt ? new Date(a.unlockedAt).toLocaleString() : 'Recently',
      read: false,
    })
  }

  // AI insight — only if practice has started
  if (stats.practiceAnswered > 0) {
    const acc = Math.round((stats.practiceCorrect / stats.practiceAnswered) * 100)
    notes.push({
      id: 'ai-accuracy',
      category: 'ai',
      icon: 'ti-robot',
      iconColor: 'text-primary',
      title: 'AI insight: practice accuracy',
      body: `Your overall practice accuracy is ${acc}%. ${
        acc >= 70
          ? 'Great work. Keep reinforcing your strong topics.'
          : 'Focus on your weak areas in the Study Plan to improve.'
      }`,
      time: 'Based on your session',
      read: acc >= 70,
    })
  }

  // Streak notification — only if streak > 0
  if (gamification.streak > 0) {
    notes.push({
      id: 'streak',
      category: 'reminders',
      icon: 'ti-flame',
      iconColor: 'text-orange-500',
      title: `${gamification.streak}-day streak active`,
      body: 'Keep it going. Study today to maintain your streak.',
      time: 'Today',
      read: gamification.streak >= 3,
    })
  }

  // Flashcard reminder — if flashcards not yet started
  if (stats.flashcardsReviewed === 0) {
    notes.push({
      id: 'flashcard-start',
      category: 'reminders',
      icon: 'ti-cards',
      iconColor: 'text-primary',
      title: 'Start your first flashcard session',
      body: 'Flashcard review is one of the highest-ROI study activities. Try 10 cards tonight.',
      time: 'Suggestion',
      read: false,
      action: 'flashcards',
    })
  }

  // Level-up event — if level > 1
  if (gamification.level > 1) {
    notes.push({
      id: `level-${gamification.level}`,
      category: 'achievements',
      icon: 'ti-arrow-big-up',
      iconColor: 'text-primary',
      title: `You reached Level ${gamification.level}: ${gamification.levelTitle}`,
      body: `You earned ${gamification.xp.toLocaleString()} XP so far. Keep going to reach the next level.`,
      time: 'Recently',
      read: false,
    })
  }

  // System note — always present
  notes.push({
    id: 'system-welcome',
    category: 'system',
    icon: 'ti-sparkles',
    iconColor: 'text-primary',
    title: 'Welcome to SAT Sage',
    body: 'Your personalized SAT prep companion is ready. Complete the diagnostic to unlock your full plan.',
    time: 'Getting started',
    read: stats.practiceAnswered > 0,
  })

  // Sort: unread first, then most recent
  return notes.sort((a, b) => (a.read === b.read ? 0 : a.read ? 1 : -1))
}

// ── Category config ────────────────────────────────────────────────────────

const CATEGORIES: { id: NotifCategory; label: string; icon: string }[] = [
  { id: 'all',          label: 'All',          icon: 'ti-bell' },
  { id: 'ai',           label: 'AI',           icon: 'ti-robot' },
  { id: 'reminders',    label: 'Reminders',    icon: 'ti-clock' },
  { id: 'achievements', label: 'Achievements', icon: 'ti-trophy' },
  { id: 'community',    label: 'Community',    icon: 'ti-users' },
  { id: 'system',       label: 'System',       icon: 'ti-settings' },
]

// ── Notification item ──────────────────────────────────────────────────────

function NotifItem({
  notif,
  onRead,
  onDismiss,
}: {
  notif: Notification
  onRead: (id: string) => void
  onDismiss: (id: string) => void
}) {
  return (
    <div
      className={cn(
        'group relative flex gap-3 rounded-2xl border p-4 transition-all',
        notif.read
          ? 'border-border bg-card'
          : 'border-primary/20 bg-secondary/30',
      )}
    >
      {/* Unread dot */}
      {!notif.read && (
        <span
          className="absolute right-4 top-4 h-2 w-2 rounded-full bg-primary"
          aria-label="Unread"
        />
      )}

      {/* Icon */}
      <div className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg',
        notif.read ? 'bg-muted' : 'bg-secondary',
      )}>
        {notif.icon.startsWith('ti') ? (
          <i className={cn('ti', notif.icon, notif.iconColor)} aria-hidden="true" />
        ) : (
          <span role="img" aria-label={notif.title}>{notif.icon}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pr-6">
        <p className={cn('text-sm font-semibold', notif.read ? 'text-muted-foreground' : 'text-foreground')}>
          {notif.title}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">{notif.body}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{notif.time}</p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 flex-col items-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        {!notif.read && (
          <button
            type="button"
            onClick={() => onRead(notif.id)}
            className="rounded-lg px-2 py-1 text-[11px] font-medium text-primary hover:bg-secondary"
            aria-label="Mark as read"
          >
            Mark read
          </button>
        )}
        <button
          type="button"
          onClick={() => onDismiss(notif.id)}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          aria-label="Dismiss notification"
        >
          <i className="ti ti-x text-xs" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

interface NotificationsViewProps {
  stats: AppStats
  gamification: GamificationState
}

export function NotificationsView({ stats, gamification }: NotificationsViewProps) {
  const [activeCategory, setActiveCategory] = useState<NotifCategory>('all')
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  const allNotifs = useMemo(
    () => buildNotifications(stats, gamification),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stats.practiceAnswered, stats.flashcardsReviewed, gamification.streak, gamification.level, gamification.achievements.length],
  )

  const visible = allNotifs
    .filter((n) => !dismissedIds.has(n.id))
    .map((n) => ({ ...n, read: n.read || readIds.has(n.id) }))

  const filtered = activeCategory === 'all'
    ? visible
    : visible.filter((n) => n.category === activeCategory)

  const unreadCount = visible.filter((n) => !n.read).length

  function markRead(id: string) {
    setReadIds((prev) => new Set([...prev, id]))
  }

  function dismiss(id: string) {
    setDismissedIds((prev) => new Set([...prev, id]))
  }

  function markAllRead() {
    setReadIds(new Set(visible.map((n) => n.id)))
  }

  return (
    <div className="animate-fade-in flex flex-col gap-5">

      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-foreground">Notifications</h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-sm font-medium text-primary hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const count = cat.id === 'all'
            ? visible.filter((n) => !n.read).length
            : visible.filter((n) => n.category === cat.id && !n.read).length
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              aria-pressed={activeCategory === cat.id}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                activeCategory === cat.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              <i className={cn('ti', cat.icon, 'text-sm')} aria-hidden="true" />
              {cat.label}
              {count > 0 && (
                <span className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
                  activeCategory === cat.id
                    ? 'bg-white/25 text-white'
                    : 'bg-primary/10 text-primary',
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <i className="ti ti-bell-off text-4xl text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">
            {activeCategory === 'all' ? 'All caught up' : `No ${activeCategory} notifications`}
          </p>
          <p className="text-xs text-muted-foreground">
            {activeCategory === 'community'
              ? 'Join the Community Question Bank to get activity updates.'
              : 'New notifications will appear here as you use SAT Sage.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((n) => (
            <NotifItem
              key={n.id}
              notif={n}
              onRead={markRead}
              onDismiss={dismiss}
            />
          ))}
        </div>
      )}

      {/* Backend CTA */}
      <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-center">
        <i className="ti ti-bell-ringing mb-2 text-2xl text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">Real-time notifications</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Connect Supabase Realtime to receive live push notifications for friend activity, community replies, and leaderboard changes.
        </p>
      </div>

    </div>
  )
}
