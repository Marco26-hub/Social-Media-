import type { Metadata } from 'next'
import SegretariaLanding, { type ContenutoLanding } from '@/components/SegretariaLanding'
import { SEGRETARIA_LISTINO } from '@/lib/segretaria-listino'
import { SITE_URL } from '@/lib/site-config'

// Pagina del servizio VOCE. Risponde a chi cerca "segretaria telefonica AI",
// "centralino automatico", "chi risponde quando sono occupato": il problema e
// la chiamata persa. Il recupero clienti sta sulla pagina gemella, cosi le due
// non competono per la stessa ricerca.

const path = '/servizi/segretaria-telefonica-ai'
const title = 'Segretaria telefonica AI che risponde e prenota | SWA'
const description = 'Una segretaria telefonica AI che risponde quando non puoi: informa su servizi e orari, fissa gli appuntamenti e passa la chiamata a una persona. Da 199 € al mese.'

export const metadata: Metadata = {
  title,
  description,
  keywords: ['segretaria telefonica AI', 'centralino AI', 'risponditore automatico appuntamenti', 'assistente vocale AI', 'chiamate perse'],
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: { title, description, url: `${SITE_URL}${path}`, type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
}

const contenuto: ContenutoLanding = {
  path,
  briciola: 'Segretaria telefonica AI',
  occhiello: 'Segretaria telefonica AI',
  h1: 'Risponde al telefono anche quando tu non puoi.',
  lead: 'Chi chiama trova sempre una risposta: servizi, prezzi, orari e disponibilità, con le informazioni che hai approvato tu. Fissa, sposta e disdice gli appuntamenti, e quando la richiesta è delicata passa la chiamata a una persona.',
  descrizione: description,
  servizio: 'Segretaria telefonica AI',
  tipoServizio: 'Servizio di risposta telefonica automatica e gestione appuntamenti',
  waTesto: 'Ciao! Vorrei una call sulla Segretaria telefonica AI.',
  foto: '/segretaria-ai-hero.webp',
  consolePrima: 'Chiamata in corso',
  console: [
    ['In linea', 'Chiede il primo appuntamento', 'Legge gli orari liberi e propone'],
    ['Passaggio', 'Richiesta fuori dalle regole', 'Trasferisce a una persona'],
  ],
  consoleCta: 'Apri il registro chiamate',
  chiarezza: {
    occhiello: 'In parole semplici',
    h2: 'Il telefono non squilla più a vuoto.',
    intro: 'Una chiamata persa, in un’attività che lavora su appuntamento, è quasi sempre un appuntamento perso. Chi non trova risposta chiama il prossimo nome della lista.',
    voci: [
      ['Risponde sempre', 'Anche mentre sei con un cliente, anche fuori orario, anche nei giorni di chiusura.'],
      ['Dice solo cose vere', 'Servizi, prezzi e orari li scrivi tu nel pannello: l’assistente non inventa e non improvvisa.'],
      ['Sa quando fermarsi', 'Le richieste delicate o non previste vengono passate a una persona, non gestite a tentativi.'],
    ],
  },
  dichiarazione: {
    occhiello: 'Quando non puoi rispondere, risponde lei.',
    h2: 'Chi chiama riceve aiuto subito. Tu ritrovi la richiesta e l’appuntamento nel pannello.',
  },
  funzioni: {
    occhiello: 'Cosa fa davvero',
    h2: 'Gestisce le chiamate ripetitive, senza toglierti il controllo.',
    intro: 'Le domande che ricevi cento volte al mese — quanto costa, a che ora aprite, avete posto giovedì — non richiedono te. Tutto il resto sì, e infatti resta a te.',
    voci: [
      ['Accoglie chi chiama', 'Si presenta con il nome della tua attività, con la voce e la frase di apertura che hai scelto tu.'],
      ['Informa', 'Servizi, prezzi, orari e regole: soltanto quelli che hai approvato nel pannello.'],
      ['Prenota', 'Legge il calendario collegato, propone gli orari davvero liberi e salva solo dopo la conferma.'],
      ['Smista e inoltra', 'Capisce di che cosa si tratta e passa la chiamata alla persona giusta, secondo le regole che hai scritto.'],
      ['Trascrive tutto', 'Di ogni chiamata restano trascrizione e riepilogo: non devi più riascoltare la segreteria per capire chi ha chiamato.'],
      ['Chiude il giro', 'A telefonata finita registra l’esito e aggiorna dove serve, senza che qualcuno debba ricopiare a mano.'],
    ],
  },
  flusso: {
    occhiello: 'Il flusso completo',
    h2: 'Dalla telefonata all’appuntamento confermato.',
    passi: ['Riceve la chiamata', 'Capisce la richiesta', 'Controlla il calendario', 'Prenota o smista', 'Trascrive e registra'],
    chiusura: 'Ogni chiamata lascia traccia: che cosa è stato chiesto, che cosa è stato risposto e se l’appuntamento è stato fissato. Puoi rileggerlo quando vuoi.',
  },
  pannello: {
    occhiello: 'Una schermata, poche decisioni',
    h2: 'Apri. Controlla. Correggi.',
    testo: 'Dal telefono vedi le chiamate gestite, gli appuntamenti fissati e le richieste passate al personale. Se una risposta non ti convince, la cambi e da lì in poi vale la nuova.',
    vedi: ['Le chiamate gestite e il loro esito', 'Gli appuntamenti fissati', 'Le richieste passate a una persona', 'Le risposte da correggere'],
    righe: [
      ['Chiamata fuori orario gestita', 'Appuntamento proposto e confermato'],
      ['Richiesta non prevista', 'Trasferita al numero indicato'],
    ],
  },
  avvio: {
    occhiello: 'Come si parte',
    h2: 'Operativa in quattro passaggi.',
    passi: [
      ['Raccogliamo le informazioni', 'Servizi, prezzi, orari, regole e che cosa non deve mai dire.'],
      ['Colleghiamo agenda e numero', 'L’assistente legge le disponibilità vere e risponde sul tuo numero.'],
      ['Provi prima di attivare', 'Ascolti come risponde e correggi finché non ti convince.'],
      ['Va online', 'Da lì in avanti guardi gli esiti e correggi quando serve.'],
    ],
  },
  settori: {
    occhiello: 'Per chi lavora su appuntamento',
    h2: 'Utile ogni volta che una chiamata persa diventa lavoro perso.',
    voci: [
      ['Centri estetici', 'Chiamate durante i trattamenti, quando nessuno può rispondere.', '/settori/centri-estetici'],
      ['Cliniche estetiche', 'Prime informazioni, prenotazioni e controlli di percorso.', '/settori/cliniche-estetiche'],
      ['Parrucchieri e barberie', 'Il telefono che squilla mentre hai le mani occupate.', '/settori/parrucchieri'],
      ['Studi dentistici', 'Prenotazioni, spostamenti e disdette dell’ultimo minuto.', '/settori/studi-dentistici'],
      ['Fisioterapia e osteopatia', 'Sedute da fissare e richieste da passare allo studio.', '/settori/fisioterapia-osteopatia'],
      ['Officine e servizi locali', 'Preventivi, orari e disponibilità chiesti al telefono.', '/settori/officine-e-servizi-locali'],
    ],
  },
  citta: ['Milano', 'Roma', 'Torino', 'Bologna', 'Firenze', 'Napoli', 'Verona', 'Como'],
  listino: {
    occhiello: 'Listino',
    h2: 'Tre piani, in base a quanto squilla il telefono.',
    intro: 'La differenza sono i minuti compresi: si contano le conversazioni gestite, non le chiamate ricevute. Se non sai da dove partire, si comincia dal piano più piccolo e si sale senza rifare l’assistente.',
    famiglia: SEGRETARIA_LISTINO.find(f => f.id === 'voce')!,
  },
  faq: [
    ['Sostituisce la mia segretaria?', 'No. Gestisce le chiamate ripetitive e quelle che altrimenti andrebbero perse. Le richieste delicate o non previste vengono passate a una persona, e le decisioni restano dello studio.'],
    ['Come vengono contati i minuti?', 'Conta la durata registrata delle conversazioni gestite dall’assistente, non il numero di chiamate. Arrotondamenti e data di azzeramento mensile sono scritti nella proposta.'],
    ['Che piano scelgo se non conosco i miei minuti?', 'Durante la call stimiamo le chiamate mensili partendo dal traffico del numero attuale. Si può partire dal piano più piccolo e salire senza ricreare l’assistente.'],
    ['Il cliente capisce che è un’assistente?', 'Sì, e lo diciamo: l’assistente si presenta come tale. Nascondere che si parla con un sistema automatico non è una scelta che consigliamo, né dal punto di vista legale né da quello del rapporto con il cliente.'],
    ['Il numero di telefono è compreso?', 'No. Numero e traffico dell’operatore restano separati dal canone e vengono indicati nella proposta prima dell’attivazione.'],
    ['Posso ascoltare come risponde prima di attivarla?', 'Sì. Prima di collegare il numero prepariamo delle prove che puoi ascoltare e far correggere.'],
  ],
  gemella: {
    href: '/servizi/agenda-clienti-whatsapp',
    occhiello: 'L’altra metà del lavoro',
    h2: 'Il telefono è risolto. E l’agenda mezza vuota?',
    testo: 'Rispondere alle chiamate riempie i buchi solo di chi ti cerca. Chi non ti chiama più — percorsi lasciati a metà, clienti spariti da mesi — va ricontattato. Se ne occupa l’altro servizio, e i due si usano anche insieme.',
    cta: 'Vedi Agenda, clienti e WhatsApp',
  },
}

export default function Page() { return <SegretariaLanding c={contenuto} /> }
