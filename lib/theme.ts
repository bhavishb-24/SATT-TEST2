// Panic-level driven theme. 1-2 calm blue, 3 amber, 4-5 red/urgent.
export interface PanicTheme {
  // Tailwind class fragments
  accentBg: string
  accentBgSoft: string
  accentText: string
  accentBorder: string
  accentRing: string
  gradientFrom: string
  label: string
  badge: string
  urgentCopy: string | null
  // Raw hex for non-Tailwind contexts (charts, SVG fills)
  accentHex: string
}

// The brand accent is a consistent coral-red (--primary) across every screen,
// matching the SAT Emergency Room design. Panic level only changes the small
// status label, its badge color, and whether we show urgent copy.
const BRAND_ACCENT = {
  accentBg: 'bg-primary',
  accentBgSoft: 'bg-primary/10',
  accentText: 'text-primary',
  accentBorder: 'border-primary/40',
  accentRing: 'ring-primary',
  gradientFrom: 'from-primary',
    accentHex: '#0e8a6a',
} as const

export function getPanicTheme(panic: number): PanicTheme {
  if (panic >= 4) {
    return {
      ...BRAND_ACCENT,
      label: panic === 5 ? 'Full panic mode' : 'Very stressed',
      badge: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
      urgentCopy: 'OK. We’ve got this. Here’s exactly what to do.',
    }
  }
  if (panic === 3) {
    return {
      ...BRAND_ACCENT,
      label: 'Pretty stressed',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
      urgentCopy: null,
    }
  }
  return {
    ...BRAND_ACCENT,
    label: panic === 1 ? 'Feeling okay' : 'A little nervous',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    urgentCopy: null,
  }
}

export function scoreImpactColor(percent: number): {
  bar: string
  text: string
} {
  if (percent >= 80)
    return { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' }
  if (percent >= 65)
    return { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' }
  return { bar: 'bg-slate-400', text: 'text-slate-500 dark:text-slate-400' }
}

export function difficultyBadge(difficulty: string): string {
  const d = difficulty.toLowerCase()
  if (d.includes('quick'))
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
  if (d.includes('heavy'))
    return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
  return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
}
