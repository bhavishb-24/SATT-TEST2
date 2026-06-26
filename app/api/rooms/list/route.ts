import { listRooms } from '@/lib/rooms-db'
import { NextResponse } from 'next/server'

// Never cache — the room list must always reflect live state.
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const rooms = await listRooms(30)
    return NextResponse.json({ rooms })
  } catch (err) {
    console.error('[rooms/list]', err)
    return NextResponse.json({ error: 'Failed to list rooms' }, { status: 500 })
  }
}
