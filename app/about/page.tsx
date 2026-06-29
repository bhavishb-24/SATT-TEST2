import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingShell } from '@/components/marketing/marketing-shell'
import { FadeInOnScroll } from '@/components/marketing/fade-in-on-scroll'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About',
  description:
    'SAT Sage was built for stressed students who deserve the same prep advantages as anyone else. No tutor fees, no gatekeeping, just a calm and capable AI coach.',
}

const VALUES = [
  {
    icon: 'ti-gift',
    title: 'Free, always',
    body: 'The night before your SAT, or the year before, should never come with a paywall. Every feature is free, with no account required to get started.',
  },
  {
    icon: 'ti-mood-calm',
    title: 'Calm over chaos',
    body: 'We design every screen for a racing heart. Clear next steps, gentle pacing, a panic button when you need it, and language that never makes you feel dumb for not knowing something.',
  },
  {
    icon: 'ti-scale',
    title: 'Fairness',
    body: 'Wealthy students have tutors on speed dial. We are trying to put a version of that in every student\'s pocket. No zip code required.',
  },
  {
    icon: 'ti-calendar-check',
    title: 'Long-term prep, not just last-minute',
    body: 'We built SAT Sage to work across the full 12-month window before your test. Start early with foundations or sprint at the last minute. The plan adapts to you.',
  },
]

const STATS = [
  { value: '10,000+', label: 'Students prepping' },
  { value: '1 year', label: 'Max prep window' },
  { value: '60 sec', label: 'To your custom plan' },
  { value: '100%', label: 'Free, no strings' },
]

export default function AboutPage() {
  return (
    <MarketingShell>
      {/* Intro */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-3xl px-5 py-16 lg:px-8 lg:py-24">
          <FadeInOnScroll>
            <span className="text-sm font-bold uppercase tracking-wider text-primary">
              About us
            </span>
            <h1 className="mt-4 text-balance font-serif text-4xl font-normal tracking-tight lg:text-5xl">
              Every student deserves a great SAT coach
            </h1>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
              The night before the SAT, some students have a private tutor on speed dial. Most
              don&apos;t. That gap has always felt unfair. We built {SITE.name} to give every
              student a calm, capable coach from the moment they decide to prepare, all the way
              through test day.
            </p>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              You can start up to 12 months before your SAT. Whether you have a year, a month,
              or just one night left, {SITE.name} turns your current situation (stress level,
              weak areas, and time available) into a clear, actionable plan. No sign-up required.
              No cost. No judgment.
            </p>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              We are not here to replace months of hard work. We are here to make those months
              count, and to make sure that when the night before finally arrives, you feel
              ready instead of panicked.
            </p>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card/50">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 lg:px-8">
          <FadeInOnScroll>
            <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col gap-1 text-center">
                  <dd className="font-serif text-4xl font-normal text-primary">{s.value}</dd>
                  <dt className="text-sm text-muted-foreground">{s.label}</dt>
                </div>
              ))}
            </dl>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Values */}
      <section>
        <div className="mx-auto w-full max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
          <FadeInOnScroll>
            <h2 className="text-balance font-serif text-3xl font-normal tracking-tight sm:text-4xl">
              What we believe
            </h2>
          </FadeInOnScroll>
          <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
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

          {/* CTA banner */}
          <FadeInOnScroll>
            <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl bg-foreground p-8 text-background sm:flex-row sm:items-center sm:justify-between lg:p-10">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-extrabold tracking-tight">
                  Got a test coming up?
                </h2>
                <p className="opacity-80">Your coach is ready whenever you are.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:shrink-0">
                <Link
                  href="/waitlist"
                  className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Join the waitlist
                  <span className="ti ti-arrow-right text-lg" aria-hidden="true" />
                </Link>
                <Link
                  href={SITE.appPath}
                  className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-background/30 bg-background/10 px-7 text-base font-semibold text-background transition-colors hover:bg-background/20"
                >
                  Try the app
                </Link>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </MarketingShell>
  )
}
