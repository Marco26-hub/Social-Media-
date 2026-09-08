import type { Metadata } from 'next'
import LegalShell from '@/components/LegalShell'
import LegalPrevalenza from '@/components/LegalPrevalenza'
import { anteprimaOg } from '@/lib/anteprima'
import { TITOLARE } from '@/lib/legal-config'
import { SITE_URL } from '@/lib/site-config'
import styles from '@/components/legal.module.css'

const META_TITLE = 'Cookie Policy — Social Web Automation'
const META_DESCRIPTION =
  'Which cookies this site uses, which it does not, and how to change your mind at any time. No third-party script is loaded on this website.'

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/en/cookie-policy`,
    languages: {
      'it-IT': `${SITE_URL}/cookie-policy`,
      en: `${SITE_URL}/en/cookie-policy`,
      'x-default': `${SITE_URL}/cookie-policy`,
    },
  },
  openGraph: { title: META_TITLE, description: META_DESCRIPTION, url: `${SITE_URL}/en/cookie-policy`, images: anteprimaOg('/en/cookie-policy'), type: 'website', locale: 'en_US' },
  robots: { index: true, follow: true },
}

export default function CookiePolicyPage() {
  return (
    <LegalShell
      eyebrow="Cookie Policy"
      title="Cookie Policy"
      currentPath="/en/cookie-policy"
      locale="en"
      altraLinguaHref="/cookie-policy"
    >
      <LegalPrevalenza href="/cookie-policy" />

      <p>
        This page describes the use of cookies and similar technologies on the {TITOLARE.brand} website, in line
        with the <strong>Italian Data Protection Authority’s cookie guidelines of 10 June 2021</strong> and the
        ePrivacy Directive.
      </p>

      <h2>1. What cookies are</h2>
      <p>
        Cookies are small text files that websites save on the user’s device. They divide into{' '}
        <strong>technical</strong> cookies (necessary for operation, no consent required) and{' '}
        <strong>profiling or marketing</strong> cookies (requiring explicit prior consent).
      </p>

      <h2>2. Cookies used by this site</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Cookie</th><th>Type</th><th>Purpose</th><th>Duration</th><th>Consent</th></tr></thead>
          <tbody>
            <tr><td>next-auth.session-token</td><td>Technical</td><td>User authentication (dashboard login)</td><td>Session / 30 days</td><td>Not required</td></tr>
            <tr><td>next-auth.csrf-token</td><td>Technical</td><td>Anti-CSRF protection</td><td>Session</td><td>Not required</td></tr>
            <tr><td>active_cliente_id</td><td>Technical</td><td>Active client / workspace (multi-tenant)</td><td>Session</td><td>Not required</td></tr>
            <tr><td>cookie_consent</td><td>Technical</td><td>Stores your cookie choice</td><td>6 months</td><td>Not required</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Technical cookies are always active because they are necessary. Marketing cookies are loaded{' '}
        <strong>only</strong> after explicit consent through the banner, and serve Meta Pixel and the Conversions
        API.
      </p>
      <p className={styles.nota}>
        <strong>No marketing cookie is active on this site.</strong> We do not load the Meta pixel or any other
        advertising script, so the <code>_fbp</code> and <code>_fbc</code> cookies are never set. The consent we
        ask for in the banner is not about cookies: it is about{' '}
        <strong>campaign measurement</strong>, described under point 3.
      </p>

      <h2>3. Third parties and campaign measurement</h2>
      <p>
        The site <strong>loads no third-party script</strong>: no analytics tool, no advertising pixel, no embedded
        content. That is a choice, not an omission: an external script sees everything you do on the page, and
        measuring a campaign does not require it.
      </p>
      <p>
        When an advertising campaign is running, and <strong>only if you have given marketing consent</strong>, our
        server sends Meta two events: a consultation request and the start of a purchase. The communication leaves
        from the server, not from your browser. The email address and phone number are transmitted{' '}
        <strong>hashed with SHA-256</strong> — Meta never receives the values in clear text — together with the IP
        address, the browser type and the amount of the transaction.
      </p>
      <p>
        Without your consent nothing is sent: the control is in the code, not only in the intention. If you
        withdraw consent, the sending stops. The detail of the processing is in the{' '}
        <a href="/en/privacy">Privacy Policy</a>.
      </p>

      <h2>4. Managing consent</h2>
      <p>
        You can change or withdraw your preferences at any time through the cookie banner (which reappears on
        withdrawal) or by deleting cookies from your browser settings. Disabling technical cookies may break the
        dashboard — for example, you may not be able to stay signed in.
      </p>

      <h2>5. How to manage cookies from your browser</h2>
      <ul>
        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
        <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
        <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
        <li><a href="https://support.microsoft.com/en-us/microsoft-edge" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
      </ul>

      <h2>6. Controller and contact</h2>
      <p>
        For any request about cookies: <a href={`mailto:${TITOLARE.email}`}>{TITOLARE.email}</a>. See also the{' '}
        <a href="/en/privacy">Privacy Policy</a>.
      </p>
    </LegalShell>
  )
}
