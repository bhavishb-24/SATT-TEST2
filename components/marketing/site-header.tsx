'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { NAV_LINKS, SITE } from '@/lib/site'
import { Logo } from './logo'

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 lg:px-8">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={SITE.appPath}
            className="hidden min-h-[40px] items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:flex"
          >
            Join waitlist
            <span className="ti ti-arrow-right text-base" aria-hidden="true" />
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            <span className={cn('ti text-xl', open ? 'ti-x' : 'ti-menu-2')} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-menu"
          className="animate-fade-in border-t border-border bg-background md:hidden"
        >
          <nav
            className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-4"
            aria-label="Mobile"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={SITE.appPath}
              onClick={() => setOpen(false)}
              className="mt-2 flex min-h-[48px] items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-base font-semibold text-primary-foreground"
            >
              Join waitlist
              <span className="ti ti-arrow-right text-base" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
