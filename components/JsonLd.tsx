import { SITE_URL } from '@/lib/site-config'
import { TITOLARE } from '@/lib/legal-config'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: TITOLARE.brand,
      legalName: TITOLARE.ragioneSociale,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        '@id': `${SITE_URL}/#logo`,
        url: `${SITE_URL}/brand/swa-logo-official.png`,
        width: 958,
        height: 438,
      },
      image: { '@id': `${SITE_URL}/#logo` },
      description:
        'Servizio gestito di social media management per PMI e professionisti, con strategia, contenuti, pubblicazione multicanale, siti, e-commerce, SEO e GEO.',
      founder: {
        '@type': 'Person',
        name: 'Marco Dibenedetto',
      },
      vatID: `IT${TITOLARE.partitaIva}`,
      taxID: TITOLARE.codiceFiscale,
      email: TITOLARE.email,
      telephone: TITOLARE.telefono,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Via Giuseppe Verdi 2B',
        postalCode: '22072',
        addressLocality: 'Cermenate',
        addressRegion: 'CO',
        addressCountry: 'IT',
      },
      areaServed: { '@type': 'Place', name: 'Worldwide' },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: TITOLARE.email,
        telephone: TITOLARE.telefono,
        availableLanguage: ['it'],
        areaServed: 'Worldwide',
      },
      knowsAbout: [
        'Social media management',
        'Piano editoriale',
        'Content marketing',
        'SEO',
        'Generative Engine Optimization',
        'Blog SEO',
        'Siti web',
        'E-commerce',
        'AI compliance',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Servizi e pacchetti Social Automation',
        itemListElement: [
          {
            '@type': 'Offer',
            name: 'Piano Presenza',
            url: `${SITE_URL}/pacchetti`,
            price: '390',
            priceCurrency: 'EUR',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: '390',
              priceCurrency: 'EUR',
              unitText: 'MONTH',
              valueAddedTaxIncluded: false,
            },
            itemOffered: {
              '@type': 'Service',
              '@id': `${SITE_URL}/#social-media-management`,
              name: 'Gestione social media per PMI',
              serviceType: 'Social media management',
              provider: { '@id': `${SITE_URL}/#organization` },
              areaServed: { '@type': 'Place', name: 'Worldwide' },
              description:
                'Strategia, piano editoriale, 16 contenuti mensili, gestione di due social, approvazione umana, pubblicazione e report.',
            },
          },
          {
            '@type': 'Offer',
            name: 'Piano Crescita',
            url: `${SITE_URL}/pacchetti`,
            price: '790',
            priceCurrency: 'EUR',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: '790',
              priceCurrency: 'EUR',
              unitText: 'MONTH',
              valueAddedTaxIncluded: false,
            },
            itemOffered: {
              '@type': 'Service',
              '@id': `${SITE_URL}/#digital-growth`,
              name: 'Gestione social, SEO, GEO e campagne per PMI',
              serviceType: 'Digital marketing management',
              provider: { '@id': `${SITE_URL}/#organization` },
              areaServed: { '@type': 'Place', name: 'Worldwide' },
              description:
                'Gestione di tre social, 24 contenuti mensili, articolo SEO e GEO, analisi competitor, gestione di una campagna ADS e report avanzato.',
            },
          },
          {
            '@type': 'Offer',
            name: 'Blog SEO + GEO',
            url: `${SITE_URL}/servizi/blog-seo`,
            price: '29.90',
            priceCurrency: 'EUR',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: '29.90',
              priceCurrency: 'EUR',
              unitText: 'MONTH',
              valueAddedTaxIncluded: false,
            },
            itemOffered: {
              '@type': 'Service',
              '@id': `${SITE_URL}/#blog-service`,
              name: 'Blog SEO + GEO',
              serviceType: 'Produzione e pubblicazione articoli blog',
              provider: { '@id': `${SITE_URL}/#organization` },
              areaServed: { '@type': 'Place', name: 'Worldwide' },
              description: 'Dodici articoli SEO e GEO al mese con piano editoriale, revisione umana e pubblicazione sul blog collegato o consegna per CMS.',
            },
          },
          {
            '@type': 'Offer',
            url: `${SITE_URL}/servizi/siti-e-commerce`,
            price: '19.90',
            priceCurrency: 'EUR',
            valueAddedTaxIncluded: false,
            itemOffered: {
              '@type': 'Service',
              '@id': `${SITE_URL}/#web-development`,
              name: 'Siti web ed e-commerce',
              serviceType: 'Web design e sviluppo e-commerce',
              provider: { '@id': `${SITE_URL}/#organization` },
              areaServed: { '@type': 'Place', name: 'Worldwide' },
              description:
                'Pacchetto separato per siti web ed e-commerce responsive da 19,90 euro al mese. Dopo 12 mesi di canone il sito diventa di proprietà del cliente.',
            },
          },
          {
            '@type': 'Offer',
            url: `${SITE_URL}/consulenza`,
            price: '150',
            priceCurrency: 'EUR',
            itemOffered: {
              '@type': 'Service',
              '@id': `${SITE_URL}/#legal-ai-consulting`,
              name: 'Consulenza AI Act e GDPR',
              serviceType: 'Consulenza legale AI e privacy',
              description:
                'Consulenza individuale di 30 minuti su AI Act, GDPR, privacy, trasparenza dei contenuti e contratti.',
              provider: {
                '@type': 'LegalService',
                '@id': 'https://studiodigitale.eu/#legal-service',
                name: 'Studio Legale BCS',
                url: 'https://studiodigitale.eu/',
                employee: {
                  '@type': 'Person',
                  name: 'Vincenzo Sapone',
                  honorificPrefix: 'Avv.',
                  jobTitle: 'Avvocato Cassazionista',
                },
              },
            },
          },
          {
            '@type': 'Offer',
            url: `${SITE_URL}/servizi/ricerca-clienti-b2b`,
            price: '149',
            priceCurrency: 'EUR',
            itemOffered: {
              '@type': 'Service',
              '@id': `${SITE_URL}/#lead-research-pilot`,
              name: 'Pilot Ricerca Clienti B2B',
              serviceType: 'Ricerca e qualificazione aziende B2B',
              provider: { '@id': `${SITE_URL}/#organization` },
              areaServed: { '@type': 'Place', name: 'Worldwide' },
              description: 'Pilot una tantum con definizione del profilo ideale, ricerca fino a 30 aziende, verifica delle fonti e lista prioritaria.',
            },
          },
        ],
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Social Automation',
      url: SITE_URL,
      inLanguage: 'it-IT',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
}

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
    />
  )
}
