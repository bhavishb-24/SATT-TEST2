import { addStroke } from '@/lib/rooms-db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// POST /api/rooms/strokes — append one completed stroke (normalized 0..1 points)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { room_id, user_id, tool, color, width, points } = body

    if (!room_id || !user_id || !Array.isArray(points) || points.length === 0) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const seq = await addStroke({
      room_id,
      user_id,
      tool:  tool  ?? 'pen',
      color: color ?? '#1e293b',
      width: typeof width === 'number' ? width : 3,
      points,
    })

    return NextResponse.json({ seq })
  } catch (err) {
    console.error('[rooms/strokes POST]', err)
    return NextResponse.json({ error: 'Failed to add stroke' }, { status: 500 })
  }
}
