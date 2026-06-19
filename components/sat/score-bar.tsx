'use client'

import { scoreImpactColor } from '@/lib/theme'

export function ScoreBar({ percent }: { percent: number }) {
  const { bar, text } = scoreImpactColor(percent)
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Score impact (estimated)</span>
        <span className={`font-semibold ${text}`}>{clamped}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  )
}
