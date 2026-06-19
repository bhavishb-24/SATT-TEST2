import { MarketingShell } from '@/components/marketing/marketing-shell'
import { Hero } from '@/components/marketing/hero'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { Faq } from '@/components/marketing/faq'

export default function HomePage() {
  return (
    <MarketingShell>
      <Hero />
      <HowItWorks />
      <Faq />
    </MarketingShell>
  )
}
