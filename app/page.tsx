import { MarketingShell } from '@/components/marketing/marketing-shell'
import { Hero } from '@/components/marketing/hero'
import { Features } from '@/components/marketing/features'

export default function HomePage() {
  return (
    <MarketingShell>
      <Hero />
      <Features />
    </MarketingShell>
  )
}
