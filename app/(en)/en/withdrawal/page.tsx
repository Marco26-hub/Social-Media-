import Link from 'next/link'
import type { Metadata } from 'next'
import LegalShell from '@/components/LegalShell'
import LegalPrevalenza from '@/components/LegalPrevalenza'
import { anteprimaOg } from '@/lib/anteprima'
import { TITOLARE } from '@/lib/legal-config'
import { SITE_URL } from '@/lib/site-config'
import styles from '@/components/legal.module.css'

const META_TITLE = 'Withdrawal and cancellation — Social Web Automation'
const META_DESCRIPTION =
  'How to withdraw from the contract or cancel a subscription: who the 14-day consumer right applies to, what changes for businesses, and the online procedure with a receipt.'

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/en/withdrawal`,
    languages: {
      'it-IT': `${SITE_URL}/recesso`,
      en: `${SITE_URL}/en/withdrawal`,
      'x-default': `${SITE_URL}/recesso`,
    },
  },
  openGraph: { title: META_TITLE, description: META_DESCRIPTION, url: `${SITE_URL}/en/withdrawal`, images: anteprimaOg('/en/withdrawal'), type: 'website', locale: 'en_US' },
  robots: { index: true, follow: true },
}

export default function WithdrawalPage() {
  return (
    <LegalShell
      eyebrow="Withdrawal and cancellation"
      title="Withdrawing from the contract"
      currentPath="/en/withdrawal"
      locale="en"
      altraLinguaHref="/recesso"
    >
      <LegalPrevalenza href="/recesso" />

      <p>
        You can send an unambiguous withdrawal declaration and immediately receive a receipt recording its content,
        the date and the time of transmission. The online form is the one required by arts. 52 and 54-bis of the
        Italian Consumer Code.
      </p>
      <p className={styles.nota}>
        <strong>The form itself is in Italian.</strong> It is the legally operative instrument and the receipt it
        issues is drawn up in Italian, so it is not duplicated here. This page explains what it does and who it
        applies to. If you prefer, you can send the same declaration by email — that is equally valid, and the
        address is at the bottom of this page.
      </p>
      <p>
        <Link href="/recesso" hrefLang="it" lang="it"><strong>Open the withdrawal form</strong></Link>
      </p>

      <h2>1. Who this applies to</h2>
      <ul>
        <li>
          <strong>Consumers.</strong> Natural persons who purchased for purposes outside their professional
          activity. For online contracts the ordinary period is 14 days, subject to the exceptions or extensions
          provided by law.
        </li>
        <li>
          <strong>Businesses and professionals.</strong> The consumer rules do not apply to purchases made in the
          course of a business or professional activity. The form records a cancellation under the contract
          instead.
        </li>
      </ul>

      <h2>2. If the service has already started</h2>
      <p>
        Withdrawal may involve paying a proportionate amount for what has already been performed, where the early
        start was expressly requested. For a service performed in full, the statutory exceptions may apply, subject
        to verification of the consents collected. This follows arts. 57 and 59 of the Consumer Code.
      </p>

      <h2>3. How the procedure works</h2>
      <ul>
        <li>Two steps: you fill in the declaration, you read the summary.</li>
        <li>The “Confirm withdrawal” command transmits the declaration and records the date and time.</li>
        <li>You receive a receipt you can keep, with the content of what was sent.</li>
      </ul>

      <h2>4. Other ways to send it</h2>
      <p>
        The online function does not limit the other permitted means. You can write to{' '}
        <a href={`mailto:${TITOLARE.email}`}>{TITOLARE.email}</a> or to the certified address{' '}
        <a href={`mailto:${TITOLARE.pec}`}>{TITOLARE.pec}</a>. Any unambiguous declaration is valid: no particular
        form is required.
      </p>

      <h2>5. References</h2>
      <p>
        This function implements arts. 52 and 54-bis of the Italian Consumer Code. It does not limit the other
        permitted ways of communicating withdrawal and it does not replace checking your individual contract. See
        also the <a href="/en/terms">Terms and Conditions</a>, point 8.
      </p>
    </LegalShell>
  )
}
