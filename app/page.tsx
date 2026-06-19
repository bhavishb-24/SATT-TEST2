import { MarketingShell } from '@/components/marketing/marketing-shell'
import { Hero } from '@/components/marketing/hero'
import { Features } from '@/components/marketing/features'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { Testimonials } from '@/components/marketing/testimonials'
import { Faq } from '@/components/marketing/faq'
import { CtaBand } from '@/components/marketing/cta-band'

export default function HomePage() {
  return (
    <MarketingShell>
      <Hero />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Faq />
      <CtaBand />
    </MarketingShell>
  )
}
