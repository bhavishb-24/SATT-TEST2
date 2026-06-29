import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listInviteCodes } from '@/app/auth/actions'
import AdminInvitePanel from './admin-invite-panel'

export const metadata = { title: 'Admin — Invite Codes' }

export default async function AdminPage() {
  // Server-side auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const allowedEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
  if (!allowedEmails.includes(user.email?.toLowerCase() ?? '')) {
    redirect('/app')
  }

  const codes = await listInviteCodes()

  return <AdminInvitePanel initialCodes={codes} />
}
