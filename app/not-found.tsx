import Link from 'next/link'
import { MarketingShell } from '@/components/marketing/marketing-shell'
import { SITE } from '@/lib/site'

export default function NotFound() {
  return (
    <MarketingShell>
      <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-5 py-24 text-center lg:py-32">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <span className="ti ti-map-pin-off text-3xl" aria-hidden="true" />
        </span>
        <p className="text-sm font-bold uppercase tracking-wider text-primary">Error 404</p>
        <h1 className="text-balance text-4xl font-extrabold tracking-tight lg:text-5xl">
          This page took a wrong turn
        </h1>
        <p className="max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back
          on track.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-border bg-card px-7 text-base font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Back to home
          </Link>
          <Link
            href={SITE.appPath}
            className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Join waitlist
            <span className="ti ti-arrow-right text-lg" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  )
}
