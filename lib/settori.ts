import { BLOG_SERVICE } from '@/lib/blog-service'
import { PACCHETTI } from '@/lib/pacchetti'
import { SEGRETARIA_LISTINO } from '@/lib/segretaria-listino'
import { STANDALONE_SERVICES } from '@/lib/standalone-services'

// Landing verticali di settore.
//
// Le pagine dei servizi rispondono a chi cerca lo strumento ("segretaria
// telefonica AI"). Queste rispondono a chi cerca la propria categoria
// ("marketing per autosaloni"): stesso lavoro, raccontato dal problema del
// settore invece che dal nome del prodotto.
//
// I prezzi NON si scrivono qui: si leggono dalle sorgenti uniche dei servizi,
// altrimenti un ritocco di listino lascerebbe indietro quattro pagine.

function canoneStandalone(slug: string): string {
  const servizio = STANDALONE_SERVICES.find(s => s.slug === slug)
  if (!servizio) throw new Error(`Servizio standalone sconosciuto: ${slug}`)
  return `${servizio.displayPrice} ${servizio.cadenceLabel}`
}

function canoneFamiglia(id: 'agenda' | 'voce'): string {
  const famiglia = SEGRETARIA_LISTINO.find(f => f.id === id)
  if (!famiglia) throw new Error(`Famiglia sconosciuta: ${id}`)
  return `da ${Math.min(...famiglia.piani.map(p => p.canone))} € al mese`
}

/** Prezzi d'ingresso, formattati una volta sola per tutte le pagine. */
export const PREZZI = {
  presenza: `${PACCHETTI[0].prezzo} al mese`,
  crescita: `${PACCHETTI[1].prezzo} al mese`,
  web: `${canoneStandalone('web-commerce')}`,
  blog: `${BLOG_SERVICE.displayPrice} al mese`,
  b2b: `${canoneStandalone('lead-pilot')}`,
  voce: canoneFamiglia('voce'),
  agenda: canoneFamiglia('agenda'),
} as const

export type BloccoSettore = { title: string; text: string }
export type PassoSettore = BloccoSettore & { number: string }

export type Settore = {
  slug: string
  /** Nome della categoria, usato nei menu e nell'elenco. */
  nome: string
  /** Una riga per l'elenco dei settori. */
  sommario: string
  titoloSeo: string
  descrizioneSeo: string
  eyebrow: string
  h1: string
  lead: string
  servizio: string
  tipoServizio: string
  promessa: string
  notaPrezzi: string
  segnali: string[]
  risultati: BloccoSettore[]
  cosaTitolo: string
  cosaIntro: string
  cosaFacciamo: BloccoSettore[]
  ciclo: PassoSettore[]
  faq: { q: string; a: string }[]
  correlati: { href: string; label: string }[]
}

export const SETTORI: Settore[] = [
  {
    slug: 'autosaloni',
    nome: 'Autosaloni e concessionarie',
    sommario: 'Ogni veicolo è un annuncio da girare, pubblicare e presidiare al telefono.',
    titoloSeo: 'Marketing per autosaloni e concessionarie | SWA',
    descrizioneSeo:
      'Video e foto dei veicoli girati in salone, social gestiti, sito che raccoglie le richieste e un assistente che risponde al telefono quando sei con un cliente. Prezzi pubblici.',
    eyebrow: 'Autosaloni e concessionarie',
    h1: 'Il parco si vende prima online, poi in salone.',
    lead:
      'Chi cerca un’auto guarda foto e video, confronta e decide chi contattare prima di mettere piede in salone. Noi produciamo quel materiale in modo continuo e ci assicuriamo che, quando la richiesta arriva, qualcuno risponda.',
    servizio: 'Marketing per autosaloni',
    tipoServizio: 'Contenuti, sito, visibilità e risposta telefonica per concessionarie e autosaloni',
    promessa:
      'Un flusso costante di contenuti sui veicoli e sul salone, e una richiesta che non resta senza risposta. Nessuna promessa sul numero di vendite: quelle dipendono da prezzo, stock e trattativa.',
    notaPrezzi: `Riprese in salone su preventivo. Gestione social ${PREZZI.presenza} o ${PREZZI.crescita}. Sito ${PREZZI.web}. Assistente telefonico ${PREZZI.voce}. Prezzi IVA esclusa.`,
    segnali: ['Riprese dei veicoli in salone', 'Richieste raccolte anche fuori orario', 'Contenuti approvati da te prima di uscire'],
    risultati: [
      { title: 'Materiale sempre pronto', text: 'Una sessione di riprese in salone produce il girato e le foto di settimane, non di un veicolo solo.' },
      { title: 'Richieste che non si perdono', text: 'Chi chiama mentre sei in trattativa trova risposta, informazioni e un appuntamento fissato.' },
      { title: 'Un posto dove atterrare', text: 'Le campagne e i post portano su una pagina tua, non solo sulla scheda di un portale.' },
    ],
    cosaTitolo: 'Che cosa facciamo per un salone.',
    cosaIntro:
      'Non vendiamo strumenti da imparare: produciamo il materiale, lo pubblichiamo dopo la tua approvazione e presidiamo il momento in cui il cliente si fa vivo.',
    cosaFacciamo: [
      { title: 'Riprese in salone', text: 'Veniamo con fotografo, luci e ottiche: girato verticale per i social e scatti per annunci e sito, dalla stessa sessione. Su preventivo.' },
      { title: 'Contenuti continui', text: `Piano editoriale, montaggio, copy e pubblicazione su due canali. Piano Presenza ${PREZZI.presenza}, Crescita ${PREZZI.crescita}.` },
      { title: 'Pagina di atterraggio', text: `Una pagina che raccoglie richieste e prenotazioni di prova su strada, collegata a campagne e contenuti. Da ${PREZZI.web}.` },
      { title: 'Chi risponde al telefono', text: `Un assistente risponde su orari, disponibilità e permute, fissa l’appuntamento e passa la chiamata a una persona quando serve. ${PREZZI.voce}.` },
      { title: 'Farsi trovare', text: 'Struttura, intenti di ricerca e leggibilità per i motori e per i sistemi di risposta AI. Su preventivo.' },
      { title: 'Il salone che si vede', text: 'Officina, consegne, ritiri e persone: il materiale che distingue un salone da un elenco di annunci.' },
    ],
    ciclo: [
      { number: '01', title: 'Sopralluogo', text: 'Guardiamo salone, spazi, luce e orari buoni per girare senza fermare le trattative.' },
      { number: '02', title: 'Riprese', text: 'Mezza giornata in salone produce girato verticale e foto per social, annunci e sito.' },
      { number: '03', title: 'Pubblicazione', text: 'Il calendario esce dopo la tua approvazione, sui canali dove sei presente.' },
      { number: '04', title: 'Risposta', text: 'Le richieste che arrivano da post, campagne e telefono trovano una risposta e un appuntamento.' },
    ],
    faq: [
      { q: 'Serve fermare il salone per girare?', a: 'No. In sopralluogo scegliamo le fasce in cui il salone è più tranquillo e giriamo a blocchi. Mezza giornata basta per il materiale di più settimane; la giornata intera serve solo con più location o più persone davanti alla camera.' },
      { q: 'Gestite anche le campagne a pagamento?', a: 'I piani Presenza e Crescita sono di sola crescita organica. Le campagne rientrano nella configurazione personalizzata: la gestione si concorda e il budget versato alla piattaforma resta separato dal canone e sotto il tuo controllo.' },
      { q: 'Pubblicate le schede dei singoli veicoli?', a: 'Produciamo contenuti sul salone e sui veicoli secondo il piano concordato. La pubblicazione massiva del parco su portali o gestionali è un lavoro di integrazione a sé, che quotiamo dopo aver visto quali sistemi usate.' },
      { q: 'L’assistente telefonico sa dare un prezzo?', a: 'Dice solo ciò che hai approvato: servizi, orari, disponibilità e informazioni che carichi tu. Trattative, permute e valutazioni restano a una persona, e la chiamata viene passata secondo le regole che scrivi.' },
      { q: 'Garantite più vendite?', a: 'No, e non lo scriviamo da nessuna parte. Possiamo garantire il processo: materiale prodotto con continuità, pubblicato dopo la tua approvazione, e richieste che non restano senza risposta.' },
    ],
    correlati: [
      { href: '/servizi/video-produzione', label: 'Riprese video in azienda' },
      { href: '/servizi/gestione-social-media', label: 'Gestione social media' },
      { href: '/servizi/segretaria-telefonica-ai', label: 'Segretaria telefonica AI' },
      { href: '/servizi/siti-e-commerce', label: 'Siti web e landing' },
    ],
  },
  {
    slug: 'parrucchieri',
    nome: 'Parrucchieri e barberie',
    sommario: 'Il telefono squilla con le mani occupate e l’agenda ha buchi che nessuno riempie.',
    titoloSeo: 'Marketing e agenda per parrucchieri e barberie | SWA',
    descrizioneSeo:
      'Un assistente che risponde al telefono mentre lavori, i clienti fermi da mesi ricontattati su WhatsApp e i contenuti del salone pubblicati con continuità. Prezzi pubblici.',
    eyebrow: 'Parrucchieri e barberie',
    h1: 'Le mani sono occupate. Il telefono no.',
    lead:
      'In salone una chiamata persa è quasi sempre un appuntamento perso: chi non trova risposta chiama il prossimo nome della lista. E i clienti che diradano non lo dicono, semplicemente non tornano.',
    servizio: 'Marketing e agenda per parrucchieri',
    tipoServizio: 'Risposta telefonica, recupero clienti e contenuti social per saloni di parrucchieri e barberie',
    promessa:
      'Chi chiama trova sempre una risposta e chi non torna da mesi riceve un messaggio scritto bene, che approvi tu. Nessuna promessa sul numero di teste in poltrona.',
    notaPrezzi: `Assistente telefonico ${PREZZI.voce}. Agenda e recupero clienti ${PREZZI.agenda}. Gestione social ${PREZZI.presenza} o ${PREZZI.crescita}. Costi di avvio una tantum indicati prima dell’attivazione. Prezzi IVA esclusa.`,
    segnali: ['Risponde mentre sei con un cliente', 'Nessun messaggio parte senza il tuo sì', 'Contenuti girati in salone'],
    risultati: [
      { title: 'Il telefono non squilla a vuoto', text: 'Anche durante un colore, anche fuori orario, anche nel giorno di chiusura.' },
      { title: 'I buchi si riempiono', text: 'Gli spazi liberi della settimana vengono proposti a chi è già tuo cliente, non a sconosciuti.' },
      { title: 'Il salone si vede', text: 'Prima e dopo, tecniche, prodotti e persone: il materiale esce con continuità, non a ondate.' },
    ],
    cosaTitolo: 'Che cosa facciamo per un salone.',
    cosaIntro:
      'Due problemi diversi, due strumenti diversi: chi ti cerca e non ti trova, e chi ha smesso di cercarti. Si attivano separatamente o insieme.',
    cosaFacciamo: [
      { title: 'Risponde al telefono', text: `Informa su servizi, prezzi e orari che hai approvato tu, legge il calendario e fissa l’appuntamento. ${PREZZI.voce}.` },
      { title: 'Recupera chi non torna', text: `Legge agenda e storico, segnala chi ricontattare con il motivo e prepara i messaggi WhatsApp. ${PREZZI.agenda}.` },
      { title: 'Riempie gli spazi liberi', text: 'Gli spazi rimasti vuoti diventano una proposta a clienti già in archivio, non un buco da subire.' },
      { title: 'Contenuti del salone', text: `Piano editoriale, riprese, montaggio e pubblicazione su due canali. Presenza ${PREZZI.presenza}, Crescita ${PREZZI.crescita}.` },
      { title: 'Riprese in salone', text: 'Fotografo, luci e un volto davanti alla camera se serve: mezza giornata produce il materiale di più settimane. Su preventivo.' },
      { title: 'Farsi trovare in zona', text: 'Struttura del sito, intenti di ricerca e leggibilità per motori e sistemi AI. Su preventivo.' },
    ],
    ciclo: [
      { number: '01', title: 'Avvio', text: 'Raccogliamo servizi, prezzi, orari, regole e ciò che l’assistente non deve mai dire.' },
      { number: '02', title: 'Prova', text: 'Ascolti come risponde e leggi i messaggi tipo, e correggi finché non ti convincono.' },
      { number: '03', title: 'In esercizio', text: 'Le chiamate trovano risposta, i messaggi partono solo dopo il tuo via libera.' },
      { number: '04', title: 'Controllo', text: 'Dal telefono vedi chiamate gestite, appuntamenti fissati e messaggi inviati.' },
    ],
    faq: [
      { q: 'Sostituisce la persona alla reception?', a: 'No. Gestisce le chiamate ripetitive e quelle che altrimenti andrebbero perse. Le richieste delicate o non previste vengono passate a una persona, e le decisioni restano al salone.' },
      { q: 'I messaggi ai clienti partono da soli?', a: 'No. Vengono preparati e restano in bozza finché non li approvi. È una scelta di metodo: un messaggio sbagliato a un cliente storico costa più di un appuntamento.' },
      { q: 'Come vengono contati i minuti?', a: 'Si conta la durata delle conversazioni gestite, non il numero di chiamate. Oltre la soglia i minuti si pagano a consumo alla tariffa del tuo piano, senza rinegoziare il canone.' },
      { q: 'Il cliente capisce che è un assistente?', a: 'Sì, e lo diciamo: si presenta come tale. Nascondere che si parla con un sistema automatico non è una scelta che consigliamo, né dal punto di vista legale né da quello del rapporto con il cliente.' },
      { q: 'Posso attivare solo il telefono?', a: 'Sì. I due servizi sono separati e si attivano uno alla volta. Molti saloni partono dal telefono, che è il buco più evidente, e valutano il recupero clienti dopo.' },
    ],
    correlati: [
      { href: '/servizi/segretaria-telefonica-ai', label: 'Segretaria telefonica AI' },
      { href: '/servizi/agenda-clienti-whatsapp', label: 'Agenda, clienti e WhatsApp' },
      { href: '/servizi/gestione-social-media', label: 'Gestione social media' },
      { href: '/servizi/video-produzione', label: 'Riprese video in azienda' },
    ],
  },
  {
    slug: 'agenzie-immobiliari',
    nome: 'Agenzie immobiliari',
    sommario: 'Ogni immobile è un piccolo lancio, e le richieste arrivano quando sei in visita.',
    titoloSeo: 'Marketing per agenzie immobiliari | SWA',
    descrizioneSeo:
      'Video e foto degli immobili, contenuti social costanti, un sito che raccoglie le richieste e un assistente che risponde mentre sei in visita. Prezzi pubblici.',
    eyebrow: 'Agenzie immobiliari',
    h1: 'Sui portali sei un annuncio. Altrove sei un’agenzia.',
    lead:
      'Sui portali si compete su prezzo e metri quadri, e il nome dell’agenzia conta poco. Fuori dai portali contano il modo in cui racconti gli immobili e la velocità con cui rispondi a chi si fa vivo.',
    servizio: 'Marketing per agenzie immobiliari',
    tipoServizio: 'Contenuti, video, sito e risposta telefonica per agenzie immobiliari',
    promessa:
      'Materiale che presenta gli immobili e l’agenzia con continuità, e richieste che trovano risposta anche mentre sei in visita. Nessuna promessa su incarichi o compravendite.',
    notaPrezzi: `Riprese su preventivo. Gestione social ${PREZZI.presenza} o ${PREZZI.crescita}. Sito ${PREZZI.web}. Assistente telefonico ${PREZZI.voce}. Prezzi IVA esclusa.`,
    segnali: ['Riprese degli immobili e dell’agenzia', 'Richieste raccolte anche in visita', 'Nessun contenuto pubblicato senza il tuo sì'],
    risultati: [
      { title: 'Immobili raccontati', text: 'Girato verticale e scatti dalla stessa sessione: il materiale serve social, annunci e sito.' },
      { title: 'Chiamate presidiate', text: 'Chi chiama durante una visita riceve informazioni e un appuntamento, invece della segreteria.' },
      { title: 'Un nome che resta', text: 'Contenuti costanti sull’agenzia e sulla zona, non solo sul singolo annuncio in scadenza.' },
    ],
    cosaTitolo: 'Che cosa facciamo per un’agenzia.',
    cosaIntro:
      'Il lavoro si divide in due: far vedere bene ciò che hai in mandato, e non perdere chi si fa vivo dopo averlo visto.',
    cosaFacciamo: [
      { title: 'Riprese degli immobili', text: 'Fotografo, luci e ottiche: girato verticale per i social e scatti per annunci e sito, dalla stessa sessione. Su preventivo.' },
      { title: 'Contenuti costanti', text: `Piano editoriale, montaggio, copy e pubblicazione su due canali. Presenza ${PREZZI.presenza}, Crescita ${PREZZI.crescita}.` },
      { title: 'Il sito dell’agenzia', text: `Una pagina o un sito che raccoglie richieste di visita e valutazione, collegato a contenuti e campagne. Da ${PREZZI.web}.` },
      { title: 'Chi risponde in visita', text: `L’assistente informa su orari e disponibilità, fissa l’appuntamento e passa la chiamata quando la richiesta esce dalle regole. ${PREZZI.voce}.` },
      { title: 'Farsi trovare in zona', text: 'Struttura, intenti di ricerca e leggibilità per i motori e per i sistemi di risposta AI. Su preventivo.' },
      { title: 'Articoli sulla zona', text: `Contenuti che rispondono alle domande di chi compra e chi vende. Blog ${PREZZI.blog} per 12 articoli.` },
    ],
    ciclo: [
      { number: '01', title: 'Piano', text: 'Decidiamo che cosa raccontare: immobili, zona, agenzia e persone che ci lavorano.' },
      { number: '02', title: 'Riprese', text: 'Una sessione produce il girato e le foto per social, annunci e sito.' },
      { number: '03', title: 'Uscita', text: 'Il calendario esce dopo la tua approvazione, sui canali dove l’agenzia è presente.' },
      { number: '04', title: 'Richieste', text: 'Chi si fa vivo trova risposta e un appuntamento, anche fuori orario.' },
    ],
    faq: [
      { q: 'Girate anche negli immobili dei proprietari?', a: 'Sì, quando l’accesso e le autorizzazioni ci sono. Spazi, orari e ciò che si può riprendere si concordano nel sopralluogo: le regole e i consensi restano responsabilità dell’agenzia.' },
      { q: 'Vi occupate della pubblicazione sui portali?', a: 'No, quella resta al vostro gestionale. Noi produciamo il materiale e presidiamo i canali dell’agenzia: social, sito e telefono. Un collegamento con il gestionale è un lavoro di integrazione a sé, che quotiamo dopo averlo visto.' },
      { q: 'L’assistente può dare informazioni su un immobile?', a: 'Dice ciò che avete approvato: orari, disponibilità e informazioni generali che caricate voi. Valutazioni, trattative e dati sensibili di un immobile restano a una persona.' },
      { q: 'Chi decide che cosa esce?', a: 'Voi. Nessun contenuto viene pubblicato senza approvazione: lo vedete nel formato reale del canale prima che parta.' },
      { q: 'Garantite più incarichi?', a: 'No. Nessuno può garantire incarichi o compravendite, e non lo scriviamo. Garantiamo il processo: materiale prodotto con continuità e richieste che non restano senza risposta.' },
    ],
    correlati: [
      { href: '/servizi/video-produzione', label: 'Riprese video in azienda' },
      { href: '/servizi/gestione-social-media', label: 'Gestione social media' },
      { href: '/servizi/siti-e-commerce', label: 'Siti web e landing' },
      { href: '/servizi/segretaria-telefonica-ai', label: 'Segretaria telefonica AI' },
    ],
  },
  {
    slug: 'imprese-di-pulizia',
    nome: 'Imprese di pulizia',
    sommario: 'Si vince su preventivi e referenze, mentre le squadre sono in cantiere.',
    titoloSeo: 'Marketing e gestione interventi per imprese di pulizia | SWA',
    descrizioneSeo:
      'Ricerca di aziende clienti verificate, un assistente che risponde mentre le squadre lavorano, il sito che raccoglie le richieste di preventivo e il modulo di intervento tecnico su misura.',
    eyebrow: 'Imprese di pulizia',
    h1: 'Il lavoro è in cantiere. Le richieste arrivano in ufficio.',
    lead:
      'Nelle pulizie si lavora per aziende: si vince con preventivi rapidi, referenze e continuità del servizio. Ma mentre le squadre sono fuori, chi chiede un preventivo trova la segreteria, e i fogli di intervento tornano a fine settimana.',
    servizio: 'Marketing e gestione interventi per imprese di pulizia',
    tipoServizio: 'Ricerca clienti B2B, risposta telefonica, sito e software su misura per imprese di pulizia',
    promessa:
      'Aziende in target da contattare, richieste di preventivo che non restano senza risposta e gli interventi registrati man mano invece che a fine settimana. Nessuna promessa su contratti o appalti.',
    notaPrezzi: `Ricerca clienti B2B ${PREZZI.b2b}. Assistente telefonico ${PREZZI.voce}. Sito ${PREZZI.web}. Modulo di intervento tecnico e integrazioni su preventivo. Prezzi IVA esclusa.`,
    segnali: ['Aziende verificate su fonti pubbliche', 'Richieste raccolte anche fuori orario', 'Interventi registrati sul posto'],
    risultati: [
      { title: 'Clienti da contattare', text: 'Un elenco di aziende coerenti con il tuo cliente ideale, con la fonte e il motivo a fianco.' },
      { title: 'Preventivi presidiati', text: 'Chi chiama per un sopralluogo trova risposta e un appuntamento, non la segreteria.' },
      { title: 'Interventi tracciati', text: 'Che cosa è stato fatto, dove e quando smette di dipendere da un foglio che torna in ufficio.' },
    ],
    cosaTitolo: 'Che cosa facciamo per un’impresa di pulizia.',
    cosaIntro:
      'Qui il marketing conta meno del processo commerciale: trovare le aziende giuste, rispondere in fretta e dimostrare che il servizio è stato fatto.',
    cosaFacciamo: [
      { title: 'Ricerca clienti B2B', text: `Definiamo il cliente ideale e consegniamo fino a 30 aziende verificate su fonti pubbliche, con motivo e priorità. ${PREZZI.b2b}.` },
      { title: 'Chi risponde alle richieste', text: `L’assistente informa, raccoglie la richiesta e fissa il sopralluogo, anche mentre le squadre sono fuori. ${PREZZI.voce}.` },
      { title: 'Il sito che raccoglie', text: `Una pagina costruita per far arrivare richieste di preventivo, con moduli e statistiche di percorso. Da ${PREZZI.web}.` },
      { title: 'Modulo di intervento tecnico', text: 'Software su misura per registrare gli interventi: perimetro, funzioni e costo si definiscono prima di partire.' },
      { title: 'Sistemi collegati', text: 'Gestionale, moduli e archivio smettono di richiedere lo stesso dato tre volte. Su preventivo.' },
      { title: 'Referenze visibili', text: `Contenuti che mostrano cantieri, mezzi e squadre a chi deve affidarti un contratto. Presenza ${PREZZI.presenza}.` },
    ],
    ciclo: [
      { number: '01', title: 'Target', text: 'Definiamo settore, area e criteri di esclusione delle aziende da cercare.' },
      { number: '02', title: 'Elenco', text: 'Consegniamo le aziende verificate, con la fonte pubblica e il motivo di ognuna.' },
      { number: '03', title: 'Risposta', text: 'Le richieste che arrivano trovano un assistente e un sopralluogo fissato.' },
      { number: '04', title: 'Esecuzione', text: 'Gli interventi vengono registrati, e ciò che è stato fatto resta consultabile.' },
    ],
    faq: [
      { q: 'Che cos’è il modulo di intervento tecnico?', a: 'È un software su misura per registrare gli interventi svolti, invece di affidarli a fogli che tornano in ufficio a fine settimana. Perimetro, funzioni e costo vengono definiti e approvati prima di partire, perché dipendono da come lavorate e da quali sistemi avete già.' },
      { q: 'La ricerca clienti comprende i contatti telefonici?', a: 'No. Il Pilot consegna azienda, fonte pubblica, motivo e priorità: un elenco qualificato da lavorare. Non comprende invii automatici, campagne di contatto a freddo né garanzie di appuntamenti o contratti.' },
      { q: 'Dovete sostituire il nostro gestionale?', a: 'No. Se il gestionale funziona resta dov’è: lo colleghiamo agli altri sistemi. Sviluppiamo da zero solo dove lo strumento standard non arriva.' },
      { q: 'L’assistente può fare un preventivo al telefono?', a: 'No. Raccoglie la richiesta, dà le informazioni che avete approvato e fissa il sopralluogo. Il preventivo resta una valutazione vostra, fatta dopo aver visto il luogo.' },
      { q: 'Garantite nuovi contratti?', a: 'No, e non lo scriviamo. Il Pilot è un servizio di ricerca e qualificazione: fornisce un elenco verificato da cui partire, non un risultato commerciale.' },
    ],
    correlati: [
      { href: '/servizi/ricerca-clienti-b2b', label: 'Ricerca Clienti B2B' },
      { href: '/servizi/segretaria-telefonica-ai', label: 'Segretaria telefonica AI' },
      { href: '/servizi/automazione-gestionali', label: 'Automazione e gestionali' },
      { href: '/servizi/siti-e-commerce', label: 'Siti web e landing' },
    ],
  },
  {
    slug: 'centri-estetici',
    nome: 'Centri estetici',
    sommario: 'Il telefono squilla durante i trattamenti e i pacchetti restano a metà.',
    titoloSeo: 'Marketing e agenda per centri estetici | SWA',
    descrizioneSeo:
      'Un assistente che risponde mentre sei in cabina, le clienti con il pacchetto a metà ricontattate su WhatsApp e i contenuti del centro pubblicati con continuità. Prezzi pubblici.',
    eyebrow: 'Centri estetici',
    h1: 'In cabina non si risponde. E chi chiama non richiama.',
    lead:
      'Un trattamento dura un’ora e in quell’ora il telefono resta solo. Intanto le clienti con il pacchetto lasciato a metà non si fanno vive: non sono arrabbiate, si sono solo fermate.',
    servizio: 'Marketing e agenda per centri estetici',
    tipoServizio: 'Risposta telefonica, recupero clienti e contenuti social per centri estetici',
    promessa:
      'Chi chiama trova una risposta anche mentre sei in cabina, e chi ha un percorso interrotto riceve un messaggio che approvi tu. Nessuna promessa sul numero di trattamenti venduti.',
    notaPrezzi: `Assistente telefonico ${PREZZI.voce}. Agenda e recupero clienti ${PREZZI.agenda}. Gestione social ${PREZZI.presenza} o ${PREZZI.crescita}. Costi di avvio una tantum indicati prima dell’attivazione. Prezzi IVA esclusa.`,
    segnali: ['Risponde mentre sei in cabina', 'Nessun messaggio parte senza il tuo sì', 'Contenuti girati in istituto'],
    risultati: [
      { title: 'Nessuna chiamata persa', text: 'Durante i trattamenti, fuori orario e nei giorni di chiusura la risposta arriva comunque.' },
      { title: 'Pacchetti ripresi', text: 'Chi ha lasciato un percorso a metà viene ricontattato con il motivo giusto, non con un messaggio generico.' },
      { title: 'Stagioni presidiate', text: 'I richiami stagionali partono quando servono, non quando qualcuno se ne ricorda.' },
    ],
    cosaTitolo: 'Che cosa facciamo per un centro estetico.',
    cosaIntro:
      'Due buchi diversi: chi ti cerca mentre lavori, e chi si è fermato senza dirtelo. Si attivano separatamente o insieme.',
    cosaFacciamo: [
      { title: 'Risponde al telefono', text: `Informa su trattamenti, prezzi e orari che hai approvato tu, legge il calendario e fissa l’appuntamento. ${PREZZI.voce}.` },
      { title: 'Recupera i percorsi', text: `Legge agenda e storico, segnala chi ha il pacchetto a metà e prepara i messaggi WhatsApp. ${PREZZI.agenda}.` },
      { title: 'Riempie gli spazi', text: 'Le ore rimaste libere diventano una proposta a chi è già cliente, non un buco da subire.' },
      { title: 'Contenuti dell’istituto', text: `Piano editoriale, riprese, montaggio e pubblicazione su due canali. Presenza ${PREZZI.presenza}, Crescita ${PREZZI.crescita}.` },
      { title: 'Riprese in istituto', text: 'Fotografo, luci e un volto davanti alla camera se serve: mezza giornata produce il materiale di più settimane. Su preventivo.' },
      { title: 'Farsi trovare in zona', text: 'Struttura del sito, intenti di ricerca e leggibilità per motori e sistemi AI. Su preventivo.' },
    ],
    ciclo: [
      { number: '01', title: 'Avvio', text: 'Raccogliamo trattamenti, prezzi, orari, regole e ciò che l’assistente non deve mai dire.' },
      { number: '02', title: 'Prova', text: 'Ascolti come risponde e leggi i messaggi tipo, e correggi finché non ti convincono.' },
      { number: '03', title: 'In esercizio', text: 'Le chiamate trovano risposta, i messaggi partono solo dopo il tuo via libera.' },
      { number: '04', title: 'Controllo', text: 'Dal telefono vedi chiamate gestite, appuntamenti fissati e messaggi inviati.' },
    ],
    faq: [
      { q: 'L’assistente può consigliare un trattamento?', a: 'No. Dà le informazioni generali che hai approvato — che cosa offrite, orari, disponibilità — e fissa l’appuntamento. Ogni valutazione su pelle, percorsi o controindicazioni resta a una persona del centro.' },
      { q: 'I messaggi alle clienti partono da soli?', a: 'No. Vengono preparati e restano in bozza finché non li approvi. Un messaggio sbagliato a una cliente storica costa più di un appuntamento.' },
      { q: 'Come vengono contati i minuti?', a: 'Si conta la durata delle conversazioni gestite, non il numero di chiamate. Oltre la soglia i minuti si pagano a consumo alla tariffa del tuo piano, senza rinegoziare il canone.' },
      { q: 'Che fine fanno i dati delle clienti?', a: 'Restano vostri. Noi trattiamo ciò che serve al servizio attivato e non usiamo i materiali dei clienti per addestrare modelli. Le informazioni sensibili non vengono gestite dall’assistente.' },
      { q: 'Posso attivare solo il recupero clienti?', a: 'Sì. I due servizi sono separati. Molti centri partono dal telefono, che è il buco più visibile, e valutano il recupero clienti dopo.' },
    ],
    correlati: [
      { href: '/servizi/segretaria-telefonica-ai', label: 'Segretaria telefonica AI' },
      { href: '/servizi/agenda-clienti-whatsapp', label: 'Agenda, clienti e WhatsApp' },
      { href: '/servizi/gestione-social-media', label: 'Gestione social media' },
      { href: '/servizi/video-produzione', label: 'Riprese video in azienda' },
    ],
  },
  {
    slug: 'cliniche-estetiche',
    nome: 'Cliniche estetiche',
    sommario: 'Prime informazioni, prenotazioni e controlli di percorso, tutti al telefono.',
    titoloSeo: 'Marketing e prenotazioni per cliniche estetiche | SWA',
    descrizioneSeo:
      'Prime informazioni gestite al telefono, prenotazioni e controlli di percorso, contenuti e sito. Le domande cliniche restano al personale sanitario. Prezzi pubblici.',
    eyebrow: 'Cliniche estetiche',
    h1: 'La prima domanda arriva al telefono. La risposta clinica no.',
    lead:
      'In una clinica gran parte delle chiamate è fatta di prime informazioni: che cosa fate, quanto dura, quando c’è posto. Occupano la reception e non richiedono un medico. Tutto il resto sì, e infatti resta a voi.',
    servizio: 'Marketing e prenotazioni per cliniche estetiche',
    tipoServizio: 'Risposta telefonica, prenotazioni, contenuti e sito per cliniche estetiche',
    promessa:
      'Le prime informazioni e le prenotazioni smettono di saturare la reception, e ogni richiesta clinica viene passata a una persona. Nessuna promessa di risultato sanitario o commerciale.',
    notaPrezzi: `Assistente telefonico ${PREZZI.voce}. Agenda e follow-up ${PREZZI.agenda}. Sito ${PREZZI.web}. Gestione social ${PREZZI.presenza} o ${PREZZI.crescita}. Prezzi IVA esclusa.`,
    segnali: ['Nessuna risposta clinica dall’assistente', 'Richieste delicate passate a una persona', 'Contenuti approvati prima di uscire'],
    risultati: [
      { title: 'Reception alleggerita', text: 'Le domande ripetitive vengono gestite, e chi lavora allo sportello torna a occuparsi dei pazienti presenti.' },
      { title: 'Percorsi seguiti', text: 'Controlli e appuntamenti successivi vengono ricordati con un messaggio che approvate voi.' },
      { title: 'Confini chiari', text: 'Ciò che è clinico non viene gestito da un sistema automatico: viene passato a chi ha titolo per rispondere.' },
    ],
    cosaTitolo: 'Che cosa facciamo per una clinica.',
    cosaIntro:
      'Il perimetro conta più della tecnologia: definiamo prima che cosa l’assistente può dire e che cosa deve passare, poi si attiva.',
    cosaFacciamo: [
      { title: 'Prime informazioni', text: `L’assistente risponde su servizi, sedi, orari e disponibilità che avete approvato. ${PREZZI.voce}.` },
      { title: 'Prenotazioni', text: 'Legge il calendario collegato, propone gli orari davvero liberi e salva solo dopo la conferma.' },
      { title: 'Passaggio a una persona', text: 'Le richieste cliniche o non previste vengono trasferite secondo le regole che scrivete voi.' },
      { title: 'Controlli di percorso', text: `Chi deve tornare per un controllo riceve un messaggio preparato e approvato. ${PREZZI.agenda}.` },
      { title: 'Il sito della clinica', text: `Pagine che spiegano i percorsi e raccolgono richieste, con moduli e statistiche. Da ${PREZZI.web}.` },
      { title: 'Contenuti e trasparenza', text: `Materiale prodotto con controllo umano; ciò che è generato dall’AI viene etichettato. Presenza ${PREZZI.presenza}.` },
    ],
    ciclo: [
      { number: '01', title: 'Perimetro', text: 'Decidiamo che cosa l’assistente può dire, e che cosa deve sempre passare a una persona.' },
      { number: '02', title: 'Prova', text: 'Ascoltate come risponde su casi reali e correggete prima di collegare il numero.' },
      { number: '03', title: 'In esercizio', text: 'Prime informazioni e prenotazioni gestite, richieste delicate trasferite.' },
      { number: '04', title: 'Verifica', text: 'Trascrizioni ed esiti restano consultabili: se una risposta non convince, si cambia.' },
    ],
    faq: [
      { q: 'L’assistente dà informazioni mediche?', a: 'No, e non deve. Risponde solo su ciò che avete approvato: servizi offerti, sedi, orari, disponibilità. Qualsiasi domanda clinica, su controindicazioni o su un percorso in corso viene passata a una persona della clinica.' },
      { q: 'Come vengono trattati i dati dei pazienti?', a: 'I dati restano vostri e il titolare del trattamento resta la clinica. Trattiamo solo ciò che serve al servizio attivato, non usiamo i vostri materiali per addestrare modelli, e le registrazioni audio non sono attive di base.' },
      { q: 'Il paziente sa che parla con un assistente?', a: 'Sì, si presenta come tale. Oltre a essere l’impostazione corretta dal punto di vista della trasparenza, evita fraintendimenti in un contesto dove la fiducia conta.' },
      { q: 'Potete gestire più sedi?', a: 'Sì, con percorsi diversi per sede o reparto. Sedi, numeri e collegamenti aggiuntivi vengono quotati separatamente, dopo aver visto come sono organizzati.' },
      { q: 'Fate pubblicità sanitaria?', a: 'Produciamo contenuti secondo le regole che ci indicate e con la vostra approvazione su ogni pezzo. Il rispetto delle norme sulla comunicazione sanitaria resta una responsabilità della clinica, che conosce il proprio inquadramento.' },
    ],
    correlati: [
      { href: '/servizi/segretaria-telefonica-ai', label: 'Segretaria telefonica AI' },
      { href: '/servizi/agenda-clienti-whatsapp', label: 'Agenda, clienti e WhatsApp' },
      { href: '/servizi/siti-e-commerce', label: 'Siti web e landing' },
      { href: '/consulenza', label: 'Consulenza legale AI' },
    ],
  },
  {
    slug: 'studi-dentistici',
    nome: 'Studi dentistici',
    sommario: 'Igieni da richiamare, preventivi mai iniziati e disdette dell’ultimo minuto.',
    titoloSeo: 'Agenda e richiami per studi dentistici | SWA',
    descrizioneSeo:
      'Richiami di igiene, preventivi rimasti fermi e disdette dell’ultimo minuto: un assistente risponde e l’agenda si riempie con messaggi che approvate voi. Prezzi pubblici.',
    eyebrow: 'Studi dentistici',
    h1: 'L’igiene si richiama. Il preventivo, spesso, no.',
    lead:
      'In uno studio il lavoro futuro è già nell’archivio: igieni da richiamare, cure preventivate e mai iniziate, poltrone che si liberano il giorno prima. Serve qualcuno che se ne accorga ogni giorno.',
    servizio: 'Agenda e richiami per studi dentistici',
    tipoServizio: 'Risposta telefonica, richiami e gestione agenda per studi dentistici',
    promessa:
      'Richiami e disdette smettono di dipendere da chi se ne ricorda. Le domande cliniche restano allo studio. Nessuna promessa sul numero di cure accettate.',
    notaPrezzi: `Assistente telefonico ${PREZZI.voce}. Agenda e richiami ${PREZZI.agenda}. Sito ${PREZZI.web}. Costi di avvio una tantum indicati prima dell’attivazione. Prezzi IVA esclusa.`,
    segnali: ['Richiami di igiene preparati ogni giorno', 'Disdette rimpiazzate dall’archivio', 'Nessun messaggio senza approvazione'],
    risultati: [
      { title: 'Richiami che partono', text: 'Chi è in scadenza di igiene viene segnalato con il motivo, e il messaggio è già scritto.' },
      { title: 'Poltrone rimpiazzate', text: 'Una disdetta dell’ultimo minuto diventa una proposta a chi è già in lista, non un’ora persa.' },
      { title: 'Preventivi ripresi', text: 'Le cure preventivate e mai iniziate tornano visibili invece di restare in fondo a un gestionale.' },
    ],
    cosaTitolo: 'Che cosa facciamo per uno studio.',
    cosaIntro:
      'Il valore non è nel messaggio: è nel fatto che qualcuno guardi l’archivio ogni giorno e prepari il lavoro già deciso.',
    cosaFacciamo: [
      { title: 'Risponde al telefono', text: `Prenotazioni, spostamenti e disdette gestiti anche quando la reception è occupata. ${PREZZI.voce}.` },
      { title: 'Richiami di igiene', text: `Ogni giorno il sistema legge agenda e storico e prepara chi va ricontattato, con il motivo. ${PREZZI.agenda}.` },
      { title: 'Rimpiazzo delle disdette', text: 'L’ora che si libera viene proposta a chi è già paziente, con un messaggio pronto da approvare.' },
      { title: 'Preventivi fermi', text: 'Le cure preventivate e non iniziate rientrano fra le priorità del giorno, invece di sparire.' },
      { title: 'Il sito dello studio', text: `Pagine che spiegano i percorsi e raccolgono richieste di prima visita. Da ${PREZZI.web}.` },
      { title: 'Passaggio allo studio', text: 'Dolore, urgenze e domande cliniche vengono trasferiti a una persona secondo le vostre regole.' },
    ],
    ciclo: [
      { number: '01', title: 'Avvio', text: 'Raccogliamo agenda, storico, regole di contatto e tono dei messaggi.' },
      { number: '02', title: 'Prova', text: 'Leggete i messaggi tipo e ascoltate le risposte, e correggete prima di partire.' },
      { number: '03', title: 'Ogni giorno', text: 'Arrivano le priorità del giorno con il motivo di ognuna e i messaggi già scritti.' },
      { number: '04', title: 'Approvazione', text: 'Niente parte senza il vostro sì: l’invio è un gesto separato dalla preparazione.' },
    ],
    faq: [
      { q: 'L’assistente risponde a domande cliniche?', a: 'No. Gestisce prenotazioni, spostamenti, disdette e informazioni generali che avete approvato. Dolore, urgenze e domande cliniche vengono passate a una persona dello studio secondo le regole che scrivete.' },
      { q: 'I richiami partono in automatico?', a: 'No. Vengono preparati con il motivo a fianco e restano in bozza finché non li approvate. È una scelta di metodo: il rapporto con il paziente non si delega a un invio automatico.' },
      { q: 'Serve cambiare gestionale?', a: 'No. Se il gestionale funziona resta dov’è. Collegarlo agli altri sistemi è un lavoro di integrazione che quotiamo dopo aver visto quali interfacce mette a disposizione.' },
      { q: 'Che cosa succede ai dati dei pazienti?', a: 'Restano vostri e il titolare del trattamento resta lo studio. Trattiamo solo ciò che serve al servizio attivato e non usiamo i vostri materiali per addestrare modelli.' },
      { q: 'Quanti messaggi sono compresi?', a: 'Il piano di agenda e richiami comprende 1000 invii al mese. Gli invii oltre soglia si pagano a consumo, e i costi delle piattaforme di messaggistica restano indicati a parte.' },
    ],
    correlati: [
      { href: '/servizi/agenda-clienti-whatsapp', label: 'Agenda, clienti e WhatsApp' },
      { href: '/servizi/segretaria-telefonica-ai', label: 'Segretaria telefonica AI' },
      { href: '/servizi/siti-e-commerce', label: 'Siti web e landing' },
      { href: '/servizi/automazione-gestionali', label: 'Automazione e gestionali' },
    ],
  },
  {
    slug: 'fisioterapia-osteopatia',
    nome: 'Fisioterapia e osteopatia',
    sommario: 'Cicli interrotti a metà e sedute che nessuno riprende.',
    titoloSeo: 'Agenda e richiami per fisioterapia e osteopatia | SWA',
    descrizioneSeo:
      'Cicli lasciati a metà, sedute da fissare e richieste da passare allo studio: un assistente risponde e i richiami arrivano pronti da approvare. Prezzi pubblici.',
    eyebrow: 'Fisioterapia e osteopatia',
    h1: 'Il ciclo si interrompe quando il dolore passa.',
    lead:
      'Un paziente sta meglio dopo tre sedute su sei e sparisce. Non è insoddisfatto: ha smesso di sentire il motivo. Riprendere quel percorso è lavoro già vostro, che nessuno ha il tempo di andare a cercare.',
    servizio: 'Agenda e richiami per fisioterapia e osteopatia',
    tipoServizio: 'Risposta telefonica, richiami e gestione sedute per studi di fisioterapia e osteopatia',
    promessa:
      'Le sedute da fissare e i cicli fermi tornano visibili ogni giorno, con il messaggio già scritto. Nessuna valutazione clinica e nessuna promessa di risultato terapeutico.',
    notaPrezzi: `Assistente telefonico ${PREZZI.voce}. Agenda e richiami ${PREZZI.agenda}. Gestione social ${PREZZI.presenza}. Costi di avvio una tantum indicati prima dell’attivazione. Prezzi IVA esclusa.`,
    segnali: ['Cicli interrotti segnalati ogni giorno', 'Richieste cliniche passate allo studio', 'Messaggi approvati prima dell’invio'],
    risultati: [
      { title: 'Percorsi ripresi', text: 'Chi si è fermato a metà ciclo viene segnalato con il motivo, non pescato a caso.' },
      { title: 'Telefono presidiato', text: 'Chi chiama durante una seduta trova risposta e un orario, invece della segreteria.' },
      { title: 'Agenda più piena', text: 'Le ore libere vengono proposte a chi è già paziente, prima di cercare persone nuove.' },
    ],
    cosaTitolo: 'Che cosa facciamo per uno studio.',
    cosaIntro:
      'Il lavoro più redditizio è già dentro il vostro archivio. Serve qualcosa che lo guardi ogni giorno e prepari il contatto.',
    cosaFacciamo: [
      { title: 'Risponde al telefono', text: `Informa su orari e disponibilità approvati, fissa la seduta e passa allo studio ciò che non è previsto. ${PREZZI.voce}.` },
      { title: 'Cicli da riprendere', text: `Agenda e storico vengono letti ogni giorno: chi si è fermato a metà torna in cima. ${PREZZI.agenda}.` },
      { title: 'Sedute da fissare', text: 'Gli appuntamenti successivi non restano nella memoria di qualcuno: diventano una proposta pronta.' },
      { title: 'Spazi liberi', text: 'Le ore rimaste vuote vengono offerte a pazienti già in archivio, con un messaggio da approvare.' },
      { title: 'Contenuti dello studio', text: `Esercizi, prevenzione e persone che ci lavorano, pubblicati con continuità. Presenza ${PREZZI.presenza}.` },
      { title: 'Farsi trovare in zona', text: 'Struttura del sito, intenti di ricerca e leggibilità per motori e sistemi AI. Su preventivo.' },
    ],
    ciclo: [
      { number: '01', title: 'Avvio', text: 'Raccogliamo agenda, storico, regole di contatto e ciò che non va mai detto.' },
      { number: '02', title: 'Prova', text: 'Leggete i messaggi tipo e ascoltate le risposte prima di collegare il numero.' },
      { number: '03', title: 'Ogni giorno', text: 'Arrivano i cicli interrotti e le sedute da fissare, con il motivo di ognuno.' },
      { number: '04', title: 'Approvazione', text: 'I messaggi partono solo dopo il vostro sì, e resta traccia di che cosa è uscito.' },
    ],
    faq: [
      { q: 'L’assistente dà indicazioni sul trattamento?', a: 'No. Risponde su orari, disponibilità e informazioni generali che avete approvato, e fissa gli appuntamenti. Ogni valutazione sul dolore, sul percorso o sugli esercizi resta a un professionista dello studio.' },
      { q: 'Non è invadente ricontattare chi si è fermato?', a: 'Dipende da come è scritto il messaggio, e per questo lo approvate voi. Il tono e le regole di contatto si definiscono in avvio, e chi non vuole essere ricontattato viene escluso.' },
      { q: 'Serve un gestionale particolare?', a: 'No. Partiamo da agenda e storico come li tenete oggi. Se serve collegarli ad altri sistemi, è un lavoro di integrazione che quotiamo a parte dopo averlo visto.' },
      { q: 'I dati dei pazienti restano nostri?', a: 'Sì. Il titolare del trattamento resta lo studio, trattiamo solo ciò che serve al servizio attivato e non usiamo i vostri materiali per addestrare modelli.' },
      { q: 'Posso partire solo dai richiami?', a: 'Sì. I due servizi sono separati: si può cominciare dal recupero dei cicli fermi e aggiungere il telefono più avanti, senza rifare la configurazione.' },
    ],
    correlati: [
      { href: '/servizi/agenda-clienti-whatsapp', label: 'Agenda, clienti e WhatsApp' },
      { href: '/servizi/segretaria-telefonica-ai', label: 'Segretaria telefonica AI' },
      { href: '/servizi/gestione-social-media', label: 'Gestione social media' },
      { href: '/servizi/seo-geo', label: 'SEO + GEO' },
    ],
  },
  {
    slug: 'officine-e-servizi-locali',
    nome: 'Officine e servizi locali',
    sommario: 'Preventivi, orari e scadenze chiesti al telefono mentre hai le mani nel motore.',
    titoloSeo: 'Marketing e telefono per officine e servizi locali | SWA',
    descrizioneSeo:
      'Un assistente che risponde mentre lavori, tagliandi e scadenze ricordati ai clienti già tuoi, e un sito che raccoglie le richieste di preventivo. Prezzi pubblici.',
    eyebrow: 'Officine e servizi locali',
    h1: 'Chi chiama vuole un orario e un prezzo. Tu hai le mani occupate.',
    lead:
      'In officina il telefono suona nel momento peggiore, e le domande sono quasi sempre le stesse: quando c’è posto, quanto viene, a che ora chiudete. Sono chiamate che non richiedono te, ma che non puoi perdere.',
    servizio: 'Marketing e telefono per officine e servizi locali',
    tipoServizio: 'Risposta telefonica, richiami di scadenza e sito per officine e attività di servizi locali',
    promessa:
      'Le chiamate ripetitive trovano risposta e le scadenze periodiche vengono ricordate ai clienti che hai già. Nessuna promessa sul numero di interventi.',
    notaPrezzi: `Assistente telefonico ${PREZZI.voce}. Agenda e richiami ${PREZZI.agenda}. Sito ${PREZZI.web}. Gestione social ${PREZZI.presenza}. Prezzi IVA esclusa.`,
    segnali: ['Risponde mentre lavori', 'Scadenze ricordate ai clienti tuoi', 'Preventivi raccolti anche fuori orario'],
    risultati: [
      { title: 'Meno telefono, più lavoro', text: 'Le domande su orari, disponibilità e tempi vengono gestite senza fermare l’intervento in corso.' },
      { title: 'Scadenze presidiate', text: 'Tagliandi, revisioni e manutenzioni periodiche tornano visibili prima che il cliente vada altrove.' },
      { title: 'Richieste raccolte', text: 'Chi cerca un preventivo la sera trova una pagina che raccoglie la richiesta, non un numero che non risponde.' },
    ],
    cosaTitolo: 'Che cosa facciamo per un’officina.',
    cosaIntro:
      'Prima si toglie il rumore dal telefono, poi si va a riprendere il lavoro periodico che è già dentro il vostro archivio.',
    cosaFacciamo: [
      { title: 'Risponde al telefono', text: `Orari, disponibilità e informazioni che hai approvato, con appuntamento fissato e passaggio a una persona quando serve. ${PREZZI.voce}.` },
      { title: 'Scadenze periodiche', text: `Tagliandi e manutenzioni ricorrenti vengono segnalati e il messaggio è già pronto da approvare. ${PREZZI.agenda}.` },
      { title: 'Il sito dell’officina', text: `Una pagina che raccoglie richieste di preventivo e appuntamento, con moduli e statistiche. Da ${PREZZI.web}.` },
      { title: 'Farsi trovare in zona', text: 'Struttura, intenti di ricerca locali e leggibilità per motori e sistemi AI. Su preventivo.' },
      { title: 'Il lavoro che si vede', text: `Interventi, mezzi e persone: il materiale che distingue un’officina da un numero di telefono. Presenza ${PREZZI.presenza}.` },
      { title: 'Sistemi collegati', text: 'Gestionale, moduli e archivio smettono di richiedere lo stesso dato più volte. Su preventivo.' },
    ],
    ciclo: [
      { number: '01', title: 'Avvio', text: 'Raccogliamo servizi, orari, regole e le domande che ricevi più spesso.' },
      { number: '02', title: 'Prova', text: 'Ascolti come risponde su casi reali e correggi prima di collegare il numero.' },
      { number: '03', title: 'In esercizio', text: 'Le chiamate trovano risposta e gli appuntamenti finiscono in agenda.' },
      { number: '04', title: 'Scadenze', text: 'Il lavoro periodico viene ricordato ai clienti già tuoi, con il tuo via libera.' },
    ],
    faq: [
      { q: 'L’assistente può fare un preventivo?', a: 'No. Raccoglie la richiesta, dà le informazioni che hai approvato e fissa l’appuntamento. Il preventivo resta una tua valutazione, fatta dopo aver visto il mezzo o il lavoro.' },
      { q: 'Riesce a gestire le chiamate mentre lavoro?', a: 'Sì, è il caso per cui serve: risponde anche quando nessuno può rispondere, e ti lascia trascrizione ed esito della chiamata da leggere quando ti fermi.' },
      { q: 'Come funzionano i richiami delle scadenze?', a: 'Ogni giorno vengono letti agenda e storico, e chi ha una scadenza vicina viene segnalato con il motivo. Il messaggio è pronto, ma parte solo dopo la tua approvazione.' },
      { q: 'Il numero di telefono è compreso?', a: 'No. Numero e traffico dell’operatore restano separati dal canone e vengono indicati nella proposta prima dell’attivazione.' },
      { q: 'Vale anche per attività diverse da un’officina?', a: 'Sì. Il meccanismo è lo stesso per chi lavora su appuntamento e ha scadenze periodiche: impianti, manutenzioni, assistenza tecnica. Cambia che cosa si dice, non come funziona.' },
    ],
    correlati: [
      { href: '/servizi/segretaria-telefonica-ai', label: 'Segretaria telefonica AI' },
      { href: '/servizi/agenda-clienti-whatsapp', label: 'Agenda, clienti e WhatsApp' },
      { href: '/servizi/siti-e-commerce', label: 'Siti web e landing' },
      { href: '/servizi/gestione-social-media', label: 'Gestione social media' },
    ],
  },
]


export function settoreBySlug(slug: string): Settore | undefined {
  return SETTORI.find(s => s.slug === slug)
}
