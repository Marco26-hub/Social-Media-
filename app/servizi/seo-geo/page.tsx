import type { Metadata } from 'next'
import { ScanSearch } from 'lucide-react'
import MarketingDetailPage, { type MarketingDetailConfig } from '@/components/MarketingDetailPage'
import { SITE_URL } from '@/lib/site-config'
import { PREZZI } from '@/lib/prezzi-ingresso'

const title = 'Consulenza SEO e GEO per PMI e Visibilità AI | SWA'
const description = 'Consulenza SEO e GEO per PMI: audit, strategia, architettura, dati strutturati ed entità. La produzione continuativa degli articoli è nel servizio Blog.'

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
    { title: 'Specifiche di ottimizzazione', text: 'Definiamo struttura, priorità e indicazioni operative per pagine e contenuti, con risposte dirette e fonti verificabili.' },
    { title: 'Schema e dati strutturati', text: 'Organizziamo Organization, Service, Article, FAQ e breadcrumb per descrivere correttamente le entità del sito.' },
    { title: 'Fonti, entità e segnali GEO', text: 'Rafforziamo identità, relazioni, attribuzione e passaggi citabili utili ai motori generativi.' },
    { title: 'Monitoraggio e priorità', text: 'Osserviamo copertura, query, pagine, menzioni e opportunità per definire il lavoro successivo.' },
  ],
  process: [
    { number: '01', title: 'Scansione', text: 'Tecnica, contenuti, query, entità e presenza del brand.' },
    { number: '02', title: 'Architettura', text: 'Una URL e una gerarchia chiare per ogni intento strategico.' },
    { number: '03', title: 'Ottimizzazione', text: 'Pagine strategiche, FAQ, collegamenti e dati strutturati.' },
    { number: '04', title: 'Misurazione', text: 'Copertura, traffico qualificato, conversioni e segnali AI.' },
  ],
  faq: [
    { q: 'Qual è la differenza tra SEO e GEO?', a: 'La SEO lavora sull’essere trovati dentro un elenco di risultati, la GEO sulla probabilità che i tuoi contenuti vengano compresi e citati da un sistema di risposta AI. Sono due lavori diversi sullo stesso materiale: la prima ottimizza pagine e struttura, la seconda misura quanto un blocco di testo risponde subito, sta in piedi da solo e porta un dato verificabile.' },
    { q: 'Come si misura la citabilità di un contenuto?', a: 'Con cinque criteri pesati, calcolati e non stimati a occhio: qualità della risposta 30%, autonomia del blocco 25%, struttura 20%, densità di dati 15%, unicità 10%. Ogni blocco torna con il suo punteggio e con le correzioni già scritte, non con un elenco di buoni consigli. È lo stesso metodo con cui misuriamo le nostre pagine prima di pubblicarle.' },
    { q: 'Potete garantire la prima posizione su Google?', a: 'No, e chi lo promette sta vendendo una cosa che non controlla. Nessun fornitore può garantire una posizione organica o una citazione da parte di un sistema AI, perché dipendono da algoritmi di terzi e dai concorrenti. Possiamo garantire il lavoro: audit, struttura, intenti, dati strutturati e priorità di miglioramento, con le verifiche che mostrano che cosa è cambiato.' },
    { q: 'Che cosa consegnate esattamente?', a: 'Un audit tecnico ed editoriale, la mappa degli intenti di ricerca con una pagina per intento, le specifiche di ottimizzazione, i dati strutturati e l’elenco delle priorità. Sono documenti operativi: dicono che cosa cambiare, in quale pagina e in che ordine, così il lavoro può farlo anche il tuo sviluppatore se preferisci.' },
    { q: 'Il servizio comprende i 12 articoli mensili?', a: `No, sono due servizi separati. SEO + GEO è il lavoro di audit, struttura, intenti e priorità, mentre la produzione continuativa di 12 articoli al mese è il servizio Blog SEO + GEO, che costa ${PREZZI.blog}. Si combinano bene — la strategia decide che cosa scrivere e il blog lo scrive — ma si attivano anche uno alla volta.` },
    { q: 'Serve un blog per lavorare su SEO e GEO?', a: 'Non sempre, ma aiuta molto. Le pagine commerciali coprono le ricerche di chi sta già valutando un acquisto, mentre le domande che le persone fanno prima — come funziona, quanto costa, che differenza c’è — hanno bisogno di contenuti dedicati. Senza quelli si compete solo sulle ricerche più affollate, che sono anche le più care.' },
    { q: 'Quanto tempo serve per vedere un cambiamento?', a: 'Dipende da stato tecnico, concorrenza e autorevolezza del dominio, e nessuna data seria si può promettere. Le correzioni tecniche hanno effetto in settimane, la copertura editoriale in mesi. Quello che si vede subito è il lavoro: le pagine corrette, i dati strutturati validi e i contenuti misurati, che sono verificabili il giorno stesso.' },
    { q: 'Il mio sito è leggibile dai sistemi AI?', a: 'Si verifica, e spesso la risposta è no. Controlliamo che i crawler dei sistemi di risposta siano ammessi nel robots.txt, che esista un file di sintesi per le AI, che i dati strutturati siano validi e che i contenuti rispondano nella prima frase. Sono controlli concreti: o ci sono o non ci sono, e si sistemano in poco tempo.' },
  ],
  related: [
    { href: '/blog', label: 'SWA Journal' },
    { href: '/servizi/siti-e-commerce', label: 'Siti ed e-commerce' },
    { href: '/metodo', label: 'Metodo operativo' },
  ],
  // La rubrica stava dentro una FAQ chiusa: e' il pezzo piu' originale della
  // pagina — cinque criteri pesati, calcolati — ed e' esattamente cio' che un
  // motore di risposta cita volentieri, perche' e' denso di dati e autonomo.
  tabella: {
    occhiello: 'Come misuriamo',
    h2: 'I cinque criteri con cui pesiamo la citabilità di un blocco',
    intro:
      'Non è una valutazione a occhio: ogni blocco di testo torna con un punteggio e con le correzioni già scritte. È lo stesso metodo con cui misuriamo le nostre pagine prima di pubblicarle.',
    caption: 'Rubrica di citabilità: peso di ciascun criterio e che cosa misura',
    colonne: ['Criterio', 'Peso', 'Che cosa misura'],
    righe: [
      ['Qualità della risposta', '30%', 'Se la prima frase risponde davvero alla domanda, invece di girarci intorno.'],
      ['Autonomia del blocco', '25%', 'Se il passaggio si capisce estratto dalla pagina, senza il contesto intorno.'],
      ['Struttura', '20%', 'Titoli, elenchi e tabelle che un motore possa leggere senza interpretare.'],
      ['Densità di dati', '15%', 'Quante quantità verificabili ci sono ogni cento parole.'],
      ['Unicità', '10%', 'Quanto il passaggio differisce da ciò che dicono già tutti gli altri.'],
    ],
  },
} satisfies MarketingDetailConfig

export default function SeoGeoPage() { return <MarketingDetailPage config={config} /> }
