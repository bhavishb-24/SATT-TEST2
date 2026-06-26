'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  onGuestSignIn: (name?: string) => void
}

type Panel = 'signin' | 'signup'

export function AuthGate({ onGuestSignIn }: Props) {
  const [panel,    setPanel]    = useState<Panel>('signin')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [name,     setName]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [notice,   setNotice]   = useState<string | null>(null)

  const supabase = createClient()

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    // Success: onAuthStateChange in use-auth fires and updates the user automatically.
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
        data: { display_name: name.trim() || undefined },
      },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setNotice('Check your email to confirm your account, then sign in.')
      setPanel('signin')
    }
  }

  function switchPanel(p: Panel) {
    setPanel(p)
    setError(null)
    setNotice(null)
  }

  return (
    <main className="animate-fade-in flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-12">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 px-8 pb-6 pt-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <i className="ti ti-brain text-2xl text-primary" aria-hidden="true" />
          </span>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground">
            SAT Sage
          </h1>
          <p className="text-pretty text-sm text-muted-foreground">
            Your AI-powered SAT coach. Sign in to save your progress across devices.
          </p>
        </div>

        {/* Tab strip */}
        <div className="mx-8 mb-6 flex gap-1 rounded-xl bg-secondary/50 p-1">
          {(['signin', 'signup'] as Panel[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => switchPanel(p)}
              className={[
                'flex-1 rounded-lg py-2 text-sm font-medium transition-all',
                panel === p
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              {p === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        {/* Form area */}
        <div className="px-8 pb-6">
          {notice && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
              <i className="ti ti-mail-check mt-0.5 shrink-0" aria-hidden="true" />
              {notice}
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <i className="ti ti-alert-circle mt-0.5 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          {panel === 'signin' ? (
            <form onSubmit={handleSignIn} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Email</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="min-h-[44px] w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Password</span>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="min-h-[44px] w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {loading
                  ? <i className="ti ti-loader-2 animate-spin" aria-hidden="true" />
                  : <i className="ti ti-login" aria-hidden="true" />
                }
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Display name <span className="text-muted-foreground/60">(optional)</span>
                </span>
                <input
                  type="text"
                  maxLength={32}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="min-h-[44px] w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Email</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="min-h-[44px] w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Password</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="min-h-[44px] w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {loading
                  ? <i className="ti ti-loader-2 animate-spin" aria-hidden="true" />
                  : <i className="ti ti-user-plus" aria-hidden="true" />
                }
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          )}
        </div>

        {/* Divider */}
        <div className="mx-8 mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Guest option */}
        <div className="px-8 pb-8">
          <button
            type="button"
            onClick={() => onGuestSignIn()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <i className="ti ti-user-bolt" aria-hidden="true" />
            Continue as guest (no account needed)
          </button>
          <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
            Guest progress is saved on this device only and cannot be recovered.
          </p>
        </div>

      </div>
    </main>
  )
}
