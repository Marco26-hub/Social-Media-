import type { Metadata } from 'next'
import { Megaphone } from 'lucide-react'
import MarketingDetailPage, { type MarketingDetailConfig } from '@/components/MarketingDetailPage'
import { PACCHETTI } from '@/lib/pacchetti'
import { PREZZI } from '@/lib/prezzi-ingresso'
import { SITE_URL } from '@/lib/site-config'

const title = 'Gestione Social Media per PMI su 2 Canali | SWA'
const description = 'Servizio gestito di social media management per PMI: strategia, piano editoriale, testi, grafiche, Reel, approvazione, pubblicazione e report.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/servizi/gestione-social-media` },
  openGraph: { title, description, url: `${SITE_URL}/servizi/gestione-social-media` },
  twitter: { title, description },
}

const config = {
  path: '/servizi/gestione-social-media',
  eyebrow: 'Gestione social per PMI e professionisti',
  title: 'Chi pensa, scrive e pubblica i social al posto tuo.',
  lead: `La gestione social parte da ${PREZZI.presenza} e copre 2 profili, dal piano di quello che esce fino alla pubblicazione programmata. Tu leggi e dai il sì, il lavoro di produzione resta a noi.`,
  serviceName: 'Gestione social media',
  serviceType: 'Social media management per PMI e professionisti',
  promise: 'Un profilo che pubblica ogni settimana, senza assumere nessuno e senza toglierti ore di lavoro.',
  icon: Megaphone,
  // Il prezzo del pannello viene dal listino, non riscritto a mano: 490 e 990
  // sono gia' cambiati una volta e le copie a mano erano rimaste indietro.
  startingPrice: PACCHETTI[0].prezzo.replace(/[^\d.,]/g, ''),
  priceCadence: '/mese',
  signals: ['Setup compreso nel canone', '2 profili, un calendario solo', 'Report e call ogni mese'],
  outcomes: [
    { title: 'Cosa esce ogni settimana', text: 'Le uscite del piano Presenza sono 4 volte a settimana per profilo, in media: post, caroselli e Reel già scritti, montati e messi in calendario. Con Crescita diventano 6, e ogni mese arriva anche un articolo scritto per chi cerca su Google.' },
    { title: 'Come si riconosce il profilo', text: 'Il modo di scrivere e la linea grafica sono decisi una volta sola in avvio, sui 2 profili, e da lì restano uguali su ogni uscita. Chi scorre il telefono riconosce l’azienda prima ancora di leggere il nome sopra al post.' },
    { title: 'Cosa smetti di fare', text: 'Il tempo che recuperi è quello che oggi passi a inventare il post della sera, cercare la foto giusta e ricordarti di pubblicare su 2 profili. In 12 mesi sono 384 uscite del piano Presenza che non devi più pensare tu.' },
  ],
  deliverablesTitle: 'Dal primo audit all’ultimo post del mese.',
  deliverablesIntro: 'Il canone copre chi pensa, scrive, disegna e manda in uscita i contenuti. Restano fuori la pubblicità a pagamento, le risposte a commenti e messaggi e le riprese in sede: hanno un listino loro.',
  deliverables: [
    { title: 'Cosa guardiamo prima di partire', text: `L’audit di avvio è la lettura di offerta, pubblico e profili già attivi, ed è compreso nel canone da ${PREZZI.presenza}: sistemiamo immagini, descrizioni e contatti dei 2 canali. Con Crescita si guarda anche che cosa pubblicano i concorrenti.` },
    { title: 'Come nasce il calendario', text: 'Il piano editoriale è l’elenco di che cosa esce e quando, chiuso prima che il mese inizi: rubriche fisse, argomenti di stagione e date già assegnate sui 30 giorni successivi. Lo vedi tutto in anticipo, non la sera prima dell’uscita.' },
    { title: 'Chi scrive e chi disegna', text: `La produzione è scrittura e grafica insieme: 12 post o caroselli e 4 Reel per profilo ogni mese con Presenza, che salgono a 18 e 6 con Crescita, il piano da ${PREZZI.crescita}. Il montaggio dei video brevi è già compreso.` },
    { title: 'Come si adatta a ogni canale', text: 'L’adattamento è il passaggio in cui lo stesso contenuto cambia misura, taglio e testo per il canale su cui esce, perché sui 2 profili un carosello e un Reel non si guardano allo stesso modo. Lo stesso identico file non viene pubblicato 2 volte.' },
    { title: 'Quando si spinge un’offerta', text: 'La campagna organica è 1 blocco al mese in cui più contenuti portano avanti la stessa offerta o lo stesso servizio, su tutti e 2 i profili. Il budget verso le piattaforme è 0 €: si lavora solo con la pubblicazione normale.' },
    { title: 'Cosa dice il report', text: 'Il report è il riepilogo di fine mese di che cosa è uscito e come è andato, letto insieme in una call di 30 minuti con Presenza e di 45 con Crescita. Da lì si decide che cosa tenere e che cosa cambiare il mese dopo.' },
  ],
  process: [
    { number: '01', title: 'Cosa raccogliamo in avvio', text: 'L’avvio è la sessione in cui raccogliamo servizi, prezzi, foto, materiali e le frasi che non vuoi mai leggere sui tuoi 2 profili. Basta un incontro solo: il resto lo scriviamo noi e tu correggi tutto quello che non ti somiglia.' },
    { number: '02', title: 'Quando vedi il calendario', text: 'Il calendario del primo mese è pronto prima che il mese cominci, con date, formati e argomenti già assegnati ai 2 canali. Lo leggi con calma, togli quello che non ti convince, e solo dopo parte la produzione dei contenuti veri.' },
    { number: '03', title: 'Come si produce', text: 'La produzione è il blocco in cui si scrivono i testi, si disegnano le grafiche e si montano i video brevi dei 2 profili, tutto dentro il canone del piano attivo. Ogni pezzo arriva sul tuo pannello prima di uscire davvero.' },
    { number: '04', title: 'Quando esce e chi controlla', text: 'La pubblicazione è programmata sui 2 profili nei giorni e negli orari fissati nel piano, e parte solo dopo il tuo sì. Se un contenuto non esce per un problema tecnico ce ne accorgiamo noi e lo rimettiamo in coda.' },
  ],
  faq: [
    { q: 'Quanti social sono inclusi nella gestione?', a: 'Entrambi i piani coprono 2 canali social coordinati da un calendario solo. Cambia il volume: Presenza produce 16 contenuti al mese per ciascun canale, cioè fino a 32 uscite, mentre Crescita ne produce 24 per canale, fino a 48 uscite, più un articolo SEO + GEO. I canali si scelgono in base al pubblico e alla capacità di produrre materiale utile, non per essere presenti ovunque: due canali curati battono quattro abbandonati.' },
    { q: 'Quanto costa la gestione social al mese?', a: 'Presenza costa 490 € al mese e Crescita 990 € al mese, IVA esclusa, con il setup compreso in entrambi. La differenza sono i volumi e la direzione creativa mensile: Crescita aggiunge un articolo, l’analisi dei concorrenti, il report avanzato e una call strategica di 45 minuti invece di 30. Non ci sono costi di attivazione nascosti, e il rinnovo è mensile.' },
    { q: 'Devo preparare io i contenuti?', a: 'No. Piano editoriale, testi, grafiche, caroselli e video brevi li produciamo noi secondo il pacchetto attivo. A te serve fornire le informazioni vere — servizi, prezzi, materiali, approvazioni — e guardare i contenuti prima che escano. Se hai già foto o video li usiamo; se non li hai, le riprese in azienda sono un servizio a parte che si somma al piano.' },
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
  // Posizione nel percorso: il cliente deve vedere che i servizi sono una
  // sequenza, non un catalogo.
  passo: {
    n: 2,
    titolo: 'I contenuti',
    primaHref: '/servizi/siti-e-commerce',
    primaLabel: 'il sito',
    poiHref: '/servizi/segretaria-telefonica-ai',
    poiLabel: 'chi risponde al telefono',
  },
} satisfies MarketingDetailConfig

export default function GestioneSocialMediaPage() { return <MarketingDetailPage config={config} /> }
