'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ParticipantsPanel } from '@/components/rooms/participants-panel'
import { WorkspacePanel }    from '@/components/rooms/workspace-panel'
import { ChatPanel }         from '@/components/rooms/chat-panel'
import { SEED_ROOM }         from '@/lib/room-types'
import type { WorkspaceTab } from '@/lib/room-types'

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner:     'bg-emerald-50 text-emerald-700',
  Intermediate: 'bg-amber-50 text-amber-700',
  Advanced:     'bg-red-50 text-red-700',
}

export default function RoomPage() {
  const [room]       = useState(SEED_ROOM)
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('whiteboard')
  const [muted,  setMuted]  = useState(false)
  const [camOff, setCamOff] = useState(true)
  // Mobile panel: 'participants' | 'workspace' | 'chat'
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

        {/* Live count */}
        <div className="hidden items-center gap-1.5 sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-foreground">{room.online} online</span>
        </div>

        {/* Controls */}
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
            onClick={() => setCamOff((c) => !c)}
            title={camOff ? 'Camera on' : 'Camera off'}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-xl text-sm transition-colors',
              camOff ? 'text-muted-foreground hover:bg-secondary hover:text-primary' : 'bg-secondary text-primary',
            )}
          >
            <i className={cn('ti', camOff ? 'ti-video-off' : 'ti-video')} aria-hidden="true" />
          </button>
          <button
            title="Hand raise"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          >
            <i className="ti ti-hand-stop" aria-hidden="true" />
          </button>
          <button
            title="Share code"
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
          { id: 'participants' as const, label: 'People',    icon: 'ti-users' },
          { id: 'workspace'   as const, label: 'Board',     icon: 'ti-chalkboard' },
          { id: 'chat'        as const, label: 'Chat',      icon: 'ti-message-circle-2' },
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
          <ChatPanel messages={room.messages} poll={room.poll} />
        </div>
      </main>
    </div>
  )
}
