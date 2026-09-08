import type { Metadata } from 'next'
import LegalShell from '@/components/LegalShell'
import LegalPrevalenza from '@/components/LegalPrevalenza'
import { anteprimaOg } from '@/lib/anteprima'
import { SUB_RESPONSABILI, TITOLARE } from '@/lib/legal-config'
import { SITE_URL } from '@/lib/site-config'
import styles from '@/components/legal.module.css'

const META_TITLE = 'Privacy Policy — Social Web Automation'
const META_DESCRIPTION =
  'What personal data we process, on which legal basis, for how long, with whom we share it and how to exercise your GDPR rights.'

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/en/privacy`,
    languages: {
      'it-IT': `${SITE_URL}/privacy`,
      en: `${SITE_URL}/en/privacy`,
      'x-default': `${SITE_URL}/privacy`,
    },
  },
  openGraph: { title: META_TITLE, description: META_DESCRIPTION, url: `${SITE_URL}/en/privacy`, images: anteprimaOg('/en/privacy'), type: 'website', locale: 'en_US' },
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <LegalShell
      eyebrow="Privacy notice · GDPR"
      title="Privacy Policy"
      currentPath="/en/privacy"
      locale="en"
      altraLinguaHref="/privacy"
    >
      <LegalPrevalenza href="/privacy" />

      <p>
        This notice describes how the personal data of users who visit the site and use {TITOLARE.brand} services is
        processed, under art. 13 of <strong>EU Regulation 2016/679 (GDPR)</strong> and Italian Legislative Decree
        196/2003 (the Privacy Code) as amended by Legislative Decree 101/2018.
      </p>

      <h2>1. Data controller</h2>
      <p>
        The data controller is {TITOLARE.ragioneSociale} ({TITOLARE.brand}), with registered office at{' '}
        {TITOLARE.sedeLegale}, VAT no. {TITOLARE.partitaIva}, tax code {TITOLARE.codiceFiscale}.<br />
        Email: <a href={`mailto:${TITOLARE.email}`}>{TITOLARE.email}</a> · Certified email: {TITOLARE.pec} · Tel:{' '}
        {TITOLARE.telefono}.
      </p>
      {TITOLARE.dpo ? (
        <p>Data Protection Officer (DPO): {TITOLARE.dpo.nome} — <a href={`mailto:${TITOLARE.dpo.email}`}>{TITOLARE.dpo.email}</a>.</p>
      ) : (
        <p>
          The controller has not appointed a Data Protection Officer (DPO). For privacy requests you can contact the
          controller directly at <a href={`mailto:${TITOLARE.email}`}>{TITOLARE.email}</a>.
        </p>
      )}

      <h2>2. What data we process</h2>
      <h3>a) Data you provide</h3>
      <ul>
        <li><strong>Registration data</strong>: name, email, company, phone, chosen plan, password (hashed with bcrypt).</li>
        <li><strong>Contact data</strong>: when you write to us by email, WhatsApp or a form.</li>
        <li><strong>Billing data</strong>: company name, VAT number, address — handled through Stripe.</li>
        <li><strong>Withdrawal and cancellation data</strong>: name, email, contract reference and date, category of the request, the declaration transmitted, date and time, case number and receipt.</li>
        <li><strong>Uploaded content</strong>: images, text, brand and product data you enter into the platform.</li>
      </ul>
      <h3>b) Data collected automatically</h3>
      <ul>
        <li><strong>Browsing data</strong>: IP address, browser type, pages visited, timestamps (technical server logs).</li>
        <li><strong>Technical cookies</strong>: necessary for operation (session, authentication). Details in the <a href="/en/cookie-policy">Cookie Policy</a>.</li>
      </ul>

      <h2>3. Purposes and legal bases</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Purpose</th><th>Legal basis (art. 6 GDPR)</th></tr></thead>
          <tbody>
            <tr><td>Delivering the service (account, content generation and publication)</td><td>Performance of a contract — point (b)</td></tr>
            <tr><td>Invoicing and tax obligations</td><td>Legal obligation — point (c)</td></tr>
            <tr><td>Support and replying to requests</td><td>Pre-contractual measures — point (b)</td></tr>
            <tr><td>Security, abuse prevention, technical logs</td><td>Legitimate interest — point (f)</td></tr>
            <tr><td>Sending transactional email (activation, notifications)</td><td>Performance of a contract — point (b)</td></tr>
            <tr><td>Handling and evidencing withdrawal or cancellation declarations</td><td>Legal obligation — point (c) and performance of a contract — point (b)</td></tr>
            <tr><td>Marketing and newsletter (if enabled)</td><td>Consent — point (a)</td></tr>
            <tr><td>Advertising campaign measurement (events sent to Meta from our server)</td><td>Consent — point (a)</td></tr>
          </tbody>
        </table>
      </div>

      <h2>4. Use of artificial intelligence</h2>
      <p>
        The platform uses <strong>OpenRouter</strong>, which routes third-party AI models (Google, OpenAI, Anthropic,
        Meta and others) to generate text and images. The data you enter (brand, products, images) may be sent to
        these providers solely to generate the content requested.{' '}
        <strong>We do not use your data to train AI models</strong> and we select providers offering contractual
        guarantees to that effect. See also the <a href="/en/ai-transparency">AI transparency notice</a> (art. 50 of
        EU Regulation 2024/1689).
      </p>

      <h2>4-bis. Advertising campaign measurement</h2>
      <p>
        When a campaign is running, and <strong>only after your explicit marketing consent</strong>, our server sends
        Meta two events: a consultation request and the start of a purchase. It exists to know which advert brought a
        real contact; without it, advertising spend is blind.
      </p>
      <p>
        What is transmitted: email address and phone number <strong>hashed with SHA-256</strong>, so Meta never reads
        them in clear text, together with the IP address, the browser type and the amount of the transaction. We do
        not transmit the content of your messages, uploaded materials or account data.
      </p>
      <p>
        The communication leaves from our server: <strong>no Meta script is loaded on the site</strong> and no
        advertising cookies are set. Without consent nothing is sent, and the check sits inside the code that sends
        the event, not in an external configuration. Withdrawing consent from the banner stops the sending.
      </p>

      <h2>5. Recipients and external processors</h2>
      <p>
        Data may be processed on our behalf by the following providers, appointed as processors (art. 28 GDPR):
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Provider</th><th>Activity</th><th>Transfer outside the EU</th></tr></thead>
          <tbody>
            {SUB_RESPONSABILI.map(s => (
              <tr key={s.nome}><td>{s.nome}</td><td lang="it">{s.ruolo}</td><td lang="it">{s.extraUe}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Some providers are based in the USA: transfers rely on <strong>Standard Contractual Clauses (SCCs)</strong>{' '}
        and/or adherence to the <strong>Data Privacy Framework</strong>, as provided by arts. 44-49 GDPR.
      </p>

      <h2>6. Retention periods</h2>
      <ul>
        <li><strong>Account data</strong>: for the duration of the relationship and up to 24 months after it ends.</li>
        <li><strong>Billing data</strong>: 10 years (civil and tax obligation).</li>
        <li><strong>Withdrawal and cancellation declarations</strong>: up to 10 years, to evidence the request and handle any dispute, unless a different legal obligation applies.</li>
        <li><strong>Uploaded content</strong> (images, text, brand and product data): for the duration of the relationship and up to 24 months after it ends, together with the account data. Earlier deletion can be requested at any time.</li>
        <li><strong>Technical logs</strong>: 12 months maximum.</li>
        <li><strong>Marketing data</strong>: until consent is withdrawn.</li>
      </ul>

      <h2>7. Your rights</h2>
      <p>
        Under arts. 15-22 GDPR you have the right to: access, rectification, erasure (“the right to be forgotten”),
        restriction, portability, objection, and to withdraw consent at any time. To exercise them, write to{' '}
        <a href={`mailto:${TITOLARE.email}`}>{TITOLARE.email}</a>. We reply within 30 days, extendable by a further
        60 in the cases provided by art. 12.3 GDPR, informing you accordingly.
      </p>
      <p>
        For the <strong>right to portability</strong> (art. 20) we hand over the data you provided in a{' '}
        <strong>JSON</strong> archive, a structured, machine-readable format: account data, uploaded content,
        publication history and the register of requests. Images and files are delivered in their original format.
        You also have the right to lodge a complaint with the{' '}
        <strong>Italian Data Protection Authority</strong> (
        <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">garanteprivacy.it</a>) or
        with the supervisory authority of your own country of residence.
      </p>

      <h2>8. Security</h2>
      <p>
        We adopt appropriate technical and organisational measures: hashed passwords (bcrypt), HTTPS connections with
        HSTS, a restrictive Content-Security-Policy, multi-tenant access control, rate limiting and per-client data
        isolation. No system is 100% secure: which is why the breach procedure is written before it is needed, below.
      </p>

      <h2>9. What happens in case of a data breach</h2>
      <p>
        A breach is any event leading to destruction, loss, alteration, disclosure of, or unauthorised access to
        personal data. The procedure is this, in order:
      </p>
      <ul>
        <li><strong>Detection and containment</strong>: closing the access, revoking the credentials involved and preserving the logs needed to reconstruct what happened.</li>
        <li><strong>Risk assessment</strong>: within a few hours, by the controller, to establish the nature, the categories and the approximate number of data subjects and records involved.</li>
        <li><strong>Notification to the supervisory authority within 72 hours</strong> of the controller becoming aware of it, under <strong>art. 33 GDPR</strong>, unless the breach is unlikely to result in a risk to people’s rights and freedoms. If 72 hours are not enough, the notification states the reason for the delay.</li>
        <li><strong>Communication to data subjects without undue delay</strong>, under <strong>art. 34 GDPR</strong>, where the breach presents a high risk: what happened, which data, the likely consequences, what we did and what you should do.</li>
        <li><strong>Breach register</strong>: every event is recorded with its effects and the measures taken, under art. 33.5 GDPR, even where notification is not required.</li>
      </ul>
      <p>
        If the breach concerns a provider processing data on our behalf, the art. 28 GDPR contract requires them to
        inform us without undue delay, so that the deadlines above start correctly.
      </p>

      <h2>10. Changes</h2>
      <p>
        We reserve the right to update this notice. Material changes will be communicated by email or through a
        notice on the site.
      </p>
    </LegalShell>
  )
}
