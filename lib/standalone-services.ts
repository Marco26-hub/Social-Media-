import { BLOG_SERVICE } from '@/lib/blog-service'

export type StandaloneService = {
  slug: 'blog-seo' | 'web-commerce' | 'lead-pilot'
  name: string
  shortName: string
  amountCents: number
  displayPrice: string
  billingMode: 'subscription' | 'payment'
  cadenceLabel: string
  description: string
  onboarding: string
  features: readonly string[]
}

export const STANDALONE_SERVICES: StandaloneService[] = [
  {
    slug: 'blog-seo',
    name: BLOG_SERVICE.name,
    shortName: 'Blog SEO + GEO',
    amountCents: 2990,
    displayPrice: BLOG_SERVICE.displayPrice,
    billingMode: 'subscription',
    cadenceLabel: 'al mese',
    description: `${BLOG_SERVICE.articlesPerMonth} articoli SEO + GEO al mese, con piano editoriale e controllo umano.`,
    onboarding: 'Dopo il pagamento raccogliamo accessi, servizi prioritari, tono del brand e CMS da collegare.',
    features: BLOG_SERVICE.features,
  },
  {
    slug: 'web-commerce',
    name: 'Web & Commerce Base',
    shortName: 'Web & Commerce',
    amountCents: 1990,
    displayPrice: '€19,90',
    billingMode: 'subscription',
    cadenceLabel: 'al mese',
    description: 'Canone base per landing page, sito aziendale o progetto e-commerce mobile-first.',
    onboarding: 'Dopo il pagamento definiamo struttura e materiali. Funzioni, dominio e lavorazioni fuori dal piano base vengono approvati prima di ogni costo aggiuntivo.',
    features: [
      'Hosting e manutenzione del progetto base',
      'Design responsive e SEO tecnica essenziale',
      'Collegamento a moduli, analytics e contenuti',
      'Proprietà del sito dopo 12 mesi di canone',
    ],
  },
  {
    slug: 'lead-pilot',
    name: 'Pilot Ricerca Clienti B2B',
    shortName: 'Ricerca Clienti B2B',
    amountCents: 14900,
    displayPrice: '€149',
    billingMode: 'payment',
    cadenceLabel: 'una tantum',
    description: 'Un primo ciclo di ricerca e qualificazione di aziende coerenti con il tuo cliente ideale.',
    onboarding: 'Dopo il pagamento definiamo mercato, area geografica, criteri di esclusione e segnali commerciali da verificare.',
    features: [
      'Definizione del profilo cliente ideale',
      'Ricerca fino a 30 aziende coerenti',
      'Verifica delle fonti e dei segnali pubblici',
      'Lista prioritaria con motivazione',
    ],
  },
]

export const STANDALONE_SERVICE_SLUGS = new Set(STANDALONE_SERVICES.map(service => service.slug))

export function standaloneServiceBySlug(value: string | null | undefined): StandaloneService | undefined {
  if (!value) return undefined
  return STANDALONE_SERVICES.find(service => service.slug === value.trim().toLowerCase())
}
