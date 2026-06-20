'use client'

import { useEffect, useState } from 'react'
import type { PlanTopic } from '@/lib/sat-types'
import { difficultyBadge } from '@/lib/theme'
import { getTopicLesson } from '@/lib/topic-lessons'
import { ScoreBar } from './score-bar'
import { TopicLesson } from './topic-lesson'

interface Props {
  topic: PlanTopic
  index: number
  total: number
  completed: boolean
  locked: boolean
  isActive: boolean
  onComplete: (confident: boolean) => void
  onReorder: (dir: -1 | 1) => void
}

export function TopicCard({
  topic,
  index,
  total,
  completed,
  locked,
  isActive,
  onComplete,
  onReorder,
}: Props) {
  const [expanded, setExpanded] = useState(isActive)
  const [showReorder, setShowReorder] = useState(false)
  const lesson = getTopicLesson(topic)

  // Auto-expand a card the moment it becomes the active (newly unlocked) one.
  useEffect(() => {
    if (isActive) setExpanded(true)
  }, [isActive])

  const sectionBadge = 'bg-muted text-muted-foreground'

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-card transition-all ${
        completed
          ? 'border-emerald-300 dark:border-emerald-800'
          : locked
            ? 'border-border opacity-60'
            : isActive
              ? 'border-primary shadow-sm'
              : 'border-border'
      }`}
    >
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                completed
                  ? 'bg-emerald-500 text-white'
                  : locked
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-primary text-primary-foreground'
              }`}
            >
              {completed ? (
                <span className="ti ti-check" aria-hidden="true" />
              ) : locked ? (
                <span className="ti ti-lock" aria-hidden="true" />
              ) : (
                index + 1
              )}
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

        {/* Targets summary */}
        {!locked && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className="ti ti-target-arrow text-primary" aria-hidden="true" />
            {lesson.targets.length} interactive learning targets
          </p>
        )}

        {/* Locked state */}
        {locked && (
          <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
            <span className="ti ti-lock shrink-0" aria-hidden="true" />
            Finish the previous topic to unlock this lesson.
          </div>
        )}

        {/* Reorder — only offered on the active, not-yet-started card */}
        {!locked && !completed && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowReorder((s) => !s)}
              className="text-xs font-medium text-muted-foreground underline underline-offset-2"
            >
              I don&apos;t agree with this ranking
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
        )}

        {/* Expand toggle (hidden while locked) */}
        {!locked && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="flex min-h-[44px] items-center justify-between rounded-xl bg-muted px-4 text-sm font-semibold"
          >
            {expanded ? 'Hide lesson' : completed ? 'Review lesson' : 'Start lesson'}
            <span className={`ti ${expanded ? 'ti-chevron-up' : 'ti-chevron-down'}`} aria-hidden="true" />
          </button>
        )}
      </div>

      {!locked && expanded && (
        <div className="border-t border-border bg-background/40 p-4">
          <TopicLesson
            lesson={lesson}
            completed={completed}
            onComplete={() => onComplete(true)}
          />
        </div>
      )}
    </article>
  )
}
