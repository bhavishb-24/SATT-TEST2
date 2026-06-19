import Link from 'next/link'
import { SITE } from '@/lib/site'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8 lg:py-12">
        {/* Left — message */}
        <div className="flex flex-col items-start gap-6">
          <h1 className="text-balance font-serif text-5xl font-normal leading-[1.05] tracking-tight sm:text-6xl xl:text-7xl">
            Wealthy students hire an SAT tutor the night before.
            <span className="mt-2 block italic text-primary">Now you have one too. Free.</span>
          </h1>

          <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {SITE.name} is an AI coach for the most stressful night of the semester. Tell it how
            you feel and when you test — it builds a calm, hour-by-hour plan around your exact weak
            spots in about 60 seconds.
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href={SITE.appPath}
              className="flex min-h-[54px] items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/80"
            >
              Get my plan — free
              <span className="ti ti-arrow-right text-lg" aria-hidden="true" />
            </Link>
            <Link
              href="/#how-it-works"
              className="flex min-h-[54px] items-center justify-center gap-2 rounded-xl border border-border bg-card px-7 text-base font-semibold text-foreground transition-colors hover:bg-muted"
            >
              See how it works
            </Link>
          </div>

          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {['No account needed', 'Works at 2 AM', '100% free'].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <span className="ti ti-check text-base text-primary" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — product preview */}
        <div className="relative">
          <PlanPreview />
        </div>
      </div>
    </section>
  )
}

/** A static, on-brand preview of the in-app study plan. */
function PlanPreview() {
  const topics = [
    { n: 1, name: 'Linear equations', tag: 'Highest impact', time: '25 min', done: true },
    { n: 2, name: 'Comma & punctuation rules', tag: 'Quick win', time: '15 min', done: true },
    { n: 3, name: 'Data analysis & graphs', tag: 'Weak area', time: '20 min', done: false },
    { n: 4, name: 'Word problems', tag: 'Review', time: '20 min', done: false },
  ]

  return (
    <div className="rotate-1 rounded-2xl border border-border bg-card p-5 shadow-xl shadow-foreground/5 transition-transform hover:rotate-0 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Tonight&apos;s plan
          </span>
          <span className="text-lg font-extrabold tracking-tight">From panic to ready</span>
        </div>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          Pretty stressed
        </span>
      </div>

      {/* Progress */}
      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 rounded-full bg-primary" />
        </div>
        <span className="text-xs font-semibold text-muted-foreground">2 / 4 done</span>
      </div>

      {/* Topics */}
      <ul className="mt-4 flex flex-col gap-2.5">
        {topics.map((t) => (
          <li
            key={t.n}
            className="flex items-center gap-3 rounded-xl border border-border bg-background px-3.5 py-3"
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                t.done
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {t.done ? <span className="ti ti-check text-sm" aria-hidden="true" /> : t.n}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span
                className={`truncate text-sm font-semibold ${
                  t.done ? 'text-muted-foreground line-through' : 'text-foreground'
                }`}
              >
                {t.name}
              </span>
              <span className="text-xs text-muted-foreground">{t.tag}</span>
            </div>
            <span className="shrink-0 text-xs font-medium text-muted-foreground">{t.time}</span>
          </li>
        ))}
      </ul>

      {/* Footer hint */}
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/10 px-3.5 py-3">
        <span className="ti ti-microphone text-base text-primary" aria-hidden="true" />
        <span className="text-xs font-medium text-foreground">
          Feeling overwhelmed? Tap the panic button anytime.
        </span>
      </div>
    </div>
  )
}
