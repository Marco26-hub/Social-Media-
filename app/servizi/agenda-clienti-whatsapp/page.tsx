import type { Metadata } from 'next'
import SegretariaLanding, { type ContenutoLanding } from '@/components/SegretariaLanding'
import { SEGRETARIA_LISTINO } from '@/lib/segretaria-listino'
import { SITE_URL } from '@/lib/site-config'

// Pagina del servizio AGENDA. Risponde a chi cerca «recuperare clienti persi»,
// «riempire l’agenda», «messaggi WhatsApp ai clienti»: il problema qui non e la
// chiamata persa ma il buco in agenda e il cliente che non torna. La parte
// telefonica sta sulla pagina gemella.

const path = '/servizi/agenda-clienti-whatsapp'
const title = 'Recuperare clienti e riempire l’agenda con WhatsApp | SWA'
const description = 'Trova chi non torna da tempo e gli orari rimasti liberi, prepara i messaggi WhatsApp e te li lascia da approvare. Nessun invio senza il tuo sì. 390 € al mese.'

export const metadata: Metadata = {
  title,
  description,
  keywords: ['recuperare clienti', 'riempire agenda', 'messaggi WhatsApp clienti', 'clienti che non tornano', 'richiami appuntamenti'],
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: { title, description, url: `${SITE_URL}${path}`, type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
}

const contenuto: ContenutoLanding = {
  path,
  briciola: 'Agenda, clienti e WhatsApp',
  occhiello: 'Agenda, clienti e WhatsApp',
  h1: 'I clienti che non tornano non sono persi. Sono solo da richiamare.',
  lead: 'Il sistema legge agenda e storico, trova chi manca da troppo tempo e chi potrebbe coprire l’orario rimasto libero venerdì. Prepara il messaggio già scritto e te lo lascia in bozza: parte solo dopo il tuo sì.',
  descrizione: description,
  servizio: 'Agenda, clienti e WhatsApp',
  tipoServizio: 'Servizio di recupero clienti e riempimento agenda con messaggi approvati',
  waTesto: 'Ciao! Vorrei una call su Agenda, clienti e WhatsApp.',
  foto: '/segretaria-ai-hero.webp',
  consolePrima: 'Occasioni di oggi',
  console: [
    ['Agenda', 'Orario libero venerdì alle 15:30', 'Propone i clienti adatti a coprirlo'],
    ['Recupero', 'Percorso interrotto tre mesi fa', 'Messaggio pronto, in attesa del tuo sì'],
  ],
  consoleCta: 'Controlla i messaggi pronti',
  chiarezza: {
    occhiello: 'In parole semplici',
    h2: 'Il valore più grande ce l’hai già in archivio.',
    intro: 'Trovare un cliente nuovo costa. Farne tornare uno che ti conosce già costa molto meno, ma richiede di ricordarsi di lui al momento giusto — ed è esattamente la cosa che nessuno ha tempo di fare.',
    voci: [
      ['Guarda chi manca', 'Assenze lunghe, percorsi lasciati a metà, richiami mai fatti: escono da soli dallo storico.'],
      ['Guarda i buchi', 'Un orario libero domani non è un problema se sai chi chiamare per riempirlo.'],
      ['Scrive per te', 'Il messaggio arriva già pronto e personale. A te resta leggerlo e decidere.'],
    ],
  },
  dichiarazione: {
    occhiello: 'Nessun messaggio parte senza il tuo sì.',
    h2: 'Il sistema prepara il lavoro. Chi decide che cosa arriva ai tuoi clienti resti tu.',
  },
  funzioni: {
    occhiello: 'Cosa fa davvero',
    h2: 'Prepara il lavoro della giornata, non lo esegue di nascosto.',
    intro: 'Ogni mattina trovi poche azioni chiare, ordinate per priorità, con scritto il motivo di ognuna. Niente automatismi che partono alle tue spalle.',
    voci: [
      ['Controlla ogni giorno', 'Legge clienti, appuntamenti e spazi liberi presenti nel sistema.'],
      ['Ordina per priorità', 'Mostra chi ricontattare per primo e spiega perché lo propone.'],
      ['Prepara i messaggi', 'Testi personali, non uguali per tutti. Li leggi e scegli quali inviare.'],
      ['Registra gli esiti', 'Risposte, appuntamenti recuperati e orari riempiti restano tracciati.'],
    ],
  },
  flusso: {
    occhiello: 'Il flusso completo',
    h2: 'Da un archivio fermo a un’agenda che si riempie.',
    passi: ['Legge agenda e storico', 'Trova le occasioni', 'Scrive i messaggi', 'Tu approvi', 'Misura le risposte'],
    chiusura: 'Ogni passaggio resta visibile: quale messaggio è partito, a chi, quando e che cosa ha risposto. Il consenso e la possibilità di esclusione sono registrati.',
  },
  pannello: {
    occhiello: 'Una schermata, poche decisioni',
    h2: 'Apri. Controlla. Approva.',
    testo: 'Dal telefono vedi le occasioni della giornata e i messaggi pronti. Il tuo staff continua a lavorare come sempre: l’unica cosa che cambia è che qualcuno si accorge dei clienti che stanno sparendo.',
    vedi: ['Chi ricontattare, con il motivo', 'Gli orari rimasti liberi', 'I messaggi pronti da approvare', 'Le risposte e gli appuntamenti ottenuti'],
    righe: [
      ['Riprendi il percorso interrotto', 'Messaggi pronti, in attesa del tuo sì'],
      ['Riempi l’orario libero di venerdì', 'Clienti adatti già selezionati'],
    ],
  },
  avvio: {
    occhiello: 'Come si parte',
    h2: 'Operativo in quattro passaggi.',
    passi: [
      ['Colleghiamo i dati', 'Importiamo clienti e agenda dal file o dal gestionale che usi già.'],
      ['Definiamo le regole', 'Ogni quanto ricontattare, chi escludere, che tono usare.'],
      ['Tu approvi', 'Ogni mattina poche azioni chiare, con i messaggi già scritti.'],
      ['Misuriamo', 'Risposte, appuntamenti recuperati e orari riempiti, mese per mese.'],
    ],
  },
  settori: {
    occhiello: 'Per chi lavora su appuntamento',
    h2: 'Utile ovunque un cliente possa smettere di tornare senza dirtelo.',
    voci: [
      ['Centri estetici', 'Pacchetti a metà, richiami stagionali, clienti sparite dopo l’estate.', '/settori/centri-estetici'],
      ['Cliniche estetiche', 'Follow-up, controlli e continuità dei percorsi.', '/settori/cliniche-estetiche'],
      ['Parrucchieri e barberie', 'Ritmi saltati e clienti che diradano senza dire niente.', '/settori/parrucchieri'],
      ['Studi dentistici', 'Igieni da richiamare e cure preventivate mai iniziate.', '/settori/studi-dentistici'],
      ['Fisioterapia e osteopatia', 'Cicli interrotti a metà e sedute mai riprese.', '/settori/fisioterapia-osteopatia'],
      ['Officine e servizi locali', 'Tagliandi, scadenze e manutenzioni periodiche.', '/settori/officine-e-servizi-locali'],
    ],
  },
  citta: ['Milano', 'Roma', 'Torino', 'Bologna', 'Firenze', 'Napoli', 'Verona', 'Como'],
  listino: {
    occhiello: 'Listino',
    h2: 'Due piani: solo agenda, oppure agenda più telefono.',
    intro: 'Il primo prepara i messaggi e ti aiuta a riempire gli spazi liberi. Il secondo aggiunge la segretaria telefonica, così chi ti cerca trova risposta e chi non ti cerca più viene ricontattato.',
    famiglia: SEGRETARIA_LISTINO.find(f => f.id === 'agenda')!,
  },
  faq: [
    ['I messaggi partono da soli?', 'No, mai. Il sistema prepara le bozze e le mette in coda: nessun messaggio raggiunge un cliente senza la tua approvazione esplicita.'],
    ['Che cosa succede a chi non vuole più essere contattato?', 'Viene escluso e resta escluso. Il consenso e l’opt-out sono registrati nel sistema, e i contatti senza consenso documentato non entrano nelle liste.'],
    ['Serve cambiare gestionale?', 'No. Importiamo clienti e agenda dal file o dal gestionale già in uso. Se serve un collegamento particolare lo valutiamo prima, e non è compreso in automatico.'],
    ['Quanti messaggi sono inclusi?', 'Mille invii approvati al mese. Oltre soglia costano 0,10 € ciascuno, ai quali si aggiungono gli eventuali costi applicati da Meta, che restano separati dal canone.'],
    ['Garantite un numero di clienti recuperati?', 'No. Il sistema individua le occasioni e prepara il lavoro; quanti tornano dipende anche da offerta, stagionalità e rapporto che hai con loro. Chi promette un numero non sa di che cosa parla.'],
    ['Che differenza c’è con una campagna pubblicitaria?', 'Qui non si cercano clienti nuovi: si riparte da quelli che hai già in archivio. Costa meno e ha tassi di risposta diversi, perché quelle persone ti conoscono già.'],
  ],
  gemella: {
    href: '/servizi/segretaria-telefonica-ai',
    occhiello: 'L’altra metà del lavoro',
    h2: 'E chi invece ti chiama e non trova nessuno?',
    testo: 'Riempire i buchi serve a poco se intanto il telefono squilla a vuoto durante i trattamenti. La segretaria telefonica AI risponde, informa e prenota al posto tuo. I due servizi si usano anche insieme.',
    cta: 'Vedi la Segretaria telefonica AI',
  },
}

export default function Page() { return <SegretariaLanding c={contenuto} /> }
