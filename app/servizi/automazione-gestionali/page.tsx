import type { Metadata } from 'next'
import { Workflow } from 'lucide-react'
import MarketingDetailPage, { type MarketingDetailConfig } from '@/components/MarketingDetailPage'
import { SITE_URL } from '@/lib/site-config'

const path = '/servizi/automazione-gestionali'
const title = 'Automazione software e integrazione gestionali | SWA'
const description = 'Colleghiamo gestionale, CRM, e-commerce e analytics, togliamo i passaggi manuali che si ripetono e, quando serve, sviluppiamo lo strumento su misura.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: { title, description, url: `${SITE_URL}${path}` },
  twitter: { title, description },
}

const config = {
  path,
  eyebrow: 'Automazione e integrazioni',
  title: 'I sistemi che già usi, collegati e senza passaggi manuali.',
  lead: 'Gestionale, CRM, e-commerce, moduli e analytics spesso non si parlano, e il lavoro di raccordo resta alle persone. Colleghiamo quei sistemi e togliamo i passaggi che si ripetono ogni giorno. Quando lo strumento standard non basta, lo sviluppiamo su misura.',
  serviceName: 'Automazione software e gestionali',
  serviceType: 'Integrazione di sistemi gestionali e sviluppo software su misura',
  promise: 'Meno riscritture manuali degli stessi dati e un flusso tracciabile fra i sistemi. Il perimetro viene definito prima, e ogni lavorazione fuori piano è approvata prima di generare un costo.',
  priceNote: 'Servizio su misura: il preventivo dipende dai sistemi coinvolti e dal numero di flussi da automatizzare. Rientra nella configurazione personalizzata.',
  offerHighlight: 'Perimetro e costi definiti prima di partire',
  primaryCtaLabel: 'Descrivi il tuo caso',
  primaryCtaHref: '/contatti',
  icon: Workflow,
  signals: ['Analisi dei flussi prima del codice', 'Integrazioni su sistemi esistenti', 'Sviluppo su misura solo quando serve'],
  outcomes: [
    { title: 'Meno doppio lavoro', text: 'Gli stessi dati smettono di essere reinseriti a mano in due o tre sistemi diversi.' },
    { title: 'Tracciabilità', text: 'Ogni passaggio automatico lascia traccia, così un errore si trova invece di sparire.' },
    { title: 'Misura giusta', text: 'Prima si integra ciò che esiste. Si sviluppa da zero solo dove il software standard non arriva.' },
  ],
  deliverablesTitle: 'Dall’analisi dei flussi allo strumento che mancava.',
  deliverablesIntro: 'Il lavoro parte da come lavorate oggi, non da una piattaforma da adottare. Non sostituiamo il gestionale se il gestionale funziona: lo colleghiamo al resto.',
  deliverables: [
    { title: 'Analisi dei flussi', text: 'Mappiamo i passaggi manuali che si ripetono e quali sistemi custodiscono davvero il dato di riferimento.' },
    { title: 'Integrazioni', text: 'Colleghiamo gestionale, CRM, e-commerce, moduli e analytics attraverso le interfacce disponibili.' },
    { title: 'Automazione dei flussi', text: 'Le operazioni ricorrenti diventano automatiche, con registro delle esecuzioni e degli errori.' },
    { title: 'Sviluppo su misura', text: 'Quando lo strumento non esiste, lo costruiamo: la piattaforma con cui produciamo, approviamo e pubblichiamo i contenuti è sviluppata internamente.' },
    { title: 'Controllo umano', text: 'Le operazioni che incidono su clienti o pubblicazioni restano soggette a un’approvazione, non partono da sole.' },
    { title: 'Documentazione', text: 'Consegniamo cosa è stato collegato, come si interviene e cosa succede quando un sistema non risponde.' },
  ],
  process: [
    { number: '01', title: 'Mappa', text: 'Sistemi in uso, dati che si duplicano e passaggi manuali ricorrenti.' },
    { number: '02', title: 'Perimetro', text: 'Cosa automatizzare per primo, con costi e responsabilità definiti prima di partire.' },
    { number: '03', title: 'Realizzazione', text: 'Integrazione o sviluppo, con verifica su casi reali prima dell’attivazione.' },
    { number: '04', title: 'Esercizio', text: 'Monitoraggio, correzioni e nuovi flussi solo dopo aver verificato i precedenti.' },
  ],
  faq: [
    { q: 'Dovete sostituire il mio gestionale?', a: 'No. Se il gestionale funziona resta dov’è: lo colleghiamo agli altri sistemi. La sostituzione è una scelta aziendale, non un requisito tecnico che imponiamo.' },
    { q: 'Serve che i sistemi abbiano delle API?', a: 'È la condizione più comoda, ma non l’unica. Dove non c’è un’interfaccia valutiamo esportazioni programmate o altri appigli disponibili, e lo diciamo prima se un collegamento non è realizzabile in modo affidabile.' },
    { q: 'Quanto costa?', a: 'Dipende dai sistemi coinvolti e dal numero di flussi. Definiamo perimetro e costo prima di iniziare, e ogni lavorazione aggiuntiva viene approvata prima di generare spesa.' },
    { q: 'Che cosa avete già costruito?', a: 'La piattaforma con cui gestiamo il lavoro dei clienti: generazione dei contenuti, approvazione umana, pubblicazione programmata sui social, verifica di ciò che è uscito davvero e conservazione dei dati.' },
  ],
  related: [
    { href: '/servizi/segretaria-ai', label: 'Segretaria telefonica AI' },
    { href: '/servizi/siti-e-commerce', label: 'Siti ed e-commerce' },
    { href: '/consulenza', label: 'Consulenza legale AI' },
  ],
} satisfies MarketingDetailConfig

export default function AutomazioneGestionaliPage() { return <MarketingDetailPage config={config} /> }
