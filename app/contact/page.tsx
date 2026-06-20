import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingShell } from '@/components/marketing/marketing-shell'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with the SAT Sage team. Questions, feedback, or a bug to report — we read everything.',
}

const CHANNELS = [
  {
    icon: 'ti-mail',
    title: 'Email us',
    body: 'For anything at all — questions, feedback, or a wrong answer you spotted.',
    actionLabel: SITE.supportEmail,
    href: `mailto:${SITE.supportEmail}`,
  },
  {
    icon: 'ti-bug',
    title: 'Report a problem',
    body: 'Something broken or a question that looks off? Tell us what happened and we will fix it.',
    actionLabel: 'Email a bug report',
    href: `mailto:${SITE.supportEmail}?subject=Bug%20report`,
  },
  {
    icon: 'ti-bulb',
    title: 'Share an idea',
    body: 'We build this for students. If there is something that would help you, we want to hear it.',
    actionLabel: 'Send a suggestion',
    href: `mailto:${SITE.supportEmail}?subject=Feature%20idea`,
  },
]

export default function ContactPage() {
  return (
    <MarketingShell>
      <section>
        <div className="mx-auto w-full max-w-3xl px-5 py-16 lg:px-8 lg:py-24">
          <span className="text-sm font-bold uppercase tracking-wider text-primary">
            Contact
          </span>
          <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight lg:text-5xl">
            We&apos;d love to hear from you
          </h1>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
            {SITE.name} is built by a small team that genuinely reads every message. Whether
            you&apos;re stuck, you found a bug, or you just want to say the panic button helped —
            reach out.
          </p>

          <ul className="mt-10 flex flex-col gap-4">
            {CHANNELS.map((c) => (
              <li
                key={c.title}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <span className={`${c.icon} ti text-2xl`} aria-hidden="true" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-bold tracking-tight">{c.title}</h2>
                    <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                      {c.body}
                    </p>
                  </div>
                </div>
                <a
                  href={c.href}
                  className="flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary sm:ml-4"
                >
                  {c.actionLabel}
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm text-muted-foreground">
            Looking for answers first? Check the{' '}
            <Link href="/#faq" className="font-medium text-primary underline underline-offset-2">
              FAQ
            </Link>{' '}
            — it covers the most common questions.
          </p>
        </div>
      </section>
    </MarketingShell>
  )
}
