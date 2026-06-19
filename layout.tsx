import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const SITE_URL = 'https://sat-emergency-room.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'SAT Emergency Room — Your free last-minute SAT coach',
    template: '%s — SAT Emergency Room',
  },
  description:
    'A free, AI-powered SAT study coach for the night before the test. Get a personalized plan, practice drills, formulas, and a calm path from panic to ready — no sign-up required.',
  applicationName: 'SAT Emergency Room',
  keywords: [
    'SAT prep',
    'last minute SAT',
    'night before SAT',
    'free SAT coach',
    'AI study plan',
    'SAT practice',
    'SAT formulas',
  ],
  authors: [{ name: 'SAT Emergency Room' }],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'SAT Emergency Room — Your free last-minute SAT coach',
    description:
      'Wealthy students hire a tutor the night before. Now you have one too — free. A calm, personalized plan to go from panic to ready.',
    siteName: 'SAT Emergency Room',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SAT Emergency Room' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SAT Emergency Room — Your free last-minute SAT coach',
    description:
      'A free, AI-powered SAT coach for the night before the test. From panic to a clear plan.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f4f0' },
    { media: '(prefers-color-scheme: dark)', color: '#16140f' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} bg-background`}>
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
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
