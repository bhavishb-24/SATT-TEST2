'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { SITE } from '@/lib/site'
import { Glass } from '@/components/ui/liquid-glass'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Desktop video background */}
      <video
        className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover md:block"
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SAT%20sage%20landing%20page%202-hra5N2P1wkKtmldHXJaZj14uzmXNH5.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />

      {/* Mobile image background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="pointer-events-none absolute inset-0 block h-full w-full object-cover md:hidden"
        src="/hero-poster.png"
        alt=""
        aria-hidden="true"
      />

      {/* Dark overlay for text legibility */}
      <div className="pointer-events-none absolute inset-0 bg-black/55" aria-hidden="true" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8 lg:py-24">
        {/* Left — message */}
        <motion.div
          className="flex flex-col items-start gap-7"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Glass className="flex items-center gap-2 rounded-full px-4 py-1.5">
              <span className="ti ti-book-2 text-sm text-primary" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Free SAT Prep: Up to 1 Year Before Your Test
              </span>
            </Glass>
          </motion.div>

          <motion.h1
            className="text-balance font-serif text-5xl font-normal leading-[1.05] tracking-tight text-white sm:text-6xl xl:text-7xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            You&apos;ve got this.
            <span className="mt-2 block italic text-primary">
              Let&apos;s build your plan.
            </span>
          </motion.h1>

          <motion.p
            className="max-w-xl text-pretty text-lg leading-relaxed text-white/80"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Whether your SAT is tomorrow or 12 months away, {SITE.name} meets you exactly
            where you are. Tell us when you&apos;re testing and how stressed you feel. Your
            AI coach builds a personalized plan in 60 seconds. No tutor fees. No fluff. Just
            results.
          </motion.p>

          <motion.div
            className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              href="/waitlist"
              className="flex min-h-[54px] items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/80"
            >
              Join the waitlist, free
              <span className="ti ti-arrow-right text-lg" aria-hidden="true" />
            </Link>
            <Link
              href="/how-it-works"
              className="flex min-h-[54px] items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              See how it works
            </Link>
          </motion.div>

          <motion.ul
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {[
              '100% free',
              'Currently in beta',
              'Works up to 1 year out',
            ].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <span className="ti ti-check text-base text-primary" aria-hidden="true" />
                {item}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Right — product preview */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 20, rotateZ: 5 }}
          animate={{ opacity: 1, x: 0, rotateZ: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <PlanPreview />
        </motion.div>
      </div>

      {/* Social proof strip */}
      <div className="relative border-t border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-8 px-5 py-5 lg:px-8">
          {[
            { icon: 'ti-users', stat: '10,000+', label: 'Students prepping' },
            { icon: 'ti-star', stat: '4.9 / 5', label: 'Average rating' },
            { icon: 'ti-clock', stat: '60 sec', label: 'To your custom plan' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <span className={`ti ${item.icon} text-xl text-primary`} aria-hidden="true" />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-extrabold text-white">{item.stat}</span>
                <span className="text-xs text-white/60">{item.label}</span>
              </div>
            </div>
          ))}
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
    <Glass className="rotate-1 rounded-2xl p-5 transition-transform hover:rotate-0 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Your study plan
          </span>
          <span className="text-lg font-extrabold tracking-tight">From stressed to ready</span>
        </div>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          14 days out
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
              {t.done ? (
                <span className="ti ti-check text-sm" aria-hidden="true" />
              ) : (
                t.n
              )}
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
        <span className="ti ti-brain text-base text-primary" aria-hidden="true" />
        <span className="text-xs font-medium text-foreground">
          AI adapts your plan as you progress. No stress.
        </span>
      </div>
    </Glass>
  )
}
