// FONTE UNICA DEI PACCHETTI — usata da landing (/), servizi (/servizi) e
// registrazione (/register + API). Modifica QUI e resta tutto allineato.
// Prezzi validati vs concorrenza reale 2026 (ANALISI_CONCORRENZA_2026.md).

export type Pacchetto = {
  slug: string            // usato in /register?piano= e nell'API
  nome: string            // nome breve, coerente ovunque
  eyebrow: string         // descrittore target
  prezzo: string          // canone mensile, es. '€390'
  setup: string           // es. 'Setup incluso' | '€290 setup'
  sottotitolo: string     // descrizione breve
  features: string[]
  consigliato: boolean
}

export const PACCHETTI: Pacchetto[] = [
  {
    slug: 'starter',
    nome: 'Starter',
    eyebrow: 'Per iniziare',
    prezzo: '€390',
    setup: 'Setup incluso',
    sottotitolo: 'Per freelance, partite IVA e professionisti che vogliono presenza social senza impegni pesanti.',
    features: ['8 contenuti al mese', '1-2 canali social', 'Brand discovery automatico', 'Anteprima multi-piattaforma', 'Report mensile semplice'],
    consigliato: false,
  },
  {
    slug: 'presenza',
    nome: 'Presenza',
    eyebrow: 'Per attività locali',
    prezzo: '€590',
    setup: '€290 setup',
    sottotitolo: 'Per chi ha già un sito e vuole una gestione social ordinata, costante e professionale con AI.',
    features: ['12 contenuti al mese', '2 canali social', 'AI content scoring', 'Piano editoriale strategico', 'Report KPI + call mensile'],
    consigliato: false,
  },
  {
    slug: 'crescita',
    nome: 'Crescita',
    eyebrow: 'Consigliato',
    prezzo: '€1.090',
    setup: '€490 setup',
    sottotitolo: 'Il pacchetto più equilibrato per PMI che vogliono struttura, contenuti, lead e crescita misurabile.',
    features: ['20 contenuti/mese su 3 canali', 'Reel e Short premium', 'Audit SEO + GEO completo', 'Analisi competitor e lead', 'Report bisettimanale con call'],
    consigliato: true,
  },
  {
    slug: 'ecommerce',
    nome: 'E-commerce',
    eyebrow: 'Per vendere online',
    prezzo: '€1.690',
    setup: '€990 setup',
    sottotitolo: 'Per negozi e brand che vogliono collegare prodotti, promozioni e social in un sistema unico.',
    features: ['30 contenuti/mese su 4 canali', 'Campagne ADS gestite', 'Product tagging + UTM', 'Lead generation + funnel', 'Report settimanale + call'],
    consigliato: false,
  },
  {
    slug: 'dominio',
    nome: 'Dominio',
    eyebrow: 'Per aziende strutturate',
    prezzo: '€2.590',
    setup: '€1.490 setup',
    sottotitolo: 'Strategia omnichannel completa per aziende che vogliono dominare il mercato digitale.',
    features: ['50+ contenuti/mese su 5 canali', 'Blog SEO/GEO continuativo', 'Produzione video avanzata', 'Strategia omnichannel', 'Dashboard live e priorità'],
    consigliato: false,
  },
]

export const PACCHETTO_SLUGS = new Set(PACCHETTI.map(p => p.slug))

export function pacchettoBySlug(slug: string | null | undefined): Pacchetto | undefined {
  if (!slug) return undefined
  return PACCHETTI.find(p => p.slug === slug.toLowerCase())
}
