'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminAuthenticated } from '@/app/admin/actions'
import { nanoid } from 'nanoid'

/** Validate an invite code without consuming it. Returns true if valid & unused. */
export async function validateInviteCode(code: string): Promise<{ valid: boolean; error?: string }> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('invite_codes')
    .select('id, used')
    .eq('code', code.trim().toUpperCase())
    .single()

  if (error || !data) return { valid: false, error: 'Invalid invite code.' }
  if (data.used) return { valid: false, error: 'This invite code has already been used.' }
  return { valid: true }
}

/** Mark an invite code as used after successful sign-up. */
export async function consumeInviteCode(code: string, userId: string): Promise<void> {
  const supabase = createAdminClient()
  await supabase
    .from('invite_codes')
    .update({ used: true, used_by: userId, used_at: new Date().toISOString() })
    .eq('code', code.trim().toUpperCase())
}

// ── Admin actions ──────────────────────────────────────────────────────────

async function requireAdmin() {
  const authed = await isAdminAuthenticated()
  if (!authed) throw new Error('Unauthorized')
}

export type InviteCode = {
  id: string
  code: string
  note: string | null
  used: boolean
  used_at: string | null
  created_at: string
}

/** List all invite codes (admin only). */
export async function listInviteCodes(): Promise<InviteCode[]> {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('invite_codes')
    .select('id, code, note, used, used_at, created_at')
    .order('created_at', { ascending: false })
  return (data ?? []) as InviteCode[]
}

/** Create one or more invite codes (admin only). */
export async function createInviteCodes(
  count: number,
  note: string,
): Promise<InviteCode[]> {
  await requireAdmin()
  const supabase = createAdminClient()

  const rows = Array.from({ length: count }, () => ({
    code: nanoid(8).toUpperCase(),
    note: note.trim() || null,
  }))

  const { data, error } = await supabase
    .from('invite_codes')
    .insert(rows)
    .select('id, code, note, used, used_at, created_at')

  if (error) throw new Error(error.message)
  return (data ?? []) as InviteCode[]
}

/** Delete an invite code by id (admin only). */
export async function deleteInviteCode(id: string): Promise<void> {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('invite_codes').delete().eq('id', id)
}
