'use client'

import { cn } from '@/lib/utils'
import type { DiagramElement, SolveStep } from './lesson-data'

interface AiSolutionProps {
  title: string
  steps: SolveStep[]
  /** Geometry elements to draw, or empty for non-geometry questions. */
  diagram?: DiagramElement[]
  /** Number of steps revealed so far (0 = nothing, steps.length = complete). */
  step: number
  answer: string
}

/**
 * Renders a live AI-generated worked solution. When the AI returns a geometry
 * diagram, it is drawn as handwritten-style SVG that builds up step by step
 * alongside the written work. Otherwise the steps are shown on their own.
 */
export function AiSolution({ title, steps, diagram, step, answer }: AiSolutionProps) {
  const hasDiagram = Array.isArray(diagram) && diagram.length > 0

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 sm:p-6">
      <div
        className={cn(
          'flex w-full max-w-4xl gap-6',
          hasDiagram ? 'flex-col items-center lg:flex-row lg:items-center' : 'max-w-2xl flex-col',
        )}
      >
        {hasDiagram && (
          <div className="w-full shrink-0 lg:w-1/2">
            <BoardDiagram elements={diagram!} step={step} />
          </div>
        )}

        <div className={cn('w-full', hasDiagram && 'lg:w-1/2')}>
          {/* Topic heading */}
          <p
            className={cn(
              'mb-4 font-serif text-2xl font-bold text-foreground transition-all duration-500',
              step >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
            )}
          >
            {title}
          </p>

          <ol className="flex flex-col gap-3">
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
                      isLast ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary',
                    )}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span
                    className={cn(
                      'font-serif text-lg leading-relaxed text-foreground sm:text-xl',
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
            <div className="mt-5 inline-flex items-center gap-2 rounded-2xl border-2 border-primary bg-primary/5 px-4 py-2 ai-ink">
              <i className="ti ti-circle-check text-xl text-primary" aria-hidden="true" />
              <span className="font-serif text-xl font-bold text-primary">Answer: {answer}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Draws AI-described geometry as whiteboard-style SVG in a normalized 0..100
 * coordinate space. Each element fades in once its step has been reached.
 */
function BoardDiagram({ elements, step }: { elements: DiagramElement[]; step: number }) {
  const shown = (el: DiagramElement) => step >= el.revealAt + 1

  return (
    <svg
      viewBox="0 0 100 100"
      className="h-auto w-full max-w-md"
      role="img"
      aria-label="Diagram of the geometry problem"
    >
      {elements.map((el, i) => {
        const on = shown(el)
        const common = {
          className: cn('transition-opacity duration-500', on ? 'opacity-100' : 'opacity-0'),
        }

        if (el.kind === 'polygon' && el.points.length >= 2) {
          const pts = el.points.map((p) => `${p.x},${p.y}`).join(' ')
          return (
            <polygon
              key={i}
              points={pts}
              fill="var(--primary)"
              fillOpacity={0.06}
              stroke="var(--foreground)"
              strokeWidth={0.9}
              strokeLinejoin="round"
              {...common}
            />
          )
        }

        if (el.kind === 'line' && el.points.length >= 2) {
          const [a, b] = el.points
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="var(--foreground)"
              strokeWidth={0.9}
              strokeLinecap="round"
              {...common}
            />
          )
        }

        if (el.kind === 'circle' && el.cx != null && el.cy != null && el.r != null) {
          return (
            <circle
              key={i}
              cx={el.cx}
              cy={el.cy}
              r={el.r}
              fill="var(--primary)"
              fillOpacity={0.06}
              stroke="var(--foreground)"
              strokeWidth={0.9}
              {...common}
            />
          )
        }

        if (el.kind === 'point' && el.x != null && el.y != null) {
          return (
            <g key={i} {...common}>
              <circle cx={el.x} cy={el.y} r={1.2} fill="var(--foreground)" />
              {el.text && (
                <text
                  x={el.x + 2}
                  y={el.y - 2}
                  fontSize={5}
                  fontWeight={700}
                  fill="var(--foreground)"
                  className="font-serif"
                >
                  {el.text}
                </text>
              )}
            </g>
          )
        }

        if (el.kind === 'label' && el.x != null && el.y != null && el.text) {
          return (
            <text
              key={i}
              x={el.x}
              y={el.y}
              fontSize={5.5}
              fontWeight={700}
              fill="var(--primary)"
              textAnchor="middle"
              className="font-serif"
              {...common}
            >
              {el.text}
            </text>
          )
        }

        if (el.kind === 'rightangle' && el.x != null && el.y != null) {
          // Small square marker; orientation is approximate but reads clearly.
          const s = 4
          return (
            <path
              key={i}
              d={`M ${el.x} ${el.y - s} L ${el.x + s} ${el.y - s} L ${el.x + s} ${el.y}`}
              fill="none"
              stroke="var(--foreground)"
              strokeWidth={0.7}
              {...common}
            />
          )
        }

        return null
      })}
    </svg>
  )
}
