import { euro } from '@/lib/euro'
import { GIORNI_PROVA, PIANI_SALA, SALA_ATTIVAZIONE_MAX, SALA_ATTIVAZIONE_MIN } from '@/lib/ristoranti-listino'
import { CANONE_A_CARICO_CLIENTE } from '@/lib/canone-incluso'
import { PACCHETTI } from '@/lib/pacchetti'
import { PREZZI } from '@/lib/prezzi-ingresso'
import { SEGRETARIA_LISTINO } from '@/lib/segretaria-listino'
import { SETTORI } from '@/lib/settori'
import { VIDEO_PACCHETTI } from '@/lib/video-listino'
import { BLOG_SERVICE } from '@/lib/blog-service'
import { STANDALONE_SERVICES } from '@/lib/standalone-services'
import { motore, riconosciSettore, type Nodo, type Risposta } from '@/lib/odino/ricerca'

export type { Nodo, Risposta }

// I percorsi di ODINO: che cosa può chiedere e che cosa risponde.
//
// Nessun modello di AI. ODINO non "genera" una risposta: la legge. Le cifre
// vengono dalle stesse sorgenti che alimentano le pagine, quindi non può dire
// un prezzo diverso da quello scritto sul sito nemmeno volendo — e il giorno
// che il listino cambia, cambia anche lui senza che nessuno se ne ricordi.
//
// È una scelta, non un limite di mezzi: per un assistente che parla di prezzi e
// di contratti, non poter improvvisare vale più che saper conversare.

const voce = (id: string) => SEGRETARIA_LISTINO.find(f => f.id === id)!
const pianoVoce = voce('voce').piani
const pianoAgenda = voce('agenda').piani
const impresa = STANDALONE_SERVICES.find(x => x.slug === 'web-impresa')!
const CANONE_IMPRESA = `${impresa.pricePrefix ? `${impresa.pricePrefix} ` : ''}${impresa.displayPrice.replace('€', '')} € ${impresa.cadenceLabel}`

const NODI_BASE: Nodo[] = [
  {
    id: 'da-dove-parto',
    domanda: 'Da dove conviene partire?',
    chiavi: ['iniziare', 'inizio', 'partire', 'primo passo', 'cominciare', 'consiglio', 'da dove'],
    risposta: {
      titolo: 'Dal buco più evidente, non dal pacchetto più grande.',
      testo:
        'Il percorso ha quattro passi e nessuno richiede gli altri. Il sito porta le richieste, i contenuti fanno vedere che lavori, il telefono raccoglie chi ti cerca mentre sei occupato, l’agenda recupera chi non torna. Si parte da quello che oggi ti costa di più.',
      cifre: [
        { voce: '1. Il sito', valore: PREZZI.web, nota: 'Le richieste restano tue, non del portale' },
        { voce: '2. I contenuti', valore: PREZZI.presenza, nota: '16 contenuti al mese per ognuno dei 2 canali' },
        { voce: '3. Il telefono', valore: PREZZI.voce, nota: 'Risponde mentre lavori' },
        { voce: '4. L’agenda', valore: PREZZI.agenda, nota: 'Chi non torna da mesi rientra fra le priorità' },
      ],
      link: [{ href: '/pacchetti', label: 'Vedi il listino completo' }],
      poi: ['quanto-costa-social', 'telefono-come-funziona', 'garantite-risultati'],
    },
  },
  {
    id: 'quanto-costa-social',
    domanda: 'Quanto costa la gestione social?',
    chiavi: ['social', 'instagram', 'facebook', 'post', 'contenuti', 'quanto costa'],
    risposta: {
      titolo: 'Due piani, prezzo pubblico, IVA esclusa.',
      testo:
        'Il canone copre chi pensa, scrive, disegna e manda in uscita i contenuti. Restano fuori la pubblicità a pagamento, le risposte a commenti e messaggi e le riprese in sede: hanno un listino loro.',
      cifre: PACCHETTI.map(p => ({
        voce: p.nome,
        valore: `${p.prezzo.replace('€', '')} € al mese`,
        nota: p.sottotitolo,
      })),
      link: [
        { href: '/servizi/gestione-social-media', label: 'Che cosa comprende, voce per voce' },
        { href: '/pacchetti', label: 'Confronta con gli altri servizi' },
      ],
      poi: ['cosa-resta-fuori', 'chi-approva', 'garantite-risultati'],
    },
  },
  {
    id: 'telefono-come-funziona',
    domanda: 'Come funziona la segretaria telefonica?',
    chiavi: ['telefono', 'segretaria', 'chiamate', 'centralino', 'risponde', 'minuti'],
    risposta: {
      titolo: 'Risponde con le informazioni che hai approvato tu.',
      testo:
        'Dà servizi, prezzi e orari che hai caricato, legge il calendario e fissa l’appuntamento negli spazi liberi. Se la richiesta esce dalle regole che scrivi in avvio, prende i dati e la passa a te. Chi chiama sa dalla prima frase di parlare con un assistente.',
      cifre: pianoVoce.map(p => ({ voce: p.nome, valore: `${p.canone} € al mese`, nota: p.soglia })),
      link: [{ href: '/servizi/segretaria-telefonica-ai', label: 'Come risponde, nel dettaglio' }],
      poi: ['cosa-non-dice-assistente', 'quanto-costa-avvio', 'da-dove-parto'],
    },
  },
  {
    id: 'agenda-recupero',
    domanda: 'Come recuperate i clienti che non tornano?',
    chiavi: ['agenda', 'clienti persi', 'recupero', 'whatsapp', 'richiami', 'non tornano'],
    risposta: {
      titolo: 'Il sistema li trova e scrive. A inviare sei tu.',
      testo:
        'Ogni giorno legge agenda e storico, segnala chi manca da troppo tempo e chi potrebbe coprire un orario rimasto libero, e prepara il messaggio già scritto. Resta in bozza finché non dai il via libera: nessun messaggio raggiunge un cliente senza la tua approvazione.',
      cifre: pianoAgenda.map(p => ({ voce: p.nome, valore: `${p.canone} € al mese`, nota: p.soglia })),
      link: [{ href: '/servizi/agenda-clienti-whatsapp', label: 'Come funziona il recupero' }],
      poi: ['chi-approva', 'garantite-risultati', 'serve-cambiare-gestionale'],
    },
  },
  {
    id: 'video',
    domanda: 'Quanto costano le riprese video?',
    chiavi: ['video', 'riprese', 'reel', 'fotografo', 'girare'],
    risposta: {
      titolo: 'Canoni mensili, con la sessione di ripresa compresa.',
      testo:
        'Veniamo noi a girare, con fotografo, luci e ottiche. Una sessione produce il materiale di più settimane, perché si gira a lotto invece che un video alla volta. Prezzi IVA esclusa, spostamento nell’area concordata compreso.',
      cifre: VIDEO_PACCHETTI.map(v => ({
        voce: v.nome,
        valore: `${v.prezzo} € al mese`,
        nota: `${v.video} video in ${v.sessioni} ${v.sessioni === 1 ? 'sessione' : 'sessioni'}`,
      })),
      link: [{ href: '/servizi/video-produzione', label: 'Come si svolge una sessione' }],
      poi: ['quanto-costa-social', 'cosa-resta-fuori'],
    },
  },
  {
    id: 'blog',
    domanda: 'Che cos’è il servizio Blog?',
    chiavi: ['blog', 'articoli', 'scrivere', 'contenuti scritti'],
    risposta: {
      titolo: `${BLOG_SERVICE.articlesPerMonth} articoli al mese, scritti e revisionati.`,
      testo:
        'Ogni articolo arriva completo di title, meta description, FAQ visibili e dati strutturati: è pronto da pubblicare, non una bozza da sistemare. Il piano editoriale nasce dagli intenti di ricerca reali, non da un elenco di parole chiave.',
      cifre: [
        { voce: 'Blog SEO + GEO', valore: PREZZI.blog, nota: `${BLOG_SERVICE.articlesPerMonth} articoli al mese, ${BLOG_SERVICE.trialDays} giorni per valutare` },
      ],
      link: [{ href: '/servizi/blog-seo', label: 'Come funziona il servizio Blog' }],
      poi: ['farsi-trovare', 'quanto-costa-social', 'garantite-risultati'],
    },
  },
  {
    id: 'sito',
    domanda: 'Quanto costa il sito?',
    chiavi: ['sito', 'landing', 'pagina', 'web', 'ecommerce', 'e-commerce', 'negozio online', 'hosting', 'dominio', 'mail', 'posta', 'casella', 'spese'],
    risposta: {
      titolo: 'Due gradini, e dopo 12 mesi il progetto è tuo.',
      testo:
        `Il canone comprende hosting, manutenzione, design responsive e SEO tecnica di base. ${CANONE_A_CARICO_CLIENTE} Il gradino basso è una landing o un sito essenziale; sopra c’è il sito aziendale costruito sugli intenti di ricerca del tuo settore. E-commerce, multilingua e funzioni particolari si quotano a parte, approvate prima di ogni costo.`,
      cifre: [
        { voce: 'Sito Web Base', valore: PREZZI.web, nota: 'Landing o sito essenziale, mobile-first' },
        { voce: 'Sito impresa', valore: `${CANONE_IMPRESA}`, nota: 'Più pagine, struttura sugli intenti del settore' },
      ],
      link: [{ href: '/servizi/siti-e-commerce', label: 'Che cosa comprende il sito' }],
      poi: ['farsi-trovare', 'da-dove-parto', 'cosa-resta-fuori'],
    },
  },
  {
    id: 'farsi-trovare',
    domanda: 'Come mi fate trovare su Google e sulle AI?',
    chiavi: ['google', 'seo', 'geo', 'trovare', 'posizionamento', 'ricerca', 'chatgpt', 'motori'],
    risposta: {
      titolo: 'Struttura, intenti e leggibilità. Non posizioni promesse.',
      testo:
        'Il lavoro è su tre fronti: come sono costruite le pagine, quali domande fa davvero chi cerca il tuo servizio, e quanto il testo è citabile da un sistema di risposta AI. Nessuno controlla l’algoritmo di Google né quello di ChatGPT: si lavora su ciò che si può governare, e la posizione la decidono altri.',
      link: [
        { href: '/servizi/seo-geo', label: 'SEO e GEO: che cosa cambia' },
        { href: '/blog/seo-geo-differenze-visibilita-motori-ai', label: 'Le differenze, spiegate' },
      ],
      poi: ['blog', 'garantite-risultati', 'sito'],
    },
  },
  {
    id: 'garantite-risultati',
    domanda: 'Garantite dei risultati?',
    chiavi: ['garantite', 'garanzia', 'risultati', 'vendite', 'funziona davvero', 'promettete'],
    risposta: {
      titolo: 'No, e chi te lo promette non sa di cosa parla.',
      testo:
        'Non garantiamo vendite, appuntamenti, posizioni su Google né citazioni nei sistemi di risposta AI. Quelli dipendono anche da offerta, prezzo, stagione e da come tratti chi ti contatta — cose che un fornitore non controlla. Quello su cui prendiamo un impegno è il processo: materiale prodotto con continuità, pubblicato dopo la tua approvazione, richieste che trovano risposta. È scritto così anche in proposta.',
      link: [{ href: '/metodo', label: 'Il metodo, passo per passo' }],
      poi: ['chi-approva', 'cosa-resta-fuori', 'disdetta'],
    },
  },
  {
    id: 'chi-approva',
    domanda: 'Chi decide che cosa viene pubblicato?',
    chiavi: ['approva', 'approvo', 'approvazione', 'controllo', 'pubblicate', 'chi decide', 'chi approva', 'prima di pubblicare'],
    risposta: {
      titolo: 'Tu. Sempre, e prima che esca.',
      testo:
        'Ogni contenuto passa dalla tua approvazione prima della pubblicazione, e ogni messaggio ai clienti resta in bozza finché non dai il via libera. L’intelligenza artificiale accelera analisi e produzione; la decisione editoriale e la responsabilità restano di una persona. Ciò che è generato con l’AI viene etichettato dove la legge lo richiede.',
      link: [
        { href: '/trasparenza-ai', label: 'Dove usiamo l’AI e dove no' },
        { href: '/metodo', label: 'Il ciclo di lavoro' },
      ],
      poi: ['garantite-risultati', 'dati-clienti'],
    },
  },
  {
    id: 'sala-ristorante',
    domanda: 'Quanto costa il sistema per il ristorante?',
    chiavi: ['ristorante', 'ristoranti', 'bar', 'pizzeria', 'trattoria', 'tavolo', 'qr', 'menu', 'coperti', 'cameriere', 'pos', 'conto', 'prenotazioni', 'sala'],
    risposta: {
      titolo: 'Due moduli, e sull’incassato non tratteniamo niente.',
      testo:
        `Il cliente inquadra il QR al tavolo, ordina e paga dal telefono; le prenotazioni entrano nello stesso pannello. I due moduli si comprano anche separati. Il denaro arriva sul conto del locale e noi non tratteniamo nessuna percentuale: le commissioni sono quelle del tuo circuito di pagamento. Attivazione una tantum da ${SALA_ATTIVAZIONE_MIN} a ${SALA_ATTIVAZIONE_MAX}, ${GIORNI_PROVA} giorni di prova senza carta.`,
      cifre: PIANI_SALA.map(piano => ({
        voce: piano.nome,
        valore: `${euro(piano.canoneCents / 100)} al mese`,
        nota: piano.descrizione,
      })),
      link: [{ href: '/settori/ristoranti-e-bar', label: 'Il sistema di sala per ristoranti' }],
      poi: ['cosa-resta-fuori', 'da-dove-parto', 'disdetta'],
    },
  },
  {
    id: 'cosa-resta-fuori',
    domanda: 'Che cosa non è compreso nel canone?',
    chiavi: ['compreso', 'incluso', 'escluso', 'fuori', 'extra', 'costi aggiuntivi', 'dominio', 'mail', 'posta', 'casella', 'hosting', 'spese di gestione'],
    risposta: {
      titolo: 'Quello che non incassiamo noi.',
      testo:
        'L’hosting è compreso nel canone: il progetto gira sulla nostra infrastruttura e non ha senso fatturarlo a parte. Restano invece fuori le spese intestate a te: il dominio e le caselle di posta, che paghi al tuo fornitore e restano tue anche se cambi agenzia. Fuori anche il budget versato alle piattaforme pubblicitarie, il numero telefonico e il traffico dell’operatore, e i costi applicati dalle piattaforme di messaggistica. Non li incassiamo noi, quindi non li mettiamo dentro il prezzo, né li rivendiamo con un ricarico. I servizi vocali e di agenda hanno un costo di avvio una tantum, indicato prima dell’attivazione.',
      link: [{ href: '/pacchetti', label: 'Listino con le esclusioni' }],
      poi: ['quanto-costa-avvio', 'disdetta'],
    },
  },
  {
    id: 'quanto-costa-avvio',
    domanda: 'C’è un costo di avvio?',
    chiavi: ['avvio', 'attivazione', 'setup', 'iniziale', 'una tantum'],
    risposta: {
      titolo: 'Sui piani social no. Su voce e agenda sì, ed è scritto prima.',
      testo:
        'Nei piani social il setup è compreso nel canone. I servizi vocali e di agenda hanno un avvio una tantum, che copre raccolta delle informazioni, configurazione, collegamento di agenda e numero, prove ascoltabili e correzioni fino alla tua approvazione. La cifra è nella proposta prima della firma.',
      cifre: [...pianoVoce, ...pianoAgenda].map(p => ({ voce: p.nome, valore: p.avvio })),
      poi: ['cosa-resta-fuori', 'disdetta'],
    },
  },
  {
    id: 'disdetta',
    domanda: 'Come si disdice?',
    chiavi: ['disdetta', 'disdire', 'recesso', 'recedere', 'annullare', 'cancellare', 'vincolo', 'durata', 'contratto'],
    risposta: {
      titolo: 'Con il preavviso scritto nel contratto, e c’è una procedura online.',
      testo:
        'I canoni sono mensili con rinnovo automatico salvo disdetta. Per il recesso esiste una pagina dedicata che registra data e ora e rilascia una ricevuta conservabile, distinguendo fra consumatore e impresa perché la disciplina è diversa.',
      link: [
        { href: '/recesso', label: 'Recedere dal contratto' },
        { href: '/termini', label: 'Condizioni generali' },
      ],
      poi: ['garantite-risultati'],
    },
  },
  {
    id: 'dati-clienti',
    domanda: 'Che fine fanno i dati dei miei clienti?',
    chiavi: ['dati', 'privacy', 'gdpr', 'sicurezza', 'trattamento'],
    risposta: {
      titolo: 'Restano tuoi, e non addestrano nessun modello.',
      testo:
        'Il titolare del trattamento resti tu. Trattiamo solo i dati necessari al servizio attivato, e i materiali dei clienti non vengono usati per addestrare modelli di AI. I fornitori esterni sono nominati uno per uno nell’informativa, con la base giuridica di ogni trasferimento fuori dall’Unione europea. Cancellazione ed esportazione si chiedono in qualsiasi momento, senza costi.',
      link: [
        { href: '/privacy', label: 'Informativa completa' },
        { href: '/sicurezza', label: 'Come proteggiamo i dati' },
      ],
      poi: ['chi-approva'],
    },
  },
  {
    id: 'cosa-non-dice-assistente',
    domanda: 'Che cosa NON dice l’assistente al telefono?',
    chiavi: ['non dice', 'limiti', 'cosa risponde', 'sconti', 'diagnosi'],
    risposta: {
      titolo: 'Tutto quello che non hai caricato tu.',
      testo:
        'Non dà valutazioni cliniche, non tratta sconti o permute, non improvvisa una risposta tecnica. Nei casi che definisci in avvio — una domanda delicata, un’urgenza, una richiesta non prevista — prende nome, numero e motivo e passa la chiamata a una persona. E dichiara di essere un assistente nella prima frase.',
      link: [{ href: '/servizi/segretaria-telefonica-ai', label: 'Le regole di passaggio' }],
      poi: ['telefono-come-funziona', 'garantite-risultati'],
    },
  },
  {
    id: 'serve-cambiare-gestionale',
    domanda: 'Devo cambiare il gestionale che uso?',
    chiavi: ['gestionale', 'software', 'cambiare', 'integrazione', 'importare'],
    risposta: {
      titolo: 'No. Si parte da quello che usi oggi.',
      testo:
        'Clienti e agenda si importano dal file o dal gestionale già in uso, anche se sono divisi fra strumenti diversi. Se in seguito vuoi collegare i sistemi fra loro è un lavoro di integrazione, che quotiamo dopo averlo visto e che resta facoltativo. Cambiare software per attivare un servizio di richiami è quasi sempre una spesa evitabile.',
      link: [{ href: '/servizi/automazione-gestionali', label: 'Quando serve un’integrazione' }],
      poi: ['agenda-recupero', 'cosa-resta-fuori'],
    },
  },
  {
    id: 'settore',
    domanda: 'Lavorate nel mio settore?',
    chiavi: ['settore', 'categoria', 'mestiere', 'lavorate con'],
    risposta: {
      titolo: `${SETTORI.length} categorie hanno una pagina propria.`,
      testo:
        'Ogni pagina dice che cosa serve a quel mestiere e che cosa conviene lasciare stare, con il prezzo d’ingresso. Se il tuo settore non è in elenco il metodo non cambia: cambia quello che si produce.',
      link: SETTORI.map(s => ({ href: `/settori/${s.slug}`, label: s.nome })),
      poi: ['da-dove-parto', 'quanto-costa-social'],
    },
  },
  {
    id: 'metodo',
    domanda: 'Come lavorate, mese per mese?',
    chiavi: ['metodo', 'fasi', 'processo', 'come lavorate', 'organizzazione', 'report'],
    risposta: {
      titolo: 'Quattro fasi, ogni mese, sempre le stesse.',
      testo:
        'Analisi, direzione, produzione, miglioramento. Ogni fase ha un risultato atteso e prepara la successiva, così strategia e produzione non vanno su binari separati. Le decisioni restano tue: noi proponiamo, tu approvi, e a fine mese c’è un report di quello che è stato fatto.',
      link: [{ href: '/metodo', label: 'Il metodo, fase per fase' }],
      poi: ['chi-approva', 'da-dove-parto', 'garantite-risultati'],
    },
  },
  {
    id: 'ai-trasparenza',
    domanda: 'Usate l’AI per scrivere i contenuti?',
    chiavi: ['AI', 'intelligenza artificiale', 'chi scrive', 'generato', 'automatico', 'robot', 'chatgpt'],
    risposta: {
      titolo: 'Sì, e c’è scritto dove.',
      testo:
        'Usiamo strumenti di AI nella produzione, e lo dichiariamo: l’art. 50 dell’AI Act chiede trasparenza e la pagina dedicata dice che cosa è generato, che cosa è verificato e chi approva. Niente esce senza che una persona lo abbia letto, e niente viene pubblicato senza la tua approvazione.',
      link: [
        { href: '/trasparenza-ai', label: 'Dove usiamo l’AI, e dove decide una persona' },
        { href: '/consulenza', label: 'Consulenza legale su AI Act e GDPR' },
      ],
      poi: ['chi-approva', 'dati-clienti', 'garantite-risultati'],
    },
  },
  {
    id: 'listino-completo',
    domanda: 'Quanto costa tutto insieme?',
    chiavi: ['listino', 'quanto costa in tutto', 'costo totale', 'tutti i prezzi', 'quanto costa tutto', 'preventivo totale'],
    risposta: {
      titolo: 'Non c’è un prezzo unico, e non c’è nemmeno un preventivo a sorpresa.',
      testo:
        'Ogni servizio ha il suo canone e si compra da solo: nessuno deve prendere tutto per prendere una cosa. Il listino completo è pubblico, con quello che è compreso e quello che resta fuori. Il totale dipende da che cosa serve a te, e lo si scrive prima di iniziare.',
      cifre: [
        { voce: 'Gestione social', valore: PREZZI.presenza, nota: 'Presenza, due canali' },
        { voce: 'Blog SEO + GEO', valore: PREZZI.blog, nota: 'Dodici articoli al mese' },
        { voce: 'Sito', valore: PREZZI.web, nota: 'Landing o sito essenziale' },
      ],
      link: [{ href: '/pacchetti', label: 'Il listino completo' }],
      poi: ['cosa-resta-fuori', 'quanto-costa-avvio', 'da-dove-parto'],
    },
  },
  {
    id: 'pagamenti',
    domanda: 'Come si paga?',
    chiavi: ['pagamento', 'pagare', 'pago', 'fattura', 'bonifico', 'carta', 'annuale', 'mensile', 'rinnovo', 'addebito'],
    risposta: {
      titolo: 'Canone mensile, fattura, e nessun addebito a sorpresa.',
      testo:
        'I canoni sono mensili e si rinnovano finché il servizio è attivo; ogni pagamento ha la sua fattura. Il pagamento con carta passa da un circuito esterno: i dati della carta non transitano dai nostri sistemi. I prezzi di listino sono IVA esclusa, e qualunque costo che non sia il canone viene scritto e approvato prima, non addebitato dopo.',
      link: [
        { href: '/pacchetti', label: 'Listino e condizioni' },
        { href: '/termini', label: 'Termini e condizioni' },
      ],
      poi: ['quanto-costa-avvio', 'cosa-resta-fuori', 'disdetta'],
    },
  },
  {
    id: 'parlare-con-persona',
    domanda: 'Voglio parlare con una persona.',
    chiavi: ['persona', 'umano', 'chiamare', 'contatto', 'parlare', 'preventivo'],
    risposta: {
      titolo: 'WhatsApp è il canale più veloce.',
      testo:
        'Scrivi che cosa fai e dove oggi perdi tempo o richieste: da lì si capisce quale area conviene toccare per prima, e quali puoi lasciare stare. Nessun preventivo automatico e nessuna chiamata a sorpresa.',
      link: [{ href: '/contatti', label: 'Tutti i canali e i tempi di risposta' }],
      poi: ['da-dove-parto'],
    },
  },
]

const NODI_SETTORI: Nodo[] = SETTORI.map(s => ({
  id: `settore-${s.slug}`,
  domanda: `Che cosa potete fare per ${s.nome.toLowerCase()}?`,
  chiavi: [s.nome, s.slug.replace(/-/g, ' '), ...(s.sinonimi ?? [])],
  risposta: {
    titolo: `Sì, abbiamo un percorso per ${s.nome.toLowerCase()}.`,
    testo: `${s.sommario} ${s.risultati[0]?.text ?? s.lead}`,
    link: [
      { href: `/settori/${s.slug}`, label: `Soluzioni per ${s.nome.toLowerCase()}` },
      ...s.correlati.slice(0, 2),
    ],
    poi: s.slug === 'ristoranti-e-bar'
      ? ['sala-ristorante', 'quanto-costa-social', 'sito']
      : ['da-dove-parto', 'quanto-costa-social', 'telefono-come-funziona'],
  },
}))

export const NODI: Nodo[] = [...NODI_BASE, ...NODI_SETTORI]

export const NODO_INIZIALE = 'da-dove-parto'

export const MOTORE = motore(NODI)
export const nodo = MOTORE.nodo
export const cerca = MOTORE.cerca

export function settoreCitato(testo: string) {
  return riconosciSettore(testo, SETTORI)
}
