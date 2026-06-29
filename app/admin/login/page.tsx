'use client'

import { useState, useTransition } from 'react'
import { adminLogin } from '@/app/admin/actions'
import { cn } from '@/lib/utils'

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await adminLogin(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <span className="ti ti-shield-lock text-2xl text-primary" aria-hidden="true" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Admin access</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the admin password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              placeholder="Admin password"
              className="min-h-[44px] rounded-xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className={cn(
              'flex min-h-[44px] w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity',
              isPending ? 'cursor-not-allowed opacity-60' : 'hover:opacity-90',
            )}
          >
            {isPending ? 'Checking...' : 'Enter admin'}
          </button>
        </form>

      </div>
    </div>
  )
}
