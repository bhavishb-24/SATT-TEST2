import type { DiagnosticRecord } from './sat-types'

export interface SectionDelta {
  label: string
  prePct: number
  postPct: number
  delta: number // percentage points, post - pre
  preFraction: string // e.g. "8/15"
  postFraction: string
}

export interface DiagnosticComparison {
  overall: SectionDelta
  math: SectionDelta
  rw: SectionDelta
  /** Topics the student missed before but got right this time. */
  improvedTopics: string[]
  /** Topics answered correctly in both diagnostics. */
  consistentStrengths: string[]
  /** Topics still missed in the post diagnostic — keep studying these. */
  stillStudyTopics: string[]
  /** Overall headline verdict. */
  verdict: 'improved' | 'steady' | 'declined'
  headline: string
}

function pct(correct: number, total: number): number {
  return total > 0 ? Math.round((correct / total) * 100) : 0
}

function makeDelta(
  label: string,
  preCorrect: number,
  preTotal: number,
  postCorrect: number,
  postTotal: number,
): SectionDelta {
  const prePct = pct(preCorrect, preTotal)
  const postPct = pct(postCorrect, postTotal)
  return {
    label,
    prePct,
    postPct,
    delta: postPct - prePct,
    preFraction: `${preCorrect}/${preTotal}`,
    postFraction: `${postCorrect}/${postTotal}`,
  }
}

/** Set of topics the student answered correctly in a record. */
function correctTopics(record: DiagnosticRecord): Set<string> {
  return new Set(record.results.filter((r) => r.correct).map((r) => r.question.topic))
}

/** Set of topics the student missed in a record. */
function missedTopics(record: DiagnosticRecord): Set<string> {
  return new Set(record.results.filter((r) => !r.correct).map((r) => r.question.topic))
}

/**
 * Compare a post-plan diagnostic against the original pre-plan diagnostic and
 * derive a friendly, actionable summary of how much the student improved.
 */
export function compareDiagnostics(
  pre: DiagnosticRecord,
  post: DiagnosticRecord,
): DiagnosticComparison {
  const overall = makeDelta('Overall', pre.correct, pre.total, post.correct, post.total)
  const math = makeDelta('Math', pre.mathCorrect, pre.mathTotal, post.mathCorrect, post.mathTotal)
  const rw = makeDelta(
    'Reading & Writing',
    pre.rwCorrect,
    pre.rwTotal,
    post.rwCorrect,
    post.rwTotal,
  )

  const preMissed = missedTopics(pre)
  const preCorrect = correctTopics(pre)
  const postMissed = missedTopics(post)
  const postCorrect = correctTopics(post)

  // Improved: missed before, correct now.
  const improvedTopics = [...postCorrect].filter((t) => preMissed.has(t)).sort()
  // Consistent strengths: correct both times.
  const consistentStrengths = [...postCorrect].filter((t) => preCorrect.has(t)).sort()
  // Still study: missed in the post diagnostic.
  const stillStudyTopics = [...postMissed].sort()

  let verdict: DiagnosticComparison['verdict'] = 'steady'
  if (overall.delta >= 3) verdict = 'improved'
  else if (overall.delta <= -3) verdict = 'declined'

  let headline: string
  if (verdict === 'improved') {
    headline = `You improved by ${overall.delta} points, from ${overall.prePct}% to ${overall.postPct}%. The plan is working.`
  } else if (verdict === 'declined') {
    headline = `Your score dipped ${Math.abs(overall.delta)} points this time. That happens. Let's tighten the weak spots below.`
  } else {
    headline = `You held steady at about ${overall.postPct}%. Lock in the topics below to push higher.`
  }

  return {
    overall,
    math,
    rw,
    improvedTopics,
    consistentStrengths,
    stillStudyTopics,
    verdict,
    headline,
  }
}
