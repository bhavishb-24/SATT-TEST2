import { getRoomByCode, joinRoom } from '@/lib/rooms-db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { code, user_id, user_name } = body

    if (!code?.trim() || !user_id || !user_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const room = await getRoomByCode(code.trim())
    if (!room) {
      return NextResponse.json({ error: 'Room not found. Check the code and try again.' }, { status: 404 })
    }

    const result = await joinRoom({ room_id: room.id, user_id, user_name })
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 409 })
    }

    return NextResponse.json({ room })
  } catch (err) {
    console.error('[rooms/join]', err)
    return NextResponse.json({ error: 'Failed to join room' }, { status: 500 })
  }
}
