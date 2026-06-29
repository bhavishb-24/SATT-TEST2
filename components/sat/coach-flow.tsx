'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CoachAdaptation, CoachMode, PlanResponse, PlanTopic, TriageData } from '@/lib/sat-types'
import { getPanicTheme } from '@/lib/theme'
import { deriveTimes, formatMinutes, parseTimeToMinutes } from '@/lib/time-utils'
import { cn } from '@/lib/utils'
import { ScoreBar } from './score-bar'
import { BreathingAnimation } from './breathing-animation'

interface CoachFlowProps {
  triage: TriageData
  response: PlanResponse
  topics: PlanTopic[]
  completed: Set<string>
  voiceEnabled: boolean
  speak: (text: string) => void
  onComplete: (topicName: string, confident: boolean) => void
  onGoToChecklist: () => void
  onShowFullPlan: () => void
}

// ─── helpers ────────────────────────────────────────────────────────────────

function minutesUntil(timeLabel: string): number {
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const target = parseTimeToMinutes(timeLabel)
  if (target == null) return 999
  const diff = target - nowMinutes
  return diff > 0 ? diff : diff + 1440
}

// ─── adaptation banner ──────────────────────────────────────────────────────

function AdaptationBanner({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 animate-fade-in">
      <div className="flex max-w-sm items-start gap-2 rounded-2xl border border-primary/30 bg-card px-4 py-3 shadow-lg">
        <span className="ti ti-adjustments-horizontal mt-0.5 shrink-0 text-primary" aria-hidden="true" />
        <p className="text-sm text-foreground">{message}</p>
      </div>
    </div>
  )
}

// ─── escape hatch link ──────────────────────────────────────────────────────

function EscapeHatch({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-4 top-4 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground sm:right-6 sm:top-5"
    >
      See full plan overview
    </button>
  )
}

// ─── CoachFlow ───────────────────────────────────────────────────────────────

export function CoachFlow({
  triage,
  response,
  topics: initialTopics,
  completed,
  voiceEnabled,
  speak,
  onComplete,
  onGoToChecklist,
  onShowFullPlan,
}: CoachFlowProps) {
  const [coachMode, setCoachMode] = useState<CoachMode>('topicIntro')
  const [topics, setTopics] = useState<PlanTopic[]>(initialTopics)
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [topicStartTime, setTopicStartTime] = useState<Date | null>(null)
  const [confusionCount, setConfusionCount] = useState<Record<number, number>>({})
  const [adaptations, setAdaptations] = useState<CoachAdaptation[]>([])
  const [pendingBanner, setPendingBanner] = useState<string | null>(null)
  const [showStuck, setShowStuck] = useState(false)
  const [miniBreakActive, setMiniBreakActive] = useState(false)
  // track what step to return to after a mini break
  const returnStepRef = useRef<number>(0)

  const theme = getPanicTheme(triage.panic)
  const sprint = triage.timeBudget === 'sprint'
  const times = deriveTimes(triage.testStartTime)
  const sleepLabel = times?.sleepDeadlineLabel ?? '11:00 PM'

  const currentTopic = topics[currentTopicIndex]

  // ── adaptation check ────────────────────────────────────────────────────

  const checkAdaptations = useCallback(() => {
    if (!currentTopic) return
    const minutesRemaining = minutesUntil(sleepLabel)
    const minutesForRemaining = topics
      .slice(currentTopicIndex + 1)
      .reduce((sum, t) => sum + t.time_minutes, 0)

    if (minutesRemaining < minutesForRemaining + 15 && topics.length > currentTopicIndex + 1) {
      // Drop the lowest-yield remaining topic
      const remaining = topics.slice(currentTopicIndex + 1)
      const sorted = [...remaining].sort((a, b) => a.score_impact_percent - b.score_impact_percent)
      const toDrop = sorted[0]
      if (toDrop && !adaptations.find((a) => a.topic === toDrop.name)) {
        const msg = `Running low on time. I removed ${toDrop.name} from your plan. Focus on what's left.`
        setAdaptations((prev) => [...prev, { topic: toDrop.name, message: msg }])
        setTopics((prev) => prev.filter((t) => t.name !== toDrop.name))
        setPendingBanner(msg)
      }
    }
  }, [currentTopic, topics, currentTopicIndex, sleepLabel, adaptations])

  // ── periodic adaptation check every 5 minutes ───────────────────────────
  useEffect(() => {
    const interval = setInterval(checkAdaptations, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [checkAdaptations])

  // ── voice announce ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!voiceEnabled) return
    if (coachMode === 'topicIntro' && currentTopic) {
      speak(`Topic ${currentTopicIndex + 1} of ${topics.length}: ${currentTopic.name}. We're spending ${currentTopic.time_minutes} minutes here.`)
    }
  }, [coachMode, currentTopicIndex]) // intentionally limited deps

  // ── navigate forward ─────────────────────────────────────────────────────

  function startTopic() {
    setTopicStartTime(new Date())
    setCurrentStepIndex(0)
    setShowStuck(false)
    setCoachMode('stepByStep')
  }

  function advanceFromCheckIn(response: 'got-it' | 'confused' | 'break') {
    const nextStep = currentStepIndex + 1
    const steps = getSteps()

    if (response === 'confused') {
      const newCount = (confusionCount[currentTopicIndex] ?? 0) + 1
      setConfusionCount((prev) => ({ ...prev, [currentTopicIndex]: newCount }))
      if (newCount >= 2 && currentTopic.confidence_low_steps.length > 0) {
        const msg = `Simplified steps for ${currentTopic.name}. You were finding it tricky.`
        setAdaptations((prev) => {
          if (prev.find((a) => a.topic === currentTopic.name && a.message === msg)) return prev
          return [...prev, { topic: currentTopic.name, message: msg }]
        })
        setPendingBanner(msg)
      }
      setShowStuck(true)
      setCoachMode('stepByStep')
      return
    }

    if (response === 'break') {
      returnStepRef.current = nextStep
      setMiniBreakActive(true)
      setCoachMode('stepByStep')
      return
    }

    // got-it
    if (nextStep >= steps.length) {
      // all steps done → topic complete
      onComplete(currentTopic.name, true)
      setCoachMode('topicComplete')
      checkFastAdaptation()
    } else {
      setCurrentStepIndex(nextStep)
      setShowStuck(false)
      setCoachMode('stepByStep')
    }
  }

  function completedStep() {
    const steps = getSteps()
    const nextStep = currentStepIndex + 1
    if (nextStep >= steps.length) {
      onComplete(currentTopic.name, true)
      setCoachMode('topicComplete')
      checkFastAdaptation()
    } else {
      setCurrentStepIndex(nextStep)
      setShowStuck(false)
      setCoachMode('checkIn')
    }
  }

  function advanceFromTopicComplete() {
    const nextIndex = currentTopicIndex + 1
    if (nextIndex >= topics.length) {
      setCoachMode('allDone')
    } else {
      setCurrentTopicIndex(nextIndex)
      setCurrentStepIndex(0)
      setShowStuck(false)
      if (sprint) {
        // sprint → short break then next topic
        setCoachMode('break')
      } else {
        setCoachMode('break')
      }
    }
  }

  function advanceFromBreak() {
    setCurrentStepIndex(0)
    setShowStuck(false)
    setCoachMode('topicIntro')
  }

  function checkFastAdaptation() {
    if (!topicStartTime || !currentTopic) return
    const elapsed = (Date.now() - topicStartTime.getTime()) / 60000
    if (elapsed < currentTopic.time_minutes * 0.6) {
      const msg = `You finished ${currentTopic.name} fast. I added extra review time to your next topic.`
      setAdaptations((prev) => [...prev, { topic: currentTopic.name, message: msg }])
      setPendingBanner(msg)
      // give next topic extra time
      setTopics((prev) => {
        const next = [...prev]
        const idx = currentTopicIndex + 1
        if (idx < next.length) {
          next[idx] = { ...next[idx], time_minutes: Math.round(next[idx].time_minutes * 1.2) }
        }
        return next
      })
    }
    checkAdaptations()
  }

  function getSteps(): string[] {
    if (!currentTopic) return []
    const confused = confusionCount[currentTopicIndex] ?? 0
    if (confused >= 2 && currentTopic.confidence_low_steps.length > 0) {
      return currentTopic.confidence_low_steps
    }
    return currentTopic.action_steps
  }

  if (!currentTopic) return null

  const steps = getSteps()
  const breakDuration = sprint ? 60 : 5 * 60 // seconds

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-dvh bg-background">
      {/* Persistent escape hatch */}
      <EscapeHatch onClick={onShowFullPlan} />

      {/* Adaptation banner */}
      {pendingBanner && (
        <AdaptationBanner message={pendingBanner} onDone={() => setPendingBanner(null)} />
      )}

      {/* ── topicIntro ────────────────────────────────────────────────── */}
      {coachMode === 'topicIntro' && (
        <ScreenWrap>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Topic {currentTopicIndex + 1} of {topics.length}
          </p>
          <div className="flex flex-col gap-3">
            <span
              className={cn(
                'inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                currentTopic.section === 'Math'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-violet-100 text-violet-700',
              )}
            >
              <span
                className={cn(
                  'ti',
                  currentTopic.section === 'Math' ? 'ti-math' : 'ti-book-2',
                )}
                aria-hidden="true"
              />
              {currentTopic.section}
            </span>
            <h1 className="font-serif text-4xl font-normal leading-tight tracking-tight text-foreground sm:text-5xl">
              {currentTopic.name}
            </h1>
          </div>
          <p className="text-base leading-relaxed text-muted-foreground">
            {currentTopic.why_it_matters}
          </p>
          <ScoreBar percent={currentTopic.score_impact_percent} />
          <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-4 py-3">
            <span className="ti ti-clock text-primary" aria-hidden="true" />
            <span className="text-sm text-foreground">
              We&apos;re spending{' '}
              <strong>{currentTopic.time_minutes} minutes</strong> here
            </span>
          </div>
          <button
            type="button"
            onClick={startTopic}
            className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:opacity-80"
          >
            Start topic
            <span className="ti ti-arrow-right" aria-hidden="true" />
          </button>
        </ScreenWrap>
      )}

      {/* ── stepByStep ───────────────────────────────────────────────── */}
      {coachMode === 'stepByStep' && (
        <ScreenWrap>
          {/* mini break overlay */}
          {miniBreakActive && (
            <MiniBreak
              onDone={() => {
                setCurrentStepIndex(returnStepRef.current)
                setMiniBreakActive(false)
              }}
            />
          )}

          {!miniBreakActive && (
            <>
              {/* Progress */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Step {currentStepIndex + 1} of {steps.length}
                  </p>
                  <p className="text-xs text-muted-foreground">{currentTopic.name}</p>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Step text or stuck explanation */}
              <div className="flex-1">
                {showStuck ? (
                  <div className="flex flex-col gap-4">
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-600">
                        Let me explain this differently
                      </p>
                      <p className="text-lg leading-relaxed text-foreground">
                        {currentTopic.stuck_explanation}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowStuck(false)}
                      className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground"
                    >
                      Got it, show me the step again
                      <span className="ti ti-arrow-right" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <p className="text-[17px] leading-[1.7] text-foreground">
                      {steps[currentStepIndex]}
                    </p>
                    {/* Voice read button */}
                    {voiceEnabled && (
                      <button
                        type="button"
                        onClick={() => speak(steps[currentStepIndex])}
                        className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        aria-label="Read step aloud"
                      >
                        <span className="ti ti-volume" aria-hidden="true" />
                        Read aloud
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              {!showStuck && (
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={completedStep}
                    className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:opacity-80"
                  >
                    Done, next step
                    <span className="ti ti-arrow-right" aria-hidden="true" />
                  </button>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowStuck(true)}
                      className="min-h-[44px] text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    >
                      I&apos;m stuck
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        returnStepRef.current = currentStepIndex
                        setMiniBreakActive(true)
                      }}
                      className="min-h-[44px] text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    >
                      I need a break
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </ScreenWrap>
      )}

      {/* ── checkIn ──────────────────────────────────────────────────── */}
      {coachMode === 'checkIn' && (
        <ScreenWrap>
          <h2 className="font-serif text-3xl font-normal text-foreground sm:text-4xl">
            How was that step?
          </h2>
          <div className="flex flex-col gap-3">
            <CheckInCard
              icon="ti-circle-check"
              iconColor="text-emerald-500"
              label="Got it"
              onClick={() => advanceFromCheckIn('got-it')}
            />
            <CheckInCard
              icon="ti-mood-confuzed"
              iconColor="text-amber-500"
              label="That was confusing"
              onClick={() => advanceFromCheckIn('confused')}
            />
            <CheckInCard
              icon="ti-wind"
              iconColor="text-blue-500"
              label="I need a quick break"
              onClick={() => advanceFromCheckIn('break')}
            />
          </div>
        </ScreenWrap>
      )}

      {/* ── topicComplete ─────────────────────────────────────────────── */}
      {coachMode === 'topicComplete' && (
        <TopicCompleteScreen
          topic={currentTopic}
          onDone={advanceFromTopicComplete}
          isLast={currentTopicIndex >= topics.length - 1}
        />
      )}

      {/* ── break ─────────────────────────────────────────────────────── */}
      {coachMode === 'break' && (
        <BreakScreen
          duration={breakDuration}
          sprint={sprint}
          speak={speak}
          voiceEnabled={voiceEnabled}
          onDone={advanceFromBreak}
        />
      )}

      {/* ── allDone ───────────────────────────────────────────────────── */}
      {coachMode === 'allDone' && (
        <AllDoneScreen
          topics={topics}
          adaptations={adaptations}
          sleepLabel={sleepLabel}
          wakeLabel={times?.wakeUpLabel ?? '7:00 AM'}
          onChecklist={onGoToChecklist}
          onReview={(index) => {
            setCurrentTopicIndex(index)
            setCurrentStepIndex(0)
            setShowStuck(false)
            setCoachMode('topicIntro')
          }}
        />
      )}
    </div>
  )
}

// ─── ScreenWrap ──────────────────────────────────────────────────────────────

function ScreenWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center gap-6 px-6 py-16">
      {children}
    </div>
  )
}

// ─── CheckInCard ─────────────────────────────────────────────────────────────

function CheckInCard({
  icon,
  iconColor,
  label,
  onClick,
}: {
  icon: string
  iconColor: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[64px] w-full items-center gap-4 rounded-2xl border border-border bg-card px-5 text-left text-base font-medium text-foreground transition-colors hover:bg-muted/50 active:scale-[0.98]"
    >
      <span className={cn('ti shrink-0 text-2xl', icon, iconColor)} aria-hidden="true" />
      {label}
    </button>
  )
}

// ─── TopicCompleteScreen ─────────────────────────────────────────────────────

function TopicCompleteScreen({
  topic,
  onDone,
  isLast,
}: {
  topic: PlanTopic
  onDone: () => void
  isLast: boolean
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6 py-16 text-center">
      {/* CSS-only checkmark animation */}
      <div className="check-circle">
        <svg
          viewBox="0 0 52 52"
          className="h-20 w-20"
          aria-hidden="true"
        >
          <circle
            className="check-circle__circle"
            cx="26"
            cy="26"
            r="25"
            fill="none"
            strokeWidth="2"
          />
          <path
            className="check-circle__check"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            d="M14 27 l8 8 l16 -16"
          />
        </svg>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-serif text-4xl font-normal text-foreground">{topic.name} complete</h2>
        <p className="text-lg text-muted-foreground">
          {topic.score_impact_percent}% of your test just got easier
        </p>
      </div>
      <button
        type="button"
        onClick={onDone}
        className="text-sm text-muted-foreground underline underline-offset-4"
      >
        {isLast ? 'Continue' : 'Skip to break'}
      </button>
    </div>
  )
}

// ─── BreakScreen ─────────────────────────────────────────────────────────────

function BreakScreen({
  duration,
  sprint,
  speak,
  voiceEnabled,
  onDone,
}: {
  duration: number
  sprint: boolean
  speak: (t: string) => void
  voiceEnabled: boolean
  onDone: () => void
}) {
  const [remaining, setRemaining] = useState(duration)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    setRemaining(duration)
  }, [duration])

  useEffect(() => {
    if (remaining <= 0) {
      doneRef.current()
      return
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [remaining])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background px-6 py-16 text-center">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {sprint ? '1-minute reset' : '5-minute break'}
        </p>
        <h2 className="font-serif text-4xl font-normal text-foreground">
          Take a break. You earned it.
        </h2>
      </div>

      {/* Countdown */}
      <div className="flex h-40 w-40 items-center justify-center rounded-full bg-primary/10">
        <span className="text-4xl font-bold tabular-nums text-primary">
          {mins}:{secs.toString().padStart(2, '0')}
        </span>
      </div>

      {/* Breathing prompt */}
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
        While you wait: breathe in for 4, hold for 7, out for 8
      </p>

      {/* Animated breathing circle */}
      <BreathingOrb />

      {sprint && (
        <button
          type="button"
          onClick={onDone}
          className="min-h-[44px] text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Skip break
        </button>
      )}
    </div>
  )
}

function BreathingOrb() {
  return (
    <div className="flex h-24 w-24 items-center justify-center">
      <div className="h-16 w-16 animate-[breathe_19s_ease-in-out_infinite] rounded-full bg-blue-400/40" />
    </div>
  )
}

// ─── MiniBreak (60s) ─────────────────────────────────────────────────────────

function MiniBreak({ onDone }: { onDone: () => void }) {
  const [remaining, setRemaining] = useState(60)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    if (remaining <= 0) { doneRef.current(); return }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [remaining])

  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        60-second reset
      </p>
      <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-500/15">
        <span className="text-3xl font-bold tabular-nums text-blue-600">{remaining}</span>
      </div>
      <p className="text-sm text-muted-foreground">Breathe in 4, hold 7, out 8</p>
      <button
        type="button"
        onClick={onDone}
        className="text-sm text-muted-foreground underline underline-offset-4"
      >
        Skip
      </button>
    </div>
  )
}

// ─── AllDoneScreen ───────────────────────────────────────────────────────────

function AllDoneScreen({
  topics,
  adaptations,
  sleepLabel,
  wakeLabel,
  onChecklist,
  onReview,
}: {
  topics: PlanTopic[]
  adaptations: CoachAdaptation[]
  sleepLabel: string
  wakeLabel: string
  onChecklist: () => void
  onReview: (index: number) => void
}) {
  const [reviewOpen, setReviewOpen] = useState(false)

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-3">
        <span className="ti ti-trophy text-5xl text-primary" aria-hidden="true" />
        <h1 className="font-serif text-4xl font-normal leading-tight text-foreground sm:text-5xl">
          You finished your study plan.
        </h1>
      </div>

      {/* Topics covered */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Tonight you reviewed
        </p>
        <ul className="flex flex-col gap-2">
          {topics.map((t, i) => (
            <li key={t.name} className="flex items-center gap-2 text-sm text-foreground">
              <span className="ti ti-circle-check text-emerald-500" aria-hidden="true" />
              {t.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Adaptations summary */}
      {adaptations.length > 0 && (
        <div className="rounded-2xl border border-border bg-muted/40 p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Plan adjustments
          </p>
          <p className="mb-3 text-sm text-foreground">
            We adjusted your plan{' '}
            <strong>{adaptations.length}</strong>{' '}
            {adaptations.length === 1 ? 'time' : 'times'} based on your pace.
          </p>
          <ul className="flex flex-col gap-1.5">
            {adaptations.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="ti ti-adjustments-horizontal mt-0.5 shrink-0" aria-hidden="true" />
                {a.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sleep / wake recap */}
      <div className="flex items-center justify-between rounded-2xl bg-primary/10 px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Sleep by</span>
          <span className="text-base font-semibold text-foreground">{sleepLabel}</span>
        </div>
        <div className="h-8 w-px bg-primary/20" />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Wake up</span>
          <span className="text-base font-semibold text-foreground">{wakeLabel}</span>
        </div>
      </div>

      {/* Actions */}
      <button
        type="button"
        onClick={onChecklist}
        className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground"
      >
        Go to my night-before checklist
        <span className="ti ti-arrow-right" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={() => setReviewOpen(!reviewOpen)}
        className="min-h-[44px] text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Review a topic again
      </button>

      {reviewOpen && (
        <div className="flex flex-col gap-2">
          {topics.map((t, i) => (
            <button
              key={t.name}
              type="button"
              onClick={() => onReview(i)}
              className="flex min-h-[48px] w-full items-center gap-3 rounded-xl border border-border bg-card px-4 text-sm text-foreground hover:bg-muted/50"
            >
              <span className="ti ti-refresh shrink-0 text-primary" aria-hidden="true" />
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
