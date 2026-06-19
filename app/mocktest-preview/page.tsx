'use client'

import { MockTestView } from '@/components/sat/dashboard/mock-test-view'
import { getPanicTheme } from '@/lib/theme'

export default function MockTestPreview() {
  const theme = getPanicTheme(3)
  return (
    <main className="min-h-dvh bg-background px-4 py-8">
      <MockTestView theme={theme} onAnswer={() => {}} />
    </main>
  )
}
