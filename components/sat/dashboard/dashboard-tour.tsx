'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { DashboardView } from '@/lib/sat-types'
import { cn } from '@/lib/utils'

interface TourStep {
  /** data-tour attribute of the element to spotlight. Null = centered card. */
  target: string | null
  /** Switch the dashboard to this view before showing the step. */
  view?: DashboardView
  title: string
  body: string
}

const STEPS: TourStep[] = [
  {
    target: null,
    title: "Hi, I'm Sage!",
    body: "I'm your study buddy. Let me give you a quick tour of your command center so you know where everything lives. Hit Next, or Skip if you'd rather dive straight in.",
  },
  {
    target: 'countdown',
    title: 'Your countdown',
    body: 'This is exactly how long until your test starts. It keeps you honest about pacing tonight and tomorrow morning.',
  },
  {
    target: 'nav-home',
    view: 'home',
    title: 'Dashboard',
    body: "Your home base: a quick snapshot of tonight's plan, your progress, and what to do next.",
  },
  {
    target: 'nav-plan',
    view: 'plan',
    title: 'Study Plan',
    body: 'Your personalized topics, ordered highest-impact first. Just work top to bottom and check them off.',
  },
  {
    target: 'nav-practice',
    view: 'practice',
    title: 'Practice Drills',
    body: 'Short, targeted questions on your weak areas. Perfect for quick reps when you have a few minutes.',
  },
  {
    target: 'nav-mocktest',
    view: 'mocktest',
    title: 'Mock Tests',
    body: 'Full-length, 98-question SAT-style practice tests. Same structure as the real digital SAT: two R&W modules and two Math modules.',
  },
  {
    target: 'nav-flashcards',
    view: 'flashcards',
    title: 'Flashcards',
    body: 'Fast recall review for the formulas, grammar rules, and vocab you need at your fingertips.',
  },
  {
    target: 'nav-checklist',
    view: 'checklist',
    title: 'Night Checklist',
    body: 'Everything to pack and prep the night before, so test morning is calm instead of chaotic.',
  },
  {
    target: 'nav-asktutor',
    view: 'asktutor',
    title: 'Ask AI Tutor',
    body: "Stuck on a question? Snap a photo and I'll walk you through it Socratic-style. No spoilers, just guidance.",
  },
  {
    target: 'nav-community',
    view: 'community',
    title: 'Question Bank',
    body: 'Browse AI-recommended and teacher-verified SAT questions curated just for your weak areas.',
  },
  {
    target: null,
    title: "You're all set!",
    body: "That's the whole tour. You've got this. One topic at a time. Let's go!",
  },
]

const AUTO_DELAY = 6000

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

interface Props {
  onNavigate: (view: DashboardView) => void
  onFinish: () => void
}

function findVisibleTarget(key: string): HTMLElement | null {
  const els = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${key}"]`))
  const visible = els.find((el) => {
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  })
  return visible ?? els[0] ?? null
}

export function DashboardTour({ onNavigate, onFinish }: Props) {
  const [stepIndex, setStepIndex] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const [auto, setAuto] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const step = STEPS[stepIndex]
  const isLast = stepIndex === STEPS.length - 1
  const isFirst = stepIndex === 0

  const finish = useCallback(() => {
    onNavigate('home')
    onFinish()
  }, [onNavigate, onFinish])

  const goNext = useCallback(() => {
    setStepIndex((i) => {
      if (i >= STEPS.length - 1) {
        finish()
        return i
      }
      return i + 1
    })
  }, [finish])

  const goBack = useCallback(() => setStepIndex((i) => Math.max(0, i - 1)), [])

  // Navigate to the step's view and measure its target element.
  useEffect(() => {
    const current = STEPS[stepIndex]
    if (current.view) onNavigate(current.view)

    const measure = () => {
      if (!current.target) {
        setRect(null)
        return
      }
      const el = findVisibleTarget(current.target)
      if (el) {
        const r = el.getBoundingClientRect()
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
      } else {
        setRect(null)
      }
    }

    // Measure across a couple frames so the freshly-switched view can render.
    const raf = requestAnimationFrame(() => requestAnimationFrame(measure))
    const t = window.setTimeout(measure, 140)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
    }
  }, [stepIndex, onNavigate])

  // Keep the spotlight aligned on resize/scroll.
  useEffect(() => {
    const onChange = () => {
      const current = STEPS[stepIndex]
      if (!current.target) return
      const el = findVisibleTarget(current.target)
      if (el) {
        const r = el.getBoundingClientRect()
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
      }
    }
    window.addEventListener('resize', onChange)
    window.addEventListener('scroll', onChange, true)
    return () => {
      window.removeEventListener('resize', onChange)
      window.removeEventListener('scroll', onChange, true)
    }
  }, [stepIndex])

  // Auto-advance when play mode is on.
  useEffect(() => {
    if (!auto) return
    const id = window.setTimeout(goNext, AUTO_DELAY)
    return () => clearTimeout(id)
  }, [auto, stepIndex, goNext])

  // Position the coach card relative to the spotlight (clamped to viewport).
  useEffect(() => {
    const card = cardRef.current
    if (!card) return
    const cw = card.offsetWidth
    const ch = card.offsetHeight
    const vw = window.innerWidth
    const vh = window.innerHeight
    const margin = 16

    if (!rect) {
      setPos({ top: (vh - ch) / 2, left: (vw - cw) / 2 })
      return
    }

    let left: number
    let top: number
    const spaceRight = vw - rect.left - rect.width
    const spaceBelow = vh - rect.top - rect.height
    const spaceAbove = rect.top

    if (spaceRight >= cw + margin * 2) {
      left = rect.left + rect.width + margin
      top = rect.top + rect.height / 2 - ch / 2
    } else if (spaceBelow >= ch + margin * 2) {
      top = rect.top + rect.height + margin
      left = rect.left + rect.width / 2 - cw / 2
    } else if (spaceAbove >= ch + margin * 2) {
      top = rect.top - ch - margin
      left = rect.left + rect.width / 2 - cw / 2
    } else {
      top = (vh - ch) / 2
      left = (vw - cw) / 2
    }

    left = Math.max(margin, Math.min(left, vw - cw - margin))
    top = Math.max(margin, Math.min(top, vh - ch - margin))
    setPos({ top, left })
  }, [rect, stepIndex])

  const ringPad = 8

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Dashboard tour">
      {/* Click-capture backdrop. Dimming itself comes from the spotlight shadow. */}
      <div className="absolute inset-0" aria-hidden="true" />

      {rect ? (
        <>
          {/* Dim everything except the spotlighted element. */}
          <div
            className="pointer-events-none absolute rounded-xl transition-all duration-300 ease-out"
            style={{
              top: rect.top - ringPad,
              left: rect.left - ringPad,
              width: rect.width + ringPad * 2,
              height: rect.height + ringPad * 2,
              boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.6)',
            }}
          />
          {/* Pulsing highlight ring. */}
          <div
            className="pointer-events-none absolute animate-pulse rounded-xl border-2 border-primary transition-all duration-300 ease-out"
            style={{
              top: rect.top - ringPad,
              left: rect.left - ringPad,
              width: rect.width + ringPad * 2,
              height: rect.height + ringPad * 2,
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-slate-900/60" aria-hidden="true" />
      )}

      {/* Coach card */}
      <div
        ref={cardRef}
        className={cn(
          'absolute w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-4 shadow-2xl transition-opacity duration-200',
          pos ? 'opacity-100' : 'opacity-0',
        )}
        style={pos ? { top: pos.top, left: pos.left } : { top: -9999, left: -9999 }}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Image
              src="/mascot.png"
              alt="Sage, your study buddy"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground">{step.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === stepIndex ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30',
              )}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={finish}
            className="rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip
          </button>

          <button
            type="button"
            onClick={() => setAuto((a) => !a)}
            aria-pressed={auto}
            aria-label={auto ? 'Pause auto-play' : 'Auto-play tour'}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <i className={cn('ti', auto ? 'ti-player-pause' : 'ti-player-play')} aria-hidden="true" />
          </button>

          <div className="ml-auto flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={goBack}
                className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {isLast ? 'Finish' : 'Next'}
              {!isLast && <i className="ti ti-arrow-right" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Step {stepIndex + 1} of {STEPS.length}
        </p>
      </div>
    </div>
  )
}
