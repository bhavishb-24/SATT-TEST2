'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { SITE } from '@/lib/site'
import { Glass } from '@/components/ui/liquid-glass'

export function Hero() {
  return (
    <section className="relative overflow-hidden -mt-16">
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

      {/* Minimal overlay — just enough for text legibility, video stays vivid */}
      <div className="pointer-events-none absolute inset-0 bg-black/15" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-4xl px-5 pb-20 pt-36 lg:px-8 lg:pb-32 lg:pt-48">
        {/* Content */}
        <motion.div
          className="flex flex-col items-center gap-7 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-balance text-center font-serif text-5xl font-normal leading-[1.05] tracking-tight text-white sm:text-6xl xl:text-7xl"
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
            className="max-w-2xl text-pretty text-center text-lg leading-relaxed text-white/80"
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
            className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center"
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

      </div>

      {/* Scrolling marquee strip */}
      <div
        className="relative overflow-hidden border-t border-white/20 py-4"
        style={{ background: '#1a7fa8' }}
        aria-label="Social proof"
      >
        {/* Left/right fade masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#1a7fa8] to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#1a7fa8] to-transparent" aria-hidden="true" />

        <div className="flex animate-marquee whitespace-nowrap" aria-hidden="true">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex items-center">
              {[
                { icon: 'ti-brain',        label: 'AI-personalized study plan' },
                { icon: 'ti-calendar',     label: 'Up to 12 months of prep' },
                { icon: 'ti-pencil',       label: 'Daily practice drills' },
                { icon: 'ti-math-function',label: 'Formula & rules sheet' },
                { icon: 'ti-cards',        label: 'Rapid flashcards' },
                { icon: 'ti-clock-play',   label: 'Built-in focus timer' },
                { icon: 'ti-chart-arcs',   label: 'Progress tracking' },
                { icon: 'ti-check',        label: '100% free, no tutor fees' },
                { icon: 'ti-bolt',         label: 'Plan ready in 60 seconds' },
                { icon: 'ti-school',       label: 'SAT-focused content only' },
                { icon: 'ti-mood-smile',   label: 'Stress-aware scheduling' },
                { icon: 'ti-target',       label: 'Targets your weak spots' },
              ].map((item) => (
                <div key={item.label} className="mx-10 flex items-center gap-2.5">
                  <span className={`ti ${item.icon} text-base text-white/60`} aria-hidden="true" />
                  <span className="text-sm font-medium tracking-wide text-white">{item.label}</span>
                  <span className="ml-10 text-white/25" aria-hidden="true">·</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Accessible static version for screen readers */}
        <ul className="sr-only">
          <li>AI-personalized study plan</li>
          <li>Up to 12 months of prep</li>
          <li>Daily practice drills</li>
          <li>Formula and rules sheet</li>
          <li>100% free, no tutor fees</li>
        </ul>
      </div>
    </section>
  )
}


