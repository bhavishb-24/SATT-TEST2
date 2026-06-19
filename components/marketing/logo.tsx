import Link from 'next/link'
import Image from 'next/image'
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
      className={className}
      aria-label={`${SITE.name} home`}
    >
      <Image
        src="/logo.png"
        alt={SITE.name}
        width={40}
        height={40}
        className="h-10 w-10 transition-transform hover:scale-105"
      />
    </Link>
  )
}
