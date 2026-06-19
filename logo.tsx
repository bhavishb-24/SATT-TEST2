import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SITE } from '@/lib/site'

export function Logo({
  className,
  href = '/',
}: {
  className?: string
  href?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-2 font-extrabold tracking-tight text-foreground',
        className,
      )}
      aria-label={`${SITE.name} home`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
        <span className="ti ti-heartbeat text-lg" aria-hidden="true" />
      </span>
      <span className="text-base leading-none">
        SAT <span className="text-primary">Emergency Room</span>
      </span>
    </Link>
  )
}
