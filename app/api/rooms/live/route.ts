import { pingPresence, getRoomMembers, getBoardState } from '@/lib/rooms-db'
import { NextResponse } from 'next/server'

// Realtime data must never be cached.
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * POST /api/rooms/live
 * One round-trip that:
 *   1. records the caller's presence + cursor (heartbeat),
 *   2. returns the current roster (with everyone's cursor),
 *   3. returns whiteboard strokes (incremental, or full set after a clear/undo).
 *
 * Body: { room_id, user_id, user_name, cursor_x?, cursor_y?, after?, board_rev? }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      room_id, user_id, user_name,
      cursor_x = null, cursor_y = null,
      after = 0, board_rev = -1,
    } = body

    if (!room_id || !user_id || !user_name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    await pingPresence({ room_id, user_id, user_name, cursor_x, cursor_y })

    const [members, board] = await Promise.all([
      getRoomMembers(room_id),
      getBoardState(room_id, Number(after) || 0, Number(board_rev)),
    ])

    return NextResponse.json({
      members,
      strokes:   board.strokes,
      board_rev: board.board_rev,
      reset:     board.reset,
    })
  } catch (err) {
    console.error('[rooms/live POST]', err)
    return NextResponse.json({ error: 'Live sync failed' }, { status: 500 })
  }
}
