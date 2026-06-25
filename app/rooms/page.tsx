'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { CreateRoomModal } from '@/components/rooms/create-room-modal'
import { JoinRoomModal } from '@/components/rooms/join-room-modal'
import { FEATURED_ROOMS } from '@/lib/room-types'

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner:     'bg-emerald-50 text-emerald-700',
  Intermediate: 'bg-amber-50 text-amber-700',
  Advanced:     'bg-red-50 text-red-700',
}

function OnlineDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  )
}

export default function RoomsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen,   setJoinOpen]   = useState(false)

  return (
    <div className="min-h-dvh bg-background font-sans">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
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
              onClick={() => setJoinOpen(true)}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-secondary"
            >
              Join with code
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              Create room
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
        {/* soft background blob */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-30"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -10%, #0e8a6a33 0%, transparent 70%)',
          }}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          {/* eyebrow */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary px-3.5 py-1.5 text-xs font-semibold text-primary">
            <OnlineDot />
            247 students studying right now
          </div>

          <h1 className="font-serif text-5xl font-bold leading-tight text-foreground text-balance sm:text-6xl lg:text-7xl">
            Study better.<br />
            <span className="text-primary">Together.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Join a live study room with friends, compete in practice battles, and let your AI tutor teach, draw, and keep everyone engaged — in real time.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90 hover:shadow-xl hover:shadow-primary/25"
            >
              <i className="ti ti-plus text-lg" aria-hidden="true" />
              Create study room
            </button>
            <button
              onClick={() => setJoinOpen(true)}
              className="flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3.5 text-base font-medium text-foreground shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              <i className="ti ti-key text-lg text-primary" aria-hidden="true" />
              Join with code
            </button>
          </div>

          {/* social proof strip */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {[
              { icon: 'ti-users', text: '12,000+ students' },
              { icon: 'ti-brain', text: 'AI tutor in every room' },
              { icon: 'ti-lock-open', text: 'Free to join' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-1.5">
                <i className={cn('ti', item.icon, 'text-base text-primary')} aria-hidden="true" />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured rooms ──────────────────────────────────────────────── */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Live now</p>
              <h2 className="mt-1 font-serif text-3xl font-bold text-foreground">Featured public rooms</h2>
            </div>
            <div className="flex items-center gap-2">
              {(['All', 'Math', 'Reading', 'Writing', 'Vocabulary'] as const).map((tag) => (
                <button
                  key={tag}
                  className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/30 hover:bg-secondary hover:text-primary first:border-primary/30 first:bg-secondary first:text-primary"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {FEATURED_ROOMS.map((room) => (
              <Link
                key={room.id}
                href={`/rooms/${room.id}`}
                className="group relative flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
              >
                {/* top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-2xl"
                    style={{ background: room.color + '22' }}>
                    {room.emoji}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <OnlineDot />
                    <span className="text-xs font-semibold text-foreground">{room.online} online</span>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-serif text-lg font-bold text-foreground">{room.name}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{room.topic}</p>
                </div>

                {/* meta row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', DIFFICULTY_COLOR[room.difficulty])}>
                    {room.difficulty}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <i className="ti ti-chart-bar text-xs" aria-hidden="true" />
                    Avg {room.avgScore}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <i className="ti ti-clock text-xs" aria-hidden="true" />
                    {room.scheduledTime}
                  </span>
                  <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                    <i className="ti ti-users text-xs" aria-hidden="true" />
                    {room.participants}/{room.maxParticipants}
                  </span>
                </div>

                {/* join arrow */}
                <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-secondary opacity-0 transition-opacity group-hover:opacity-100">
                  <i className="ti ti-arrow-right text-sm text-primary" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature strip ───────────────────────────────────────────────── */}
      <section className="border-t border-border bg-card px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">How it works</p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">
              This is how studying should have always worked.
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: 'ti-chalkboard',
                title: 'Shared whiteboard',
                desc: 'Everyone draws, writes, and solves together — like Figma, but for math and reading.',
              },
              {
                icon: 'ti-robot',
                title: 'AI joins your room',
                desc: 'Your AI tutor explains, draws diagrams, generates quizzes, and detects who is struggling.',
              },
              {
                icon: 'ti-sword',
                title: 'Battle mode',
                desc: 'Math duels, vocabulary blitz, reading races. Compete with friends on a live leaderboard.',
              },
              {
                icon: 'ti-clipboard-text',
                title: 'Instant summaries',
                desc: 'Every session auto-generates notes, flashcards, and a personalised mistake summary.',
              },
            ].map((f) => (
              <div key={f.title} className="rounded-3xl border border-border bg-background p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
                  <i className={cn('ti', f.icon, 'text-xl text-primary')} aria-hidden="true" />
                </div>
                <h3 className="font-serif text-lg font-bold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl rounded-3xl border border-primary/20 bg-secondary p-10 text-center shadow-sm">
          <p className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Your study squad is waiting.
          </p>
          <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground text-pretty">
            Create a room, invite your friends, and let the AI guide your session from first question to final review.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setCreateOpen(true)}
              className="rounded-2xl bg-primary px-7 py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90"
            >
              Create a free room
            </button>
            <button
              onClick={() => setJoinOpen(true)}
              className="rounded-2xl border border-border bg-card px-7 py-3.5 text-base font-medium text-foreground shadow-sm transition-all hover:shadow-md"
            >
              Join with code
            </button>
          </div>
        </div>
      </section>

      {createOpen && <CreateRoomModal onClose={() => setCreateOpen(false)} />}
      {joinOpen   && <JoinRoomModal   onClose={() => setJoinOpen(false)} />}
    </div>
  )
}
