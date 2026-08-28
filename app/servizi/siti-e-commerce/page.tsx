import type { Metadata } from 'next'
import { Globe2 } from 'lucide-react'
import MarketingDetailPage, { type MarketingDetailConfig } from '@/components/MarketingDetailPage'
import { SITE_URL } from '@/lib/site-config'

const title = 'Siti Web ed E-commerce per PMI da 19,90 €/mese | SWA'
const description = 'Siti web ed e-commerce mobile-first da 19,90 €/mese. Dopo 12 mesi il sito è tuo. UX, pagamenti, analytics e integrazione con social e campagne.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/servizi/siti-e-commerce` },
  openGraph: { title, description, url: `${SITE_URL}/servizi/siti-e-commerce` },
  twitter: { title, description },
}

const config = {
  path: '/servizi/siti-e-commerce',
  eyebrow: 'Web design e commerce digitale',
  title: 'Siti ed e-commerce che accompagnano dalla scoperta all’azione.',
  lead: 'Progettiamo esperienze mobile-first collegate a contenuti, social e campagne. Ogni pagina ha un compito preciso: spiegare, rassicurare, raccogliere un contatto o concludere una vendita.',
  serviceName: 'Siti web ed e-commerce',
  serviceType: 'Progettazione e sviluppo di siti web, landing page ed e-commerce',
  promise: 'Un punto di arrivo credibile per trasformare attenzione e traffico in opportunità.',
  startingPrice: '19.90',
  offerHighlight: 'Dopo 12 mesi di canone, il sito è tuo.',
  priceNote: 'Canone tecnologico di partenza. Progettazione, configurazione e funzioni vengono definite prima dell’avvio. Dominio e servizi esterni restano separati, se previsti.',
  primaryCtaLabel: 'Attiva Web & Commerce',
  primaryCtaHref: '/acquista?servizio=web-commerce',
  icon: Globe2,
  signals: ['Soluzioni web da €19,90 al mese', 'Proprietà del sito dopo 12 mesi', 'Esperienza mobile-first'],
  outcomes: [
    { title: 'Chiarezza', text: 'Proposta di valore e percorsi comprensibili in pochi passaggi.' },
    { title: 'Conversione', text: 'CTA, moduli, checkout e contenuti costruiti per l’azione.' },
    { title: 'Integrazione', text: 'Social, campagne, catalogo e dati lavorano nello stesso sistema.' },
  ],
  deliverablesTitle: 'Strategia, interfaccia e misurazione nello stesso progetto.',
  deliverablesIntro: 'Non partiamo da un tema grafico. Definiamo prima obiettivi, informazioni e azioni attese, poi costruiamo l’esperienza e gli strumenti necessari.',
  deliverables: [
    { title: 'Architettura e messaggi', text: 'Definiamo pagine, gerarchie, proposta di valore e percorsi in base a pubblico, offerta e obiettivi.' },
    { title: 'UX e design responsive', text: 'Interfacce sobrie, leggibili e veloci, progettate prima per gli schermi piccoli e poi estese al desktop.' },
    { title: 'Landing page di conversione', text: 'Pagine focalizzate su campagne, servizi o lead magnet con una sequenza persuasiva e misurabile.' },
    { title: 'Catalogo e checkout', text: 'Prodotti, varianti, pagamenti, ordini e comunicazioni essenziali configurati con un flusso semplice.' },
    { title: 'SEO tecnica e contenuti', text: 'Metadata, sitemap, schema, performance, pagine servizio e collegamenti interni vengono impostati fin dall’inizio.' },
    { title: 'Analytics e integrazioni', text: 'Eventi, form, CRM, social e campagne vengono collegati per leggere il percorso e non soltanto le visite.' },
  ],
  process: [
    { number: '01', title: 'Obiettivi', text: 'Pubblico, offerta, conversioni e requisiti commerciali.' },
    { number: '02', title: 'Prototipo', text: 'Architettura, contenuti, gerarchie e percorsi mobile-first.' },
    { number: '03', title: 'Sviluppo', text: 'Interfaccia, funzioni, integrazioni e controlli di qualità.' },
    { number: '04', title: 'Lancio', text: 'Analytics, indicizzazione, monitoraggio e miglioramenti.' },
  ],
  portfolio: [
    {
      name: 'SILKinCOM',
      type: 'E-commerce moda e luxury',
      text: 'Una maison digitale dedicata alla seta e al cashmere Made in Como, con racconto di marca, collezioni e vendita online.',
      href: 'https://www.silkincom.com/',
      image: '/portfolio/silkincom.webp',
      alt: 'Homepage dell’e-commerce SILKinCOM dedicato a seta e cashmere Made in Como',
    },
    {
      name: 'Studio Legale BCS',
      type: 'Sito istituzionale professionale',
      text: 'Un’esperienza autorevole e contemporanea che organizza competenze legali, aree di attività e contatto professionale.',
      href: 'https://studiodigitale.eu/index.html',
      image: '/portfolio/studio-digitale.webp',
      alt: 'Homepage del sito professionale Studio Legale BCS',
    },
    {
      name: 'Borsieri Car Service',
      type: 'Sito locale orientato ai contatti',
      text: 'Servizi, lavorazioni e prenotazioni emergono subito in un’interfaccia ad alto contrasto progettata per clienti locali.',
      href: 'https://borsiericarservice.netlify.app/',
      image: '/portfolio/borsieri-car-service.webp',
      alt: 'Homepage del sito Borsieri Car Service con servizi di carrozzeria e officina',
    },
  ],
  faq: [
    { q: 'Cosa comprende il prezzo da 19,90 € al mese?', a: 'È il canone tecnologico di partenza della soluzione web. Progettazione iniziale, configurazione, contenuti, catalogo e funzioni avanzate vengono definiti e quotati in base al progetto prima dell’avvio.' },
    { q: 'Dopo 12 mesi il sito diventa davvero mio?', a: 'Sì. Dopo 12 mesi di canone il sito diventa di tua proprietà. Eventuali costi ricorrenti di dominio, hosting, licenze o servizi esterni restano separati e vengono indicati prima dell’avvio.' },
    { q: 'Il sito sarà ottimizzato per smartphone?', a: 'Sì. La progettazione parte dal mobile e verifica leggibilità, navigazione, moduli, CTA, immagini e prestazioni prima di estendere il layout al desktop.' },
    { q: 'SEO e analytics sono inclusi?', a: 'La base tecnica comprende metadata, sitemap, struttura semantica e configurazione degli eventi concordati. Produzione continuativa di contenuti e attività SEO avanzate vengono definite separatamente.' },
    { q: 'Potete collegare il sito ai social e alle campagne?', a: 'Sì. Possiamo integrare landing, moduli, catalogo, tracciamenti e flussi utili a collegare campagne e contenuti alle azioni sul sito.' },
  ],
  related: [
    { href: '/servizi/gestione-social-media', label: 'Gestione social' },
    { href: '/servizi/seo-geo', label: 'SEO + GEO' },
    { href: '/pacchetti', label: 'Pacchetti e soluzioni' },
  ],
} satisfies MarketingDetailConfig

export default function SitiEcommercePage() { return <MarketingDetailPage config={config} /> }
