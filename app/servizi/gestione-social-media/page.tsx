import type { Metadata } from 'next'
import { Megaphone } from 'lucide-react'
import MarketingDetailPage, { type MarketingDetailConfig } from '@/components/MarketingDetailPage'
import { SITE_URL } from '@/lib/site-config'

const title = 'Gestione Social Media per PMI su 2 Canali | SWA'
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
    { q: 'Quanti social sono inclusi nella gestione?', a: 'Entrambi i piani coprono 2 canali social coordinati da un calendario solo. Cambia il volume: Presenza produce 16 contenuti al mese per ciascun canale, cioè fino a 32 uscite, mentre Crescita ne produce 24 per canale, fino a 48 uscite, più un articolo SEO + GEO. I canali si scelgono in base al pubblico e alla capacità di produrre materiale utile, non per essere presenti ovunque: due canali curati battono quattro abbandonati.' },
    { q: 'Quanto costa la gestione social al mese?', a: 'Presenza costa 490 € al mese e Crescita 990 € al mese, IVA esclusa, con il setup compreso in entrambi. La differenza sono i volumi e la direzione creativa mensile: Crescita aggiunge un articolo, l’analisi dei concorrenti, il report avanzato e una call strategica di 45 minuti invece di 30. Non ci sono costi di attivazione nascosti, e il rinnovo è mensile.' },
    { q: 'Devo preparare io i contenuti?', a: 'No. Piano editoriale, copy, grafiche, caroselli e video brevi li produciamo noi secondo il pacchetto attivo. A te serve fornire le informazioni vere — servizi, prezzi, materiali, approvazioni — e guardare i contenuti prima che escano. Se hai già foto o video li usiamo; se non li hai, le riprese in azienda sono un servizio a parte che si somma al piano.' },
    { q: 'I contenuti vengono pubblicati automaticamente?', a: 'No, mai. Ogni contenuto passa da un’approvazione prima di raggiungere un canale, e approvare non è pubblicare: l’invio è un secondo comando, esplicito. Vedi il contenuto nel formato reale del canale, con la sua data, e puoi chiedere le revisioni previste dal piano. Otto passaggi della nostra catena si fermano finché una persona non decide.' },
    { q: 'Quante revisioni sono comprese?', a: 'Il piano Presenza comprende 2 revisioni per contenuto, e Crescita le eredita insieme a tutto il resto. Le revisioni si chiedono dal portale, dove ogni richiesta resta tracciata con la sua data: non si perdono in una catena di email. Oltre quel numero le modifiche si concordano, e nessuna lavorazione fuori piano genera un costo senza il tuo via libera.' },
    { q: 'La gestione di commenti e messaggi è inclusa?', a: 'No, non nei due piani a listino. Il presidio operativo di commenti e messaggi diretti richiede tempi di risposta e responsabilità che vanno concordati, quindi rientra nella configurazione personalizzata. Nei piani standard restano la produzione, l’approvazione, la pubblicazione e il report: quello che esce è nostro, quello che arriva indietro resta tuo.' },
    { q: 'Le campagne a pagamento sono comprese?', a: 'No. Presenza e Crescita sono piani di sola crescita organica: nessun budget pubblicitario è incluso e nessuno viene speso a tuo nome. Le campagne rientrano nella configurazione personalizzata, dove la gestione si concorda e il budget versato alla piattaforma resta separato dal canone e sotto il tuo controllo, sul tuo account.' },
    { q: 'Che cosa resta mio se smetto?', a: 'Restano tuoi i contenuti prodotti, i materiali che hai fornito e gli account social, che sono sempre stati tuoi: non intestiamo profili a noi. Il rinnovo è mensile e la disdetta segue quanto scritto nei termini, senza vincoli di durata nascosti. Quello che compri è il lavoro, non uno strumento che ti tiene legato.' },
  ],
  related: [
    { href: '/servizi/seo-geo', label: 'SEO + GEO' },
    { href: '/servizi/siti-e-commerce', label: 'Siti ed e-commerce' },
    { href: '/pacchetti', label: 'Pacchetti mensili' },
  ],
} satisfies MarketingDetailConfig

export default function GestioneSocialMediaPage() { return <MarketingDetailPage config={config} /> }
