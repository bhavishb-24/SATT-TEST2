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
        className="relative overflow-hidden border-t border-white/30 py-4"
        style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)' }}
        aria-label="Social proof"
      >
        {/* Left/right fade masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white/30 to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white/30 to-transparent" aria-hidden="true" />

        <div className="flex animate-marquee whitespace-nowrap" aria-hidden="true">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex items-center">
              {[
                { icon: 'ti-users',      stat: '10,000+',  label: 'Students prepping' },
                { icon: 'ti-star',       stat: '4.9 / 5',  label: 'Average rating' },
                { icon: 'ti-clock',      stat: '60 sec',   label: 'To your custom plan' },
                { icon: 'ti-check',      stat: '100%',     label: 'Free forever' },
                { icon: 'ti-calendar',   stat: '12 mo',    label: 'Planning horizon' },
                { icon: 'ti-brain',      stat: 'AI',       label: 'Powered study plan' },
                { icon: 'ti-bolt',       stat: '60 sec',   label: 'Plan generation' },
                { icon: 'ti-school',     stat: 'SAT',      label: 'Focused prep' },
              ].map((item) => (
                <div key={item.label} className="mx-8 flex items-center gap-3">
                  <span className={`ti ${item.icon} text-lg text-primary`} aria-hidden="true" />
                  <span className="text-sm font-extrabold text-white">{item.stat}</span>
                  <span className="text-xs text-white/70">{item.label}</span>
                  <span className="ml-8 text-white/20" aria-hidden="true">·</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Accessible static version for screen readers */}
        <ul className="sr-only">
          <li>10,000+ students prepping</li>
          <li>4.9 / 5 average rating</li>
          <li>60 seconds to your custom plan</li>
          <li>100% free forever</li>
        </ul>
      </div>
    </section>
  )
}


