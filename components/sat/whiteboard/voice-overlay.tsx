'use client'

import { cn } from '@/lib/utils'

interface VoiceOverlayProps {
  onClose: () => void
  onStartLesson: () => void
  /** The line the AI is currently narrating. */
  transcript: string
  speaking: boolean
  started: boolean
}

const BAR_DELAYS = [0, 0.18, 0.36, 0.12, 0.3, 0.06, 0.24, 0.4, 0.15]

export function VoiceOverlay({
  onClose,
  onStartLesson,
  transcript,
  speaking,
  started,
}: VoiceOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 p-6 backdrop-blur-md">
      <button
        type="button"
        onClick={onClose}
        aria-label="Exit voice lesson"
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
      >
        <i className="ti ti-x text-lg" aria-hidden="true" />
      </button>

      <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
        <span className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <span className={cn('h-2 w-2 rounded-full bg-primary', speaking && 'status-dot')} />
          Live Voice Lesson
        </span>

        {/* Animated microphone */}
        <div className="relative flex h-40 w-40 items-center justify-center">
          {speaking && (
            <>
              <span className="absolute inset-0 rounded-full bg-primary/15 animate-ping" />
              <span className="absolute inset-4 rounded-full bg-primary/20" />
            </>
          )}
          <span className="relative flex h-28 w-28 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl">
            <i className="ti ti-microphone text-5xl" aria-hidden="true" />
          </span>
        </div>

        {/* Waveform */}
        <div className="flex h-12 items-center justify-center gap-1.5" aria-hidden="true">
          {BAR_DELAYS.map((delay, i) => (
            <span
              key={i}
              className={cn(
                'w-1.5 rounded-full bg-primary',
                speaking ? 'voice-bar h-10' : 'h-2 opacity-40',
              )}
              style={speaking ? { animationDelay: `${delay}s` } : undefined}
            />
          ))}
        </div>

        {/* Live transcript */}
        <div className="min-h-[5rem] w-full rounded-2xl border border-border bg-card px-5 py-4">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {speaking ? 'Tutor is speaking' : started ? 'Lesson complete' : 'Ready when you are'}
          </p>
          <p className="text-pretty text-base font-medium leading-relaxed text-foreground" aria-live="polite">
            {transcript ||
              'Press start and I\u2019ll teach you question 14 out loud while I draw on the board.'}
          </p>
        </div>

        {!started ? (
          <button
            type="button"
            onClick={onStartLesson}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
          >
            <i className="ti ti-player-play" aria-hidden="true" />
            Begin voice lesson
          </button>
        ) : (
          <button
            type="button"
            onClick={onStartLesson}
            disabled={speaking}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <i className="ti ti-refresh" aria-hidden="true" />
            Replay out loud
          </button>
        )}

        <p className="text-xs text-muted-foreground">
          The AI speaks naturally while drawing each step on the whiteboard.
        </p>
      </div>
    </div>
  )
}
