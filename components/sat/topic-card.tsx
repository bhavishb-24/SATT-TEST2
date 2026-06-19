'use client'

import { useState } from 'react'
import type { PlanTopic } from '@/lib/sat-types'
import { difficultyBadge } from '@/lib/theme'
import { ScoreBar } from './score-bar'
import { TimerRing } from './timer-ring'

interface Props {
  topic: PlanTopic
  index: number
  total: number
  completed: boolean
  voiceEnabled: boolean
  speak: (text: string) => void
  onComplete: (confident: boolean) => void
  onReorder: (dir: -1 | 1) => void
  onActiveStep: (text: string) => void
}

export function TopicCard({
  topic,
  index,
  total,
  completed,
  voiceEnabled,
  speak,
  onComplete,
  onReorder,
  onActiveStep,
}: Props) {
  const [expanded, setExpanded] = useState(index === 0)
  const [timerOpen, setTimerOpen] = useState(false)
  const [showConfidence, setShowConfidence] = useState(false)
  const [shaky, setShaky] = useState(false)
  const [stuckSteps, setStuckSteps] = useState<Set<number>>(new Set())
  const [showReorder, setShowReorder] = useState(false)
  const [extraMinutes, setExtraMinutes] = useState(0)

  const sectionBadge = 'bg-muted text-muted-foreground'

  function startTimer() {
    setTimerOpen(true)
    setShowConfidence(false)
    if (voiceEnabled) {
      speak(`${topic.name}. ${topic.action_steps[0] ?? ''}`)
      onActiveStep(topic.action_steps[0] ?? '')
    }
  }

  function handleTimerComplete() {
    speak(`${topic.name} time is up. How did that feel?`)
    setShowConfidence(true)
  }

  function toggleStuck(i: number) {
    setStuckSteps((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-card transition-opacity ${
        completed ? 'border-emerald-300 opacity-80 dark:border-emerald-800' : 'border-border'
      }`}
    >
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
              {index + 1}
            </span>
            <div>
              <h3 className="text-base font-bold leading-tight">{topic.name}</h3>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${sectionBadge}`}
              >
                {topic.section}
              </span>
            </div>
          </div>
          {completed && (
            <span className="ti ti-circle-check-filled text-xl text-emerald-500" aria-hidden="true" />
          )}
        </div>

        <ScoreBar percent={topic.score_impact_percent} />

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
            <span className="ti ti-clock" aria-hidden="true" />
            {topic.time_minutes} min
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${difficultyBadge(topic.difficulty)}`}
          >
            {topic.difficulty}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{topic.why_it_matters}</p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowReorder((s) => !s)}
            className="text-xs font-medium text-muted-foreground underline underline-offset-2"
          >
            I don’t agree with this ranking
          </button>
          {showReorder && (
            <span className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Move topic up"
                disabled={index === 0}
                onClick={() => onReorder(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border disabled:opacity-30"
              >
                <span className="ti ti-arrow-up" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Move topic down"
                disabled={index === total - 1}
                onClick={() => onReorder(1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border disabled:opacity-30"
              >
                <span className="ti ti-arrow-down" aria-hidden="true" />
              </button>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex min-h-[44px] items-center justify-between rounded-xl bg-muted px-4 text-sm font-semibold"
        >
          {expanded ? 'Hide action steps' : 'Show action steps'}
          <span className={`ti ${expanded ? 'ti-chevron-up' : 'ti-chevron-down'}`} aria-hidden="true" />
        </button>
      </div>

      {expanded && (
        <div className="flex flex-col gap-4 border-t border-border bg-background/40 p-4">
          <ol className="flex flex-col gap-3">
            {topic.action_steps.map((step, i) => {
              const isSelfCheck = /^self-check/i.test(step.trim())
              return (
                <li
                  key={i}
                  className={`flex flex-col gap-2 rounded-xl border p-3 ${
                    isSelfCheck
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm leading-relaxed">{step}</span>
                    <button
                      type="button"
                      aria-label="Read this step aloud"
                      onClick={() => {
                        speak(step)
                        onActiveStep(step)
                      }}
                      className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border"
                    >
                      <span className="ti ti-volume" aria-hidden="true" />
                    </button>
                  </div>
                  {!isSelfCheck && (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleStuck(i)}
                        className="self-start text-xs font-medium text-amber-600 underline underline-offset-2 dark:text-amber-400"
                      >
                        I’m stuck
                      </button>
                      {stuckSteps.has(i) && (
                        <p className="rounded-lg bg-amber-50 p-2 text-xs leading-relaxed text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                          {topic.stuck_explanation}
                        </p>
                      )}
                    </>
                  )}
                </li>
              )
            })}
          </ol>

          {shaky && topic.confidence_low_steps.length > 0 && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                Let’s slow it down — try these
              </p>
              <ul className="flex flex-col gap-2">
                {topic.confidence_low_steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="ti ti-point text-amber-500" aria-hidden="true" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!completed && (
            <>
              {!timerOpen ? (
                <button
                  type="button"
                  onClick={startTimer}
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
                >
                  <span className="ti ti-player-play" aria-hidden="true" />
                  Start {topic.time_minutes + extraMinutes}-min focus timer
                </button>
              ) : (
                <TimerRing
                  key={extraMinutes}
                  minutes={topic.time_minutes + extraMinutes}
                  onComplete={handleTimerComplete}
                  accentClass="text-primary"
                />
              )}

              {showConfidence && (
                <div className="flex flex-col gap-2">
                  <p className="text-center text-sm font-semibold">How did that feel?</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onComplete(true)}
                      className="flex min-h-[48px] flex-col items-center justify-center rounded-xl bg-emerald-600 text-sm font-semibold text-white"
                    >
                      Got it
                      <span className="text-xs font-normal opacity-90">mark complete</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShaky(true)
                        setExtraMinutes((m) => m + 15)
                        setShowConfidence(false)
                        setTimerOpen(false)
                      }}
                      className="flex min-h-[48px] flex-col items-center justify-center rounded-xl border border-amber-400 bg-amber-50 text-sm font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                    >
                      Still shaky
                      <span className="text-xs font-normal opacity-90">+15 min &amp; simpler steps</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </article>
  )
}
