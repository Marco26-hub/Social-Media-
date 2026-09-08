import { BLOG_SERVICE } from '@/lib/blog-service'
import { PACCHETTI } from '@/lib/pacchetti'
import { SITE_URL } from '@/lib/site-config'
import { TITOLARE } from '@/lib/legal-config'
import { TRUSTPILOT_PROFILO_URL } from '@/lib/trustpilot'


// I prezzi dello schema si ricavano dal listino, non si riscrivono a mano:
// erano rimasti a 390 e 790 dopo il passaggio a 490 e 990, e ogni motore di
// ricerca leggeva un listino che il sito non praticava piu'.
const PREZZO_SCHEMA = PACCHETTI.map(p => p.prezzo.replace(/[^0-9,]/g, '').replace(',', '.'))

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      // Un solo nodo con due tipi: e' una ditta individuale, non un gruppo.
      // Prima erano due nodi legati da parentOrganization, che dichiarava due
      // soggetti giuridici distinti, e nessuno dei due era completo.
      '@type': ['Organization', 'ProfessionalService'],
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
      // Il dominio non contiene la parola «Web», che e' quella che distingue
      // il marchio: esiste almeno un'altra impresa dello stesso settore in
      // Italia sulla stringa «Social Automation». Qui si dichiara cio' che
      // nessun omonimo puo' replicare: partita IVA, sede e dominio.
      alternateName: ['SWA', 'SWA Social Web Automation', 'socialautomation.app'],
      disambiguatingDescription:
        `Ditta individuale di Marco Dibenedetto con sede a Cermenate, in provincia di Como, partita IVA IT${TITOLARE.partitaIva}. Da non confondere con altre imprese di denominazione simile attive in altre province italiane.`,
      identifier: [
        { '@type': 'PropertyValue', propertyID: 'VAT', name: 'Partita IVA', value: `IT${TITOLARE.partitaIva}` },
      ],
      priceRange: '€€',
      currenciesAccepted: 'EUR',
      knowsLanguage: ['it', 'en'],
      sameAs: [
        'https://www.instagram.com/socialwebautomation/',
        'https://www.facebook.com/profile.php?id=61592835840985',
        // Profilo Trustpilot del dominio. Serve a legare l'impresa a una fonte
        // terza verificabile: e' esattamente il tipo di riscontro che i motori
        // generativi cercano per distinguere questa impresa dalle omonime.
        // Nessun aggregateRating dichiarato qui: le stelle le pubblica
        // Trustpilot dal proprio widget, e un punteggio scritto a mano nello
        // schema del venditore e' una recensione auto-attribuita.
        TRUSTPILOT_PROFILO_URL,
      ],
      founder: { '@id': `${SITE_URL}/#marco-dibenedetto` },
      employee: { '@id': `${SITE_URL}/#marco-dibenedetto` },
      vatID: `IT${TITOLARE.partitaIva}`,
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
              valueAddedTaxIncluded: false,
              unitCode: 'MON',
              billingDuration: 1,
              billingIncrement: 1,
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
              valueAddedTaxIncluded: false,
              unitCode: 'MON',
              billingDuration: 1,
              billingIncrement: 1,
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
            price: BLOG_SERVICE.price,
            priceCurrency: 'EUR',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: BLOG_SERVICE.price,
              priceCurrency: 'EUR',
              valueAddedTaxIncluded: false,
              unitCode: 'MON',
              billingDuration: 1,
              billingIncrement: 1,
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
      // La persona che firma. Prima «founder» e «author» erano due stringhe
      // scollegate: per un motore l'autore non era un'entita'.
      '@type': 'Person',
      '@id': `${SITE_URL}/#marco-dibenedetto`,
      name: 'Marco Dibenedetto',
      url: `${SITE_URL}/autore/marco-dibenedetto`,
      jobTitle: 'Titolare',
      worksFor: { '@id': `${SITE_URL}/#organization` },
      knowsLanguage: ['it', 'en'],
      knowsAbout: [
        'Gestione social media per PMI',
        'SEO e Generative Engine Optimization',
        'Automazione dei processi aziendali',
        'Assistenti telefonici AI',
        'AI Act e trasparenza nell’uso dell’intelligenza artificiale',
      ],
      sameAs: ['https://www.instagram.com/socialwebautomation/'],
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
