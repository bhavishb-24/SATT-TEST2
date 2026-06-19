export const SITE = {
  name: 'SAT Emergency Room',
  shortName: 'SAT ER',
  tagline: 'Your free last-minute SAT coach',
  appPath: '/app',
  supportEmail: 'help@satemergencyroom.com',
  // The date legal documents were last revised. Update when policies change.
  legalUpdated: 'June 18, 2026',
} as const

/** Primary navigation shown in the marketing header. */
export const NAV_LINKS = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Features', href: '/#features' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'About', href: '/about' },
] as const

/** Footer link groups. */
export const FOOTER_GROUPS = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Features', href: '/#features' },
      { label: 'FAQ', href: '/#faq' },
      { label: 'Open the app', href: '/app' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
] as const
