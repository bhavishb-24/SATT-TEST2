'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { validateInviteCode, consumeInviteCode } from '@/app/auth/actions'
import { cn } from '@/lib/utils'

export default function SignUpPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [inviteCode,  setInviteCode]  = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [done,        setDone]        = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return }
    if (!inviteCode.trim())   { setError('An invite code is required to sign up.'); return }

    setLoading(true)

    // 1. Validate invite code first
    const { valid, error: codeError } = await validateInviteCode(inviteCode)
    if (!valid) {
      setError(codeError ?? 'Invalid invite code.')
      setLoading(false)
      return
    }

    // 2. Create the Supabase account
    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName.trim() || null },
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // 3. Consume the invite code
    if (data.user) {
      await consumeInviteCode(inviteCode, data.user.id)
    }

    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-3xl bg-card p-10 text-center shadow-sm ring-1 ring-border/50">
          <div className="mb-4 flex justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">
              <i className="ti ti-mail-check" />
            </span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a confirmation link to <strong className="text-foreground">{email}</strong>.
            Click it to activate your account and start studying.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="font-serif text-3xl font-bold text-primary">SAT Sage</span>
          <p className="mt-1 text-sm text-muted-foreground">Create your account with an invite code.</p>
        </div>

        <div className="rounded-3xl bg-card p-8 shadow-sm ring-1 ring-border/50">
          <h1 className="mb-1 font-serif text-2xl font-semibold text-foreground">Create account</h1>
          <p className="mb-6 text-sm text-muted-foreground">Join the beta and start raising your score.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Name */}
            <div>
              <label htmlFor="displayName" className="mb-1.5 block text-xs font-medium text-foreground">
                Your name <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="displayName"
                type="text"
                autoComplete="name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Alex"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-foreground">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-xs font-medium text-foreground">
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">Beta access</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Invite code */}
            <div>
              <label htmlFor="inviteCode" className="mb-1.5 block text-xs font-medium text-foreground">
                Invite code <span className="text-destructive">*</span>
              </label>
              <input
                id="inviteCode"
                type="text"
                autoComplete="off"
                required
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder="XXXXXXXX"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 font-mono text-sm tracking-widest text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'mt-1 w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity',
                loading ? 'cursor-not-allowed opacity-60' : 'hover:opacity-90',
              )}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              By signing up you agree to our{' '}
              <a href="/terms" className="underline hover:text-foreground">Terms</a>
              {' '}and{' '}
              <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>
            </p>
          </form>
        </div>

        {/* No invite code nudge */}
        <div className="mt-4 rounded-2xl border border-border bg-card/60 px-6 py-4 text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an invite code?{' '}
            <Link href="/waitlist" className="font-medium text-primary hover:underline">
              Join the waitlist
            </Link>{' '}
            and we&apos;ll send you one when your spot is ready.
          </p>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}
