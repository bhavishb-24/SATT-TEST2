export const SITE = {
  name: 'SAT Sage',
  shortName: 'SAT Sage',
  tagline: 'Your AI-powered SAT coach. Now in beta.',
  appPath: '/waitlist',
  supportEmail: 'help@satemergencyroom.com',
  // The date legal documents were last revised. Update when policies change.
  legalUpdated: 'June 18, 2026',
} as const

/** Primary navigation shown in the marketing header. */
export const NAV_LINKS = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'FAQ', href: '/faq' },
  { label: 'About', href: '/about' },
  { label: 'Waitlist', href: '/waitlist' },
] as const

/** Footer link groups. */
export const FOOTER_GROUPS = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '/how-it-works' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Waitlist', href: '/waitlist' },
      { label: 'Join waitlist', href: '/waitlist' },
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
