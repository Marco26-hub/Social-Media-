import type { Metadata } from 'next'
import { Megaphone } from 'lucide-react'
import MarketingDetailPage, { type MarketingDetailConfig } from '@/components/MarketingDetailPage'
import { SITE_URL } from '@/lib/site-config'

const title = 'Gestione Social Media per PMI su 2 o 3 Canali | SWA'
const description = 'Servizio gestito di social media management per PMI: strategia, piano editoriale, copy, grafiche, Reel, approvazione, pubblicazione e report.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/servizi/gestione-social-media` },
  openGraph: { title, description, url: `${SITE_URL}/servizi/gestione-social-media` },
  twitter: { title, description },
}

const config = {
  path: '/servizi/gestione-social-media',
  eyebrow: 'Social media management per PMI',
  title: 'Gestione social media che trasforma il calendario in continuità commerciale.',
  lead: 'Coordiniamo strategia, produzione, approvazione e pubblicazione su 2 canali. La tua azienda mantiene il controllo; il lavoro operativo resta a Social Web Automation.',
  serviceName: 'Gestione social media',
  serviceType: 'Social media management per PMI e professionisti',
  promise: 'Una presenza riconoscibile ogni settimana, senza costruire un reparto interno.',
  icon: Megaphone,
  signals: ['2 social coordinati', 'Contenuti approvati prima della pubblicazione', 'Report e call strategica mensile'],
  outcomes: [
    { title: 'Continuità', text: 'Un calendario realistico e pubblicato con regolarità.' },
    { title: 'Coerenza', text: 'Messaggi e visual riconoscibili su ogni piattaforma.' },
    { title: 'Controllo', text: 'Revisioni, approvazioni e risultati in un unico flusso.' },
  ],
  deliverablesTitle: 'Dalla strategia al report, senza passaggi lasciati a metà.',
  deliverablesIntro: 'Il servizio copre l’intero ciclo editoriale. Quantità, canali e revisioni dipendono dal pacchetto scelto e sono dichiarati prima dell’avvio.',
  deliverables: [
    { title: 'Audit e posizionamento', text: 'Analizziamo offerta, pubblico, tono, profili esistenti e contenuti dei concorrenti per definire una direzione concreta.' },
    { title: 'Piano editoriale mensile', text: 'Rubriche, temi, obiettivi e formati vengono organizzati in un calendario sostenibile e leggibile.' },
    { title: 'Copy e produzione visual', text: 'Realizziamo testi, grafiche, caroselli e video brevi coerenti con identità e obiettivo di ogni contenuto.' },
    { title: 'Adattamento multicanale', text: 'Ogni contenuto viene adattato al linguaggio, alle dimensioni e alle dinamiche della piattaforma di destinazione.' },
    { title: 'Approvazione e revisioni', text: 'Controlli le proposte prima della pubblicazione e richiedi le revisioni previste dal piano.' },
    { title: 'Pubblicazione e report', text: 'Programmiamo i contenuti, leggiamo i dati utili e trasformiamo le evidenze in priorità per il mese successivo.' },
  ],
  process: [
    { number: '01', title: 'Analisi', text: 'Obiettivi, offerta, pubblico, canali e materiali disponibili.' },
    { number: '02', title: 'Direzione', text: 'Rubriche, calendario, formati e indicatori da osservare.' },
    { number: '03', title: 'Produzione', text: 'Copy, visual, adattamenti, approvazioni e revisioni.' },
    { number: '04', title: 'Pubblicazione', text: 'Programmazione, controllo, report e ottimizzazione.' },
  ],
  faq: [
    { q: 'Quanti social sono inclusi?', a: 'Il piano Presenza include 2 social coordinati; il piano Crescita ne include 3. I canali vengono scelti in base a pubblico, obiettivi e capacità di produrre materiali utili.' },
    { q: 'Devo preparare io i contenuti?', a: 'No. Social Web Automation gestisce piano editoriale, copy e produzione prevista dal pacchetto. La collaborazione del cliente serve per informazioni, materiali originali e approvazioni.' },
    { q: 'I contenuti vengono pubblicati automaticamente?', a: 'La programmazione avviene solo dopo il flusso di controllo concordato. Il cliente può approvare e richiedere le revisioni incluse prima della pubblicazione.' },
    { q: 'La gestione dei messaggi è inclusa?', a: 'Il monitoraggio operativo di commenti e messaggi può essere inserito in una configurazione personalizzata. Nei piani standard il perimetro principale è produzione, approvazione, pubblicazione e report.' },
  ],
  related: [
    { href: '/servizi/seo-geo', label: 'SEO + GEO' },
    { href: '/servizi/siti-e-commerce', label: 'Siti ed e-commerce' },
    { href: '/pacchetti', label: 'Pacchetti mensili' },
  ],
} satisfies MarketingDetailConfig

export default function GestioneSocialMediaPage() { return <MarketingDetailPage config={config} /> }
