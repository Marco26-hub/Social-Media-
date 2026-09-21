// I testi delle due pagine «AI a casa tua», italiana e inglese.
//
// Stavano dentro il componente. Finché la pagina era una sola andava bene; per
// farne due ci sono due strade, e la seconda è quella che il sito usa già:
// duplicare il componente (due impaginazioni che divergono al primo ritocco),
// oppure lasciare fuori i testi e passarli. Qui la struttura è una, i testi
// sono due.
//
// Regola dei contenuti, valida in entrambe le lingue: si dice quello che il
// cliente ottiene, non come è fatto dentro. Nomi dei modelli, quantizzazioni,
// script, porte e variabili d'ambiente restano fuori: sono il lavoro che rende
// la macchina stabile, e non si regala a chi legge una pagina di vendita.

export type BattutaTerminale = { chi: 'tu' | 'ai'; testo: string }

export type PacchettoAiCasa = {
  id: string
  nome: string
  perChi: string
  prezzo: number
  scelto?: boolean
  sintesi: string
  voci: readonly string[]
}

export type DomandaAiCasa = { q: string; a: string }

export type ContenutoAiCasa = {
  locale: 'it' | 'en'
  path: string
  /** Il gemello nell'altra lingua: serve agli hreflang e al cambio lingua. */
  pathGemello: string
  whatsapp: string
  briciole: { home: string; hrefHome: string; servizi: string; hrefServizi: string; qui: string }
  hero: {
    occhiello: string
    h1: string
    lead: string
    ctaPrimaria: string
    ctaSecondaria: string
    prove: readonly string[]
  }
  terminale: { intestazione: string; battute: readonly BattutaTerminale[] }
  perche: { occhiello: string; h2: string; intro: string; card: readonly { numero: string; titolo: string; testo: string }[] }
  come: { occhiello: string; h2: string; passi: readonly { numero: string; titolo: string; testo: string }[] }
  primoGiorno: { occhiello: string; h2: string; intro: string; voci: readonly { titolo: string; testo: string }[] }
  tagli: {
    occhiello: string
    h2: string
    intro: string
    card: readonly { nome: string; ruolo: string; testo: string }[]
    nota: string
  }
  conformita: {
    occhiello: string
    h2: string
    intro: string
    card: readonly { numero: string; titolo: string; testo: string }[]
    avviso: { titolo: string; testo: string }
    azioni: readonly { href: string; label: string; primaria?: boolean }[]
  }
  prezzi: {
    occhiello: string
    h2: string
    intro: string
    pacchetti: readonly PacchettoAiCasa[]
    etichettaScelto: string
    analisi: { titolo: string; testo: string; cta: string; href: string }
    righe: readonly { voce: string; dettaglio: string; prezzo: string }[]
    nota: { testo: string; link: string; hrefLink: string; coda: string }
  }
  faq: { occhiello: string; h2: string; domande: readonly DomandaAiCasa[] }
  finale: {
    occhiello: string
    h2: string
    intro: string
    ctaPrimaria: string
    ctaSecondaria: { label: string; href: string }
  }
  /** Quello che finisce nei dati strutturati, che parlano la lingua della pagina. */
  schema: { nome: string; tipoServizio: string; descrizione: string; areaServita: string; howToNome: string; howToDescrizione: string }
}

const WHATSAPP_NUMERO = '393477196603'
const wa = (testo: string) => `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(testo)}`

export const AI_CASA_IT: ContenutoAiCasa = {
  locale: 'it',
  path: '/servizi/ai-a-casa-tua',
  pathGemello: '/en/services/local-ai-on-your-mac',
  whatsapp: wa('Ciao! Vorrei un Mac con l’AI già installata.'),
  briciole: { home: 'Home', hrefHome: '/', servizi: 'Servizi', hrefServizi: '/servizi', qui: 'AI a casa tua' },
  hero: {
    occhiello: 'AI locale · Mac configurati da SWA',
    h1: 'AI a casa tua.',
    lead: 'Scegliamo insieme il Mac giusto, lo ordini tu ad Apple, e te lo mettiamo in mano con l’intelligenza artificiale già dentro: installata, tarata sulla macchina e collaudata. Si accende e funziona. I tuoi documenti restano sulla tua scrivania.',
    ctaPrimaria: 'Parliamo della macchina',
    ctaSecondaria: 'Come funziona',
    prove: ['Gira sul tuo Mac', 'I dati restano sulla macchina', 'Funziona senza rete', 'Un solo pulsante'],
  },
  terminale: {
    intestazione: 'AI locale · sul tuo Mac',
    battute: [
      { chi: 'tu', testo: 'Leggi il contratto e dimmi cosa devo controllare.' },
      { chi: 'ai', testo: 'Tre punti: il rinnovo è automatico, la penale vale solo dopo il primo anno e il recesso va mandato 60 giorni prima.' },
      { chi: 'tu', testo: 'Preparami la risposta al cliente.' },
      { chi: 'ai', testo: 'Pronta. Tono cortese, due righe, con la data di scadenza già calcolata.' },
    ],
  },
  perche: {
    occhiello: 'Perché sulla tua macchina',
    h2: 'L’intelligenza artificiale in locale non è una rinuncia. È il contrario.',
    intro: 'Quello che cambia quando il modello gira sul computer che hai davanti, invece che a casa di qualcun altro.',
    card: [
      { numero: '01', titolo: 'I documenti restano tuoi', testo: 'Preventivi, contratti, elenchi clienti: il modello li legge sulla macchina. Non vengono caricati da nessuna parte, quindi non c’è un fornitore a cui chiedere che fine hanno fatto.' },
      { numero: '02', titolo: 'Nessun canone che cresce', testo: 'La macchina la compri una volta. Non ci sono crediti da ricaricare, limiti mensili o aumenti di listino decisi altrove. La manutenzione, se la vuoi, è una tua scelta: senza, il sistema continua a funzionare lo stesso.' },
      { numero: '03', titolo: 'Funziona anche senza rete', testo: 'In treno, in cantiere, in aereo, con la linea che va e viene. L’AI è nel computer: se si accende il Mac, funziona.' },
      { numero: '04', titolo: 'Non cambia sotto i piedi', testo: 'Il servizio che usi oggi domani può alzare il prezzo, cambiare condizioni, togliere una funzione o chiudere. Quello che gira sulla tua macchina continua a funzionare come il giorno in cui te l’abbiamo consegnato, finché sei tu a decidere di cambiarlo.' },
    ],
  },
  come: {
    occhiello: 'Come funziona',
    h2: 'Dalla telefonata alla macchina accesa sulla tua scrivania.',
    passi: [
      { numero: 'Passo 01', titolo: 'Sentiamo cosa ti serve', testo: 'Che lavoro fai fare all’AI, su quali documenti, quante ore al giorno. Da qui esce il taglio di macchina giusto, non dal catalogo.' },
      { numero: 'Passo 02', titolo: 'Scegliamo la macchina', testo: 'Mac mini se resta sulla scrivania, portatile se ti segue. La memoria decide quanto lunga può essere una conversazione: è il numero che conta davvero.' },
      { numero: 'Passo 03', titolo: 'Installiamo e tariamo', testo: 'Non “installiamo un programma”: tariamo il sistema su quella macchina, perché regga il lavoro lungo senza rallentare tutto il resto.' },
      { numero: 'Passo 04', titolo: 'Collaudo e consegna', testo: 'La macchina parte solo dopo una prova lunga, registrata. Te la consegniamo accesa, e restiamo il tempo che serve a vedere insieme come si usa.' },
    ],
  },
  primoGiorno: {
    occhiello: 'Il primo giorno',
    h2: 'Apri il Mac e c’è già tutto.',
    intro: 'Nessuna installazione da fare, nessuna configurazione da capire, nessun terminale.',
    voci: [
      { titolo: 'Un pulsante nel Dock', testo: 'Lo premi, scegli cosa ti serve, lavori. Quando chiudi, la macchina torna libera da sola.' },
      { titolo: 'Sai sempre cosa sta facendo', testo: 'In alto vedi se l’AI è accesa e quanta memoria resta. Niente attese al buio.' },
      { titolo: 'Il Mac resta usabile', testo: 'Mentre l’AI lavora continui con posta, browser e fogli di calcolo. La macchina non si pianta: è il motivo per cui esiste questo servizio.' },
      { titolo: 'Istruzioni scritte in italiano', testo: 'Due pagine, non un manuale. E un numero a cui scrivere quando qualcosa non torna.' },
    ],
  },
  tagli: {
    occhiello: 'Che macchina serve',
    h2: 'La memoria decide quanto lunga può essere una conversazione.',
    intro: 'È l’unica regola che conta davvero, e vale per qualsiasi Mac: più memoria, più lungo il discorso che l’AI riesce a tenere a mente prima di perdere il filo.',
    card: [
      { nome: 'Scrivania', ruolo: 'Mac mini', testo: 'Per chi lavora da fermo: la macchina sta accesa, l’AI è sempre pronta e costa meno di un portatile a parità di memoria.' },
      { nome: 'In giro', ruolo: 'Portatile', testo: 'Per chi va dai clienti. Stessa AI, stesso pulsante, anche senza linea: in sala d’attesa o in cantiere cambia poco.' },
      { nome: 'Lavoro lungo', ruolo: 'Memoria alta', testo: 'Per chi lavora su documenti lunghi e sessioni di ore. Qui la memoria in più non è un vezzo: è la differenza tra ricominciare da capo e continuare.' },
      { nome: 'Tutto lo studio', ruolo: 'Macchina condivisa', testo: 'Una sola macchina in rete che serve più persone, con un profilo a testa e i permessi divisi per reparto. Costa meno di una macchina per scrivania e si aggiorna in un posto solo.' },
    ],
    nota: 'Il taglio esatto lo scegliamo insieme, sul lavoro che devi fare: consigliamo solo configurazioni che abbiamo provato davvero, e i riferimenti che usiamo sono misurati sulle nostre macchine, non presi da una scheda tecnica. Prezzo della macchina, tempi di consegna e garanzia sono quelli di Apple: te li mettiamo per iscritto insieme alla configurazione, prima che tu ordini qualsiasi cosa.',
  },
  conformita: {
    occhiello: 'AI Act · già in vigore',
    h2: 'Non è un problema del 2027. È adesso.',
    intro: 'Le regole europee sull’intelligenza artificiale sono già in vigore, e la prima domanda che ti farà chiunque venga a controllare è sempre la stessa: dove sono finiti i dati. Se la risposta è “non si sono mai mossi da qui”, hai già risolto la parte più scomoda.',
    card: [
      { numero: 'Dati', titolo: 'Non sono mai usciti', testo: 'Nessun fornitore esterno da dichiarare, nessun documento finito chissà dove. La risposta più semplice è anche la più difficile da contestare.' },
      { numero: 'Segreto', titolo: 'Il riserbo professionale regge', testo: 'Avvocati, commercialisti, consulenti del lavoro, studi medici: il fascicolo del cliente resta dov’è sempre stato.' },
      { numero: 'Tracce', titolo: 'Le tracce le tieni tu', testo: 'Quando devi dimostrare come hai lavorato, non devi chiederlo a un fornitore e aspettare che risponda.' },
      { numero: 'Riuso', titolo: 'Niente si allena sui tuoi file', testo: 'Non c’è una clausola di cui fidarsi: il modello lavora sul tuo computer e non ha nessun posto dove mandare niente.' },
    ],
    avviso: {
      titolo: 'Una cosa te la diciamo contro il nostro interesse.',
      testo: 'Tenere l’intelligenza artificiale in casa non ti esenta dalle regole: dipendono da cosa ci fai, non da dove gira. Chi te la vende come una scorciatoia ti sta creando un problema più grande di quello che ti risolve. Noi installiamo la macchina; per la parte legale c’è chi ne risponde con la firma. E se in futuro vuoi affiancare un modello in cloud, quello che gli mandi esce dalla macchina: te lo diciamo prima, lo attiviamo solo se lo chiedi e resta separato da quello che gira in locale.',
    },
    azioni: [
      { href: '/consulenza', label: 'Parlane con l’avvocato', primaria: true },
      { href: '/corsi', label: 'Corsi sull’AI Act' },
      { href: '/blog/ai-act-obblighi-pmi-cosa-fare', label: 'AI Act: gli obblighi di una PMI' },
      { href: '/trasparenza-ai', label: 'Come la usiamo noi' },
    ],
  },
  prezzi: {
    occhiello: 'Quanto costa',
    h2: 'Il Mac lo paghi ad Apple. A noi paghi il lavoro.',
    intro: 'Non ricarichiamo un euro sulla macchina: la ordini tu, al prezzo di listino Apple, e la garanzia resta la loro. Noi ti diciamo quale prendere e te la consegniamo che funziona.',
    etichettaScelto: 'Il più scelto',
    pacchetti: [
      { id: 'installazione', nome: 'Installazione', perChi: 'Hai già il Mac', prezzo: 490, sintesi: 'Un intervento sulla macchina che usi già, se regge il lavoro.', voci: ['Installazione completa e taratura', 'Collaudo della macchina', '30 minuti di formazione', '30 giorni di assistenza'] },
      { id: 'chiavi-in-mano', nome: 'Chiavi in mano', perChi: 'Professionisti e studi', prezzo: 990, scelto: true, sintesi: 'Dalla scelta della macchina alla consegna, acceso e collaudato.', voci: ['Scelta della configurazione e ordine assistito', 'Installazione, taratura e collaudo registrato', '1 ora di formazione e documento scritto', '90 giorni di assistenza'] },
      { id: 'studio', nome: 'Studio', perChi: 'Fino a 3 postazioni', prezzo: 1990, sintesi: 'Tre macchine, oppure una sola condivisa con un profilo a testa.', voci: ['Profili separati per persona', 'Procedure scritte per il gruppo', '2 ore di formazione', '6 mesi di assistenza'] },
      { id: 'pmi', nome: 'PMI', perChi: 'Da 4 a 10 postazioni', prezzo: 4900, sintesi: 'L’AI dentro l’azienda, sui documenti che avete già, con regole scritte su cosa può leggere e cosa no.', voci: ['Macchina condivisa in rete, permessi per reparto', 'Formazione al gruppo in due sessioni', 'Referente unico', '12 mesi di assistenza'] },
    ],
    analisi: {
      titolo: 'Prima si decide, poi si spende.',
      testo: 'L’analisi costa 290 €: sopralluogo o call, scelta della configurazione e proposta scritta a prezzo fisso. Se poi procedi, la scaliamo per intero dal pacchetto. È l’unica cosa che puoi comprare da qui: i pacchetti si quotano dopo, quando sappiamo su che macchina si lavora.',
      cta: 'Prenota l’analisi',
      href: '/acquista?servizio=ai-analisi',
    },
    righe: [
      { voce: 'Manutenzione (facoltativa)', dettaglio: 'Aggiornamento dei modelli, controllo trimestrale, assistenza da remoto entro un giorno lavorativo. Rinnovo automatico, si disdice quando vuoi. Copre la parte di intelligenza artificiale, non l’assistenza informatica generale.', prezzo: 'da 79 €/mese' },
      { voce: 'Interventi fuori pacchetto', dettaglio: 'In sede o da remoto, minimo un’ora.', prezzo: '120 €/ora' },
      { voce: 'Trasferta', dettaglio: 'Compresa entro 30 km. Da 30 a 100 km, 60 € a intervento. Oltre, il chilometraggio e il tempo di viaggio, sempre scritti nel preventivo.', prezzo: 'inclusa entro 30 km' },
    ],
    nota: {
      testo: 'Prezzi del servizio IVA esclusa. Il prezzo della macchina è quello del listino Apple, IVA inclusa, e lo paghi direttamente ad Apple: non passa da noi e non ci guadagniamo sopra. Che cosa comprende ciascun pacchetto, che cosa non garantisce e come si recede sta scritto nelle ',
      link: 'condizioni',
      hrefLink: '/termini',
      coda: ', al punto 4.',
    },
  },
  faq: {
    occhiello: 'Domande',
    h2: 'Quelle che ci fanno sempre.',
    domande: [
      { q: 'Me lo installo da solo, no?', a: 'Puoi. Il software si scarica gratis, e il primo giorno funziona. Poi arriva la sessione lunga, la memoria finisce e il Mac si inchioda mentre stai lavorando. Quello che compri qui è la macchina che non si inchioda: tarata, provata e con qualcuno a cui scrivere.' },
      { q: 'È come ChatGPT?', a: 'Si usa allo stesso modo, ma gira sul tuo computer. Non ha il mondo intero dentro e non naviga: in cambio non manda i tuoi documenti a nessuno, non ha limiti mensili e funziona anche senza rete.' },
      { q: 'E se voglio usare anche un modello in cloud?', a: 'Si può fare, e a volte conviene: per certi lavori i modelli grandi online sono più bravi. Ma va detto chiaro: quello che mandi a un servizio in cloud esce dalla tua macchina e finisce sotto le condizioni di quel fornitore. Per questo consegniamo le macchine con il solo modello locale attivo. Il collegamento a un servizio esterno lo aggiungiamo solo se ce lo chiedi, resta separato, e prima ti diciamo quali dati passano di là.' },
      { q: 'Posso usarlo sul Mac che ho già?', a: 'Dipende dalla macchina, e te lo diciamo prima: se non regge, te lo diciamo invece di venderti un’installazione che ti rallenta il lavoro.' },
      { q: 'Se si rompe qualcosa?', a: 'Il Mac ha la garanzia del produttore. Sulla parte che installiamo noi restiamo raggiungibili: si riprende la configurazione e si rimette a posto senza rifare tutto da zero.' },
      { q: 'Quanto costa?', a: 'Il nostro lavoro parte da 490 € e il pacchetto più scelto costa 990 €. La macchina la paghi ad Apple al suo prezzo, e dipende da quanta memoria ti serve davvero: te lo diciamo dopo dieci minuti di telefonata.' },
    ],
  },
  finale: {
    occhiello: 'Partiamo',
    h2: 'Dieci minuti per capire che macchina ti serve.',
    intro: 'Ci racconti che lavoro vuoi far fare all’AI. Noi ti diciamo che Mac serve, cosa ci installiamo sopra e quanto costa. Se non conviene, te lo diciamo.',
    ctaPrimaria: 'Scrivici su WhatsApp',
    ctaSecondaria: { label: 'Tutti i contatti', href: '/contatti' },
  },
  schema: {
    nome: 'AI a casa tua',
    tipoServizio: 'Installazione di intelligenza artificiale locale su Mac',
    descrizione: 'Mac e Mac mini consegnati con l’intelligenza artificiale già installata, tarata sulla memoria della macchina e collaudata. Il modello lavora sul computer del cliente, senza cloud e senza canone.',
    areaServita: 'Italia',
    howToNome: 'Come funziona AI a casa tua, passo per passo',
    howToDescrizione: 'Dal primo colloquio alla macchina consegnata accesa, con l’intelligenza artificiale installata e collaudata.',
  },
}

export const AI_CASA_EN: ContenutoAiCasa = {
  locale: 'en',
  path: '/en/services/local-ai-on-your-mac',
  pathGemello: '/servizi/ai-a-casa-tua',
  whatsapp: wa('Hello! I would like a Mac with local AI already installed.'),
  briciole: { home: 'Home', hrefHome: '/en', servizi: 'Services', hrefServizi: '/en/services', qui: 'Local AI on your Mac' },
  hero: {
    occhiello: 'Local AI · Macs configured by SWA',
    h1: 'Your AI, at your desk.',
    lead: 'We pick the right Mac with you, you order it from Apple, and we hand it over with the artificial intelligence already inside: installed, tuned to that machine and tested. You switch it on and it works. Your documents never leave your desk.',
    ctaPrimaria: 'Let’s talk about the machine',
    ctaSecondaria: 'How it works',
    prove: ['Runs on your Mac', 'Data stays on the machine', 'Works offline', 'One single button'],
  },
  terminale: {
    intestazione: 'Local AI · on your Mac',
    battute: [
      { chi: 'tu', testo: 'Read this contract and tell me what to watch out for.' },
      { chi: 'ai', testo: 'Three things: it renews automatically, the penalty only applies after the first year, and notice must be sent 60 days ahead.' },
      { chi: 'tu', testo: 'Draft the reply to the client.' },
      { chi: 'ai', testo: 'Ready. Polite tone, two lines, with the deadline already worked out.' },
    ],
  },
  perche: {
    occhiello: 'Why on your own machine',
    h2: 'Running AI locally is not a compromise. It is the opposite.',
    intro: 'What changes when the model runs on the computer in front of you, instead of in someone else’s building.',
    card: [
      { numero: '01', titolo: 'Your documents stay yours', testo: 'Quotes, contracts, client lists: the model reads them on the machine. Nothing is uploaded anywhere, so there is no supplier to ask where your files ended up.' },
      { numero: '02', titolo: 'No fee that keeps growing', testo: 'You buy the machine once. No credits to top up, no monthly caps, no price rises decided elsewhere. Maintenance is optional: without it the system keeps working exactly the same.' },
      { numero: '03', titolo: 'It works without a connection', testo: 'On a train, on site, on a plane, with a line that comes and goes. The AI is in the computer: if the Mac turns on, it works.' },
      { numero: '04', titolo: 'It does not change under you', testo: 'The service you use today can raise its price tomorrow, change its terms, drop a feature or shut down. What runs on your machine keeps working exactly as it did the day we handed it over, until you decide otherwise.' },
    ],
  },
  come: {
    occhiello: 'How it works',
    h2: 'From the first call to a machine switched on at your desk.',
    passi: [
      { numero: 'Step 01', titolo: 'We listen to what you need', testo: 'What you want the AI to do, on which documents, how many hours a day. The right machine comes out of that, not out of a catalogue.' },
      { numero: 'Step 02', titolo: 'We choose the machine', testo: 'A Mac mini if it stays on the desk, a laptop if it follows you. Memory decides how long a conversation can get: that is the number that actually matters.' },
      { numero: 'Step 03', titolo: 'We install and tune it', testo: 'Not “installing an app”: we tune the system to that specific machine, so it holds up under long work without slowing everything else down.' },
      { numero: 'Step 04', titolo: 'Testing and handover', testo: 'The machine only leaves after a long, recorded test run. We hand it over switched on, and we stay as long as it takes to show you how to use it.' },
    ],
  },
  primoGiorno: {
    occhiello: 'Day one',
    h2: 'You open the Mac and everything is already there.',
    intro: 'Nothing to install, no configuration to understand, no terminal.',
    voci: [
      { titolo: 'One button in the Dock', testo: 'You press it, choose what you need, and work. When you close it, the machine frees itself up.' },
      { titolo: 'You always know what it is doing', testo: 'At the top you can see whether the AI is running and how much memory is left. No waiting in the dark.' },
      { titolo: 'The Mac stays usable', testo: 'While the AI works you carry on with mail, browser and spreadsheets. The machine does not freeze: that is the reason this service exists.' },
      { titolo: 'Written instructions, in plain language', testo: 'Two pages, not a manual. And a number to write to when something does not add up.' },
    ],
  },
  tagli: {
    occhiello: 'Which machine you need',
    h2: 'Memory decides how long a conversation can get.',
    intro: 'It is the only rule that really matters, and it holds for any Mac: more memory, longer the thread the AI can hold before it loses the plot.',
    card: [
      { nome: 'Desk', ruolo: 'Mac mini', testo: 'For work that stays put: the machine is always on, the AI is always ready, and it costs less than a laptop with the same memory.' },
      { nome: 'On the move', ruolo: 'Laptop', testo: 'For those who visit clients. Same AI, same button, no connection needed: a waiting room or a building site makes little difference.' },
      { nome: 'Long work', ruolo: 'High memory', testo: 'For long documents and sessions that run for hours. Here the extra memory is not a luxury: it is the difference between starting over and carrying on.' },
      { nome: 'The whole practice', ruolo: 'Shared machine', testo: 'One machine on the network serving several people, a profile each and permissions split by department. It costs less than one machine per desk and it is updated in a single place.' },
    ],
    nota: 'We choose the exact configuration together, based on the work you need done: we only recommend setups we have actually tested, and the figures we use are measured on our own machines, not taken from a spec sheet. The price of the machine, delivery times and warranty are Apple’s: we put them in writing together with the configuration, before you order anything.',
  },
  conformita: {
    occhiello: 'EU AI Act · already in force',
    h2: 'Not a 2027 problem. It is now.',
    intro: 'The European rules on artificial intelligence are already in force, and the first question anyone checking will ask is always the same: where did the data go. If the answer is “it never left this room”, the most awkward part is already handled.',
    card: [
      { numero: 'Data', titolo: 'It never left', testo: 'No external supplier to declare, no document sitting somewhere unknown. The simplest answer is also the hardest to argue with.' },
      { numero: 'Secrecy', titolo: 'Professional confidentiality holds', testo: 'Lawyers, accountants, payroll advisers, medical practices: the client file stays exactly where it has always been.' },
      { numero: 'Records', titolo: 'You keep the records', testo: 'When you have to show how you worked, you do not have to ask a supplier and wait for an answer.' },
      { numero: 'Reuse', titolo: 'Nothing trains on your files', testo: 'There is no clause to take on trust: the model works on your computer and has nowhere to send anything.' },
    ],
    avviso: {
      titolo: 'Here is something that works against us.',
      testo: 'Keeping the AI in house does not exempt you from the rules: they depend on what you do with it, not on where it runs. Anyone selling local AI as a shortcut is handing you a bigger problem than the one they solve. We install the machine; for the legal side there are people who answer for it with their signature. And if you later want to add a cloud model alongside it, whatever you send to it leaves the machine: we tell you first, we only switch it on if you ask, and it stays separate from what runs locally.',
    },
    azioni: [
      { href: '/en/legal-advice', label: 'Talk to the lawyer', primaria: true },
      { href: '/en/ai-transparency', label: 'How we use AI ourselves' },
    ],
  },
  prezzi: {
    occhiello: 'What it costs',
    h2: 'You pay Apple for the Mac. You pay us for the work.',
    intro: 'We do not add a single euro to the machine: you order it yourself at Apple’s list price, and the warranty stays theirs. We tell you which one to get and hand it over working.',
    etichettaScelto: 'Most chosen',
    pacchetti: [
      { id: 'installazione', nome: 'Installation', perChi: 'You already have the Mac', prezzo: 490, sintesi: 'One session on the machine you already use, if it can take the work.', voci: ['Full installation and tuning', 'Machine test run', '30 minutes of training', '30 days of support'] },
      { id: 'chiavi-in-mano', nome: 'Turnkey', perChi: 'Professionals and small firms', prezzo: 990, scelto: true, sintesi: 'From choosing the machine to handover, switched on and tested.', voci: ['Configuration chosen and order assisted', 'Installation, tuning and recorded test run', '1 hour of training and a written setup document', '90 days of support'] },
      { id: 'studio', nome: 'Practice', perChi: 'Up to 3 workstations', prezzo: 1990, sintesi: 'Three machines, or a single shared one with a profile each.', voci: ['Separate profiles per person', 'Written procedures for the team', '2 hours of training', '6 months of support'] },
      { id: 'pmi', nome: 'Company', perChi: 'From 4 to 10 workstations', prezzo: 4900, sintesi: 'AI inside the company, on the documents you already have, with written rules on what it may read and what it may not.', voci: ['Shared machine on the network, permissions per department', 'Team training in two sessions', 'One point of contact', '12 months of support'] },
    ],
    analisi: {
      titolo: 'First you decide, then you spend.',
      testo: 'The assessment costs €290: a site visit or a proper call, the configuration chosen, and a written proposal at a fixed price. If you go ahead, we take it off the package in full. It is the only thing you can buy from this page: the packages are quoted afterwards, once we know which machine we are working on.',
      cta: 'Book the assessment',
      href: '/acquista?servizio=ai-analisi',
    },
    righe: [
      { voce: 'Maintenance (optional)', dettaglio: 'Model updates, a quarterly check, remote support within one working day. Renews automatically, cancel whenever you like. It covers the AI side, not general IT support.', prezzo: 'from €79/month' },
      { voce: 'Work outside the package', dettaglio: 'On site or remote, one hour minimum.', prezzo: '€120/hour' },
      { voce: 'Travel', dettaglio: 'Included within 30 km. From 30 to 100 km, €60 per visit. Beyond that, mileage and travel time, always written into the quote.', prezzo: 'included within 30 km' },
    ],
    nota: {
      testo: 'Service prices exclude VAT. The price of the machine is Apple’s list price, VAT included, and you pay it directly to Apple: it does not go through us and we make nothing on it. What each package includes, what it does not guarantee and how to withdraw is written in the ',
      link: 'terms',
      hrefLink: '/termini',
      coda: ', clause 4.',
    },
  },
  faq: {
    occhiello: 'Questions',
    h2: 'The ones we always get.',
    domande: [
      { q: 'I can install it myself, right?', a: 'You can. The software is free to download, and on day one it works. Then comes the long session, memory runs out and the Mac locks up while you are working. What you buy here is the machine that does not lock up: tuned, tested, and with someone to write to.' },
      { q: 'Is it like ChatGPT?', a: 'You use it the same way, but it runs on your computer. It does not hold the whole world and it does not browse: in exchange it sends your documents to nobody, has no monthly limits and works without a connection.' },
      { q: 'What if I also want a cloud model?', a: 'You can, and sometimes it pays off: for some work the big online models are better. But let us be clear: whatever you send to a cloud service leaves your machine and falls under that provider’s terms. That is why we hand over machines with the local model only. We add an external connection only if you ask, keep it separate, and tell you first which data goes across.' },
      { q: 'Can I use the Mac I already have?', a: 'It depends on the machine, and we tell you beforehand: if it cannot take it, we say so instead of selling you an installation that slows your work down.' },
      { q: 'What if something breaks?', a: 'The Mac carries the manufacturer’s warranty. On the part we install we stay reachable: the configuration is restored and put right without starting from scratch.' },
      { q: 'How much does it cost?', a: 'Our work starts at €490 and the most chosen package is €990. You pay Apple for the machine at their price, and that depends on how much memory you actually need: we tell you after a ten-minute call.' },
    ],
  },
  finale: {
    occhiello: 'Let’s start',
    h2: 'Ten minutes to work out which machine you need.',
    intro: 'You tell us what you want the AI to do. We tell you which Mac it takes, what we install on it and what it costs. If it is not worth it, we say so.',
    ctaPrimaria: 'Message us on WhatsApp',
    ctaSecondaria: { label: 'All contacts', href: '/en/contact' },
  },
  schema: {
    nome: 'Local AI on your Mac',
    tipoServizio: 'Local AI installation and configuration on Mac',
    descrizione: 'Macs and Mac minis handed over with artificial intelligence already installed, tuned to the machine’s memory and tested. The model runs on the client’s own computer, with no cloud and no subscription.',
    areaServita: 'Italy',
    howToNome: 'How local AI on your Mac works, step by step',
    howToDescrizione: 'From the first conversation to a machine handed over switched on, with the AI installed and tested.',
  },
}
