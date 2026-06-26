'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/use-auth'
import { getRoomIdentity } from '@/lib/room-identity'
import type { StudyRoom } from '@/lib/rooms-db'

const EXAMS  = ['SAT', 'ACT', 'PSAT', 'AP'] as const
const TOPICS = [
  'General Review',
  'Math – Algebra',
  'Math – Advanced Math',
  'Math – Geometry & Trig',
  'Math – Problem Solving',
  'Reading & Writing – Craft',
  'Reading & Writing – Information',
  'Reading & Writing – Grammar',
  'Vocabulary',
  'Timed Practice',
]

interface Props {
  user?:     { id: string; name: string } | null
  onClose:   () => void
  onCreated: (room: StudyRoom) => void
}

export function CreateRoomModal({ user, onClose, onCreated }: Props) {
  const { user: authUser } = useAuth()
  const resolvedUser = user ?? authUser

  const [name,       setName]       = useState('')
  const [exam,       setExam]       = useState<typeof EXAMS[number]>('SAT')
  const [topic,      setTopic]      = useState('General Review')
  const [max,        setMax]        = useState(8)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')

  async function create() {
    if (!name.trim()) { setError('Please enter a room name.'); return }
    setError('')
    setLoading(true)
    try {
      const me   = getRoomIdentity(resolvedUser)
      const res  = await fetch('/api/rooms/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:        name.trim(),
          exam,
          topic,
          host_id:     me.id,
          host_name:   me.name,
          max_members: max,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to create room.'); return }
      onCreated(data.room as StudyRoom)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg animate-fade-in overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-foreground">Create a study room</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">A 6-letter invite code is generated automatically</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <i className="ti ti-x text-lg" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Room Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cr-name" className="text-sm font-semibold text-foreground">Room name</label>
            <input
              id="cr-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && create()}
              placeholder="e.g. Saturday SAT Math Grind"
              maxLength={60}
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* Exam */}
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-semibold text-foreground">Exam</p>
            <div className="flex flex-wrap gap-2">
              {EXAMS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setExam(e)}
                  className={cn(
                    'rounded-xl border px-4 py-1.5 text-sm font-medium transition-all',
                    exam === e
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/20 hover:text-foreground',
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cr-topic" className="text-sm font-semibold text-foreground">Topic</label>
            <select
              id="cr-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Max members */}
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-semibold text-foreground">
              Max students — <span className="text-primary">{max}</span>
            </p>
            <input
              type="range"
              min={2}
              max={20}
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
              className="accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>2</span><span>20</span>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={create}
            disabled={loading || !name.trim()}
            className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Creating…
              </>
            ) : (
              <>
                <i className="ti ti-plus text-base" aria-hidden="true" />
                Create room
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
