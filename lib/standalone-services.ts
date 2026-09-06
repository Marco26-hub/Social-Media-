import { BLOG_SERVICE } from '@/lib/blog-service'

export type StandaloneService = {
  slug: 'blog-seo' | 'web-commerce' | 'lead-pilot' | 'agenda-clienti' | 'tutto-in-uno' | 'voce-base' | 'voce-attivita' | 'voce-azienda'
  name: string
  shortName: string
  amountCents: number
  setupCents?: number
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
  {
    slug: 'agenda-clienti',
    name: 'Agenda, clienti e WhatsApp',
    shortName: 'Agenda e clienti',
    amountCents: 39000,
    setupCents: 79000,
    displayPrice: '€390',
    billingMode: 'subscription',
    cadenceLabel: 'al mese',
    description: 'Recupero clienti, spazi liberi in agenda e messaggi WhatsApp preparati per approvazione.',
    onboarding: 'Dopo il pagamento raccogliamo agenda, storico clienti, regole di contatto e tono dei messaggi. L’avvio una tantum viene addebitato sulla prima fattura. Ti contattiamo entro un giorno lavorativo per fissare la call conoscitiva e l’onboarding.',
    features: [
      'Controllo giornaliero di clienti, appuntamenti e spazi liberi',
      'Messaggi WhatsApp pronti e approvati prima dell’invio',
      'Pannello da telefono per titolare e personale',
      '1000 invii inclusi al mese',
    ],
  },
  {
    slug: 'tutto-in-uno',
    name: 'Tutto in uno: Agenda + Segretaria telefonica AI',
    shortName: 'Tutto in uno',
    amountCents: 56900,
    setupCents: 119000,
    displayPrice: '€569',
    billingMode: 'subscription',
    cadenceLabel: 'al mese',
    description: 'Agenda, clienti e WhatsApp più risposta telefonica AI con appuntamenti e passaggi al personale.',
    onboarding: 'Dopo il pagamento definiamo dati agenda, regole telefoniche, messaggi e prove prima dell’attivazione. L’avvio copre la configurazione standard; eventuali lavorazioni aggiuntive vengono concordate prima di ogni costo. Ti contattiamo entro un giorno lavorativo per fissare la call conoscitiva e l’onboarding.',
    features: [
      'Tutte le funzioni del piano Agenda e clienti',
      '300 minuti di chiamate al mese',
      '1000 invii WhatsApp inclusi',
      'Un solo pannello per agenda, messaggi e chiamate',
    ],
  },
  {
    slug: 'voce-base',
    name: 'Segretaria telefonica AI - Voce Base',
    shortName: 'Voce Base',
    amountCents: 19900,
    setupCents: 59000,
    displayPrice: '€199',
    billingMode: 'subscription',
    cadenceLabel: 'al mese',
    description: 'Segretaria telefonica AI per rispondere, informare e fissare appuntamenti quando sei occupato.',
    onboarding: 'Dopo il pagamento raccogliamo servizi, prezzi, orari e regole. L’avvio una tantum viene addebitato sulla prima fattura. Ti contattiamo entro un giorno lavorativo per fissare la call conoscitiva e l’onboarding.',
    features: [
      '300 minuti al mese',
      'Una segretaria e un numero telefonico collegato',
      'Risposte su servizi, prezzi e orari approvati',
      'Prenotazione dopo conferma del cliente',
    ],
  },
  {
    slug: 'voce-attivita',
    name: 'Segretaria telefonica AI - Voce Attività',
    shortName: 'Voce Attività',
    amountCents: 34900,
    setupCents: 79000,
    displayPrice: '€349',
    billingMode: 'subscription',
    cadenceLabel: 'al mese',
    description: 'Segretaria telefonica AI per studi, saloni, officine e team con piu chiamate mensili.',
    onboarding: 'Dopo il pagamento configuriamo regole, prove voce, agenda e registro chiamate. L’avvio una tantum viene addebitato sulla prima fattura. Ti contattiamo entro un giorno lavorativo per fissare la call conoscitiva e l’onboarding.',
    features: [
      '700 minuti al mese',
      'Italiano o inglese in base a chi chiama',
      'Registro chiamate con trascrizione e riepilogo',
      'Controllo mensile su risposte e regole',
    ],
  },
  {
    slug: 'voce-azienda',
    name: 'Segretaria telefonica AI - Voce Azienda',
    shortName: 'Voce Azienda',
    amountCents: 64900,
    setupCents: 99000,
    displayPrice: '€649',
    billingMode: 'subscription',
    cadenceLabel: 'al mese',
    description: 'Segretaria telefonica AI per cliniche, reparti e volumi piu alti.',
    onboarding: 'Dopo il pagamento valutiamo percorsi, sedi, numeri e collegamenti. L’avvio copre la configurazione standard; sedi, numeri e sviluppi aggiuntivi vengono concordati prima di ogni costo. Ti contattiamo entro un giorno lavorativo per fissare la call conoscitiva e l’onboarding.',
    features: [
      '1500 minuti al mese',
      'Percorsi per reparto o tipo di richiesta',
      'Controllo qualita su esiti e conversazioni',
      'Assistenza prioritaria secondo proposta',
    ],
  },
]

export const STANDALONE_SERVICE_SLUGS = new Set(STANDALONE_SERVICES.map(service => service.slug))

export function standaloneServiceBySlug(value: string | null | undefined): StandaloneService | undefined {
  if (!value) return undefined
  return STANDALONE_SERVICES.find(service => service.slug === value.trim().toLowerCase())
}
