import type { Metadata } from 'next'
import { PhoneCall } from 'lucide-react'
import MarketingDetailPage, { type MarketingDetailConfig } from '@/components/MarketingDetailPage'
import { SITE_URL } from '@/lib/site-config'

const path = '/servizi/segretaria-ai'
const title = 'Segretaria telefonica AI e agenda intelligente | SWA'
const description = 'Risponde al telefono, fissa appuntamenti e prepara i messaggi WhatsApp per recuperare i clienti. Ogni messaggio viene approvato prima dell’invio.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: { title, description, url: `${SITE_URL}${path}` },
  twitter: { title, description },
}

const config = {
  path,
  eyebrow: 'Segretaria telefonica e agenda',
  title: 'Risponde al telefono. Fissa appuntamenti. Riempie l’agenda.',
  lead: 'Un’assistente per le attività che lavorano su appuntamento. Risponde alle chiamate quando tu non puoi, prenota negli orari realmente liberi e prepara i messaggi per recuperare chi non torna da tempo. Le decisioni restano tue: i messaggi partono solo dopo la tua approvazione.',
  serviceName: 'Segretaria telefonica AI',
  serviceType: 'Assistente telefonica e gestione agenda per attività su appuntamento',
  promise: 'Meno chiamate perse e meno orari vuoti, dentro un processo in cui ogni messaggio resta approvato da una persona. Nessuna promessa sul numero di appuntamenti recuperati.',
  startingPrice: '390',
  priceNote: 'Canone mensile IVA esclusa, dopo una configurazione iniziale di 790 €. Importazione dati, impostazione delle regole e affiancamento sono compresi nell’avvio.',
  offerHighlight: 'Due servizi, anche nello stesso piano',
  primaryCtaLabel: 'Prenota una demo',
  primaryCtaHref: '/contatti',
  icon: PhoneCall,
  signals: ['Risponde anche fuori orario', 'Informazioni e regole le imposti tu', 'Messaggi approvati prima dell’invio'],
  outcomes: [
    { title: 'Continuità', text: 'Chi chiama riceve una risposta anche quando lo studio è occupato o chiuso.' },
    { title: 'Agenda', text: 'Gli orari rimasti liberi vengono segnalati insieme alle persone adatte a coprirli.' },
    { title: 'Controllo', text: 'Ogni messaggio in uscita passa da te: nessun invio automatico alle spalle dell’attività.' },
  ],
  deliverablesTitle: 'Due servizi che puoi usare separati o collegati.',
  deliverablesIntro: 'Puoi attivare soltanto la segretaria telefonica, soltanto il recupero clienti, oppure collegarli e gestire tutto da un unico pannello. Il servizio non sostituisce il personale: gestisce le richieste ripetitive e passa a una persona quelle delicate.',
  deliverables: [
    { title: 'Risposta telefonica', text: 'Accoglie chi chiama e spiega servizi, prezzi e orari usando soltanto le informazioni approvate dall’attività, in italiano e in inglese.' },
    { title: 'Gestione appuntamenti', text: 'Controlla gli orari disponibili, raccoglie i dati e fissa, sposta o annulla la prenotazione dopo la conferma del cliente.' },
    { title: 'Recupero clienti', text: 'Individua chi non torna da tempo, i percorsi interrotti e le persone adatte a un orario rimasto libero.' },
    { title: 'Messaggi da approvare', text: 'Prepara messaggi WhatsApp personali con priorità e valore stimato. Tu controlli e decidi quali inviare.' },
    { title: 'Consenso e opt-out', text: 'I contatti vengono trattati con consenso documentato e possibilità di esclusione, registrata nel sistema.' },
    { title: 'Tracciamento', text: 'Consegna, risposta e appuntamento recuperato restano visibili, insieme allo storico delle conversazioni.' },
  ],
  process: [
    { number: '01', title: 'Colleghiamo i dati', text: 'Importiamo clienti e agenda dal file o dal gestionale già in uso.' },
    { number: '02', title: 'Impostiamo le regole', text: 'Servizi, prezzi, orari, durata degli slot e tono delle risposte li definisci tu.' },
    { number: '03', title: 'Tu approvi', text: 'Ogni mattina trovi poche azioni chiare, con i messaggi già pronti da controllare.' },
    { number: '04', title: 'Misuriamo', text: 'Risposte, appuntamenti recuperati e orari riempiti restano tracciati e verificabili.' },
  ],
  faq: [
    { q: 'Sostituisce la mia segretaria?', a: 'No. Gestisce le richieste ripetitive e le chiamate che altrimenti andrebbero perse. Le richieste delicate o non previste vengono passate a una persona, e le decisioni restano dello studio.' },
    { q: 'I messaggi partono da soli?', a: 'No. Il sistema prepara le bozze e le mette in coda: nessun messaggio raggiunge un cliente senza la tua approvazione esplicita.' },
    { q: 'Per quali attività è pensata?', a: 'Per chi lavora su appuntamento: centri estetici, cliniche estetiche e di longevità, parrucchieri e barberie, studi dentistici, fisioterapia e osteopatia, oltre ad altri servizi locali su prenotazione.' },
    { q: 'Garantite un numero di appuntamenti recuperati?', a: 'No. Il servizio individua le occasioni e prepara il lavoro da fare; il risultato dipende anche da offerta, stagionalità e rapporto con i clienti. I numeri mostrati nelle schermate dimostrative non sono risultati promessi.' },
  ],
  related: [
    { href: '/servizi/automazione-gestionali', label: 'Automazione e gestionali' },
    { href: '/servizi/gestione-social-media', label: 'Gestione social' },
    { href: '/servizi/siti-e-commerce', label: 'Siti ed e-commerce' },
  ],
} satisfies MarketingDetailConfig

export default function SegretariaAiPage() { return <MarketingDetailPage config={config} /> }
