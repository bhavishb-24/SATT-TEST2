'use client'

import { cn } from '@/lib/utils'

export interface SessionStats {
  topic: string | null
  timeStudied: number // seconds
  questionsAnswered: number
  confidence: number // 0–100
  hintsUsed: number
  mistakesCorrected: number
  conceptsLearned: string[]
  estimatedImprovement: number | null // points
}

interface Props {
  session: SessionStats
  hasMessages: boolean
  onGenerateFlashcards: () => void
  onSaveSession: () => void
  onExportNotes: () => void
}

function fmtTime(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

export function SessionPanel({
  session,
  hasMessages,
  onGenerateFlashcards,
  onSaveSession,
  onExportNotes,
}: Props) {
  const statRows = [
    {
      icon: 'ti-clock',
      label: 'Time Studied',
      value: fmtTime(session.timeStudied),
    },
    {
      icon: 'ti-circle-check',
      label: 'Questions Solved',
      value: `${session.questionsAnswered}`,
    },
    {
      icon: 'ti-bulb',
      label: 'Hints Used',
      value: `${session.hintsUsed}`,
    },
    {
      icon: 'ti-x',
      label: 'Mistakes Corrected',
      value: `${session.mistakesCorrected}`,
    },
  ]

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-l border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <i className="ti ti-clipboard-list text-primary text-base" aria-hidden="true" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Session
          </p>
        </div>
      </div>

      {/* Current Topic */}
      <div className="border-b border-border px-4 py-3">
        <p className="mb-1 text-xs text-muted-foreground">Current Topic</p>
        {session.topic ? (
          <p className="text-sm font-semibold text-foreground">{session.topic}</p>
        ) : (
          <p className="text-sm italic text-muted-foreground/70">No topic yet</p>
        )}
      </div>

      {/* Session Stats */}
      {hasMessages ? (
        <div className="flex flex-col gap-0.5 px-3 py-3">
          {statRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <i className={cn('ti', row.icon, 'text-muted-foreground text-sm')} aria-hidden="true" />
                <span className="text-xs text-muted-foreground">{row.label}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{row.value}</span>
            </div>
          ))}

          {/* Confidence bar */}
          <div className="mt-1 rounded-xl border border-border bg-muted/30 px-3 py-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Confidence</span>
              <span className="text-xs font-bold text-primary">{session.confidence}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${session.confidence}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <i className="ti ti-message-circle text-muted-foreground text-lg" aria-hidden="true" />
          </div>
          <p className="text-xs text-muted-foreground">
            Session stats will appear once you start chatting with your tutor.
          </p>
        </div>
      )}

      {/* Concepts Learned */}
      {session.conceptsLearned.length > 0 && (
        <>
          <div className="mx-4 border-t border-border" />
          <div className="px-3 py-3">
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Concepts Learned
            </p>
            <div className="flex flex-wrap gap-1.5 px-1">
              {session.conceptsLearned.map((concept) => (
                <span
                  key={concept}
                  className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Estimated Improvement */}
      {session.estimatedImprovement !== null && (
        <>
          <div className="mx-4 border-t border-border" />
          <div className="px-4 py-3">
            <div className="rounded-xl bg-primary/5 border border-primary/20 px-3 py-3">
              <p className="text-xs text-muted-foreground">Estimated Improvement</p>
              <p className="mt-0.5 text-2xl font-bold text-primary">
                +{session.estimatedImprovement}
                <span className="ml-1 text-sm font-normal text-muted-foreground">pts</span>
              </p>
            </div>
          </div>
        </>
      )}

      {/* Divider */}
      <div className="mx-4 mt-auto border-t border-border" />

      {/* Actions */}
      <div className="flex flex-col gap-1.5 px-3 py-3">
        <button
          type="button"
          disabled={!hasMessages}
          onClick={onGenerateFlashcards}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
            hasMessages
              ? 'bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary'
              : 'cursor-not-allowed opacity-40 bg-muted text-muted-foreground',
          )}
        >
          <i className="ti ti-cards text-base" aria-hidden="true" />
          Generate Flashcards
        </button>

        <button
          type="button"
          disabled={!hasMessages}
          onClick={onSaveSession}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
            hasMessages
              ? 'bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary'
              : 'cursor-not-allowed opacity-40 bg-muted text-muted-foreground',
          )}
        >
          <i className="ti ti-device-floppy text-base" aria-hidden="true" />
          Save Lesson
        </button>

        <button
          type="button"
          disabled={!hasMessages}
          onClick={onExportNotes}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
            hasMessages
              ? 'bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary'
              : 'cursor-not-allowed opacity-40 bg-muted text-muted-foreground',
          )}
        >
          <i className="ti ti-file-export text-base" aria-hidden="true" />
          Export Notes
        </button>
      </div>
    </aside>
  )
}
