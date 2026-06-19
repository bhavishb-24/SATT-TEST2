'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  PlanResponse,
  PlanTopic,
  Screen,
  TriageData,
} from '@/lib/sat-types'
import { buildFallbackPlan } from '@/lib/fallback-plan'
import { deriveTimes, TIME_BUDGET_LABELS } from '@/lib/time-utils'
import { useVoice } from '@/lib/use-voice'
import { useStats } from '@/lib/use-stats'
import { TriageForm } from '@/components/sat/triage-form'
import { LoadingScreen } from '@/components/sat/loading-screen'
import { Dashboard } from '@/components/sat/dashboard/dashboard'
import { PanicOverlay } from '@/components/sat/panic-overlay'
import { FloatingControls } from '@/components/sat/floating-controls'

export default function Page() {
  const [screen, setScreen] = useState<Screen>('triage')
  const [triage, setTriage] = useState<TriageData | null>(null)
  const [response, setResponse] = useState<PlanResponse | null>(null)
  const [topics, setTopics] = useState<PlanTopic[]>([])
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [panicOpen, setPanicOpen] = useState(false)
  const lastSpokenStep = useRef<string>('')

  const statsApi = useStats()
  const { setTopicProgress } = statsApi

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

  const handleSubmit = useCallback(
    async (data: TriageData) => {
      setTriage(data)
      setScreen('loading')

      const times = deriveTimes(data.testStartTime)
      const sleepLabel = times?.sleepDeadlineLabel ?? '11:00 PM'
      const wakeLabel = times?.wakeUpLabel ?? '7:00 AM'
      const isSprint = data.timeBudget === 'sprint'

      let result: PlanResponse
      try {
        const res = await fetch('/api/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            sprint: isSprint,
            sleepLabel,
            wakeLabel,
            timeBudgetLabel: TIME_BUDGET_LABELS[data.timeBudget],
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
      setScreen('dashboard')

      if (voice.enabled) {
        const msg =
          data.panic >= 4
            ? 'Your plan is ready. Take a breath. We will go one step at a time.'
            : 'Your study plan is ready. Let us start with your first topic.'
        speak(msg)
      }
    },
    [speak, voice.enabled],
  )

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

  return (
    <div className="relative min-h-dvh bg-background">
      {screen === 'triage' && <TriageForm onSubmit={handleSubmit} />}

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

      {/* Floating voice + panic controls available on every screen after triage. */}
      {screen !== 'landing' && screen !== 'loading' && (
        <FloatingControls
          voiceSupported={voice.supported}
          voiceEnabled={voice.enabled}
          listening={voice.listening}
          onToggleVoice={voice.toggle}
          onPanic={() => setPanicOpen(true)}
        />
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
