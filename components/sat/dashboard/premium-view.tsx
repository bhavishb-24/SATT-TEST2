'use client'

import { useState } from 'react'
import type { DashboardView } from '@/lib/sat-types'
import { cn } from '@/lib/utils'

// ── Plan data ─────────────────────────────────────────────────────────────

type BillingCycle = 'monthly' | 'annual'

interface Plan {
  id: string
  name: string
  tagline: string
  monthlyPrice: number | null
  annualPrice: number | null
  badge?: string
  featured?: boolean
  cta: string
  features: string[]
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Everything you need for the night before',
    monthlyPrice: 0,
    annualPrice: 0,
    cta: 'Current plan',
    features: [
      'AI-powered triage & study plan',
      'Personalized practice drills',
      'Flashcard review',
      'AI Learning Brain\u2122',
      'Whiteboard AI (10 sessions/mo)',
      'Community Question Bank (read)',
      'Night checklist & morning mode',
      'Basic progress tracking',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Unlimited AI tutoring and advanced analytics',
    monthlyPrice: 12,
    annualPrice: 8,
    badge: 'Most popular',
    featured: true,
    cta: 'Upgrade to Pro',
    features: [
      'Everything in Free',
      'Unlimited Whiteboard AI sessions',
      'Unlimited Ask AI Tutor',
      'Advanced progress analytics',
      'Mistake memory & smart review',
      'Publish questions to community',
      'Study room host (up to 8 people)',
      'Custom flashcard decks',
      'Offline mode',
      'Priority AI response speed',
    ],
  },
  {
    id: 'family',
    name: 'Family',
    tagline: 'Up to 4 students under one subscription',
    monthlyPrice: 20,
    annualPrice: 14,
    cta: 'Upgrade to Family',
    features: [
      'Everything in Pro',
      'Up to 4 student profiles',
      'Parent progress dashboard',
      'Weekly email summaries',
      'Family study rooms',
      'Shared flashcard libraries',
    ],
  },
  {
    id: 'school',
    name: 'School',
    tagline: 'Class management for teachers and students',
    monthlyPrice: null,
    annualPrice: null,
    cta: 'Contact us',
    features: [
      'Everything in Pro',
      'Unlimited student seats',
      'Teacher dashboard',
      'Assignment creation',
      'Bulk progress reports',
      'LMS integration',
      'Dedicated support',
      'Custom branding',
    ],
  },
]

// ── Feature comparison table data ─────────────────────────────────────────

interface FeatureRow {
  label: string
  free: string | boolean
  pro: string | boolean
  family: string | boolean
  school: string | boolean
}

const FEATURE_ROWS: FeatureRow[] = [
  { label: 'AI study plan',          free: true,       pro: true,              family: true,           school: true },
  { label: 'Practice drills',        free: true,       pro: true,              family: true,           school: true },
  { label: 'Flashcards',             free: true,       pro: true,              family: true,           school: true },
  { label: 'AI Learning Brain\u2122',free: true,       pro: true,              family: true,           school: true },
  { label: 'Whiteboard AI',          free: '10/mo',    pro: 'Unlimited',       family: 'Unlimited',    school: 'Unlimited' },
  { label: 'Ask AI Tutor',           free: '5/mo',     pro: 'Unlimited',       family: 'Unlimited',    school: 'Unlimited' },
  { label: 'Progress analytics',     free: 'Basic',    pro: 'Advanced',        family: 'Advanced',     school: 'Advanced' },
  { label: 'Mistake memory',         free: false,      pro: true,              family: true,           school: true },
  { label: 'Community (publish)',    free: false,      pro: true,              family: true,           school: true },
  { label: 'Study rooms',            free: '2 guests', pro: '8 people',        family: '8 people',     school: 'Unlimited' },
  { label: 'Parent dashboard',       free: false,      pro: false,             family: true,           school: true },
  { label: 'Teacher dashboard',      free: false,      pro: false,             family: false,          school: true },
  { label: 'Offline mode',           free: false,      pro: true,              family: true,           school: true },
  { label: 'Priority AI speed',      free: false,      pro: true,              family: true,           school: true },
  { label: 'Dedicated support',      free: false,      pro: false,             family: false,          school: true },
]

// ── Check / cross cell ─────────────────────────────────────────────────────

function FeatureCell({ value }: { value: string | boolean }) {
  if (value === true) {
    return <i className="ti ti-check text-base text-primary" aria-label="Included" />
  }
  if (value === false) {
    return <i className="ti ti-minus text-base text-muted-foreground/40" aria-label="Not included" />
  }
  return <span className="text-xs font-medium text-foreground">{value}</span>
}

// ── Price display ──────────────────────────────────────────────────────────

function PriceDisplay({
  plan,
  cycle,
}: {
  plan: Plan
  cycle: BillingCycle
}) {
  const price = cycle === 'annual' ? plan.annualPrice : plan.monthlyPrice
  if (price === null) {
    return (
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-extrabold text-foreground">Custom</span>
      </div>
    )
  }
  if (price === 0) {
    return (
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-extrabold text-foreground">Free</span>
      </div>
    )
  }
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-sm font-medium text-muted-foreground">$</span>
      <span className="text-3xl font-extrabold tabular-nums text-foreground">{price}</span>
      <span className="text-sm text-muted-foreground">/mo</span>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

interface PremiumViewProps {
  onNavigate: (view: DashboardView) => void
}

export function PremiumView({ onNavigate: _ }: PremiumViewProps) {
  const [cycle, setCycle] = useState<BillingCycle>('annual')
  const [showComparison, setShowComparison] = useState(false)

  return (
    <div className="animate-fade-in flex flex-col gap-8">

      {/* Hero */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-secondary px-3 py-1 text-xs font-semibold text-primary">
          <i className="ti ti-crown text-sm" aria-hidden="true" />
          SAT Sage Premium
        </span>
        <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
          Unlock the full SAT Sage experience
        </h1>
        <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">
          Unlimited AI tutoring, advanced analytics, and every tool you need to hit your target score.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex justify-center">
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setCycle('monthly')}
            className={cn(
              'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
              cycle === 'monthly'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setCycle('annual')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
              cycle === 'annual'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Annual
            <span className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
              cycle === 'annual'
                ? 'bg-white/25 text-white'
                : 'bg-primary/10 text-primary',
            )}>
              Save 33%
            </span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              'relative flex flex-col rounded-3xl border p-5 transition-all',
              plan.featured
                ? 'border-primary bg-primary/5 shadow-lg ring-1 ring-primary/20'
                : 'border-border bg-card shadow-sm',
            )}
          >
            {/* Badge */}
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground shadow">
                  {plan.badge}
                </span>
              </div>
            )}

            {/* Header */}
            <div className="mb-4">
              <p className="text-base font-bold text-foreground">{plan.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{plan.tagline}</p>
            </div>

            {/* Price */}
            <div className="mb-4">
              <PriceDisplay plan={plan} cycle={cycle} />
              {(plan.monthlyPrice ?? 0) > 0 && cycle === 'annual' && (
                <p className="mt-0.5 text-xs text-muted-foreground line-through">
                  ${plan.monthlyPrice}/mo billed monthly
                </p>
              )}
              {cycle === 'annual' && (plan.annualPrice ?? 0) > 0 && (
                <p className="mt-0.5 text-xs text-primary">
                  Billed ${(plan.annualPrice! * 12).toFixed(0)}/year
                </p>
              )}
            </div>

            {/* Features */}
            <ul className="mb-5 flex flex-1 flex-col gap-2" aria-label={`${plan.name} features`}>
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <i className="ti ti-check mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              type="button"
              disabled={plan.id === 'free'}
              className={cn(
                'w-full rounded-xl py-2.5 text-sm font-semibold transition-all',
                plan.id === 'free'
                  ? 'cursor-default border border-border bg-muted text-muted-foreground'
                  : plan.featured
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'border border-primary bg-secondary text-primary hover:bg-secondary/80',
              )}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Stripe notice */}
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <i className="ti ti-lock shrink-0 text-lg text-primary" aria-hidden="true" />
        <span>
          Payments are processed securely via Stripe. Connect the Stripe integration in Settings to activate upgrade flows.
        </span>
      </div>

      {/* Feature comparison toggle */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setShowComparison((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <i className={cn('ti', showComparison ? 'ti-chevron-up' : 'ti-chevron-down')} aria-hidden="true" />
          {showComparison ? 'Hide' : 'Show'} full feature comparison
        </button>
      </div>

      {/* Feature comparison table */}
      {showComparison && (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm" aria-label="Feature comparison">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pl-5 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Feature
                </th>
                {PLANS.map((p) => (
                  <th
                    key={p.id}
                    className={cn(
                      'px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider',
                      p.featured ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_ROWS.map((row, i) => (
                <tr
                  key={row.label}
                  className={cn(
                    'border-b border-border last:border-0',
                    i % 2 === 0 ? 'bg-transparent' : 'bg-muted/30',
                  )}
                >
                  <td className="py-3 pl-5 pr-4 text-xs font-medium text-foreground">
                    {row.label}
                  </td>
                  {(['free', 'pro', 'family', 'school'] as const).map((col) => (
                    <td key={col} className="px-4 py-3 text-center">
                      <FeatureCell value={row[col]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FAQ */}
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-foreground">Frequently asked questions</h2>
        {[
          {
            q: 'Can I cancel anytime?',
            a: 'Yes. Cancel from Settings at any time. You keep Pro access until the end of your billing period.',
          },
          {
            q: 'What payment methods are accepted?',
            a: 'Visa, Mastercard, Amex, Apple Pay, and Google Pay via Stripe. All transactions are encrypted.',
          },
          {
            q: 'Is there a student discount?',
            a: 'Yes. .edu email addresses receive 20% off Pro. Enter your school email at checkout.',
          },
          {
            q: 'Does Free really stay free?',
            a: 'Yes. The triage, study plan, diagnostics, and core practice will always be free.',
          },
        ].map((item) => (
          <FaqItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>

    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-foreground">{q}</span>
        <i
          className={cn('ti shrink-0 text-muted-foreground transition-transform', open ? 'ti-chevron-up' : 'ti-chevron-down')}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="border-t border-border px-5 py-4">
          <p className="text-sm leading-relaxed text-muted-foreground">{a}</p>
        </div>
      )}
    </div>
  )
}
