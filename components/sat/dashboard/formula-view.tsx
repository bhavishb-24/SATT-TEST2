'use client'

import { useMemo, useState } from 'react'
import type { Section } from '@/lib/sat-types'
import type { PanicTheme } from '@/lib/theme'
import { FORMULA_GROUPS } from '@/lib/formula-data'
import { cn } from '@/lib/utils'
import { Math } from './math'

interface FormulaViewProps {
  theme: PanicTheme
}

type Filter = Section | 'All'

export function FormulaView({ theme }: FormulaViewProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('All')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    return FORMULA_GROUPS.map((group) => {
      if (filter !== 'All' && group.section !== filter) return null
      const formulas = group.formulas.filter(
        (f) =>
          !q ||
          f.name.toLowerCase().includes(q) ||
          f.note.toLowerCase().includes(q) ||
          group.category.toLowerCase().includes(q),
      )
      if (formulas.length === 0) return null
      return { ...group, formulas }
    }).filter(Boolean) as typeof FORMULA_GROUPS
  }, [query, filter])

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-foreground">Formula & Rule Sheet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every must-know SAT math formula and grammar rule in one place.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <i
            className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search formulas and rules…"
            aria-label="Search formulas"
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          {(['All', 'Math', 'Reading & Writing'] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                filter === f
                  ? cn(theme.accentBg, 'text-card border-transparent')
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              {f === 'Reading & Writing' ? 'R&W' : f}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No formulas match your search.
        </p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {groups.map((group) => (
            <section
              key={group.category}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg',
                    theme.accentBgSoft,
                    theme.accentText,
                  )}
                >
                  <i className={cn('ti', group.icon)} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {group.category}
                  </h3>
                  <p className="text-xs text-muted-foreground">{group.section}</p>
                </div>
              </div>
              <ul className="flex flex-col divide-y divide-border">
                {group.formulas.map((f) => (
                  <li key={f.name} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{f.name}</p>
                      <span className="rounded bg-muted px-2 py-1 text-sm text-foreground">
                        <Math expression={f.expression} />
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{f.note}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
