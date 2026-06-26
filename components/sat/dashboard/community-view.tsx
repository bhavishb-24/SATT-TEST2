'use client'

import { useState, useRef, useEffect } from 'react'
import type { AppStats } from '@/lib/sat-types'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'discover' | 'create' | 'library'
type QuestionType = 'multiple-choice' | 'grid-in' | 'passage' | 'graph' | 'image'
type Difficulty = 'Easy' | 'Medium' | 'Hard'

interface CommunityViewProps {
  weakAreas: string[]
  stats: AppStats
}

// ─── Shared primitives ───────────────────────────────────────────────────────

function DifficultyBadge({ level }: { level: Difficulty }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold leading-none',
        level === 'Easy'   && 'bg-emerald-50 text-emerald-700',
        level === 'Medium' && 'bg-amber-50 text-amber-700',
        level === 'Hard'   && 'bg-red-50 text-red-700',
      )}
    >
      {level}
    </span>
  )
}

function QualityRing({ score }: { score: number }) {
  const r = 10
  const circ = 2 * Math.PI * r
  const [dash, setDash] = useState(circ)
  useEffect(() => {
    const t = setTimeout(() => setDash(circ - (score / 100) * circ), 80)
    return () => clearTimeout(t)
  }, [score, circ])
  const color = score >= 80 ? '#0e8a6a' : score >= 60 ? '#d97706' : '#d94040'
  return (
    <div className="relative h-7 w-7 shrink-0">
      <svg width={28} height={28} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={14} cy={14} r={r} fill="none" stroke="var(--muted)" strokeWidth={3} />
        <circle
          cx={14} cy={14} r={r}
          fill="none" stroke={color} strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dash}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground">
        {score}
      </span>
    </div>
  )
}

function CreatorAvatar({ initials, color }: { initials: string; color: string }) {
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
      style={{ background: color }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

// ─── Empty state card ─────────────────────────────────────────────────────────

function EmptyStrip({
  title,
  body,
  cta,
  onCta,
}: {
  title: string
  body: string
  cta: string
  onCta: () => void
}) {
  return (
    <div className="flex min-w-[320px] max-w-xs flex-col items-start gap-3 rounded-3xl border border-dashed border-border bg-card p-6">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
      <button
        type="button"
        onClick={onCta}
        className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        {cta}
      </button>
    </div>
  )
}

// ─── Question card ────────────────────────────────────────────────────────────

interface QuestionCardData {
  id: string
  title: string
  topic: string
  difficulty: Difficulty
  estimatedMin: number
  qualityScore: number
  xpReward: number
  attempts: number
  completionPct: number
  creatorInitials: string
  creatorColor: string
  creatorName: string
  verified: 'ai' | 'teacher' | 'community' | null
}

function QuestionCard({
  q,
  onOpen,
}: {
  q: QuestionCardData
  onOpen: (id: string) => void
}) {
  return (
    <article
      className="group flex w-72 shrink-0 cursor-pointer flex-col gap-3 rounded-3xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
      onClick={() => onOpen(q.id)}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(q.id)}
      role="button"
      aria-label={`Open question: ${q.title}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 flex-1 text-sm font-semibold leading-snug text-foreground">
          {q.title}
        </p>
        <QualityRing score={q.qualityScore} />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-1.5">
        <DifficultyBadge level={q.difficulty} />
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
          {q.topic}
        </span>
        {q.verified === 'ai' && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            AI Verified
          </span>
        )}
        {q.verified === 'teacher' && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
            Teacher Verified
          </span>
        )}
        {q.verified === 'community' && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
            Community Pick
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <i className="ti ti-clock text-xs" aria-hidden="true" />
          {q.estimatedMin}m
        </span>
        <span className="flex items-center gap-1">
          <i className="ti ti-users text-xs" aria-hidden="true" />
          {q.attempts.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <i className="ti ti-check text-xs" aria-hidden="true" />
          {q.completionPct}%
        </span>
        <span className="ml-auto flex items-center gap-1 font-semibold text-amber-600">
          +{q.xpReward}
          <span className="font-normal text-muted-foreground">XP</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary/60 transition-all duration-700"
          style={{ width: `${q.completionPct}%` }}
        />
      </div>

      {/* Creator */}
      <div className="flex items-center gap-2 border-t border-border pt-3">
        <CreatorAvatar initials={q.creatorInitials} color={q.creatorColor} />
        <span className="text-[11px] text-muted-foreground">
          by <span className="font-medium text-foreground">{q.creatorName}</span>
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation() }}
          className="ml-auto rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Follow
        </button>
      </div>
    </article>
  )
}

// ─── Horizontal strip ─────────────────────────────────────────────────────────

function QuestionStrip({
  label,
  icon,
  questions,
  emptyTitle,
  emptyBody,
  emptyCta,
  onEmptyCta,
  onOpen,
}: {
  label: string
  icon: string
  questions: QuestionCardData[]
  emptyTitle: string
  emptyBody: string
  emptyCta: string
  onEmptyCta: () => void
  onOpen: (id: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <i className={cn('ti', icon, 'text-primary')} aria-hidden="true" />
          {label}
        </h2>
        {questions.length > 0 && (
          <button
            type="button"
            className="text-xs font-medium text-primary hover:underline"
          >
            See all
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="no-scrollbar flex gap-4 overflow-x-auto pb-2"
      >
        {questions.length > 0
          ? questions.map((q) => (
              <QuestionCard key={q.id} q={q} onOpen={onOpen} />
            ))
          : (
            <EmptyStrip
              title={emptyTitle}
              body={emptyBody}
              cta={emptyCta}
              onCta={onEmptyCta}
            />
          )
        }
      </div>
    </section>
  )
}

// ─── Discover panel ───────────────────────────────────────────────────────────

const TOPIC_CHIPS = [
  'All', 'Algebra', 'Geometry', 'Functions', 'Statistics',
  'Vocabulary', 'Reading', 'Grammar', 'Inference', 'Evidence',
]

function DiscoverPanel({
  weakAreas,
  onSwitchCreate,
}: {
  weakAreas: string[]
  onSwitchCreate: () => void
}) {
  const [search, setSearch] = useState('')
  const [activeTopic, setActiveTopic] = useState('All')
  const [activeSection, setActiveSection] = useState<'All' | 'Math' | 'Reading & Writing'>('All')

  // All question arrays start empty — no fake data
  const aiRecommended: QuestionCardData[] = []
  const teacherVerified: QuestionCardData[] = []

  function openQuestion(_id: string) {
    // Full question page would be a route — here we show inline detail
    // This is a stub; a backend-connected version would navigate.
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Search hero */}
      <div className="relative">
        <label htmlFor="qbank-search" className="sr-only">Search questions</label>
        <i className="ti ti-search absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base pointer-events-none" aria-hidden="true" />
        <input
          id="qbank-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search anything... &quot;hard algebra&quot;, &quot;reading inference&quot;, &quot;circle geometry&quot;"
          className="h-14 w-full rounded-2xl border border-border bg-card pl-11 pr-4 text-sm text-foreground shadow-sm outline-none ring-0 transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <i className="ti ti-x text-sm" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Section filter */}
      <div className="flex items-center gap-2">
        {(['All', 'Math', 'Reading & Writing'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActiveSection(s)}
            className={cn(
              'rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors',
              activeSection === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-muted',
            )}
          >
            {s}
          </button>
        ))}
        <div className="no-scrollbar ml-1 flex gap-2 overflow-x-auto">
          {TOPIC_CHIPS.filter(t => t !== 'All').map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setActiveTopic(activeTopic === chip ? 'All' : chip)}
              className={cn(
                'shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors',
                activeTopic === chip
                  ? 'bg-secondary text-primary font-semibold border border-primary/30'
                  : 'bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
              )}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Strips — only AI Recommended and Teacher Verified */}
      <QuestionStrip
        label="AI Recommended for You"
        icon="ti-sparkles"
        questions={aiRecommended}
        emptyTitle="Practice more to unlock AI recommendations"
        emptyBody="Answer at least 10 practice questions and your AI tutor will curate a personalized feed."
        emptyCta="Go to Practice"
        onEmptyCta={onSwitchCreate}
        onOpen={openQuestion}
      />

      <QuestionStrip
        label="Teacher Verified"
        icon="ti-school"
        questions={teacherVerified}
        emptyTitle="No teacher-verified questions yet"
        emptyBody="Questions reviewed and approved by real SAT teachers will appear here."
        emptyCta="Submit for review"
        onEmptyCta={onSwitchCreate}
        onOpen={openQuestion}
      />
    </div>
  )
}

// ─── AI quality score panel ───────────────────────────────────────────────────

const QUALITY_CATEGORIES = [
  { key: 'difficulty', label: 'Difficulty Accuracy' },
  { key: 'grammar', label: 'Grammar & Clarity' },
  { key: 'fairness', label: 'Fairness' },
  { key: 'originality', label: 'Originality' },
  { key: 'sat', label: 'SAT Authenticity' },
  { key: 'distractors', label: 'Distractor Quality' },
  { key: 'learning', label: 'Learning Value' },
]

function QualityScorePanel({ scores }: { scores: Record<string, number> }) {
  const overall = Object.keys(scores).length > 0
    ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length)
    : 0

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">AI Quality Score</h3>
        <div className="flex items-center gap-2">
          <QualityRing score={overall} />
          <span className="text-xs text-muted-foreground">Overall</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {QUALITY_CATEGORIES.map(({ key, label }) => {
          const val = scores[key] ?? 0
          return (
            <div key={key} className="flex items-center gap-3">
              <p className="w-36 shrink-0 text-[11px] text-muted-foreground">{label}</p>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/70 transition-all duration-700"
                  style={{ width: `${val}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-[11px] font-semibold tabular-nums text-foreground">
                {val > 0 ? val : '—'}
              </span>
            </div>
          )
        })}
      </div>
      {overall === 0 && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Fill in your question to see the AI quality analysis.
        </p>
      )}
    </div>
  )
}

// ─── AI co-author suggestions ─────────────────────────────────────────────────

const AI_ACTIONS = [
  { id: 'choices',      label: 'Generate answer choices',   icon: 'ti-list' },
  { id: 'distractors',  label: 'Better distractors',        icon: 'ti-target-arrow' },
  { id: 'difficulty',   label: 'Adjust difficulty',         icon: 'ti-adjustments-horizontal' },
  { id: 'collegeboard', label: 'Rewrite like College Board', icon: 'ti-certificate' },
  { id: 'ambiguity',    label: 'Detect ambiguity',          icon: 'ti-eye-question' },
  { id: 'explanation',  label: 'Improve explanation',       icon: 'ti-bulb' },
  { id: 'easier',       label: 'Create easier version',     icon: 'ti-arrow-down-circle' },
  { id: 'harder',       label: 'Create harder version',     icon: 'ti-arrow-up-circle' },
  { id: 'similar',      label: 'Generate similar question', icon: 'ti-copy' },
  { id: 'flashcards',   label: 'Generate flashcards',       icon: 'ti-cards' },
  { id: 'quiz',         label: 'Generate mini quiz',        icon: 'ti-clipboard-list' },
]

function AICoAuthorPanel({
  hasContent,
  onAction,
}: {
  hasContent: boolean
  onAction: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-secondary px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <i className="ti ti-sparkles text-sm" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold text-foreground">Sage AI Co-Author</p>
          <p className="text-[10px] text-muted-foreground">
            {hasContent ? 'Ready to assist' : 'Start writing to unlock AI'}
          </p>
        </div>
        <span
          className={cn(
            'ml-auto h-2 w-2 rounded-full',
            hasContent ? 'bg-primary status-dot' : 'bg-muted-foreground/40',
          )}
          aria-hidden="true"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1.5">
        {AI_ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            disabled={!hasContent}
            onClick={() => onAction(a.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-colors',
              hasContent
                ? 'text-foreground hover:bg-secondary hover:text-primary'
                : 'cursor-not-allowed text-muted-foreground/50',
            )}
          >
            <i className={cn('ti', a.icon, 'w-4 shrink-0 text-sm')} aria-hidden="true" />
            {a.label}
          </button>
        ))}
      </div>

      {!hasContent && (
        <p className="rounded-xl border border-dashed border-border p-3 text-center text-[11px] text-muted-foreground">
          Write your question prompt to activate AI assistance.
        </p>
      )}
    </div>
  )
}

// ─── Create panel ─────────────────────────────────────────────────────────────

const QUESTION_TYPES: { id: QuestionType; label: string; icon: string }[] = [
  { id: 'multiple-choice', label: 'Multiple Choice', icon: 'ti-circle-check' },
  { id: 'grid-in',         label: 'Grid-In',         icon: 'ti-grid-4x4' },
  { id: 'passage',         label: 'Passage-Based',   icon: 'ti-file-text' },
  { id: 'graph',           label: 'Graph',           icon: 'ti-chart-line' },
  { id: 'image',           label: 'Image',           icon: 'ti-photo' },
]

function CreatePanel({ weakAreas }: { weakAreas: string[] }) {
  const [qType, setQType]           = useState<QuestionType>('multiple-choice')
  const [prompt, setPrompt]         = useState('')
  const [choices, setChoices]       = useState(['', '', '', ''])
  const [correctIdx, setCorrectIdx] = useState<number | null>(null)
  const [explanation, setExplanation] = useState('')
  const [topic, setTopic]           = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium')
  const [section, setSection]       = useState<'Math' | 'Reading & Writing'>('Math')
  const [activeAiAction, setActiveAiAction] = useState<string | null>(null)

  const hasContent = prompt.trim().length > 0

  const qualityScores: Record<string, number> = hasContent
    ? {
        difficulty: difficulty === 'Hard' ? 85 : difficulty === 'Medium' ? 70 : 55,
        grammar: prompt.trim().length > 30 ? 80 : 40,
        fairness: 75,
        originality: 90,
        sat: topic ? 80 : 50,
        distractors: choices.filter(Boolean).length >= 3 ? 78 : 30,
        learning: explanation.trim().length > 20 ? 85 : 35,
      }
    : {}

  function updateChoice(i: number, val: string) {
    setChoices((prev) => { const next = [...prev]; next[i] = val; return next })
  }

  function handleAiAction(id: string) {
    setActiveAiAction(id)
    // In production: POST /api/community/ai-assist with { action: id, prompt, context }
    setTimeout(() => setActiveAiAction(null), 1500)
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* ── Left: Editor ── */}
      <div className="min-w-0 flex-1 flex flex-col gap-5">

        {/* Question type selector */}
        <div className="flex flex-wrap gap-2">
          {QUESTION_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setQType(t.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors',
                qType === t.id
                  ? 'border-primary bg-secondary text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground',
              )}
            >
              <i className={cn('ti', t.icon, 'text-sm')} aria-hidden="true" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Section + topic + difficulty row */}
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Section
            </label>
            <div className="flex gap-2">
              {(['Math', 'Reading & Writing'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSection(s)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                    section === s
                      ? 'border-primary bg-secondary text-primary'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/30',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Difficulty
            </label>
            <div className="flex gap-2">
              {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                    difficulty === d
                      ? 'border-primary bg-secondary text-primary'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/30',
                    d === 'Easy'   && difficulty === d && 'border-emerald-400 bg-emerald-50 text-emerald-700',
                    d === 'Hard'   && difficulty === d && 'border-red-400 bg-red-50 text-red-700',
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="q-topic" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Topic
            </label>
            <input
              id="q-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Quadratics"
              className="h-8 rounded-lg border border-border bg-card px-3 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Question prompt */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="q-prompt" className="text-xs font-semibold text-foreground">
            Question
            <span className="ml-1 text-[10px] font-normal text-muted-foreground">
              Supports LaTeX: e.g. $x^2 + 3x + 2$
            </span>
          </label>
          <textarea
            id="q-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Write your question here. Use $...$ for inline math or $$...$$ for display math."
            rows={4}
            className="w-full resize-y rounded-2xl border border-border bg-card p-4 text-sm text-foreground leading-relaxed outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Answer choices (multiple-choice only) */}
        {qType === 'multiple-choice' && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-foreground">
              Answer Choices
              <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                Click the circle to mark the correct answer
              </span>
            </p>
            {choices.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCorrectIdx(i)}
                  aria-label={`Mark choice ${String.fromCharCode(65 + i)} as correct`}
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                    correctIdx === i
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary',
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </button>
                <input
                  type="text"
                  value={c}
                  onChange={(e) => updateChoice(i, e.target.value)}
                  placeholder={`Choice ${String.fromCharCode(65 + i)}`}
                  className={cn(
                    'flex-1 rounded-xl border px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground transition-colors',
                    correctIdx === i
                      ? 'border-primary/50 bg-secondary focus:ring-1 focus:ring-primary/20'
                      : 'border-border bg-card focus:border-primary focus:ring-1 focus:ring-primary/20',
                  )}
                />
              </div>
            ))}
          </div>
        )}

        {/* Explanation */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="q-explanation" className="text-xs font-semibold text-foreground">
            Explanation
          </label>
          <textarea
            id="q-explanation"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explain step-by-step how to solve this question. Great explanations make great teachers."
            rows={3}
            className="w-full resize-y rounded-2xl border border-border bg-card p-4 text-sm text-foreground leading-relaxed outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Publish bar */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">
              {hasContent ? 'Ready to publish?' : 'Complete your question to publish'}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {hasContent
                ? 'Your question will be reviewed by AI before going live.'
                : 'Fill in the question prompt, at least two choices, and an explanation.'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!hasContent}
              className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={!hasContent || correctIdx === null}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Publish
            </button>
          </div>
        </div>

        {/* Quality score */}
        <QualityScorePanel scores={qualityScores} />
      </div>

      {/* ── Right: AI Co-Author sidebar ── */}
      <div className="w-full shrink-0 lg:w-72 xl:w-80">
        <div className="sticky top-4 flex flex-col gap-4">
          <AICoAuthorPanel hasContent={hasContent} onAction={handleAiAction} />

          {activeAiAction && (
            <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-secondary px-4 py-3">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-xs text-primary font-medium">Sage AI is thinking...</p>
            </div>
          )}

          {/* Fork info */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="ti ti-git-fork text-primary text-sm" aria-hidden="true" />
              <p className="text-xs font-semibold text-foreground">Fork a Question</p>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Improve, translate, or remix any community question. The original creator always receives credit and XP when your fork gets solved.
            </p>
            <button
              type="button"
              className="mt-3 w-full rounded-xl border border-border py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Browse questions to fork
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Library panel ────────────────────────────────────────────────────────────

function LibraryPanel({ onSwitchDiscover, onSwitchCreate }: { onSwitchDiscover: () => void; onSwitchCreate: () => void }) {
  const PLAYLISTS: never[] = []
  const PACKS: never[] = []
  const AUTHORED: never[] = []

  return (
    <div className="flex flex-col gap-8">
      {/* Authored questions */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">My Questions</h2>
          <button
            type="button"
            onClick={onSwitchCreate}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <i className="ti ti-plus text-xs" aria-hidden="true" />
            Create
          </button>
        </div>
        {AUTHORED.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
              <i className="ti ti-pencil-question text-2xl" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{"You haven't created any questions yet"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your published questions will appear here along with analytics — views, attempts, and where students struggle.
              </p>
            </div>
            <button
              type="button"
              onClick={onSwitchCreate}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Create your first question
            </button>
          </div>
        ) : null}
      </section>

      {/* Saved playlists */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">My Playlists</h2>
          <button
            type="button"
            className="text-xs font-medium text-primary hover:underline"
          >
            New playlist
          </button>
        </div>
        {PLAYLISTS.length === 0 ? (
          <div className="flex items-center gap-4 rounded-3xl border border-dashed border-border bg-card p-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <i className="ti ti-playlist text-lg" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">No playlists yet</p>
              <p className="text-xs text-muted-foreground">
                Save questions into playlists like &quot;Night Before SAT&quot; or &quot;Geometry Weaknesses&quot;.
              </p>
            </div>
            <button
              type="button"
              onClick={onSwitchDiscover}
              className="ml-auto shrink-0 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Browse questions
            </button>
          </div>
        ) : null}
      </section>

      {/* Study packs */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Study Packs</h2>
          <button
            type="button"
            className="text-xs font-medium text-primary hover:underline"
          >
            New pack
          </button>
        </div>
        {PACKS.length === 0 ? (
          <div className="flex items-center gap-4 rounded-3xl border border-dashed border-border bg-card p-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <i className="ti ti-stack-2 text-lg" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">No study packs</p>
              <p className="text-xs text-muted-foreground">
                Bundle questions into shareable packs like &quot;50 Hard Algebra Questions&quot; or &quot;Night Before SAT&quot;.
              </p>
            </div>
            <button
              type="button"
              onClick={onSwitchCreate}
              className="ml-auto shrink-0 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Create a pack
            </button>
          </div>
        ) : null}
      </section>

      {/* Creator profile stub */}
      <section>
        <h2 className="mb-4 text-sm font-semibold text-foreground">Creator Profile</h2>
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-4 border-b border-border pb-5">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
              ?
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Your creator profile</p>
              <p className="text-xs text-muted-foreground">
                Publish a question to unlock your public creator profile with followers, stats, and achievements.
              </p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-4">
            {[
              { label: 'Questions', value: 0 },
              { label: 'Total Solves', value: 0 },
              { label: 'Followers', value: 0 },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
                <p className="text-[11px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function CommunityView({ weakAreas, stats }: CommunityViewProps) {
  const [tab, setTab] = useState<Tab>('discover')

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'discover', label: 'Discover',   icon: 'ti-compass' },
    { id: 'create',   label: 'Create',     icon: 'ti-pencil-plus' },
    { id: 'library',  label: 'My Library', icon: 'ti-bookmarks' },
  ]

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Page hero */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Community Question Bank
          </p>
          <h1 className="font-serif text-2xl font-bold leading-tight text-foreground text-balance sm:text-3xl">
            Discover, create, and share<br />
            <span className="text-primary">world-class SAT questions.</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Every question you create helps another student. Every question you solve makes you sharper. The platform grows stronger every time someone joins.
          </p>
        </div>

        {/* Stats bar (honest zeros until data exists) */}
        <div className="mt-6 flex flex-wrap gap-6 border-t border-border pt-5">
          {[
            { label: 'Questions published', value: stats.practiceAnswered > 0 ? '—' : '0' },
            { label: 'Community solves',    value: '0' },
            { label: 'Active creators',     value: '0' },
            { label: 'Your contributions',  value: '0' },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <p className="text-xl font-bold tabular-nums text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab strip */}
      <div
        className="flex gap-1 rounded-2xl border border-border bg-card p-1.5 shadow-sm"
        role="tablist"
        aria-label="Question Bank sections"
      >
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
              tab === id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <i className={cn('ti', icon, 'text-base')} aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Panel */}
      <div role="tabpanel">
        {tab === 'discover' && (
          <DiscoverPanel
            weakAreas={weakAreas}
            onSwitchCreate={() => setTab('create')}
          />
        )}
        {tab === 'create' && (
          <CreatePanel weakAreas={weakAreas} />
        )}
        {tab === 'library' && (
          <LibraryPanel
            onSwitchDiscover={() => setTab('discover')}
            onSwitchCreate={() => setTab('create')}
          />
        )}
      </div>
    </div>
  )
}
