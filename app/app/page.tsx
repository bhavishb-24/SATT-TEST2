'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  DiagnosticRecord,
  DiagnosticResult,
  DiagnosticReview,
  PlanResponse,
  PlanTopic,
  Screen,
  TriageData,
} from '@/lib/sat-types'
import { buildFallbackPlan } from '@/lib/fallback-plan'
import { deriveTimes, TIME_BUDGET_LABELS } from '@/lib/time-utils'
import { getPanicTheme } from '@/lib/theme'
import { useVoice } from '@/lib/use-voice'
import { useStats } from '@/lib/use-stats'
import { useAuth } from '@/lib/use-auth'
import { AuthGate } from '@/components/sat/auth-gate'
import { TriageForm } from '@/components/sat/triage-form'
import { DiagnosticTest } from '@/components/sat/diagnostic-test'
import { DiagnosticResults } from '@/components/sat/diagnostic-results'
import { LoadingScreen } from '@/components/sat/loading-screen'
import { Dashboard } from '@/components/sat/dashboard/dashboard'
import { PanicOverlay } from '@/components/sat/panic-overlay'
import { FloatingControls } from '@/components/sat/floating-controls'

export default function Page() {
  const auth = useAuth()
  const [screen, setScreen] = useState<Screen>('triage')
  const [triage, setTriage] = useState<TriageData | null>(null)
  const [response, setResponse] = useState<PlanResponse | null>(null)
  const [topics, setTopics] = useState<PlanTopic[]>([])
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [panicOpen, setPanicOpen] = useState(false)
  const [planLoading, setPlanLoading] = useState(false)
  const lastSpokenStep = useRef<string>('')

  const statsApi = useStats()
  const { setTopicProgress } = statsApi

  const theme = getPanicTheme(triage?.panic ?? 3)

  // Keep the global stats in sync with topic completion.
  useEffect(() => {
    setTopicProgress(completed.size, topics.length)
  }, [completed, topics.length, setTopicProgress])

  // Voice command routing. Kept stable via refs inside the hook.
  const handleCommand = useCallback(
    (command: string) => {
      const c = command.toLowerCase()
      if (c.includes('panic') || c.includes('help me') || c.includes('calm')) {
        setPanicOpen(true)
      } else if (
        c.includes('close') ||
        c.includes('stop') ||
        c.includes('cancel')
      ) {
        setPanicOpen(false)
      } else if (
        c.includes('next') ||
        c.includes('continue') ||
        c.includes('done')
      ) {
        setCompleted((prev) => {
          const next = new Set(prev)
          const target = topics.find((t) => !next.has(t.name))
          if (target) next.add(target.name)
          return next
        })
      }
    },
    [topics],
  )

  const voice = useVoice({ onCommand: handleCommand })

  const speak = useCallback((text: string) => voice.speak(text), [voice])

  // Step 1: triage submitted -> send the student through the diagnostic first.
  const handleTriageSubmit = useCallback((data: TriageData) => {
    setTriage(data)
    setScreen('diagnostic')
  }, [])

  // Step 2: diagnostic finished -> the AI reviews the answers and logs them.
  const handleDiagnosticComplete = useCallback(
    async (results: DiagnosticResult[]) => {
      setScreen('reviewing')

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
        console.log('[v0] diagnostic review failed, using local fallback:', err)
        const missed = Array.from(
          new Set(results.filter((r) => !r.correct).map((r) => r.question.topic)),
        )
        const strong = Array.from(
          new Set(results.filter((r) => r.correct).map((r) => r.question.topic)),
        )
        review = {
          overall_summary: `You answered ${correct} of ${results.length} correct. We'll target what you missed first.`,
          identified_weak_areas: missed.slice(0, 6),
          strengths: strong.slice(0, 3),
          recommended_focus:
            missed.length > 0 ? `Start with ${missed[0]} tonight.` : 'Reinforce your strengths.',
          encouragement: "You showed up the night before — that's already a win.",
        }
      }

      const record: DiagnosticRecord = {
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
      auth.saveDiagnostic(record)
      setScreen('results')
    },
    [auth],
  )

  // Step 3: build the Gemini study plan, informed by the diagnostic "memory".
  const generatePlan = useCallback(
    async (data: TriageData, record: DiagnosticRecord | null) => {
      setPlanLoading(true)
      setScreen('loading')

      const times = deriveTimes(data.testStartTime)
      const sleepLabel = times?.sleepDeadlineLabel ?? '11:00 PM'
      const wakeLabel = times?.wakeUpLabel ?? '7:00 AM'
      const isSprint = data.timeBudget === 'sprint'

      let diagnosticSummary = ''
      if (record) {
        const missed = Array.from(
          new Set(record.results.filter((r) => !r.correct).map((r) => r.question.topic)),
        )
        diagnosticSummary = `Scored ${record.correct}/${record.total} (Math ${record.mathCorrect}/${record.mathTotal}, R&W ${record.rwCorrect}/${record.rwTotal}). Missed topics: ${missed.join(', ') || 'none'}. Coach-identified weak areas: ${record.review.identified_weak_areas.join(', ') || 'none'}.`
      }

      // Merge diagnostic weak areas into the targeted weak areas.
      const mergedWeak = Array.from(
        new Set([...(data.weakAreas || []), ...(record?.review.identified_weak_areas ?? [])]),
      )

      let result: PlanResponse
      try {
        const res = await fetch('/api/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            weakAreas: mergedWeak,
            sprint: isSprint,
            sleepLabel,
            wakeLabel,
            timeBudgetLabel: TIME_BUDGET_LABELS[data.timeBudget],
            diagnosticSummary,
          }),
        })
        if (!res.ok) throw new Error(`status ${res.status}`)
        result = (await res.json()) as PlanResponse
      } catch (err) {
        console.log('[v0] plan fetch failed, using fallback:', err)
        result = {
          plan: buildFallbackPlan(sleepLabel, wakeLabel, isSprint),
          source: 'fallback',
          note: 'We could not reach the AI right now, so here is a proven high-yield plan to get you moving.',
        }
      }

      setResponse(result)
      setTopics(result.plan.topics)
      setPlanLoading(false)
      setScreen('dashboard')

      if (voice.enabled) {
        const msg =
          data.panic >= 4
            ? 'Your plan is ready. Take a breath. We will go one step at a time.'
            : 'Your study plan is ready.'
        speak(msg)
      }
    },
    [speak, voice.enabled],
  )

  const handleSeePlan = useCallback(() => {
    if (!triage) return
    generatePlan(triage, auth.diagnostic)
  }, [triage, auth.diagnostic, generatePlan])

  const handleComplete = useCallback(
    (topicName: string, confident: boolean) => {
      setCompleted((prev) => {
        const next = new Set(prev)
        next.add(topicName)
        return next
      })
      if (voice.enabled) {
        speak(
          confident
            ? 'Nice work. On to the next one.'
            : 'That is okay. We marked it done. Keep moving.',
        )
      }
    },
    [speak, voice.enabled],
  )

  const handleReorder = useCallback((index: number, dir: -1 | 1) => {
    setTopics((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }, [])

  const handleActiveStep = useCallback(
    (text: string) => {
      if (!voice.enabled) return
      if (lastSpokenStep.current === text) return
      lastSpokenStep.current = text
      speak(text)
    },
    [speak, voice.enabled],
  )

  // Wait for guest session to load from storage before deciding what to show.
  if (!auth.ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <i className="ti ti-loader-2 animate-spin text-2xl text-primary" aria-hidden="true" />
      </div>
    )
  }

  // Anonymous guest authentication gate.
  if (!auth.user) {
    return <AuthGate onGuestSignIn={(name) => auth.signInAsGuest(name)} />
  }

  return (
    <div className="relative min-h-dvh bg-background">
      {screen === 'triage' && <TriageForm onSubmit={handleTriageSubmit} />}

      {screen === 'diagnostic' && triage && (
        <DiagnosticTest
          triage={triage}
          theme={theme}
          onComplete={handleDiagnosticComplete}
        />
      )}

      {screen === 'reviewing' && (
        <main className="animate-fade-in flex min-h-dvh flex-col items-center justify-center px-6 text-center">
          <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border border-border bg-card p-10">
            <i className="ti ti-sparkles animate-pulse text-3xl text-primary" aria-hidden="true" />
            <div>
              <p className="text-lg font-bold text-foreground">Reviewing your diagnostic</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your AI coach is analyzing every answer and logging what to focus on.
              </p>
            </div>
          </div>
        </main>
      )}

      {screen === 'results' && auth.diagnostic && (
        <DiagnosticResults
          record={auth.diagnostic}
          theme={theme}
          onSeePlan={handleSeePlan}
          generatingPlan={planLoading}
        />
      )}

      {screen === 'loading' && <LoadingScreen />}

      {screen === 'dashboard' && response && triage && (
        <Dashboard
          triage={triage}
          response={response}
          topics={topics}
          completed={completed}
          statsApi={statsApi}
          voiceEnabled={voice.enabled}
          speak={speak}
          onComplete={handleComplete}
          onReorder={handleReorder}
          onActiveStep={handleActiveStep}
        />
      )}

      {/* Floating voice + panic controls available on the coaching screens. */}
      {(screen === 'dashboard' || screen === 'results') && (
        <FloatingControls onPanic={() => setPanicOpen(true)} />
      )}

      {panicOpen && (
        <PanicOverlay
          onClose={() => setPanicOpen(false)}
          speak={speak}
          voiceEnabled={voice.enabled}
        />
      )}
    </div>
  )
}
