'use client'

import { useCallback, useState } from 'react'
import type {
  DashboardView,
  DiagnosticRecord,
  PlanResponse,
  PlanTopic,
  TriageData,
} from '@/lib/sat-types'
import { getPanicTheme } from '@/lib/theme'
import { deriveTimes } from '@/lib/time-utils'
import { useCountdown, useTimeZone } from '@/lib/use-countdown'
import type { StatsApi } from '@/lib/use-stats'
import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'
import { MobileNav } from './mobile-nav'
import { DashboardTour } from './dashboard-tour'
import { HomeView } from './home-view'
import { PracticeView } from './practice-view'
import { MockTestView } from './mock-test-view'
import { FlashcardsView } from './flashcards-view'
import { ProgressView } from './progress-view'
import { StudyPlan } from '../study-plan'
import { Checklist } from '../checklist'
import { MorningMode } from '../morning-mode'
import { PostDiagnostic } from '../post-diagnostic'
import { ScanQuestionModal } from './scan-question-modal'
import { AchievementsView, AchievementToast } from './achievements-view'
import { BrainView } from './brain-view'
import { CommunityView } from './community-view'
import { useGamification } from '@/lib/use-gamification'

interface DashboardProps {
  triage: TriageData
  response: PlanResponse
  topics: PlanTopic[]
  completed: Set<string>
  statsApi: StatsApi
  voiceEnabled: boolean
  speak: (text: string) => void
  onComplete: (topicName: string, confident: boolean) => void
  onReorder: (index: number, dir: -1 | 1) => void
  onActiveStep: (text: string) => void
  /** The original pre-plan diagnostic, used as the comparison baseline. */
  preDiagnostic: DiagnosticRecord | null
  /** The most recent post-plan diagnostic, if any. */
  postDiagnostic: DiagnosticRecord | null
  /** Persist a completed post-plan diagnostic. */
  onSavePostDiagnostic: (record: DiagnosticRecord) => void
  /** Rebuild the study plan from a diagnostic record. */
  onRebuildPlan: (record: DiagnosticRecord) => void
}

const VIEW_TITLES: Record<DashboardView, { title: string; sub: string }> = {
  home: { title: 'Dashboard', sub: 'Your command center for tonight' },
  plan: { title: 'Study Plan', sub: 'Highest-impact topics first' },
  practice: { title: 'Practice Drills', sub: 'Target your weak areas' },
  mocktest: { title: 'Mock Tests', sub: 'Full-length SAT-style practice tests' },
  flashcards: { title: 'Flashcards', sub: 'Quick recall review' },
  progress: { title: 'Progress', sub: 'Track what you have done' },
  achievements: { title: 'Achievements', sub: 'XP, badges, quests, leagues & your journey' },
  brain: { title: 'AI Learning Brain\u2122', sub: 'Your personalized learning intelligence' },
  community: { title: 'Community Question Bank', sub: 'Discover, create, and share SAT questions' },
  checklist: { title: 'Night Checklist', sub: 'Prep for test day' },
  morning: { title: 'Morning Mode', sub: 'Your test-day warm-up' },
  asktutor: { title: 'Ask AI Tutor', sub: 'Snap a question and get a Socratic walkthrough' },
}

export function Dashboard({
  triage,
  response,
  topics,
  completed,
  statsApi,
  voiceEnabled,
  speak,
  onComplete,
  onReorder,
  onActiveStep,
  preDiagnostic,
  postDiagnostic,
  onSavePostDiagnostic,
  onRebuildPlan,
}: DashboardProps) {
  const [view, setView] = useState<DashboardView>('home')
  // Full-screen post-plan progress check overlay.
  const [postDiagnosticOpen, setPostDiagnosticOpen] = useState(false)
  // The interactive product tour auto-starts the first time the dashboard loads.
  const [tourActive, setTourActive] = useState(true)
  const finishTour = useCallback(() => setTourActive(false), [])
  const theme = getPanicTheme(triage.panic)

  // Gamification system
  const gamificationApi = useGamification({
    practiceCorrect: statsApi.stats.practiceCorrect,
    practiceAnswered: statsApi.stats.practiceAnswered,
    flashcardsKnown: statsApi.stats.flashcardsKnown,
    flashcardsReviewed: statsApi.stats.flashcardsReviewed,
    topicsCompleted: statsApi.stats.topicsCompleted,
    focusSeconds: statsApi.stats.focusSeconds,
  })
  const countdown = useCountdown(triage.testStartTime)
  const timeZone = useTimeZone()
  const times = deriveTimes(triage.testStartTime)
  const sleepLabel = times?.sleepDeadlineLabel ?? '11:00 PM'
  const wakeLabel = times?.wakeUpLabel ?? '7:00 AM'
  const tzSuffix = timeZone ? ` · ${timeZone.label}` : ''
  const sprint = triage.timeBudget === 'sprint'

  const meta = VIEW_TITLES[view]
  const centeredView =
    view === 'practice' ||
    view === 'flashcards'

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar
        active={view}
        onNavigate={setView}
        theme={theme}
        countdownLabel={countdown}
        countdownSub={`Wake ${wakeLabel} · Sleep by ${sleepLabel}${tzSuffix}`}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-card/80 pl-4 pr-20 backdrop-blur sm:pl-6 sm:pr-24">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-foreground">{meta.title}</h1>
            <p className="truncate text-xs text-muted-foreground">{meta.sub}</p>
          </div>
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5',
              theme.accentBgSoft,
            )}
          >
            <i className={cn('ti ti-clock-hour-3', theme.accentText)} aria-hidden="true" />
            <span className={cn('text-sm font-bold tabular-nums', theme.accentText)}>
              {countdown}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 pb-24 sm:px-6 lg:pb-6">
          <div
            className={cn(
              'mx-auto flex w-full max-w-5xl flex-col',
              centeredView && 'min-h-[calc(100dvh-8rem)] justify-center',
            )}
          >
            {view === 'home' && (
              <HomeView
                triage={triage}
                response={response}
                stats={statsApi.stats}
                theme={theme}
                countdownLabel={countdown}
                sleepLabel={sleepLabel}
                wakeLabel={wakeLabel}
                timeZoneLabel={timeZone?.label ?? null}
                onNavigate={setView}
                gamification={gamificationApi.state}
              />
            )}

            {view === 'plan' && (
              <StudyPlan
                response={response}
                triage={triage}
                topics={topics}
                completed={completed}
                sprint={sprint}
                voiceEnabled={voiceEnabled}
                speak={speak}
                onComplete={onComplete}
                onReorder={onReorder}
                onActiveStep={onActiveStep}
                onContinue={() => setView('checklist')}
              />
            )}

            {view === 'practice' && (
              <PracticeView
                triage={triage}
                theme={theme}
                onAnswer={(section, correct) => {
                  statsApi.recordPractice(section, correct)
                  gamificationApi.recordPracticeAnswer()
                }}
              />
            )}

            {view === 'mocktest' && (
              <MockTestView
                theme={theme}
                onAnswer={(section, correct) => {
                  statsApi.recordPractice(section, correct)
                  gamificationApi.recordPracticeAnswer()
                }}
              />
            )}

            {view === 'flashcards' && (
              <FlashcardsView
                theme={theme}
                onReview={(known) => {
                  statsApi.recordFlashcard(known)
                  gamificationApi.recordFlashcardReview(known)
                }}
                weakAreas={triage.weakAreas}
              />
            )}

            {view === 'progress' && (
              <ProgressView stats={statsApi.stats} theme={theme} />
            )}

            {view === 'achievements' && (
              <AchievementsView api={gamificationApi} />
            )}

            {view === 'brain' && (
              <BrainView
                stats={statsApi.stats}
                gamification={gamificationApi.state}
                triage={triage}
              />
            )}

            {view === 'community' && (
              <CommunityView
                weakAreas={triage.weakAreas}
                stats={statsApi.stats}
              />
            )}

            {view === 'checklist' && (
              <Checklist
                triage={triage}
                topics={topics}
                completedTopics={completed}
                onContinue={() => setView('morning')}
                onStartPostDiagnostic={() => setPostDiagnosticOpen(true)}
                hasPostDiagnostic={!!postDiagnostic}
              />
            )}

            {view === 'morning' && (
              <MorningMode plan={response.plan} triage={triage} />
            )}

            {view === 'asktutor' && (
              <ScanQuestionModal theme={theme} />
            )}

          </div>
        </main>
      </div>

      <MobileNav active={view} onNavigate={setView} theme={theme} />

      {/* Achievement unlock toasts */}
      {gamificationApi.state.newlyUnlocked.length > 0 && (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 lg:bottom-6 lg:right-6 pointer-events-none">
          {gamificationApi.state.newlyUnlocked.map((achievement) => (
            <AchievementToast
              key={achievement.id}
              achievement={achievement}
              onDismiss={gamificationApi.dismissNewlyUnlocked}
            />
          ))}
        </div>
      )}

      {tourActive && <DashboardTour onNavigate={setView} onFinish={finishTour} />}

      {postDiagnosticOpen && (
        <PostDiagnostic
          pre={preDiagnostic}
          triage={triage}
          theme={theme}
          onClose={() => setPostDiagnosticOpen(false)}
          onSaved={onSavePostDiagnostic}
          onRebuildPlan={(record) => {
            // Close the overlay first, then defer one tick so it fully
            // unmounts before generatePlan transitions the screen to 'loading'.
            setPostDiagnosticOpen(false)
            setTimeout(() => onRebuildPlan(record), 0)
          }}
        />
      )}
    </div>
  )
}
