/**
 * rooms-db.ts
 * Server-only helpers for study room persistence (Neon via DATABASE_URL).
 * All queries use parameterised $N placeholders to prevent SQL injection.
 */
import { Pool } from 'pg'

// Share one pool across hot-reloads in dev
const globalPool = global as typeof globalThis & { _roomsPool?: Pool }
const pool = globalPool._roomsPool ??
  (globalPool._roomsPool = new Pool({ connectionString: process.env.DATABASE_URL }))

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StudyRoom {
  id:          string
  code:        string
  name:        string
  exam:        string
  topic:       string
  host_id:     string
  host_name:   string
  max_members: number
  is_active:   boolean
  created_at:  string
  member_count?: number
}

export interface RoomMember {
  id:        string
  room_id:   string
  user_id:   string
  user_name: string
  joined_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a 6-character uppercase alphanumeric invite code. */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I ambiguity
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createRoom(params: {
  name:        string
  exam:        string
  topic:       string
  host_id:     string
  host_name:   string
  max_members: number
}): Promise<StudyRoom> {
  // Generate a unique code (retry on collision)
  let code = generateRoomCode()
  for (let attempt = 0; attempt < 5; attempt++) {
    const { rows } = await pool.query<{ id: string }>(
      'SELECT id FROM study_rooms WHERE code = $1',
      [code],
    )
    if (rows.length === 0) break
    code = generateRoomCode()
  }

  const { rows } = await pool.query<StudyRoom>(
    `INSERT INTO study_rooms (code, name, exam, topic, host_id, host_name, max_members)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [code, params.name, params.exam, params.topic, params.host_id, params.host_name, params.max_members],
  )
  // Also add the host as first member
  await pool.query(
    `INSERT INTO room_members (room_id, user_id, user_name)
     VALUES ($1, $2, $3)
     ON CONFLICT (room_id, user_id) DO NOTHING`,
    [rows[0].id, params.host_id, params.host_name],
  )
  return rows[0]
}

// ─── Look up by code ──────────────────────────────────────────────────────────

export async function getRoomByCode(code: string): Promise<StudyRoom | null> {
  const { rows } = await pool.query<StudyRoom>(
    `SELECT r.*,
            COUNT(m.id) FILTER (WHERE m.last_seen > now() - interval '40 seconds')::int AS member_count
     FROM study_rooms r
     LEFT JOIN room_members m ON m.room_id = r.id
     WHERE r.code = $1 AND r.is_active = true
     GROUP BY r.id`,
    [code.toUpperCase()],
  )
  return rows[0] ?? null
}

// ─── Look up by ID ────────────────────────────────────────────────────────────

export async function getRoomById(id: string): Promise<StudyRoom | null> {
  const { rows } = await pool.query<StudyRoom>(
    `SELECT r.*,
            COUNT(m.id) FILTER (WHERE m.last_seen > now() - interval '40 seconds')::int AS member_count
     FROM study_rooms r
     LEFT JOIN room_members m ON m.room_id = r.id
     WHERE r.id = $1 AND r.is_active = true
     GROUP BY r.id`,
    [id],
  )
  return rows[0] ?? null
}

// ─── List recent active rooms ─────────────────────────────────────────────────

export async function listRooms(limit = 20): Promise<StudyRoom[]> {
  const { rows } = await pool.query<StudyRoom>(
    `SELECT r.*,
            COUNT(m.id) FILTER (WHERE m.last_seen > now() - interval '40 seconds')::int AS member_count
     FROM study_rooms r
     LEFT JOIN room_members m ON m.room_id = r.id
     WHERE r.is_active = true
     GROUP BY r.id
     ORDER BY r.created_at DESC
     LIMIT $1`,
    [limit],
  )
  return rows
}

// ─── Join (upsert member) ────────────────────────────────────────────────────

export async function joinRoom(params: {
  room_id:   string
  user_id:   string
  user_name: string
}): Promise<{ ok: boolean; error?: string }> {
  // Check capacity against currently-active members only, and never block a
  // member who is already in the room (re-join / heartbeat).
  const { rows: cap } = await pool.query<{ max_members: number; member_count: string; already: boolean }>(
    `SELECT r.max_members,
            COUNT(m.id) FILTER (WHERE m.last_seen > now() - interval '40 seconds') AS member_count,
            bool_or(m.user_id = $2) AS already
     FROM study_rooms r
     LEFT JOIN room_members m ON m.room_id = r.id
     WHERE r.id = $1 AND r.is_active = true
     GROUP BY r.id`,
    [params.room_id, params.user_id],
  )
  if (!cap[0]) return { ok: false, error: 'Room not found' }
  const current = parseInt(cap[0].member_count, 10)
  if (!cap[0].already && current >= cap[0].max_members) {
    return { ok: false, error: 'Room is full' }
  }

  await pool.query(
    `INSERT INTO room_members (room_id, user_id, user_name, last_seen)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (room_id, user_id)
     DO UPDATE SET user_name = $3, last_seen = now()`,
    [params.room_id, params.user_id, params.user_name],
  )
  return { ok: true }
}

// ─── Get members ─────────────────────────────────────────────────────────────

export async function getRoomMembers(room_id: string): Promise<RoomMember[]> {
  // Only return members seen in the last 40 seconds — i.e. currently present.
  const { rows } = await pool.query<RoomMember>(
    `SELECT * FROM room_members
     WHERE room_id = $1 AND last_seen > now() - interval '40 seconds'
     ORDER BY joined_at ASC`,
    [room_id],
  )
  return rows
}

// ─── Leave (remove member) ─────────────────────────────────────────────────

export async function leaveRoom(room_id: string, user_id: string): Promise<void> {
  await pool.query(
    `DELETE FROM room_members WHERE room_id = $1 AND user_id = $2`,
    [room_id, user_id],
  )
}

// ─── Premium check ───────────────────────────────────────────────────────────

export async function isPremiumUser(email: string): Promise<boolean> {
  const { rows } = await pool.query<{ plan: string }>(
    `SELECT plan FROM premium_users WHERE email = $1`,
    [email.toLowerCase()],
  )
  return rows.length > 0
}
