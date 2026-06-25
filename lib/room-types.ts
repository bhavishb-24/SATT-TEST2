/** All types and static seed data for the Study Rooms feature. */

// ── Core types ────────────────────────────────────────────────────────────────

export type RoomExam = 'SAT' | 'ACT' | 'AP' | 'GRE' | 'MCAT' | 'IIT JEE'
export type RoomVisibility = 'public' | 'private'
export type RoomDifficulty = 'Beginner' | 'Intermediate' | 'Advanced'
export type WorkspaceTab = 'whiteboard' | 'questions' | 'flashcards' | 'practice' | 'notes'
export type AiStatus = 'teaching' | 'thinking' | 'drawing' | 'listening' | 'idle'
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
  participants: number
  maxParticipants: number
  avgScore: number
  scheduledTime: string
  emoji: string
  /** hex accent colour for the room icon */
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
  sessionStartedAt: string
}

// ── Featured room seed data ────────────────────────────────────────────────────

export const FEATURED_ROOMS: RoomCard[] = [
  {
    id: 'sat-math-review',
    name: 'SAT Math Review',
    topic: 'Algebra, Geometry & Data Analysis',
    exam: 'SAT',
    difficulty: 'Intermediate',
    online: 14,
    participants: 14,
    maxParticipants: 20,
    avgScore: 640,
    scheduledTime: 'Now',
    emoji: '📐',
    color: '#0e8a6a',
    visibility: 'public',
  },
  {
    id: 'reading-bootcamp',
    name: 'Reading Bootcamp',
    topic: 'Inference, Evidence & Main Idea',
    exam: 'SAT',
    difficulty: 'Advanced',
    online: 8,
    participants: 8,
    maxParticipants: 12,
    avgScore: 710,
    scheduledTime: 'Now',
    emoji: '📖',
    color: '#2563eb',
    visibility: 'public',
  },
  {
    id: 'grammar-mastery',
    name: 'Grammar Mastery',
    topic: 'Punctuation, Agreement & Transitions',
    exam: 'SAT',
    difficulty: 'Beginner',
    online: 11,
    participants: 11,
    maxParticipants: 20,
    avgScore: 580,
    scheduledTime: 'Now',
    emoji: '✍️',
    color: '#d97706',
    visibility: 'public',
  },
  {
    id: 'vocab-challenge',
    name: 'Vocabulary Challenge',
    topic: 'Context Clues & Word-in-Context',
    exam: 'SAT',
    difficulty: 'Intermediate',
    online: 6,
    participants: 6,
    maxParticipants: 10,
    avgScore: 620,
    scheduledTime: 'Starts in 5 min',
    emoji: '🔤',
    color: '#7c3aed',
    visibility: 'public',
  },
  {
    id: 'night-before-sat',
    name: 'Night Before SAT',
    topic: 'Last-minute drills & calm review',
    exam: 'SAT',
    difficulty: 'Beginner',
    online: 22,
    participants: 22,
    maxParticipants: 30,
    avgScore: 600,
    scheduledTime: 'Now',
    emoji: '🌙',
    color: '#0e8a6a',
    visibility: 'public',
  },
  {
    id: 'math-duel-arena',
    name: 'Math Duel Arena',
    topic: 'Speed challenges — Battle mode',
    exam: 'SAT',
    difficulty: 'Advanced',
    online: 4,
    participants: 4,
    maxParticipants: 8,
    avgScore: 750,
    scheduledTime: 'Now',
    emoji: '⚡',
    color: '#d94040',
    visibility: 'public',
  },
]

// ── Full live room seed (used by /rooms/[id]) ─────────────────────────────────

export const SEED_ROOM: StudyRoom = {
  ...FEATURED_ROOMS[0],
  code: 'SAGE-4821',
  hostId: 'p1',
  description:
    'Work through SAT Math topics together. The AI tutor will explain any question and draw step-by-step solutions on the shared whiteboard.',
  participants_list: [
    {
      id: 'ai',
      name: 'Sage AI',
      initial: 'S',
      color: 'bg-primary',
      level: 99,
      xp: 999999,
      status: 'ready',
      speaking: false,
      handRaised: false,
      accuracy: 100,
      questionsAnswered: 9999,
    },
    {
      id: 'p1',
      name: 'Jordan',
      initial: 'J',
      color: 'bg-emerald-500',
      level: 7,
      xp: 3400,
      status: 'ready',
      speaking: false,
      handRaised: false,
      accuracy: 72,
      questionsAnswered: 48,
    },
    {
      id: 'p2',
      name: 'Priya',
      initial: 'P',
      color: 'bg-blue-500',
      level: 5,
      xp: 2100,
      status: 'thinking',
      speaking: false,
      handRaised: false,
      accuracy: 81,
      questionsAnswered: 61,
    },
    {
      id: 'p3',
      name: 'Marcus',
      initial: 'M',
      color: 'bg-amber-500',
      level: 4,
      xp: 1600,
      status: 'ready',
      speaking: false,
      handRaised: true,
      accuracy: 65,
      questionsAnswered: 30,
    },
    {
      id: 'p4',
      name: 'Leila',
      initial: 'L',
      color: 'bg-rose-500',
      level: 6,
      xp: 2800,
      status: 'away',
      speaking: false,
      handRaised: false,
      accuracy: 88,
      questionsAnswered: 74,
    },
  ],
  messages: [
    {
      id: 'm1',
      authorId: 'ai',
      authorName: 'Sage AI',
      authorInitial: 'S',
      authorColor: 'bg-primary',
      text: 'Welcome to SAT Math Review! I\'ll be here to explain any question, draw solutions on the whiteboard, and keep the session moving. Who wants to start?',
      ts: '2 min ago',
      isAi: true,
      pinned: true,
    },
    {
      id: 'm2',
      authorId: 'p2',
      authorName: 'Priya',
      authorInitial: 'P',
      authorColor: 'bg-blue-500',
      text: 'Can we review systems of equations? I keep getting those wrong.',
      ts: '1 min ago',
    },
    {
      id: 'm3',
      authorId: 'ai',
      authorName: 'Sage AI',
      authorInitial: 'S',
      authorColor: 'bg-primary',
      text: 'Great choice, Priya. I\'m switching to the whiteboard now — let me draw both the substitution and elimination methods side by side.',
      ts: '45 sec ago',
      isAi: true,
    },
    {
      id: 'm4',
      authorId: 'p1',
      authorName: 'Jordan',
      authorInitial: 'J',
      authorColor: 'bg-emerald-500',
      text: 'Yes please, I always mix those up too',
      ts: '30 sec ago',
    },
  ],
  aiStatus: 'teaching',
  activeTab: 'whiteboard',
  poll: {
    id: 'poll1',
    question: 'Which topic should we tackle next?',
    options: [
      { id: 'o1', label: 'Quadratics', votes: 3 },
      { id: 'o2', label: 'Geometry', votes: 2 },
      { id: 'o3', label: 'Statistics', votes: 1 },
    ],
    open: true,
  },
  teamQuestProgress: 38,
  teamQuestLabel: 'Solve 100 Questions Together',
  sessionStartedAt: '18 min ago',
}
