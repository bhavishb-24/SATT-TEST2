import type { ReactNode } from 'react'
import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}

/**
 * Shared layout for long-form text pages (legal, about). Provides a readable
 * measure, a consistent header block, and prose styling for the body content.
 */
export function ProsePage({
  title,
  intro,
  updated,
  children,
}: {
  title: string
  intro?: string
  updated?: string
  children: ReactNode
}) {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-12 lg:px-8 lg:py-20">
      <header className="flex flex-col gap-3 border-b border-border pb-8">
        <h1 className="font-serif text-4xl font-normal tracking-tight text-balance lg:text-5xl">
          {title}
        </h1>
        {intro && (
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">{intro}</p>
        )}
        {updated && (
          <p className="text-sm text-muted-foreground">Last updated: {updated}</p>
        )}
      </header>
      <div className="prose-legal mt-8 flex flex-col gap-8">{children}</div>
    </article>
  )
}
