// Fonte unica dei pacchetti acquistabili. I progetti su misura richiedono
// qualificazione commerciale e restano intenzionalmente fuori dal checkout.

export type Pacchetto = {
  slug: string
  nome: string
  eyebrow: string
  prezzo: string
  setup: string
  sottotitolo: string
  idealePer: string
  risultato: string
  cta: string
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
    setup: 'Setup incluso',
    sottotitolo: 'Una gestione completa per comunicare con continuità senza sottrarre tempo al tuo lavoro.',
    idealePer: 'Hai bisogno di essere presente ogni settimana su 2 social, con un’immagine professionale e un processo semplice.',
    risultato: 'Presenza costante su 2 social',
    cta: 'Attiva Presenza',
    features: [
      '16 contenuti al mese per ogni social · 32 pubblicazioni',
      '12 post/caroselli + 4 Reel o Stories per canale',
      '2 social coordinati con un unico calendario',
      'Audit del brand e ottimizzazione dei profili',
      'Copy, grafiche, approvazione e 2 revisioni',
      '1 campagna promozionale organica coordinata al mese',
      'Report mensile e call strategica di 30 minuti',
    ],
    consigliato: false,
  },
  {
    slug: 'crescita',
    nome: 'Crescita',
    eyebrow: 'PMI orientate ai risultati',
    prezzo: '€990',
    setup: 'Setup incluso',
    sottotitolo: 'Un sistema integrato per aumentare copertura, traffico e opportunità commerciali.',
    idealePer: 'Vuoi far lavorare insieme social e contenuti organici su 2 canali, con una direzione strategica mensile.',
    risultato: 'Social e visibilità organica coordinati',
    cta: 'Scegli Crescita',
    includeDa: 'Presenza',
    features: [
      '24 contenuti al mese per ogni social · 48 pubblicazioni',
      '18 post/caroselli + 6 Reel o Short per canale',
      '1 articolo SEO + GEO e analisi competitor',
      'Direzione creativa mensile e coerenza della griglia',
      'Approvazione tua su ogni contenuto prima della pubblicazione',
      'Report avanzato e call strategica di 45 minuti',
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
