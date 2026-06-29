import { redirect } from 'next/navigation'
import { isAdminAuthenticated, adminLogout } from '@/app/admin/actions'
import { listInviteCodes, listUsers } from '@/app/auth/actions'
import AdminInvitePanel from './admin-invite-panel'
import AdminUsersPanel from './admin-users-panel'

export const metadata = { title: 'Admin — SAT Sage' }

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const authed = await isAdminAuthenticated()
  if (!authed) redirect('/admin/login')

  const { tab = 'codes' } = await searchParams

  const [codes, users] = await Promise.all([
    listInviteCodes(),
    listUsers(),
  ])

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
          <form action={adminLogout}>
            <button
              type="submit"
              className="flex min-h-[36px] items-center gap-1.5 rounded-xl border border-border bg-card px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <i className="ti ti-logout text-sm" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex w-fit gap-1 rounded-xl border border-border bg-muted/40 p-1">
          {[
            { id: 'codes', label: 'Invite Codes', icon: 'ti-key' },
            { id: 'users', label: `Users (${users.length})`, icon: 'ti-users' },
          ].map(t => (
            <a
              key={t.id}
              href={`/admin?tab=${t.id}`}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <i className={`ti ${t.icon}`} aria-hidden="true" />
              {t.label}
            </a>
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
