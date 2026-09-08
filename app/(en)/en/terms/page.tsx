import type { Metadata } from 'next'
import LegalShell from '@/components/LegalShell'
import LegalPrevalenza from '@/components/LegalPrevalenza'
import { anteprimaOg } from '@/lib/anteprima'
import { TITOLARE } from '@/lib/legal-config'
import { PREZZI } from '@/lib/prezzi-ingresso'
import { SITE_URL } from '@/lib/site-config'

const META_TITLE = 'Terms and Conditions — Social Web Automation'
const META_DESCRIPTION =
  'The general conditions governing the use of Social Web Automation services: scope, plans and payments, AI-generated content, liability, withdrawal and applicable law.'

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/en/terms`,
    languages: {
      'it-IT': `${SITE_URL}/termini`,
      en: `${SITE_URL}/en/terms`,
      'x-default': `${SITE_URL}/termini`,
    },
  },
  openGraph: { title: META_TITLE, description: META_DESCRIPTION, url: `${SITE_URL}/en/terms`, images: anteprimaOg('/en/terms'), type: 'website', locale: 'en_US' },
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <LegalShell
      eyebrow="Terms and Conditions"
      title="Terms and Conditions of use"
      currentPath="/en/terms"
      locale="en"
      altraLinguaHref="/termini"
    >
      <LegalPrevalenza href="/termini" />

      <p>
        These General Conditions govern the use of {TITOLARE.brand} services, provided by {TITOLARE.ragioneSociale},
        with registered office at {TITOLARE.sedeLegale}, VAT no. {TITOLARE.partitaIva}, tax code{' '}
        {TITOLARE.codiceFiscale} and certified email <a href={`mailto:${TITOLARE.pec}`}>{TITOLARE.pec}</a>.
        Registering, purchasing or using the services constitutes acceptance of these conditions.
      </p>

      <h2>1. Subject of the service</h2>
      <p>
        {TITOLARE.brand} is a platform and a managed service which, using artificial intelligence, generates social
        content, editorial plans, articles and campaigns and publishes them on the client’s channels subject to{' '}
        <strong>human approval</strong>. Website and e-commerce services, visibility services and — through Studio
        Legale BCS — legal and AI compliance advice are also offered.
      </p>

      <h2>2. Registration and account</h2>
      <ul>
        <li>Registration requires truthful and complete information. The account is activated after approval.</li>
        <li>You are responsible for safeguarding your credentials and for the activity carried out with your account.</li>
        <li>You must be at least 18 years old and, if acting for a company, hold the power to bind it.</li>
      </ul>

      <h2>3. Plans, prices and payments</h2>
      <ul>
        <li>Fees and any initial costs are stated on the <a href="/en/pricing">Pricing</a> page. Prices are monthly and exclude VAT unless stated otherwise.</li>
        <li>Subscription billing is handled through Stripe, with automatic monthly renewal unless cancelled.</li>
        <li><strong>Blog SEO + GEO:</strong> the fee of {PREZZI.blog} covers the editorial cycle described on the relevant page. Timing, CMS access and publication arrangements are defined during onboarding.</li>
        <li><strong>Basic website:</strong> the fee starts at €19.90 per month for a simple landing page or a basic website. Multi-page sites, e-commerce, advanced design, configurations, domain, licences and further features are defined and approved before any additional cost.</li>
        <li><strong>B2B lead research pilot:</strong> the price of €149 is one-off and covers defining the ideal profile, the research and the qualification of up to 30 companies. It does not include automated sending, outbound campaigns, or guarantees of replies, meetings or sales.</li>
        <li>Budget for advertising campaigns is always separate from the service fee.</li>
        <li>Legal advice (€150 / 30 min) is delivered by Studio Legale BCS and is also governed by the firm’s own conditions.</li>
      </ul>

      <h2>4. AI-generated content</h2>
      <ul>
        <li>Content is generated with the support of artificial intelligence systems and <strong>reviewed or approved by the client</strong> before publication. Final approval rests with the client.</li>
        <li>We do not warrant that content is free of errors: you are required to check its accuracy, truthfulness and compliance before publishing it.</li>
        <li>You are responsible for the rights in the materials you upload (images, trade marks, text) and for the necessary permissions.</li>
      </ul>

      <h2>5. Permitted use</h2>
      <p>
        It is prohibited to use the service for unlawful, defamatory or misleading content, or content infringing
        third-party rights or the social platforms’ policies. We reserve the right to suspend accounts that breach
        these conditions.
      </p>

      <h2>6. Intellectual property</h2>
      <p>
        The software, the trade mark and the structure of the platform remain the property of the provider. Content
        generated for the client and materials uploaded by the client remain the property of the client.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        The service is provided “as is”. To the extent permitted by law, the provider is not liable for indirect
        damages, loss of profits, or consequences arising from the publication of content approved by the client.
        Overall liability is in any case limited to the amount of fees paid in the last 12 months.
      </p>

      <h2>8. Withdrawal and termination</h2>
      <ul>
        <li><strong>Businesses and professionals:</strong> may cancel the subscription with effect from the following billing period, from the dashboard, through the <a href="/en/withdrawal">Withdrawal and cancellation</a> function or by writing to <a href={`mailto:${TITOLARE.email}`}>{TITOLARE.email}</a>. The right of withdrawal provided by the Italian Consumer Code does not apply to purchases made for business or professional purposes.</li>
        <li><strong>Consumers:</strong> a natural person purchasing for purposes outside their business or professional activity may withdraw from a distance contract within 14 days of its conclusion, without giving reasons, subject to the exceptions provided by law.</li>
        <li>The consumer may at any relevant time use the online function clearly identified as <a href="/en/withdrawal"><strong>Withdraw from the contract here</strong></a>. After the summary, the “Confirm withdrawal” command transmits the declaration and generates a receipt with its content, date and time.</li>
        <li>If the consumer expressly requested the service to start during the withdrawal period and then withdraws, an amount proportionate to the part of the service already performed may be due, in the cases and within the limits of art. 57 of the Consumer Code.</li>
        <li>The right may be excluded for a service fully performed where performance began with the consumer’s prior express consent and with acknowledgement of the loss of the right once performance is complete. The other exceptions in art. 59 remain applicable where relevant.</li>
        <li>The online function does not limit the possibility of sending the declaration by the other permitted means, including email and certified email.</li>
      </ul>

      <h2>9. Applicable law and jurisdiction</h2>
      <p>
        These conditions are governed by Italian law. For disputes with consumers, the court of the consumer’s place
        of residence has jurisdiction; in all other cases, the court of {TITOLARE.foroCompetente}.
      </p>

      <h2>10. Changes</h2>
      <p>
        The provider may update these terms. Material changes will be communicated by appropriate means and will
        apply from the date stated in the communication, in compliance with applicable law.
      </p>
    </LegalShell>
  )
}
