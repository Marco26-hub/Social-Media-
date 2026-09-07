// Listino della Segretaria AI (prodotto AgendaPiena), unica fonte per la landing
// e per la pagina Pacchetti: due famiglie, cinque piani. Se cambia un prezzo si
// cambia qui, non in due punti che poi divergono.
//
// Tutti i prezzi sono IVA esclusa. I costi telefonici e quelli applicati da Meta
// per i messaggi restano fuori dal canone e vanno indicati a parte: scriverli
// dentro il prezzo li farebbe sembrare compresi.

/** Che cosa comprende il costo di avvio: uguale per tutti i piani, cambia solo
 *  la cifra. Scritto una volta perche e la stessa lavorazione. */
export const SEGRETARIA_AVVIO = {
  titolo: 'Che cosa comprende l’avvio',
  testo:
    'Raccogliamo servizi, prezzi, orari e regole, configuriamo l’assistente, colleghiamo agenda e numero, prepariamo le prove che puoi ascoltare, correggiamo finche non ti convince e mettiamo online in modo controllato.',
  voci: [
    'Raccolta delle informazioni della tua attività',
    'Configurazione di servizi, prezzi, orari e regole',
    'Collegamento di agenda e numero telefonico',
    'Prove ascoltabili prima di attivare',
    'Correzioni fino all’approvazione',
    'Messa online controllata e affiancamento',
  ],
  // Detto in pagina, non solo nella mail di conferma: chi paga deve sapere che
  // il passo successivo e una persona che lo chiama, non un pannello vuoto.
  dopoPagamento:
    'Dopo il pagamento ti contattiamo entro un giorno lavorativo per fissare la call conoscitiva e partire con l’onboarding. Eventuali lavorazioni fuori dalla configurazione standard vengono concordate prima di ogni costo aggiuntivo.',
} as const

export type PianoSegretaria = {
  id: string
  nome: string
  perChi: string
  canone: number
  avvio: string
  soglia: string
  extra: string
  /** Piano messo in evidenza nel listino, con l'etichetta indicata. */
  evidenza?: string
  voci: readonly string[]
}

export type FamigliaSegretaria = {
  id: 'agenda' | 'voce'
  nome: string
  occhiello: string
  descrizione: string
  piani: readonly PianoSegretaria[]
}

export const SEGRETARIA_LISTINO: readonly FamigliaSegretaria[] = [
  {
    id: 'agenda',
    nome: 'Agenda, clienti e WhatsApp',
    occhiello: 'Recupero clienti',
    descrizione:
      'Legge agenda e storico, segnala chi ricontattare e prepara i messaggi. Il titolare decide sempre che cosa parte.',
    piani: [
      {
        id: 'agenda-clienti',
        nome: 'Agenda e clienti',
        perChi: 'Per recuperare clienti e riempire gli spazi liberi',
        canone: 390,
        avvio: '790 € una tantum',
        soglia: '1000 invii inclusi',
        extra: 'Invii oltre soglia 0,10 € ciascuno, oltre agli eventuali costi Meta. Gestionale esterno e pubblicità esclusi.',
        voci: [
          'Controllo giornaliero di clienti, appuntamenti e spazi liberi',
          'Elenco delle priorità, con il motivo di ogni proposta',
          'Messaggi WhatsApp preparati e approvati da una persona prima dell’invio',
          'Pannello da telefono per titolare e personale',
          'Riepilogo di risposte, appuntamenti ottenuti e valore indicato',
          'Controllo mensile di regole e messaggi sui risultati raccolti',
        ],
      },
      {
        id: 'tutto-in-uno',
        nome: 'Tutto in uno',
        perChi: 'Agenda e clienti più la segretaria telefonica',
        canone: 569,
        avvio: 'da 1.190 € una tantum',
        soglia: '300 minuti + 1000 invii',
        extra: 'Oltre soglia 0,40 € al minuto e 0,10 € a invio. Costi Meta, numero e operatore indicati separatamente.',
        voci: [
          'Tutte le funzioni del piano Agenda e clienti',
          '300 minuti di chiamate al mese, circa 100 conversazioni da 3 minuti',
          'Risposta telefonica su servizi, prezzi, orari e regole approvati',
          'Prenotazioni con conferma prima del salvataggio',
          'Passaggio della chiamata a una persona quando serve',
          'Un solo pannello per agenda, messaggi e registro chiamate',
        ],
      },
    ],
  },
  {
    id: 'voce',
    nome: 'Segretaria telefonica AI',
    occhiello: 'Chiamate',
    descrizione:
      'Risponde al telefono, informa sui servizi, controlla l’agenda, fissa appuntamenti e coinvolge il personale quando serve.',
    piani: [
      {
        id: 'voce-base',
        nome: 'Voce Base',
        perChi: 'Per professionisti e piccole attività',
        canone: 199,
        avvio: '590 € una tantum',
        soglia: '300 minuti al mese',
        extra: 'Minuti oltre soglia 0,40 €. Numero e traffico telefonico non inclusi salvo diversa indicazione.',
        voci: [
          '300 minuti al mese, circa 100 conversazioni da 3 minuti',
          'Una segretaria e un numero telefonico collegato',
          'Risposte costruite su servizi, prezzi e orari inseriti nel pannello',
          'Propone gli orari liberi e crea l’appuntamento solo dopo conferma',
          'Inoltra al personale le richieste delicate o non previste',
          'Una lingua a scelta, italiano o inglese',
        ],
      },
      {
        id: 'voce-attivita',
        nome: 'Voce Attività',
        perChi: 'Per studi, saloni, officine e gruppi di lavoro',
        canone: 349,
        avvio: '790 € una tantum',
        soglia: '700 minuti al mese',
        evidenza: 'Più scelto',
        extra: 'Minuti oltre soglia 0,35 €. Audio disattivato di base, attivabile solo con regole privacy adeguate.',
        voci: [
          '700 minuti al mese, circa 230 conversazioni da 3 minuti',
          'Riconosce italiano o inglese e risponde nella lingua di chi chiama',
          'Ricontrolla la disponibilità per evitare appuntamenti sovrapposti',
          'Registro chiamate con trascrizione e riepilogo per il personale autorizzato',
          'Prove scaricabili per verificare le risposte prima di attivare il numero',
          'Controllo mensile su risposte e regole',
        ],
      },
      {
        id: 'voce-azienda',
        nome: 'Voce Azienda',
        perChi: 'Per cliniche, reparti e volumi più alti',
        canone: 649,
        avvio: 'da 990 € una tantum',
        soglia: '1500 minuti al mese',
        extra: 'Minuti oltre soglia 0,30 €. Sedi, numeri, assistenti e sviluppi aggiuntivi quotati separatamente.',
        voci: [
          '1500 minuti al mese, circa 500 conversazioni da 3 minuti',
          'Percorsi per reparto: regole diverse in base alla richiesta',
          'Una segretaria e un numero; assistenti aggiuntivi con proposta separata',
          'Controllo qualità su esiti e conversazioni da rivedere',
          'Collegamenti su misura valutati prima del contratto',
          'Assistenza prioritaria, con tempi e canale scritti nella proposta',
        ],
      },
    ],
  },
]

/** Il canone piu basso del listino: serve alle pagine che dicono "a partire da". */
export const SEGRETARIA_DA = Math.min(
  ...SEGRETARIA_LISTINO.flatMap(f => f.piani.map(p => p.canone)),
)

export const SEGRETARIA_NOTA =
  'Prezzi IVA esclusa. Numero telefonico, traffico dell’operatore, assistenti aggiuntivi e collegamenti speciali non sono inclusi: vengono indicati nella proposta prima dell’attivazione. Nessuna funzione viene attivata senza approvazione.'
