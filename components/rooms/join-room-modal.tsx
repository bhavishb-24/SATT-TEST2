'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/use-auth'
import { getRoomIdentity } from '@/lib/room-identity'
import type { StudyRoom } from '@/lib/rooms-db'

interface Props {
  user?:        { id: string; name: string } | null
  initialCode?: string
  onClose:      () => void
  onJoined:     (room: StudyRoom) => void
}

export function JoinRoomModal({ user, initialCode = '', onClose, onJoined }: Props) {
  const { user: authUser } = useAuth()
  const resolvedUser = user ?? authUser

  const [code,    setCode]    = useState(initialCode.toUpperCase())
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function join() {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    setError('')
    setLoading(true)
    try {
      const me   = getRoomIdentity(resolvedUser)
      const res  = await fetch('/api/rooms/join', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code:      trimmed,
          user_id:   me.id,
          user_name: me.name,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not join room.')
        return
      }
      // Navigate to the REAL room ID returned from the server — not the code
      onJoined(data.room as StudyRoom)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-sm animate-fade-in rounded-3xl border border-border bg-card p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
            <i className="ti ti-key text-2xl text-primary" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Join with code</h2>
          <p className="mt-1 text-sm text-muted-foreground">Enter the 6-letter code your friend shared</p>
        </div>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && join()}
          placeholder="ABCD12"
          maxLength={6}
          autoFocus
          aria-label="Room invite code"
          className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-center font-mono text-2xl font-bold tracking-widest text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
        />

        {error && (
          <p role="alert" className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-center text-xs font-medium text-destructive">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={join}
            disabled={code.trim().length < 4 || loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Joining…
              </>
            ) : (
              'Join room'
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-border py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
