import { PACCHETTI } from '@/lib/pacchetti'
import { SITE_URL } from '@/lib/site-config'
import { TITOLARE } from '@/lib/legal-config'


// I prezzi dello schema si ricavano dal listino, non si riscrivono a mano:
// erano rimasti a 390 e 790 dopo il passaggio a 490 e 990, e ogni motore di
// ricerca leggeva un listino che il sito non praticava piu'.
const PREZZO_SCHEMA = PACCHETTI.map(p => p.prezzo.replace(/[^0-9,]/g, '').replace(',', '.'))

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
        'Servizi digitali integrati per PMI e professionisti: social media management, Blog SEO e GEO, siti, e-commerce, ricerca clienti B2B e compliance AI.',
      alternateName: ['SWA', 'Social Web Automation'],
      sameAs: [
        'https://www.instagram.com/socialwebautomation/',
        'https://www.facebook.com/profile.php?id=61592835840985',
      ],
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
      areaServed: [
        { '@type': 'Country', name: 'Italia' },
        { '@type': 'AdministrativeArea', name: 'Provincia di Como' },
        { '@type': 'AdministrativeArea', name: 'Città metropolitana di Milano' },
        { '@type': 'AdministrativeArea', name: 'Provincia di Monza e della Brianza' },
        { '@type': 'AdministrativeArea', name: 'Provincia di Varese' },
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: TITOLARE.email,
        telephone: TITOLARE.telefono,
        availableLanguage: ['it'],
        areaServed: 'IT',
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
        'B2B lead research',
        'Lead qualification',
        'AI compliance',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Servizi e pacchetti Social Web Automation',
        itemListElement: [
          {
            '@type': 'Offer',
            name: `Piano ${PACCHETTI[0].nome}`,
            url: `${SITE_URL}/pacchetti`,
            price: PREZZO_SCHEMA[0],
            priceCurrency: 'EUR',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: PREZZO_SCHEMA[0],
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
              areaServed: { '@type': 'Country', name: 'Italia' },
              description:
                'Strategia, piano editoriale, 16 contenuti al mese per ciascuno dei 2 social scelti dal cliente, approvazione prima della pubblicazione, pubblicazione e report mensile.',
            },
          },
          {
            '@type': 'Offer',
            name: `Piano ${PACCHETTI[1].nome}`,
            url: `${SITE_URL}/pacchetti`,
            price: PREZZO_SCHEMA[1],
            priceCurrency: 'EUR',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: PREZZO_SCHEMA[1],
              priceCurrency: 'EUR',
              unitText: 'MONTH',
              valueAddedTaxIncluded: false,
            },
            itemOffered: {
              '@type': 'Service',
              '@id': `${SITE_URL}/#digital-growth`,
              name: 'Gestione social e visibilita organica per PMI',
              serviceType: 'Digital marketing management',
              provider: { '@id': `${SITE_URL}/#organization` },
              areaServed: { '@type': 'Country', name: 'Italia' },
              description:
                'Gestione di 2 social scelti dal cliente, 24 contenuti al mese per canale, un articolo SEO + GEO, analisi dei concorrenti e report avanzato. Le campagne a pagamento non sono comprese.',
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
              areaServed: { '@type': 'Country', name: 'Italia' },
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
              name: 'Sito Web Base',
              serviceType: 'Web design e sviluppo landing page',
              provider: { '@id': `${SITE_URL}/#organization` },
              areaServed: { '@type': 'Country', name: 'Italia' },
              description:
                'Pacchetto separato per landing page semplici e siti web base a partire da 19,90 euro al mese. E-commerce e funzioni avanzate vengono quotati a parte.',
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
              areaServed: { '@type': 'Country', name: 'Italia' },
              description: 'Pilot una tantum con definizione del profilo ideale, ricerca fino a 30 aziende, verifica delle fonti e lista prioritaria.',
            },
          },
        ],
      },
    },
    {
      // Tipo locale: dice ai motori che questa impresa sta in un posto preciso.
      // Serve a non farla confondere con omonime di altre province, e a farla
      // comparire nelle ricerche con intento locale del suo territorio.
      '@type': 'ProfessionalService',
      '@id': `${SITE_URL}/#impresa`,
      name: 'Social Web Automation',
      legalName: TITOLARE.ragioneSociale,
      url: SITE_URL,
      image: { '@id': `${SITE_URL}/#logo` },
      parentOrganization: { '@id': `${SITE_URL}/#organization` },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Via Giuseppe Verdi 2B',
        postalCode: '22072',
        addressLocality: 'Cermenate',
        addressRegion: 'CO',
        addressCountry: 'IT',
      },
      email: TITOLARE.email,
      telephone: TITOLARE.telefono,
      vatID: `IT${TITOLARE.partitaIva}`,
      priceRange: '€€',
      currenciesAccepted: 'EUR',
      areaServed: [
        { '@type': 'AdministrativeArea', name: 'Provincia di Como' },
        { '@type': 'AdministrativeArea', name: 'Città metropolitana di Milano' },
        { '@type': 'AdministrativeArea', name: 'Provincia di Monza e della Brianza' },
        { '@type': 'AdministrativeArea', name: 'Provincia di Varese' },
        { '@type': 'Country', name: 'Italia' },
      ],
      knowsLanguage: ['it', 'en'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Social Web Automation',
      url: SITE_URL,
      inLanguage: ['it-IT', 'en'],
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
