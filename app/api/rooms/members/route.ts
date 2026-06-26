import { getRoomMembers, joinRoom } from '@/lib/rooms-db'
import { NextResponse } from 'next/server'

// GET /api/rooms/members?room_id=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const room_id = searchParams.get('room_id')
    if (!room_id) return NextResponse.json({ error: 'Missing room_id' }, { status: 400 })

    const members = await getRoomMembers(room_id)
    return NextResponse.json({ members })
  } catch (err) {
    console.error('[rooms/members GET]', err)
    return NextResponse.json({ error: 'Failed to get members' }, { status: 500 })
  }
}

// POST /api/rooms/members — heartbeat / rejoin
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { room_id, user_id, user_name } = body
    if (!room_id || !user_id || !user_name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    await joinRoom({ room_id, user_id, user_name })
    const members = await getRoomMembers(room_id)
    return NextResponse.json({ members })
  } catch (err) {
    console.error('[rooms/members POST]', err)
    return NextResponse.json({ error: 'Failed to update members' }, { status: 500 })
  }
}
