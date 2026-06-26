'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { DashboardView } from '@/lib/sat-types'
import type { PanicTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

export interface NavItem {
  view: DashboardView
  label: string
  icon: string
}

export const NAV_ITEMS: NavItem[] = [
  { view: 'home', label: 'Dashboard', icon: 'ti-layout-dashboard' },
  { view: 'plan', label: 'Study Plan', icon: 'ti-list-check' },
  { view: 'practice', label: 'Practice', icon: 'ti-pencil-question' },
  { view: 'mocktest', label: 'Mock Tests', icon: 'ti-clipboard-check' },
  { view: 'flashcards', label: 'Flashcards', icon: 'ti-cards' },
  { view: 'achievements', label: 'Achievements', icon: 'ti-trophy' },
  { view: 'brain', label: 'AI Brain\u2122', icon: 'ti-brain' },
  { view: 'community', label: 'Question Bank', icon: 'ti-stack-2' },
  { view: 'checklist', label: 'Night Checklist', icon: 'ti-checklist' },
  { view: 'morning', label: 'Morning Mode', icon: 'ti-sunrise' },
  { view: 'asktutor', label: 'Ask AI Tutor', icon: 'ti-camera-question' },
]

interface SidebarProps {
  active: DashboardView
  onNavigate: (view: DashboardView) => void
  theme: PanicTheme
  countdownLabel: string
  countdownSub: string
}

export function Sidebar({
  active,
  onNavigate,
  theme,
  countdownLabel,
  countdownSub,
}: SidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Image
          src="/logo.png"
          alt="SAT Sage logo"
          width={36}
          height={36}
          className="h-9 w-9 rounded-lg object-contain"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight text-foreground">
            SAT Sage
          </p>
          <p className="truncate text-xs text-muted-foreground">Night-before mode</p>
        </div>
      </div>

      {/* Countdown */}
      <div className="px-3">
        <div data-tour="countdown" className={cn('rounded-xl p-3', theme.accentBgSoft)}>
          <p className={cn('text-xs font-medium', theme.accentText)}>Time until test</p>
          <p className={cn('text-xl font-bold tabular-nums', theme.accentText)}>
            {countdownLabel}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{countdownSub}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-3 flex-1 overflow-y-auto px-3 pb-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.view === active
            return (
              <li key={item.view}>
                <button
                  type="button"
                  data-tour={`nav-${item.view}`}
                  onClick={() => onNavigate(item.view)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? cn(theme.accentBg, 'text-white')
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <i className={cn('ti', item.icon, 'text-lg')} aria-hidden="true" />
                  {item.label}
                </button>
              </li>
            )
          })}

          {/* Whiteboard lives on its own full-screen route, so it uses a real link. */}
          <li>
            <Link
              href="/whiteboard"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <i className="ti ti-chalkboard text-lg" aria-hidden="true" />
              Whiteboard AI
              <i
                className="ti ti-sparkles ml-auto text-sm text-primary"
                aria-hidden="true"
              />
            </Link>
          </li>

          {/* Study Rooms — standalone route */}
          <li>
            <Link
              href="/rooms"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <i className="ti ti-users-group text-lg" aria-hidden="true" />
              Study Rooms
              <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-foreground">
                NEW
              </span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="border-t border-border px-5 py-3">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          You&apos;ve got this. One topic at a time.
        </p>
      </div>
    </aside>
  )
}
