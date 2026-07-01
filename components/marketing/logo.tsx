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
            "brightness(0) saturate(100%) invert(80%) sepia(20%) saturate(400%) hue-rotate(180deg) brightness(110%)",
        }}
      />
    </Link>
  )
}
