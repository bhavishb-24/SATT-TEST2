/** All types for the Study Rooms feature. No seed / mock data. */

// ── Core types ────────────────────────────────────────────────────────────────

export type RoomExam       = 'SAT' | 'ACT' | 'AP' | 'GRE' | 'MCAT' | 'IIT JEE'
export type RoomVisibility = 'public' | 'private'
export type RoomDifficulty = 'Beginner' | 'Intermediate' | 'Advanced'
export type WorkspaceTab   = 'whiteboard' | 'questions' | 'flashcards' | 'practice' | 'notes'
export type AiStatus       = 'teaching' | 'thinking' | 'drawing' | 'listening' | 'idle'
export type ParticipantStatus = 'ready' | 'thinking' | 'away'

export interface RoomParticipant {
  id: string
  name: string
  /** Single letter used as avatar fallback */
  initial: string
  /** Tailwind bg colour class for avatar */
  color: string
  level: number
  xp: number
  status: ParticipantStatus
  speaking: boolean
  handRaised: boolean
  /** 0-100 */
  accuracy: number
  questionsAnswered: number
}

export interface ChatMessage {
  id: string
  authorId: string
  authorName: string
  authorInitial: string
  authorColor: string
  text: string
  ts: string
  pinned?: boolean
  isAi?: boolean
}

export interface PollOption {
  id: string
  label: string
  votes: number
}

export interface LivePoll {
  id: string
  question: string
  options: PollOption[]
  open: boolean
}

export interface RoomCard {
  id: string
  name: string
  topic: string
  exam: RoomExam
  difficulty: RoomDifficulty
  online: number
  maxParticipants: number
  /** Scheduled start label shown on cards — e.g. "Now" or "Starts in 5 min" */
  scheduledTime: string
  /** Single emoji representing the room topic */
  emoji: string
  /** Hex accent colour for the room icon background */
  color: string
  visibility: RoomVisibility
}

export interface StudyRoom extends RoomCard {
  code: string
  hostId: string
  description: string
  participants_list: RoomParticipant[]
  messages: ChatMessage[]
  aiStatus: AiStatus
  activeTab: WorkspaceTab
  poll: LivePoll | null
  teamQuestProgress: number   // 0-100
  teamQuestLabel: string
  /** ISO timestamp of when the session started */
  sessionStartedAt: string
}
