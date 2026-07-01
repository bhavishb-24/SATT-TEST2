import Link from 'next/link'
import { FOOTER_GROUPS, SITE } from '@/lib/site'
import { Logo } from './logo'
import { Glass } from '@/components/ui/liquid-glass'

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/20">
      <Glass className="rounded-none">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          {/* Brand */}
          <div className="flex max-w-xs flex-col gap-4">
            <Logo />
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              A calm, free SAT coach for the night before the test. From panic to a clear plan
              in 60 seconds.
            </p>
          </div>

          {/* Link groups */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-16">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title} className="flex flex-col gap-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </h2>
                <ul className="flex flex-col gap-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-foreground/80 transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {SITE.name}. Made for stressed students everywhere.
          </p>
          <p className="text-pretty">
            Not affiliated with or endorsed by the College Board. SAT is a registered trademark
            of the College Board.
          </p>
        </div>
      </div>
      </Glass>
    </footer>
  )
}
