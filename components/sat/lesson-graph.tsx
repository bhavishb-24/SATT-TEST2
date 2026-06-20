'use client'

// Small, self-contained SVG diagrams used inside study-plan lessons.
// Two kinds: a coordinate-plane line (for slope / linear-equation topics)
// and a simple bar chart (for data-analysis topics). These are illustrative
// math sketches, not data dashboards, so a hand-built SVG is appropriate.

export interface LineGraphData {
  kind: 'line'
  slope: number
  intercept: number
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  points?: { x: number; y: number; label?: string }[]
}

export interface BarGraphData {
  kind: 'bar'
  bars: { label: string; value: number }[]
  yLabel?: string
}

export type GraphData = LineGraphData | BarGraphData

const W = 320
const H = 220
const PAD = 34

function ticks(min: number, max: number, count = 5): number[] {
  const step = (max - min) / count
  const out: number[] = []
  for (let i = 0; i <= count; i++) {
    out.push(Math.round((min + step * i) * 100) / 100)
  }
  return out
}

function LineGraph({ data }: { data: LineGraphData }) {
  const { slope, intercept, xMin, xMax, yMin, yMax, points = [] } = data
  const plotW = W - 2 * PAD
  const plotH = H - 2 * PAD
  const sx = (x: number) => PAD + ((x - xMin) / (xMax - xMin)) * plotW
  const sy = (y: number) => PAD + ((yMax - y) / (yMax - yMin)) * plotH

  // Clamp line endpoints to the visible window.
  function clampEndpoint(x: number): { x: number; y: number } {
    let y = slope * x + intercept
    if (y < yMin) {
      y = yMin
      x = (yMin - intercept) / slope
    } else if (y > yMax) {
      y = yMax
      x = (yMax - intercept) / slope
    }
    return { x, y }
  }
  const p1 = clampEndpoint(xMin)
  const p2 = clampEndpoint(xMax)

  const xTicks = ticks(xMin, xMax)
  const yTicks = ticks(yMin, yMax)
  const showXAxis = yMin <= 0 && yMax >= 0
  const showYAxis = xMin <= 0 && xMax >= 0

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full max-w-sm rounded-xl border border-border bg-card"
      role="img"
      aria-label={`Line graph of y = ${slope}x ${intercept >= 0 ? '+ ' + intercept : '- ' + Math.abs(intercept)}`}
    >
      {/* Gridlines */}
      {xTicks.map((t) => (
        <line
          key={`gx-${t}`}
          x1={sx(t)}
          y1={PAD}
          x2={sx(t)}
          y2={H - PAD}
          className="stroke-border"
          strokeWidth={1}
          opacity={0.4}
        />
      ))}
      {yTicks.map((t) => (
        <line
          key={`gy-${t}`}
          x1={PAD}
          y1={sy(t)}
          x2={W - PAD}
          y2={sy(t)}
          className="stroke-border"
          strokeWidth={1}
          opacity={0.4}
        />
      ))}

      {/* Zero axes */}
      {showXAxis && (
        <line x1={PAD} y1={sy(0)} x2={W - PAD} y2={sy(0)} className="stroke-muted-foreground" strokeWidth={1.5} />
      )}
      {showYAxis && (
        <line x1={sx(0)} y1={PAD} x2={sx(0)} y2={H - PAD} className="stroke-muted-foreground" strokeWidth={1.5} />
      )}

      {/* Tick labels */}
      {xTicks.map((t) => (
        <text key={`lx-${t}`} x={sx(t)} y={H - PAD + 14} textAnchor="middle" className="fill-muted-foreground text-[9px]">
          {t}
        </text>
      ))}
      {yTicks.map((t) => (
        <text key={`ly-${t}`} x={PAD - 6} y={sy(t) + 3} textAnchor="end" className="fill-muted-foreground text-[9px]">
          {t}
        </text>
      ))}

      {/* The line */}
      <line x1={sx(p1.x)} y1={sy(p1.y)} x2={sx(p2.x)} y2={sy(p2.y)} className="stroke-primary" strokeWidth={2.5} strokeLinecap="round" />

      {/* Highlighted points */}
      {points.map((pt, i) => (
        <g key={i}>
          <circle cx={sx(pt.x)} cy={sy(pt.y)} r={4} className="fill-primary" />
          {pt.label && (
            <text x={sx(pt.x) + 7} y={sy(pt.y) - 6} className="fill-foreground text-[9px] font-semibold">
              {pt.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

function BarGraph({ data }: { data: BarGraphData }) {
  const { bars, yLabel } = data
  const plotW = W - 2 * PAD
  const plotH = H - 2 * PAD
  const max = Math.max(...bars.map((b) => b.value)) * 1.15 || 1
  const slot = plotW / bars.length
  const barW = slot * 0.55

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full max-w-sm rounded-xl border border-border bg-card"
      role="img"
      aria-label="Bar chart"
    >
      {/* Baseline */}
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} className="stroke-muted-foreground" strokeWidth={1.5} />
      {yLabel && (
        <text x={PAD - 6} y={PAD - 12} textAnchor="start" className="fill-muted-foreground text-[9px]">
          {yLabel}
        </text>
      )}

      {bars.map((b, i) => {
        const h = (b.value / max) * plotH
        const x = PAD + slot * i + (slot - barW) / 2
        const y = H - PAD - h
        return (
          <g key={b.label}>
            <rect x={x} y={y} width={barW} height={h} rx={3} className="fill-primary" />
            <text x={x + barW / 2} y={y - 5} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">
              {b.value}
            </text>
            <text x={x + barW / 2} y={H - PAD + 14} textAnchor="middle" className="fill-muted-foreground text-[9px]">
              {b.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function LessonGraph({ data }: { data: GraphData }) {
  if (data.kind === 'line') return <LineGraph data={data} />
  return <BarGraph data={data} />
}
