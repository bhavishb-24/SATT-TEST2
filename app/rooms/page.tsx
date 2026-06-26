'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { CreateRoomModal } from '@/components/rooms/create-room-modal'
import { JoinRoomModal }   from '@/components/rooms/join-room-modal'
import { useAuth }         from '@/lib/use-auth'
import type { StudyRoom }  from '@/lib/rooms-db'

function timeAgo(iso: string) {
  const secs = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60)  return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60)  return `${mins}m ago`
  const hrs  = Math.floor(mins / 60)
  if (hrs  < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function ExamBadge({ exam }: { exam: string }) {
  const colors: Record<string, string> = {
    SAT:  'bg-blue-100 text-blue-700',
    ACT:  'bg-amber-100 text-amber-700',
    PSAT: 'bg-violet-100 text-violet-700',
  }
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', colors[exam] ?? 'bg-muted text-muted-foreground')}>
      {exam}
    </span>
  )
}

function RoomsPageInner() {
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const { user }      = useAuth()
  const [rooms,       setRooms]       = useState<StudyRoom[]>([])
  const [loading,     setLoading]     = useState(true)
  const [showCreate,  setShowCreate]  = useState(false)
  const [showJoin,    setShowJoin]    = useState(false)
  const [joinCode,    setJoinCode]    = useState('')

  const fetchRooms = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/rooms/list', { cache: 'no-store' })
      const data = await res.json()
      if (data.rooms) setRooms(data.rooms)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchRooms() }, [fetchRooms])

  // Auto-refresh the live list every 8s so new rooms appear without manual reload
  useEffect(() => {
    const t = setInterval(fetchRooms, 8000)
    return () => clearInterval(t)
  }, [fetchRooms])

  // Invite-link support: /rooms?join=ABC123 opens the join modal prefilled
  useEffect(() => {
    const code = searchParams.get('join')
    if (code) {
      setJoinCode(code.toUpperCase())
      setShowJoin(true)
    }
  }, [searchParams])

  function handleRoomCreated(room: StudyRoom) {
    setShowCreate(false)
    router.push(`/rooms/${room.id}`)
  }

  function handleRoomJoined(room: StudyRoom) {
    setShowJoin(false)
    router.push(`/rooms/${room.id}`)
  }

  return (
    <div className="min-h-dvh bg-background font-sans">

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="SAT Sage" width={28} height={28} className="h-7 w-7 rounded-lg object-contain" />
            <span className="text-sm font-bold text-foreground">SAT Sage</span>
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            <Link href="/app" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
            <Link href="/rooms" className="text-sm font-medium text-primary">Study Rooms</Link>
            <Link href="/whiteboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Whiteboard AI</Link>
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowJoin(true)}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-secondary"
            >
              Join with code
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              Create room
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:px-6 sm:pt-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-30"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, #0e8a6a33 0%, transparent 70%)' }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-balance text-5xl font-bold leading-tight text-foreground sm:text-6xl">
            Study better.<br />
            <span className="text-primary">Together.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
            Create a live study room, invite friends with a 6-letter code, and study in real time with an AI tutor.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90"
            >
              <i className="ti ti-plus text-lg" aria-hidden="true" />
              Create study room
            </button>
            <button
              type="button"
              onClick={() => setShowJoin(true)}
              className="flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3.5 text-base font-medium text-foreground shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              <i className="ti ti-key text-lg text-primary" aria-hidden="true" />
              Join with code
            </button>
          </div>
        </div>
      </section>

      {/* Live rooms list */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Live now</p>
              <h2 className="mt-1 text-2xl font-bold text-foreground">Active rooms</h2>
            </div>
            <button
              type="button"
              onClick={fetchRooms}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <i className="ti ti-refresh text-sm" aria-hidden="true" />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[72px] animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card/50 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary">
                <i className="ti ti-users-group text-3xl text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">No active rooms yet</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Be the first to create one. Invite friends with a 6-letter code.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                <i className="ti ti-plus text-base" aria-hidden="true" />
                Create the first room
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {rooms.map((room) => (
                <li key={room.id}>
                  <button
                    type="button"
                    onClick={() => router.push(`/rooms/${room.id}`)}
                    className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                      <i className="ti ti-users text-lg" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-foreground">{room.name}</p>
                        <ExamBadge exam={room.exam} />
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {room.topic} &middot; {room.host_name} &middot; {timeAgo(room.created_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <i className="ti ti-user text-sm" aria-hidden="true" />
                        <span>{room.member_count ?? 1}/{room.max_members}</span>
                      </div>
                      <span className="rounded-lg bg-secondary px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
                        {room.code}
                      </span>
                    </div>
                    <i className="ti ti-arrow-right ml-1 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Modals */}
      {showCreate && (
        <CreateRoomModal
          user={user}
          onClose={() => setShowCreate(false)}
          onCreated={handleRoomCreated}
        />
      )}
      {showJoin && (
        <JoinRoomModal
          user={user}
          initialCode={joinCode}
          onClose={() => { setShowJoin(false); setJoinCode('') }}
          onJoined={handleRoomJoined}
        />
      )}
    </div>
  )
}

// useSearchParams must be inside a Suspense boundary.
export default function RoomsPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <RoomsPageInner />
    </Suspense>
  )
}
