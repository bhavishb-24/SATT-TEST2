import { getRoomById } from '@/lib/rooms-db'
import { NextResponse } from 'next/server'

// Always fetch fresh room data.
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/rooms/get?id=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const room = await getRoomById(id)
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })

    return NextResponse.json({ room })
  } catch (err) {
    console.error('[rooms/get]', err)
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 })
  }
}
