'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { RoomMember, RoomStroke, StrokePoint } from '@/lib/rooms-db'

const POLL_MS = 500

export interface OutgoingStroke {
  tool:   string
  color:  string
  width:  number
  points: StrokePoint[] // normalized 0..1
}

export interface BoardBatch {
  strokes: RoomStroke[]
  reset:   boolean
}

export interface CursorInfo {
  id:    string
  name:  string
  color: string
  x:     number
  y:     number
}

/** Bundle of realtime board operations threaded down to the whiteboard. */
export interface BoardApi {
  subscribeBoard: (cb: (b: BoardBatch) => void) => () => void
  sendStroke:     (s: OutgoingStroke) => void
  boardAction:    (a: 'clear' | 'undo') => void
  sendCursor:     (x: number | null, y: number | null) => void
  cursors:        CursorInfo[]
  meId:           string
}

interface Identity { id: string; name: string }

/**
 * Drives the room's realtime layer over a single polling endpoint:
 *  - heartbeat + cursor broadcast
 *  - live roster (with everyone's cursor)
 *  - incremental whiteboard stroke sync (full refetch after clear/undo)
 *
 * Stroke delivery is push-based via `subscribeBoard` so the canvas can draw
 * imperatively without forcing React re-renders on every stroke.
 */
export function useRoomLive(roomId: string, me: Identity | null) {
  const [members, setMembers] = useState<RoomMember[]>([])

  const afterRef    = useRef(0)
  const revRef      = useRef(-1)            // -1 forces a full board load on first poll
  const cursorRef   = useRef<StrokePoint | null>(null)
  const boardCbRef  = useRef<((b: BoardBatch) => void) | null>(null)

  // Register the canvas's stroke handler.
  const subscribeBoard = useCallback((cb: (b: BoardBatch) => void) => {
    boardCbRef.current = cb
    return () => { if (boardCbRef.current === cb) boardCbRef.current = null }
  }, [])

  // Report the local pointer position (normalized 0..1); sent on next poll tick.
  const sendCursor = useCallback((x: number | null, y: number | null) => {
    cursorRef.current = (x === null || y === null) ? null : { x, y }
  }, [])

  // Persist one completed stroke immediately so peers pick it up next poll.
  const sendStroke = useCallback(async (s: OutgoingStroke) => {
    if (!me) return
    try {
      await fetch('/api/rooms/strokes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId, user_id: me.id, ...s }),
      })
    } catch { /* peers still recover on next full sync */ }
  }, [roomId, me])

  const boardAction = useCallback(async (action: 'clear' | 'undo') => {
    if (!me) return
    try {
      await fetch('/api/rooms/board-action', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId, user_id: me.id, action }),
      })
    } catch { /* ignore — next poll reconciles */ }
  }, [roomId, me])

  // ── Poll loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!me) return
    let active = true

    async function tick() {
      try {
        const res = await fetch('/api/rooms/live', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room_id:   roomId,
            user_id:   me!.id,
            user_name: me!.name,
            cursor_x:  cursorRef.current?.x ?? null,
            cursor_y:  cursorRef.current?.y ?? null,
            after:     afterRef.current,
            board_rev: revRef.current,
          }),
        })
        if (!active) return
        const data = await res.json()
        if (Array.isArray(data.members)) setMembers(data.members)

        const strokes: RoomStroke[] = data.strokes ?? []
        const reset = !!data.reset
        if (reset || strokes.length) {
          boardCbRef.current?.({ strokes, reset })
        }
        if (strokes.length) {
          afterRef.current = Math.max(afterRef.current, ...strokes.map((s) => s.seq))
        }
        if (typeof data.board_rev === 'number') revRef.current = data.board_rev
      } catch { /* keep polling */ }
    }

    tick()
    const interval = setInterval(tick, POLL_MS)

    const onUnload = () => {
      navigator.sendBeacon?.(
        '/api/rooms/leave',
        new Blob([JSON.stringify({ room_id: roomId, user_id: me!.id })], { type: 'application/json' }),
      )
    }
    window.addEventListener('beforeunload', onUnload)

    return () => {
      active = false
      clearInterval(interval)
      window.removeEventListener('beforeunload', onUnload)
    }
  }, [roomId, me])

  return { members, subscribeBoard, sendCursor, sendStroke, boardAction }
}
