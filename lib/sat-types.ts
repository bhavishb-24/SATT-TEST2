export type TimeBudget =
  | 'all-day'
  | 'evening'
  | 'few-hours'
  | 'sprint'

export interface TriageData {
  panic: number // 1-5
  testStartTime: string // e.g. "8:00 AM"
  daysUntilSat: string // e.g. "7", "14", "30", "60", "90", "120", "150", "180", "210", "240", "270", "300", "330", "365", "365+"
  timeBudget: TimeBudget
  lastMath: string
  lastRW: string
  goalMath: string
  goalRW: string
  weakAreas: string[]
  learningStyle: string
  previousPrep: string[]
  emergencyContact: string
  scoreReportText: string // extracted text from uploaded report, if any
}

export interface PlanTopic {
  name: string
  section: 'Math' | 'Reading & Writing' | string
  time_minutes: number
  score_impact_percent: number
  difficulty: 'Quick win' | 'Medium lift' | 'Heavy lift' | string
  why_it_matters: string
  action_steps: string[]
  stuck_explanation: string
  confidence_low_steps: string[]
  morning_reminder: string
}

export interface SkipTopic {
  name: string
  reason: string
}

export interface PlanSummary {
  motivational_message: string
  estimated_score_improvement?: string | null
  sleep_deadline: string
  wake_up_time: string
  total_topics: number
}

export interface StudyPlan {
  summary: PlanSummary
  topics: PlanTopic[]
  skip_topics: SkipTopic[]
  top_math_tips: string[]
  top_rw_tips: string[]
}

export interface PlanResponse {
  plan: StudyPlan
  source: 'ai' | 'fallback'
  provider?: string
  validatedBy?: string | null
  note?: string | null
}

export type Screen =
  | 'landing'
  | 'auth'
  | 'triage'
  | 'diagnostic'
  | 'reviewing'
  | 'results'
  | 'loading'
  | 'coachWelcome'
  | 'coach'
  | 'dashboard'

export interface GuestUser {
  id: string
  name: string
  createdAt: number
}

export interface DiagnosticResult {
  question: PracticeQuestion
  selectedIndex: number | null
  correct: boolean
}

export interface DiagnosticReview {
  overall_summary: string
  identified_weak_areas: string[]
  strengths: string[]
  recommended_focus: string
  encouragement: string
}

export interface DiagnosticRecord {
  results: DiagnosticResult[]
  review: DiagnosticReview
  correct: number
  total: number
  mathCorrect: number
  mathTotal: number
  rwCorrect: number
  rwTotal: number
  source: 'ai' | 'fallback'
  takenAt: number
}

export type CoachMode =
  | 'welcome'
  | 'topicIntro'
  | 'stepByStep'
  | 'checkIn'
  | 'topicComplete'
  | 'break'
  | 'allDone'

export interface CoachAdaptation {
  topic: string
  message: string
}

export type DashboardView =
  | 'home'
  | 'plan'
  | 'practice'
  | 'mocktest'
  | 'flashcards'
  | 'progress'
  | 'achievements'
  | 'brain'
  | 'community'
  | 'checklist'
  | 'morning'
  | 'asktutor'
  | 'profile'
  | 'settings'
  | 'notifications'
  | 'premium'
  | 'help'

export interface AppStats {
  topicsCompleted: number
  topicsTotal: number
  practiceAnswered: number
  practiceCorrect: number
  flashcardsReviewed: number
  flashcardsKnown: number
  focusSessions: number
  focusSeconds: number
  // Per-section practice accuracy buckets
  sectionStats: Record<string, { answered: number; correct: number }>
}

export type Section = 'Math' | 'Reading & Writing'

export interface PracticeQuestion {
  id: string
  section: Section
  topic: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  prompt: string
  choices: string[] // 4 options
  correctIndex: number
  explanation: string
}

export interface Formula {
  name: string
  expression: string // LaTeX without delimiters
  note: string
}

export interface FormulaGroup {
  category: string
  section: Section
  icon: string
  formulas: Formula[]
}

export interface Flashcard {
  id: string
  front: string
  back: string
  category: string
  section: Section
}
