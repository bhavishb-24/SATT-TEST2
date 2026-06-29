'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { listInviteCodes, listUsers, listWaitlist, type InviteCode, type AdminUser, type WaitlistEntry } from '@/app/auth/actions'
import AdminInvitePanel from './admin-invite-panel'
import AdminUsersPanel from './admin-users-panel'
import AdminWaitlistPanel from './admin-waitlist-panel'

type Tab = 'codes' | 'users' | 'waitlist'

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab]         = useState<Tab>('codes')
  const [codes, setCodes]     = useState<InviteCode[]>([])
  const [users, setUsers]     = useState<AdminUser[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [adminKey, setAdminKey] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async (key: string) => {
    const [c, u, w] = await Promise.all([
      listInviteCodes(key),
      listUsers(key),
      listWaitlist(key),
    ])
    setCodes(c)
    setUsers(u)
    setWaitlist(w)
  }, [])

  useEffect(() => {
    async function init() {
      const key = (() => {
        try { return sessionStorage.getItem('admin_key') } catch { return null }
      })()
      if (!key) { router.replace('/admin/login'); return }
      setAdminKey(key)
      try {
        await fetchAll(key)
        setLoading(false)
      } catch {
        try { sessionStorage.removeItem('admin_key') } catch { /* ignore */ }
        router.replace('/admin/login')
      }
    }
    init()
  }, [router, fetchAll])

  const handleRefresh = useCallback(async () => {
    if (adminKey) await fetchAll(adminKey)
  }, [adminKey, fetchAll])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <i className="ti ti-loader-2 animate-spin text-2xl text-muted-foreground" aria-hidden="true" />
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'codes',    label: 'Invite Codes',          icon: 'ti-key'      },
    { id: 'users',    label: `Users (${users.length})`,    icon: 'ti-users'    },
    { id: 'waitlist', label: `Waitlist (${waitlist.length})`, icon: 'ti-clock'    },
  ]

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage invite codes, users, and the waitlist.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              try { sessionStorage.removeItem('admin_key') } catch { /* ignore */ }
              router.push('/admin/login')
            }}
            className="flex min-h-[36px] items-center gap-1.5 rounded-xl border border-border bg-card px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <i className="ti ti-logout text-sm" aria-hidden="true" />
            Sign out
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex w-fit gap-1 rounded-xl border border-border bg-muted/40 p-1">
          {tabs.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <i className={`ti ${t.icon}`} aria-hidden="true" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'codes' && (
          <AdminInvitePanel initialCodes={codes} adminKey={adminKey} />
        )}
        {tab === 'users' && (
          <AdminUsersPanel initial={users} onRefresh={handleRefresh} />
        )}
        {tab === 'waitlist' && (
          <AdminWaitlistPanel initial={waitlist} onRefresh={handleRefresh} />
        )}

      </div>
    </div>
  )
}
