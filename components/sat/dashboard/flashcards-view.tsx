'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Flashcard, Section } from '@/lib/sat-types'
import type { PanicTheme } from '@/lib/theme'
import { FLASHCARDS } from '@/lib/flashcard-data'
import { cn } from '@/lib/utils'

interface FlashcardsViewProps {
  theme: PanicTheme
  onReview: (known: boolean) => void
  weakAreas?: string[]
}

type Filter = Section | 'All'

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function FlashcardsView({ theme, onReview, weakAreas = [] }: FlashcardsViewProps) {
  const [filter, setFilter] = useState<Filter>('All')
  const [deck, setDeck] = useState<Flashcard[]>(() => shuffle(FLASHCARDS))
  const [loading, setLoading] = useState(true)
  const [aiSource, setAiSource] = useState(false)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(0)
  const [reviewing, setReviewing] = useState(0)

  // Fetch AI-generated flashcards tailored to the student's weak areas.
  useEffect(() => {
    let cancelled = false
    async function fetchCards() {
      try {
        const res = await fetch('/api/flashcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weakAreas, section: 'Both', count: 24 }),
        })
        if (!res.ok) throw new Error(`status ${res.status}`)
        const data = await res.json()
        if (!cancelled && data.flashcards?.length > 0) {
          setDeck(shuffle(data.flashcards))
          setAiSource(data.source === 'ai')
        }
      } catch {
        // Silently fall back to the static bank already set as default state.
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchCards()
    return () => { cancelled = true }
  // Only fetch once on mount — weakAreas doesn't change during the session.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredDeck = useMemo(() => {
    return filter === 'All' ? deck : deck.filter((c) => c.section === filter)
  }, [deck, filter])

  const card = filteredDeck[index]
  const total = filteredDeck.length
  const done = index >= total

  function rebuild(newFilter: Filter) {
    setFilter(newFilter)
    setIndex(0)
    setFlipped(false)
    setKnown(0)
    setReviewing(0)
  }

  function handleMark(isKnown: boolean) {
    onReview(isKnown)
    if (isKnown) setKnown((k) => k + 1)
    else setReviewing((r) => r + 1)
    setFlipped(false)
    setIndex((i) => i + 1)
  }

  function restart() {
    setDeck(shuffle(deck))
    setIndex(0)
    setFlipped(false)
    setKnown(0)
    setReviewing(0)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="mb-5 text-center">
          <h2 className="text-xl font-bold text-foreground">Flashcards</h2>
        </div>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-12 text-center">
          <i className={cn('ti ti-loader-2 animate-spin text-3xl', theme.accentText)} aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            {weakAreas.length > 0
              ? `Building cards for your weak areas\u2026`
              : 'Loading flashcards\u2026'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-5 text-center">
        <h2 className="text-xl font-bold text-foreground">Flashcards</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {aiSource && weakAreas.length > 0
            ? `Personalized for your weak areas \u2014 tap to flip`
            : 'Tap a card to flip. Rate yourself to track what you know.'}
        </p>
      </div>

      {/* Filter */}
      <div className="mb-4 flex justify-center gap-2">
        {(['All', 'Math', 'Reading & Writing'] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => rebuild(f)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
              filter === f
                ? cn(theme.accentBg, 'text-card border-transparent')
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {f === 'Reading & Writing' ? 'R&W' : f}
          </button>
        ))}
      </div>

      {done ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <div
            className={cn(
              'mx-auto flex h-16 w-16 items-center justify-center rounded-full',
              theme.accentBgSoft,
            )}
          >
            <i
              className={cn('ti ti-cards text-3xl', theme.accentText)}
              aria-hidden="true"
            />
          </div>
          <h3 className="mt-4 text-lg font-bold text-foreground">Deck complete</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {known} known &middot; {reviewing} to review
          </p>
          <button
            type="button"
            onClick={restart}
            className={cn(
              'mt-5 rounded-lg px-4 py-2.5 text-sm font-semibold text-card',
              theme.accentBg,
            )}
          >
            Shuffle &amp; restart
          </button>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span className="tabular-nums">
              Card {index + 1} of {total}
            </span>
            <span className="flex items-center gap-3">

              <span className="text-emerald-600 dark:text-emerald-400">
                {known} known
              </span>
              <span className="text-amber-600 dark:text-amber-400">
                {reviewing} review
              </span>
            </span>
          </div>

          {/* Card */}
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="group relative w-full min-h-[220px] rounded-2xl border border-border bg-card p-8 text-center transition-colors hover:border-foreground/20"
            aria-label={flipped ? 'Show question' : 'Show answer'}
          >
            <span
              className={cn(
                'absolute left-4 top-4 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                theme.badge,
              )}
            >
              {card.category}
            </span>
            <span className="absolute right-4 top-4 text-xs text-muted-foreground">
              {flipped ? 'Answer' : 'Question'}
            </span>
            <span className="flex min-h-[150px] items-center justify-center">
              <span
                className={cn(
                  'text-pretty leading-relaxed',
                  flipped
                    ? 'text-base text-foreground'
                    : 'text-lg font-medium text-foreground',
                )}
              >
                {flipped ? card.back : card.front}
              </span>
            </span>
            {!flipped && (
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                <i className="ti ti-hand-finger mr-1" aria-hidden="true" />
                Tap to flip
              </span>
            )}
          </button>

          {/* Actions */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleMark(false)}
              className="flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
            >
              <i className="ti ti-rotate" aria-hidden="true" />
              Still learning
            </button>
            <button
              type="button"
              onClick={() => handleMark(true)}
              className="flex items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              <i className="ti ti-check" aria-hidden="true" />
              I know this
            </button>
          </div>
        </>
      )}
    </div>
  )
}
