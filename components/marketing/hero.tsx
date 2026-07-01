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

      <div className="relative mx-auto w-full max-w-4xl px-5 py-20 lg:px-8 lg:py-32">
        {/* Content */}
        <motion.div
          className="flex flex-col items-center gap-7 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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


