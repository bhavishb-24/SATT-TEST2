'use client'

import { useState } from 'react'
import { type WaitlistEntry } from '@/app/auth/actions'

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function AdminWaitlistPanel({
  initial,
  onRefresh,
}: {
  initial: WaitlistEntry[]
  onRefresh: () => Promise<void>
}) {
  const [entries, setEntries] = useState<WaitlistEntry[]>(initial)
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  // Keep in sync when parent re-fetches
  if (initial !== entries && !refreshing) {
    setEntries(initial)
  }

  async function handleRefresh() {
    setRefreshing(true)
    await onRefresh()
    setRefreshing(false)
  }

  const filtered = entries.filter((e) =>
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-6">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total signups',    value: entries.length },
          { label: 'With SAT date',    value: entries.filter(e => e.sat_date).length },
          { label: '< 3 months away',  value: entries.filter(e => {
              const d = e.days_until_sat ? parseInt(e.days_until_sat) : null
              return d !== null && d <= 90
            }).length },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Refresh */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <i className={`ti ti-refresh text-base ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name / Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Signed up</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">SAT date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Time away</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {search ? 'No entries match that search.' : 'No waitlist entries yet.'}
                </td>
              </tr>
            ) : filtered.map((e, i) => {
              const days = e.days_until_sat ? parseInt(e.days_until_sat) : null
              const urgency = days !== null
                ? days <= 30  ? 'text-red-500'
                : days <= 90  ? 'text-amber-500'
                : 'text-muted-foreground'
                : 'text-muted-foreground'

              return (
                <tr key={e.id} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{e.name || '—'}</p>
                    <p className="text-xs text-muted-foreground">{e.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{fmt(e.created_at)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {e.sat_date ? fmt(e.sat_date) : '—'}
                  </td>
                  <td className={`px-4 py-3 font-medium ${urgency}`}>
                    {days !== null ? `${days}d` : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-right text-xs text-muted-foreground">{filtered.length} of {entries.length} entries</p>
    </div>
  )
}
