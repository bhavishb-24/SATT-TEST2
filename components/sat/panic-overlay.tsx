'use client'

import { useState } from 'react'
import { BreathingAnimation } from './breathing-animation'

const REALITY_CHECKS = [
  'The SAT is just one test. It does not define you.',
  'Colleges look at more than one number.',
  'You are more prepared than you think.',
  'Thousands of students feel exactly this way right now.',
  'One focused hour beats five hours of panicking.',
]

function talkResponse(text: string): string {
  const t = text.toLowerCase()
  if (t.includes('fail') || t.includes("can't") || t.includes('cant'))
    return 'You haven’t failed anything yet. Right now you’re doing the right thing by preparing. That counts.'
  if (t.includes('time') || t.includes('enough'))
    return 'You have more time than it feels like. Focused beats frantic every single time.'
  if (t.includes('stupid') || t.includes('dumb'))
    return 'You’re not. You’re a student under pressure doing something hard. That’s completely different.'
  return 'Whatever you’re feeling is valid. Take one breath, then one step. That’s all that’s needed right now.'
}

type Tool = 'menu' | 'breathe' | 'reality' | 'talk'

export function PanicOverlay({
  onClose,
  speak,
  voiceEnabled,
}: {
  onClose: () => void
  speak: (text: string) => void
  voiceEnabled: boolean
}) {
  const [tool, setTool] = useState<Tool>('menu')
  const [realityIndex, setRealityIndex] = useState(0)
  const [feeling, setFeeling] = useState('')
  const [reply, setReply] = useState('')

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-red-700 text-white">
      <div className="flex-1 overflow-y-auto px-6 pb-4 pt-8">
        <div className="mx-auto flex w-full max-w-md flex-col gap-6">
          <div>
            <p className="text-2xl font-extrabold leading-tight text-balance">
              Hey. Stop for a second. You’re okay. Let’s reset.
            </p>
          </div>

          {tool === 'menu' && (
            <div className="flex flex-col gap-3">
              <ToolButton
                icon="ti-lungs"
                title="60-second breathing"
                sub="Slow your body down first"
                onClick={() => setTool('breathe')}
              />
              <ToolButton
                icon="ti-bulb"
                title="Reality check"
                sub="Five things that are still true"
                onClick={() => {
                  setRealityIndex(0)
                  setTool('reality')
                }}
              />
              <ToolButton
                icon="ti-message-heart"
                title="Talk it out"
                sub="Tell me how you’re feeling"
                onClick={() => setTool('talk')}
              />
            </div>
          )}

          {tool === 'breathe' && (
            <div className="rounded-2xl bg-red-800/60 p-6">
              <BreathingAnimation
                cycles={3}
                speak={voiceEnabled ? speak : undefined}
                completeMessage="Good. Now go back to your plan. You’ve got this."
              />
              <button
                type="button"
                onClick={() => setTool('menu')}
                className="mt-4 min-h-[44px] w-full rounded-xl bg-white/15 text-sm font-semibold"
              >
                Back to tools
              </button>
            </div>
          )}

          {tool === 'reality' && (
            <div className="flex flex-col gap-4 rounded-2xl bg-red-800/60 p-6">
              <p className="min-h-[4rem] text-lg font-semibold leading-relaxed text-balance">
                {REALITY_CHECKS[realityIndex]}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-80">
                  {realityIndex + 1} / {REALITY_CHECKS.length}
                </span>
                {realityIndex < REALITY_CHECKS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setRealityIndex((i) => i + 1)}
                    className="min-h-[44px] rounded-xl bg-white px-6 text-sm font-semibold text-red-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTool('menu')}
                    className="min-h-[44px] rounded-xl bg-white px-6 text-sm font-semibold text-red-700"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          )}

          {tool === 'talk' && (
            <div className="flex flex-col gap-3 rounded-2xl bg-red-800/60 p-6">
              <textarea
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                placeholder="Type how you’re feeling right now..."
                rows={3}
                className="w-full rounded-xl bg-white/95 p-3 text-sm text-foreground placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setReply(talkResponse(feeling))}
                disabled={!feeling.trim()}
                className="min-h-[44px] rounded-xl bg-white text-sm font-semibold text-red-700 disabled:opacity-50"
              >
                Tell me
              </button>
              {reply && (
                <p className="rounded-xl bg-white/15 p-3 text-sm leading-relaxed">{reply}</p>
              )}
              <button
                type="button"
                onClick={() => setTool('menu')}
                className="min-h-[44px] text-sm font-medium underline underline-offset-4"
              >
                Back to tools
              </button>
            </div>
          )}

          {/* Mental health escalation — always visible */}
          <p className="text-xs leading-relaxed text-white/80">
            If you’re feeling more than test stress — if you’re having thoughts of hurting yourself
            or feel like you can’t cope — please text HOME to 741741 to reach the Crisis Text Line.
            This app is for SAT prep. Real support is one text away.
          </p>
        </div>
      </div>

      <div className="border-t border-white/20 bg-red-800/60 px-6 py-3">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-white text-base font-semibold text-red-700"
          >
            Go back to my plan
            <span className="ti ti-arrow-right" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

function ToolButton({
  icon,
  title,
  sub,
  onClick,
}: {
  icon: string
  title: string
  sub: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[64px] items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 text-left transition-colors hover:bg-white/25"
    >
      <span className={`${icon} ti text-2xl`} aria-hidden="true" />
      <span className="flex flex-col">
        <span className="text-base font-bold">{title}</span>
        <span className="text-xs text-white/80">{sub}</span>
      </span>
    </button>
  )
}
