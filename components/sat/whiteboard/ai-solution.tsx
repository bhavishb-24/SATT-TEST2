'use client'

import { cn } from '@/lib/utils'
import type {
  AnnotationSpec,
  DiagramElement,
  GraphSpec,
  SolveStep,
  VisualKind,
} from './lesson-data'

interface AiSolutionProps {
  title: string
  steps: SolveStep[]
  /** Which visual representation to render. */
  visual?: VisualKind
  /** Geometry elements to draw (visual = "geometry"). */
  diagram?: DiagramElement[]
  /** Coordinate-plane graph (visual = "graph"). */
  graph?: GraphSpec | null
  /** Sentence annotation (visual = "annotation"). */
  annotation?: AnnotationSpec | null
  /** Number of steps revealed so far (0 = nothing, steps.length = complete). */
  step: number
  answer: string
}

/**
 * Renders a live AI-generated worked solution. Depending on the question, the
 * AI supplies one visual — a geometry diagram, a coordinate graph, or an
 * annotated sentence — which builds up step by step beside the written work.
 */
export function AiSolution({
  title,
  steps,
  visual,
  diagram,
  graph,
  annotation,
  step,
  answer,
}: AiSolutionProps) {
  const hasDiagram = visual === 'geometry' && Array.isArray(diagram) && diagram.length > 0
  const hasGraph = visual === 'graph' && !!graph && graph.items.length > 0
  const hasAnnotation = visual === 'annotation' && !!annotation && annotation.text.length > 0
  const hasVisual = hasDiagram || hasGraph || hasAnnotation

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 sm:p-6">
      <div
        className={cn(
          'flex w-full max-w-4xl gap-6',
          hasVisual ? 'flex-col items-center lg:flex-row lg:items-center' : 'max-w-2xl flex-col',
        )}
      >
        {hasVisual && (
          <div className="w-full shrink-0 lg:w-1/2">
            {hasDiagram && <BoardDiagram elements={diagram!} step={step} />}
            {hasGraph && <GraphBoard spec={graph!} step={step} />}
            {hasAnnotation && <AnnotationBoard spec={annotation!} step={step} />}
          </div>
        )}

        <div className={cn('w-full', hasVisual && 'lg:w-1/2')}>
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

  // Figure center — used to push vertex labels OUTWARD so they never sit on top
  // of the shape's edges, regardless of which side the vertex is on.
  const coords: { x: number; y: number }[] = []
  for (const el of elements) {
    if (el.points?.length) coords.push(...el.points)
    if (el.cx != null && el.cy != null) coords.push({ x: el.cx, y: el.cy })
    if (el.x != null && el.y != null) coords.push({ x: el.x, y: el.y })
  }
  const center =
    coords.length > 0
      ? {
          x: coords.reduce((sum, p) => sum + p.x, 0) / coords.length,
          y: coords.reduce((sum, p) => sum + p.y, 0) / coords.length,
        }
      : { x: 50, y: 50 }

  // Position a vertex label just outside the shape, away from the center.
  const labelPos = (x: number, y: number, distance = 6) => {
    const dx = x - center.x
    const dy = y - center.y
    const len = Math.hypot(dx, dy) || 1
    return { x: x + (dx / len) * distance, y: y + (dy / len) * distance }
  }

  return (
    <svg
      viewBox="-10 -10 120 120"
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
          const lp = labelPos(el.x, el.y)
          return (
            <g key={i} {...common}>
              <circle cx={el.x} cy={el.y} r={1.2} fill="var(--foreground)" />
              {el.text && (
                <text
                  x={lp.x}
                  y={lp.y}
                  fontSize={5}
                  fontWeight={700}
                  fill="var(--foreground)"
                  textAnchor="middle"
                  dominantBaseline="middle"
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
              className={cn('font-serif', common.className)}
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

/**
 * Draws a coordinate-plane graph (axes, grid, lines, curves, points) from an
 * AI-supplied spec in MATH coordinates, revealing each plotted item by step.
 */
function GraphBoard({ spec, step }: { spec: GraphSpec; step: number }) {
  // SVG canvas is 100x100; map math (x,y) into it, flipping y so up is positive.
  const { xMin, xMax, yMin, yMax } = spec
  const W = 100
  const H = 100
  const sx = (x: number) => ((x - xMin) / (xMax - xMin)) * W
  const sy = (y: number) => H - ((y - yMin) / (yMax - yMin)) * H
  const clamp = (v: number) => Math.max(-20, Math.min(W + 20, v))

  // Integer gridlines within the window (cap the count so it stays readable).
  const xTicks: number[] = []
  const yTicks: number[] = []
  const xStep = Math.max(1, Math.ceil((xMax - xMin) / 12))
  const yStep = Math.max(1, Math.ceil((yMax - yMin) / 12))
  for (let x = Math.ceil(xMin); x <= xMax; x += xStep) xTicks.push(x)
  for (let y = Math.ceil(yMin); y <= yMax; y += yStep) yTicks.push(y)

  const x0 = sx(0)
  const y0 = sy(0)
  const axisX = Math.max(0, Math.min(W, x0))
  const axisY = Math.max(0, Math.min(H, y0))

  // Sample a function expression safely across the window.
  const sampleCurve = (expr: string): string => {
    let d = ''
    let started = false
    const fn = (() => {
      try {
        // eslint-disable-next-line no-new-func
        return new Function('x', `with (Math) { return (${expr}); }`) as (x: number) => number
      } catch {
        return null
      }
    })()
    if (!fn) return ''
    const N = 120
    for (let i = 0; i <= N; i++) {
      const x = xMin + ((xMax - xMin) * i) / N
      let y: number
      try {
        y = fn(x)
      } catch {
        started = false
        continue
      }
      if (!Number.isFinite(y) || y < yMin - (yMax - yMin) || y > yMax + (yMax - yMin)) {
        started = false
        continue
      }
      const px = sx(x)
      const py = sy(y)
      d += `${started ? 'L' : 'M'} ${px.toFixed(2)} ${py.toFixed(2)} `
      started = true
    }
    return d
  }

  return (
    <svg
      viewBox="-12 -12 124 124"
      className="h-auto w-full max-w-md"
      role="img"
      aria-label="Coordinate graph of the problem"
    >
      {/* Grid */}
      {xTicks.map((x, i) => (
        <line
          key={`gx${i}`}
          x1={sx(x)}
          y1={0}
          x2={sx(x)}
          y2={H}
          stroke="var(--border)"
          strokeWidth={0.4}
        />
      ))}
      {yTicks.map((y, i) => (
        <line
          key={`gy${i}`}
          x1={0}
          y1={sy(y)}
          x2={W}
          y2={sy(y)}
          stroke="var(--border)"
          strokeWidth={0.4}
        />
      ))}

      {/* Axes */}
      <line x1={0} y1={axisY} x2={W} y2={axisY} stroke="var(--foreground)" strokeWidth={0.8} />
      <line x1={axisX} y1={0} x2={axisX} y2={H} stroke="var(--foreground)" strokeWidth={0.8} />

      {/* Axis number labels */}
      {xTicks.map((x, i) =>
        x === 0 ? null : (
          <text
            key={`tx${i}`}
            x={sx(x)}
            y={Math.min(H - 1, axisY + 4)}
            fontSize={3.2}
            fill="var(--muted-foreground)"
            textAnchor="middle"
          >
            {x}
          </text>
        ),
      )}
      {yTicks.map((y, i) =>
        y === 0 ? null : (
          <text
            key={`ty${i}`}
            x={Math.max(2, axisX - 1.5)}
            y={sy(y) + 1}
            fontSize={3.2}
            fill="var(--muted-foreground)"
            textAnchor="end"
          >
            {y}
          </text>
        ),
      )}

      {/* Plotted items, revealed by step */}
      {spec.items.map((it, i) => {
        const on = step >= it.revealAt + 1
        const common = {
          className: cn('transition-opacity duration-500', on ? 'opacity-100' : 'opacity-0'),
        }

        if (it.kind === 'line' && it.m != null && it.b != null) {
          const yA = it.m * xMin + it.b
          const yB = it.m * xMax + it.b
          return (
            <g key={i} {...common}>
              <line
                x1={clamp(sx(xMin))}
                y1={clamp(sy(yA))}
                x2={clamp(sx(xMax))}
                y2={clamp(sy(yB))}
                stroke="var(--primary)"
                strokeWidth={1.1}
                strokeLinecap="round"
              />
              {it.label && (
                <text x={sx(xMax) - 1} y={sy(yB) - 1.5} fontSize={3.4} fill="var(--primary)" textAnchor="end" fontWeight={700}>
                  {it.label}
                </text>
              )}
            </g>
          )
        }

        if (it.kind === 'curve' && it.expr) {
          const d = sampleCurve(it.expr)
          return (
            <g key={i} {...common}>
              <path d={d} fill="none" stroke="var(--primary)" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" />
              {it.label && (
                <text x={sx(xMax) - 1} y={4} fontSize={3.4} fill="var(--primary)" textAnchor="end" fontWeight={700}>
                  {it.label}
                </text>
              )}
            </g>
          )
        }

        if (it.kind === 'segment' && it.x1 != null && it.y1 != null && it.x2 != null && it.y2 != null) {
          return (
            <line
              key={i}
              x1={sx(it.x1)}
              y1={sy(it.y1)}
              x2={sx(it.x2)}
              y2={sy(it.y2)}
              stroke="var(--primary)"
              strokeWidth={1.1}
              strokeLinecap="round"
              {...common}
            />
          )
        }

        if (it.kind === 'point' && it.px != null && it.py != null) {
          return (
            <g key={i} {...common}>
              <circle cx={sx(it.px)} cy={sy(it.py)} r={1.6} fill="var(--primary)" />
              {it.label && (
                <text x={sx(it.px) + 2.2} y={sy(it.py) - 2} fontSize={3.4} fill="var(--foreground)" fontWeight={700}>
                  {it.label}
                </text>
              )}
            </g>
          )
        }

        return null
      })}
    </svg>
  )
}

/**
 * Renders a sentence/passage for English questions and visually marks it up —
 * underlines, circles, highlights, strikethroughs, boxes — plus margin notes,
 * revealing each annotation as the lesson steps advance.
 */
function AnnotationBoard({ spec, step }: { spec: AnnotationSpec; step: number }) {
  // Split the text into segments, tagging any that match a revealed mark.
  type Seg = { text: string; mark: AnnotationSpec['marks'][number] | null }
  const marks = [...spec.marks].sort(
    (a, b) => spec.text.indexOf(a.phrase) - spec.text.indexOf(b.phrase),
  )

  const segs: Seg[] = []
  let cursor = 0
  for (const m of marks) {
    const idx = spec.text.indexOf(m.phrase, cursor)
    if (idx < 0) continue
    if (idx > cursor) segs.push({ text: spec.text.slice(cursor, idx), mark: null })
    segs.push({ text: spec.text.slice(idx, idx + m.phrase.length), mark: m })
    cursor = idx + m.phrase.length
  }
  if (cursor < spec.text.length) segs.push({ text: spec.text.slice(cursor), mark: null })

  const markClass = (type: AnnotationSpec['marks'][number]['type']) => {
    switch (type) {
      case 'underline':
        return 'underline decoration-primary decoration-2 underline-offset-4'
      case 'circle':
        return 'rounded-full ring-2 ring-primary px-1.5 py-0.5'
      case 'box':
        return 'rounded-md ring-2 ring-primary px-1.5 py-0.5'
      case 'highlight':
        return 'bg-primary/20 rounded px-0.5'
      case 'strike':
        return 'line-through decoration-destructive decoration-2'
      default:
        return ''
    }
  }

  const activeNotes = marks.filter((m) => m.note && step >= m.revealAt + 1)

  return (
    <div className="rounded-2xl border border-border bg-background/80 p-5 shadow-sm">
      <p className="font-serif text-xl leading-loose text-foreground sm:text-2xl">
        {segs.map((seg, i) => {
          const on = seg.mark && step >= seg.mark.revealAt + 1
          return (
            <span
              key={i}
              className={cn(
                'transition-all duration-500',
                on ? markClass(seg.mark!.type) : '',
              )}
            >
              {seg.text}
            </span>
          )
        })}
      </p>

      {activeNotes.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2 border-t border-border pt-3">
          {activeNotes.map((m, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <i className="ti ti-arrow-right mt-0.5 text-primary" aria-hidden="true" />
              <span>
                <span className="font-semibold text-foreground">{m.phrase}</span>
                {' — '}
                {m.note}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
