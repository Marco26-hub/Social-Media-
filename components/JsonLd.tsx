const SITE_URL = 'https://social-media-manager-zte4.onrender.com'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Social Automation',
      url: SITE_URL,
      logo: `${SITE_URL}/og.png`,
      sameAs: [],
      description:
        'Social Automation è il partner unico per l’automazione con AI del business: agenti AI e automazioni, receptionist AI 24/7, siti ed e-commerce, gestione social con AI e visibilità su Google e sugli assistenti AI (SEO e GEO) per agenzie e PMI italiane.',
      makesOffer: {
        '@type': 'OfferCatalog',
        name: 'Servizi Social Automation',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Automazione & Agenti AI',
              description: 'Agenti e automazioni AI che gestiscono i compiti ripetitivi del business, giorno e notte.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Voce AI & Reception',
              description: 'Un assistente AI che risponde al telefono 24/7, qualifica il chiamante e fissa appuntamenti.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Siti & E-commerce',
              description: 'Siti che convertono i visitatori in clienti, fino a negozi online gestiti con l’AI.',
            },
          },
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
              name: 'Visibilità & Crescita',
              description: 'Posizionamento su Google e sugli assistenti AI (SEO e GEO), per trasformare l’attenzione in contatti reali.',
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
        'Piattaforma e servizio gestito che mette l’AI al lavoro sul business: genera contenuti social (hook, caption, hashtag, CTA), piano editoriale, blog SEO, campagne ADS, audit SEO e GEO, analisi competitor, lead generation, catalogo prodotti, immagini con AI e documenti legali (Privacy, Cookie, GDPR). Pubblicazione multi-canale con approvazione umana 1-click.',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'EUR',
        lowPrice: 390,
        highPrice: 2590,
        offerCount: 5,
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
            text: 'Cinque aree: Automazione & Agenti AI (compiti ripetitivi gestiti dall’AI), Voce AI & Reception (receptionist AI 24/7 che risponde alle chiamate e fissa appuntamenti), Siti & E-commerce (siti e negozi online che convertono), Social automatizzato (contenuti e pubblicazione con approvazione umana) e Visibilità & Crescita (posizionamento su Google e sugli assistenti AI).',
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
            text: 'I piani partono dal pacchetto Starter a 390€/mese, passano per Crescita a 1.090€/mese fino al pacchetto Dominio a 2.590€/mese. Il dettaglio aggiornato è nella pagina Servizi.',
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
