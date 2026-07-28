// Fonte unica dei pacchetti acquistabili. I progetti su misura richiedono
// qualificazione commerciale e restano intenzionalmente fuori dal checkout.

export type Pacchetto = {
  slug: string
  nome: string
  eyebrow: string
  prezzo: string
  setup: string
  sottotitolo: string
  includeDa?: string
  features: string[]
  consigliato: boolean
}

export const PACCHETTI: Pacchetto[] = [
  {
    slug: 'presenza',
    nome: 'Presenza',
    eyebrow: 'Professionisti e piccole attività',
    prezzo: '€490',
    setup: '€290 setup',
    sottotitolo: 'Per delegare la gestione social con continuità, mantenendo il controllo su ogni pubblicazione.',
    features: [
      '12 contenuti al mese',
      'Fino a 2 canali social',
      'Piano editoriale mensile',
      'Copy, hashtag e immagini coordinate',
      'Approvazione e 1 ciclo di revisione',
      'Pubblicazione programmata',
      'Report mensile essenziale',
    ],
    consigliato: false,
  },
  {
    slug: 'crescita',
    nome: 'Crescita',
    eyebrow: 'PMI orientate ai risultati',
    prezzo: '€890',
    setup: '€490 setup',
    sottotitolo: 'Per collegare presenza social, contenuti organici e analisi in un processo di crescita misurabile.',
    includeDa: 'Presenza',
    features: [
      '20 contenuti su 3 canali',
      'Reel e Short da materiali forniti',
      '1 articolo blog SEO + GEO al mese',
      'Analisi competitor mensile',
      '2 cicli di revisione',
      'Report strategico e call mensile',
      'Supporto prioritario',
    ],
    consigliato: true,
  },
]

export const PACCHETTO_SLUGS = new Set(PACCHETTI.map(p => p.slug))

export function pacchettoBySlug(slug: string | null | undefined): Pacchetto | undefined {
  if (!slug) return undefined
  return PACCHETTI.find(p => p.slug === slug.toLowerCase())
}

// Conserva la lettura dei valori storici senza esporre i vecchi pacchetti.
export const PIANO_TO_PACCHETTO_SLUG: Record<string, string> = {
  free: 'presenza',
  starter: 'presenza',
  pro: 'presenza',
  slancio: 'crescita',
  growth: 'crescita',
  agency: 'crescita',
  ecommerce: 'crescita',
  dominio: 'crescita',
  enterprise: 'crescita',
}

export function pacchettoSlugFromPiano(piano: string | null | undefined): string {
  const normalized = (piano || '').toLowerCase().trim()
  if (PACCHETTO_SLUGS.has(normalized)) return normalized
  return PIANO_TO_PACCHETTO_SLUG[normalized] || 'presenza'
}

export function pacchettoFromPiano(piano: string | null | undefined): Pacchetto {
  return pacchettoBySlug(pacchettoSlugFromPiano(piano)) || PACCHETTI[0]
}
