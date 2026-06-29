import type { Metadata } from 'next'
import { MarketingShell, ProsePage } from '@/components/marketing/marketing-shell'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms for using SAT Sage, a free AI-powered SAT study tool. Please read before using the service.',
}

export default function TermsPage() {
  return (
    <MarketingShell>
      <ProsePage
        title="Terms of Service"
        intro="By using SAT Sage, you agree to these terms. We've kept them as plain as we can."
        updated={SITE.legalUpdated}
      >
        <section>
          <h2>1. Acceptance of terms</h2>
          <p>
            By accessing or using {SITE.name} (the &ldquo;Service&rdquo;), you agree to be bound
            by these Terms of Service. If you do not agree, please do not use the Service.
          </p>
        </section>

        <section>
          <h2>2. What the Service is</h2>
          <p>
            {SITE.name} is a free, AI-assisted study tool that helps students prepare for the SAT,
            especially in the final hours before the test. It generates study plans, practice
            questions, and review material. It is provided for educational purposes only.
          </p>
        </section>

        <section>
          <h2>3. Not affiliated with the College Board</h2>
          <p>
            {SITE.name} is an independent product. It is{' '}
            <strong>not affiliated with, endorsed by, or sponsored by the College Board</strong>.
            SAT is a registered trademark of the College Board, used here only to describe the
            exam the Service helps you prepare for.
          </p>
        </section>

        <section>
          <h2>4. No guarantees</h2>
          <p>
            We want you to succeed, but we cannot and do not guarantee any particular score,
            result, or outcome. Practice questions and explanations are AI-generated and curated
            from common SAT topics; they are not official exam content and may occasionally
            contain errors. Always use your own judgment and official resources alongside the
            Service.
          </p>
        </section>

        <section>
          <h2>5. Acceptable use</h2>
          <ul>
            <li>Use the Service only for lawful, personal, educational purposes.</li>
            <li>Do not attempt to disrupt, overload, reverse-engineer, or abuse the Service.</li>
            <li>Do not use the Service to generate harmful, misleading, or infringing content.</li>
          </ul>
        </section>

        <section>
          <h2>6. Health and well-being</h2>
          <p>
            The Service includes calming and breathing prompts to help you manage test stress.
            These are supportive features, not medical or psychological advice. If you are
            experiencing a crisis or need real support, please reach out to a trusted adult, a
            counselor, or a local helpline.
          </p>
        </section>

        <section>
          <h2>7. Intellectual property</h2>
          <p>
            The Service, including its design, text, and branding, is owned by {SITE.name} and
            protected by applicable laws. You may use the study materials it generates for your
            own personal preparation.
          </p>
        </section>

        <section>
          <h2>8. Disclaimer of warranties</h2>
          <p>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
            warranties of any kind, whether express or implied, including fitness for a particular
            purpose and non-infringement. We do not warrant that the Service will be uninterrupted,
            error-free, or always available.
          </p>
        </section>

        <section>
          <h2>9. Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, {SITE.name} and its operators will not be
            liable for any indirect, incidental, or consequential damages arising from your use of
            the Service, including any reliance on AI-generated material.
          </p>
        </section>

        <section>
          <h2>10. Changes to the Service and terms</h2>
          <p>
            We may modify or discontinue the Service, and we may update these terms, at any time.
            When we update the terms, we&apos;ll revise the &ldquo;last updated&rdquo; date above.
            Continued use means you accept the updated terms.
          </p>
        </section>

        <section>
          <h2>11. Contact</h2>
          <p>
            Questions about these terms? Email us at{' '}
            <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
          </p>
        </section>
      </ProsePage>
    </MarketingShell>
  )
}
