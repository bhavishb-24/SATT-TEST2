'use client'

import { useMemo, useRef, useState } from 'react'
import {
  MATH_WEAK_AREAS,
  PREVIOUS_PREP,
  RW_WEAK_AREAS,
} from '@/lib/constants'
import type { TriageData, TimeBudget } from '@/lib/sat-types'
import { buildTestTimeOptions, deriveTimes, TIME_BUDGET_LABELS } from '@/lib/time-utils'
import { getPanicTheme } from '@/lib/theme'

const TIME_BUDGETS: TimeBudget[] = ['all-day', 'evening', 'few-hours', 'sprint']

interface Props {
  onSubmit: (data: TriageData) => void
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-h-[44px] rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        selected
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-card text-foreground hover:border-primary/50'
      }`}
    >
      {label}
    </button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-base font-bold">{children}</h2>
}

export function TriageForm({ onSubmit }: Props) {
  const [panic, setPanic] = useState(3)
  const [testStartTime, setTestStartTime] = useState('8:00 AM')
  const [daysUntilSat, setDaysUntilSat] = useState('')
  const [timeBudget, setTimeBudget] = useState<TimeBudget | ''>('')
  const [lastMath, setLastMath] = useState('')
  const [lastRW, setLastRW] = useState('')
  const [goalMath, setGoalMath] = useState('')
  const [goalRW, setGoalRW] = useState('')
  const [weakAreas, setWeakAreas] = useState<string[]>([])
  const [previousPrep, setPreviousPrep] = useState<string[]>([])

  // Score report upload state
  const [reportState, setReportState] = useState<
    'idle' | 'reading' | 'done' | 'error'
  >('idle')
  const [reportName, setReportName] = useState('')
  const [scoreReportText, setScoreReportText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [errors, setErrors] = useState<{ weak?: string; time?: string; days?: string }>({})
  const weakRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLDivElement>(null)
  const daysRef = useRef<HTMLDivElement>(null)

  const theme = getPanicTheme(panic)
  const times = useMemo(() => deriveTimes(testStartTime), [testStartTime])
  const testTimeOptions = useMemo(() => buildTestTimeOptions(), [])

  function toggle(list: string[], setList: (l: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  async function analyzeReport(dataUrl: string, name: string) {
    setReportName(name)
    setReportState('reading')
    try {
      const res = await fetch('/api/score-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
      })
      const out = await res.json()
      if (out.readable) {
        if (out.math_score != null) setLastMath(String(out.math_score))
        if (out.rw_score != null) setLastRW(String(out.rw_score))
        const parts: string[] = []
        if (out.math_score != null) parts.push(`Math ${out.math_score}`)
        if (out.rw_score != null) parts.push(`R&W ${out.rw_score}`)
        if (out.weak_areas_text) parts.push(`Notes: ${out.weak_areas_text}`)
        setScoreReportText(parts.join('; '))
        setReportState('done')
      } else {
        setReportState('error')
        setScoreReportText('')
      }
    } catch {
      setReportState('error')
      setScoreReportText('')
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    analyzeReport(dataUrl, file.name)
  }

  // Loads the bundled example report and runs it through the same AI analysis,
  // so users can try the upload feature without their own score report.
  async function handleExample() {
    setReportName('example-score-report.png')
    setReportState('reading')
    try {
      const res = await fetch('/example-score-report.png')
      const blob = await res.blob()
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
      await analyzeReport(dataUrl, 'example-score-report.png')
    } catch {
      setReportState('error')
      setScoreReportText('')
    }
  }

  function handleSubmit() {
    const nextErrors: { weak?: string; time?: string; days?: string } = {}
    if (!daysUntilSat) nextErrors.days = 'Tell us how far out your SAT is.'
    if (!timeBudget) nextErrors.time = 'Tell us how much time you have right now.'
    if (weakAreas.length === 0)
      nextErrors.weak = 'Pick at least one weak area so we can target your plan.'
    setErrors(nextErrors)

    if (nextErrors.days) {
      daysRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (nextErrors.time) {
      timeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (nextErrors.weak) {
      weakRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    onSubmit({
      panic,
      testStartTime,
      daysUntilSat,
      timeBudget: timeBudget as TimeBudget,
      lastMath,
      lastRW,
      goalMath,
      goalRW,
      weakAreas,
      learningStyle: '',
      previousPrep,
      emergencyContact: '',
      scoreReportText,
    })
  }

  return (
    <main className="animate-fade-in mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 pb-32 pt-8 lg:px-8 lg:pt-12">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-4xl font-normal tracking-tight lg:text-5xl">
          Let&apos;s build your plan.
        </h1>
        <p className="text-base text-muted-foreground">
          A few quick questions so your coach can build the perfect plan — whether your SAT is
          tomorrow or 12 months away.
        </p>
      </header>

      {/* Section A — Panic slider */}
      <section className={`rounded-2xl border p-5 ${theme.accentBorder} ${theme.accentBgSoft}`}>
        <SectionLabel>How are you feeling right now?</SectionLabel>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={panic}
          onChange={(e) => setPanic(Number(e.target.value))}
          aria-label="Panic level from 1 to 5"
          className="range-slider transition-all duration-200"
          style={{ '--range-fill': `${((panic - 1) / 4) * 100}%` } as React.CSSProperties}
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>Feeling okay</span>
          <span>Pretty stressed</span>
          <span>Full panic</span>
        </div>
        <p className={`mt-3 text-sm font-semibold transition-all duration-300 ease-out ${theme.accentText}`}>
          {theme.label}
        </p>
        {theme.urgentCopy && (
          <p className="mt-1 text-sm font-bold text-red-600 dark:text-red-400">
            {theme.urgentCopy}
          </p>
        )}
      </section>

      {/* Two-column layout on desktop, single column on mobile */}
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-x-12">
      {/* Left column */}
      <div className="flex flex-col gap-8">

      {/* Section B — Days until SAT */}
      <section ref={daysRef} className="flex flex-col gap-5">
        <div>
          <SectionLabel>How many days until your SAT?</SectionLabel>
          <select
            value={daysUntilSat}
            onChange={(e) => setDaysUntilSat(e.target.value)}
            className="min-h-[44px] w-full rounded-xl border border-border bg-card px-4 text-sm"
          >
            <option value="" disabled>
              Select how far out your test is...
            </option>
            <option value="7">7 days — test is next week</option>
            <option value="14">14 days — two weeks out</option>
            <option value="30">30 days — about a month</option>
            <option value="60">2 months</option>
            <option value="90">3 months</option>
            <option value="120">4 months</option>
            <option value="150">5 months</option>
            <option value="180">6 months</option>
            <option value="210">7 months</option>
            <option value="240">8 months</option>
            <option value="270">9 months</option>
            <option value="300">10 months</option>
            <option value="330">11 months</option>
            <option value="365">12 months</option>
            <option value="365+">More than 12 months</option>
          </select>
          {errors.days && (
            <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
              {errors.days}
            </p>
          )}
        </div>
      </section>

      {/* Section B2 — Test start time (only shown for 7 or 14 day window) */}
      {(daysUntilSat === '7' || daysUntilSat === '14') && (
        <section className="flex flex-col gap-5">
          <div>
            <SectionLabel>What time does your SAT start?</SectionLabel>
            <select
              value={testStartTime}
              onChange={(e) => setTestStartTime(e.target.value)}
              className="min-h-[44px] w-full rounded-xl border border-border bg-card px-4 text-sm"
            >
              {testTimeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {times && (
              <p className="mt-2 text-xs text-muted-foreground">
                Sleep by <span className="font-semibold">{times.sleepDeadlineLabel}</span> · Wake
                up by <span className="font-semibold">{times.wakeUpLabel}</span>
              </p>
            )}
          </div>
        </section>
      )}

      {/* Section C — Time budget */}
      <section ref={timeRef} className="flex flex-col gap-5">
        <div>
          <SectionLabel>How much time do you have right now?</SectionLabel>
          <div className="flex flex-col gap-2">
            {TIME_BUDGETS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setTimeBudget(b)}
                aria-pressed={timeBudget === b}
                className={`min-h-[44px] rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                  timeBudget === b
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                {TIME_BUDGET_LABELS[b]}
              </button>
            ))}
          </div>
          {errors.time && (
            <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
              {errors.time}
            </p>
          )}
        </div>
      </section>

      {/* Section C — Past scores */}
      <section className="flex flex-col gap-3">
        <SectionLabel>Your last scores (optional)</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <NumberInput label="Last Math" value={lastMath} onChange={setLastMath} />
          <NumberInput label="Last R&W" value={lastRW} onChange={setLastRW} />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-4 text-sm font-medium hover:border-primary/50"
        >
          <span className="ti ti-upload text-base" aria-hidden="true" />
          Or upload your score report
        </button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="ti ti-photo text-sm" aria-hidden="true" />
          <span>No report handy?</span>
          <button
            type="button"
            onClick={handleExample}
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            Try our example report
          </button>
          <a
            href="/example-score-report.png"
            target="_blank"
            rel="noreferrer"
            className="ml-auto underline-offset-2 hover:underline"
          >
            View it
          </a>
        </div>
        {reportState === 'reading' && (
          <p className="text-xs text-muted-foreground">
            Reading {reportName}…
          </p>
        )}
        {reportState === 'done' && (
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Read {reportName}. We filled in what we could find.
          </p>
        )}
        {reportState === 'error' && (
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
            We couldn’t read that report yet. You can type your scores in manually above.
          </p>
        )}
      </section>

      {/* Section D — Goal scores */}
      <section className="flex flex-col gap-3">
        <SectionLabel>Your goal scores (optional)</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <NumberInput label="Math goal" value={goalMath} onChange={setGoalMath} />
          <NumberInput label="R&W goal" value={goalRW} onChange={setGoalRW} />
        </div>
      </section>

      </div>
      {/* Right column */}
      <div className="flex flex-col gap-8">

      {/* Section E — Weak areas */}
      <section ref={weakRef} className="flex flex-col gap-4">
        <SectionLabel>Where do you feel weakest?</SectionLabel>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Math
          </p>
          <div className="flex flex-wrap gap-2">
            {MATH_WEAK_AREAS.map((a) => (
              <Chip
                key={a}
                label={a}
                selected={weakAreas.includes(a)}
                onClick={() => toggle(weakAreas, setWeakAreas, a)}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Reading &amp; Writing
          </p>
          <div className="flex flex-wrap gap-2">
            {RW_WEAK_AREAS.map((a) => (
              <Chip
                key={a}
                label={a}
                selected={weakAreas.includes(a)}
                onClick={() => toggle(weakAreas, setWeakAreas, a)}
              />
            ))}
          </div>
        </div>
        {errors.weak && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            {errors.weak}
          </p>
        )}
      </section>

      {/* Section G — Previous prep */}
      <section className="flex flex-col gap-3">
        <SectionLabel>What have you tried before?</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {PREVIOUS_PREP.map((p) => (
            <Chip
              key={p}
              label={p}
              selected={previousPrep.includes(p)}
              onClick={() => toggle(previousPrep, setPreviousPrep, p)}
            />
          ))}
        </div>
      </section>

      </div>
      </div>

      {/* Sticky submit */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 px-5 py-3 backdrop-blur">
        <div className="mx-auto max-w-md lg:max-w-sm">
          <button
            type="button"
            onClick={handleSubmit}
            className={`flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl px-6 text-base font-semibold text-white transition-colors ${theme.accentBg}`}
          >
            Build my study plan
            <span className="ti ti-arrow-right text-lg" aria-hidden="true" />
          </button>
        </div>
      </div>
    </main>
  )
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="—"
        className="min-h-[44px] w-full rounded-xl border border-border bg-card px-4 text-sm"
      />
    </label>
  )
}
