import type { Metadata } from 'next'
import { MarketingShell, ProsePage } from '@/components/marketing/marketing-shell'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How SAT Sage handles your data. Short version: no account, no selling data, and your answers stay in your browser.',
}

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <ProsePage
        title="Privacy Policy"
        intro="Your privacy matters, especially when you're stressed. Here's exactly how we handle your information."
        updated={SITE.legalUpdated}
      >
        <section>
          <h2>The short version</h2>
          <p>
            {SITE.name} is built to be used without an account. We do not ask for your name,
            email, or password. The answers you give to build your study plan are processed to
            generate that plan and are stored in <strong>your own browser</strong>, not in a
            database tied to your identity. We do not sell your personal information.
          </p>
        </section>

        <section>
          <h2>Information we process</h2>
          <ul>
            <li>
              <strong>Triage answers.</strong> Details you provide such as your stress level,
              test date and time, target scores, weak areas, and learning style. These are used
              only to generate your study plan and tailor the experience.
            </li>
            <li>
              <strong>Practice activity.</strong> Progress like topics completed, focus time,
              and practice accuracy, kept locally so your dashboard can show your progress.
            </li>
            <li>
              <strong>Technical data.</strong> Standard, privacy-respecting analytics (such as
              page views and aggregate usage) that help us understand whether the product works.
              This does not identify you personally.
            </li>
          </ul>
        </section>

        <section>
          <h2>How we use AI</h2>
          <p>
            To build your plan and generate practice questions, the answers you submit are sent
            to our AI provider to produce a response. We send only what is needed to create your
            study materials, and we do not attach your identity. Please avoid entering sensitive
            personal information into free-text fields.
          </p>
        </section>

        <section>
          <h2>Local storage</h2>
          <p>
            Your plan and progress are saved in your browser&apos;s local storage so you can
            close the tab and come back. Clearing your browser data will remove this information.
            Because it lives on your device, anyone with access to your device may be able to see
            it.
          </p>
        </section>

        <section>
          <h2>Cookies and analytics</h2>
          <p>
            We use minimal, privacy-friendly analytics to measure overall usage and reliability.
            We do not use advertising trackers and we do not build advertising profiles about
            you.
          </p>
        </section>

        <section>
          <h2>Data sharing</h2>
          <p>
            We do not sell or rent your personal information. We share data only with the service
            providers that help us operate (such as our hosting and AI providers), and only to
            the extent needed to run the product.
          </p>
        </section>

        <section>
          <h2>Children&apos;s privacy</h2>
          <p>
            {SITE.name} is intended for high-school-aged students and older. If you are under the
            age of 13, please use the product with the involvement of a parent or guardian.
          </p>
        </section>

        <section>
          <h2>Your choices</h2>
          <p>
            Because we don&apos;t hold an account for you, you can remove your data at any time by
            clearing your browser&apos;s storage for this site. For any questions about this
            policy, contact us at{' '}
            <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
          </p>
        </section>

        <section>
          <h2>Changes to this policy</h2>
          <p>
            We may update this policy as the product evolves. When we do, we&apos;ll revise the
            &ldquo;last updated&rdquo; date above. Continued use of the product means you accept
            the current version.
          </p>
        </section>
      </ProsePage>
    </MarketingShell>
  )
}
