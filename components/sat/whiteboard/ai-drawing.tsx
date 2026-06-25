'use client'

import { cn } from '@/lib/utils'

interface AiDrawingProps {
  /** Number of ink steps revealed (0 = blank, 9 = complete). */
  step: number
}

// Cursor resting position at the end of each step's stroke (board coords).
const CURSOR_POS: Record<number, { x: number; y: number }> = {
  1: { x: 560, y: 400 },
  2: { x: 282, y: 390 },
  3: { x: 205, y: 280 },
  4: { x: 410, y: 440 },
  5: { x: 452, y: 250 },
  6: { x: 770, y: 180 },
  7: { x: 770, y: 232 },
  8: { x: 770, y: 284 },
  9: { x: 700, y: 344 },
}

/** A self-drawing stroke (path/line/polyline) normalized to pathLength 100. */
function Ink({
  d,
  on,
  color = 'var(--foreground)',
  width = 3,
  delay = 0,
}: {
  d: string
  on: boolean
  color?: string
  width?: number
  delay?: number
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={100}
      strokeDasharray={100}
      strokeDashoffset={on ? 0 : 100}
      className="ai-stroke"
      style={{ transitionDelay: `${delay}ms` }}
    />
  )
}

/** A label / equation that fades + rises into place. */
function InkText({
  x,
  y,
  on,
  children,
  color = 'var(--primary)',
  size = 30,
  weight = 600,
  anchor = 'middle',
}: {
  x: number
  y: number
  on: boolean
  children: React.ReactNode
  color?: string
  size?: number
  weight?: number
  anchor?: 'start' | 'middle' | 'end'
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      className="ai-ink font-serif"
      style={{
        fill: color,
        fontSize: size,
        fontWeight: weight,
        opacity: on ? 1 : 0,
        transform: on ? 'translateY(0)' : 'translateY(8px)',
        transformBox: 'fill-box',
        transformOrigin: 'center',
      }}
    >
      {children}
    </text>
  )
}

export function AiDrawing({ step }: AiDrawingProps) {
  const cursor = CURSOR_POS[Math.min(step, 9)] ?? CURSOR_POS[1]
  const cursorVisible = step > 0 && step < 9

  return (
    <svg
      viewBox="0 0 820 520"
      className="pointer-events-none absolute left-1/2 top-1/2 w-[min(92%,760px)] -translate-x-1/2 -translate-y-1/2"
      aria-label="AI tutor's drawing of a right triangle and the Pythagorean solution"
    >
      {/* Step 0 — triangle outline (A top, B bottom-left right-angle, C bottom-right) */}
      <Ink d="M260,150 L260,400 L560,400 Z" on={step >= 1} width={3.5} />

      {/* Vertex labels appear with the triangle */}
      <InkText x={236} y={150} on={step >= 1} color="var(--muted-foreground)" size={24} anchor="end">
        A
      </InkText>
      <InkText x={236} y={416} on={step >= 1} color="var(--muted-foreground)" size={24} anchor="end">
        B
      </InkText>
      <InkText x={584} y={420} on={step >= 1} color="var(--muted-foreground)" size={24} anchor="start">
        C
      </InkText>

      {/* Step 1 — right-angle square at B */}
      <Ink d="M260,372 L288,372 L288,400" on={step >= 2} color="var(--primary)" width={2.5} />

      {/* Step 2 — leg AB = 6 */}
      <InkText x={200} y={285} on={step >= 3}>
        6
      </InkText>

      {/* Step 3 — leg BC = 8 */}
      <InkText x={410} y={446} on={step >= 4}>
        8
      </InkText>

      {/* Step 4 — hypotenuse AC = ? */}
      <InkText x={452} y={252} on={step >= 5} color="var(--destructive)">
        ?
      </InkText>

      {/* Equation stack (right side) */}
      <InkText x={600} y={188} on={step >= 6} anchor="start" color="var(--foreground)" size={30}>
        a² + b² = c²
      </InkText>
      <InkText x={600} y={240} on={step >= 7} anchor="start" color="var(--foreground)" size={30}>
        6² + 8² = c²
      </InkText>
      <InkText x={600} y={292} on={step >= 8} anchor="start" color="var(--foreground)" size={30}>
        36 + 64 = 100
      </InkText>

      {/* Step 8 — final answer, circled */}
      <InkText x={600} y={348} on={step >= 9} anchor="start" color="var(--primary)" size={34} weight={700}>
        AC = 10
      </InkText>
      <Ink
        d="M588,326 q60,-16 118,4 q22,18 -6,34 q-66,16 -118,-4 q-20,-18 6,-34 Z"
        on={step >= 9}
        color="var(--primary)"
        width={2.5}
        delay={200}
      />

      {/* The AI's pen — a soft dot that travels to each freshly written stroke */}
      {cursorVisible && (
        <g
          style={{
            transform: `translate(${cursor.x}px, ${cursor.y}px)`,
            transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <circle r={9} className={cn('ink-pulse')} fill="var(--primary)" opacity={0.25} />
          <circle r={4} fill="var(--primary)" />
        </g>
      )}
    </svg>
  )
}
