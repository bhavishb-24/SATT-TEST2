'use client'

import { useMemo, useState } from 'react'
import { PACKING_LIST } from '@/lib/constants'
import type { PlanTopic, TriageData } from '@/lib/sat-types'
import { deriveTimes } from '@/lib/time-utils'
import { Confetti } from './confetti'

interface Props {
  triage: TriageData
  topics: PlanTopic[]
  completedTopics: Set<string>
  onContinue: () => void
}

interface CheckItemProps {
  label: string
  checked: boolean
  onToggle: () => void
  href?: string
  auto?: boolean
}

function CheckItem({ label, checked, onToggle, href, auto }: CheckItemProps) {
  return (
    <li className="flex items-center gap-3">
      <button
        type="button"
        onClick={onToggle}
        role="checkbox"
        aria-checked={checked}
        aria-label={label}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
          checked ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-border bg-card'
        }`}
      >
        {checked && <span className="ti ti-check text-base" aria-hidden="true" />}
      </button>
      <span className={`flex-1 text-sm leading-snug ${checked ? 'text-muted-foreground line-through' : ''}`}>
        {label}
        {auto && (
          <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            auto
          </span>
        )}
      </span>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 items-center gap-1 rounded-lg border border-border px-2 text-xs font-medium"
        >
          <span className="ti ti-map-pin" aria-hidden="true" />
          Map
        </a>
      )}
    </li>
  )
}


export function Checklist({ triage, topics, completedTopics, onContinue }: Props) {
  const times = deriveTimes(triage.testStartTime)
  const wakeLabel = times?.wakeUpLabel ?? ''
  const sprint = triage.timeBudget === 'sprint'

  const logisticsItems = useMemo(
    () => [
      { id: 'center', label: 'I know my test center address', map: true },
      { id: 'ticket', label: 'My admission ticket is printed or saved on my phone' },
      { id: 'calc', label: 'My calculator has working batteries or is charged' },
      { id: 'pencils', label: 'I have 2 sharpened pencils and a good eraser' },
      { id: 'alarms', label: `I’ve set two alarms for ${wakeLabel}` },
      { id: 'breakfast', label: 'I know what I’m eating for breakfast tomorrow' },
    ],
    [wakeLabel],
  )

  const morningItems = useMemo(
    () => [
      `Wake up at ${wakeLabel}`,
      'Eat a real breakfast — protein and carbs',
      'Arrive 15 minutes early',
      'Use the formula reference sheet — it’s printed on the test',
      'Skip questions you don’t know and come back',
      'You prepared. Trust what you know.',
    ],
    [wakeLabel],
  )

  const [logistics, setLogistics] = useState<Record<string, boolean>>({})
  const [packing, setPacking] = useState<Record<string, boolean>>({})
  const [morning, setMorning] = useState<Record<string, boolean>>({})
  const [manualStudy, setManualStudy] = useState<Record<string, boolean>>({})

  const studyChecked = (name: string) => completedTopics.has(name) || !!manualStudy[name]

  const logisticsDone = logisticsItems.every((i) => logistics[i.id])

  // Totals for progress (logistics + study + packing + morning), or logistics-only in sprint.
  const allItems = sprint
    ? logisticsItems.length
    : logisticsItems.length + topics.length + PACKING_LIST.length + morningItems.length
  const doneCount =
    logisticsItems.filter((i) => logistics[i.id]).length +
    (sprint
      ? 0
      : topics.filter((t) => studyChecked(t.name)).length +
        PACKING_LIST.filter((p) => packing[p]).length +
        morningItems.filter((m) => morning[m]).length)

  const allComplete = doneCount === allItems && allItems > 0

  const mapsUrl =
    'https://www.google.com/maps/search/?api=1&query=SAT+test+center+near+me'

  return (
    <div className="animate-fade-in relative mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight">Night-before checklist</h1>
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(doneCount / allItems) * 100}%` }}
            />
          </div>
          <span className="text-xs font-semibold tabular-nums text-muted-foreground">
            {doneCount} of {allItems}
          </span>
        </div>
      </header>

      {/* Logistics */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Logistics
        </h2>
        <ul className="flex flex-col gap-3">
          {logisticsItems.map((i) => (
            <CheckItem
              key={i.id}
              label={i.label}
              checked={!!logistics[i.id]}
              onToggle={() => setLogistics((s) => ({ ...s, [i.id]: !s[i.id] }))}
              href={i.map ? mapsUrl : undefined}
            />
          ))}
        </ul>
        {logisticsDone && (
          <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 dark:bg-emerald-950/40">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Logistics locked. Now focus only on studying.
            </p>
          </div>
        )}
      </section>

      {!sprint && (
        <>
          {/* Study tasks */}
          {topics.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-4">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Study tasks
              </h2>
              <ul className="flex flex-col gap-3">
                {topics.map((t) => (
                  <CheckItem
                    key={t.name}
                    label={`Study: ${t.name}`}
                    checked={studyChecked(t.name)}
                    auto={completedTopics.has(t.name)}
                    onToggle={() =>
                      setManualStudy((s) => ({ ...s, [t.name]: !studyChecked(t.name) }))
                    }
                  />
                ))}
              </ul>
            </section>
          )}

          {/* Packing list */}
          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Packing list
            </h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Check off each item as you pack it.
            </p>
            <ul className="flex flex-col gap-3">
              {PACKING_LIST.map((p) => (
                <CheckItem
                  key={p}
                  label={p}
                  checked={!!packing[p]}
                  onToggle={() => setPacking((s) => ({ ...s, [p]: !s[p] }))}
                />
              ))}
            </ul>
          </section>

          {/* Morning of the test */}
          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Morning of the test
            </h2>
            <ul className="flex flex-col gap-3">
              {morningItems.map((m) => (
                <CheckItem
                  key={m}
                  label={m}
                  checked={!!morning[m]}
                  onToggle={() => setMorning((s) => ({ ...s, [m]: !s[m] }))}
                />
              ))}
            </ul>
          </section>
        </>
      )}

      {allComplete && (
        <section className="relative overflow-hidden rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-950/40">
          <Confetti />
          <span className="ti ti-confetti text-4xl text-emerald-500" aria-hidden="true" />
          <h2 className="mt-2 text-xl font-extrabold">You’re all set.</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything is checked off. Get some rest — you’ve earned it.
          </p>
          {triage.emergencyContact && (
            <p className="mt-3 rounded-xl bg-card p-3 text-sm font-medium">
              We notified {triage.emergencyContact} that you’re ready.
            </p>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={onContinue}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-foreground text-base font-semibold text-background"
      >
        Go to morning mode
        <span className="ti ti-sunrise" aria-hidden="true" />
      </button>
    </div>
  )
}
