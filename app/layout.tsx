import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Instrument_Serif } from 'next/font/google'
import './globals.css'
import { GlassFilter } from '@/components/ui/liquid-glass'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
})

const SITE_URL = 'https://sat-sage.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'SAT Sage: Your free SAT coach',
    template: '%s | SAT Sage',
  },
  description:
    'A free, AI-powered SAT study coach for any student within 12 months of their test. Get a personalized plan, practice drills, formulas, and a calm path from panic to ready. No sign-up required.',
  applicationName: 'SAT Sage',
  keywords: [
    'SAT prep',
    'last minute SAT',
    'night before SAT',
    'free SAT coach',
    'AI study plan',
    'SAT practice',
    'SAT formulas',
  ],
  authors: [{ name: 'SAT Sage' }],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'SAT Sage: Your free SAT coach',
    description:
      'Wealthy students hire a tutor the night before. Now you have one too, for free. A calm, personalized plan to go from panic to ready.',
    siteName: 'SAT Sage',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SAT Sage' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SAT Sage: Your free SAT coach',
    description:
      'A free, AI-powered SAT coach for students within 12 months of their test. From panic to a clear plan.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FAFAF8',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`light ${inter.variable} ${instrumentSerif.variable} bg-background`}
      style={{ colorScheme: 'light' }}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <GlassFilter />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
