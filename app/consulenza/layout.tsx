import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site-config'

const META_TITLE = 'Consulenza AI Act e GDPR con Studio Legale BCS | SWA'
const META_DESCRIPTION =
  'Prenota una consulenza di 30 minuti con l’Avv. Vincenzo Sapone, Cassazionista dello Studio Legale BCS, su AI Act, GDPR, privacy e contratti.'

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/consulenza` },
  openGraph: {
    title: META_TITLE,
    description: META_DESCRIPTION,
    url: `${SITE_URL}/consulenza`,
  },
  twitter: {
    title: META_TITLE,
    description: META_DESCRIPTION,
  },
}

const consultationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/consulenza#webpage`,
      url: `${SITE_URL}/consulenza`,
      name: META_TITLE,
      description: META_DESCRIPTION,
      inLanguage: 'it-IT',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      mainEntity: { '@id': `${SITE_URL}/#legal-ai-consulting` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Consulenza AI Act e GDPR', item: `${SITE_URL}/consulenza` },
      ],
    },
  ],
}

export default function ConsulenzaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(consultationJsonLd).replace(/</g, '\\u003c') }}
      />
      {children}
    </>
  )
}
