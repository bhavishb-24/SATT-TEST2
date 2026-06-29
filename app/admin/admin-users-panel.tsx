'use client'

import { useState } from 'react'
import { type AdminUser } from '@/app/auth/actions'

function timeAgo(iso: string | null): string {
  if (!iso) return 'Never'
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 2)   return 'Just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function AdminUsersPanel({
  initial,
  onRefresh,
}: {
  initial: AdminUser[]
  onRefresh: () => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  async function handleRefresh() {
    setRefreshing(true)
    await onRefresh()
    setRefreshing(false)
  }

  const filtered = initial.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-6">

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total users',     value: initial.length },
          { label: 'Active sessions', value: initial.filter(u => u.has_session).length },
          { label: 'Signed in today', value: initial.filter(u => {
              if (!u.last_sign_in) return false
              return Date.now() - new Date(u.last_sign_in).getTime() < 86_400_000
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
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Joined</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Last seen</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Session</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {search ? 'No users match that search.' : 'No users yet.'}
                </td>
              </tr>
            ) : filtered.map((u, i) => (
              <tr key={u.id} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{u.display_name !== '—' ? u.display_name : u.email}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{fmt(u.created_at)}</td>
                <td className="px-4 py-3 text-muted-foreground">{timeAgo(u.last_sign_in)}</td>
                <td className="px-4 py-3">
                  {u.has_session ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      None
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-right text-xs text-muted-foreground">{filtered.length} of {initial.length} users</p>
    </div>
  )
}
