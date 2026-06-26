import { clearBoard, undoLastStroke } from '@/lib/rooms-db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// POST /api/rooms/board-action — shared clear / undo for the whiteboard
export async function POST(req: Request) {
  try {
    const { room_id, user_id, action } = await req.json()
    if (!room_id || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (action === 'clear') {
      await clearBoard(room_id)
    } else if (action === 'undo') {
      if (!user_id) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
      await undoLastStroke(room_id, user_id)
    } else {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[rooms/board-action POST]', err)
    return NextResponse.json({ error: 'Board action failed' }, { status: 500 })
  }
}
