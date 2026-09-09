import type { LucideIcon } from 'lucide-react'
import { CalendarClock, Clapperboard, ClipboardCheck, Globe2, Megaphone, Newspaper, PhoneCall, ScanSearch, Target, UtensilsCrossed, Workflow } from 'lucide-react'
import { BLOG_SERVICE } from '@/lib/blog-service'

// Sorgente unica del metodo, servizio per servizio.
//
// Le quattro fasi vivevano dentro ogni pagina di dettaglio: otto copie sparse
// piu' due pagine che le chiamavano «avvio». La pagina /metodo raccontava solo
// il ciclo editoriale generale e non nominava nessuno dei dieci servizi, cosi'
// chi arrivava da SEO+GEO cliccando «Scopri il metodo completo» leggeva di
// rubriche e calendario social. Ora le fasi stanno qui una volta sola: le
// pagine di servizio e l'hub /metodo leggono lo stesso testo.

export type FaseServizio = { number: string; title: string; text: string }

export type MetodoServizio = {
  slug: string
  href: string
  label: string
  icon: LucideIcon
  /** Che cosa esce alla fine del ciclo. E' la stessa riga dell'indice /servizi. */
  consegna: string
  fasi: readonly FaseServizio[]
}

export const METODO_SERVIZI: readonly MetodoServizio[] = [
  {
    slug: 'gestione-social-media',
    href: '/servizi/gestione-social-media',
    label: 'Gestione social multicanale',
    icon: Megaphone,
    consegna: 'Da 16 a 24 contenuti al mese per ciascuno dei 2 canali scelti',
    fasi: [
      { number: '01', title: 'Cosa raccogliamo in avvio', text: 'L’avvio è la sessione in cui raccogliamo servizi, prezzi, foto, materiali e le frasi che non vuoi mai leggere sui tuoi 2 profili. Basta un incontro solo: il resto lo scriviamo noi e tu correggi tutto quello che non ti somiglia.' },
      { number: '02', title: 'Quando vedi il calendario', text: 'Il calendario del primo mese è pronto prima che il mese cominci, con date, formati e argomenti già assegnati ai 2 canali. Lo leggi con calma, togli quello che non ti convince, e solo dopo parte la produzione dei contenuti veri.' },
      { number: '03', title: 'Come si produce', text: 'La produzione è il blocco in cui si scrivono i testi, si disegnano le grafiche e si montano i video brevi dei 2 profili, tutto dentro il canone del piano attivo. Ogni pezzo arriva sul tuo pannello prima di uscire davvero.' },
      { number: '04', title: 'Quando esce e chi controlla', text: 'La pubblicazione è programmata sui 2 profili nei giorni e negli orari fissati nel piano, e parte solo dopo il tuo sì. Se un contenuto non esce per un problema tecnico ce ne accorgiamo noi e lo rimettiamo in coda.' },
    ],
  },
  {
    slug: 'seo-geo',
    href: '/servizi/seo-geo',
    label: 'SEO e GEO',
    icon: ScanSearch,
    consegna: 'Audit, mappa degli intenti e priorità di intervento scritte',
    fasi: [
      { number: '01', title: 'Scansione', text: 'Tecnica, contenuti, query, entità e presenza del brand.' },
      { number: '02', title: 'Architettura', text: 'Una URL e una gerarchia chiare per ogni intento strategico.' },
      { number: '03', title: 'Ottimizzazione', text: 'Pagine strategiche, FAQ, collegamenti e dati strutturati.' },
      { number: '04', title: 'Misurazione', text: 'Copertura, traffico qualificato, conversioni e segnali AI.' },
    ],
  },
  {
    slug: 'blog-seo',
    href: BLOG_SERVICE.path,
    label: BLOG_SERVICE.name,
    icon: Newspaper,
    consegna: '12 articoli al mese, revisionati da una persona e pubblicati',
    fasi: [
      { number: '01', title: 'Raccolta', text: 'Servizi, pubblico, fonti, tono e priorita commerciali.' },
      { number: '02', title: 'Piano', text: 'Dodici temi ordinati per intento e collegamenti interni.' },
      { number: '03', title: 'Produzione', text: 'Articoli, metadati, FAQ, immagini e dati strutturati.' },
      { number: '04', title: 'Controllo', text: 'Revisione, approvazione e pubblicazione sul canale concordato.' },
    ],
  },
  {
    slug: 'siti-e-commerce',
    href: '/servizi/siti-e-commerce',
    label: 'Siti web e landing',
    icon: Globe2,
    consegna: 'Landing page o sito aziendale. Dopo 12 mesi di canone è tuo',
    fasi: [
      { number: '01', title: 'Obiettivi', text: 'Pubblico, offerta, conversioni e requisiti commerciali.' },
      { number: '02', title: 'Prototipo', text: 'Architettura, contenuti, gerarchie e percorsi mobile-first.' },
      { number: '03', title: 'Sviluppo', text: 'Interfaccia, funzioni, integrazioni e controlli di qualità.' },
      { number: '04', title: 'Lancio', text: 'Analytics, indicizzazione, monitoraggio e miglioramenti.' },
    ],
  },
  {
    slug: 'video-produzione',
    href: '/servizi/video-produzione',
    label: 'Riprese video in azienda',
    icon: Clapperboard,
    consegna: 'Mezza giornata di riprese in azienda, da cui escono verticali e scatti per più settimane',
    fasi: [
      { number: '01', title: 'Sopralluogo', text: 'Guardiamo spazi, luce naturale e orari in cui si può girare senza fermare l’attività.' },
      { number: '02', title: 'Piano di ripresa', text: 'Scene, messaggi e formati decisi prima, in base al piano editoriale dei mesi successivi.' },
      { number: '03', title: 'Giornata di riprese', text: 'Mezza giornata o giornata intera, con fotografo e, se previsto, il volto scelto.' },
      { number: '04', title: 'Montaggio e uscita', text: 'Selezione, montaggio, sottotitoli e pubblicazione dentro il calendario che già gestiamo.' },
    ],
  },
  {
    slug: 'ricerca-clienti-b2b',
    href: '/servizi/ricerca-clienti-b2b',
    label: 'Ricerca Clienti B2B',
    icon: Target,
    consegna: 'Fino a 30 aziende verificate, con fonti pubbliche e priorità motivata',
    fasi: [
      { number: '01', title: 'Brief', text: 'Offerta, cliente ideale, mercati e criteri di esclusione.' },
      { number: '02', title: 'Ricerca', text: 'Il motore separato individua candidati e relative fonti pubbliche.' },
      { number: '03', title: 'Verifica', text: 'Controlliamo coerenza, duplicati e qualità delle informazioni.' },
      { number: '04', title: 'Consegna', text: 'Lista prioritaria, fonti e motivazioni pronte per il lavoro commerciale.' },
    ],
  },
  {
    slug: 'segretaria-telefonica-ai',
    href: '/servizi/segretaria-telefonica-ai',
    label: 'Segretaria telefonica AI',
    icon: PhoneCall,
    consegna: '600 minuti al mese di risposta al telefono, circa 10 ore',
    fasi: [
      { number: '01', title: 'Raccogliamo le informazioni', text: 'Servizi, prezzi, orari, regole e che cosa non deve mai dire.' },
      { number: '02', title: 'Colleghiamo agenda e numero', text: 'L’assistente legge le disponibilità vere e risponde sul tuo numero.' },
      { number: '03', title: 'Provi prima di attivare', text: 'Ascolti come risponde e correggi finché non ti convince.' },
      { number: '04', title: 'Va online', text: 'Da lì in avanti guardi gli esiti e correggi quando serve.' },
    ],
  },
  {
    slug: 'agenda-clienti-whatsapp',
    href: '/servizi/agenda-clienti-whatsapp',
    label: 'Agenda, clienti e WhatsApp',
    icon: CalendarClock,
    consegna: '1000 messaggi al mese, preparati dal sistema e inviati dopo il tuo sì',
    fasi: [
      { number: '01', title: 'Colleghiamo i dati', text: 'Importiamo clienti e agenda dal file o dal gestionale che usi già.' },
      { number: '02', title: 'Definiamo le regole', text: 'Ogni quanto ricontattare, chi escludere, che tono usare.' },
      { number: '03', title: 'Tu approvi', text: 'Ogni mattina poche azioni chiare, con i messaggi già scritti.' },
      { number: '04', title: 'Misuriamo', text: 'Risposte, appuntamenti recuperati e orari riempiti, mese per mese.' },
    ],
  },
  {
    slug: 'gestione-lavorazioni',
    href: '/servizi/gestione-lavorazioni',
    label: 'Rapportini di intervento',
    icon: ClipboardCheck,
    consegna: 'Rapportini firmati sul posto, con foto, ore e PDF al cliente',
    fasi: [
      { number: '01', title: 'Analisi del giro di lavoro', text: 'Guardiamo come nascono oggi le richieste e come tornano indietro i rapporti: chi compila, chi controlla e cosa serve davvero per fatturare a fine mese.' },
      { number: '02', title: 'Modelli e anagrafiche', text: 'Scriviamo insieme sezioni e voci della scheda, carichiamo clienti e indirizzi, creiamo gli accessi della squadra e configuriamo i canali su cui arrivano i rapporti.' },
      { number: '03', title: 'Prova sul campo', text: 'Una settimana di rapporti veri, compilati dagli operatori sul posto: poi correggiamo voci, categorie di foto e testi prima di estendere il metodo a tutta la squadra.' },
      { number: '04', title: 'Esercizio e manutenzione', text: 'Il sistema resta in esercizio con il sito collegato: nuove voci, nuovi modelli e nuove integrazioni si concordano prima, e ogni lavorazione extra è approvata prima del costo.' },
    ],
  },
  {
    slug: 'automazione-gestionali',
    href: '/servizi/automazione-gestionali',
    label: 'Automazione e gestionali',
    icon: Workflow,
    consegna: 'Collegamenti fra i sistemi già in uso, con registro delle esecuzioni',
    fasi: [
      { number: '01', title: 'Mappa', text: 'Sistemi in uso, dati che si duplicano e passaggi manuali ricorrenti.' },
      { number: '02', title: 'Priorità', text: 'Cosa automatizzare per primo, con costi e responsabilità definiti prima di partire.' },
      { number: '03', title: 'Realizzazione', text: 'Integrazione o sviluppo, con verifica su casi reali prima dell’attivazione.' },
      { number: '04', title: 'Esercizio', text: 'Monitoraggio, correzioni e nuovi flussi solo dopo aver verificato i precedenti.' },
    ],
  },
  {
    slug: 'gestionale-ristoranti',
    href: '/servizi/gestionale-ristoranti',
    label: 'Tavolo per ristoranti',
    icon: UtensilsCrossed,
    consegna: 'Menu QR, ordini, pagamenti e prenotazioni in un solo pannello',
    fasi: [
      { number: '01', title: 'Sopralluogo', text: 'Guardiamo sala, tavoli, menu e come incassate oggi prima di configurare il sistema.' },
      { number: '02', title: 'Configurazione', text: 'Carichiamo il menu, generiamo i QR e colleghiamo il conto di incasso e il marchio del locale.' },
      { number: '03', title: 'Prova in sala', text: 'Si parte da pochi tavoli con il personale presente, finché ordine, cucina e pagamento filano.' },
      { number: '04', title: 'A regime', text: 'Il pannello mostra ordini, prenotazioni e incassi; menu e disponibilità restano aggiornabili dal locale.' },
    ],
  },
] as const

const PER_SLUG = new Map(METODO_SERVIZI.map(s => [s.slug, s]))

/** Il metodo di un servizio. Errore in build se lo slug non esiste: meglio qui
 *  che una pagina pubblicata con la sezione metodo vuota. */
export function metodoServizio(slug: string): MetodoServizio {
  const trovato = PER_SLUG.get(slug)
  if (!trovato) throw new Error(`metodoServizio: slug sconosciuto «${slug}»`)
  return trovato
}

/** Le fasi nella forma [titolo, testo] usata dalle due landing con «Come si parte». */
export function passiAvvio(slug: string): readonly (readonly [string, string])[] {
  return metodoServizio(slug).fasi.map(f => [f.title, f.text] as const)
}

/** Titolo dello HowTo e della sezione: nomina il servizio, non «il metodo». */
export function titoloMetodo(slug: string): string {
  return `Come funziona ${metodoServizio(slug).label}, passo per passo`
}
