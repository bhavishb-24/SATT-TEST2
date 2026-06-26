import { isPremiumUser } from '@/lib/rooms-db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/premium?email=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    if (!email) return NextResponse.json({ premium: false })
    const premium = await isPremiumUser(email)
    return NextResponse.json({ premium, plan: premium ? 'lifetime' : null })
  } catch (err) {
    console.error('[premium]', err)
    return NextResponse.json({ premium: false })
  }
}
