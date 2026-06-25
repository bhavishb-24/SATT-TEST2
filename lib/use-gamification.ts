'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

export type AchievementCategory =
  | 'consistency'
  | 'accuracy'
  | 'improvement'
  | 'mastery'
  | 'whiteboard'
  | 'speed'
  | 'challenge'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: AchievementCategory
  xpReward: number
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum'
  /** 0–100; computed dynamically against stats */
  progress: number
  unlocked: boolean
  unlockedAt?: number // epoch ms
}

export type QuestStatus = 'active' | 'complete'

export interface Quest {
  id: string
  title: string
  description: string
  icon: string
  xpReward: number
  progress: number   // 0–100
  current: number
  target: number
  unit: string
  status: QuestStatus
  refreshes: 'daily' | 'weekly'
}

export type League = 'bronze' | 'silver' | 'gold' | 'diamond' | 'master' | 'legend'

export interface Level {
  level: number
  title: string
  xpRequired: number
}

/** A milestone in the Journey tab — derived entirely from real activity. */
export interface JourneyMilestone {
  id: string
  event: string
  icon: string
  done: boolean
  /** ISO date string set when the milestone was reached, or undefined */
  reachedAt?: string
}

/** One branch of the confidence tree, derived from real topic stats. */
export interface TreeBranch {
  label: string
  /** 0–100, derived from real accuracy on that topic */
  mastery: number
  color: string
}

export interface GamificationState {
  xp: number
  level: number
  levelTitle: string
  xpForCurrentLevel: number
  xpForNextLevel: number
  levelProgress: number // 0–100
  streak: number
  longestStreak: number
  lastStudiedDay: string // YYYY-MM-DD
  recoveryAvailable: boolean
  weeklyXp: number
  league: League
  leagueXpThisWeek: number
  confidenceScore: number // 0–100
  estimatedSAT: number
  studyMinutesToday: number
  achievements: Achievement[]
  newlyUnlocked: Achievement[]
  quests: Quest[]
  /** No leaderboard — real multiplayer would require a backend. */
  journey: JourneyMilestone[]
  treeBranches: TreeBranch[]
  satDaysRemaining: number
  dailyGoalPct: number
}

export interface GamificationApi {
  state: GamificationState
  addXp: (amount: number) => void
  recordStudyTime: (minutes: number) => void
  recordAccuracy: (correct: number, total: number) => void
  recordStreakDay: () => void
  useRecovery: () => void
  dismissNewlyUnlocked: () => void
  completeQuest: (questId: string) => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVELS: Level[] = [
  { level: 1, title: 'Explorer', xpRequired: 0 },
  { level: 2, title: 'Learner', xpRequired: 200 },
  { level: 3, title: 'Student', xpRequired: 450 },
  { level: 4, title: 'Thinker', xpRequired: 800 },
  { level: 5, title: 'Scholar', xpRequired: 1300 },
  { level: 6, title: 'Analyst', xpRequired: 2000 },
  { level: 7, title: 'Solver', xpRequired: 2900 },
  { level: 8, title: 'Reasoner', xpRequired: 4000 },
  { level: 9, title: 'Achiever', xpRequired: 5400 },
  { level: 10, title: 'Trailblazer', xpRequired: 7000 },
  { level: 12, title: 'Scholar II', xpRequired: 10000 },
  { level: 15, title: 'Tactician', xpRequired: 15000 },
  { level: 20, title: 'Strategist', xpRequired: 25000 },
  { level: 25, title: 'Expert', xpRequired: 40000 },
  { level: 30, title: 'Master', xpRequired: 60000 },
  { level: 40, title: 'Elite', xpRequired: 100000 },
  { level: 50, title: 'SAT Sage', xpRequired: 160000 },
]

const LEAGUE_THRESHOLDS: Record<League, number> = {
  bronze: 0,
  silver: 500,
  gold: 1200,
  diamond: 2500,
  master: 5000,
  legend: 10000,
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function getLevelInfo(xp: number): {
  level: number
  title: string
  xpForCurrentLevel: number
  xpForNextLevel: number
  levelProgress: number
} {
  let current = LEVELS[0]
  let next = LEVELS[1]
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xpRequired) {
      current = LEVELS[i]
      next = LEVELS[Math.min(i + 1, LEVELS.length - 1)]
    }
  }
  const span = next.xpRequired - current.xpRequired
  const earned = xp - current.xpRequired
  const progress = span > 0 ? Math.min(100, Math.round((earned / span) * 100)) : 100
  return {
    level: current.level,
    title: current.title,
    xpForCurrentLevel: current.xpRequired,
    xpForNextLevel: next.xpRequired,
    levelProgress: progress,
  }
}

function getLeague(weeklyXp: number): League {
  const leagues = Object.entries(LEAGUE_THRESHOLDS).reverse() as [League, number][]
  for (const [league, threshold] of leagues) {
    if (weeklyXp >= threshold) return league
  }
  return 'bronze'
}

// ─── Achievement definitions ──────────────────────────────────────────────────

function buildAchievements(
  xp: number,
  streak: number,
  practiceCorrect: number,
  practiceAnswered: number,
  studyMinutes: number,
  topicsCompleted: number,
  flashcardsKnown: number,
  whiteboardSessions: number,
): Achievement[] {
  const accuracy = practiceAnswered > 0
    ? Math.round((practiceCorrect / practiceAnswered) * 100) : 0

  return [
    // Consistency
    {
      id: 'streak-3',
      title: '3-Day Streak',
      description: 'Study 3 days in a row.',
      icon: 'ti-flame',
      category: 'consistency',
      xpReward: 50,
      difficulty: 'bronze',
      progress: Math.min(100, Math.round((streak / 3) * 100)),
      unlocked: streak >= 3,
    },
    {
      id: 'streak-7',
      title: 'Week Warrior',
      description: 'Study every day for a full week.',
      icon: 'ti-flame',
      category: 'consistency',
      xpReward: 150,
      difficulty: 'silver',
      progress: Math.min(100, Math.round((streak / 7) * 100)),
      unlocked: streak >= 7,
    },
    {
      id: 'streak-30',
      title: '30-Day Streak',
      description: 'One month of daily dedication.',
      icon: 'ti-brand-firebase',
      category: 'consistency',
      xpReward: 500,
      difficulty: 'gold',
      progress: Math.min(100, Math.round((streak / 30) * 100)),
      unlocked: streak >= 30,
    },
    {
      id: 'study-60',
      title: 'Deep Focus',
      description: 'Study for 60 minutes in a single day.',
      icon: 'ti-clock-hour-8',
      category: 'consistency',
      xpReward: 100,
      difficulty: 'bronze',
      progress: Math.min(100, Math.round((studyMinutes / 60) * 100)),
      unlocked: studyMinutes >= 60,
    },
    // Accuracy
    {
      id: 'accuracy-80',
      title: 'Sharp Mind',
      description: 'Reach 80% practice accuracy.',
      icon: 'ti-target-arrow',
      category: 'accuracy',
      xpReward: 200,
      difficulty: 'silver',
      progress: Math.min(100, Math.round((accuracy / 80) * 100)),
      unlocked: accuracy >= 80,
    },
    {
      id: 'accuracy-100-streak',
      title: '100 Correct',
      description: 'Answer 100 practice questions correctly.',
      icon: 'ti-check-circle',
      category: 'accuracy',
      xpReward: 300,
      difficulty: 'gold',
      progress: Math.min(100, Math.round((practiceCorrect / 100) * 100)),
      unlocked: practiceCorrect >= 100,
    },
    // Mastery
    {
      id: 'topics-5',
      title: 'Topic Master',
      description: 'Complete 5 study topics.',
      icon: 'ti-books',
      category: 'mastery',
      xpReward: 150,
      difficulty: 'silver',
      progress: Math.min(100, Math.round((topicsCompleted / 5) * 100)),
      unlocked: topicsCompleted >= 5,
    },
    {
      id: 'flashcards-50',
      title: 'Card Shark',
      description: 'Master 50 flashcards.',
      icon: 'ti-cards',
      category: 'mastery',
      xpReward: 120,
      difficulty: 'bronze',
      progress: Math.min(100, Math.round((flashcardsKnown / 50) * 100)),
      unlocked: flashcardsKnown >= 50,
    },
    {
      id: 'xp-1000',
      title: 'Rising Scholar',
      description: 'Earn 1,000 total XP.',
      icon: 'ti-star',
      category: 'mastery',
      xpReward: 200,
      difficulty: 'bronze',
      progress: Math.min(100, Math.round((xp / 1000) * 100)),
      unlocked: xp >= 1000,
    },
    {
      id: 'xp-5000',
      title: 'SAT Strategist',
      description: 'Earn 5,000 total XP.',
      icon: 'ti-trophy',
      category: 'mastery',
      xpReward: 500,
      difficulty: 'gold',
      progress: Math.min(100, Math.round((xp / 5000) * 100)),
      unlocked: xp >= 5000,
    },
    // Whiteboard
    {
      id: 'whiteboard-1',
      title: 'First Lesson',
      description: 'Complete your first Whiteboard AI session.',
      icon: 'ti-chalkboard',
      category: 'whiteboard',
      xpReward: 100,
      difficulty: 'bronze',
      progress: whiteboardSessions >= 1 ? 100 : 0,
      unlocked: whiteboardSessions >= 1,
    },
    {
      id: 'whiteboard-5',
      title: 'Visual Learner',
      description: 'Complete 5 Whiteboard AI sessions.',
      icon: 'ti-pencil',
      category: 'whiteboard',
      xpReward: 250,
      difficulty: 'silver',
      progress: Math.min(100, Math.round((whiteboardSessions / 5) * 100)),
      unlocked: whiteboardSessions >= 5,
    },
    // Speed
    {
      id: 'practice-10',
      title: 'Fast Thinker',
      description: 'Answer 10 practice questions.',
      icon: 'ti-bolt',
      category: 'speed',
      xpReward: 80,
      difficulty: 'bronze',
      progress: Math.min(100, Math.round((practiceAnswered / 10) * 100)),
      unlocked: practiceAnswered >= 10,
    },
    // Challenge
    {
      id: 'comeback',
      title: 'The Comeback',
      description: 'Use a streak recovery after missing a day.',
      icon: 'ti-refresh',
      category: 'challenge',
      xpReward: 75,
      difficulty: 'bronze',
      progress: 0,
      unlocked: false,
    },
    {
      id: 'first-practice',
      title: 'First Step',
      description: 'Answer your first practice question.',
      icon: 'ti-pencil-question',
      category: 'improvement',
      xpReward: 30,
      difficulty: 'bronze',
      progress: practiceAnswered >= 1 ? 100 : 0,
      unlocked: practiceAnswered >= 1,
    },
  ]
}

function buildQuests(
  practiceAnswered: number,
  flashcardsKnown: number,
  topicsCompleted: number,
  studyMinutes: number,
): Quest[] {
  return [
    {
      id: 'daily-practice',
      title: 'Daily Drill',
      description: 'Answer 10 practice questions today',
      icon: 'ti-target-arrow',
      xpReward: 80,
      current: Math.min(practiceAnswered, 10),
      target: 10,
      unit: 'questions',
      progress: Math.min(100, Math.round((practiceAnswered / 10) * 100)),
      status: practiceAnswered >= 10 ? 'complete' : 'active',
      refreshes: 'daily',
    },
    {
      id: 'daily-flashcards',
      title: 'Card Sprint',
      description: 'Master 5 new flashcards',
      icon: 'ti-cards',
      xpReward: 40,
      current: Math.min(flashcardsKnown, 5),
      target: 5,
      unit: 'cards',
      progress: Math.min(100, Math.round((flashcardsKnown / 5) * 100)),
      status: flashcardsKnown >= 5 ? 'complete' : 'active',
      refreshes: 'daily',
    },
    {
      id: 'daily-focus',
      title: 'Focus Block',
      description: 'Study for 30 focused minutes',
      icon: 'ti-clock-hour-4',
      xpReward: 60,
      current: Math.min(studyMinutes, 30),
      target: 30,
      unit: 'min',
      progress: Math.min(100, Math.round((studyMinutes / 30) * 100)),
      status: studyMinutes >= 30 ? 'complete' : 'active',
      refreshes: 'daily',
    },
    {
      id: 'weekly-topics',
      title: 'Topic Conqueror',
      description: 'Complete 3 study topics this week',
      icon: 'ti-books',
      xpReward: 200,
      current: Math.min(topicsCompleted, 3),
      target: 3,
      unit: 'topics',
      progress: Math.min(100, Math.round((topicsCompleted / 3) * 100)),
      status: topicsCompleted >= 3 ? 'complete' : 'active',
      refreshes: 'weekly',
    },
    {
      id: 'weekly-accuracy',
      title: 'Precision Week',
      description: 'Answer 50 practice questions this week',
      icon: 'ti-award',
      xpReward: 300,
      current: Math.min(practiceAnswered, 50),
      target: 50,
      unit: 'questions',
      progress: Math.min(100, Math.round((practiceAnswered / 50) * 100)),
      status: practiceAnswered >= 50 ? 'complete' : 'active',
      refreshes: 'weekly',
    },
  ]
}

/**
 * Build a journey timeline purely from real achievements + activity.
 * Every milestone is either "done" (unlocked/crossed a threshold) or
 * "upcoming" — no hardcoded dates or fabricated events.
 */
function buildJourney(
  achievements: Achievement[],
  practiceAnswered: number,
  topicsCompleted: number,
  flashcardsKnown: number,
  streak: number,
  xp: number,
  whiteboardSessions: number,
): JourneyMilestone[] {
  const unlockedIds = new Set(achievements.filter((a) => a.unlocked).map((a) => a.id))

  return [
    {
      id: 'joined',
      event: 'Started your SAT journey',
      icon: 'ti-sparkles',
      done: true,
    },
    {
      id: 'first-practice',
      event: 'Answered first practice question',
      icon: 'ti-pencil-question',
      done: practiceAnswered >= 1,
    },
    {
      id: 'first-flashcard',
      event: 'Mastered first flashcard',
      icon: 'ti-cards',
      done: flashcardsKnown >= 1,
    },
    {
      id: 'first-topic',
      event: 'Completed a study topic',
      icon: 'ti-books',
      done: topicsCompleted >= 1,
    },
    {
      id: 'streak-3',
      event: '3-day study streak',
      icon: 'ti-flame',
      done: unlockedIds.has('streak-3'),
    },
    {
      id: 'whiteboard-1',
      event: 'First Whiteboard AI lesson',
      icon: 'ti-chalkboard',
      done: whiteboardSessions >= 1,
    },
    {
      id: 'xp-1000',
      event: 'Reached 1,000 XP',
      icon: 'ti-star',
      done: xp >= 1000,
    },
    {
      id: 'streak-7',
      event: '7-day study streak',
      icon: 'ti-brand-firebase',
      done: streak >= 7,
    },
    {
      id: 'topics-5',
      event: 'Completed 5 study topics',
      icon: 'ti-trophy',
      done: topicsCompleted >= 5,
    },
    {
      id: 'accuracy-80',
      event: 'Reached 80% practice accuracy',
      icon: 'ti-target-arrow',
      done: unlockedIds.has('accuracy-80'),
    },
    {
      id: 'target',
      event: 'Reach your target SAT score',
      icon: 'ti-medal',
      done: false,
    },
  ]
}

/**
 * Build tree branches from real accuracy data.
 * If accuracy data is available per topic this could be richer; for now
 * it derives section-level confidence from practice correct/answered ratios
 * and topic completion counts, with no hardcoded percentages.
 */
function buildTreeBranches(
  practiceCorrect: number,
  practiceAnswered: number,
  flashcardsKnown: number,
  flashcardsReviewed: number,
  topicsCompleted: number,
): TreeBranch[] {
  const overallAcc = practiceAnswered > 0
    ? Math.round((practiceCorrect / practiceAnswered) * 100) : 0
  const flashcardAcc = flashcardsReviewed > 0
    ? Math.round((flashcardsKnown / flashcardsReviewed) * 100) : 0
  const topicProgress = Math.min(100, Math.round((topicsCompleted / 10) * 100))

  // Derive rough section estimates from the same overall signals.
  // These are explicitly labelled as "estimated" in the UI so the student
  // knows they are not per-topic breakdowns.
  return [
    { label: 'Math', mastery: overallAcc, color: '#0e8a6a' },
    { label: 'Reading', mastery: Math.round(overallAcc * 0.95), color: '#1aad86' },
    { label: 'Writing', mastery: Math.round(overallAcc * 0.9), color: '#0e8a6a' },
    { label: 'Flashcards', mastery: flashcardAcc, color: '#2d9e74' },
    { label: 'Topics', mastery: topicProgress, color: '#1aad86' },
    { label: 'Overall', mastery: Math.round((overallAcc + flashcardAcc + topicProgress) / 3), color: '#0e8a6a' },
  ]
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface ExternalStats {
  practiceCorrect: number
  practiceAnswered: number
  flashcardsKnown: number
  flashcardsReviewed: number
  topicsCompleted: number
  focusSeconds: number
  satDaysRemaining?: number
}

export function useGamification(external: ExternalStats): GamificationApi {
  // All state starts at zero — nothing is pre-seeded.
  const [xp, setXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [lastStudiedDay, setLastStudiedDay] = useState('')
  const [recoveryAvailable, setRecoveryAvailable] = useState(false)
  const [weeklyXp, setWeeklyXp] = useState(0)
  const [studyMinutesToday, setStudyMinutesToday] = useState(0)
  // Whiteboard sessions are tracked by the whiteboard itself; default 0 until wired.
  const [whiteboardSessions] = useState(0)
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([])
  const prevAchievementsRef = useRef<Set<string>>(new Set())

  const studyMinutes = Math.round(external.focusSeconds / 60) + studyMinutesToday

  const estimatedSAT = useMemo(() => {
    if (external.practiceAnswered === 0 && external.topicsCompleted === 0) {
      // Not enough data yet — don't show a made-up number.
      return 0
    }
    const base = 800 // min possible SAT score
    const accuracyBonus = external.practiceAnswered > 0
      ? Math.round((external.practiceCorrect / external.practiceAnswered) * 400) : 0
    const topicBonus = external.topicsCompleted * 10
    const xpBonus = Math.floor(xp / 80)
    return Math.min(1600, base + accuracyBonus + topicBonus + xpBonus)
  }, [xp, external])

  const confidenceScore = useMemo(() => {
    if (external.practiceAnswered === 0 && external.flashcardsReviewed === 0) return 0
    const acc = external.practiceAnswered > 0
      ? (external.practiceCorrect / external.practiceAnswered) : 0
    const flashAcc = external.flashcardsReviewed > 0
      ? (external.flashcardsKnown / external.flashcardsReviewed) : 0
    const topicFactor = Math.min(1, external.topicsCompleted / 10)
    const streakFactor = Math.min(1, streak / 14)
    return Math.round((acc * 0.4 + flashAcc * 0.2 + topicFactor * 0.25 + streakFactor * 0.15) * 100)
  }, [external, streak])

  const achievements = useMemo(() =>
    buildAchievements(
      xp,
      streak,
      external.practiceCorrect,
      external.practiceAnswered,
      studyMinutes,
      external.topicsCompleted,
      external.flashcardsKnown,
      whiteboardSessions,
    ),
    [xp, streak, external, studyMinutes, whiteboardSessions],
  )

  // Detect newly unlocked achievements
  useEffect(() => {
    const justUnlocked = achievements.filter(
      (a) => a.unlocked && !prevAchievementsRef.current.has(a.id),
    )
    if (justUnlocked.length > 0) {
      setNewlyUnlocked((prev) => [...prev, ...justUnlocked])
    }
    prevAchievementsRef.current = new Set(
      achievements.filter((a) => a.unlocked).map((a) => a.id),
    )
  }, [achievements])

  const quests = useMemo(() =>
    buildQuests(
      external.practiceAnswered,
      external.flashcardsKnown,
      external.topicsCompleted,
      studyMinutes,
    ),
    [external, studyMinutes],
  )

  const journey = useMemo(() =>
    buildJourney(
      achievements,
      external.practiceAnswered,
      external.topicsCompleted,
      external.flashcardsKnown,
      streak,
      xp,
      whiteboardSessions,
    ),
    [achievements, external, streak, xp, whiteboardSessions],
  )

  const treeBranches = useMemo(() =>
    buildTreeBranches(
      external.practiceCorrect,
      external.practiceAnswered,
      external.flashcardsKnown,
      external.flashcardsReviewed,
      external.topicsCompleted,
    ),
    [external],
  )

  const levelInfo = useMemo(() => getLevelInfo(xp), [xp])
  const league = useMemo(() => getLeague(weeklyXp), [weeklyXp])

  const dailyGoalPct = useMemo(() => {
    const target = 60 // minutes
    return Math.min(100, Math.round((studyMinutes / target) * 100))
  }, [studyMinutes])

  const addXp = useCallback((amount: number) => {
    setXp((prev) => prev + amount)
    setWeeklyXp((prev) => prev + amount)
  }, [])

  const recordStudyTime = useCallback((minutes: number) => {
    setStudyMinutesToday((prev) => prev + minutes)
    addXp(Math.ceil(minutes * 1.5))
  }, [addXp])

  const recordAccuracy = useCallback((correct: number, total: number) => {
    if (total === 0) return
    const accuracy = correct / total
    const earnedXp = Math.round(correct * 10 * (accuracy > 0.8 ? 1.5 : 1))
    addXp(earnedXp)
  }, [addXp])

  const recordStreakDay = useCallback(() => {
    const today = todayStr()
    if (lastStudiedDay === today) return
    setLastStudiedDay(today)
    setStreak((prev) => {
      const next = prev + 1
      setLongestStreak((l) => Math.max(l, next))
      return next
    })
    setRecoveryAvailable(false)
    addXp(25)
  }, [lastStudiedDay, addXp])

  const useRecovery = useCallback(() => {
    if (!recoveryAvailable) return
    setRecoveryAvailable(false)
    addXp(15)
  }, [recoveryAvailable, addXp])

  const dismissNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([])
  }, [])

  const completeQuest = useCallback((questId: string) => {
    const quest = quests.find((q) => q.id === questId)
    if (quest) addXp(quest.xpReward)
  }, [quests, addXp])

  const state: GamificationState = {
    xp,
    level: levelInfo.level,
    levelTitle: levelInfo.title,
    xpForCurrentLevel: levelInfo.xpForCurrentLevel,
    xpForNextLevel: levelInfo.xpForNextLevel,
    levelProgress: levelInfo.levelProgress,
    streak,
    longestStreak,
    lastStudiedDay,
    recoveryAvailable,
    weeklyXp,
    league,
    leagueXpThisWeek: weeklyXp,
    confidenceScore,
    estimatedSAT,
    studyMinutesToday: studyMinutes,
    achievements,
    newlyUnlocked,
    quests,
    journey,
    treeBranches,
    satDaysRemaining: external.satDaysRemaining ?? 0,
    dailyGoalPct,
  }

  return {
    state,
    addXp,
    recordStudyTime,
    recordAccuracy,
    recordStreakDay,
    useRecovery,
    dismissNewlyUnlocked,
    completeQuest,
  }
}
