import { PACCHETTI } from '@/lib/pacchetti'
import { PREZZI } from '@/lib/prezzi-ingresso'
import { SEGRETARIA_LISTINO } from '@/lib/segretaria-listino'
import { SETTORI } from '@/lib/settori'
import { VIDEO_PACCHETTI } from '@/lib/video-listino'

// I percorsi di ODINO: che cosa può chiedere e che cosa risponde.
//
// Nessun modello di AI. ODINO non "genera" una risposta: la legge. Le cifre
// vengono dalle stesse sorgenti che alimentano le pagine, quindi non può dire
// un prezzo diverso da quello scritto sul sito nemmeno volendo — e il giorno
// che il listino cambia, cambia anche lui senza che nessuno se ne ricordi.
//
// È una scelta, non un limite di mezzi: per un assistente che parla di prezzi e
// di contratti, non poter improvvisare vale più che saper conversare.

export type Risposta = {
  /** Il titolo della risposta: risponde alla domanda, non la ripete. */
  titolo: string
  testo: string
  /** Cifre da mostrare in evidenza, già formattate. */
  cifre?: { voce: string; valore: string; nota?: string }[]
  /** Dove andare per approfondire. */
  link?: { href: string; label: string }[]
  /** Domande che nascono da questa risposta. */
  poi?: string[]
}

export type Nodo = {
  id: string
  /** Come la persona formula la domanda, non come la formuleremmo noi. */
  domanda: string
  /** Parole con cui questa domanda si riconosce, se qualcuno scrive invece di cliccare. */
  chiavi: string[]
  risposta: Risposta
}

const voce = (id: string) => SEGRETARIA_LISTINO.find(f => f.id === id)!
const pianoVoce = voce('voce').piani
const pianoAgenda = voce('agenda').piani

export const NODI: Nodo[] = [
  {
    id: 'da-dove-parto',
    domanda: 'Da dove conviene partire?',
    chiavi: ['iniziare', 'partire', 'primo passo', 'cominciare', 'consiglio'],
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
    chiavi: ['approva', 'approvazione', 'controllo', 'pubblicate', 'chi decide'],
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
    id: 'cosa-resta-fuori',
    domanda: 'Che cosa non è compreso nel canone?',
    chiavi: ['compreso', 'incluso', 'escluso', 'fuori', 'extra', 'costi aggiuntivi'],
    risposta: {
      titolo: 'Tre voci, dette prima e non dopo.',
      testo:
        'Restano sempre fuori dal canone: il budget versato alle piattaforme pubblicitarie, il numero telefonico e il traffico dell’operatore, e i costi applicati dalle piattaforme di messaggistica. Non li incassiamo noi, quindi non li mettiamo dentro il prezzo. I servizi vocali e di agenda hanno un costo di avvio una tantum, indicato prima dell’attivazione.',
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
    chiavi: ['disdetta', 'recesso', 'annullare', 'cancellare', 'vincolo', 'durata'],
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

export const NODO_INIZIALE = 'da-dove-parto'

export function nodo(id: string): Nodo | undefined {
  return NODI.find(n => n.id === id)
}

/**
 * Riconosce una domanda scritta a mano libera senza modelli di AI: conta quante
 * chiavi del nodo compaiono nel testo. Non "capisce" la frase, e non finge di
 * farlo — se nessun nodo raggiunge una soglia minima, ODINO lo dice e passa a
 * una persona invece di rispondere a caso.
 */
export function cerca(testo: string): Nodo[] {
  const t = testo.toLowerCase()
  const punteggi = NODI.map(n => ({
    n,
    p: n.chiavi.filter(k => t.includes(k)).length + (t.includes(n.domanda.toLowerCase().slice(0, 12)) ? 2 : 0),
  }))
  return punteggi.filter(x => x.p > 0).sort((a, b) => b.p - a.p).map(x => x.n)
}

/**
 * Il mestiere nominato nella frase, se c'e'. «Ho una gelateria» non contiene
 * nessuna parola del listino, ma dice la cosa piu' utile di tutte: chi sei.
 * I nomi non sono scritti a mano, vengono dai settori — un settore nuovo entra
 * qui da se'.
 */
export function settoreCitato(testo: string): { slug: string; nome: string } | undefined {
  const t = testo.toLowerCase()
  for (const s of SETTORI) {
    const parole = [s.nome, ...s.slug.split('-')]
      .flatMap(p => p.toLowerCase().split(/[\s,]+/))
      .filter(p => p.length > 4 && !['sono', 'della', 'delle', 'servizi', 'locali'].includes(p))
    // «gelaterie» deve riconoscere anche «gelateria»: si confronta la radice.
    if (parole.some(p => t.includes(p.slice(0, Math.max(5, p.length - 2))))) {
      return { slug: s.slug, nome: s.nome }
    }
  }
  return undefined
}
