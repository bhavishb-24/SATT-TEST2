import { listRooms } from '@/lib/rooms-db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const rooms = await listRooms(30)
    return NextResponse.json({ rooms })
  } catch (err) {
    console.error('[rooms/list]', err)
    return NextResponse.json({ error: 'Failed to list rooms' }, { status: 500 })
  }
}
