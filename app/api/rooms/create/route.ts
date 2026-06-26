import { createRoom } from '@/lib/rooms-db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, exam, topic, host_id, host_name, max_members = 8 } = body

    if (!name?.trim() || !host_id || !host_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const room = await createRoom({
      name:        name.trim(),
      exam:        exam    || 'SAT',
      topic:       topic   || 'General Review',
      host_id,
      host_name,
      max_members: Math.min(Math.max(parseInt(max_members) || 8, 2), 20),
    })

    return NextResponse.json({ room })
  } catch (err) {
    console.error('[rooms/create]', err)
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}
