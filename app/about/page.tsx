import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingShell } from '@/components/marketing/marketing-shell'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Why we built SAT Emergency Room: great last-minute SAT help should not be a luxury reserved for students who can afford a tutor.',
}

const VALUES = [
  {
    icon: 'ti-gift',
    title: 'Free, always',
    body: 'The most stressful night should not come with a paywall. Every feature is free, with no account required.',
  },
  {
    icon: 'ti-mood-calm',
    title: 'Calm over chaos',
    body: 'We design for a racing heart at midnight. Clear next steps, gentle pacing, and a panic button when you need it.',
  },
  {
    icon: 'ti-scale',
    title: 'Fairness',
    body: 'Wealthy students get a tutor on call. We are trying to put a version of that in everyone’s pocket.',
  },
]

export default function AboutPage() {
  return (
    <MarketingShell>
      {/* Intro */}
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-3xl px-5 py-16 lg:px-8 lg:py-24">
          <span className="text-sm font-bold uppercase tracking-wider text-primary">
            About us
          </span>
          <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight lg:text-5xl">
            Last-minute help shouldn&apos;t be a luxury
          </h1>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
            The night before the SAT, some students have a private tutor on speed dial. Most
            don&apos;t. That gap always felt unfair to us — so we built {SITE.name} to give every
            student a calm, capable coach in their corner at the exact moment the stakes feel
            highest.
          </p>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            We&apos;re not here to replace months of prep. We&apos;re here for the hours that are
            left: to turn panic into a plan, to point you at the highest-impact review, and to
            remind you to breathe and sleep. No sign-up, no cost, no judgment.
          </p>
        </div>
      </section>

      {/* Values */}
      <section>
        <div className="mx-auto w-full max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            What we believe
          </h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {VALUES.map((v) => (
              <li
                key={v.title}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <span className={`${v.icon} ti text-2xl`} aria-hidden="true" />
                </span>
                <h3 className="text-lg font-bold tracking-tight">{v.title}</h3>
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                  {v.body}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl bg-foreground p-8 text-background sm:flex-row sm:items-center sm:justify-between lg:p-10">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-extrabold tracking-tight">Got a test coming up?</h2>
              <p className="opacity-80">Your coach is open and waiting.</p>
            </div>
            <Link
              href={SITE.appPath}
              className="flex min-h-[52px] shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Open the app
              <span className="ti ti-arrow-right text-lg" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}
