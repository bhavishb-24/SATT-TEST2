'use client'

import { useState } from 'react'
import type {
  DiagnosticRecord,
  DiagnosticResult,
  DiagnosticReview,
  TriageData,
} from '@/lib/sat-types'
import type { PanicTheme } from '@/lib/theme'
import { compareDiagnostics } from '@/lib/diagnostic-compare'
import { cn } from '@/lib/utils'
import { DiagnosticTest } from './diagnostic-test'
import { DiagnosticComparison } from './diagnostic-comparison'

const POST_MATH_COUNT = 30
const POST_RW_COUNT = 30

type Phase = 'intro' | 'test' | 'reviewing' | 'results'

interface Props {
  pre: DiagnosticRecord | null
  triage: TriageData
  theme: PanicTheme
  onClose: () => void
  onSaved: (record: DiagnosticRecord) => void
  onRebuildPlan: (record: DiagnosticRecord) => void
}

export function PostDiagnostic({
  pre,
  triage,
  theme,
  onClose,
  onSaved,
  onRebuildPlan,
}: Props) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [record, setRecord] = useState<DiagnosticRecord | null>(null)

  async function handleComplete(results: DiagnosticResult[]) {
    setPhase('reviewing')

    const isMath = (r: DiagnosticResult) => r.question.section === 'Math'
    const mathResults = results.filter(isMath)
    const rwResults = results.filter((r) => !isMath(r))
    const correct = results.filter((r) => r.correct).length
    const mathCorrect = mathResults.filter((r) => r.correct).length
    const rwCorrect = rwResults.filter((r) => r.correct).length

    const payload = {
      results: results.map((r) => ({
        section: r.question.section,
        topic: r.question.topic,
        difficulty: r.question.difficulty,
        correct: r.correct,
      })),
      correct,
      total: results.length,
      mathCorrect,
      mathTotal: mathResults.length,
      rwCorrect,
      rwTotal: rwResults.length,
    }

    let review: DiagnosticReview
    let source: 'ai' | 'fallback' = 'fallback'
    try {
      const res = await fetch('/api/diagnostic-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      const data = await res.json()
      review = data.review as DiagnosticReview
      source = data.source === 'ai' ? 'ai' : 'fallback'
    } catch (err) {
      console.log('[v0] post-diagnostic review failed, using fallback:', err)
      const missed = Array.from(
        new Set(results.filter((r) => !r.correct).map((r) => r.question.topic)),
      )
      const strong = Array.from(
        new Set(results.filter((r) => r.correct).map((r) => r.question.topic)),
      )
      review = {
        overall_summary: `You answered ${correct} of ${results.length} correct on your progress check.`,
        identified_weak_areas: missed.slice(0, 6),
        strengths: strong.slice(0, 3),
        recommended_focus:
          missed.length > 0 ? `Keep drilling ${missed[0]}.` : 'Reinforce your strengths.',
        encouragement: 'You came back for a progress check — that is exactly how scores climb.',
      }
    }

    const built: DiagnosticRecord = {
      results,
      review,
      correct,
      total: results.length,
      mathCorrect,
      mathTotal: mathResults.length,
      rwCorrect,
      rwTotal: rwResults.length,
      source,
      takenAt: Date.now(),
    }
    setRecord(built)
    onSaved(built)
    setPhase('results')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      {phase === 'intro' && (
        <div className="animate-fade-in mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center gap-6 px-5 py-10">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <span
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full',
                theme.accentBgSoft,
              )}
            >
              <i className={cn('ti ti-progress-check text-3xl', theme.accentText)} aria-hidden="true" />
            </span>
            <h1 className="mt-4 font-serif text-2xl font-normal tracking-tight lg:text-3xl">
              Progress check
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {`Now that you have worked through your plan, take a fresh ${
                POST_MATH_COUNT + POST_RW_COUNT
              }-question diagnostic — ${POST_MATH_COUNT} Math and ${POST_RW_COUNT} Reading & Writing. When you finish, we will:`}
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              <IntroItem icon="ti-arrows-diff" text="Compare these results against your very first diagnostic" />
              <IntroItem icon="ti-trending-up" text="Show exactly how much your Math and Reading & Writing scores moved" />
              <IntroItem icon="ti-mood-happy" text="Highlight what you nailed and what you did well" />
              <IntroItem icon="ti-target" text="Pinpoint the topics worth studying a little more" />
              <IntroItem icon="ti-refresh" text="Let you build a brand-new study plan from what we learn" />
            </ul>

            {!pre && (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                We could not find your original diagnostic, so we will show this score on its own
                instead of a before-and-after comparison.
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Not now
              </button>
              <button
                type="button"
                onClick={() => setPhase('test')}
                className={cn(
                  'flex min-h-[48px] flex-[2] items-center justify-center gap-2 rounded-xl px-5 text-base font-semibold text-card transition-opacity hover:opacity-90',
                  theme.accentBg,
                )}
              >
                Start the {POST_MATH_COUNT + POST_RW_COUNT}-question check
                <i className="ti ti-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'test' && (
        <DiagnosticTest
          triage={triage}
          theme={theme}
          mathCount={POST_MATH_COUNT}
          rwCount={POST_RW_COUNT}
          title="Progress check"
          onComplete={handleComplete}
          onSkip={onClose}
        />
      )}

      {phase === 'reviewing' && (
        <main className="animate-fade-in flex min-h-dvh flex-col items-center justify-center px-6 text-center">
          <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border border-border bg-card p-10">
            <i className="ti ti-sparkles animate-pulse text-3xl text-primary" aria-hidden="true" />
            <div>
              <p className="text-lg font-bold text-foreground">Comparing your results</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Measuring your progress against your first diagnostic.
              </p>
            </div>
          </div>
        </main>
      )}

      {phase === 'results' && record && (
        <DiagnosticComparison
          comparison={pre ? compareDiagnostics(pre, record) : null}
          post={record}
          theme={theme}
          onClose={onClose}
          onRebuildPlan={() => onRebuildPlan(record)}
        />
      )}
    </div>
  )
}

function IntroItem({ icon, text }: { icon: string; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <i className={cn('ti text-sm', icon)} aria-hidden="true" />
      </span>
      <span className="text-sm leading-relaxed text-foreground">{text}</span>
    </li>
  )
}
