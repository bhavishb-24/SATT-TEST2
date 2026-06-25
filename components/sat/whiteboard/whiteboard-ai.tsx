'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useVoice } from '@/lib/use-voice'
import { Confetti } from '@/components/sat/confetti'
import { BoardCanvas } from './board-canvas'
import { TutorPanel, type ChatMessage } from './tutor-panel'
import { VoiceOverlay } from './voice-overlay'
import { SessionSummary } from './session-summary'
import {
  OPENING_MESSAGES,
  STEP_NARRATION,
  TEACH_STAGES,
  type SmartAction,
} from './lesson-data'

const TOTAL_STEPS = STEP_NARRATION.length // 9

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function WhiteboardAi() {
  const voice = useVoice()

  const [aiStep, setAiStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([...OPENING_MESSAGES])
  const [thinking, setThinking] = useState(false)
  const [stageIndex, setStageIndex] = useState(-1) // -1 = not started
  const [mastered, setMastered] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)

  // Voice mode
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [voiceStarted, setVoiceStarted] = useState(false)
  const [voiceSpeaking, setVoiceSpeaking] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')

  const aiStepRef = useRef(0)
  const playToken = useRef(0)
  aiStepRef.current = aiStep

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg])
  }, [])

  // Animate the board from its current step up to `target`, narrating each step.
  const runReveal = useCallback(
    async (target: number, opts?: { voice?: boolean; from?: number }) => {
      const token = ++playToken.current
      const start = opts?.from ?? aiStepRef.current
      if (opts?.from !== undefined) {
        setAiStep(opts.from)
        aiStepRef.current = opts.from
        await wait(120)
      }
      setIsPlaying(true)
      for (let s = start + 1; s <= target; s++) {
        if (playToken.current !== token) return
        setAiStep(s)
        aiStepRef.current = s
        const line = STEP_NARRATION[s - 1]
        if (opts?.voice) {
          setVoiceTranscript(line)
          setVoiceSpeaking(true)
          voice.speak(line, { force: true })
        } else if (voice.enabled) {
          voice.speak(line)
        }
        await wait(opts?.voice ? 2700 : 950)
      }
      if (playToken.current === token) {
        setIsPlaying(false)
        setVoiceSpeaking(false)
      }
    },
    [voice],
  )

  // Deliver a teaching stage: AI message + reveal the matching ink steps.
  const deliverStage = useCallback(
    async (i: number) => {
      const stage = TEACH_STAGES[i]
      if (!stage) return
      setThinking(true)
      await wait(650)
      setThinking(false)
      addMessage({ role: 'assistant', content: stage.message })
      await runReveal(stage.reveal)
      if (stage.mastery) {
        setMastered(true)
        setConfetti(true)
        setTimeout(() => setConfetti(false), 4500)
        setTimeout(() => setSummaryOpen(true), 1200)
      }
    },
    [addMessage, runReveal],
  )

  // Kick off the first stage on mount.
  useEffect(() => {
    setStageIndex(0)
    deliverStage(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const advanceLabel =
    stageIndex >= 0 && stageIndex < TEACH_STAGES.length - 1
      ? TEACH_STAGES[stageIndex].nextLabel
      : null

  const handleAdvance = useCallback(() => {
    if (stageIndex < 0 || stageIndex >= TEACH_STAGES.length - 1) return
    const studentLine = TEACH_STAGES[stageIndex].nextLabel.replace(/&apos;/g, '\u2019')
    addMessage({ role: 'student', content: studentLine })
    const next = stageIndex + 1
    setStageIndex(next)
    deliverStage(next)
  }, [stageIndex, addMessage, deliverStage])

  const handleSend = useCallback(
    (text: string) => {
      addMessage({ role: 'student', content: text })
      setThinking(true)
      setTimeout(() => {
        setThinking(false)
        addMessage({
          role: 'assistant',
          content:
            'Good question. Keep going with the hint below — once you spot the right triangle, the Pythagorean theorem does the rest. I\u2019m drawing it out for you on the board.',
        })
      }, 900)
    },
    [addMessage],
  )

  const handleSmartAction = useCallback(
    (action: SmartAction) => {
      addMessage({ role: 'student', content: action.label })
      setThinking(true)
      setTimeout(() => {
        setThinking(false)
        addMessage({ role: 'assistant', content: action.reply })
        if (action.label === 'Explain visually') {
          runReveal(TOTAL_STEPS, { from: 0 })
        }
      }, 800)
    },
    [addMessage, runReveal],
  )

  const handleReplay = useCallback(() => {
    runReveal(TOTAL_STEPS, { from: 0 })
  }, [runReveal])

  const handleAskAiDraw = useCallback(() => {
    addMessage({ role: 'assistant', content: 'Sure — let me draw the diagram step by step.' })
    runReveal(TOTAL_STEPS, { from: 0 })
  }, [addMessage, runReveal])

  const handleStartVoiceLesson = useCallback(() => {
    setVoiceStarted(true)
    runReveal(TOTAL_STEPS, { voice: true, from: 0 })
  }, [runReveal])

  const handleUpload = useCallback(() => {
    addMessage({ role: 'student', content: '📎 Uploaded a new SAT question.' })
    setThinking(true)
    setTimeout(() => {
      setThinking(false)
      addMessage({
        role: 'assistant',
        content: 'Got it — I can see the question. Let\u2019s work through it together on the board.',
      })
    }, 900)
  }, [addMessage])

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Back to dashboard"
          >
            <i className="ti ti-arrow-left text-lg" aria-hidden="true" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <i className="ti ti-blackboard text-lg" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold leading-tight text-foreground">Whiteboard AI</p>
              <p className="text-[11px] text-muted-foreground">Visual SAT tutoring</p>
            </div>
          </div>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:flex">
          <i className="ti ti-sparkles" aria-hidden="true" />
          Powered by SAT Sage
        </span>
      </header>

      {/* Split layout */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Left — whiteboard (70%) */}
        <div className="relative min-h-[45dvh] flex-1 p-3 lg:min-h-0 lg:p-4">
          <BoardCanvas
            aiStep={aiStep}
            isPlaying={isPlaying}
            onReplay={handleReplay}
            onAskAiDraw={handleAskAiDraw}
          />
          {confetti && <Confetti count={80} />}
        </div>

        {/* Right — tutor panel (30%) */}
        <div className="flex min-h-0 shrink-0 flex-col border-t border-border lg:w-[30%] lg:max-w-md lg:border-l lg:border-t-0">
          <TutorPanel
            messages={messages}
            thinking={thinking}
            advanceLabel={advanceLabel}
            onAdvance={handleAdvance}
            mastered={mastered}
            onSend={handleSend}
            onSmartAction={handleSmartAction}
            onStartVoice={() => {
              setVoiceOpen(true)
              setVoiceStarted(false)
              setVoiceTranscript('')
            }}
            onUpload={handleUpload}
            onOpenSummary={() => setSummaryOpen(true)}
            micActive={voice.enabled}
            onToggleMic={voice.toggle}
          />
        </div>
      </div>

      {voiceOpen && (
        <VoiceOverlay
          onClose={() => {
            playToken.current++ // cancel any running narration
            voice.stopSpeaking()
            setVoiceSpeaking(false)
            setVoiceOpen(false)
          }}
          onStartLesson={handleStartVoiceLesson}
          transcript={voiceTranscript}
          speaking={voiceSpeaking}
          started={voiceStarted}
        />
      )}

      {summaryOpen && <SessionSummary onClose={() => setSummaryOpen(false)} />}
    </div>
  )
}
