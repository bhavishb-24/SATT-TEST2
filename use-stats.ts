'use client'

import { useCallback, useMemo, useState } from 'react'
import type { AppStats } from '@/lib/sat-types'

const INITIAL_STATS: AppStats = {
  topicsCompleted: 0,
  topicsTotal: 0,
  practiceAnswered: 0,
  practiceCorrect: 0,
  flashcardsReviewed: 0,
  flashcardsKnown: 0,
  focusSessions: 0,
  focusSeconds: 0,
  sectionStats: {},
}

export interface StatsApi {
  stats: AppStats
  recordPractice: (section: string, correct: boolean) => void
  recordFlashcard: (known: boolean) => void
  recordFocusSession: (seconds: number) => void
  setTopicProgress: (completed: number, total: number) => void
}

export function useStats(): StatsApi {
  const [stats, setStats] = useState<AppStats>(INITIAL_STATS)

  const recordPractice = useCallback((section: string, correct: boolean) => {
    setStats((prev) => {
      const existing = prev.sectionStats[section] ?? { answered: 0, correct: 0 }
      return {
        ...prev,
        practiceAnswered: prev.practiceAnswered + 1,
        practiceCorrect: prev.practiceCorrect + (correct ? 1 : 0),
        sectionStats: {
          ...prev.sectionStats,
          [section]: {
            answered: existing.answered + 1,
            correct: existing.correct + (correct ? 1 : 0),
          },
        },
      }
    })
  }, [])

  const recordFlashcard = useCallback((known: boolean) => {
    setStats((prev) => ({
      ...prev,
      flashcardsReviewed: prev.flashcardsReviewed + 1,
      flashcardsKnown: prev.flashcardsKnown + (known ? 1 : 0),
    }))
  }, [])

  const recordFocusSession = useCallback((seconds: number) => {
    setStats((prev) => ({
      ...prev,
      focusSessions: prev.focusSessions + 1,
      focusSeconds: prev.focusSeconds + seconds,
    }))
  }, [])

  const setTopicProgress = useCallback((completed: number, total: number) => {
    setStats((prev) => {
      if (prev.topicsCompleted === completed && prev.topicsTotal === total) {
        return prev
      }
      return { ...prev, topicsCompleted: completed, topicsTotal: total }
    })
  }, [])

  return useMemo(
    () => ({
      stats,
      recordPractice,
      recordFlashcard,
      recordFocusSession,
      setTopicProgress,
    }),
    [stats, recordPractice, recordFlashcard, recordFocusSession, setTopicProgress],
  )
}
