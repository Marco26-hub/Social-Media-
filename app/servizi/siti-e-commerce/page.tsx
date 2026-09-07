import type { Metadata } from 'next'
import { Globe2 } from 'lucide-react'
import MarketingDetailPage, { type MarketingDetailConfig } from '@/components/MarketingDetailPage'
import { SITE_URL } from '@/lib/site-config'

const title = 'Siti Web per PMI a partire da 19,90 €/mese | SWA'
const description = 'Landing page e siti web mobile-first a partire da 19,90 €/mese. E-commerce e funzioni avanzate vengono quotati a parte. Dopo 12 mesi il sito è tuo.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/servizi/siti-e-commerce` },
  openGraph: { title, description, url: `${SITE_URL}/servizi/siti-e-commerce` },
  twitter: { title, description },
}

const config = {
  path: '/servizi/siti-e-commerce',
  eyebrow: 'Web design e presenza digitale',
  title: 'Siti web che accompagnano dalla scoperta all’azione.',
  lead: 'Progettiamo esperienze mobile-first collegate a contenuti, social e campagne. Ogni pagina ha un compito preciso: spiegare, rassicurare, raccogliere un contatto o preparare una vendita.',
  serviceName: 'Siti web',
  serviceType: 'Progettazione e sviluppo di landing page, siti aziendali ed e-commerce su preventivo',
  promise: 'Un punto di arrivo credibile per trasformare attenzione e traffico in opportunità.',
  startingPrice: '19.90',
  offerHighlight: 'Dopo 12 mesi di canone, il sito è tuo.',
  priceNote: 'Il canone a partire da 19,90 €/mese riguarda una landing page semplice o un sito web base. Siti multi-pagina, e-commerce, contenuti, dominio, integrazioni e funzioni avanzate vengono quotati prima dell’avvio.',
  primaryCtaLabel: 'Attiva Sito Web',
  primaryCtaHref: '/acquista?servizio=web-commerce',
  icon: Globe2,
  signals: ['Landing a partire da €19,90 al mese', 'Proprietà del sito dopo 12 mesi', 'Esperienza mobile-first'],
  outcomes: [
    { title: 'Chiarezza', text: 'Proposta di valore e percorsi comprensibili in pochi passaggi.' },
    { title: 'Conversione', text: 'CTA, moduli e contenuti costruiti per trasformare una visita in richiesta.' },
    { title: 'Integrazione', text: 'Social, campagne, analytics e contenuti lavorano nello stesso sistema.' },
  ],
  deliverablesTitle: 'Strategia, interfaccia e misurazione nello stesso progetto.',
  deliverablesIntro: 'Non partiamo da un tema grafico. Definiamo prima obiettivi, informazioni e azioni attese, poi costruiamo l’esperienza e gli strumenti necessari.',
  deliverables: [
    { title: 'Architettura e messaggi', text: 'Definiamo pagine, gerarchie, proposta di valore e percorsi in base a pubblico, offerta e obiettivi.' },
    { title: 'UX e design responsive', text: 'Interfacce sobrie, leggibili e veloci, progettate prima per gli schermi piccoli e poi estese al desktop.' },
    { title: 'Landing page di conversione', text: 'Pagine focalizzate su campagne, servizi o lead magnet con una sequenza persuasiva e misurabile.' },
    { title: 'E-commerce su preventivo', text: 'Catalogo, varianti, pagamenti, ordini e comunicazioni vengono progettati e quotati come progetto separato.' },
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
    { q: 'Cosa comprende il canone a partire da 19,90 € al mese?', a: 'È il canone tecnologico di partenza per una landing page semplice o un sito web base, IVA esclusa, e comprende hosting, manutenzione del progetto base, design responsive e SEO tecnica essenziale. Siti multi-pagina, e-commerce, contenuti, cataloghi, dominio e funzioni avanzate vengono definiti e quotati prima dell’avvio, mai addebitati dopo.' },
    { q: '19,90 € al mese comprende anche un e-commerce?', a: 'No, e vale la pena dirlo chiaramente: quella cifra riguarda il solo sito web e corrisponde a una landing semplice. Un negozio online ha catalogo, pagamenti, gestione degli ordini e resi, quindi è un progetto a sé che quotiamo dopo aver visto quanti prodotti hai e come vuoi gestirli.' },
    { q: 'Dopo 12 mesi il sito diventa davvero mio?', a: 'Sì. Dopo 12 mesi di canone la proprietà del sito passa a te: è scritto nell’offerta, non è una formula pubblicitaria. Restano separati i costi ricorrenti che non dipendono da noi — dominio, licenze, servizi esterni — che sono indicati prima dell’avvio e continuano a esistere qualunque fornitore tu scelga dopo.' },
    { q: 'Il sito sarà veloce e leggibile da telefono?', a: 'Sì, e la progettazione parte proprio dallo schermo piccolo, perché è da lì che arriva il traffico di social e campagne. Verifichiamo leggibilità, dimensione dei tocchi, moduli, pulsanti e peso delle immagini sul telefono prima che sul desktop: una pagina che si apre lenta al semaforo non converte, per quanto sia bella.' },
    { q: 'SEO e statistiche sono comprese nel canone base?', a: 'Nel canone base ci sono la SEO tecnica essenziale e il collegamento a moduli, statistiche e contenuti. Audit, mappa degli intenti, dati strutturati avanzati e produzione di articoli sono lavori a sé, che stanno nei servizi SEO + GEO e Blog. Lo diciamo prima perché elencare cinque voci tecniche accanto a un prezzo basso è il modo più veloce per deludere.' },
    { q: 'Potete collegare il sito a social e campagne?', a: 'Sì, e nel canone base rientrano moduli, statistiche di percorso e contenuti. Collegamenti a CRM, piattaforme pubblicitarie o gestionali sono integrazioni che quotiamo sul progetto, dopo aver visto quali interfacce mettono a disposizione: promettere un collegamento senza averlo verificato è il modo migliore per farlo saltare in produzione.' },
    { q: 'Quanto tempo serve per mettere online un sito?', a: 'Dipende quasi solo da una cosa: quanto in fretta arrivano testi, immagini e decisioni. Una landing semplice si fa in pochi giorni lavorativi una volta che il materiale c’è; un sito multi-pagina richiede più giri di approvazione. La data la fissiamo insieme all’inizio, insieme a chi deve consegnare cosa.' },
    { q: 'Serve un dominio nuovo o posso usare il mio?', a: 'Puoi usare il tuo, ed è la scelta che consigliamo: il dominio è un bene tuo e conserva la storia che hai già costruito sui motori. Se non ne hai uno lo registri tu a tuo nome, con il nostro affiancamento. Il costo del dominio resta separato dal canone e continua a essere tuo anche se un giorno cambi fornitore.' },
  ],
  related: [
    { href: '/servizi/gestione-social-media', label: 'Gestione social' },
    { href: '/servizi/seo-geo', label: 'SEO + GEO' },
    { href: '/pacchetti', label: 'Pacchetti e soluzioni' },
  ],
} satisfies MarketingDetailConfig

export default function SitiEcommercePage() { return <MarketingDetailPage config={config} /> }
