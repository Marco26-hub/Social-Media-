import { SITE_URL } from '@/lib/site-config'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Social Automation',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/brand/swa-logo-official.png`,
        width: 958,
        height: 438,
      },
      description:
        'Social Automation è un servizio digitale gestito per PMI e professionisti: strategia, contenuti, pubblicazione multicanale, siti ed e-commerce, SEO e GEO con controllo umano.',
      sameAs: ['https://studiodigitale.eu/'],
      makesOffer: {
        '@type': 'OfferCatalog',
        name: 'Servizi Social Automation',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Social, automatizzato',
              description: 'Presenza social gestita con AI da un unico pannello, con approvazione umana prima della pubblicazione.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Siti & E-commerce',
              description: 'Siti che convertono i visitatori in clienti, fino a negozi online con pannello di gestione.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Visibilità & Crescita',
              description: 'Posizionamento su Google e sugli assistenti AI (SEO e GEO), per trasformare l’attenzione in contatti reali.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Consulenze Legali e AI Compliance',
              description: 'Consulenze legali su GDPR e AI Act (Regolamento UE 2024/1689): audit di conformità, privacy con l’AI, trasparenza dei contenuti generati dall’AI e contratti. Modulo extra su preventivo, in collaborazione con Studio Legale BCS.',
              provider: {
                '@type': 'LegalService',
                name: 'Studio Legale BCS',
                url: 'https://studiodigitale.eu/',
                founder: {
                  '@type': 'Person',
                  name: 'Avv. Vincenzo Sapone',
                  jobTitle: 'Avvocato Cassazionista',
                },
              },
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
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#software`,
      name: 'Social Automation',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: SITE_URL,
      inLanguage: 'it-IT',
      publisher: { '@id': `${SITE_URL}/#organization` },
      description:
        'Piattaforma e servizio gestito per piano editoriale, contenuti social, blog SEO e GEO, analisi competitor, pubblicazione multicanale, approvazione umana e report.',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'EUR',
        lowPrice: 390,
        highPrice: 790,
        offerCount: 2,
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      inLanguage: 'it-IT',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Che cos’è Social Automation?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Social Automation è un servizio gestito di social media management con AI per agenzie e PMI italiane. Cura piano editoriale, creazione contenuti, audit SEO e GEO, campagne ADS e pubblicazione sui canali social.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quali servizi offre Social Automation?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Social Automation offre gestione social multicanale, siti ed e-commerce, contenuti SEO e GEO, analisi competitor, approvazione nel portale e report. Le configurazioni complesse e la consulenza AI compliance sono disponibili su preventivo.',
          },
        },
        {
          '@type': 'Question',
          name: 'Su quali canali social pubblica Social Automation?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Social Automation gestisce Instagram, Facebook, TikTok, Pinterest, LinkedIn, YouTube Shorts e il blog aziendale.',
          },
        },
        {
          '@type': 'Question',
          name: 'I contenuti vengono pubblicati senza controllo?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Ogni contenuto generato dall’AI passa da un’approvazione umana con un clic prima della pubblicazione, così mantieni il pieno controllo sulla linea editoriale.',
          },
        },
        {
          '@type': 'Question',
          name: 'Il budget pubblicitario è incluso nel canone?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Il budget delle campagne ADS è sempre separato dal canone mensile, così i costi restano chiari e misurabili.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quanto costa Social Automation?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Il piano Presenza costa 390 euro al mese e il piano Crescita 790 euro al mese, IVA esclusa. Entrambi includono il setup. I progetti per e-commerce, agenzie e organizzazioni sono configurati su preventivo.',
          },
        },
      ],
    },
  ],
}

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
