import Link from 'next/link'
import { SITE } from '@/lib/site'
import { Glass } from '@/components/ui/liquid-glass'

export function CtaBand() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 lg:px-8 lg:py-28">
        <Glass className="flex flex-col items-center gap-6 rounded-3xl bg-foreground/90 px-6 py-14 text-center text-background lg:px-12 lg:py-20">
          <span className="ti ti-heartbeat text-4xl text-primary" aria-hidden="true" />
          <h2 className="max-w-2xl text-balance font-serif text-4xl font-normal tracking-tight sm:text-5xl lg:text-6xl">
            The test is close. You don&apos;t have to face it alone.
          </h2>
          <p className="max-w-xl text-pretty text-lg leading-relaxed opacity-80">
            Get a calm, personalized plan in about 60 seconds. No sign-up, no cost. Just the
            focused help you need, right now.
          </p>
          <Link
            href={SITE.appPath}
            className="flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-100"
          >
            Join waitlist, free
            <span className="ti ti-arrow-right text-lg" aria-hidden="true" />
          </Link>
        </Glass>
      </div>
    </section>
  )
}
