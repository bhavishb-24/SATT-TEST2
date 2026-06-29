'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const COOKIE_NAME = 'admin_auth'
const COOKIE_MAX_AGE = 60 * 60 * 8 // 8 hours
const IS_PROD = process.env.NODE_ENV === 'production'

// In production the app may be embedded in a cross-origin iframe (preview panes,
// deployment previews). A SameSite=Lax cookie is withheld from server-action POST
// requests in that context, so we use SameSite=None (requires Secure) in prod.
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: (IS_PROD ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
}

export async function adminLogin(formData: FormData) {
  const password = formData.get('password') as string
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    return { error: 'Admin password not configured.' }
  }

  if (password !== adminPassword) {
    return { error: 'Incorrect password.' }
  }

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, 'true', { ...COOKIE_OPTIONS, maxAge: COOKIE_MAX_AGE })

  redirect('/admin')
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 })
  redirect('/admin/login')
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value === 'true'
}
