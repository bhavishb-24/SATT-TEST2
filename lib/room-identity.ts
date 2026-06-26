'use client'

/**
 * room-identity.ts
 * A single, stable identity per browser for study rooms.
 *
 * Why this exists: students join rooms either signed-in or as guests. If each
 * entry point (create modal, join modal, direct navigation) invented its own
 * `guest_${Date.now()}` id, the same person would be registered under several
 * ids and appear as multiple ghost members — or not be registered at all when
 * navigating straight to a room URL. This helper guarantees ONE consistent
 * identity so presence, joining, and the member roster all line up.
 */

export interface RoomIdentity {
  id:   string
  name: string
}

const KEY = 'ser:room-identity'

function randomName(): string {
  const adj  = ['Brave', 'Calm', 'Bright', 'Sharp', 'Steady', 'Bold', 'Quick', 'Focused']
  const noun = ['Scholar', 'Owl', 'Comet', 'Falcon', 'Pioneer', 'Voyager', 'Spark', 'Ace']
  const num  = Math.floor(Math.random() * 90 + 10)
  return `${adj[Math.floor(Math.random() * adj.length)]} ${noun[Math.floor(Math.random() * noun.length)]} ${num}`
}

function newGuestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `guest_${crypto.randomUUID()}`
  return `guest_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

/**
 * Returns a stable room identity.
 * - If a real signed-in user is supplied, that is always used.
 * - Otherwise a per-tab guest identity is read from (or written to)
 *   sessionStorage. Using sessionStorage (not localStorage) is critical:
 *   two browser tabs sharing localStorage would get the same guest id,
 *   so both heartbeats would upsert the same row and each tab would only
 *   ever see one member — itself.
 */
export function getRoomIdentity(user?: { id: string; name: string } | null): RoomIdentity {
  if (user?.id) return { id: user.id, name: user.name }

  if (typeof window === 'undefined') {
    return { id: newGuestId(), name: randomName() }
  }

  // Per-tab storage so two tabs always have distinct identities.
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as RoomIdentity
      if (parsed?.id && parsed?.name) return parsed
    }
  } catch { /* ignore corrupt storage */ }

  const identity: RoomIdentity = { id: newGuestId(), name: randomName() }
  try { sessionStorage.setItem(KEY, JSON.stringify(identity)) } catch { /* ignore */ }
  return identity
}
