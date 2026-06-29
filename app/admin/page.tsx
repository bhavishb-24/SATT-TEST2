'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAdminAuthenticated, adminLogout } from '@/app/admin/actions'
import { listInviteCodes, listUsers, type InviteCode, type AdminUser } from '@/app/auth/actions'
import AdminInvitePanel from './admin-invite-panel'
import AdminUsersPanel from './admin-users-panel'

type Tab = 'codes' | 'users'

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab]       = useState<Tab>('codes')
  const [codes, setCodes]   = useState<InviteCode[]>([])
  const [users, setUsers]   = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const authed = await isAdminAuthenticated()
      if (!authed) {
        router.replace('/admin/login')
        return
      }
      const [c, u] = await Promise.all([listInviteCodes(), listUsers()])
      setCodes(c)
      setUsers(u)
      setLoading(false)
    }
    init()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <i className="ti ti-loader-2 animate-spin text-2xl text-muted-foreground" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage invite codes and view users.
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await adminLogout()
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
          {([
            { id: 'codes' as Tab, label: 'Invite Codes', icon: 'ti-key' },
            { id: 'users' as Tab, label: `Users (${users.length})`, icon: 'ti-users' },
          ]).map(t => (
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
        {tab === 'codes' ? (
          <AdminInvitePanel initialCodes={codes} />
        ) : (
          <AdminUsersPanel initial={users} />
        )}

      </div>
    </div>
  )
}
