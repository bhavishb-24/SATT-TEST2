import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingShell } from '@/components/marketing/marketing-shell'
import { FadeInOnScroll } from '@/components/marketing/fade-in-on-scroll'
import { WaitlistForm } from './waitlist-form'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Join the Waitlist',
  description:
    'Be the first to access new SAT Sage features: live coaching, study groups, and more. Free for students with their SAT within 12 months.',
}

const PERKS = [
  {
    icon: 'ti-star',
    title: 'Early access to new features',
    body: 'Live coaching sessions, study groups, and AI-powered mock tests. Waitlist members get them first.',
  },
  {
    icon: 'ti-users',
    title: 'SAT study community',
    body: 'Connect with other students at your stage. Share strategies, stay accountable, and tackle hard topics together.',
  },
  {
    icon: 'ti-bell',
    title: 'Test date reminders',
    body: "We'll remind you at key milestones (30 days, 14 days, and the night before) with a custom plan for each.",
  },
]

export default function WaitlistPage() {
  return (
    <MarketingShell>
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1fr_480px] lg:gap-20 lg:px-8 lg:py-24">
        {/* Left — context */}
        <div className="flex flex-col gap-8">
          <FadeInOnScroll>
            <div className="flex flex-col gap-5">
              <span className="text-sm font-bold uppercase tracking-wider text-primary">
                Join the waitlist
              </span>
              <h1 className="text-balance font-serif text-4xl font-normal tracking-tight lg:text-5xl">
                Be first in line.
                <span className="mt-1 block italic text-primary">
                  Ace your SAT.
                </span>
              </h1>
              <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
                {SITE.name} is free to use right now. We are building even more for
                students who want to prep smart from up to 12 months out. Join the waitlist
                and be first to know when live coaching, study groups, and personalized
                progress reports go live.
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {['Free forever', 'No spam', 'Unsubscribe anytime'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <span className="ti ti-check text-base text-primary" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </FadeInOnScroll>

          {/* Perks */}
          <FadeInOnScroll>
            <ul className="flex flex-col gap-4">
              {PERKS.map((p) => (
                <li key={p.title} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <span className={`ti ${p.icon} text-xl`} aria-hidden="true" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold">{p.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </FadeInOnScroll>

          {/* Try now nudge */}
          <FadeInOnScroll>
            <div className="rounded-2xl border border-border bg-card/60 px-6 py-5">
              <p className="text-sm font-semibold text-foreground">
                Don&apos;t want to wait?
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                The core app is free and available right now. No account needed.
              </p>
              <Link
                href={SITE.appPath}
                className="mt-3 inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Try it now
                <span className="ti ti-arrow-right text-sm" aria-hidden="true" />
              </Link>
            </div>
          </FadeInOnScroll>
        </div>

        {/* Right — form */}
        <div className="flex flex-col">
          <FadeInOnScroll>
            <div className="rounded-2xl border border-border bg-card p-7 shadow-lg shadow-foreground/5 lg:p-8">
              <h2 className="text-xl font-bold tracking-tight">
                Reserve your spot
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Takes less than 30 seconds.
              </p>
              <div className="mt-6">
                <WaitlistForm />
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </MarketingShell>
  )
}
