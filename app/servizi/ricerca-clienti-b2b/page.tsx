import type { Metadata } from 'next'
import { Target } from 'lucide-react'
import MarketingDetailPage, { type MarketingDetailConfig } from '@/components/MarketingDetailPage'
import { SITE_URL } from '@/lib/site-config'

const path = '/servizi/ricerca-clienti-b2b'
const title = 'Ricerca Clienti B2B e qualificazione aziende | SWA'
const description = 'Pilot di ricerca clienti B2B: definiamo il profilo ideale, analizziamo fino a 30 aziende e consegniamo una lista verificata e prioritaria.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: { title, description, url: `${SITE_URL}${path}` },
  twitter: { title, description },
}

const config = {
  path,
  eyebrow: 'Ricerca commerciale assistita',
  title: 'Aziende in target, fonti verificabili e priorità chiare.',
  lead: 'Partiamo dal tuo cliente ideale e costruiamo un primo elenco qualificato di aziende coerenti. Ogni voce viene controllata su fonti pubbliche e accompagnata dal motivo per cui merita attenzione.',
  serviceName: 'Ricerca Clienti B2B',
  serviceType: 'Ricerca e qualificazione di aziende B2B',
  promise: 'Una base commerciale più ordinata per decidere chi approfondire, senza invii automatici e senza promesse di clienti garantiti.',
  startingPrice: '149',
  priceNote: 'Pilot una tantum, IVA esclusa. Il motore di ricerca proprietario opera su un’infrastruttura separata; SWA gestisce perimetro, verifica e consegna.',
  offerHighlight: 'Fino a 30 aziende analizzate',
  primaryCtaLabel: 'Attiva il Pilot B2B',
  primaryCtaHref: '/acquista?servizio=lead-pilot',
  icon: Target,
  signals: ['Profilo cliente ideale concordato', 'Fonti pubbliche tracciabili', 'Priorità motivata per ogni azienda'],
  outcomes: [
    { title: 'Focus', text: 'Mercato, dimensione e segnali utili vengono definiti prima della ricerca.' },
    { title: 'Verifica', text: 'Le aziende sono accompagnate da fonti consultabili, non da dati inventati.' },
    { title: 'Priorità', text: 'La lista distingue i profili più coerenti da quelli da approfondire in seguito.' },
  ],
  deliverablesTitle: 'Un pilot concreto, con un perimetro leggibile.',
  deliverablesIntro: 'Il servizio riguarda ricerca e qualificazione. Non comprende campagne outbound automatiche, invii email o garanzie di appuntamenti e vendite.',
  deliverables: [
    { title: 'Profilo cliente ideale', text: 'Settore, geografia, dimensione, esclusioni e segnali commerciali vengono concordati prima dell’avvio.' },
    { title: 'Ricerca aziende', text: 'Analizziamo fino a 30 organizzazioni coerenti con il perimetro definito.' },
    { title: 'Fonti verificabili', text: 'Sito ufficiale e altre fonti pubbliche pertinenti vengono riportati per consentire il controllo.' },
    { title: 'Qualificazione', text: 'Ogni azienda riceve una motivazione sintetica e una priorità operativa.' },
    { title: 'Pulizia dei risultati', text: 'Rimuoviamo duplicati, profili fuori target e dati non sufficientemente attendibili.' },
    { title: 'Consegna strutturata', text: 'Ricevi una lista utilizzabile per la successiva valutazione commerciale e per il CRM.' },
  ],
  process: [
    { number: '01', title: 'Brief', text: 'Offerta, cliente ideale, mercati e criteri di esclusione.' },
    { number: '02', title: 'Ricerca', text: 'Il motore separato individua candidati e relative fonti pubbliche.' },
    { number: '03', title: 'Verifica', text: 'Controlliamo coerenza, duplicati e qualità delle informazioni.' },
    { number: '04', title: 'Consegna', text: 'Lista prioritaria, fonti e motivazioni pronte per il lavoro commerciale.' },
  ],
  faq: [
    { q: 'Quanti contatti sono inclusi?', a: 'Il pilot comprende la ricerca e qualificazione di un massimo di 30 aziende. Il numero effettivo dipende dalla disponibilità di profili che rispettano davvero i criteri concordati.' },
    { q: 'Inviate automaticamente email ai prospect?', a: 'No. Il pilot non comprende invii automatici o campagne cold email. Consegna ricerca e qualificazione; qualsiasi attività di contatto richiede un perimetro separato e una valutazione della base giuridica applicabile.' },
    { q: 'Garantite appuntamenti o nuovi clienti?', a: 'No. Garantiamo il lavoro di ricerca nel perimetro concordato, non risposte, appuntamenti o vendite, che dipendono anche da offerta, messaggio e processo commerciale.' },
    { q: 'La ricerca può riguardare mercati esteri?', a: 'Sì. Il perimetro geografico viene definito nel brief e può includere Italia o mercati internazionali, compatibilmente con fonti e criteri disponibili.' },
  ],
  related: [
    { href: '/servizi/gestione-social-media', label: 'Gestione social' },
    { href: '/servizi/seo-geo', label: 'SEO + GEO' },
    { href: '/servizi/siti-e-commerce', label: 'Siti ed e-commerce' },
  ],
} satisfies MarketingDetailConfig

export default function RicercaClientiPage() { return <MarketingDetailPage config={config} /> }
