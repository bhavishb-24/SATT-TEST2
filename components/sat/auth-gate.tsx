'use client'

import { useState } from 'react'

interface Props {
  onGuestSignIn: (name?: string) => void
}

export function AuthGate({ onGuestSignIn }: Props) {
  const [name, setName] = useState('')

  return (
    <main className="animate-fade-in flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <div className="flex w-full max-w-md flex-col gap-8 rounded-2xl border border-border bg-card p-7 sm:p-9">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <span className="ti ti-heartbeat text-2xl text-primary" aria-hidden="true" />
          </span>
          <h1 className="font-serif text-3xl font-normal tracking-tight">
            Welcome to the Emergency Room
          </h1>
          <p className="text-pretty text-sm text-muted-foreground">
            No account, no email, no password. Jump straight in as a guest — your progress
            stays private on this device.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Pick a display name (optional)
            </span>
            <input
              type="text"
              value={name}
              maxLength={32}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Night-before warrior"
              className="min-h-[48px] w-full rounded-xl border border-border bg-background px-4 text-sm"
            />
          </label>

          <button
            type="button"
            onClick={() => onGuestSignIn(name)}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <span className="ti ti-user-bolt text-lg" aria-hidden="true" />
            Continue as guest
          </button>
        </div>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          We will create an anonymous guest profile for you. Nothing is sent anywhere — your
          diagnostic results and plan are kept only on this device.
        </p>
      </div>
    </main>
  )
}
