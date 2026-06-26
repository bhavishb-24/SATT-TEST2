'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ParticipantsPanel } from '@/components/rooms/participants-panel'
import { WorkspacePanel }    from '@/components/rooms/workspace-panel'
import { ChatPanel }         from '@/components/rooms/chat-panel'
import { VideoStrip }        from '@/components/rooms/video-strip'
import type { WorkspaceTab, StudyRoom } from '@/lib/room-types'
// ChatPanel now owns its own AI message state via useChat — no messages prop needed.

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner:     'bg-emerald-50 text-emerald-700',
  Intermediate: 'bg-amber-50 text-amber-700',
  Advanced:     'bg-red-50 text-red-700',
}

/**
 * In production this room state would come from a real-time backend
 * (e.g. Neon + Supabase Realtime / Ably / Pusher). For now the room
 * initialises with only the AI tutor present and no messages, which is
 * the honest state before any real participants join.
 */
function buildEmptyRoom(id: string, sp: Record<string, string> = {}): StudyRoom {
  return {
    id,
    name: sp.name || 'Study Room',
    topic: sp.topic || '',
    exam: (sp.exam as StudyRoom['exam']) || 'SAT',
    difficulty: 'Intermediate',
    online: 1,
    maxParticipants: 10,
    scheduledTime: 'Now',
    emoji: '📚',
    color: '#0e8a6a',
    visibility: 'public',
    // Extract the last segment of the slug as the shareable code (e.g. "ABC123")
    code: id.split('-').pop()?.toUpperCase().slice(0, 6) ?? id.toUpperCase().slice(0, 6),
    hostId: 'me',
    description: '',
    participants_list: [
      {
        id: 'ai',
        name: 'Sage AI',
        initial: 'S',
        color: 'bg-primary',
        level: 99,
        xp: 0,
        status: 'ready',
        speaking: false,
        handRaised: false,
        accuracy: 100,
        questionsAnswered: 0,
      },
    ],
    messages: [],
    aiStatus: 'idle',
    activeTab: 'whiteboard',
    poll: null,
    teamQuestProgress: 0,
    teamQuestLabel: 'Solve 100 questions together',
    sessionStartedAt: new Date().toISOString(),
  }
}

export default function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const { id }   = use(params)
  const sp       = use(searchParams)
  const [room]   = useState<StudyRoom>(() => buildEmptyRoom(id, sp))
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('whiteboard')
  const [muted,        setMuted]        = useState(false)
  const [camOff,       setCamOff]       = useState(true)
  const [videoVisible, setVideoVisible] = useState(false)
  const [mobilePanel, setMobilePanel] = useState<'participants' | 'workspace' | 'chat'>('workspace')

  return (
    <div className="flex h-dvh flex-col bg-background font-sans overflow-hidden">

      {/* ── Room top bar ──────────────────────────────────────────────── */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
        <Link href="/rooms" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <i className="ti ti-chevron-left text-lg" aria-hidden="true" />
        </Link>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-lg" aria-hidden="true">{room.emoji}</span>
          <span className="truncate text-sm font-bold text-foreground">{room.name}</span>
          <span className={cn('hidden rounded-full px-2 py-0.5 text-[11px] font-semibold sm:inline-flex', DIFFICULTY_COLOR[room.difficulty])}>
            {room.difficulty}
          </span>
        </div>

        <div className="hidden items-center gap-1.5 sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-foreground">{room.online} online</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setMuted((m) => !m)}
            title={muted ? 'Unmute' : 'Mute'}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-xl text-sm transition-colors',
              muted ? 'bg-destructive/10 text-destructive' : 'text-muted-foreground hover:bg-secondary hover:text-primary',
            )}
          >
            <i className={cn('ti', muted ? 'ti-microphone-off' : 'ti-microphone')} aria-hidden="true" />
          </button>
          <button
            onClick={() => {
              const next = !camOff
              setCamOff(!next)
              setVideoVisible(next)
            }}
            title={camOff ? 'Turn camera on' : 'Turn camera off'}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-xl text-sm transition-colors',
              camOff ? 'text-muted-foreground hover:bg-secondary hover:text-primary' : 'bg-secondary text-primary',
            )}
          >
            <i className={cn('ti', camOff ? 'ti-video-off' : 'ti-video')} aria-hidden="true" />
          </button>
          <button
            title="Raise hand"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          >
            <i className="ti ti-hand-stop" aria-hidden="true" />
          </button>
          <button
            title="Copy room code"
            onClick={() => navigator.clipboard.writeText(room.code).catch(() => {})}
            className="hidden h-8 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-mono font-bold text-primary transition-colors hover:bg-secondary sm:flex"
          >
            <i className="ti ti-copy text-xs" aria-hidden="true" />
            {room.code}
          </button>
          <Link
            href="/rooms"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-destructive/10 text-sm text-destructive transition-colors hover:bg-destructive hover:text-white"
            title="Leave room"
          >
            <i className="ti ti-door-exit" aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* ── Mobile tab switcher ─────────────────────────────────────── */}
      <div className="flex shrink-0 border-b border-border bg-card lg:hidden">
        {([
          { id: 'participants' as const, label: 'People',  icon: 'ti-users' },
          { id: 'workspace'   as const, label: 'Board',   icon: 'ti-chalkboard' },
          { id: 'chat'        as const, label: 'Chat',    icon: 'ti-message-circle-2' },
        ] as const).map((p) => (
          <button
            key={p.id}
            onClick={() => setMobilePanel(p.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors',
              mobilePanel === p.id ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground',
            )}
          >
            <i className={cn('ti', p.icon, 'text-base')} aria-hidden="true" />
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Video strip — shown when camera is on ──────────────────── */}
      <VideoStrip
        participants={room.participants_list}
        muted={muted}
        camOff={camOff}
        visible={videoVisible}
        onToggle={() => setVideoVisible((v) => !v)}
      />

      {/* ── Three-column layout ─────────────────────────────────────── */}
      <main className="flex flex-1 min-h-0 overflow-hidden">

        {/* LEFT: Participants */}
        <div className={cn(
          'w-full shrink-0 overflow-hidden border-r border-border lg:block lg:w-64',
          mobilePanel === 'participants' ? 'block' : 'hidden',
        )}>
          <ParticipantsPanel
            participants={room.participants_list}
            aiStatus={room.aiStatus}
            teamQuestLabel={room.teamQuestLabel}
            teamQuestProgress={room.teamQuestProgress}
            sessionStartedAt={room.sessionStartedAt}
            roomCode={room.code}
          />
        </div>

        {/* CENTER: Workspace */}
        <div className={cn(
          'flex-1 overflow-hidden lg:block',
          mobilePanel === 'workspace' ? 'block' : 'hidden',
        )}>
          <WorkspacePanel
            activeTab={activeTab}
            onTabChange={setActiveTab}
            aiStatus={room.aiStatus}
            roomName={room.name}
          />
        </div>

        {/* RIGHT: Chat */}
        <div className={cn(
          'w-full shrink-0 overflow-hidden lg:block lg:w-72',
          mobilePanel === 'chat' ? 'block' : 'hidden',
        )}>
          <ChatPanel
            poll={room.poll}
            roomCode={room.code}
            roomName={room.name}
            exam={room.exam}
            topic={room.topic}
          />
        </div>
      </main>
    </div>
  )
}
