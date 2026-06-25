'use client'

import { cn } from '@/lib/utils'
import type { SolveStep } from './lesson-data'

interface AiSolutionProps {
  title: string
  steps: SolveStep[]
  /** Number of steps revealed so far (0 = nothing, steps.length = complete). */
  step: number
  answer: string
}

/**
 * Renders a live AI-generated worked solution as handwritten board lines that
 * appear one at a time. Used for student-entered questions (the polished
 * triangle <AiDrawing /> is reserved for the built-in geometry demo).
 */
export function AiSolution({ title, steps, step, answer }: AiSolutionProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Topic heading */}
        <p
          className={cn(
            'mb-5 font-serif text-2xl font-bold text-foreground transition-all duration-500',
            step >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
          )}
        >
          {title}
        </p>

        <ol className="flex flex-col gap-4">
          {steps.map((s, i) => {
            const on = step >= i + 1
            const isLast = i === steps.length - 1
            return (
              <li
                key={i}
                className={cn(
                  'flex items-start gap-3 transition-all duration-500',
                  on ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
                )}
                style={{ transitionDelay: on ? `${Math.min(i, 2) * 60}ms` : '0ms' }}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                    isLast
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10 text-primary',
                  )}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span
                  className={cn(
                    'font-serif text-xl leading-relaxed text-foreground',
                    isLast && 'font-bold',
                  )}
                >
                  {s.board}
                </span>
              </li>
            )
          })}
        </ol>

        {/* Final answer banner once fully revealed */}
        {step >= steps.length && steps.length > 0 && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border-2 border-primary bg-primary/5 px-4 py-2 ai-ink">
            <i className="ti ti-circle-check text-xl text-primary" aria-hidden="true" />
            <span className="font-serif text-xl font-bold text-primary">Answer: {answer}</span>
          </div>
        )}
      </div>
    </div>
  )
}
