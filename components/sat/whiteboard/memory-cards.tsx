'use client'

import { cn } from '@/lib/utils'
import { MEMORY_ITEMS, type MemoryItem } from './lesson-data'

function MemoryRow({ item, forceIcon }: { item: MemoryItem; forceIcon?: boolean }) {
  return (
    <li className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2">
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm',
          item.tone === 'good' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700',
        )}
        aria-hidden="true"
      >
        <i className={cn('ti', !forceIcon && item.tone === 'good' ? 'ti-check' : item.icon)} />
      </span>
      <span className="text-xs leading-snug text-foreground">{item.text}</span>
    </li>
  )
}

export function MemoryCards({ sessionEvents = [] }: { sessionEvents?: MemoryItem[] }) {
  return (
    <section className="flex flex-col gap-4">
      {/* Live, this-session activity recorded as the student works. */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <i className="ti ti-activity-heartbeat text-base text-primary" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-foreground">This session</h3>
        </div>
        {sessionEvents.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-background px-3 py-3 text-xs leading-snug text-muted-foreground">
            As you ask questions, take hints, and try practice problems, I&apos;ll track what you
            work on here.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sessionEvents.map((item, i) => (
              <MemoryRow key={`${item.text}-${i}`} item={item} forceIcon />
            ))}
          </ul>
        )}
      </div>

      {/* Longer-term profile signals. */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <i className="ti ti-brain text-base text-primary" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-foreground">What SAT Sage remembers</h3>
        </div>
        <ul className="flex flex-col gap-2">
          {MEMORY_ITEMS.map((item) => (
            <MemoryRow key={item.text} item={item} />
          ))}
        </ul>
      </div>
    </section>
  )
}
