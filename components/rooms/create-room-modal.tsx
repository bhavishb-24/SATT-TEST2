'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { RoomExam, RoomVisibility } from '@/lib/room-types'

const EXAMS: RoomExam[] = ['SAT', 'ACT', 'AP', 'GRE', 'MCAT', 'IIT JEE']

interface Props { onClose: () => void }

export function CreateRoomModal({ onClose }: Props) {
  const router = useRouter()
  const [name, setName]       = useState('')
  const [exam, setExam]       = useState<RoomExam>('SAT')
  const [vis,  setVis]        = useState<RoomVisibility>('public')
  const [max,  setMax]        = useState(10)
  const [goal, setGoal]       = useState('')
  const [target, setTarget]   = useState('')
  const [len, setLen]         = useState(60)

  function create() {
    // In a real app: POST /api/rooms. For now, navigate to the seed room.
    router.push('/rooms/sat-math-review')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg animate-fade-in overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="font-serif text-xl font-bold text-foreground">Create a study room</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Set up your session and invite friends</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <i className="ti ti-x text-lg" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Room Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Room name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Saturday SAT Math Grind"
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* Exam */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Exam</label>
            <div className="flex flex-wrap gap-2">
              {EXAMS.map((e) => (
                <button
                  key={e}
                  onClick={() => setExam(e)}
                  className={cn(
                    'rounded-xl border px-4 py-1.5 text-sm font-medium transition-all',
                    exam === e
                      ? 'border-primary/40 bg-secondary text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/20 hover:text-foreground',
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Visibility</label>
            <div className="grid grid-cols-2 gap-2">
              {(['public', 'private'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVis(v)}
                  className={cn(
                    'flex items-center gap-2 rounded-2xl border p-3 text-sm font-medium transition-all',
                    vis === v
                      ? 'border-primary/40 bg-secondary text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/20',
                  )}
                >
                  <i className={cn('ti', v === 'public' ? 'ti-world' : 'ti-lock', 'text-base')} aria-hidden="true" />
                  <span className="capitalize">{v}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Max + Session Length */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Max students</label>
              <input
                type="number"
                value={max}
                min={2}
                max={30}
                onChange={(e) => setMax(Number(e.target.value))}
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Session length (min)</label>
              <input
                type="number"
                value={len}
                min={15}
                max={180}
                step={15}
                onChange={(e) => setLen(Number(e.target.value))}
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          {/* Study goal */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Study goal <span className="font-normal text-muted-foreground">(optional)</span></label>
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Master quadratic equations"
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* Target score */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">Target score <span className="font-normal text-muted-foreground">(optional)</span></label>
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. 1450"
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <button
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <i className="ti ti-link text-base" aria-hidden="true" />
            Generate invite link
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-2xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Cancel
            </button>
            <button
              onClick={create}
              className="rounded-2xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              disabled={!name.trim()}
            >
              Create room
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
