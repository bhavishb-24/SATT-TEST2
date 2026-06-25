'use client'

import Link from 'next/link'
import type { DashboardView } from '@/lib/sat-types'
import type { PanicTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './sidebar'

interface MobileNavProps {
  active: DashboardView
  onNavigate: (view: DashboardView) => void
  theme: PanicTheme
}

export function MobileNav({ active, onNavigate, theme }: MobileNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur lg:hidden"
      aria-label="Primary"
    >
      <ul className="no-scrollbar flex items-stretch gap-1 overflow-x-auto px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.view === active
          return (
            <li key={item.view} className="shrink-0">
              <button
                type="button"
                data-tour={`nav-${item.view}`}
                onClick={() => onNavigate(item.view)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex min-w-[64px] flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-colors',
                  isActive
                    ? cn(theme.accentBgSoft, theme.accentText)
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <i className={cn('ti', item.icon, 'text-lg')} aria-hidden="true" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            </li>
          )
        })}

        {/* Whiteboard is a standalone route, linked separately. */}
        <li className="shrink-0">
          <Link
            href="/whiteboard"
            className="flex min-w-[64px] flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <i className="ti ti-whiteboard text-lg" aria-hidden="true" />
            <span className="whitespace-nowrap">Whiteboard</span>
          </Link>
        </li>
      </ul>
    </nav>
  )
}
