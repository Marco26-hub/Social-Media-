import { BLOG_SERVICE } from '@/lib/blog-service'
import { VIDEO_COMPRESO, VIDEO_PACCHETTI } from '@/lib/video-listino'

export type StandaloneService = {
  slug: 'blog-seo' | 'web-commerce' | 'web-impresa' | 'lead-pilot' | 'agenda-clienti' | 'tutto-in-uno' | 'voce-base' | 'voce-attivita' | 'voce-azienda'
    | 'video-start' | 'video-silver' | 'video-gold' | 'video-platinum'
    | 'profili-social-gbp'
  name: string
  shortName: string
  amountCents: number
  setupCents?: number
  displayPrice: string
  /** Prefisso del prezzo per i canoni che sono una soglia: «a partire da 19,90 €».
   *  Senza, la cifra si legge come se coprisse tutto il progetto. */
  pricePrefix?: string
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
    // Dalla sorgente, non a mano: alzando il canone a 149 il display era gia
    // cambiato mentre l'importo restava 2990, cioe' la pagina prometteva un
    // prezzo e Stripe ne avrebbe addebitato un altro.
    amountCents: Math.round(parseFloat(BLOG_SERVICE.price) * 100),
    displayPrice: BLOG_SERVICE.displayPrice,
    billingMode: 'subscription',
    cadenceLabel: 'al mese',
    description: `${BLOG_SERVICE.articlesPerMonth} articoli SEO + GEO al mese, con piano editoriale e controllo umano.`,
    onboarding: 'Dopo il pagamento raccogliamo accessi, servizi prioritari, tono del brand e CMS da collegare.',
    features: BLOG_SERVICE.features,
  },
  {
    slug: 'web-commerce',
    name: 'Sito Web Base',
    shortName: 'Sito Web',
    amountCents: 1990,
    displayPrice: '€19,90',
    pricePrefix: 'a partire da',
    billingMode: 'subscription',
    cadenceLabel: 'al mese',
    description: 'Canone base per una landing page semplice o un sito web essenziale mobile-first. E-commerce e funzioni avanzate vengono quotati a parte.',
    onboarding: 'Dopo il pagamento definiamo struttura e materiali della landing o del sito base. E-commerce, funzioni, dominio e lavorazioni fuori dal piano base vengono approvati prima di ogni costo aggiuntivo.',
    features: [
      'Hosting e manutenzione del progetto base',
      'Design responsive e SEO tecnica essenziale',
      'Collegamento a moduli, analytics e contenuti',
      'Proprietà del sito dopo 12 mesi di canone',
    ],
  },
  {
    slug: 'web-impresa',
    name: 'Sito impresa',
    shortName: 'Sito impresa',
    amountCents: 30000,
    displayPrice: '€300',
    pricePrefix: 'a partire da',
    billingMode: 'subscription',
    cadenceLabel: 'al mese',
    description: 'Sito aziendale su misura: più pagine, struttura pensata sugli intenti di ricerca del settore e i moduli che raccolgono le richieste. Il canone parte da questa cifra e viene fissato dopo il progetto.',
    onboarding: 'Prima del pagamento definiamo pagine, contenuti e funzioni, e il canone definitivo viene scritto nella proposta. Dominio, e-commerce, multilingua e sviluppi su misura vengono approvati prima di ogni costo aggiuntivo.',
    features: [
      'Progetto di struttura e testi sugli intenti del settore',
      'Hosting, manutenzione e aggiornamenti compresi',
      'Moduli, statistiche di percorso e dati strutturati',
      'Proprietà del sito dopo 12 mesi di canone',
    ],
  },
  {
    slug: 'profili-social-gbp',
    name: 'Creazione profili social e Google Business Profile',
    shortName: 'Profili social e GBP',
    amountCents: 80000,
    displayPrice: '€800',
    billingMode: 'payment',
    cadenceLabel: 'una tantum',
    description: 'Apertura e configurazione dei profili social e della scheda Google Business Profile, con nome, categorie, descrizioni, contatti, orari e immagini coerenti fra loro. È il lavoro che rende trovabile un’attività prima ancora di pubblicare qualcosa.',
    onboarding: 'Dopo il pagamento raccogliamo dati, logo, foto e informazioni dell’attività, apriamo o rivendichiamo i profili e la scheda Google, e consegniamo gli accessi intestati a te. La verifica della scheda Google dipende dai tempi di Google, non da noi.',
    features: [
      'Apertura o rivendicazione dei profili social scelti',
      'Scheda Google Business Profile con categorie, orari e area servita',
      'Nome, descrizioni, contatti e link uniformi su tutti i canali',
      'Immagine di profilo e copertina preparate nei formati giusti',
      'Accessi intestati al cliente, consegnati a fine lavoro',
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
      '600 minuti di chiamate al mese',
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
      '600 minuti al mese',
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
    description: 'Segretaria telefonica AI per studi, saloni, officine e team con più chiamate mensili.',
    onboarding: 'Dopo il pagamento configuriamo regole, prove voce, agenda e registro chiamate. L’avvio una tantum viene addebitato sulla prima fattura. Ti contattiamo entro un giorno lavorativo per fissare la call conoscitiva e l’onboarding.',
    features: [
      '1000 minuti al mese',
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
    description: 'Segretaria telefonica AI per cliniche, reparti e volumi più alti.',
    onboarding: 'Dopo il pagamento valutiamo percorsi, sedi, numeri e collegamenti. L’avvio copre la configurazione standard; sedi, numeri e sviluppi aggiuntivi vengono concordati prima di ogni costo. Ti contattiamo entro un giorno lavorativo per fissare la call conoscitiva e l’onboarding.',
    features: [
      '3000 minuti al mese',
      'Percorsi per reparto o tipo di richiesta',
      'Controllo qualita su esiti e conversazioni',
      'Assistenza prioritaria secondo proposta',
    ],
  },
  // Riprese video: quattro pacchetti una tantum, generati dal listino video
  // cosi' che prezzo e contenuti non possano divergere da quelli pubblicati.
  // Sono canoni mensili, come il blog e il sito: il fornitore li quota al mese.
  ...VIDEO_PACCHETTI.map(v => ({
    slug: `video-${v.id}` as StandaloneService['slug'],
    name: `Riprese video — ${v.nome}`,
    shortName: `Video ${v.nome}`,
    amountCents: v.prezzo * 100,
    displayPrice: `€${v.prezzo.toLocaleString('it-IT')}`,
    billingMode: 'subscription' as const,
    cadenceLabel: 'al mese',
    description: `${v.video} video verticali al mese girati in azienda, in ${v.sessioni} ${v.sessioni === 1 ? 'sessione di ripresa' : 'sessioni di ripresa'}.`,
    onboarding:
      'Dopo il pagamento fissiamo il sopralluogo, decidiamo insieme le fasce orarie di ripresa e prepariamo gli script. Pedaggi, parcheggi e trasferte fuori dall’area concordata restano esclusi e vengono indicati prima.',
    features: VIDEO_COMPRESO,
  })),
]

export const STANDALONE_SERVICE_SLUGS = new Set(STANDALONE_SERVICES.map(service => service.slug))

export function standaloneServiceBySlug(value: string | null | undefined): StandaloneService | undefined {
  if (!value) return undefined
  return STANDALONE_SERVICES.find(service => service.slug === value.trim().toLowerCase())
}
