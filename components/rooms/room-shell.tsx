'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/use-auth'
import { ParticipantsPanel } from '@/components/rooms/participants-panel'
import { WorkspacePanel }    from '@/components/rooms/workspace-panel'
import { ChatPanel }         from '@/components/rooms/chat-panel'
import { VideoStrip }        from '@/components/rooms/video-strip'
import type { WorkspaceTab, StudyRoom, RoomParticipant } from '@/lib/room-types'
import type { StudyRoom as DBRoom, RoomMember } from '@/lib/rooms-db'

// Member avatar colour palette
const AVATAR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
  'bg-rose-500',  'bg-cyan-500',   'bg-pink-500',   'bg-orange-500',
]

function memberToParticipant(m: RoomMember, index: number): RoomParticipant {
  return {
    id:                m.user_id,
    name:              m.user_name,
    initial:           m.user_name.charAt(0).toUpperCase(),
    color:             AVATAR_COLORS[index % AVATAR_COLORS.length],
    level:             1,
    xp:                0,
    status:            'ready',
    speaking:          false,
    handRaised:        false,
    accuracy:          0,
    questionsAnswered: 0,
  }
}

const AI_PARTICIPANT: RoomParticipant = {
  id:                'ai',
  name:              'Sage AI',
  initial:           'S',
  color:             'bg-primary',
  level:             99,
  xp:                0,
  status:            'ready',
  speaking:          false,
  handRaised:        false,
  accuracy:          100,
  questionsAnswered: 0,
}

interface Props {
  id:    string
  // Fallback display values used while the room loads from DB
  name:  string
  exam:  string
  topic: string
}

export function RoomShell({ id, name: nameFallback, exam: examFallback, topic: topicFallback }: Props) {
  const { user } = useAuth()

  // ── DB room state ────────────────────────────────────────────────────────
  const [dbRoom,       setDbRoom]       = useState<DBRoom | null>(null)
  const [members,      setMembers]      = useState<RoomMember[]>([])
  const [loadError,    setLoadError]    = useState('')
  const registered     = useRef(false)

  // Derived display values — prefer DB data, fall back to URL params
  const displayName  = dbRoom?.name  ?? nameFallback
  const displayExam  = dbRoom?.exam  ?? examFallback
  const displayTopic = dbRoom?.topic ?? topicFallback
  const roomCode     = dbRoom?.code  ?? id.toUpperCase().slice(0, 6)

  // ── Load room + register as member ────────────────────────────────────────
  const fetchMembers = useCallback(async (roomId: string) => {
    try {
      const res  = await fetch(`/api/rooms/members?room_id=${roomId}`)
      const data = await res.json()
      if (data.members) setMembers(data.members)
    } catch { /* silently ignore */ }
  }, [])

  useEffect(() => {
    async function init() {
      try {
        // Fetch room metadata
        const res  = await fetch(`/api/rooms/list`)
        const data = await res.json()
        const found: DBRoom | undefined = data.rooms?.find((r: DBRoom) => r.id === id)
        if (found) {
          setDbRoom(found)
        } else {
          setLoadError('Room not found or no longer active.')
          return
        }

        // Register this user as a member (heartbeat upsert)
        if (!registered.current && user) {
          registered.current = true
          await fetch('/api/rooms/members', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              room_id:   id,
              user_id:   user.id,
              user_name: user.name,
            }),
          })
        }

        // Fetch full member list
        await fetchMembers(id)
      } catch {
        setLoadError('Could not connect to room.')
      }
    }
    init()

    // Poll for new members every 5 seconds
    const interval = setInterval(() => fetchMembers(id), 5000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id])

  // ── Build the participant list (AI always first, then real members) ────────
  const participants: RoomParticipant[] = [
    AI_PARTICIPANT,
    ...members.map((m, i) => memberToParticipant(m, i)),
  ]

  // ── Build the legacy StudyRoom shape for sub-components that need it ───────
  const legacyRoom: StudyRoom = {
    id,
    name:              displayName,
    topic:             displayTopic,
    exam:              displayExam as StudyRoom['exam'],
    difficulty:        'Intermediate',
    online:            members.length || 1,
    maxParticipants:   dbRoom?.max_members ?? 10,
    scheduledTime:     'Now',
    emoji:             '📚',
    color:             '#0e8a6a',
    visibility:        'public',
    code:              roomCode,
    hostId:            dbRoom?.host_id ?? '',
    description:       '',
    participants_list: participants,
    messages:          [],
    aiStatus:          'idle',
    activeTab:         'whiteboard',
    poll:              null,
    teamQuestProgress: 0,
    teamQuestLabel:    'Solve 100 questions together',
    sessionStartedAt:  dbRoom?.created_at ?? new Date().toISOString(),
  }

  const [activeTab,     setActiveTab]     = useState<WorkspaceTab>('whiteboard')
  const [muted,         setMuted]         = useState(false)
  const [camOff,        setCamOff]        = useState(true)
  const [videoVisible,  setVideoVisible]  = useState(false)
  const [mobilePanel,   setMobilePanel]   = useState<'participants' | 'workspace' | 'chat'>('workspace')

  if (loadError) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-background">
        <i className="ti ti-alert-circle text-4xl text-destructive" aria-hidden="true" />
        <p className="text-lg font-semibold text-foreground">{loadError}</p>
        <Link href="/rooms" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90">
          Back to rooms
        </Link>
      </div>
    )
  }

  const [codeCopied, setCodeCopied] = useState(false)

  function copyCode() {
    navigator.clipboard.writeText(roomCode).catch(() => {})
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  return (
    <div className="flex h-dvh flex-col bg-background font-sans overflow-hidden">

      {/* ── Room top bar ────────────────────────────────────────────── */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
        <Link
          href="/rooms"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Back to rooms"
        >
          <i className="ti ti-chevron-left text-lg" aria-hidden="true" />
        </Link>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate text-sm font-bold text-foreground">{displayName}</span>
          <span className="hidden rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground sm:inline-flex">
            {displayExam}
          </span>
        </div>

        <div className="hidden items-center gap-1.5 sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-foreground">{members.length || 1} online</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            title={muted ? 'Unmute' : 'Mute'}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-xl text-sm transition-colors',
              muted
                ? 'bg-destructive/10 text-destructive'
                : 'text-muted-foreground hover:bg-secondary hover:text-primary',
            )}
          >
            <i className={cn('ti', muted ? 'ti-microphone-off' : 'ti-microphone')} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => { const next = !camOff; setCamOff(!next); setVideoVisible(next) }}
            title={camOff ? 'Turn camera on' : 'Turn camera off'}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-xl text-sm transition-colors',
              camOff
                ? 'text-muted-foreground hover:bg-secondary hover:text-primary'
                : 'bg-secondary text-primary',
            )}
          >
            <i className={cn('ti', camOff ? 'ti-video-off' : 'ti-video')} aria-hidden="true" />
          </button>
          <button
            type="button"
            title="Raise hand"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          >
            <i className="ti ti-hand-stop" aria-hidden="true" />
          </button>
          {/* Copy code button — always shows the real DB code */}
          <button
            type="button"
            title={codeCopied ? 'Copied!' : 'Copy room code'}
            onClick={copyCode}
            className="hidden h-8 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-mono font-bold text-primary transition-colors hover:bg-secondary sm:flex"
          >
            <i className={cn('ti text-xs', codeCopied ? 'ti-check' : 'ti-copy')} aria-hidden="true" />
            {roomCode}
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
              mobilePanel === p.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground',
            )}
          >
            <i className={cn('ti', p.icon, 'text-base')} aria-hidden="true" />
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Video strip ─────────────────────────────────────────────── */}
      <VideoStrip
        participants={participants}
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
            participants={participants}
            aiStatus={legacyRoom.aiStatus}
            teamQuestLabel={legacyRoom.teamQuestLabel}
            teamQuestProgress={legacyRoom.teamQuestProgress}
            sessionStartedAt={legacyRoom.sessionStartedAt}
            roomCode={roomCode}
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
            aiStatus={legacyRoom.aiStatus}
            roomName={displayName}
            exam={displayExam}
            topic={displayTopic}
          />
        </div>

        {/* RIGHT: Chat */}
        <div className={cn(
          'w-full shrink-0 overflow-hidden lg:block lg:w-72',
          mobilePanel === 'chat' ? 'block' : 'hidden',
        )}>
          <ChatPanel
            poll={legacyRoom.poll}
            roomCode={roomCode}
            roomName={displayName}
            exam={displayExam}
            topic={displayTopic}
          />
        </div>
      </main>
    </div>
  )
}
