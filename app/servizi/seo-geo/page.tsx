import type { Metadata } from 'next'
import { ScanSearch } from 'lucide-react'
import MarketingDetailPage, { type MarketingDetailConfig } from '@/components/MarketingDetailPage'
import { SITE_URL } from '@/lib/site-config'

const title = 'Consulenza SEO e GEO per PMI e Visibilità AI | SWA'
const description = 'SEO e GEO per PMI: audit, architettura dei contenuti, articoli, FAQ, dati strutturati, entità e segnali utili a motori di ricerca e sistemi AI.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/servizi/seo-geo` },
  openGraph: { title, description, url: `${SITE_URL}/servizi/seo-geo` },
  twitter: { title, description },
}

const config = {
  path: '/servizi/seo-geo',
  eyebrow: 'SEO e Generative Engine Optimization',
  title: 'Visibilità organica per motori di ricerca e sistemi di risposta AI.',
  lead: 'Rendiamo azienda, servizi e competenze più facili da trovare, interpretare e citare. Lavoriamo su struttura tecnica, contenuti, entità, fonti e dati strutturati senza promettere ranking impossibili.',
  serviceName: 'SEO e GEO',
  serviceType: 'Ottimizzazione SEO e Generative Engine Optimization',
  promise: 'Contenuti chiari per le persone, leggibili per Google e utilizzabili dai sistemi AI.',
  icon: ScanSearch,
  signals: ['Intenti di ricerca definiti', 'Entità e fonti riconoscibili', 'Misurazione senza promesse di posizione'],
  outcomes: [
    { title: 'Comprensione', text: 'Servizi e competenze descritti con struttura inequivocabile.' },
    { title: 'Reperibilità', text: 'Pagine collegate a query e bisogni reali del pubblico.' },
    { title: 'Citabilità', text: 'Blocchi informativi, FAQ e fonti più facili da utilizzare.' },
  ],
  deliverablesTitle: 'Una base tecnica ed editoriale costruita per durare.',
  deliverablesIntro: 'SEO e GEO condividono qualità, struttura e autorevolezza, ma misurano superfici diverse. Il lavoro coordina entrambe senza confonderle.',
  deliverables: [
    { title: 'Audit tecnico ed editoriale', text: 'Verifichiamo indicizzazione, metadati, gerarchie, performance, contenuti esistenti e ostacoli alla comprensione.' },
    { title: 'Mappa degli intenti', text: 'Associamo bisogni e query a pagine precise, evitando che più URL competano per lo stesso argomento.' },
    { title: 'Pagine e articoli autorevoli', text: 'Creiamo contenuti completi, leggibili e orientati a una decisione, con risposte dirette e approfondimenti verificabili.' },
    { title: 'Schema e dati strutturati', text: 'Organizziamo Organization, Service, Article, FAQ e breadcrumb per descrivere correttamente le entità del sito.' },
    { title: 'Fonti, entità e segnali GEO', text: 'Rafforziamo identità, relazioni, attribuzione e passaggi citabili utili ai motori generativi.' },
    { title: 'Monitoraggio e priorità', text: 'Osserviamo copertura, query, pagine, menzioni e opportunità per definire il lavoro successivo.' },
  ],
  process: [
    { number: '01', title: 'Scansione', text: 'Tecnica, contenuti, query, entità e presenza del brand.' },
    { number: '02', title: 'Architettura', text: 'Una URL e una gerarchia chiare per ogni intento strategico.' },
    { number: '03', title: 'Produzione', text: 'Pagine, articoli, FAQ, collegamenti e dati strutturati.' },
    { number: '04', title: 'Misurazione', text: 'Copertura, traffico qualificato, conversioni e segnali AI.' },
  ],
  faq: [
    { q: 'Qual è la differenza tra SEO e GEO?', a: 'La SEO migliora comprensione e visibilità nei motori di ricerca. La GEO lavora anche sulla possibilità che contenuti ed entità siano utilizzati nei sistemi di risposta generativa. Condividono molte fondamenta, ma non sono la stessa metrica.' },
    { q: 'Potete garantire la prima posizione su Google?', a: 'No. Nessun fornitore serio può garantire una posizione organica o una citazione AI. Possiamo migliorare struttura, qualità, autorevolezza e misurazione con un piano verificabile.' },
    { q: 'Serve un blog per fare SEO e GEO?', a: 'Non sempre, ma un Journal editoriale consente di coprire domande e intenti che le pagine commerciali non possono approfondire. Deve essere collegato ai servizi e mantenuto con continuità.' },
    { q: 'Quanto tempo serve per vedere risultati?', a: 'Dipende da stato tecnico, concorrenza, autorevolezza e frequenza di pubblicazione. Le correzioni tecniche possono essere recepite rapidamente; la crescita organica richiede normalmente osservazione su più mesi.' },
  ],
  related: [
    { href: '/blog', label: 'SWA Journal' },
    { href: '/servizi/siti-e-commerce', label: 'Siti ed e-commerce' },
    { href: '/metodo', label: 'Metodo operativo' },
  ],
} satisfies MarketingDetailConfig

export default function SeoGeoPage() { return <MarketingDetailPage config={config} /> }
