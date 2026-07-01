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
        width={56}
        height={56}
        className="h-14 w-14 transition-transform hover:scale-105"
        style={{
          filter:
            "brightness(0) saturate(100%) invert(30%) sepia(60%) saturate(600%) hue-rotate(175deg) brightness(95%)",
        }}
      />
    </Link>
  )
}
