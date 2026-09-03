// Contenuto della guida al sistema: dal cliente al post pubblicato.
//
// Vive in un modulo separato dalla pagina perche e testo editoriale, non
// interfaccia: si aggiorna quando cambia il flusso, senza toccare il layout.
// La stessa struttura alimenta l'indice, le fasi e il filtro sui passi manuali.

export type Passo = {
  n: number
  titolo: string
  sintesi: string
  /** true = serve una decisione di una persona, non avviene da solo. */
  manuale?: boolean
  /** Passo che si puo saltare senza bloccare il flusso. */
  facoltativo?: boolean
  paragrafi: string[]
  /** Avviso in evidenza. `grave` lo colora come un allarme invece che come nota. */
  nota?: { testo: string; grave?: boolean }
  riferimenti: string[]
}

export type Fase = {
  id: string
  n: string
  titolo: string
  sommario: string
  dove?: string
  passi: Passo[]
}

export const FASI: Fase[] = [
  {
    id: 'onboarding',
    n: '01',
    titolo: 'Onboarding cliente',
    dove: 'Clienti → Onboarding',
    sommario: 'Quattro passi guidati. Alla fine il cliente ha un profilo brand, un catalogo e i primi contenuti di prova.',
    passi: [
      {
        n: 1,
        titolo: 'Crea il cliente',
        sintesi: 'Nome, sito e email. Nasce il workspace.',
        manuale: true,
        paragrafi: [
          'Il workspace è il contenitore di tutto: contenuti, media, account social e impostazioni vivono sotto il suo cliente_id, e ogni interrogazione lo usa come confine — un cliente non vede mai i dati di un altro.',
          'Il piano commerciale non si sceglie qui: lo assegna un amministratore dalla scheda cliente. Senza questa separazione chiunque avrebbe potuto attribuirsi un pacchetto più ricco di quello acquistato.',
        ],
        riferimenti: ['POST /api/data/clienti', 'tabella clienti', 'user_client_access'],
      },
      {
        n: 2,
        titolo: 'Scoperta del brand',
        sintesi: 'L’AI legge il sito e propone il profilo.',
        paragrafi: [
          'Dall’indirizzo del sito l’AI ricava tono di voce, pubblico, promessa, colori, parole da usare ed evitare, policy emoji, hashtag di base e CTA ricorrenti. La proposta è modificabile prima di salvare: è un punto di partenza, non un verdetto.',
          'Questo profilo diventa il vincolo di ogni contenuto generato in seguito. È ciò che impedisce a due clienti diversi di suonare uguali.',
        ],
        riferimenti: ['/api/generate/brand-discovery', 'tabella brand'],
      },
      {
        n: 3,
        titolo: 'Catalogo prodotti',
        sintesi: 'Cosa vende il cliente, con i prezzi.',
        facoltativo: true,
        paragrafi: [
          'Nome, categoria e prezzo di ciò che va promosso. I contenuti possono così citare il prodotto giusto e agganciare il link corretto, invece di restare generici.',
          'Si può saltare e compilare più avanti: l’onboarding non si blocca.',
        ],
        riferimenti: ['tabella prodotti'],
      },
      {
        n: 4,
        titolo: 'Primi contenuti di prova',
        sintesi: 'Due per canale, per sentire il tono.',
        paragrafi: [
          'Serve a verificare subito che il profilo brand produca il risultato atteso, prima di impegnare un piano intero. Se la voce non convince si torna al passo 2 e si corregge.',
          'I contenuti nascono in Da approvare: nulla raggiunge un social in questa fase.',
        ],
        riferimenti: ['/api/generate/content', 'DA_APPROVARE'],
      },
    ],
  },
  {
    id: 'preparazione',
    n: '02',
    titolo: 'Preparazione del piano',
    dove: 'Piano editoriale',
    sommario: 'Si stabilisce cosa produrre e con quale materiale. Niente è ancora stato generato.',
    passi: [
      {
        n: 5,
        titolo: 'Pacchetto, social e periodo',
        sintesi: 'Il contratto decide i numeri, non la pagina.',
        manuale: true,
        paragrafi: [
          'Presenza vale 16 contenuti al mese per ciascun social, Crescita 24, su un massimo di due canali. Con due social attivi diventano 32 e 48 pubblicazioni in calendario.',
          'I conteggi seguono il pacchetto acquistato, non i file già caricati. Se il materiale è stato prodotto con una ricetta diversa, si corregge prima il pacchetto nella scheda cliente.',
        ],
        riferimenti: ['lib/packages.ts', 'clienti.contenuti_mese'],
      },
      {
        n: 6,
        titolo: 'Qualità e stile visual',
        sintesi: 'Quanto è ricco ogni contenuto.',
        manuale: true,
        paragrafi: [
          'La qualità High aggiunge a ogni contenuto pubblico, funnel, KPI, angolo creativo, test A/B, rischi e checklist. È molto più materiale da generare: incide sui tempi più di ogni altra impostazione.',
          'Il preset di montaggio — trending, premium, minimal, classico — governa il ritmo dei Reel. Effetti e trend dal web sono consigliati dalla skill del pacchetto ma restano disattivabili: senza trend verificati la skill ripiega su una regia sobria invece di inventarne.',
        ],
        riferimenti: ['high · medium · soft', 'visual_preset'],
      },
      {
        n: 7,
        titolo: 'Media: cartella campagna o caricamento libero',
        sintesi: 'Il nome dei file porta con sé la regia.',
        manuale: true,
        paragrafi: [
          'Una cartella già prodotta viene letta dal percorso dei file: settimana, social, formato, contenuto e sequenza si deducono dai nomi. Ogni gruppo social+contenuto diventa una pubblicazione, e le slide di uno stesso carosello restano unite.',
          'I media già caricati si riusano con un click invece di ricaricarli: ogni ricaricamento creerebbe file nuovi, perché i nomi ricevono un token casuale e nulla viene sovrascritto. Un pulsante dedicato elimina i caricamenti vecchi, simulando prima quanto libererebbe.',
        ],
        nota: {
          testo: 'Il materiale della cartella vince sulla quota. Se contiene più contenuti del pacchetto, il piano li produce tutti — e la risposta dichiara quanti ne ha aggiunti oltre il previsto, invece di sforare in silenzio.',
        },
        riferimenti: ['lib/campaign-folder.ts', '/api/assets/list', '/api/assets/cleanup'],
      },
      {
        n: 8,
        titolo: 'Fabbisogno media',
        sintesi: 'Quante foto e quanti MP4 servono davvero.',
        paragrafi: [
          'Il pannello calcola il fabbisogno dal pacchetto moltiplicato per i social selezionati: ogni concept diventa una pubblicazione per canale, e ciascuna vuole i propri media.',
          'Le regole per formato sono fisse: 1 immagine per post, 5 per carosello, 1 MP4 per Reel — oppure 5 foto verticali, che vengono montate automaticamente.',
        ],
        riferimenti: ['lib/media-requirements.ts'],
      },
    ],
  },
  {
    id: 'generazione',
    n: '03',
    titolo: 'Generazione',
    sommario: 'Un click produce il piano completo. È il passaggio più lungo e il più denso di regole.',
    passi: [
      {
        n: 9,
        titolo: 'Mese intero o due fasi',
        sintesi: 'Richieste più corte, meno rischio di interruzione.',
        manuale: true,
        paragrafi: [
          'Il piano mensile può uscire in un colpo solo oppure in due fasi: settimane 1-2 e settimane 3-4. La quota di ogni settimana resta calcolata sulle quattro settimane, quindi le due fasi insieme ricompongono esattamente il totale del pacchetto — mai il doppio.',
          'Con una cartella del mese intero, generando una fase i media delle settimane non coperte restano da parte per l’altra fase, e il messaggio finale lo dichiara.',
        ],
        riferimenti: ['lib/plan-quota.ts', 'fase 1 · fase 2'],
      },
      {
        n: 10,
        titolo: 'Cosa fa il motore',
        sintesi: 'Blocchi, mix, cadenza, media, anti-duplicati.',
        paragrafi: [
          'Blocchi settimanali, ciascuno con la propria quota, presa dal pacchetto o dai gruppi della cartella.',
          'Mix dei formati — post, caroselli, story, reel — diviso sulle quattro settimane. Con una cartella importata il mix lo detta la cartella.',
          'Cadenza: i contenuti al giorno si calcolano sul carico reale del blocco, così la settimana si riempie tutta invece di concentrarsi nei primi giorni. Gli orari escono dalle fasce reali di ogni canale, e due contenuti dello stesso canale non finiscono mai stessa data e stessa ora.',
          'Assegnazione media: ogni gruppo della cartella va a un solo blocco, con le slide di un carosello mai spezzate.',
          'Memoria creativa: le ultime 96 creatività del cliente vengono confrontate con quelle nuove. Un hook troppo simile a uno già uscito viene fermato e segnalato invece di essere pubblicato due volte.',
        ],
        riferimenti: ['POST /api/generate/plan', 'lib/scheduling.ts', 'lib/editorial-variation.ts'],
      },
      {
        n: 11,
        titolo: 'Esito, contato e dichiarato',
        sintesi: 'Cosa è riuscito e cosa va sistemato.',
        paragrafi: [
          'La risposta non si limita al numero di contenuti. Dichiara quanti slot sono da sistemare a mano, quanti sono stati scartati perché incompleti, quanti media appartengono a settimane non generate e quanti contenuti la cartella ha aggiunto oltre la quota.',
          'Un blocco AI fallito non fa perdere gli altri: diventa uno slot Errore manuale che conserva data, canale, formato e media, pronto per essere corretto o rigenerato singolarmente.',
        ],
        riferimenti: ['fallback_slots', 'media_fuori_periodo', 'items_gruppo_cartella_diverso'],
      },
    ],
  },
  {
    id: 'approvazione',
    n: '04',
    titolo: 'Approvazione',
    dove: 'Calendario · Preview',
    sommario: 'Il piano esiste ma nessun social l’ha visto. Qui si decide cosa esce.',
    passi: [
      {
        n: 12,
        titolo: 'Anteprima fedele',
        sintesi: 'Come apparirà davvero, per ogni canale.',
        paragrafi: [
          'Ogni contenuto si vede nel formato reale del suo canale: post e caroselli in 4:5, Reel e Story in 9:16, con la traccia audio riproducibile e le slide che scorrono.',
          'L’anteprima mostra esattamente ciò che verrà pubblicato: se un testo non comparirà nel post, non compare nemmeno qui.',
        ],
        riferimenti: ['/preview/[id]', 'PostPreview.tsx'],
      },
      {
        n: 13,
        titolo: 'Condivisione col cliente',
        sintesi: 'Un link, senza account.',
        facoltativo: true,
        paragrafi: [
          'Il contenuto si manda via WhatsApp, Telegram o email con un link protetto da token monouso a scadenza. Il cliente vede l’anteprima e approva senza registrarsi.',
        ],
        riferimenti: ['/approve/[token]', 'approval_tokens'],
      },
      {
        n: 14,
        titolo: 'Approva',
        sintesi: 'Cambia lo stato. Non pubblica.',
        manuale: true,
        paragrafi: [
          'Approvare porta il contenuto da Da approvare ad Approvato, e nient’altro. Il trasferimento ai social è un gesto separato e successivo.',
        ],
        nota: {
          grave: true,
          testo: 'Questa separazione è stata pagata. Prima l’approvazione inviava a Blotato nello stesso istante: nove contenuti sono finiti in coda e uno è uscito davvero su Instagram prima che qualcuno se ne accorgesse. Ora i due gesti sono distinti.',
        },
        riferimenti: ['PATCH /api/data/calendario', 'APPROVATO'],
      },
    ],
  },
  {
    id: 'pubblicazione',
    n: '05',
    titolo: 'Montaggio e pubblicazione',
    dove: 'Calendario → Sincronizza',
    sommario: 'L’ultimo tratto: il video viene costruito, rivisto, e solo allora consegnato a Blotato.',
    passi: [
      {
        n: 15,
        titolo: 'Sincronizza Blotato',
        sintesi: 'L’unico punto da cui si esce.',
        manuale: true,
        paragrafi: [
          'Due modi: Sincronizza questo per un singolo contenuto — la via giusta per il primo invio reale — oppure Sincronizza Blotato per tutti gli approvati non ancora inviati.',
          'Un lock di pubblicazione impedisce che due click o un tentativo concorrente creino lo stesso post due volte.',
        ],
        riferimenti: ['/api/data/blotato-sync', 'publish_lock_id'],
      },
      {
        n: 16,
        titolo: 'Montaggio video',
        sintesi: 'Le foto diventano un MP4 verticale.',
        paragrafi: [
          'Se il contenuto è un Reel o una Story con audio, il montaggio parte qui: un browser headless disegna i fotogrammi dalle foto verticali, aggiunge movimento e transizioni, incorpora la traccia audio e produce un MP4 9:16.',
          'Un contenuto già montato con gli stessi ingredienti non viene rifatto: un’impronta degli input evita di rigenerare due volte lo stesso video.',
        ],
        riferimenti: ['Remotion', 'max 90s sorgente', 'blotato_visual_source_hash'],
      },
      {
        n: 17,
        titolo: 'Seconda approvazione del montaggio',
        sintesi: 'Nessun video esce senza essere stato visto.',
        manuale: true,
        paragrafi: [
          'A montaggio pronto il contenuto torna in Da approvare con stato visual_review. Si guarda il video in Preview e si approva una seconda volta.',
          'Vale anche per i media di una cartella già prodotta: le immagini di partenza sono approvate, ma il montaggio è un artefatto nuovo — movimento, durata, audio — e può sbagliare in silenzio.',
        ],
        riferimenti: ['visual_review', 'lib/publish/visual-review.ts'],
      },
      {
        n: 18,
        titolo: 'Consegna a Blotato',
        sintesi: 'Payload costruito sulle regole del canale.',
        paragrafi: [
          'Il testo viene composto per la piattaforma di destinazione con i vincoli reali applicati: massimo 5 hashtag su Instagram, nessun primo commento sulle Story, CTA e link esclusi dalle Story perché non cliccabili, Pagina Facebook sempre risolta e validata.',
          'Un controllo preliminare blocca le combinazioni che la piattaforma non accetta, prima di sprecare la chiamata.',
        ],
        nota: {
          testo: 'Interruttore generale. Con la pubblicazione disattivata il contenuto viene approvato e preparato ma non inviato: serve a collaudare l’intera catena senza pubblicare niente.',
        },
        riferimenti: ['POST /v2/posts', 'PUBLISH_ENABLED', 'dry_run'],
      },
      {
        n: 19,
        titolo: 'Verifica e conservazione',
        sintesi: 'Cosa è uscito davvero, e per quanto resta.',
        paragrafi: [
          'Verifica Blotato interroga la piattaforma e riallinea lo stato reale di ogni invio: pubblicati confermati, in coda, falliti, mancanti. Uno stato scheduled non va mai contato come pubblicato.',
          'La conservazione elimina i contenuti pubblicati dopo un periodo di grazia, insieme ai media che nessun altro contenuto usa. Di ognuno resta un’impronta compatta: poche centinaia di byte che permettono al controllo anti-duplicati di continuare a funzionare.',
        ],
        riferimenti: ['/api/data/blotato-reconcile', '/api/data/retention', 'contenuti_storico'],
      },
    ],
  },
]

export type StatoContenuto = { codice: string; cosa: string; tono: 'neutro' | 'attesa' | 'ok' | 'errore' }

export const STATI: StatoContenuto[] = [
  { codice: 'BOZZA', cosa: 'Appena creato, non ancora lavorato.', tono: 'neutro' },
  { codice: 'IDEA', cosa: 'Spunto in attesa di diventare contenuto.', tono: 'neutro' },
  { codice: 'DA_APPROVARE', cosa: 'Pronto, attende la tua decisione.', tono: 'attesa' },
  { codice: 'APPROVATO', cosa: 'Approvato. Non ancora inviato ai social.', tono: 'ok' },
  { codice: 'PUBBLICATO', cosa: 'Uscito davvero sulla piattaforma.', tono: 'ok' },
  { codice: 'NON_APPROVATO', cosa: 'Scartato: non verrà pubblicato.', tono: 'neutro' },
  { codice: 'ERRORE_MANUALE', cosa: 'Slot incompleto da correggere a mano.', tono: 'errore' },
  { codice: 'ERRORE', cosa: 'Fallimento tecnico durante la lavorazione.', tono: 'errore' },
  { codice: 'ARCHIVIATO', cosa: 'Fuori dal ciclo attivo.', tono: 'neutro' },
]

export const STATI_BLOTATO: { codice: string; cosa: string; pubblicato: string }[] = [
  { codice: 'visual_review', cosa: 'Montaggio pronto, attende la seconda approvazione', pubblicato: 'No' },
  { codice: 'scheduled', cosa: 'In coda su Blotato, uscirà alla data prevista', pubblicato: 'Non ancora' },
  { codice: 'published', cosa: 'Confermato dalla piattaforma, con URL pubblico', pubblicato: 'Sì' },
  { codice: 'failed', cosa: 'Invio rifiutato, motivo salvato sulla riga', pubblicato: 'No' },
]

export const GUARDIE: { nome: string; blocca: string; chi: string }[] = [
  { nome: 'Prima approvazione', blocca: 'Un contenuto non approvato non è inviabile', chi: 'Tu, dal calendario' },
  { nome: 'Invio esplicito', blocca: 'Approvare non pubblica: serve Sincronizza', chi: 'Tu, con un secondo gesto' },
  { nome: 'Revisione del montaggio', blocca: 'Nessun video esce senza essere stato visto', chi: 'Tu, dopo la Preview' },
  { nome: 'Interruttore pubblicazione', blocca: 'Blocca ogni invio reale alla piattaforma', chi: 'Configurazione di sistema' },
  { nome: 'Controllo preliminare', blocca: 'Formati che il canale non accetta', chi: 'Automatico, non superabile' },
  { nome: 'Anti-duplicati', blocca: 'Creatività troppo simile a una già uscita', chi: 'Automatico, si corregge a mano' },
  { nome: 'Lock di pubblicazione', blocca: 'Doppio invio dello stesso contenuto', chi: 'Automatico, non superabile' },
]

export const TOTALE_PASSI = FASI.reduce((somma, fase) => somma + fase.passi.length, 0)
export const TOTALE_MANUALI = FASI.reduce(
  (somma, fase) => somma + fase.passi.filter(p => p.manuale).length,
  0,
)
