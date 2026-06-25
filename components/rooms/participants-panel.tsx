'use client'

import { cn } from '@/lib/utils'
import type { RoomParticipant, AiStatus } from '@/lib/room-types'

interface Props {
  participants: RoomParticipant[]
  aiStatus: AiStatus
  teamQuestLabel: string
  teamQuestProgress: number
  sessionStartedAt: string
  roomCode: string
}

const AI_STATUS_LABEL: Record<AiStatus, string> = {
  teaching:  'Teaching',
  thinking:  'Thinking...',
  drawing:   'Drawing',
  listening: 'Listening',
  idle:      'Standby',
}
const AI_STATUS_COLOR: Record<AiStatus, string> = {
  teaching:  'bg-primary',
  thinking:  'bg-amber-400',
  drawing:   'bg-blue-500',
  listening: 'bg-emerald-400',
  idle:      'bg-muted-foreground',
}

function VoiceWave({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <span className="flex items-end gap-[2px]" aria-label="Speaking">
      {[0.3, 0.7, 1, 0.6, 0.4].map((delay, i) => (
        <span
          key={i}
          className="voice-bar inline-block w-[3px] rounded-full bg-primary"
          style={{ height: 12, animationDelay: `${delay * 0.4}s` }}
        />
      ))}
    </span>
  )
}

export function ParticipantsPanel({
  participants,
  aiStatus,
  teamQuestLabel,
  teamQuestProgress,
  sessionStartedAt,
  roomCode,
}: Props) {
  const aiParticipant = participants.find((p) => p.id === 'ai')
  const students = participants.filter((p) => p.id !== 'ai')

  return (
    <aside className="flex h-full flex-col gap-4 overflow-y-auto p-4">

      {/* Session info chip */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-3 py-2 text-xs">
        <span className="font-medium text-muted-foreground">Started {sessionStartedAt}</span>
        <span className="rounded-full bg-secondary px-2 py-0.5 font-mono font-bold text-primary">{roomCode}</span>
      </div>

      {/* AI Tutor card — always pinned at top */}
      {aiParticipant && (
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-secondary p-4 shadow-sm">
          {/* subtle animated ring when teaching/drawing */}
          {(aiStatus === 'teaching' || aiStatus === 'drawing') && (
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-3xl"
              style={{
                boxShadow: '0 0 0 2px rgba(14,138,106,0.3)',
                animation: 'levelGlow 2s ease-in-out infinite',
              }}
            />
          )}
          <div className="flex items-center gap-3">
            {/* Avatar with pulse ring */}
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
                S
              </div>
              {aiStatus !== 'idle' && (
                <span
                  aria-hidden="true"
                  className="absolute -inset-1 rounded-2xl"
                  style={{ animation: 'pulseRing 1.6s ease-in-out infinite', border: '2px solid rgba(14,138,106,0.45)' }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">Sage AI</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className={cn('h-2 w-2 rounded-full', AI_STATUS_COLOR[aiStatus])} />
                <span className="text-xs font-medium text-muted-foreground">{AI_STATUS_LABEL[aiStatus]}</span>
              </div>
            </div>
            <i className="ti ti-sparkles text-base text-primary" aria-hidden="true" />
          </div>

          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Your AI tutor is active. Ask a question or circle something on the whiteboard.
          </p>
        </div>
      )}

      {/* Team quest progress */}
      <div className="rounded-2xl border border-border bg-card p-3.5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground">Team Quest</p>
          <span className="text-xs font-bold text-primary">{teamQuestProgress}%</span>
        </div>
        <p className="mb-2 text-[11px] text-muted-foreground">{teamQuestLabel}</p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${teamQuestProgress}%` }}
          />
        </div>
      </div>

      {/* Participants */}
      <div className="flex-1">
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Students · {students.length}
        </p>
        <ul className="flex flex-col gap-1.5">
          {students.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 transition-colors hover:border-border hover:bg-muted/40"
            >
              {/* Avatar */}
              <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white', p.color)}>
                {p.initial}
              </div>

              {/* Name + status */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium text-foreground">{p.name}</span>
                  {p.handRaised && (
                    <span title="Hand raised" className="text-sm">✋</span>
                  )}
                  <VoiceWave active={p.speaking} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground">Lv {p.level}</span>
                  <span className="text-[11px] text-muted-foreground">·</span>
                  <span className="text-[11px] text-muted-foreground">{p.accuracy}% acc</span>
                </div>
              </div>

              {/* Ready indicator */}
              <span
                className={cn(
                  'h-2 w-2 rounded-full shrink-0',
                  p.status === 'ready'   ? 'bg-emerald-500' :
                  p.status === 'thinking' ? 'bg-amber-400'   : 'bg-muted-foreground',
                )}
                title={p.status}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Invite */}
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-secondary hover:text-primary"
      >
        <i className="ti ti-user-plus text-base" aria-hidden="true" />
        Invite a friend
      </button>
    </aside>
  )
}
