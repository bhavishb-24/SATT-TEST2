import { leaveRoom } from '@/lib/rooms-db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST /api/rooms/leave  — body: { room_id, user_id }
// Called via navigator.sendBeacon on tab close, so it must accept text bodies.
export async function POST(req: Request) {
  try {
    const text = await req.text()
    const { room_id, user_id } = JSON.parse(text || '{}')
    if (room_id && user_id) await leaveRoom(room_id, user_id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[rooms/leave]', err)
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
