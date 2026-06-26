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
  cursor_x:  number | null
  cursor_y:  number | null
}

export interface StrokePoint { x: number; y: number }

export interface RoomStroke {
  seq:     number
  user_id: string
  tool:    string
  color:   string
  width:   number
  points:  StrokePoint[]
}

export interface BoardState {
  strokes:   RoomStroke[]
  board_rev: number
  reset:     boolean
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
  // Also add the host as first member with fresh last_seen so they are immediately visible
  await pool.query(
    `INSERT INTO room_members (room_id, user_id, user_name, last_seen)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (room_id, user_id) DO UPDATE SET last_seen = now()`,
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
  // Only return members seen in the last 15 seconds — i.e. currently present.
  const { rows } = await pool.query<RoomMember>(
    `SELECT id, room_id, user_id, user_name, joined_at, cursor_x, cursor_y
     FROM room_members
     WHERE room_id = $1 AND last_seen > now() - interval '15 seconds'
     ORDER BY joined_at ASC`,
    [room_id],
  )
  return rows
}

// ─── Realtime board: cursors ────────────────────────────────────────────────

/**
 * Heartbeat + cursor update in one upsert. Records presence (last_seen = now)
 * and the caller's normalized pointer position (0..1) if provided.
 */
export async function pingPresence(params: {
  room_id:   string
  user_id:   string
  user_name: string
  cursor_x?: number | null
  cursor_y?: number | null
}): Promise<void> {
  await pool.query(
    `INSERT INTO room_members (room_id, user_id, user_name, last_seen, cursor_x, cursor_y)
     VALUES ($1, $2, $3, now(), $4, $5)
     ON CONFLICT (room_id, user_id)
     DO UPDATE SET user_name = $3,
                   last_seen = now(),
                   cursor_x  = COALESCE($4, room_members.cursor_x),
                   cursor_y  = COALESCE($5, room_members.cursor_y)`,
    [params.room_id, params.user_id, params.user_name,
     params.cursor_x ?? null, params.cursor_y ?? null],
  )
}

// ─── Realtime board: strokes ────────────────────────────────────────────────

/** Append one completed stroke (a path of normalized 0..1 points). */
export async function addStroke(params: {
  room_id: string
  user_id: string
  tool:    string
  color:   string
  width:   number
  points:  StrokePoint[]
}): Promise<number> {
  const { rows } = await pool.query<{ seq: string }>(
    `INSERT INTO room_strokes (room_id, user_id, tool, color, width, points)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING seq`,
    [params.room_id, params.user_id, params.tool, params.color, params.width,
     JSON.stringify(params.points)],
  )
  return Number(rows[0].seq)
}

/**
 * Return the board state for a client.
 * - If the client's known revision differs from the room's board_rev, return
 *   the FULL stroke set with reset=true (used after a clear/undo).
 * - Otherwise return only strokes newer than `after` (incremental).
 */
export async function getBoardState(
  room_id: string,
  after: number,
  knownRev: number,
): Promise<BoardState> {
  const { rows: roomRows } = await pool.query<{ board_rev: number }>(
    `SELECT board_rev FROM study_rooms WHERE id = $1`,
    [room_id],
  )
  const board_rev = roomRows[0]?.board_rev ?? 0
  const reset = knownRev !== board_rev

  const { rows } = await pool.query<RoomStroke>(
    reset
      ? `SELECT seq, user_id, tool, color, width, points
         FROM room_strokes WHERE room_id = $1 ORDER BY seq ASC`
      : `SELECT seq, user_id, tool, color, width, points
         FROM room_strokes WHERE room_id = $1 AND seq > $2 ORDER BY seq ASC`,
    reset ? [room_id] : [room_id, after],
  )
  return { strokes: rows.map((r) => ({ ...r, seq: Number(r.seq) })), board_rev, reset }
}

/** Clear the whole board and bump board_rev so every client wipes. */
export async function clearBoard(room_id: string): Promise<void> {
  await pool.query(`DELETE FROM room_strokes WHERE room_id = $1`, [room_id])
  await pool.query(
    `UPDATE study_rooms SET board_rev = board_rev + 1 WHERE id = $1`,
    [room_id],
  )
}

/** Remove the caller's most recent stroke and bump board_rev (shared undo). */
export async function undoLastStroke(room_id: string, user_id: string): Promise<void> {
  await pool.query(
    `DELETE FROM room_strokes
     WHERE seq = (
       SELECT seq FROM room_strokes
       WHERE room_id = $1 AND user_id = $2
       ORDER BY seq DESC LIMIT 1
     )`,
    [room_id, user_id],
  )
  await pool.query(
    `UPDATE study_rooms SET board_rev = board_rev + 1 WHERE id = $1`,
    [room_id],
  )
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
