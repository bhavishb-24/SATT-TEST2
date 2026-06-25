'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useVoice } from '@/lib/use-voice'
import { useNarration } from '@/lib/use-narration'
import { cn } from '@/lib/utils'
import { Confetti } from '@/components/sat/confetti'
import { BoardCanvas } from './board-canvas'
import { TutorPanel, type ChatMessage } from './tutor-panel'
import { VoiceOverlay } from './voice-overlay'
import { SessionSummary } from './session-summary'
import {
  DEFAULT_PERSONA,
  OPENING_MESSAGES,
  PERSONAS,
  QUESTION,
  STEP_NARRATION,
  TEACH_STAGES,
  type MemoryItem,
  type PersonaKey,
  type PracticeProblem,
  type PracticeFeedback,
  type SmartAction,
} from './lesson-data'

const TOTAL_STEPS = STEP_NARRATION.length // 9
const TOTAL_HINTS = 4

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function WhiteboardAi() {
  const voice = useVoice()
  const narration = useNarration()

  const [aiStep, setAiStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([...OPENING_MESSAGES])
  const [thinking, setThinking] = useState(false)
  const [stageIndex, setStageIndex] = useState(-1) // -1 = not started
  const [mastered, setMastered] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)

  // Live AI-generated narration lines for the current question (one per ink
  // step). Falls back to the scripted STEP_NARRATION until they load.
  const [aiLines, setAiLines] = useState<string[]>(STEP_NARRATION)
  const aiLinesRef = useRef<string[]>(STEP_NARRATION)
  aiLinesRef.current = aiLines
  const lineFor = useCallback(
    (stepIndex: number) => aiLinesRef.current[stepIndex] ?? STEP_NARRATION[stepIndex] ?? '',
    [],
  )

  // Dynamic memory: events recorded as the student works this session.
  const [memoryEvents, setMemoryEvents] = useState<MemoryItem[]>([])
  const recordMemory = useCallback((item: MemoryItem) => {
    setMemoryEvents((prev) => {
      if (prev.some((p) => p.text === item.text)) return prev
      return [item, ...prev].slice(0, 8)
    })
  }, [])

  // Personality mode
  const [persona, setPersona] = useState<PersonaKey>(DEFAULT_PERSONA)
  const personaRef = useRef<PersonaKey>(persona)
  personaRef.current = persona

  // Hints
  const [hintLevel, setHintLevel] = useState(0)
  const [hintLoading, setHintLoading] = useState(false)

  // Practice mode ("Your Turn")
  const [practice, setPractice] = useState<PracticeProblem | null>(null)
  const [practiceLoading, setPracticeLoading] = useState(false)
  const [checkingPractice, setCheckingPractice] = useState(false)
  const [practiceFeedback, setPracticeFeedback] = useState<PracticeFeedback | null>(null)

  // Voice mode
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [voiceStarted, setVoiceStarted] = useState(false)
  const [voiceSpeaking, setVoiceSpeaking] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')

  const aiStepRef = useRef(0)
  const playToken = useRef(0)
  aiStepRef.current = aiStep

  const messagesRef = useRef<ChatMessage[]>(messages)
  messagesRef.current = messages

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg])
  }, [])

  // Generic: stream a text route into a new assistant bubble, then narrate it.
  const streamAssistant = useCallback(
    async (url: string, body: Record<string, unknown>): Promise<string> => {
      setThinking(true)
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok || !res.body) throw new Error(`Request failed: ${res.status}`)

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let started = false
        let full = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          if (!chunk) continue
          full += chunk
          if (!started) {
            started = true
            setThinking(false)
            setMessages((prev) => [...prev, { role: 'assistant', content: full }])
          } else {
            setMessages((prev) => {
              const next = [...prev]
              next[next.length - 1] = { role: 'assistant', content: full }
              return next
            })
          }
        }

        setThinking(false)
        if (started) {
          void narration.narrate(full)
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: "I\u2019m here — could you rephrase that? Let\u2019s keep working through it together.",
            },
          ])
        }
        return full
      } catch (err) {
        console.log('[v0] stream error:', err)
        setThinking(false)
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              "I had trouble reaching my brain just now. Give it another try in a moment, and we\u2019ll keep going.",
          },
        ])
        return ''
      }
    },
    [narration],
  )

  const streamTutorReply = useCallback(
    (history: ChatMessage[]) =>
      streamAssistant('/api/whiteboard-tutor', {
        messages: history.map((m) => ({ role: m.role, content: m.content })),
        question: QUESTION,
        persona: personaRef.current,
      }),
    [streamAssistant],
  )

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
        const line = lineFor(s - 1)
        if (opts?.voice) {
          setVoiceTranscript(line)
          setVoiceSpeaking(true)
          const spoke = await narration.narrate(line)
          if (playToken.current !== token) return
          setVoiceSpeaking(false)
          if (!spoke) await wait(2200)
          else await wait(350)
        } else {
          void narration.narrate(line)
          await wait(950)
        }
      }
      if (playToken.current === token) {
        setIsPlaying(false)
        setVoiceSpeaking(false)
      }
    },
    [narration],
  )

  const cancelPlayback = useCallback(() => {
    playToken.current++
    setIsPlaying(false)
    setVoiceSpeaking(false)
    narration.stop()
  }, [narration])

  // Deliver a teaching stage: AI message + reveal the matching ink steps.
  const deliverStage = useCallback(
    async (i: number) => {
      const stage = TEACH_STAGES[i]
      if (!stage) return
      setThinking(true)
      await wait(650)
      setThinking(false)
      addMessage({ role: 'assistant', content: stage.message })
      void narration.narrate(stage.message)
      await runReveal(stage.reveal)
      if (stage.mastery) {
        setMastered(true)
        setConfetti(true)
        setTimeout(() => setConfetti(false), 4500)
        setTimeout(() => setSummaryOpen(true), 1200)
      }
    },
    [addMessage, runReveal, narration],
  )

  // Fetch live AI narration for the current question, then auto-play the whole
  // lesson — revealing each ink step while the voice talks through it.
  const autoStarted = useRef(false)
  const autoPlayLesson = useCallback(async () => {
    setThinking(true)
    let lines = STEP_NARRATION
    try {
      const res = await fetch('/api/whiteboard-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'narrate',
          persona: personaRef.current,
          question: QUESTION,
          steps: TOTAL_STEPS,
        }),
      })
      if (res.ok) {
        const data = (await res.json()) as { lines?: string[] }
        if (Array.isArray(data.lines) && data.lines.length >= 3) {
          lines = data.lines
          setAiLines(data.lines)
          aiLinesRef.current = data.lines
        }
      }
    } catch (err) {
      console.log('[v0] narrate fetch error:', err)
    }

    setThinking(false)
    const intro =
      "Let's work through question 14 together. I'll draw it out step by step on the board — watch and listen along."
    addMessage({ role: 'assistant', content: intro })
    await narration.narrate(intro)

    // Auto-play every step with synced voice narration.
    await runReveal(TOTAL_STEPS, { voice: true, from: 0 })

    // Wrap up: mastery celebration + record what was covered.
    setMastered(true)
    setConfetti(true)
    setTimeout(() => setConfetti(false), 4500)
    recordMemory({
      icon: 'ti-circle-check',
      text: `Worked through Q${QUESTION.number}: ${QUESTION.section}`,
      tone: 'good',
    })
    const closing = lines[lines.length - 1] ?? 'Great work following along!'
    addMessage({
      role: 'assistant',
      content: `That's the full solution. ${closing} Want to try one yourself? Tap **Your Turn**.`,
    })
    setTimeout(() => setSummaryOpen(true), 1400)
  }, [addMessage, narration, runReveal, recordMemory])

  // Kick off auto-play once on mount.
  useEffect(() => {
    if (autoStarted.current) return
    autoStarted.current = true
    // The lesson now auto-plays end-to-end, so the manual hint-ladder advance
    // button stays hidden (autoplay covers every step).
    setStageIndex(TEACH_STAGES.length - 1)
    void autoPlayLesson()
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
      const studentMsg: ChatMessage = { role: 'student', content: text }
      const history = [...messagesRef.current, studentMsg]
      setMessages(history)
      recordMemory({ icon: 'ti-message-2', text: `Asked: "${text.slice(0, 40)}${text.length > 40 ? '…' : ''}"`, tone: 'good' })
      void streamTutorReply(history)
    },
    [streamTutorReply, recordMemory],
  )

  // Clear the conversation so the student can start a fresh chat.
  const handleClearChat = useCallback(() => {
    cancelPlayback()
    setThinking(false)
    setMessages([
      {
        role: 'assistant',
        content:
          "Chat cleared. I'm still right here — ask me anything about this problem, or tap a step on the board to revisit it.",
      },
    ])
  }, [cancelPlayback])

  // Escalating live hint.
  const handleHint = useCallback(async () => {
    if (hintLoading) return
    const level = Math.min(hintLevel + 1, TOTAL_HINTS)
    setHintLevel(level)
    setHintLoading(true)
    addMessage({ role: 'student', content: 'Give me a hint.' })
    if (level >= 3) {
      recordMemory({ icon: 'ti-bulb', text: 'Needed several hints on this concept', tone: 'watch' })
    }
    await streamAssistant('/api/whiteboard-coach', {
      mode: 'hint',
      persona: personaRef.current,
      question: QUESTION,
      hintLevel: level,
      totalHints: TOTAL_HINTS,
    })
    setHintLoading(false)
  }, [hintLevel, hintLoading, addMessage, streamAssistant, recordMemory])

  // "Why?" — explain why a given assistant message / step works.
  const handleWhy = useCallback(
    async (text: string) => {
      addMessage({ role: 'student', content: 'Why does that work?' })
      await streamAssistant('/api/whiteboard-coach', {
        mode: 'why',
        persona: personaRef.current,
        question: QUESTION,
        step: text,
      })
    },
    [addMessage, streamAssistant],
  )

  // Practice mode.
  const handleStartPractice = useCallback(async () => {
    setPracticeLoading(true)
    setPracticeFeedback(null)
    setPractice(null)
    try {
      const res = await fetch('/api/whiteboard-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'practice', persona: personaRef.current, question: QUESTION }),
      })
      if (!res.ok) throw new Error(`practice failed: ${res.status}`)
      const data = (await res.json()) as PracticeProblem
      setPractice(data)
    } catch (err) {
      console.log('[v0] practice error:', err)
      addMessage({
        role: 'assistant',
        content: 'I couldn\u2019t build a practice problem just now — try again in a moment.',
      })
    } finally {
      setPracticeLoading(false)
    }
  }, [addMessage])

  const handleCheckPractice = useCallback(
    async (answer: string) => {
      if (!practice) return
      setCheckingPractice(true)
      setPracticeFeedback(null)
      try {
        const res = await fetch('/api/whiteboard-coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'check',
            persona: personaRef.current,
            practicePrompt: practice.prompt,
            expectedAnswer: practice.answer,
            studentAnswer: answer,
          }),
        })
        if (!res.ok) throw new Error(`check failed: ${res.status}`)
        const data = (await res.json()) as PracticeFeedback
        setPracticeFeedback(data)
        recordMemory(
          data.correct
            ? { icon: 'ti-trophy', text: 'Solved a practice problem correctly', tone: 'good' }
            : { icon: 'ti-alert-triangle', text: 'Missed a practice problem — review this', tone: 'watch' },
        )
        void narration.narrate(data.feedback)
      } catch (err) {
        console.log('[v0] check error:', err)
        setPracticeFeedback({
          correct: false,
          feedback: 'I had trouble checking that — give it another try in a moment.',
        })
      } finally {
        setCheckingPractice(false)
      }
    },
    [practice, narration, recordMemory],
  )

  const handleClosePractice = useCallback(() => {
    setPractice(null)
    setPracticeFeedback(null)
  }, [])

  const handleSmartAction = useCallback(
    (action: SmartAction) => {
      if (action.label === 'Give me a hint') {
        void handleHint()
        return
      }
      addMessage({ role: 'student', content: action.label })
      setThinking(true)
      setTimeout(() => {
        setThinking(false)
        addMessage({ role: 'assistant', content: action.reply })
        void narration.narrate(action.reply)
        if (action.label === 'Explain visually') {
          runReveal(TOTAL_STEPS, { from: 0 })
        }
      }, 800)
    },
    [addMessage, runReveal, narration, handleHint],
  )

  // Playback controls.
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      cancelPlayback()
    } else if (aiStepRef.current >= TOTAL_STEPS) {
      runReveal(TOTAL_STEPS, { from: 0 })
    } else {
      runReveal(TOTAL_STEPS)
    }
  }, [isPlaying, cancelPlayback, runReveal])

  const handleStepTo = useCallback(
    (n: number) => {
      cancelPlayback()
      const clamped = Math.max(0, Math.min(TOTAL_STEPS, n))
      setAiStep(clamped)
      aiStepRef.current = clamped
      if (clamped > 0) void narration.narrate(lineFor(clamped - 1))
    },
    [cancelPlayback, narration, lineFor],
  )

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
              <i className="ti ti-chalkboard text-lg" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold leading-tight text-foreground">Whiteboard AI</p>
              <p className="text-[11px] text-muted-foreground">Visual SAT tutoring</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PersonaPicker value={persona} onChange={setPersona} />
          <button
            type="button"
            onClick={narration.toggleMuted}
            aria-pressed={!narration.muted}
            title={narration.muted ? 'Unmute narration' : 'Mute narration'}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl border transition-colors',
              narration.muted
                ? 'border-border bg-background text-muted-foreground hover:bg-muted'
                : 'border-primary bg-primary/10 text-primary',
            )}
          >
            <i
              className={cn(
                'ti text-base',
                narration.muted ? 'ti-volume-off' : 'ti-volume',
                narration.speaking && !narration.muted && 'animate-pulse',
              )}
              aria-hidden="true"
            />
          </button>
        </div>
      </header>

      {/* Split layout */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Left — whiteboard (70%) */}
        <div className="relative min-h-[45dvh] flex-1 p-3 lg:min-h-0 lg:p-4">
          <BoardCanvas
            aiStep={aiStep}
            isPlaying={isPlaying}
            totalSteps={TOTAL_STEPS}
            onAskAiDraw={handleAskAiDraw}
            onTogglePlay={handleTogglePlay}
            onStepTo={handleStepTo}
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
            memoryEvents={memoryEvents}
            onClearChat={handleClearChat}
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
            onWhy={handleWhy}
            onHint={handleHint}
            hintLoading={hintLoading}
            practice={practice}
            practiceLoading={practiceLoading}
            checkingPractice={checkingPractice}
            practiceFeedback={practiceFeedback}
            onStartPractice={handleStartPractice}
            onCheckPractice={handleCheckPractice}
            onClosePractice={handleClosePractice}
          />
        </div>
      </div>

      {voiceOpen && (
        <VoiceOverlay
          onClose={() => {
            cancelPlayback()
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

function PersonaPicker({
  value,
  onChange,
}: {
  value: PersonaKey
  onChange: (key: PersonaKey) => void
}) {
  const [open, setOpen] = useState(false)
  const current = PERSONAS.find((p) => p.key === value) ?? PERSONAS[0]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Tutor personality"
      >
        <i className={cn('ti', current.icon, 'text-sm text-primary')} aria-hidden="true" />
        <span className="hidden sm:inline">{current.label}</span>
        <i className="ti ti-chevron-down text-xs text-muted-foreground" aria-hidden="true" />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            className="absolute right-0 top-full z-50 mt-1.5 w-56 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-lg"
          >
            {PERSONAS.map((p) => (
              <li key={p.key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={p.key === value}
                  onClick={() => {
                    onChange(p.key)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
                    p.key === value ? 'bg-primary/10' : 'hover:bg-muted',
                  )}
                >
                  <i
                    className={cn(
                      'ti',
                      p.icon,
                      'mt-0.5 text-base',
                      p.key === value ? 'text-primary' : 'text-muted-foreground',
                    )}
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{p.label}</span>
                    <span className="block text-[11px] text-muted-foreground">{p.tagline}</span>
                  </span>
                  {p.key === value && (
                    <i className="ti ti-check ml-auto mt-0.5 text-sm text-primary" aria-hidden="true" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
