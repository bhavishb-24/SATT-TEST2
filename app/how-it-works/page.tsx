import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingShell } from '@/components/marketing/marketing-shell'
import { FadeInOnScroll } from '@/components/marketing/fade-in-on-scroll'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'See exactly how SAT Sage builds your personalized SAT study plan in under 60 seconds, whether your test is tomorrow or 12 months away.',
}

const STEPS = [
  {
    icon: 'ti-calendar-event',
    title: 'Tell us when you test',
    body: "Enter your SAT date, anywhere from 7 days to 12 months away. SAT Sage is built for every student, not just last-minute crammers. The earlier you join, the more your plan can evolve with you.",
    detail:
      'You can update your test date anytime. Your plan automatically recalibrates with new priorities as your timeline shifts.',
  },
  {
    icon: 'ti-mood-sad',
    title: 'Share how you\'re feeling',
    body: "Stressed? Panicking? Feeling okay? We ask because your emotional state shapes your plan. A student with 3 months and moderate anxiety gets a very different strategy from one with 2 weeks left and full panic mode.",
    detail:
      'There is no wrong answer here. The panic button is always one tap away if you spiral mid-session.',
  },
  {
    icon: 'ti-target',
    title: 'Flag your weak areas',
    body: 'Pick the math topics and reading/writing skills that feel shakiest. This is about targeting the areas with the highest score potential for you specifically, not random guessing.',
    detail:
      'You can also upload your College Board score report and we\'ll scan it automatically to fill in your weak spots.',
  },
  {
    icon: 'ti-sparkles',
    title: 'Get your personalized plan',
    body: 'Your AI coach builds a complete, prioritized study plan in about 60 seconds. Topics are ordered by score impact, time-boxed to fit your schedule, and adapted to your stress level.',
    detail:
      'Plans include daily goals, practice drills, flashcard decks, and recommended review time, all mapped to your exact SAT date.',
  },
  {
    icon: 'ti-run',
    title: 'Work the plan, day by day',
    body: 'Open the app any time and pick up exactly where you left off. Complete topics, practice questions, flip flashcards, and use the focus timer to stay in deep work without burning out.',
    detail:
      'The coach checks in as you progress and adjusts the plan if you\'re ahead, behind, or just having a rough study day.',
  },
  {
    icon: 'ti-trophy',
    title: 'Walk in ready',
    body: "Come test day, you'll know exactly what you studied, what improved, and where you stand. No last-minute guessing. Just confidence built over every session you put in.",
    detail:
      'Use the morning checklist before you leave: key reminders, a breathing reset, and a quick review of your top tips.',
  },
]

const TIMELINE = [
  { range: '7 to 30 days', focus: 'High-intensity sprint: highest-impact topics only, timed drills, and daily plans' },
  { range: '2 to 3 months', focus: 'Balanced prep: full topic coverage, practice tests, and weak area targeting' },
  { range: '4 to 6 months', focus: 'Deep prep: section mastery, vocab building, and regular mock tests' },
  { range: '7 to 12 months', focus: 'Full roadmap: foundations, strategy, and long-term progress tracking' },
]

export default function HowItWorksPage() {
  return (
    <MarketingShell>
      {/* Hero */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-3xl px-5 py-16 lg:px-8 lg:py-24">
          <FadeInOnScroll>
            <span className="text-sm font-bold uppercase tracking-wider text-primary">
              How it works
            </span>
            <h1 className="mt-4 text-balance font-serif text-4xl font-normal tracking-tight lg:text-5xl">
              From &ldquo;I don&apos;t know where to start&rdquo; to a clear plan in 60 seconds
            </h1>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
              {SITE.name} works for students at every stage, a year out or the night before.
              Answer a few questions and your AI coach does the hard thinking for you.
            </p>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Steps */}
      <section>
        <div className="mx-auto w-full max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
          <ol className="flex flex-col gap-10">
            {STEPS.map((step, i) => (
              <FadeInOnScroll key={step.title}>
                <li className="flex gap-6 lg:gap-8">
                  {/* Step number + connector */}
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <span className={`ti ${step.icon} text-xl`} aria-hidden="true" />
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="mt-2 w-px flex-1 bg-border" aria-hidden="true" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-2 pb-10">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Step {i + 1}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight lg:text-2xl">{step.title}</h2>
                    <p className="text-pretty leading-relaxed text-muted-foreground">{step.body}</p>
                    <div className="mt-2 flex items-start gap-2 rounded-xl bg-primary/8 px-4 py-3">
                      <span className="ti ti-info-circle mt-0.5 shrink-0 text-base text-primary" aria-hidden="true" />
                      <p className="text-sm leading-relaxed text-foreground/80">{step.detail}</p>
                    </div>
                  </div>
                </li>
              </FadeInOnScroll>
            ))}
          </ol>
        </div>
      </section>

      {/* Timeline breakdown */}
      <section className="border-t border-border bg-card/50">
        <div className="mx-auto w-full max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
          <FadeInOnScroll>
            <h2 className="text-balance font-serif text-3xl font-normal tracking-tight sm:text-4xl">
              Your plan adapts to how much time you have
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              You can use {SITE.name} for up to 12 months before your SAT. Here&apos;s how
              the focus shifts depending on your timeline.
            </p>
          </FadeInOnScroll>

          <div className="mt-10 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-card">
                <tr className="border-b border-border">
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Time until SAT
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    What your plan focuses on
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {TIMELINE.map((row) => (
                  <tr key={row.range} className="hover:bg-card/50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-foreground">{row.range}</td>
                    <td className="px-5 py-4 text-muted-foreground">{row.focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-3xl px-5 py-16 lg:px-8 lg:py-24">
          <FadeInOnScroll>
            <div className="flex flex-col items-center gap-6 text-center">
              <h2 className="text-balance font-serif text-3xl font-normal tracking-tight sm:text-4xl">
                Ready to stop guessing and start prepping?
              </h2>
              <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
                Join thousands of students already building their plans. Completely free.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/waitlist"
                  className="flex min-h-[54px] items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Join the waitlist
                  <span className="ti ti-arrow-right text-lg" aria-hidden="true" />
                </Link>
                <Link
                  href={SITE.appPath}
                  className="flex min-h-[54px] items-center justify-center gap-2 rounded-xl border border-border bg-card px-7 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Try it now, no signup needed
                </Link>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </MarketingShell>
  )
}
