import Link from 'next/link'
import { SITE } from '@/lib/site'

const STEPS = [
  {
    icon: 'ti-clipboard-heart',
    title: 'Triage your night',
    body: 'Tell us how panicked you feel, when you test, how much time you have, and where you struggle. It takes about a minute.',
  },
  {
    icon: 'ti-sparkles',
    title: 'Get your plan',
    body: 'Your AI coach builds a prioritized, time-boxed study plan — highest-impact topics first, sleep deadline included.',
  },
  {
    icon: 'ti-run',
    title: 'Work the steps',
    body: 'Move through topics with drills, flashcards, and a focus timer. Hit the panic button anytime and we will calm you back down.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="flex max-w-2xl flex-col gap-4">
          <span className="text-sm font-bold uppercase tracking-wider text-primary">
            How it works
          </span>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            From &ldquo;I&apos;m not ready&rdquo; to a clear plan in three steps
          </h2>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 lg:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <span className={`${step.icon} ti text-2xl`} aria-hidden="true" />
                </span>
                <span className="text-5xl font-extrabold text-muted-foreground/20">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">{step.title}</h3>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex justify-center">
          <Link
            href={SITE.appPath}
            className="flex min-h-[54px] items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start my triage
            <span className="ti ti-arrow-right text-lg" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
