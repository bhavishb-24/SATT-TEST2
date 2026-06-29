'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { DiagnosticRecord, GuestUser, PlanResponse, PlanTopic, TriageData } from './sat-types'

export interface SavedSession {
  triage: TriageData
  response: PlanResponse
  topics: PlanTopic[]
  completed: string[]
}

// ─── Local-storage fallback keys (guest / offline) ───────────────────────────
const LS_GUEST       = 'ser:guest-user'
const LS_DIAG        = 'ser:diagnostic'
const LS_POST_DIAG   = 'ser:post-diagnostic'
const LS_SESSION     = 'ser:active-session'

function supabaseUserToGuest(u: User): GuestUser {
  return {
    id:        u.id,
    name:      u.user_metadata?.display_name ?? u.email?.split('@')[0] ?? 'Student',
    createdAt: new Date(u.created_at).getTime(),
  }
}

function randomName(): string {
  const adj  = ['Brave','Calm','Bright','Sharp','Steady','Bold','Quick','Focused']
  const noun = ['Scholar','Owl','Comet','Falcon','Pioneer','Voyager','Spark','Ace']
  const num  = Math.floor(Math.random() * 90 + 10)
  return `${adj[Math.floor(Math.random() * adj.length)]} ${noun[Math.floor(Math.random() * noun.length)]} ${num}`
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `guest_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

// ─── AuthApi interface — identical surface to before ─────────────────────────
export interface AuthApi {
  user:                GuestUser | null
  ready:               boolean
  /** True when the user has a real Supabase session (not a local guest). */
  isAuthenticated:     boolean
  /** True when the signed-in user has lifetime / paid premium access. */
  isPremium:           boolean
  signInAsGuest:       (name?: string) => GuestUser
  signOut:             () => void
  diagnostic:          DiagnosticRecord | null
  saveDiagnostic:      (record: DiagnosticRecord) => void
  clearDiagnostic:     () => void
  postDiagnostic:      DiagnosticRecord | null
  savePostDiagnostic:  (record: DiagnosticRecord) => void
  clearPostDiagnostic: () => void
  /** Load the persisted study session (triage + plan + topics + completed). */
  loadSession: () => Promise<SavedSession | null>
  /** Persist the study session. Called whenever dashboard state changes. */
  saveSession: (session: SavedSession) => Promise<void>
  /** Clear the persisted session (e.g. user starts fresh). */
  clearSession: () => Promise<void>
}

export function useAuth(): AuthApi {
  const [user,           setUser]           = useState<GuestUser | null>(null)
  const [supaUser,       setSupaUser]       = useState<User | null>(null)
  const [diagnostic,     setDiagnostic]     = useState<DiagnosticRecord | null>(null)
  const [postDiagnostic, setPostDiagnostic] = useState<DiagnosticRecord | null>(null)
  const [ready,          setReady]          = useState(false)
  const [isPremium,      setIsPremium]      = useState(false)

  // Check lifetime / premium entitlement by email
  async function refreshPremium(email?: string | null) {
    if (!email) { setIsPremium(false); return }
    try {
      const res  = await fetch(`/api/premium?email=${encodeURIComponent(email)}`, { cache: 'no-store' })
      const data = await res.json()
      setIsPremium(!!data.premium)
    } catch { setIsPremium(false) }
  }

  // ── Bootstrap: check Supabase session, then fall back to guest localStorage ─
  useEffect(() => {
    const supabase = createClient()

    async function boot() {
      const { data: { user: sbUser } } = await supabase.auth.getUser()

      if (sbUser) {
        // Real authenticated user — prefer Supabase diagnostics
        setSupaUser(sbUser)
        setUser(supabaseUserToGuest(sbUser))
        await loadDiagnosticsFromDB(sbUser.id, supabase)
        refreshPremium(sbUser.email)
      } else {
        // No session — load guest from localStorage
        try {
          const raw  = localStorage.getItem(LS_GUEST)
          const diag = localStorage.getItem(LS_DIAG)
          const post = localStorage.getItem(LS_POST_DIAG)
          if (raw)  setUser(JSON.parse(raw) as GuestUser)
          if (diag) setDiagnostic(JSON.parse(diag) as DiagnosticRecord)
          if (post) setPostDiagnostic(JSON.parse(post) as DiagnosticRecord)
        } catch { /* ignore corrupt storage */ }
      }
      setReady(true)
    }

    boot()

    // Listen for auth state changes (login / logout in another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setSupaUser(session.user)
        setUser(supabaseUserToGuest(session.user))
        await loadDiagnosticsFromDB(session.user.id, supabase)
        refreshPremium(session.user.email)
      } else {
        setSupaUser(null)
        setIsPremium(false)
        // Reload guest state from localStorage
        try {
          const raw  = localStorage.getItem(LS_GUEST)
          const diag = localStorage.getItem(LS_DIAG)
          const post = localStorage.getItem(LS_POST_DIAG)
          setUser(raw  ? JSON.parse(raw)  as GuestUser       : null)
          setDiagnostic(diag ? JSON.parse(diag) as DiagnosticRecord : null)
          setPostDiagnostic(post ? JSON.parse(post) as DiagnosticRecord : null)
        } catch { /* ignore */ }
      }
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Load diagnostics from Supabase ─────────────────────────────────────────
  async function loadDiagnosticsFromDB(
    userId: string,
    supabase: ReturnType<typeof createClient>,
  ) {
    const { data } = await supabase
      .from('diagnostics')
      .select('kind, record')
      .eq('user_id', userId)
      .order('taken_at', { ascending: false })

    if (!data) return
    for (const row of data) {
      if (row.kind === 'pre'  && !diagnostic)     setDiagnostic(row.record as DiagnosticRecord)
      if (row.kind === 'post' && !postDiagnostic) setPostDiagnostic(row.record as DiagnosticRecord)
    }
  }

  // ── signInAsGuest — kept so the triage flow still works without an account ─
  const signInAsGuest = useCallback((name?: string): GuestUser => {
    const guest: GuestUser = {
      id:        randomId(),
      name:      name?.trim() || randomName(),
      createdAt: Date.now(),
    }
    try { localStorage.setItem(LS_GUEST, JSON.stringify(guest)) } catch { /* ignore */ }
    setUser(guest)
    return guest
  }, [])

  // ── signOut — clears both Supabase session and local guest state ─────────
  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    try {
      localStorage.removeItem(LS_GUEST)
      localStorage.removeItem(LS_DIAG)
      localStorage.removeItem(LS_POST_DIAG)
    } catch { /* ignore */ }
    setUser(null)
    setSupaUser(null)
    setDiagnostic(null)
    setPostDiagnostic(null)
  }, [])

  // ── saveDiagnostic — persists to Supabase if authenticated, else localStorage
  const saveDiagnostic = useCallback(async (record: DiagnosticRecord) => {
    setDiagnostic(record)
    if (supaUser) {
      const supabase = createClient()
      await supabase.from('diagnostics').upsert(
        { user_id: supaUser.id, kind: 'pre', record },
        { onConflict: 'user_id,kind' },
      )
    } else {
      try { localStorage.setItem(LS_DIAG, JSON.stringify(record)) } catch { /* ignore */ }
    }
  }, [supaUser])

  const clearDiagnostic = useCallback(async () => {
    setDiagnostic(null)
    if (supaUser) {
      const supabase = createClient()
      await supabase.from('diagnostics').delete().match({ user_id: supaUser.id, kind: 'pre' })
    } else {
      try { localStorage.removeItem(LS_DIAG) } catch { /* ignore */ }
    }
  }, [supaUser])

  const savePostDiagnostic = useCallback(async (record: DiagnosticRecord) => {
    setPostDiagnostic(record)
    if (supaUser) {
      const supabase = createClient()
      await supabase.from('diagnostics').upsert(
        { user_id: supaUser.id, kind: 'post', record },
        { onConflict: 'user_id,kind' },
      )
    } else {
      try { localStorage.setItem(LS_POST_DIAG, JSON.stringify(record)) } catch { /* ignore */ }
    }
  }, [supaUser])

  const clearPostDiagnostic = useCallback(async () => {
    setPostDiagnostic(null)
    if (supaUser) {
      const supabase = createClient()
      await supabase.from('diagnostics').delete().match({ user_id: supaUser.id, kind: 'post' })
    } else {
      try { localStorage.removeItem(LS_POST_DIAG) } catch { /* ignore */ }
    }
  }, [supaUser])

  // ── loadSession ────────────────────────────────────────────────────────────
  const loadSession = useCallback(async (): Promise<SavedSession | null> => {
    if (supaUser) {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_sessions')
        .select('triage, response, topics, completed')
        .eq('user_id', supaUser.id)
        .maybeSingle()
      if (error || !data) return null
      return {
        triage:    data.triage    as TriageData,
        response:  data.response  as PlanResponse,
        topics:    data.topics    as PlanTopic[],
        completed: data.completed as string[],
      }
    } else {
      try {
        const raw = localStorage.getItem(LS_SESSION)
        if (!raw) return null
        return JSON.parse(raw) as SavedSession
      } catch { return null }
    }
  }, [supaUser])

  // ── saveSession ────────────────────────────────────────────────────────────
  const saveSession = useCallback(async (session: SavedSession): Promise<void> => {
    if (supaUser) {
      const supabase = createClient()
      await supabase.from('user_sessions').upsert(
        {
          user_id:    supaUser.id,
          triage:     session.triage,
          response:   session.response,
          topics:     session.topics,
          completed:  session.completed,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
    } else {
      try { localStorage.setItem(LS_SESSION, JSON.stringify(session)) } catch { /* ignore */ }
    }
  }, [supaUser])

  // ── clearSession ───────────────────────────────────────────────────────────
  const clearSession = useCallback(async (): Promise<void> => {
    if (supaUser) {
      const supabase = createClient()
      await supabase.from('user_sessions').delete().eq('user_id', supaUser.id)
    } else {
      try { localStorage.removeItem(LS_SESSION) } catch { /* ignore */ }
    }
  }, [supaUser])

  return {
    user,
    ready,
    isAuthenticated: !!supaUser,
    isPremium,
    signInAsGuest,
    signOut,
    diagnostic,
    saveDiagnostic,
    clearDiagnostic,
    postDiagnostic,
    savePostDiagnostic,
    clearPostDiagnostic,
    loadSession,
    saveSession,
    clearSession,
  }
}
