'use client'

import { cn } from '@/lib/utils'
import { MEMORY_ITEMS } from './lesson-data'

export function MemoryCards() {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <i className="ti ti-brain text-base text-primary" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-foreground">What SAT Sage remembers</h3>
      </div>
      <ul className="flex flex-col gap-2">
        {MEMORY_ITEMS.map((item) => (
          <li
            key={item.text}
            className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2"
          >
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm',
                item.tone === 'good'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-amber-100 text-amber-700',
              )}
              aria-hidden="true"
            >
              <i className={cn('ti', item.tone === 'good' ? 'ti-check' : item.icon)} />
            </span>
            <span className="text-xs leading-snug text-foreground">{item.text}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
