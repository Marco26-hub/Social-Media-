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
        'Servizio gestito di social media management con AI per agenzie e PMI italiane: contenuti, piano editoriale, audit SEO e GEO, campagne ADS e pubblicazione con approvazione umana.',
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
        'Piattaforma e servizio gestito di social media management con AI: genera contenuti (hook, caption, hashtag, CTA), piano editoriale, audit SEO e GEO, campagne ADS, analisi competitor, lead generation e report. Pubblicazione multi-canale con approvazione umana 1-click.',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'EUR',
        lowPrice: 390,
        highPrice: 2590,
        offerCount: 3,
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
