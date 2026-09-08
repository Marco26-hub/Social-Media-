import type { Metadata } from 'next'
import LegalShell from '@/components/LegalShell'
import LegalPrevalenza from '@/components/LegalPrevalenza'
import { anteprimaOg } from '@/lib/anteprima'
import { TITOLARE } from '@/lib/legal-config'
import { SITE_URL } from '@/lib/site-config'
import styles from '@/components/legal.module.css'

const META_TITLE = 'Security and data handling — Social Web Automation'
const META_DESCRIPTION =
  'The technical and organisational measures protecting client data: transport, access, payments, AI, breach procedure — and what we do not claim.'

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/en/security`,
    languages: {
      'it-IT': `${SITE_URL}/sicurezza`,
      en: `${SITE_URL}/en/security`,
      'x-default': `${SITE_URL}/sicurezza`,
    },
  },
  openGraph: { title: META_TITLE, description: META_DESCRIPTION, url: `${SITE_URL}/en/security`, images: anteprimaOg('/en/security'), type: 'website', locale: 'en_US' },
  robots: { index: true, follow: true },
}

export default function SecurityPage() {
  return (
    <LegalShell
      eyebrow="Security"
      title="Security and data handling"
      currentPath="/en/security"
      locale="en"
      altraLinguaHref="/sicurezza"
    >
      <LegalPrevalenza href="/sicurezza" />

      <p>
        This page gathers the technical and organisational measures {TITOLARE.brand} protects client data with.
        It is written for someone assessing a supplier before signing: it says what we do and, where we do not do
        something, it says so instead of talking around it.
      </p>

      <h2>1. Transport and headers</h2>
      <ul>
        <li><strong>HTTPS across the whole site</strong>, with <code>Strict-Transport-Security</code> set to two years, extended to subdomains and with preload.</li>
        <li><strong>A restrictive Content-Security-Policy</strong>: scripts may come only from our own domain; <code>object-src</code> disabled and <code>base-uri</code> locked.</li>
        <li><strong><code>frame-ancestors: none</code></strong> and <code>X-Frame-Options: DENY</code>: the site cannot be embedded in someone else’s iframe, so clickjacking is not practicable.</li>
        <li><strong><code>X-Content-Type-Options: nosniff</code></strong> and <code>Referrer-Policy: strict-origin-when-cross-origin</code>.</li>
        <li><strong><code>Permissions-Policy</code></strong>: camera, microphone and geolocation disabled at document level.</li>
      </ul>

      <h2>2. Access and accounts</h2>
      <ul>
        <li>Passwords stored with <strong>bcrypt</strong>, never in clear text and never reversible.</li>
        <li><strong>Multi-tenant isolation</strong>: every request is bound to the client that originated it; one client’s data is not reachable from another.</li>
        <li><strong>Rate limiting</strong> on login, registration, password change and on the interfaces that generate content.</li>
        <li>Dashboard access is restricted to approved accounts; credentials are the responsibility of whoever holds them.</li>
      </ul>

      <h2>3. Payments</h2>
      <p>
        Payments go through <strong>hosted Stripe Checkout</strong>: the page where the card is entered belongs to
        Stripe, on Stripe’s domain. <strong>No card data passes through, is processed by, or is stored on our
        systems</strong>, and there is no card field anywhere in our code. For PCI-DSS this places the activity in
        the <strong>SAQ-A</strong> scope, the lightest the standard provides.
      </p>

      <h2>4. Where the data lives and who processes it</h2>
      <p>
        The full list of external processors, with the activity performed and the legal basis for every transfer
        outside the European Union, is in the <a href="/en/privacy">Privacy Policy</a> under point 5. It is a named
        list, not one by category: suppliers are identified one by one. Transfers outside the EU rely on Standard
        Contractual Clauses and/or Data Privacy Framework adherence.
      </p>

      <h2>5. Artificial intelligence</h2>
      <ul>
        <li>Uploaded material is used <strong>only</strong> to generate the content requested.</li>
        <li><strong>We do not train models</strong> on client data, and we select suppliers that offer contractual guarantees to that effect.</li>
        <li>Nothing is published without human approval. The detail is in the <a href="/en/ai-transparency">AI transparency notice</a>.</li>
      </ul>

      <h2>6. In case of a breach</h2>
      <p>
        The procedure is written before it is needed: detection and containment, risk assessment, notification to
        the supervisory authority within <strong>72 hours</strong> under art. 33 GDPR, communication to data
        subjects without undue delay where the risk is high, and an entry in the breach register even when
        notification is not required. The full text is under point 9 of the{' '}
        <a href="/en/privacy">Privacy Policy</a>.
      </p>

      <h2>7. Reporting a vulnerability</h2>
      <p>
        If you find a security problem, write to <a href={`mailto:${TITOLARE.email}`}>{TITOLARE.email}</a> with the
        subject <strong>“Security”</strong>, describing how to reproduce it. We reply within five working days. We
        ask you not to disclose the problem until it has been closed, and not to access data that is not your own.
      </p>

      <h2>8. What we do not claim</h2>
      <p className={styles.nota}>
        In fairness to anyone assessing us: <strong>we are not SOC 2 or ISO 27001 certified</strong>, we do not
        publish a status page and we do not offer a contractual availability SLA. These are choices consistent with
        the size of the business, not omissions. If your supplier selection process requires one of them, say so
        first: better to know at the start than halfway through a project.
      </p>
      <p>
        A <strong>data processing agreement (DPA, art. 28 GDPR)</strong> is prepared on request for clients who need
        one.
      </p>

      <h2>9. Updates</h2>
      <p>
        This page is reviewed whenever the measures described change. Last revision:{' '}
        <strong>8 September 2026</strong>.
      </p>
    </LegalShell>
  )
}
