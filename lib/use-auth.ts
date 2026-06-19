'use client'

import { useCallback, useEffect, useState } from 'react'
import type { DiagnosticRecord, GuestUser } from './sat-types'

const USER_KEY = 'ser:guest-user'
const DIAGNOSTIC_KEY = 'ser:diagnostic'

const ADJECTIVES = [
  'Brave',
  'Calm',
  'Bright',
  'Sharp',
  'Steady',
  'Bold',
  'Quick',
  'Focused',
]
const NOUNS = ['Scholar', 'Owl', 'Comet', 'Falcon', 'Pioneer', 'Voyager', 'Spark', 'Ace']

function randomName(): string {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const num = Math.floor(Math.random() * 90 + 10)
  return `${a} ${n} ${num}`
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `guest_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

export interface AuthApi {
  user: GuestUser | null
  ready: boolean
  signInAsGuest: (name?: string) => GuestUser
  signOut: () => void
  /** The AI's "memory" of the diagnostic for this guest. */
  diagnostic: DiagnosticRecord | null
  saveDiagnostic: (record: DiagnosticRecord) => void
  clearDiagnostic: () => void
}

/**
 * Lightweight, anonymous guest authentication. A guest identity is generated
 * client-side and persisted in localStorage (no backend / no database). The
 * AI's diagnostic "memory" is stored alongside the guest so it survives reloads.
 */
export function useAuth(): AuthApi {
  const [user, setUser] = useState<GuestUser | null>(null)
  const [diagnostic, setDiagnostic] = useState<DiagnosticRecord | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      if (raw) setUser(JSON.parse(raw) as GuestUser)
      const diag = localStorage.getItem(DIAGNOSTIC_KEY)
      if (diag) setDiagnostic(JSON.parse(diag) as DiagnosticRecord)
    } catch {
      // ignore corrupt storage
    } finally {
      setReady(true)
    }
  }, [])

  const signInAsGuest = useCallback((name?: string): GuestUser => {
    const guest: GuestUser = {
      id: randomId(),
      name: name?.trim() || randomName(),
      createdAt: Date.now(),
    }
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(guest))
    } catch {
      // ignore
    }
    setUser(guest)
    return guest
  }, [])

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(DIAGNOSTIC_KEY)
    } catch {
      // ignore
    }
    setUser(null)
    setDiagnostic(null)
  }, [])

  const saveDiagnostic = useCallback((record: DiagnosticRecord) => {
    try {
      localStorage.setItem(DIAGNOSTIC_KEY, JSON.stringify(record))
    } catch {
      // ignore
    }
    setDiagnostic(record)
  }, [])

  const clearDiagnostic = useCallback(() => {
    try {
      localStorage.removeItem(DIAGNOSTIC_KEY)
    } catch {
      // ignore
    }
    setDiagnostic(null)
  }, [])

  return {
    user,
    ready,
    signInAsGuest,
    signOut,
    diagnostic,
    saveDiagnostic,
    clearDiagnostic,
  }
}
