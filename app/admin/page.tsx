import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/app/admin/actions'
import { listInviteCodes } from '@/app/auth/actions'
import AdminInvitePanel from './admin-invite-panel'

export const metadata = { title: 'Admin — Invite Codes' }

export default async function AdminPage() {
  const authed = await isAdminAuthenticated()
  if (!authed) redirect('/admin/login')

  const codes = await listInviteCodes()
  return <AdminInvitePanel initialCodes={codes} />
}
