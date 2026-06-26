'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props { onClose: () => void }

export function JoinRoomModal({ onClose }: Props) {
  const router = useRouter()
  const [code, setCode] = useState('')

  function join() {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    // Navigate directly using the code as the room slug.
    router.push(`/rooms/${trimmed}`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm animate-fade-in rounded-3xl border border-border bg-card p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
            <i className="ti ti-key text-2xl text-primary" aria-hidden="true" />
          </div>
          <h2 className="font-serif text-xl font-bold text-foreground">Join with code</h2>
          <p className="mt-1 text-sm text-muted-foreground">Enter the room code shared by your friend</p>
        </div>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && join()}
          placeholder="SAGE-0000"
          maxLength={9}
          className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-center font-mono text-lg font-bold tracking-widest text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
        />

        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={join}
            disabled={!code.trim()}
            className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Join room
          </button>
          <button
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
