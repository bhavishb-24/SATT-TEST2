'use client'

import { useActionState } from 'react'
import { joinWaitlist, type WaitlistFormState } from './actions'

const DAYS_OPTIONS = [
  { value: '7', label: '7 days — test is next week' },
  { value: '14', label: '14 days — two weeks out' },
  { value: '30', label: '30 days — about a month' },
  { value: '60', label: '2 months' },
  { value: '90', label: '3 months' },
  { value: '120', label: '4 months' },
  { value: '150', label: '5 months' },
  { value: '180', label: '6 months' },
  { value: '210', label: '7 months' },
  { value: '240', label: '8 months' },
  { value: '270', label: '9 months' },
  { value: '300', label: '10 months' },
  { value: '330', label: '11 months' },
  { value: '365', label: '12 months' },
  { value: '365+', label: 'More than 12 months' },
]

const INITIAL_STATE: WaitlistFormState = { success: false, error: null }

export function WaitlistForm() {
  const [state, action, pending] = useActionState(joinWaitlist, INITIAL_STATE)

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/30 bg-primary/8 px-8 py-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <span className="ti ti-check text-2xl" aria-hidden="true" />
        </span>
        <h2 className="text-xl font-bold tracking-tight">
          {state.alreadySignedUp ? "You're already on the list!" : "You're on the list!"}
        </h2>
        <p className="max-w-sm text-pretty text-muted-foreground">
          {state.alreadySignedUp
            ? "Looks like you already signed up with this email. We'll reach out when new features and study groups go live."
            : "We'll reach out as soon as new features, live coaching sessions, and study groups go live. Start prepping now — the app is free to use today."}
        </p>
        <a
          href="/app"
          className="mt-2 flex min-h-[48px] items-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Start prepping now — free
          <span className="ti ti-arrow-right text-lg" aria-hidden="true" />
        </a>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-semibold text-foreground">
          First name <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="given-name"
          placeholder="Alex"
          className="min-h-[48px] w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-foreground">
          Email address <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="min-h-[48px] w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Days until SAT */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="days_until_sat" className="text-sm font-semibold text-foreground">
          How far out is your SAT? <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <select
          id="days_until_sat"
          name="days_until_sat"
          required
          defaultValue=""
          className="min-h-[48px] w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="" disabled>
            Select how much time you have...
          </option>
          {DAYS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? (
          <>
            <span className="ti ti-loader-2 animate-spin text-lg" aria-hidden="true" />
            Joining...
          </>
        ) : (
          <>
            Join the waitlist — free
            <span className="ti ti-arrow-right text-lg" aria-hidden="true" />
          </>
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        No spam. No credit card. Unsubscribe anytime.
      </p>
    </form>
  )
}
