'use server'

import { createClient } from '@/lib/supabase/server'

export interface WaitlistFormState {
  success: boolean
  error: string | null
  alreadySignedUp?: boolean
}

export async function joinWaitlist(
  _prev: WaitlistFormState,
  formData: FormData,
): Promise<WaitlistFormState> {
  const email = (formData.get('email') as string | null)?.trim().toLowerCase()
  const name = (formData.get('name') as string | null)?.trim()
  const daysUntilSat = formData.get('days_until_sat') as string | null

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  if (!daysUntilSat) {
    return { success: false, error: 'Please tell us how far out your SAT is.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('waitlist').insert({
    email,
    name: name || null,
    days_until_sat: daysUntilSat,
  })

  if (error) {
    if (error.code === '23505') {
      // unique constraint — already on the list
      return { success: true, error: null, alreadySignedUp: true }
    }
    console.error('[waitlist] insert error:', error.message)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }

  return { success: true, error: null }
}
