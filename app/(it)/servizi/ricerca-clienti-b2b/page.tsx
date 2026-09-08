import type { Metadata } from 'next'
import { Target } from 'lucide-react'
import MarketingDetailPage, { type MarketingDetailConfig } from '@/components/MarketingDetailPage'
import { SITE_URL } from '@/lib/site-config'
import { STANDALONE_SERVICES } from '@/lib/standalone-services'

const LEAD_PILOT = STANDALONE_SERVICES.find(s => s.slug === 'lead-pilot')!

const path = '/servizi/ricerca-clienti-b2b'
const title = 'Ricerca Clienti B2B e qualificazione aziende | SWA'
const description = 'Ricerca clienti B2B: definiamo il cliente ideale e consegniamo fino a 30 aziende verificate su fonti pubbliche, con motivo e priorità. 149 € una tantum.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: { title, description, url: `${SITE_URL}${path}` , images: ['/og.png'], type: 'website',},
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
  startingPrice: LEAD_PILOT.displayPrice.replace('€', ''),
  priceCadence: ` ${LEAD_PILOT.cadenceLabel}`,
  priceLabel: 'Prezzo',
  priceNote: 'Pilot una tantum, IVA esclusa. Il motore di ricerca proprietario opera su un’infrastruttura separata; SWA gestisce criteri di ricerca, verifica e consegna.',
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
  deliverablesTitle: 'Un pilot concreto, con criteri leggibili.',
  deliverablesIntro: 'Il servizio riguarda ricerca e qualificazione. Non comprende campagne outbound automatiche, invii email o garanzie di appuntamenti e vendite.',
  deliverables: [
    { title: 'Profilo cliente ideale', text: 'Settore, geografia, dimensione, esclusioni e segnali commerciali vengono concordati prima dell’avvio.' },
    { title: 'Ricerca aziende', text: 'Analizziamo fino a 30 organizzazioni coerenti con il cliente ideale definito insieme.' },
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
    { q: 'Quante aziende comprende il servizio?', a: 'Il Pilot costa 149 € una tantum, IVA esclusa, e comprende la ricerca e la qualificazione di un massimo di 30 aziende coerenti con il tuo cliente ideale. Il numero effettivo dipende da quanto sono selettivi i criteri: meglio venti aziende davvero in target che trenta riempite per arrivare al numero.' },
    { q: 'Che cosa ricevo esattamente?', a: 'Ricevi un elenco in cui ogni azienda porta con sé la fonte pubblica da cui l’abbiamo presa, il motivo per cui è coerente con te e una priorità. Si controlla in un minuto: apri la fonte e verifichi. Non è un file di righe da fidarsi, è un elenco da mettere in discussione.' },
    { q: 'Sono compresi i contatti telefonici e le email?', a: 'No, e questa è la differenza più importante da capire prima di comprare. Il Pilot consegna azienda, fonte, motivo e priorità: un elenco qualificato da lavorare. Non comprende dati di contatto nominativi, e chi te li vende senza spiegare da dove vengono ti sta creando un problema con il GDPR, non risolvendone uno.' },
    { q: 'Inviate voi le email ai potenziali clienti?', a: 'No. Il servizio non comprende invii automatici né campagne a freddo: ricerca e contatto restano attività distinte, anche dal punto di vista normativo. L’elenco lo lavora la tua rete commerciale, che sa parlare del tuo prodotto meglio di qualsiasi sequenza automatica.' },
    { q: 'Garantite appuntamenti o nuovi clienti?', a: 'No, e non lo scriviamo da nessuna parte. Garantiamo il lavoro di ricerca e qualificazione concordato, non le risposte, non gli appuntamenti e non le vendite: quelle dipendono da come si contatta, da che cosa si offre e dal momento in cui si arriva.' },
    { q: 'Che differenza c’è con un database comprato?', a: 'Un database comprato risponde alla domanda sbagliata: contiene chi esiste, non chi ha senso per te, ed è stato venduto anche ai tuoi concorrenti. Qui ogni voce nasce dal profilo del tuo cliente ideale e porta la sua fonte, quindi puoi verificarla oggi invece di scoprirla vecchia fra sei mesi.' },
    { q: 'Come si definisce il cliente ideale?', a: 'Con un brief iniziale in cui fissiamo settore, area geografica, dimensione, criteri di esclusione e i segnali pubblici che rendono un’azienda interessante per te. È il passaggio che decide la qualità del risultato: criteri vaghi producono un elenco vago, e nessuna ricerca lo può salvare dopo.' },
    { q: 'Posso ripetere la ricerca su un altro mercato?', a: 'Sì. Il Pilot è pensato proprio per essere ripetuto su perimetri diversi: un’altra area geografica, un altro settore, un’altra dimensione d’azienda. Ogni ciclo parte dal brief e produce il suo elenco verificabile, così puoi provare un mercato prima di investirci una rete commerciale.' },
  ],
  related: [
    { href: '/servizi/gestione-social-media', label: 'Gestione social' },
    { href: '/servizi/seo-geo', label: 'SEO + GEO' },
    { href: '/servizi/siti-e-commerce', label: 'Siti ed e-commerce' },
  ],
} satisfies MarketingDetailConfig

export default function RicercaClientiPage() { return <MarketingDetailPage config={config} /> }
