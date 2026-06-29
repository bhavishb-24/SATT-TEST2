'use client'

import { SESSION_SUMMARY, type LessonSummary } from './lesson-data'

interface SessionSummaryProps {
  onClose: () => void
  /** Live AI-generated summary; falls back to the demo constant when absent. */
  summary?: LessonSummary | null
  /** True while the AI summary is still being generated. */
  loading?: boolean
}

export function SessionSummary({ onClose, summary, loading }: SessionSummaryProps) {
  const s: LessonSummary = summary ?? { ...SESSION_SUMMARY, title: 'Pythagorean theorem', subject: 'Question 14' }

  if (loading && !summary) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
        <div className="rise-in flex w-full max-w-lg flex-col items-center gap-4 rounded-3xl border border-border bg-card px-6 py-12 shadow-2xl">
          <i className="ti ti-loader-2 animate-spin text-3xl text-primary" aria-hidden="true" />
          <p className="text-sm font-medium text-muted-foreground">Putting together your lesson summary…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="rise-in flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-primary px-6 py-5 text-primary-foreground">
          <div className="flex items-center gap-3">
            <i className="ti ti-clipboard-check text-2xl" aria-hidden="true" />
            <div>
              <h2 className="font-serif text-xl leading-tight">Lesson Summary</h2>
              <p className="text-xs opacity-80">
                {s.title}
                {s.subject ? ` · ${s.subject}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close summary"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground/80 transition-colors hover:bg-white/15"
          >
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5">
          {/* Confidence score */}
          <div className="flex items-center gap-4 rounded-2xl bg-primary/10 p-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
              <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--muted)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray={100}
                  strokeDashoffset={100 - s.confidence}
                />
              </svg>
              <span className="absolute text-sm font-bold text-primary">{s.confidence}%</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Confidence score</p>
              <p className="text-xs text-muted-foreground">Up from 64% before this lesson. Nice jump.</p>
            </div>
          </div>

          <SummaryList icon="ti-bulb" title="Concepts learned" items={s.conceptsLearned} />
          <SummaryList icon="ti-circle-check" title="Mistakes corrected" items={s.mistakesCorrected} />

          {/* Next topic */}
          <div className="rounded-2xl border border-border p-4">
            <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
              <i className="ti ti-arrow-right text-primary" aria-hidden="true" />
              Suggested next topic
            </p>
            <p className="text-sm text-muted-foreground">{s.nextTopic}</p>
          </div>

          <SummaryList icon="ti-pencil" title="Homework questions" items={s.homework} ordered />

          {/* Footer actions */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <i className="ti ti-cards" aria-hidden="true" />
              Review {s.flashcards} new flashcards
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <i className="ti ti-device-floppy" aria-hidden="true" />
              Save lesson
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryList({
  icon,
  title,
  items,
  ordered,
}: {
  icon: string
  title: string
  items: string[]
  ordered?: boolean
}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
        <i className={`ti ${icon} text-primary`} aria-hidden="true" />
        {title}
      </p>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="mt-0.5 text-xs font-semibold text-primary">
              {ordered ? `${i + 1}.` : '•'}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
