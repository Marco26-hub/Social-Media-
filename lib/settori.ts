import { PREZZI } from '@/lib/prezzi-ingresso'

// Landing verticali di settore.
//
// Le pagine dei servizi rispondono a chi cerca lo strumento ("segretaria
// telefonica AI"). Queste rispondono a chi cerca la propria categoria
// ("marketing per autosaloni"): stesso lavoro, raccontato dal problema del
// settore invece che dal nome del prodotto.
//
// I prezzi arrivano da lib/prezzi-ingresso.ts, che li deriva dalle sorgenti
// uniche dei servizi: nessuna pagina scrive una cifra a mano.

export { PREZZI }

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
    sommario: 'Ogni veicolo è un contenuto e ogni annuncio genera una chiamata da prendere.',
    titoloSeo: 'Marketing per autosaloni e concessionarie | SWA',
    descrizioneSeo:
      'Autosaloni: ogni veicolo diventa un video, il sito raccoglie le richieste e un assistente tiene la linea mentre sei in trattativa. Prezzi pubblici.',
    eyebrow: 'Autosaloni e concessionarie',
    h1: 'Il parco si vende due volte: online e in piazzale.',
    lead:
      'Il video di un veicolo è il primo giro di prova che il cliente fa, e il piano Presenza porta 16 contenuti al mese su ognuno dei 2 canali gestiti. Chi guarda e si convince chiama proprio mentre sei in trattativa con un altro.',
    servizio: 'Marketing per autosaloni',
    tipoServizio: 'Contenuti, sito, visibilità e risposta telefonica per concessionarie e autosaloni',
    promessa:
      'Materiale sul parco prodotto ogni settimana e nessuna richiesta lasciata squillare a vuoto. Sul numero di vendite non prendiamo impegni: dipendono da prezzo, stock e trattativa.',
    notaPrezzi: `Riprese in salone su preventivo. Gestione social ${PREZZI.presenza} o ${PREZZI.crescita}. Sito ${PREZZI.web}. Assistente telefonico ${PREZZI.voce}. Prezzi IVA esclusa.`,
    segnali: ['Riprese girate in piazzale', 'Richieste raccolte a salone chiuso', 'Ogni pezzo montato passa da te'],
    risultati: [
      { title: 'Cosa esce da una sessione', text: 'Una sessione di riprese in piazzale è il magazzino di più settimane, non di un veicolo solo: alimenta i 16 contenuti mensili del piano Presenza. Il fotografo porta luci e ottiche e gira mentre il salone lavora.' },
      { title: 'Quando sei in trattativa', text: 'La chiamata che arriva mentre chiudi un preventivo è coperta dai 300 minuti al mese del piano d’ingresso: orari, disponibilità e allestimenti approvati, poi la prova su strada in agenda. Il resto passa a te.' },
      { title: 'Dove atterrano le campagne', text: `La pagina del salone è il punto in cui una richiesta diventa un contatto tuo e non del portale, con canone ${PREZZI.web} e il progetto che diventa tuo dopo 12 mesi. Le statistiche dicono da dove è arrivata.` },
    ],
    cosaTitolo: 'Che cosa produciamo e che cosa presidiamo.',
    cosaIntro:
      'Il lavoro si divide in due: far vedere il parco a chi non è ancora entrato, e prendere la chiamata di chi ha già guardato. Ogni pezzo esce dopo la tua approvazione, nel formato reale del canale.',
    cosaFacciamo: [
      { title: 'Come si gira in piazzale', text: 'Le riprese in salone sono organizzate in mezze giornate con fotografo, luci e ottiche, e coprono 2 formati: verticale per i social, fotografico per annunci e sito. Quotazione dopo il sopralluogo.' },
      { title: 'Cosa pubblichiamo ogni mese', text: `Il calendario del salone è di 16 contenuti mensili su ogni canale con Presenza (${PREZZI.presenza}) e di 24 con Crescita (${PREZZI.crescita}). Copy, montaggio e pubblicazione su 2 canali sono compresi.` },
      { title: 'Dove finiscono le richieste', text: `La pagina di atterraggio è il modulo che trasforma un video in una richiesta di prova su strada, da ${PREZZI.web} al netto dell’IVA. Moduli, statistiche e collegamento alle campagne sono inclusi.` },
      { title: 'Quando il salone è pieno', text: `L’assistente telefonico è chi tiene la linea quando siete tutti impegnati: canone ${PREZZI.voce} e 300 minuti compresi. Informa, fissa l’appuntamento e passa la chiamata quando la richiesta esce dalle regole.` },
      { title: 'Cosa non dice l’assistente', text: 'Permute, sconti e valutazioni sono fuori dal perimetro caricato nei 300 minuti del piano: l’assistente prende i dati e passa a una persona. Le regole di passaggio le scrivi tu in avvio.' },
      { title: 'Come ci si fa trovare', text: 'Farsi trovare è un lavoro su 3 fronti: struttura delle pagine, intenti di ricerca di chi cerca un usato in zona, leggibilità per motori e sistemi di risposta AI. Su preventivo, dopo audit.' },
      { title: 'Caricamento veicoli automatico', text: 'Le schede dei veicoli entrano nel sito senza ricopiarle: si caricano una volta e si aggiornano da sole quando cambia lo stock.' },
      { title: 'Immagini lavorate in serie', text: 'Le foto dei veicoli vengono ritagliate, uniformate e preparate per annunci e social in un passaggio solo, non una per una.' },
    ],
    ciclo: [
      { number: '01', title: 'Cosa vediamo in sopralluogo', text: 'Il sopralluogo è la mezza giornata in cui misuriamo spazi, luce e orari del piazzale, e scegliamo le 2 fasce in cui si gira senza fermare le trattative. Guardiamo anche officina, consegne e persone: sono il materiale che un portale non ha.' },
      { number: '02', title: 'Come giriamo il parco', text: 'La sessione di ripresa è un blocco unico da mezza giornata: veicoli pronti, fotografo con luci e ottiche, 2 formati raccolti nello stesso passaggio. Da lì escono le settimane di calendario del piano attivo, e in salone non si torna una seconda volta per rifare gli stessi scatti.' },
      { number: '03', title: 'Quando escono i contenuti', text: 'La pubblicazione è programmata sui 2 canali del piano e parte solo dopo che hai visto il pezzo montato. Con Presenza sono 16 uscite mensili per canale, con Crescita 24 più un articolo SEO + GEO. Nessuna uscita a sorpresa.' },
      { number: '04', title: 'Dove arrivano le richieste', text: 'Le richieste di post, campagne e telefono sono raccolte in un punto solo: modulo del sito, registro delle chiamate coperte dai 300 minuti mensili e appuntamenti già fissati. Quelle fuori regola arrivano a una persona del salone, con nome e motivo già annotati.' },
    ],
    faq: [
      { q: 'Come si girano i video dei veicoli senza fermare il salone?', a: `Le riprese sono organizzate a blocchi dentro una mezza giornata, nelle fasce che in sopralluogo risultano più tranquille, e alimentano il calendario del piano Presenza a ${PREZZI.presenza}. Il fotografo arriva con luci e ottiche, gira i veicoli già pronti e si sposta quando entra un cliente. La giornata intera serve solo con più location o più persone davanti alla camera. Il montaggio avviene dopo, e tu vedi il pezzo finito prima della pubblicazione.` },
      { q: 'Quali contenuti servono a un autosalone oltre agli annunci?', a: 'I contenuti che distinguono un salone sono quelli che il portale non ospita: consegne, officina, storia dei mezzi e persone che ci lavorano, 16 al mese per canale con Presenza. L’annuncio dice prezzo e chilometri, il resto racconta con chi si sta trattando. Il calendario si decide insieme e ogni pezzo passa dalla tua approvazione prima di uscire, nel formato reale del canale.' },
      { q: 'Cosa può dire l’assistente telefonico su un veicolo in vendita?', a: 'L’assistente telefonico è limitato alle informazioni che carichi tu — orari, disponibilità, allestimenti, appuntamenti — e lavora sui 300 minuti al mese del piano d’ingresso, 5 ore di conversazioni. Valutazioni di permuta, sconti e trattative non rientrano nel perimetro: la chiamata passa a una persona secondo le regole scritte in avvio. Chi chiama sa dall’inizio di parlare con un assistente, perché non finge di essere un venditore.' },
      { q: 'Quanto costa la gestione dei social per una concessionaria?', a: `La gestione social di una concessionaria è ${PREZZI.presenza} con Presenza e ${PREZZI.crescita} con Crescita, che aggiunge 24 contenuti al mese per canale e un articolo SEO + GEO. Le riprese in piazzale si quotano a parte, perché dipendono da mezzi, spazi e persone da riprendere. I canoni sono al netto dell’IVA e restano pubblici sul sito, senza listini riservati.` },
      { q: 'Come funziona il sito del salone rispetto ai portali di annunci?', a: `Il sito del salone è il posto in cui una richiesta resta tua invece di diventare un contatto del portale, con canone ${PREZZI.web} e il progetto che diventa tuo dopo 12 mesi di canone. I portali servono a farsi trovare, la pagina serve a raccogliere. Moduli e statistiche mostrano quali contenuti hanno portato le richieste, e le campagne atterrano lì invece che su una scheda condivisa con i concorrenti.` },
      { q: 'Perché non garantite un numero di vendite?', a: 'Le vendite non sono un risultato che un fornitore possa garantire: dipendono da prezzo, stock, finanziamenti e da come va la trattativa in salone, non dai 16 contenuti che escono ogni mese. Quello su cui prendiamo un impegno è il processo — materiale prodotto con continuità, pubblicato dopo la tua approvazione, richieste che trovano risposta. Lo scriviamo così anche in proposta, perché una promessa di vendite sarebbe una promessa che nessuno può mantenere.' },
      { q: 'Dove finiscono i contatti raccolti dal sito e dal telefono?', a: 'I contatti raccolti sono vostri e restano nei sistemi del salone: nei 300 minuti mensili l’assistente registra esito e riepilogo della chiamata, mentre l’audio non è attivo di base. Trattiamo solo ciò che serve al servizio attivato e non usiamo i materiali dei clienti per addestrare modelli. Accessi e cancellazioni si chiedono in qualsiasi momento, e la richiesta viene evasa senza costi.' },
      { q: 'Come gestite le campagne a pagamento?', a: 'Le campagne a pagamento sono fuori dai piani Presenza e Crescita, che coprono 2 canali in crescita organica, e rientrano in una configurazione concordata a parte. Il budget versato alla piattaforma resta separato dal canone e sotto il tuo controllo, sui tuoi account pubblicitari. Obiettivi, limiti di spesa e gestione si mettono per iscritto prima di attivare qualsiasi inserzione.' },
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
    sommario: 'Il telefono squilla con le mani nei capelli e chi non trova risposta non richiama.',
    titoloSeo: 'Parrucchieri e barberie: telefono, agenda e social | SWA',
    descrizioneSeo:
      'Parrucchieri: l’assistente risponde mentre hai le mani occupate, i clienti fermi da mesi tornano su WhatsApp e il salone esce ogni settimana.',
    eyebrow: 'Parrucchieri e barberie',
    h1: 'Chi non trova risposta prova il salone dopo.',
    lead:
      'Una chiamata persa in salone è quasi sempre un appuntamento andato altrove, e il piano d’ingresso copre 300 minuti al mese, circa 100 conversazioni da tre minuti. Chi dirada le visite non lo annuncia: smette e basta.',
    servizio: 'Marketing e agenda per parrucchieri',
    tipoServizio: 'Risposta telefonica, recupero clienti e contenuti social per saloni di parrucchieri e barberie',
    promessa:
      'Chi chiama trova una voce anche a mani occupate, e chi non prenota da mesi riceve un messaggio che approvi tu. Sul numero di teste in poltrona non prendiamo impegni.',
    notaPrezzi: `Assistente telefonico ${PREZZI.voce}. Agenda e recupero clienti ${PREZZI.agenda}. Gestione social ${PREZZI.presenza} o ${PREZZI.crescita}. Costi di avvio una tantum indicati prima dell’attivazione. Prezzi IVA esclusa.`,
    segnali: ['Risponde a mani occupate', 'Ogni messaggio lo approvi tu', 'Riprese fra una piega e l’altra'],
    risultati: [
      { title: 'Come non perdere una chiamata', text: 'Il telefono del salone è coperto anche durante un colore, di sera e nel giorno di chiusura, con i 300 minuti al mese del piano base. Chi chiama sente una voce e non tre squilli seguiti dalla segreteria.' },
      { title: 'Quali buchi si riempiono', text: 'Gli spazi vuoti della settimana sono proposti a chi è già cliente del salone, con i 1000 messaggi al mese del piano agenda. Il messaggio arriva su WhatsApp e parte solo se ci metti il sì.' },
      { title: 'Cosa vede chi arriva dai social', text: `Il salone che si vede online è quello che pubblica ogni settimana: il piano Presenza vale ${PREZZI.presenza} e porta 16 uscite al mese su ogni canale. Tagli, colore, mani e persone, non foto d’archivio.` },
    ],
    cosaTitolo: 'Il lavoro che togliamo dalle mani di chi taglia.',
    cosaIntro:
      'Un salone perde clienti in due punti opposti: chi ti cerca mentre lavori e chi ha smesso di cercarti. Sono due strumenti separati, attivabili uno alla volta.',
    cosaFacciamo: [
      { title: 'Come risponde il telefono', text: `Il telefono del salone è un canone, ${PREZZI.voce}, con 300 minuti: l’assistente dice servizi, listino e orari che hai approvato tu, e fissa in agenda mentre sei con un cliente in poltrona.` },
      { title: 'Quali clienti vanno richiamati', text: `Il controllo di ogni giorno è una passata sull’archivio del salone: chi non passa da mesi torna in cima con il suo motivo, e 1000 messaggi al mese sono già nel canone, ${PREZZI.agenda}.` },
      { title: 'Quando la settimana ha un buco', text: 'Il martedì mattina vuoto è una proposta pronta per chi è già in archivio, con il testo che parte solo se ci metti il sì: i 1000 messaggi del mese coprono anche gli spazi liberi, non solo i richiami.' },
      { title: 'Cosa esce sui social', text: `Il piano editoriale del salone è di 16 uscite mensili per canale con Presenza (${PREZZI.presenza}) e di 24 con Crescita (${PREZZI.crescita}). Piano, copy, montaggio e uscita su 2 canali.` },
      { title: 'Come si gira in salone', text: 'Le riprese sono mezze giornate con fotografo e luci, girate fra un cliente e l’altro, da cui escono i verticali di più settimane e gli scatti in 2 formati. Un volto davanti alla camera se serve.' },
      { title: 'Dove ti cercano in zona', text: 'La ricerca locale è fatta di 3 cose: la scheda del salone, le pagine che rispondono a chi cerca un parrucchiere vicino e i testi che i sistemi AI riescono a citare. Su preventivo, dopo audit.' },
    ],
    ciclo: [
      { number: '01', title: 'Cosa raccogliamo', text: 'L’avvio è la raccolta di servizi, listino, orari, regole del salone e delle frasi che l’assistente non deve mai dire, da cui nascono le risposte al telefono e il tono dei 1000 messaggi mensili. Basta una sessione con te: il resto lo prepariamo noi e tu lo correggi.' },
      { number: '02', title: 'Come si prova', text: 'La prova è la fase in cui ascolti come risponde e leggi i messaggi tipo, prima che il numero del salone venga collegato ai 300 minuti del piano. Si corregge finché non ti convince: parole, listino, orari, modo di salutare. Nessuna chiamata reale entra prima del tuo via libera.' },
      { number: '03', title: 'Quando si collega', text: 'L’attivazione è il momento in cui il numero entra in esercizio e i 300 minuti mensili iniziano a coprire le chiamate. I messaggi ai clienti fermi restano in bozza e partono solo dopo il tuo sì, uno a uno o a gruppi.' },
      { number: '04', title: 'Cosa vedi dal telefono', text: 'Il pannello è consultabile dal telefono e mostra chiamate gestite, appuntamenti fissati e messaggi partiti fra i 1000 compresi ogni mese. Ogni mese si rivedono regole e testi sui numeri raccolti, e si cambia ciò che nel tuo salone non ha funzionato.' },
    ],
    faq: [
      { q: 'Come risponde l’assistente mentre sto facendo un colore?', a: `L’assistente telefonico è un numero che risponde al posto tuo quando hai le mani occupate, con 300 minuti al mese compresi nel piano d’ingresso, ${PREZZI.voce}. Dà servizi, listino e orari che hai approvato, legge il calendario e fissa l’appuntamento nello spazio libero. Se la richiesta esce dalle regole, prende i dati e la passa a te, così la richiami quando ti fermi.` },
      { q: 'Quali informazioni può dare al telefono su tagli e prezzi?', a: 'Le informazioni disponibili sono solo quelle che hai caricato tu: elenco dei servizi, prezzi di listino, durata indicativa, orari e giorni di chiusura, più le 2 o 3 risposte che ripeti ogni giorno. Consigli tecnici su colore, decolorazione o cute non vengono dati, perché richiedono di vedere i capelli. In quel caso la chiamata arriva a te con nome e motivo già annotati.' },
      { q: 'Come vengono contati i minuti del piano?', a: 'Il conteggio è sulla durata delle conversazioni gestite, non sul numero di chiamate ricevute: 300 minuti al mese valgono circa 100 conversazioni da tre minuti, cioè 5 ore di telefono. Oltre la soglia i minuti si pagano a consumo alla tariffa del tuo piano, senza rinegoziare il canone. Numero telefonico e traffico dell’operatore restano fuori dal canone e vengono indicati nella proposta.' },
      { q: 'Quando parte un messaggio a un cliente fermo da mesi?', a: 'L’invio è un gesto tuo, separato dalla preparazione: ogni giorno il sistema legge agenda e storico, segnala chi non passa da tempo e prepara il testo, dentro il tetto di 1000 messaggi al mese. Nella nostra esperienza è la regola che protegge di più il rapporto con i clienti storici, perché un messaggio sbagliato costa molto più di un appuntamento. Chi chiede di non essere ricontattato viene escluso dalle liste in modo permanente.' },
      { q: 'Quanto costa attivare solo la risposta telefonica?', a: `Il telefono da solo è ${PREZZI.voce}, con 300 minuti compresi e un costo di avvio una tantum indicato nella proposta prima dell’attivazione. Il recupero clienti su WhatsApp è un servizio separato, ${PREZZI.agenda}, e si aggiunge quando vuoi senza rifare la configurazione. Molti saloni partono dal telefono, che è il buco più visibile, e valutano il resto dopo qualche mese.` },
      { q: 'Come si girano i contenuti senza fermare il salone?', a: `Le riprese sono mezze giornate girate fra un cliente e l’altro, nelle fasce che decidi tu quando fissiamo il sopralluogo, e alimentano il calendario da ${PREZZI.presenza}. Da una sessione escono i verticali di più settimane e gli scatti per la scheda del salone, così il piano non resta scoperto. Chi non vuole comparire non compare: si girano mani, gesti e risultato, senza volti.` },
      { q: 'Dove finiscono i numeri dei clienti del salone?', a: 'I numeri dei clienti sono e restano del salone: vengono usati solo per i contatti che approvi tu, dentro i 1000 messaggi del mese, e non vengono ceduti, rivenduti né impiegati per addestrare sistemi. Il pannello mostra chi è stato contattato, quando e con quale esito, così la cronologia resta verificabile. La cancellazione di un contatto si chiede in qualsiasi momento e viene eseguita senza costi.' },
      { q: 'Cosa succede se il cliente vuole parlare con una persona?', a: 'Il passaggio a te è previsto dalle regole scritte in avvio: l’assistente non insiste, prende nome, numero e motivo entro i 300 minuti del piano e chiude con una promessa di richiamo. Si può impostare come trasferimento immediato negli orari di apertura oppure come nota da leggere a fine giornata. Chi chiama sa di parlare con un assistente, perché lo dice nella prima frase.' },
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
    sommario: 'Ogni immobile è un lancio da preparare e una visita da mettere in agenda.',
    titoloSeo: 'Agenzie immobiliari: contenuti, sito e chiamate | SWA',
    descrizioneSeo:
      'Agenzie immobiliari: ogni immobile diventa un piccolo lancio, il sito prende le richieste di visita e un assistente risponde mentre siete fuori.',
    eyebrow: 'Agenzie immobiliari',
    h1: 'Un immobile alla volta, come si lancia un prodotto.',
    lead:
      'Un immobile in mandato è un lancio breve, non una scheda da caricare, e il piano Presenza pubblica 16 contenuti mensili su ogni canale finché resta in vendita. Chi lo vede si fa vivo mentre siete sul pianerottolo di un altro.',
    servizio: 'Marketing per agenzie immobiliari',
    tipoServizio: 'Contenuti, video, sito e risposta telefonica per agenzie immobiliari',
    promessa:
      'Ogni immobile esce con materiale suo e ogni richiesta di visita trova risposta anche fuori orario. Su incarichi e compravendite non firmiamo garanzie: contano mercato, prezzo e proprietà.',
    notaPrezzi: `Riprese su preventivo. Gestione social ${PREZZI.presenza} o ${PREZZI.crescita}. Sito ${PREZZI.web}. Assistente telefonico ${PREZZI.voce}. Prezzi IVA esclusa.`,
    segnali: ['Sopralluogo con luce naturale', 'Richieste raccolte mentre siete in visita', 'Il calendario lo approvate voi'],
    risultati: [
      { title: 'Come si presenta una casa', text: 'Il sopralluogo fotografico è un passaggio unico che produce 2 formati: verticale per i social e scatti orizzontali per annunci e sito. Stanze in sequenza, luce naturale e i dettagli che una scheda non mostra.' },
      { title: 'Quando siete fuori a mostrare', text: 'La richiesta che arriva durante una visita è raccolta dall’assistente entro i 300 minuti del canone base: informazioni generali, orari e appuntamento fissato. La segreteria telefonica non entra in gioco.' },
      { title: 'Quali domande porta la zona', text: `Chi compra in un quartiere è chi cerca risposte prima ancora dell’immobile: il blog è ${PREZZI.blog} per 12 articoli, con 14 giorni per valutare il servizio. Scuole, spese, tempi fra proposta e rogito.` },
    ],
    cosaTitolo: 'Dal mandato alla visita: che cosa passa a noi.',
    cosaIntro:
      'Un mandato dura poche settimane e in quelle settimane serve tutto insieme: materiale, distribuzione e qualcuno che prenda la chiamata. Il resto del tempo si costruisce il nome dell’agenzia.',
    cosaFacciamo: [
      { title: 'Come si gira un immobile', text: 'Il servizio fotografico è mezza giornata con luci e ottiche, concordata con i proprietari: stanze in sequenza, esterni e dettagli, in 2 formati riutilizzabili su portali, sito e social. Su preventivo.' },
      { title: 'Cosa esce mentre è in vendita', text: `Il calendario dell’agenzia è di 16 pezzi al mese per canale con Presenza (${PREZZI.presenza}) e di 24 con Crescita (${PREZZI.crescita}). Immobili, quartiere e volti di chi accompagna in visita.` },
      { title: 'Dove si prenota una visita', text: `Il sito dell’agenzia è la pagina che raccoglie richieste di visita e di valutazione, con canone ${PREZZI.web} e proprietà dell’agenzia dopo 12 mesi. Moduli, statistiche e collegamento alle campagne.` },
      { title: 'Quando l’ufficio è vuoto', text: `L’assistente telefonico è il presidio delle ore in cui siete tutti fuori: ${PREZZI.voce} e 300 minuti al mese, informazioni approvate e appuntamento a calendario. Il resto passa a un consulente.` },
      { title: 'Quali domande fa chi vende', text: `Gli articoli sul quartiere sono ${PREZZI.blog} per 12 pezzi: prezzi di zona, documenti, tempi, spese condominiali, scritti per chi valuta un mandato. Title, meta e dati strutturati compresi.` },
      { title: 'Come vi trovano nel quartiere', text: 'La visibilità locale consiste in 3 lavori distinti: struttura delle pagine di zona, intenti di chi compra o vende in quel raggio, testi che i sistemi di risposta AI riescono a citare. Su preventivo, dopo audit.' },
      { title: 'Caricamento immobili automatico', text: 'Le schede degli immobili entrano nel sito senza doppio inserimento: si aggiornano quando cambia lo stato del mandato.' },
      { title: 'Immagini lavorate in serie', text: 'Le foto degli immobili vengono uniformate e preparate per annunci, sito e social in un passaggio solo.' },
    ],
    ciclo: [
      { number: '01', title: 'Cosa decidiamo insieme', text: 'Il piano è la lista di che cosa esce nelle prossime 4 settimane: immobili in mandato, quartieri da presidiare, persone dell’agenzia da mostrare. Serve una sola riunione, e da lì il calendario resta visibile in anticipo invece di nascere il giorno prima.' },
      { number: '02', title: 'Come si fotografa', text: 'Il servizio è concordato con i proprietari e dura mezza giornata: luci, ottiche, stanze in sequenza, esterni e dettagli, con 2 formati raccolti nello stesso passaggio. Verticale per i social, orizzontale per annunci e sito: dall’immobile non si esce due volte per gli stessi scatti.' },
      { number: '03', title: 'Quando esce il lancio', text: 'La pubblicazione è concentrata nei giorni in cui l’immobile è nuovo sul mercato, sui 2 canali del piano attivo. Con Presenza escono 16 pezzi al mese per canale, con Crescita 24 più un articolo di quartiere. Niente esce senza che l’abbiate letto.' },
      { number: '04', title: 'Dove arrivano le richieste', text: 'Le richieste sono raccolte in un punto solo — modulo del sito, registro delle chiamate coperte dai 300 minuti mensili, appuntamenti in calendario — invece di restare sparse fra bigliettini e cellulari. Valutazioni e trattative arrivano a un consulente con nome e motivo già annotati.' },
    ],
    faq: [
      { q: 'Come si girano gli immobili senza disturbare i proprietari?', a: 'Il servizio fotografico è concordato prima con la proprietà e occupa una mezza giornata, da cui escono i 2 formati che servono a portali, sito e social. La fascia oraria si sceglie dove la luce naturale rende meglio le stanze; accessi, autorizzazioni e ciò che si può riprendere si fissano nel sopralluogo, e la responsabilità dei consensi resta dell’agenzia. Chi abita l’immobile non deve essere presente, e nulla di personale entra nell’inquadratura.' },
      { q: 'Cosa cambia rispetto alla scheda sul portale?', a: `La scheda del portale è un confronto su prezzo e metri quadri, dove il nome dell’agenzia pesa poco; la pagina vostra da ${PREZZI.web} raccoglie invece un contatto che resta vostro. Sul portale competete con chi ha lo stesso immobile a un prezzo più basso, sui vostri canali competete sul modo in cui lo mostrate. I due lavori convivono: non tocchiamo la pubblicazione sui portali, che resta al vostro gestionale.` },
      { q: 'Quali informazioni dà l’assistente su un immobile?', a: 'Le informazioni ammesse sono quelle generali che caricate voi — disponibilità per le visite, orari, zona, tipologia e stato dell’immobile — dentro i 300 minuti del canone base, cioè 5 ore al mese. Valutazioni, trattative sul prezzo, dati catastali e situazioni condominiali delicate restano a un consulente, e la chiamata viene passata secondo le regole scritte in avvio. Le domande ripetitive sono coperte, le negoziazioni no.' },
      { q: 'Quanto costa il sito di un’agenzia immobiliare?', a: `Il sito base è ${PREZZI.web}, canone che comprende hosting, manutenzione, design responsive e SEO tecnica essenziale, e il progetto passa all’agenzia dopo 12 mesi. Funzioni avanzate, collegamenti al gestionale e sviluppi su misura vengono quotati a parte e approvati prima di ogni costo aggiuntivo. Il dominio resta intestato all’agenzia, così il sito non è mai ostaggio di un fornitore.` },
      { q: 'Come funzionano gli articoli sul quartiere?', a: `Il servizio blog è ${PREZZI.blog} per 12 articoli, con 14 giorni per valutarlo e controllo umano prima della pubblicazione. Gli argomenti nascono da ciò che le persone cercano davvero nella vostra zona: prezzi al metro quadro, documenti per vendere, tempi tra proposta e rogito. Ogni articolo esce con title, meta description, FAQ e dati strutturati già impostati.` },
      { q: 'Cosa approvate voi prima che un contenuto esca?', a: 'L’approvazione è un passaggio su ogni singolo pezzo: vedete il contenuto com’è fatto sul canale, con testo, immagini e didascalia, prima che entri in calendario, e con Presenza sono 16 pezzi al mese per canale. È una routine breve, non una riunione. Chi ha l’ultima parola è sempre l’agenzia, anche a calendario già programmato: un contenuto si ferma finché non convince.' },
      { q: 'Perché non promettete più incarichi?', a: 'Gli incarichi non sono un risultato che dipende da noi: nascono da reputazione, prezzo di partenza, rapporto con il proprietario e andamento del mercato locale, non dai 16 pezzi che escono ogni mese. L’impegno che prendiamo riguarda il processo — materiale prodotto con continuità, uscite programmate, richieste che trovano risposta — ed è quello che scriviamo in proposta. Una promessa di incarichi sarebbe una promessa che nessun fornitore può mantenere.' },
      { q: 'Dove restano i contatti raccolti dal sito?', a: 'I contatti sono di proprietà dell’agenzia e restano nei suoi sistemi, anche prima dei 12 mesi che portano il sito in vostra proprietà: noi trattiamo solo ciò che serve a far funzionare il servizio attivato, e i materiali dell’agenzia non vengono riutilizzati per addestrare nulla. Il modulo registra anche da quale contenuto è arrivata la richiesta, così sapete che cosa ha funzionato. Export e cancellazioni si chiedono quando volete.' },
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
    sommario: 'Si vince su preventivi e referenze, mentre le squadre sono già in cantiere.',
    titoloSeo: 'Imprese di pulizia: clienti B2B e rapporti d’intervento | SWA',
    descrizioneSeo:
      'Imprese di pulizia: fino a 30 aziende verificate da contattare, un assistente che prende le richieste di preventivo e il rapporto firmato in cantiere.',
    eyebrow: 'Imprese di pulizia',
    h1: 'Il lavoro si fa in cantiere, si vende in ufficio.',
    lead:
      `La vendita di un servizio di pulizia è un processo B2B lento, fatto di sopralluoghi e referenze, e il Pilot consegna fino a 30 aziende verificate su fonti pubbliche a ${PREZZI.b2b}. Mentre le squadre sono fuori, chi chiede un preventivo trova la segreteria.`,
    servizio: 'Marketing e gestione interventi per imprese di pulizia',
    tipoServizio: 'Ricerca clienti B2B, risposta telefonica, sito e software su misura per imprese di pulizia',
    promessa:
      'Aziende in target da contattare, richieste di preventivo che trovano risposta e ogni intervento chiuso sul posto con foto e firma. Su contratti e appalti non prendiamo impegni.',
    notaPrezzi: `Ricerca clienti B2B ${PREZZI.b2b}. Assistente telefonico ${PREZZI.voce}. Sito ${PREZZI.web}. Modulo di intervento tecnico e integrazioni su preventivo. Prezzi IVA esclusa.`,
    segnali: ['Sito, modulo e pannello insieme', 'Rapporto firmato dal cliente sul posto', 'Aziende verificate su fonti pubbliche'],
    risultati: [
      { title: 'Quali aziende contattare', text: `Il Pilot è un ciclo di ricerca che consegna fino a 30 aziende coerenti con il vostro cliente ideale, ${PREZZI.b2b}. Ogni riga porta la fonte pubblica, il motivo e la priorità assegnata.` },
      { title: 'Come si prende un preventivo', text: 'La richiesta di sopralluogo è raccolta dall’assistente nei 300 minuti del canone base, anche con le squadre tutte fuori. Prende referente, sede e tipo di servizio, e fissa la visita in calendario.' },
      { title: 'Cosa chiude una contestazione', text: 'Il rapporto d’intervento è il documento che mette insieme checklist, foto, ore e 2 firme, quella dell’operatore e quella del cliente. La discussione su che cosa è stato fatto finisce lì, con un PDF.' },
    ],
    cosaTitolo: 'Trovare, rispondere, dimostrare: il processo completo.',
    cosaIntro:
      'Nelle pulizie il marketing conta meno del processo commerciale: servono aziende giuste da contattare, una risposta rapida e la prova che il lavoro è stato fatto. Sito, modulo d’intervento e pannello di gestione sono montati insieme.',
    cosaFacciamo: [
      { title: 'Come si trovano le aziende', text: `La ricerca B2B è un ciclo da ${PREZZI.b2b} che definisce il cliente ideale e consegna fino a 30 aziende verificate su fonti pubbliche, con motivo e priorità. Nessun invio automatico, nessun contatto a freddo.` },
      { title: 'Quando l’ufficio è vuoto', text: `L’assistente telefonico è il filtro che prende le richieste mentre nessuno è in sede: ${PREZZI.voce} e 300 minuti al mese, con referente, sede e sopralluogo già fissato in agenda.` },
      { title: 'Dove arriva una richiesta', text: `Il sito è la pagina costruita per far arrivare richieste di preventivo, a ${PREZZI.web}, con il progetto che passa all’impresa dopo 12 mesi. Moduli, statistiche di percorso e testi orientati al B2B.` },
      { title: 'Cosa compila la squadra', text: 'Il modulo d’intervento è un’applicazione da telefono con checklist già pronta sul modello del cliente: spunte, note sulle anomalie, foto compresse e 2 firme raccolte sullo schermo.' },
      { title: 'Come esce il rapporto', text: 'Il PDF è generato a fine intervento e parte su 3 canali a scelta — email, WhatsApp o Telegram — senza passare dall’ufficio. Il cliente lo riceve prima che la squadra sia risalita in furgone.' },
      { title: 'Come si contano le ore', text: 'Le ore sono calcolate da entrata, uscita e pausa registrate sul posto: 3 tempi presi dal telefono e il totale è già fatto, senza somme a mano il venerdì sera. Ogni intervento porta con sé il proprio conteggio.' },
      { title: 'Quando un rapporto è contestato', text: 'Lo stato di un rapporto è uno fra 5 valori — bozza, inviato, ricevuto, approvato, contestato — quindi si sa sempre a che punto è. Una contestazione apre una nota scritta, non una telefonata da ricostruire.' },
      { title: 'Cosa vede l’amministratore', text: 'Il pannello è la vista sulla giornata: rapporti, ore, pendenti e contestati, con 4 filtri per data, operatore, cliente e stato. Da lì si approva, si contesta e si gestiscono immobili e squadre.' },
      { title: 'Quali referenze si vedono', text: `Le referenze visibili sono contenuti su cantieri, mezzi e squadre, 16 al mese per canale con il piano Presenza a ${PREZZI.presenza}. Chi affida un appalto vuole vedere chi entra nei suoi locali.` },
      { title: 'Modelli per tipo di intervento', text: 'Ogni tipo di lavoro ha la sua checklist: l’operatore la trova già compilata e spunta, invece di scrivere ogni volta da capo che cosa ha fatto.' },
      { title: 'Come si presenta il marchio', text: 'Nome, logo, colori e tono vengono applicati al sito e alla brochure in PDF, disponibile in 2 lingue: il documento da allegare a un’offerta senza rifarlo ogni volta.' },
      { title: 'In quante lingue esce il sito', text: 'Il sito esce in 7 lingue, con i testi scritti per ognuna e non passati a un traduttore. Privacy, cookie, termini, trattamento dati e cancellazioni sono già scritti e collegati.' },
    ],
    ciclo: [
      { number: '01', title: 'Cosa definiamo', text: 'Il target è la definizione scritta del cliente ideale — settore, area geografica, dimensione, criteri di esclusione — da cui nasce la ricerca delle 30 aziende del Pilot. Basta una call di avvio, e l’elenco non arriva pieno di nomi fuori mercato da scartare a mano.' },
      { number: '02', title: 'Quali aziende consegniamo', text: `L’elenco è la consegna del Pilot a ${PREZZI.b2b}: fino a 30 aziende, ognuna con la fonte pubblica da cui è stata presa, il motivo per cui rientra nel target e la priorità. È una lista qualificata da lavorare, non un archivio comprato altrove.` },
      { number: '03', title: 'Come si risponde', text: 'La risposta è coperta dai 300 minuti mensili dell’assistente, 5 ore di telefono: chi chiama per un preventivo trova una voce, lascia referente e sede e ottiene un sopralluogo in calendario. Le richieste fuori regola arrivano in ufficio con la nota già scritta.' },
      { number: '04', title: 'Dove si chiude l’intervento', text: 'La chiusura è sul posto: checklist spuntata dal telefono, foto allegate, ore calcolate da entrata e uscita, 2 firme raccolte sullo schermo. Il PDF parte via email, WhatsApp o Telegram prima che il furgone riparta dal cantiere, e l’ufficio lo trova già in elenco.' },
    ],
    faq: [
      { q: 'Come funziona il modulo di intervento tecnico?', a: 'Il modulo d’intervento è l’applicazione con cui la squadra chiude il lavoro sul posto: checklist precompilata dal modello del cliente, foto, note sulle anomalie, ore calcolate da entrata e uscita, 2 firme. Alla fine genera il rapporto in PDF e lo invia via email, WhatsApp o Telegram. Si installa sul telefono come un’applicazione e regge anche una connessione lenta, perché le foto vengono compresse prima di partire.' },
      { q: 'Cosa vede chi resta in ufficio?', a: 'Il pannello di gestione è la vista sulla giornata con rapporti, ore, pendenti e contestati, filtrabili su 4 chiavi: data, operatore, cliente e stato. Da lì si approva o si contesta un rapporto, e si gestiscono immobili, clienti, squadre e modelli di checklist. Ogni cambio di stato resta tracciato, quindi non serve ricostruire per telefono chi ha fatto che cosa e quando.' },
      { q: 'Come si può vedere il sistema prima di comprarlo?', a: 'L’esempio è già online e completo: sito, modulo d’intervento e pannello di gestione montati insieme, 3 pezzi costruiti su un’impresa che lavora sul turnover di case in affitto breve. Lo mostriamo durante la call con i dati di prova, e si può navigare come se fosse il vostro. Da lì si capisce che cosa serve davvero alla vostra organizzazione e che cosa no.' },
      { q: 'Quali dati contiene la lista di aziende del Pilot?', a: `Ogni riga della lista è composta da azienda, fonte pubblica, motivo per cui rientra nel target e priorità, per un massimo di 30 aziende a ${PREZZI.b2b}. Non comprende contatti telefonici acquistati, invii automatici né campagne di contatto a freddo, che sono un altro mestiere. È materiale da lavorare con il vostro commerciale, non un risultato commerciale già confezionato.` },
      { q: 'Quanto costa il primo ciclo di ricerca clienti?', a: `Il Pilot è ${PREZZI.b2b}, non un abbonamento, e comprende la definizione del profilo cliente ideale, la ricerca di un massimo di 30 aziende, la verifica delle fonti pubbliche e la lista prioritaria con motivazione. Cicli successivi si valutano solo dopo aver visto come è andato il primo. Sito, assistente telefonico e modulo d’intervento restano servizi separati, con canoni propri.` },
      { q: 'Cosa succede al gestionale che usiamo già?', a: 'Il gestionale che funziona è un sistema da collegare, non da sostituire: resta dov’è e lo mettiamo in comunicazione con gli altri strumenti, mentre sviluppiamo da zero solo dove lo standard non arriva, come nei 3 pezzi del pacchetto. Il collegamento è un lavoro di integrazione a sé, quotato dopo aver visto quali interfacce mette a disposizione. Nella nostra esperienza sostituire un gestionale funzionante è la strada più costosa e meno utile.' },
      { q: 'Perché l’assistente non fa preventivi al telefono?', a: 'Il preventivo di un servizio di pulizia è una valutazione che nasce dal sopralluogo — metri quadri, frequenze, materiali, accessi — e non da 3 domande al telefono. L’assistente raccoglie la richiesta, dà le informazioni che avete approvato e fissa la visita, così la cifra la fate voi dopo aver visto il luogo. Un numero detto al telefono diventa un’aspettativa difficile da correggere.' },
      { q: 'Come funziona la firma del cliente sul rapporto?', a: 'La firma è raccolta sullo schermo del telefono a fine intervento: firma l’operatore e firma il referente del cliente, e le 2 firme entrano nello stesso PDF insieme a checklist, foto e ore. Se il referente non c’è, il rapporto parte comunque e resta in stato inviato finché non viene ricevuto o approvato. Ogni passaggio è registrato con data e ora.' },
    ],
    correlati: [
      { href: '/servizi/gestione-lavorazioni', label: 'Sito e gestione lavorazioni' },
      { href: '/servizi/ricerca-clienti-b2b', label: 'Ricerca Clienti B2B' },
      { href: '/servizi/segretaria-telefonica-ai', label: 'Segretaria telefonica AI' },
      { href: '/servizi/automazione-gestionali', label: 'Automazione e gestionali' },
      { href: '/servizi/siti-e-commerce', label: 'Siti web e landing' },
    ],
  },
  {
    slug: 'centri-estetici',
    nome: 'Centri estetici',
    sommario: 'Il pacchetto lasciato a metà vale più di una cliente nuova da trovare.',
    titoloSeo: 'Centri estetici: percorsi ripresi e telefono coperto | SWA',
    descrizioneSeo:
      'Centri estetici: le clienti con il pacchetto lasciato a metà tornano con un messaggio approvato da te, e il telefono risponde anche dalla cabina.',
    eyebrow: 'Centri estetici',
    h1: 'Il percorso interrotto è lavoro già venduto.',
    lead:
      'Un pacchetto lasciato a metà è un percorso già scelto e mai concluso, e il piano agenda include 1000 invii al mese per riprenderlo. La cabina, intanto, tiene il telefono lontano per un’ora alla volta.',
    servizio: 'Marketing e agenda per centri estetici',
    tipoServizio: 'Risposta telefonica, recupero clienti e contenuti social per centri estetici',
    promessa:
      'Le clienti con un percorso fermo tornano visibili ogni giorno e il telefono risponde anche dalla cabina. Sul numero di trattamenti venduti non prendiamo impegni.',
    notaPrezzi: `Assistente telefonico ${PREZZI.voce}. Agenda e recupero clienti ${PREZZI.agenda}. Gestione social ${PREZZI.presenza} o ${PREZZI.crescita}. Costi di avvio una tantum indicati prima dell’attivazione. Prezzi IVA esclusa.`,
    segnali: ['Risponde con la cabina occupata', 'Percorsi fermi segnalati ogni giorno', 'Testi scritti prima, inviati dopo'],
    risultati: [
      { title: 'Quali percorsi sono fermi', text: 'Il controllo giornaliero è una passata sulle schede che riporta a galla chi ha sedute residue mai prenotate, con i 1000 invii inclusi ogni mese. Ogni nome arriva con il motivo del contatto.' },
      { title: 'Come si copre la cabina', text: 'L’ora di trattamento è il buco in cui nessuno può rispondere: i 300 minuti compresi nel piano base coprono chi chiama in quella fascia. Informazioni approvate, orari liberi e appuntamento fissato.' },
      { title: 'Quando torna la stagione', text: 'I richiami stagionali sono contatti preparati sullo storico con settimane di anticipo, non improvvisati: rientrano nei 1000 invii inclusi e il testo parte quando lo approvi tu, a gruppi o una cliente alla volta.' },
    ],
    cosaTitolo: 'Che cosa entra in cabina e che cosa resta fuori.',
    cosaIntro:
      'Un istituto ha un archivio pieno di percorsi da riprendere e un telefono che nessuno può presidiare. Sono due lavori distinti, e nessuno dei due riguarda la valutazione della pelle.',
    cosaFacciamo: [
      { title: 'Come risponde in cabina', text: `Il telefono in cabina è coperto da un canone, ${PREZZI.voce}, con 300 minuti compresi: trattamenti, durate e prezzi che hai approvato tu, orari liberi e appuntamento salvato dopo conferma.` },
      { title: 'Quali pacchetti sono a metà', text: `Il recupero percorsi è una scansione quotidiana delle schede che segnala le sedute residue mai fissate, con la ragione accanto e 1000 invii inclusi ogni mese nel canone, ${PREZZI.agenda}.` },
      { title: 'Quando la stagione cambia', text: 'Il richiamo stagionale è un contatto costruito sullo storico di ogni cliente e preparato con settimane di anticipo, dentro i 1000 invii inclusi nel mese. Non un testo uguale per tutte, ma il motivo giusto per la persona giusta.' },
      { title: 'Dove finiscono le ore libere', text: 'L’ora che salta è offerta a chi ha già un percorso aperto, con il testo pronto e i 1000 invii inclusi nel mese. Un buco in cabina smette di essere un costo che scopri guardando la settimana chiusa.' },
      { title: 'Cosa esce dall’istituto', text: `Il calendario è di 16 pezzi al mese su ogni canale con Presenza (${PREZZI.presenza}) e di 24 con Crescita (${PREZZI.crescita}). Cabine, mani al lavoro, prodotti e persone, non foto scaricate.` },
      { title: 'Come si gira in istituto', text: 'Il servizio fotografico è concordato a cabine libere, con luci e attrezzatura portate da noi: 2 formati, verticale per i social e scatti per la scheda dell’istituto. Volti solo se lo vuoi. Su preventivo.' },
    ],
    ciclo: [
      { number: '01', title: 'Cosa carichiamo', text: 'Il primo passo è caricare listino, durate, orari, regole dell’istituto e le frasi vietate all’assistente, a partire da qualsiasi consiglio sulla pelle, dentro i 1000 invii inclusi nel piano. Basta un incontro: da quel materiale escono le risposte al telefono e il tono dei richiami.' },
      { number: '02', title: 'Come suonano le prove', text: 'Le prove sono registrazioni che ascolti prima di collegare il numero dell’istituto ai 300 minuti del piano, insieme ai testi tipo dei richiami. Si correggono parole, listino e modo di proporre un orario, finché non somigliano a come parli tu in cabina. Nessuna cliente vera entra prima.' },
      { number: '03', title: 'Quando si accende', text: 'La messa in linea è il passaggio finale: i 300 minuti coprono il telefono anche a cabina occupata e i 1000 invii inclusi aprono i richiami. I messaggi restano fermi in bozza finché non li approvi tu, uno per uno o a gruppi.' },
      { number: '04', title: 'Come si corregge', text: 'Il controllo mensile è la lettura di risposte ricevute, appuntamenti ottenuti e messaggi ignorati sui 1000 invii inclusi, e serve a cambiare le regole che non hanno funzionato. È un passaggio breve, ma è il motivo per cui i richiami stagionali del secondo anno sono più precisi di quelli del primo.' },
    ],
    faq: [
      { q: 'Cosa può dire l’assistente su un trattamento?', a: 'L’assistente è limitato alle informazioni commerciali che hai approvato: che cosa offre l’istituto, quanto dura una seduta, quanto costa a listino, quando c’è posto, entro i 300 minuti del canone base, 5 ore di telefono al mese. Ogni valutazione su pelle, controindicazioni, gravidanza o percorsi in corso resta a una persona del centro, e la chiamata viene passata secondo le regole scritte in avvio. Che si tratti di un assistente viene detto subito, non su richiesta.' },
      { q: 'Come si sceglie chi ricontattare fra le clienti?', a: 'La scelta è guidata dallo storico, non da un elenco casuale: ogni mattina vengono rilette agenda e schede, dentro i 1000 invii inclusi nel piano. Riemergono le clienti con sedute residue mai prenotate, quelle che non passano da un periodo definito da te e quelle con un percorso stagionale aperto. Ogni nome arriva con la ragione accanto, così puoi togliere chi non vuoi contattare prima che parta qualsiasi cosa.' },
      { q: 'Quando parte un richiamo stagionale?', a: 'Il richiamo stagionale è preparato con settimane di anticipo sulla base di ciò che la cliente ha già fatto negli anni precedenti, e parte quando lo approvi tu, dentro i 1000 invii inclusi nel mese. Non è un messaggio unico spedito a tutte: cambia il motivo, e chi non ha mai fatto quel trattamento non lo riceve. Il calendario dei periodi lo decidi tu in avvio e si corregge in qualsiasi momento.' },
      { q: 'Perché i messaggi non partono in automatico?', a: 'L’invio è tenuto separato dalla preparazione per scelta di metodo: il sistema scrive dentro i 1000 invii inclusi, tu decidi che cosa parte. Nella nostra esperienza un messaggio sbagliato a una cliente storica costa molto più di un appuntamento in più, e in un istituto il rapporto personale è metà del servizio. Il testo si può riscrivere, e chi chiede di non essere più contattata viene esclusa in modo permanente.' },
      { q: 'Come funziona il conteggio degli invii WhatsApp?', a: 'Gli invii inclusi sono 1000 al mese, contati come messaggi effettivamente partiti dopo la tua approvazione: le bozze preparate e mai approvate non consumano nulla. Gli invii oltre soglia si pagano a consumo, e i costi applicati dalle piattaforme di messaggistica restano indicati a parte, perché non sono nostri e non li incassiamo noi. Il pannello tiene il conto aggiornato giorno per giorno.' },
      { q: 'Quanto costa attivare solo il recupero clienti?', a: `Il recupero clienti da solo è ${PREZZI.agenda}, con 1000 invii inclusi e una quota di avvio una tantum, indicata prima di attivare. La risposta telefonica resta un servizio a sé, ${PREZZI.voce}, e si aggiunge più avanti senza rifare la configurazione già fatta. I due canoni sono al netto dell’IVA, e nessuna funzione parte senza la tua approvazione scritta.` },
      { q: 'Quali dati delle clienti vengono trattati?', a: 'I dati trattati sono i minimi che il servizio richiede: nome, contatto, storico degli appuntamenti e trattamenti prenotati, più i 1000 invii registrati ogni mese con il loro esito. Restano di proprietà dell’istituto, i vostri contenuti non alimentano l’addestramento di alcun modello, e informazioni sanitarie o particolari non vengono gestite dall’assistente telefonico. Cancellazione ed esportazione si chiedono in qualsiasi momento, senza costi.' },
      { q: 'Quali contenuti si possono girare senza volti?', a: `I contenuti girabili senza volti sono molti: mani al lavoro, prodotti, texture, ambiente e gesti tecnici, ripresi a cabine libere in 2 formati. La sessione si concorda negli orari in cui l’istituto è più tranquillo e alimenta più settimane del calendario da ${PREZZI.presenza}. Clienti e personale compaiono solo se hanno dato il consenso, e la scelta resta tua fino all’ultimo.` },
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
    sommario: 'Prime informazioni e prenotazioni al telefono, le domande cliniche al personale.',
    titoloSeo: 'Cliniche estetiche: reception, prenotazioni e perimetro | SWA',
    descrizioneSeo:
      'Cliniche estetiche: prime informazioni e prenotazioni gestite al telefono, mentre ogni domanda clinica viene passata al personale sanitario.',
    eyebrow: 'Cliniche estetiche',
    h1: 'Prima informazione o domanda clinica: due strade.',
    lead:
      'La prima informazione è la chiamata più ripetuta di una clinica — che cosa fate, quanto dura, quando c’è posto — e il piano più alto arriva a 1500 minuti al mese. La valutazione clinica non passa mai da un sistema automatico.',
    servizio: 'Marketing e prenotazioni per cliniche estetiche',
    tipoServizio: 'Risposta telefonica, prenotazioni, contenuti e sito per cliniche estetiche',
    promessa:
      'Le prime informazioni e le prenotazioni smettono di saturare la reception, e ogni richiesta clinica viene passata a una persona. Nessuna promessa di risultato sanitario o commerciale.',
    notaPrezzi: `Assistente telefonico ${PREZZI.voce}. Agenda e follow-up ${PREZZI.agenda}. Sito ${PREZZI.web}. Gestione social ${PREZZI.presenza} o ${PREZZI.crescita}. Prezzi IVA esclusa.`,
    segnali: ['Nessuna risposta clinica automatica', 'Perimetro scritto prima dell’attivazione', 'Trascrizioni consultabili dal personale'],
    risultati: [
      { title: 'Cosa alleggerisce la reception', text: 'Le domande ripetitive sono la quota di chiamate che non richiede un medico, e i piani coprono da 300 fino a 1500 minuti al mese. Chi è allo sportello torna a occuparsi dei pazienti presenti in sede.' },
      { title: 'Come si separa il clinico', text: 'Il perimetro è una regola scritta prima dell’attivazione: 2 percorsi distinti, uno informativo gestito dall’assistente e uno clinico trasferito a una persona. Nessuna zona grigia lasciata al caso.' },
      { title: 'Quando serve un controllo', text: 'Il controllo di percorso è un promemoria preparato e approvato dalla clinica prima di partire, con i 1000 messaggi mensili previsti dal piano. Chi deve tornare lo sa senza che qualcuno se lo ricordi a mano.' },
    ],
    cosaTitolo: 'Prima il perimetro, poi la tecnologia.',
    cosaIntro:
      'In una clinica la domanda non è che cosa un assistente sappia fare, ma che cosa gli è permesso dire. Il confine si scrive prima dell’attivazione e resta consultabile: il titolare del trattamento dei dati rimane la clinica.',
    cosaFacciamo: [
      { title: 'Quali informazioni dà al telefono', text: `Le prime informazioni sono servizi, sedi, orari e disponibilità approvati dalla direzione, entro i minuti del piano scelto, da 300 a 1500 al mese. Canone ${PREZZI.voce}. Nessun contenuto clinico, mai.` },
      { title: 'Come si prenota una visita', text: 'La prenotazione è fatta sul calendario collegato: l’assistente propone solo gli orari davvero liberi, salva dopo la conferma del paziente e ricontrolla la disponibilità per evitare 2 appuntamenti sovrapposti.' },
      { title: 'Quando passa a una persona', text: 'Il trasferimento a una persona è previsto in 3 casi definiti da voi: domanda clinica, urgenza, richiesta non prevista. L’assistente prende i dati, non improvvisa e non prova a rispondere al posto del personale sanitario.' },
      { title: 'Cosa ricorda un controllo', text: `Il promemoria di controllo è un testo preparato e approvato prima dell’invio, con i 1000 messaggi mensili previsti dal piano, ${PREZZI.agenda}. Il paziente riceve una data, non una comunicazione clinica.` },
      { title: 'Dove atterrano le richieste', text: `Il sito della clinica è l’insieme di pagine che spiegano i percorsi e raccolgono richieste, a ${PREZZI.web}, con il progetto che passa alla clinica dopo 12 mesi. Moduli, statistiche e struttura leggibile.` },
      { title: 'Come si comunica in regola', text: `I contenuti sono prodotti con controllo umano e con la vostra approvazione su ogni pezzo, 16 al mese per canale con Presenza a ${PREZZI.presenza}. Ciò che è generato dall’AI viene etichettato.` },
    ],
    ciclo: [
      { number: '01', title: 'Cosa entra nel perimetro', text: 'Il perimetro è il documento che elenca ciò che l’assistente può dire e ciò che deve trasferire, scritto con la direzione sanitaria prima di configurare i 300 o i 1500 minuti del piano. Servizi, sedi, orari e disponibilità entrano; controindicazioni ed esiti restano fuori.' },
      { number: '02', title: 'Come si prova su casi reali', text: 'Le prove sono conversazioni registrate su casi che la clinica riceve davvero, ascoltabili prima di collegare il numero ai minuti del piano, da 300 a 1500 al mese. Si corregge finché ogni risposta rientra nel perimetro: una frase vicina al confine clinico viene riscritta.' },
      { number: '03', title: 'Quando il numero entra in linea', text: 'L’attivazione è il momento in cui i minuti del piano entrano in esercizio, da 300 a 1500 al mese secondo i volumi della clinica. Prime informazioni e prenotazioni vengono gestite, le richieste cliniche trasferite, e le prime settimane restano sotto osservazione ravvicinata.' },
      { number: '04', title: 'Cosa si rivede ogni mese', text: 'Il controllo mensile è la rilettura di esiti, trascrizioni e conversazioni segnalate dal personale autorizzato, sui minuti effettivamente usati fra i 300 e i 1500 del piano. È il punto in cui una risposta che non convince viene cambiata: la qualità è parte del servizio, non un extra da chiedere.' },
    ],
    faq: [
      { q: 'Cosa risponde l’assistente a una domanda medica?', a: 'La risposta è sempre la stessa: nessuna informazione clinica e passaggio a una persona della clinica, perché la domanda medica è uno dei 3 casi di trasferimento previsti dal perimetro. L’assistente resta dentro i servizi offerti, le sedi, gli orari e le disponibilità che avete approvato, entro i minuti del piano scelto. Domande su controindicazioni, esiti attesi, farmaci o percorsi in corso vengono trasferite senza tentativi di risposta parziale.' },
      { q: 'Come restano protetti i dati dei pazienti?', a: 'Il titolare del trattamento è e resta la clinica, anche quando le sedi collegate sono 2 o più: noi trattiamo solo i dati necessari a far funzionare il servizio attivato, e nessun materiale della clinica viene impiegato per addestrare sistemi. Le registrazioni audio non sono attive di base e possono essere abilitate solo con regole privacy adeguate, decise da voi. Trascrizioni ed esiti restano consultabili dal personale autorizzato.' },
      { q: 'Quali sedi e reparti si possono gestire?', a: 'La gestione multi sede è prevista con percorsi diversi per sede o reparto, fino ai 1500 minuti mensili del piano più alto, 25 ore di conversazioni. Cambiano orari, servizi disponibili e regole di trasferimento, mentre il perimetro clinico resta identico ovunque. Numeri aggiuntivi, assistenti aggiuntivi e collegamenti fra sistemi vengono quotati separatamente, dopo aver visto come siete organizzati.' },
      { q: 'Come sa il paziente che parla con un assistente?', a: 'La trasparenza è una regola di configurazione, non un’opzione lasciata al caso: l’assistente dichiara di essere un sistema automatico nella prima frase della conversazione, prima che il paziente debba chiederlo. In un contesto dove la fiducia pesa quanto il servizio, far credere di parlare con una persona sarebbe un problema di rapporto oltre che di trasparenza. Chi preferisce la reception lo dice e la chiamata viene passata.' },
      { q: 'Quanto costa gestire volumi di chiamate alti?', a: `Il canone è ${PREZZI.voce} per il piano base con 300 minuti compresi e sale con i minuti inclusi, fino ai 1500 mensili del piano pensato per cliniche e reparti. Oltre soglia i minuti si pagano a consumo alla tariffa del piano, senza rinegoziare il contratto. Numero telefonico, traffico dell’operatore e sviluppi su misura restano fuori dal canone e sono indicati nella proposta prima della firma.` },
      { q: 'Quali regole seguono i contenuti pubblicati?', a: `I contenuti sono prodotti secondo le indicazioni che ci date voi e passano dalla vostra approvazione uno per uno, 16 al mese per canale con il piano Presenza a ${PREZZI.presenza}. Ciò che è generato con l’AI viene etichettato come tale, e il controllo umano precede sempre la pubblicazione. Il rispetto delle norme sulla comunicazione sanitaria resta in capo alla clinica, che conosce il proprio inquadramento.` },
      { q: 'Cosa succede a una richiesta urgente?', a: 'L’urgenza è uno dei 3 casi di trasferimento immediato definiti nel perimetro, insieme alla domanda clinica e alla richiesta non prevista. L’assistente non valuta la gravità: riconosce che la richiesta esce dal perimetro, raccoglie i dati essenziali e passa la chiamata secondo le regole che avete scritto. Fuori orario, il percorso di emergenza indicato dalla clinica viene comunicato senza interpretazioni.' },
      { q: 'Dove si controlla che cosa è stato detto?', a: 'Il registro chiamate è consultabile dal personale autorizzato e riporta esito, riepilogo e trascrizione dei minuti usati, da 300 a 1500 al mese secondo il piano. È il punto in cui si verifica se una risposta è rimasta dentro il perimetro, e da lì nascono le correzioni del controllo mensile. Accessi e permessi si assegnano per ruolo, così chi non deve vedere una conversazione non la vede.' },
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
    sommario: 'Igieni da richiamare, preventivi mai iniziati e poltrone liberate all’ultimo.',
    titoloSeo: 'Studi dentistici: richiami di igiene e agenda piena | SWA',
    descrizioneSeo:
      'Studi dentistici: i richiami di igiene e i preventivi fermi tornano in cima ogni giorno, e la poltrona liberata da una disdetta viene riproposta.',
    eyebrow: 'Studi dentistici',
    h1: 'Il lavoro dei prossimi mesi è già nel gestionale.',
    lead:
      'Il richiamo di igiene è lavoro già deciso che aspetta solo un contatto, e il piano agenda mette a disposizione 1000 invii al mese per farlo partire. Un preventivo accettato e mai iniziato resta fermo finché qualcuno non se ne accorge.',
    servizio: 'Agenda e richiami per studi dentistici',
    tipoServizio: 'Risposta telefonica, richiami e gestione agenda per studi dentistici',
    promessa:
      'Richiami, disdette e preventivi fermi smettono di dipendere da chi se ne ricorda. Le domande cliniche restano allo studio e sul numero di cure accettate non prendiamo impegni.',
    notaPrezzi: `Assistente telefonico ${PREZZI.voce}. Agenda e richiami ${PREZZI.agenda}. Sito ${PREZZI.web}. Costi di avvio una tantum indicati prima dell’attivazione. Prezzi IVA esclusa.`,
    segnali: ['Priorità del giorno con il motivo', 'Poltrona libera riproposta subito', 'L’invio è un gesto separato'],
    risultati: [
      { title: 'Quali richiami escono oggi', text: 'Le priorità del giorno sono l’elenco di chi è in scadenza di igiene, con il motivo a fianco e il testo già scritto, dentro i 1000 invii mensili del piano agenda. Nessuna lista da ricostruire a mano.' },
      { title: 'Come si rimpiazza una disdetta', text: 'Un’ora liberata il giorno prima è una proposta immediata a chi è già in lista d’attesa, dentro i 1000 invii compresi nel mese: il testo è pronto e aspetta solo il via libera della segreteria.' },
      { title: 'Cosa resta dei preventivi fermi', text: 'Le cure preventivate e mai iniziate sono la parte più muta del lavoro di uno studio: tornano fra le priorità del giorno con data e motivo, nei 1000 invii del mese, invece di restare in fondo al gestionale.' },
    ],
    cosaTitolo: 'Il lavoro che l’archivio dello studio contiene già.',
    cosaIntro:
      'Uno studio dentistico non ha un problema di visibilità: ha migliaia di righe di storico che nessuno ha il tempo di leggere ogni mattina. Il valore non è nel messaggio, è nel fatto che qualcuno guardi.',
    cosaFacciamo: [
      { title: 'Quando la reception ha la fila', text: `L’assistente telefonico è la linea che regge prenotazioni, spostamenti e disdette con i 300 minuti del canone, ${PREZZI.voce}, mentre allo sportello c’è già un paziente da seguire.` },
      { title: 'Quali igieni sono in scadenza', text: `Il controllo quotidiano è un passaggio sulle scadenze che segnala chi è arrivato alla data decisa da voi, con motivo e testo pronti: 1000 invii compresi nel mese, ${PREZZI.agenda}.` },
      { title: 'Come si copre una disdetta', text: 'L’ora che si libera è una proposta per chi è già paziente e aspetta un posto, con il messaggio scritto e in attesa del vostro sì, dentro i 1000 invii compresi nel mese. La poltrona vuota smette di essere una perdita muta.' },
      { title: 'Cosa succede ai preventivi', text: 'I preventivi accettati e mai iniziati sono riportati fra le priorità del giorno con la data di accettazione, e il contatto rientra nei 1000 invii del mese. Nessuna pressione: un messaggio, e decide il paziente.' },
      { title: 'Dove si chiede una prima visita', text: `Il sito dello studio è l’insieme di pagine che spiegano i percorsi e raccolgono richieste di prima visita, a ${PREZZI.web}: dopo 12 mesi di canone il progetto è dello studio. Moduli e statistiche compresi.` },
      { title: 'Quando passa allo studio', text: 'Dolore, urgenze e domande cliniche sono i 3 casi che escono dal perimetro e vanno a una persona secondo le regole che scrivete voi. L’assistente non interpreta un sintomo: prende i dati e passa, anche fuori orario.' },
    ],
    ciclo: [
      { number: '01', title: 'Cosa leggiamo in avvio', text: 'L’avvio è la raccolta di agenda, storico, scadenze di richiamo, regole di contatto e tono con cui lo studio parla ai pazienti, sui 1000 invii compresi nel mese. Da qui nascono le priorità del mattino: senza regole scritte, un richiamo diventa una promozione qualsiasi.' },
      { number: '02', title: 'Come si tara il tono', text: 'La taratura è la fase in cui leggete i testi tipo e ascoltate le risposte telefoniche dei 300 minuti del canone, e correggete prima che il numero venga collegato. Un richiamo di igiene scritto male suona come una promozione: si riscrive finché non suona come lo studio che lo manda.' },
      { number: '03', title: 'Quali priorità escono ogni giorno', text: 'Le priorità del giorno sono un elenco di 3 tipi: igieni in scadenza, preventivi fermi e poltrone liberate da una disdetta, ognuna con il motivo scritto a fianco. I 1000 invii compresi nel mese coprono il richiamo di uno studio che lavora sul proprio archivio.' },
      { number: '04', title: 'Come si approva un invio', text: 'L’invio è un gesto separato dalla preparazione: i 1000 messaggi compresi nel mese restano in bozza finché la segreteria non dà il via libera, singolarmente o a gruppi. Resta traccia di che cosa è uscito, a chi e con quale esito, così il controllo del mese dopo parte da numeri reali.' },
    ],
    faq: [
      { q: 'Come funzionano i richiami di igiene?', a: 'Il richiamo di igiene è un contatto preparato in automatico e inviato a mano: ogni giorno il sistema legge agenda e storico, individua chi ha raggiunto la scadenza decisa da voi e scrive il messaggio, dentro i 1000 invii del mese. Il motivo resta scritto a fianco di ogni nome, così la segreteria sa perché quella persona è in elenco. Nulla parte prima del via libera, e di ogni invio resta traccia.' },
      { q: 'Cosa risponde l’assistente a chi ha dolore?', a: 'Il dolore è fra i 3 casi che escono immediatamente dal perimetro dell’assistente: nessuna valutazione, nessun consiglio, passaggio a una persona dello studio secondo le regole che avete scritto. Entro i 300 minuti del canone base l’assistente gestisce prenotazioni, spostamenti, disdette e informazioni generali già approvate. Se lo studio è chiuso, comunica le indicazioni che avete predisposto, senza aggiungere interpretazioni proprie.' },
      { q: 'Quando viene riproposta una poltrona libera?', a: 'La riproposta è immediata: appena la disdetta entra in agenda, il sistema individua chi è già paziente e sta aspettando un posto compatibile e prepara il messaggio, dentro i 1000 invii compresi nel mese. La segreteria lo legge e decide se mandarlo, a una persona o a un piccolo gruppo. Nella nostra esperienza è il punto in cui un’ora persa si recupera più spesso, perché la proposta arriva a chi quell’appuntamento lo aveva già chiesto.' },
      { q: 'Quali preventivi vengono ripresi?', a: 'I preventivi ripresi sono quelli accettati e mai iniziati, che restano in fondo al gestionale senza che nessuno li riapra, e rientrano nei 1000 invii del mese come qualsiasi altro richiamo. Tornano fra le priorità del giorno con la data di accettazione e il motivo, così la segreteria decide se contattare il paziente e con quale tono. Nessuna insistenza automatica: la decisione sulla cura resta del paziente e dello studio.' },
      { q: 'Quanto costa il servizio di agenda e richiami?', a: `Il canone è ${PREZZI.agenda} per la parte di agenda e richiami, con 1000 invii compresi nel mese, più un costo di avvio una tantum indicato nella proposta prima dell’attivazione. La risposta telefonica è separata e parte ${PREZZI.voce} con 300 minuti, 5 ore di telefono al mese. I costi applicati dalle piattaforme di messaggistica restano fuori dal canone, perché non li incassiamo noi.` },
      { q: 'Come si collega il gestionale dello studio?', a: 'Il gestionale non è un sistema da cambiare: se funziona resta dov’è, e il collegamento con gli altri strumenti è un lavoro di integrazione quotato dopo aver visto quale delle 2 strade è percorribile, interfaccia diretta o esportazione periodica. Anche le esportazioni sono sufficienti per costruire le priorità del giorno. Nessuna migrazione di archivio viene fatta senza una richiesta esplicita dello studio.' },
      { q: 'Dove restano i dati dei pazienti?', a: 'I dati restano dello studio, che è e rimane titolare del trattamento: quello che passa dai nostri sistemi non finisce in nessun addestramento, e i 1000 invii del mese lasciano traccia di destinatario, testo ed esito. Trattiamo il minimo necessario a far funzionare richiami e risposta telefonica, e ogni accesso è limitato al personale autorizzato. Esportazione e cancellazione si chiedono in qualsiasi momento, senza costi.' },
      { q: 'Quali invii sono compresi ogni mese?', a: 'Il pacchetto compreso è di 1000 invii al mese, contati sui messaggi effettivamente partiti dopo il via libera della segreteria: le bozze preparate e scartate non consumano nulla. Gli invii oltre soglia si pagano a consumo alla tariffa del piano, e i costi delle piattaforme di messaggistica sono indicati separatamente. Per uno studio che lavora su richiami e conferme la soglia copre l’attività ordinaria.' },
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
    sommario: 'Chi sta meglio dopo tre sedute su sei sparisce e nessuno lo richiama.',
    titoloSeo: 'Fisioterapia e osteopatia: cicli ripresi e sedute fissate | SWA',
    descrizioneSeo:
      'Fisioterapia e osteopatia: chi si ferma a metà ciclo torna visibile ogni giorno, con un messaggio pronto che lo studio approva prima dell’invio.',
    eyebrow: 'Fisioterapia e osteopatia',
    h1: 'Sta meglio, quindi smette. Il ciclo resta a metà.',
    lead:
      'Un ciclo interrotto è un percorso che si ferma quando il dolore passa, non quando il lavoro è finito, e il piano agenda lo rimette in cima con 1000 messaggi al mese compresi. Nello studio nessuno ha il tempo di andarlo a cercare a mano.',
    servizio: 'Agenda e richiami per fisioterapia e osteopatia',
    tipoServizio: 'Risposta telefonica, richiami e gestione sedute per studi di fisioterapia e osteopatia',
    promessa:
      'Le sedute da fissare e i cicli fermi tornano visibili ogni giorno, con il testo già scritto. Nessuna valutazione clinica e nessuna promessa di risultato terapeutico.',
    notaPrezzi: `Assistente telefonico ${PREZZI.voce}. Agenda e richiami ${PREZZI.agenda}. Gestione social ${PREZZI.presenza}. Costi di avvio una tantum indicati prima dell’attivazione. Prezzi IVA esclusa.`,
    segnali: ['Cicli fermi segnalati ogni giorno', 'Nessuna parola sul dolore del paziente', 'Il testo lo approva lo studio'],
    risultati: [
      { title: 'Quali cicli sono fermi', text: 'Il ciclo interrotto è un percorso con sedute residue mai prenotate, e ogni giorno torna in cima con la ragione scritta accanto, nel tetto di 1000 messaggi mensili. Nessun nome pescato a caso.' },
      { title: 'Come si copre la seduta', text: 'L’ora sul lettino è il momento in cui il telefono resta scoperto: i 300 minuti del piano d’ingresso coprono chi chiama mentre siete con un paziente. Orari, disponibilità e seduta fissata.' },
      { title: 'Quando l’agenda ha un vuoto', text: 'Un’ora libera è una proposta pronta per chi è già in cura, dentro il tetto di 1000 messaggi al mese e prima di spendere per cercare pazienti nuovi. Il testo resta in bozza e parte dopo il via libera di un professionista.' },
    ],
    cosaTitolo: 'Il percorso che si interrompe da solo.',
    cosaIntro:
      'In fisioterapia il lavoro più redditizio è quello già iniziato: cicli fermi, sedute mai fissate, pazienti che tornerebbero se qualcuno li chiamasse. Serve qualcosa che guardi l’archivio ogni giorno, senza parlare di clinica.',
    cosaFacciamo: [
      { title: 'Quando siete sul lettino', text: `L’assistente telefonico è la voce che risponde durante le sedute: 300 minuti compresi, canone ${PREZZI.voce}. Dà orari, disponibilità e informazioni generali approvate, e fissa dopo la conferma.` },
      { title: 'Quali pazienti tornano in cima', text: `Il controllo giornaliero è il confronto fra sedute previste e prenotate: i cicli fermi riemergono con la ragione accanto, e 1000 messaggi al mese sono nel canone, ${PREZZI.agenda}.` },
      { title: 'Come si fissa la seduta dopo', text: 'L’appuntamento successivo è la cosa che si perde più spesso, perché resta nella memoria di qualcuno: diventa una proposta già scritta, dentro il tetto di 1000 messaggi al mese, che il paziente conferma dal telefono.' },
      { title: 'Dove finiscono le ore libere', text: 'Un buco in agenda è offerto a chi è già in cura e ha un ciclo aperto, con un testo pronto da approvare nel tetto di 1000 messaggi mensili. Lo studio recupera l’ora prima di investire per trovare un paziente nuovo.' },
      { title: 'Cosa pubblica lo studio', text: `Il calendario è di 16 pubblicazioni mensili per canale con Presenza, ${PREZZI.presenza}: esercizi, prevenzione, attrezzatura e persone che lavorano in studio. Copy e montaggio compresi.` },
      { title: 'Dove vi cercano i pazienti', text: 'Farsi trovare in zona significa 3 interventi: struttura delle pagine, intenti di chi cerca un fisioterapista vicino e leggibilità per i sistemi di risposta AI. Su preventivo, dopo un audit di quelle esistenti.' },
    ],
    ciclo: [
      { number: '01', title: 'Quali dati servono', text: 'L’avvio è la raccolta di agenda, storico delle sedute, regole di contatto e argomenti che non vanno mai toccati, a partire da qualsiasi riferimento clinico. Bastano gli strumenti che usate oggi: non serve cambiare software per i 1000 messaggi mensili del piano.' },
      { number: '02', title: 'Come suona la prova', text: 'La prova è l’ascolto delle risposte telefoniche e la lettura dei testi tipo, prima che il numero dello studio entri in linea sui 300 minuti del piano. Si corregge finché il tono somiglia a quello di chi accoglie in reception: nessun paziente reale entra nella fase di prova.' },
      { number: '03', title: 'Cosa arriva ogni mattina', text: 'Le priorità del mattino sono 3 elenchi: cicli interrotti, sedute da fissare e ore rimaste vuote, ognuno con la ragione scritta accanto. I 1000 messaggi mensili compresi coprono il richiamo ordinario di chi lavora sull’archivio che ha già, senza comprare liste da nessuno.' },
      { number: '04', title: 'Quando parte un messaggio', text: 'L’invio è subordinato al via libera di un professionista dello studio, e di ogni messaggio fra i 1000 mensili resta traccia: destinatario, motivo, testo, esito. Chi chiede di non essere più contattato viene escluso in modo permanente, senza dover ripetere la richiesta.' },
    ],
    faq: [
      { q: 'Come si accorge il sistema che un ciclo è interrotto?', a: 'Il ciclo interrotto è riconosciuto dal confronto fra le sedute previste e quelle effettivamente prenotate: se restano sedute residue e non c’è un appuntamento futuro, il paziente torna fra le priorità del giorno, dentro il tetto di 1000 messaggi mensili. Il controllo gira ogni giorno sull’archivio dello studio, non su liste esterne, e la ragione del contatto resta scritta accanto a ogni nome. Chi ha concluso il percorso non viene segnalato.' },
      { q: 'Cosa può dire l’assistente sul dolore di un paziente?', a: 'L’assistente è fuori dal perimetro clinico per costruzione: risponde su orari, disponibilità, sedi e informazioni generali che avete approvato, entro i 300 minuti del piano d’ingresso, e fissa gli appuntamenti. Valutazioni sul dolore, sull’andamento del percorso, sugli esercizi da fare a casa o sulla necessità di una visita restano a un professionista dello studio. La chiamata viene passata secondo le regole scritte in avvio.' },
      { q: 'Quando è il momento giusto per ricontattare?', a: 'Il momento è una regola che decidete voi in avvio: dopo quanti giorni un ciclo fermo va segnalato, entro il tetto mensile di 1000 messaggi, in quali fasce orarie si scrive e in quali casi è meglio lasciar perdere. Il sistema propone, non decide: prepara il testo e lo mette in coda, e un professionista sceglie se e quando inviarlo. Nella nostra esperienza il messaggio funziona quando ricorda un percorso concordato, non quando somiglia a un’offerta.' },
      { q: 'Quali regole di contatto restano allo studio?', a: 'Le regole sono tutte vostre e scritte prima dell’attivazione: chi si può contattare, dopo quanto tempo, con quale tono, in quali fasce orarie e chi va escluso in modo permanente, e ogni scelta vale su tutti i 1000 messaggi del mese. Il testo resta in bozza finché non lo approvate, e ogni invio lascia traccia di destinatario, motivo ed esito. Cambiare una regola richiede una richiesta, non una riconfigurazione a pagamento.' },
      { q: 'Quanto costa partire solo dai richiami?', a: `Il piano di agenda e richiami è ${PREZZI.agenda} con 1000 messaggi mensili compresi, più un avvio una tantum scritto nella proposta prima dell’attivazione. La risposta telefonica è un servizio separato, ${PREZZI.voce}, con 300 minuti al mese: 5 ore di conversazioni, aggiungibili in seguito senza rifare la configurazione già pagata. I canoni sono al netto dell’IVA.` },
      { q: 'Chi è il titolare dei dati dei pazienti?', a: 'Il titolare del trattamento è lo studio, sempre: i dati dei pazienti restano vostri, trattiamo solo il minimo che il servizio richiede e niente di ciò che passa dai nostri sistemi viene riutilizzato per addestrare modelli. Informazioni cliniche o diagnostiche non entrano nei messaggi, che parlano di appuntamenti e di percorsi già concordati. Esportazione e cancellazione si chiedono in qualsiasi momento.' },
      { q: 'Cosa serve come gestionale per partire?', a: 'Il gestionale non è un requisito per partire: si parte da agenda e storico come li tenete oggi, anche se sono divisi fra 2 strumenti diversi. Se in seguito volete collegare i sistemi fra loro, è un lavoro di integrazione che quotiamo dopo averlo visto, e resta facoltativo. Cambiare software per attivare un servizio di richiami è quasi sempre una spesa che si può evitare.' },
      { q: 'Quali contenuti pubblica uno studio di fisioterapia?', a: `I contenuti utili sono quelli che spiegano il lavoro senza dare indicazioni terapeutiche: esercizi generici di prevenzione, attrezzatura, percorsi tipo, persone che lavorano in studio, 16 pubblicazioni al mese per canale con Presenza, ${PREZZI.presenza}. Ogni pezzo passa dalla vostra approvazione prima di uscire. Ciò che riguarda casi singoli o risultati clinici resta fuori dal calendario editoriale.` },
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
    sommario: 'Orari, preventivi e scadenze chiesti al telefono mentre lavori sul mezzo.',
    titoloSeo: 'Officine e servizi locali: telefono e scadenze | SWA',
    descrizioneSeo:
      'Officine e servizi locali: l’assistente risponde mentre sei sotto il ponte, i tagliandi in scadenza tornano visibili e il sito raccoglie i preventivi.',
    eyebrow: 'Officine e servizi locali',
    h1: 'Il telefono suona sempre nel momento peggiore.',
    lead:
      'La chiamata tipo di un’officina è fatta di tre domande — quando c’è posto, quanto viene, a che ora chiudete — e 300 minuti al mese ne coprono circa 100. Nessuna richiede te, ma nessuna si può perdere.',
    servizio: 'Marketing e telefono per officine e servizi locali',
    tipoServizio: 'Risposta telefonica, richiami di scadenza e sito per officine e attività di servizi locali',
    promessa:
      'Le chiamate ripetitive trovano risposta e le scadenze periodiche tornano visibili prima che il cliente vada altrove. Sul numero di interventi non prendiamo impegni.',
    notaPrezzi: `Assistente telefonico ${PREZZI.voce}. Agenda e richiami ${PREZZI.agenda}. Sito ${PREZZI.web}. Gestione social ${PREZZI.presenza}. Prezzi IVA esclusa.`,
    segnali: ['Risponde con il mezzo sul ponte', 'Scadenze ricordate ai clienti tuoi', 'Preventivi raccolti anche di notte'],
    risultati: [
      { title: 'Come si risponde sotto il ponte', text: 'Le domande su orari, disponibilità e tempi sono gestite senza fermare l’intervento in corso, dentro i 300 minuti del canone base. Il mezzo resta sul ponte e la chiamata trova comunque una voce.' },
      { title: 'Quali scadenze tornano visibili', text: 'Tagliandi, revisioni e manutenzioni periodiche sono lavoro già tuo che torna in cima alla lista prima che scada, con il plafond di 1000 invii del piano agenda. Il promemoria aspetta il tuo ok per partire.' },
      { title: 'Dove arriva un preventivo di sera', text: `La richiesta delle 22 è raccolta dal sito, che è online a ${PREZZI.web}, e dopo 12 mesi di canone il progetto è tuo. Chi cerca un preventivo trova un modulo, non un numero che squilla a vuoto.` },
    ],
    cosaTitolo: 'Prima il rumore, poi il lavoro che torna.',
    cosaIntro:
      'In officina si comincia togliendo il rumore dal telefono, perché è il costo più evidente della giornata. Poi si va a riprendere il lavoro periodico che è già nell’archivio dei clienti.',
    cosaFacciamo: [
      { title: 'Cosa dice al telefono', text: `L’assistente telefonico è il centralino che risponde con le mani nel motore: 300 minuti compresi, canone ${PREZZI.voce}. Dice orari, servizi, tempi indicativi e disponibilità approvati da te.` },
      { title: 'Quando scade un tagliando', text: `Il promemoria di scadenza è preparato leggendo lo storico degli interventi: chi si avvicina alla data torna segnalato, nel plafond di 1000 invii al mese, ${PREZZI.agenda}.` },
      { title: 'Dove si chiede un preventivo', text: `Il sito dell’officina è la pagina che raccoglie richieste di preventivo e appuntamento anche a saracinesca chiusa, da ${PREZZI.web}. Moduli, statistiche di percorso e numeri di contatto in evidenza.` },
      { title: 'Come vi trovano gli automobilisti', text: 'La ricerca locale è il lavoro sugli intenti di chi cerca un’officina aperta adesso, su 3 fronti: struttura delle pagine, servizi elencati per nome e testi leggibili dai sistemi AI. Su preventivo, dopo audit.' },
      { title: 'Cosa fa vedere il lavoro', text: `I contenuti sono 16 al mese per canale con il piano Presenza a ${PREZZI.presenza}: interventi, banco, mezzi e persone. È il materiale che distingue un’officina da un numero di telefono.` },
      { title: 'Come si collegano i sistemi', text: 'L’integrazione è il lavoro che serve quando lo stesso dato viene chiesto 3 volte: gestionale, moduli del sito e archivio smettono di essere isole separate. Si quota dopo aver visto che cosa usate davvero.' },
    ],
    ciclo: [
      { number: '01', title: 'Quali domande ricevi', text: 'Il primo passo è mettere per iscritto le 3 domande che senti ogni giorno: quando c’è posto, quanto viene, a che ora chiudete, con i tempi e i costi indicativi che sei disposto a dire al telefono. Da quelle risposte nasce la configurazione, e ciò che non è scritto non viene detto.' },
      { number: '02', title: 'Come si prova la voce', text: 'La prova è l’ascolto delle risposte su casi reali dell’officina, prima che il numero venga collegato ai 300 minuti del piano. Si correggono parole, tempi e modo di proporre l’appuntamento: se una risposta ti sembra sbagliata, si riscrive in quel momento invece di scoprirlo con un cliente vero.' },
      { number: '03', title: 'Come entra in esercizio', text: 'L’attivazione è la messa in linea dei 300 minuti mensili, circa 100 conversazioni da tre minuti, con il numero collegato come hai deciso. Le chiamate trovano risposta anche con il mezzo sul ponte, e di ognuna restano esito e riepilogo da leggere quando ti fermi.' },
      { number: '04', title: 'Quando torna una scadenza', text: 'Le scadenze periodiche sono lette dallo storico e proposte prima della data: tagliandi, revisioni, cambi stagionali, nel plafond di 1000 invii mensili. Coprono il richiamo dei clienti che hai già in archivio, e ogni promemoria parte solo dopo il tuo via libera.' },
    ],
    faq: [
      { q: 'Cosa può dire l’assistente su un preventivo?', a: 'Il preventivo è e resta una tua valutazione: l’assistente dà solo i costi indicativi che hai caricato tu, raccoglie la richiesta e fissa l’appuntamento in accettazione, dentro i 300 minuti del canone base. Una cifra detta al telefono su un guasto non visto diventa un’aspettativa difficile da correggere quando il mezzo è sul ponte. Chi chiama lascia targa, modello e motivo, così quando richiami sai già di che cosa si parla.' },
      { q: 'Come funzionano i promemoria delle scadenze?', a: 'Il promemoria di scadenza è costruito sullo storico degli interventi, dentro il plafond di 1000 invii mensili: ogni giorno il sistema individua chi si avvicina alla data di un tagliando, di una revisione o di una manutenzione periodica e prepara il messaggio con il motivo. Il testo è pronto, ma parte solo dopo il tuo via libera. Chi non vuole più ricevere promemoria viene escluso in modo permanente.' },
      { q: 'Quali chiamate vengono passate a te?', a: 'Le chiamate passate sono quelle che escono dalle regole scritte in avvio: guasti da valutare, contestazioni e richieste che non hai caricato fra le risposte dei 300 minuti del piano. L’assistente non improvvisa una risposta tecnica: prende nome, numero e motivo e ti lascia la nota, oppure trasferisce subito la chiamata negli orari che decidi tu. Il resto lo gestisce da solo, senza farti scendere dal ponte.' },
      { q: 'Quanto costa avere l’assistente al telefono?', a: `Il canone è ${PREZZI.voce} con 300 minuti compresi, circa 100 conversazioni da tre minuti: 5 ore di chiamate al mese, più un costo di avvio una tantum indicato nella proposta. I minuti oltre soglia si pagano a consumo alla tariffa del piano, senza rinegoziare il contratto. Numero telefonico e traffico dell’operatore restano separati dal canone, perché sono costi di terzi che non incassiamo noi.` },
      { q: 'Come si collega il numero dell’officina?', a: 'Il collegamento è una deviazione di chiamata verso il numero dell’assistente, oppure un numero dedicato che affianca il tuo: la scelta si fa in avvio, sui 300 minuti del piano base, e si può cambiare. Chi ha un solo numero di solito devia le chiamate quando l’officina è chiusa o quando nessuno risponde entro qualche squillo. Il numero storico dell’officina resta tuo, intestato a te.' },
      { q: 'Cosa serve per attività diverse da un’officina?', a: 'Il meccanismo è identico per chi lavora su appuntamento e ha scadenze periodiche — impianti, manutenzioni, assistenza tecnica, installatori — con le stesse 2 soglie: 300 minuti al mese di risposta telefonica e 1000 invii per i richiami. Cambiano le parole caricate nel pannello, non il funzionamento. La configurazione si adatta al vocabolario del tuo mestiere durante l’avvio.' },
      { q: 'Dove si leggono le chiamate ricevute?', a: 'Il registro chiamate è il posto dove trovi esito, riepilogo e, secondo il piano attivo, la trascrizione delle conversazioni gestite nei 300 minuti del mese. È quello che guardi a fine giornata per sapere che cosa è successo mentre eri sotto il ponte: chi ha chiamato, che cosa voleva, che appuntamento è stato fissato. Da lì si correggono anche le risposte che non ti convincono.' },
      { q: 'Perché un sito serve a un’officina di quartiere?', a: `Il sito è il posto in cui una richiesta delle 22 diventa un appuntamento del mattino dopo, e il canone base è ${PREZZI.web}, con il progetto tuo dopo 12 mesi. Chi cerca un’officina di sera non aspetta l’apertura per chiamare: o trova un modulo, o passa al nome successivo. Moduli, statistiche di percorso e servizi elencati per nome sono compresi nel canone.` },
    ],
    correlati: [
      { href: '/servizi/gestione-lavorazioni', label: 'Sito e gestione lavorazioni' },
      { href: '/servizi/segretaria-telefonica-ai', label: 'Segretaria telefonica AI' },
      { href: '/servizi/agenda-clienti-whatsapp', label: 'Agenda, clienti e WhatsApp' },
      { href: '/servizi/siti-e-commerce', label: 'Siti web e landing' },
      { href: '/servizi/gestione-social-media', label: 'Gestione social media' },
    ],
  },
  {
    slug: 'ristoranti-e-bar',
    nome: 'Ristoranti e bar',
    sommario: 'Ordine e pagamento al tavolo dal QR, prenotazioni e sala che gira senza attese.',
    titoloSeo: 'Ordine e pagamento al tavolo con QR per ristoranti | SWA',
    descrizioneSeo:
      'Il cliente inquadra il QR al tavolo, ordina e paga dal telefono. Prenotazioni, menu e ordini live nel pannello di sala, più sito e contenuti social.',
    eyebrow: 'Ristoranti e bar',
    h1: 'Il conto arriva prima che tu lo porti.',
    lead:
      'Il tempo perso in sala è quasi sempre lo stesso: prendere l’ordine e chiudere il conto. Con il QR al tavolo il cliente fa entrambe le cose dal telefono, e il personale resta libero per il servizio.',
    servizio: 'Sistema di ordine e pagamento al tavolo per ristoranti',
    tipoServizio: 'Ordine e pagamento al tavolo via QR, prenotazioni, sito e contenuti per ristoranti e bar',
    promessa:
      'Ordine e pagamento passano dal telefono del cliente, le prenotazioni entrano in un posto solo e la fattura elettronica parte da sola. Nessuna promessa sul numero di coperti.',
    notaPrezzi: 'Sistema di sala su preventivo: dipende da tavoli, menu e modalità di pagamento. Le commissioni degli incassi sono quelle del circuito di pagamento e vengono dichiarate prima dell’attivazione. Sito e contenuti hanno il loro listino. Prezzi IVA esclusa.',
    segnali: ['Ordine e pagamento dal QR al tavolo', 'Prenotazioni e ordini in un pannello solo', 'Fattura elettronica verso lo SDI'],
    risultati: [
      { title: 'Meno viaggi per il conto', text: 'Chi ha finito paga dal telefono senza cercare nessuno: il tavolo si libera prima e il personale non fa la spola con il POS.' },
      { title: 'Ordini senza fraintendimenti', text: 'L’ordine arriva scritto dal cliente, con le note e le varianti che ha scelto: niente da ricopiare e niente da interpretare.' },
      { title: 'Una sala sola da guardare', text: 'Prenotazioni, tavoli, ordini in corso e incassi stanno nello stesso pannello, invece che fra quaderno, telefono e cassa.' },
    ],
    cosaTitolo: 'Che cosa mettiamo in sala, e intorno alla sala.',
    cosaIntro:
      'Il sistema copre il giro completo del cliente: prenota, si siede, ordina, paga e riceve la fattura. Intorno ci sono il sito e i contenuti che lo hanno fatto arrivare.',
    cosaFacciamo: [
      { title: 'QR al tavolo', text: 'Ogni tavolo ha il suo codice: il cliente inquadra, vede il menu aggiornato e ordina dal proprio telefono, senza scaricare niente.' },
      { title: 'Pagamento dal telefono', text: 'Si paga con carta, Apple Pay, Google Pay o Satispay. Le commissioni del circuito vengono dichiarate prima, non scoperte sull’estratto conto.' },
      { title: 'Fattura elettronica', text: 'Quando il cliente la chiede, la fattura parte verso lo SDI tramite un intermediario accreditato: nessun modulo da compilare il giorno dopo.' },
      { title: 'Prenotazioni in un posto solo', text: 'Le prenotazioni entrano nel pannello con tavolo, orario e note, invece di stare fra un quaderno, il telefono e i messaggi.' },
      { title: 'Menu che cambi tu', text: 'Piatti, prezzi, disponibilità e allergeni si aggiornano dal pannello e cambiano subito su tutti i tavoli.' },
      { title: 'Ordini live per la cucina', text: 'Gli ordini arrivano in tempo reale con il numero del tavolo e restano tracciati fino alla chiusura del conto.' },
      { title: 'Il sito del locale', text: `Menu, prenotazione e posizione su una pagina che si apre veloce dal telefono. Da ${PREZZI.web}.` },
      { title: 'Contenuti del locale', text: `Piatti, sala e persone, girati e pubblicati con continuità. Presenza ${PREZZI.presenza}, Crescita ${PREZZI.crescita}.` },
    ],
    ciclo: [
      { number: '01', title: 'Sopralluogo', text: 'Guardiamo sala, tavoli, menu e come incassate oggi, prima di proporre qualsiasi cosa.' },
      { number: '02', title: 'Configurazione', text: 'Carichiamo menu e tavoli, generiamo i QR e colleghiamo il circuito di pagamento.' },
      { number: '03', title: 'Prova in sala', text: 'Si parte da pochi tavoli con il personale presente, finché il giro non fila.' },
      { number: '04', title: 'A regime', text: 'Il pannello mostra ordini, prenotazioni e incassi, e il menu lo aggiornate voi.' },
    ],
    faq: [
      { q: 'Il cliente deve scaricare un’applicazione?', a: 'No. Il QR apre una pagina web nel browser del telefono: menu, ordine e pagamento stanno lì. Non c’è niente da installare e nessun account da creare per mangiare.' },
      { q: 'Come funziona il pagamento al tavolo?', a: 'Il cliente paga dal proprio telefono con carta, Apple Pay, Google Pay o Satispay quando ha finito. L’incasso arriva sul conto del locale tramite il circuito di pagamento, e nel pannello resta la riga dell’ordine con il suo stato.' },
      { q: 'Quanto costa in commissioni?', a: 'Le commissioni sono quelle del circuito di pagamento e vengono messe per iscritto prima dell’attivazione, insieme a qualunque quota di servizio. Far scoprire una trattenuta sull’estratto conto non è una pratica che consideriamo accettabile: per questo la voce sta nella proposta.' },
      { q: 'Emette la fattura elettronica?', a: 'Sì, quando il cliente la chiede. Il documento viene trasmesso allo SDI attraverso un intermediario accreditato, quindi non resta un modulo da compilare a mano il giorno dopo.' },
      { q: 'Sostituisce il registratore di cassa?', a: 'No. Il sistema gestisce ordine, pagamento e fattura elettronica. Gli obblighi fiscali del locale, registratore telematico compreso, restano quelli previsti dalla normativa e vanno verificati con il vostro consulente.' },
      { q: 'Il personale deve imparare un programma nuovo?', a: 'Il pannello serve a guardare e correggere, non a lavorare tutto il giorno: ordini in corso, prenotazioni, tavoli e menu. Durante la prova in sala si parte da pochi tavoli con qualcuno di noi presente.' },
      { q: 'Posso cambiare il menu da solo?', a: 'Sì. Piatti, prezzi, disponibilità e allergeni si modificano dal pannello e cambiano subito su tutti i tavoli, senza ristampare i codici: il QR punta al tavolo, non al menu.' },
      { q: 'Serve anche se ho già un gestionale?', a: 'Dipende da che cosa copre. Se il gestionale fa già ordini e conti valutiamo un collegamento invece di una sostituzione; se copre solo la contabilità, il sistema di sala gli sta accanto senza toccarlo.' },
      { q: 'Posso vederlo prima di decidere?', a: 'Sì. Il sistema è online e si guarda subito: la pagina mostra il menu al tavolo come lo vede un cliente e il pannello come lo vede la sala. Durante la call lo apriamo sul vostro menu, così si capisce come funziona sui vostri piatti e non su un esempio generico.' },
    ],
    correlati: [
      { href: 'https://ristoranti-dashboard.vercel.app/', label: 'Guarda il sistema di sala' },
      { href: '/servizi/siti-e-commerce', label: 'Siti web e landing' },
      { href: '/servizi/gestione-social-media', label: 'Gestione social media' },
      { href: '/servizi/automazione-gestionali', label: 'Automazione e gestionali' },
    ],
  },
  {
    slug: 'elettricisti-e-idraulici',
    nome: 'Elettricisti e idraulici',
    sommario: 'Il rapporto di intervento firmato sul posto, invece del blocchetto in furgone.',
    titoloSeo: 'Rapporto di intervento e sito per elettricisti e idraulici | SWA',
    descrizioneSeo:
      'Rapporto di intervento compilato e firmato sul telefono, PDF al cliente prima di ripartire, sito che raccoglie le chiamate e assistente che risponde.',
    eyebrow: 'Elettricisti e idraulici',
    h1: 'Il rapporto si chiude prima di risalire in furgone.',
    lead:
      'Il blocchetto delle ricevute è ancora lo strumento più diffuso, e il più lento: si scrive due volte, si perde, e quando il cliente contesta non c’è niente da mostrare. Lo stesso intervento, sul telefono, si chiude con foto e firma.',
    servizio: 'Rapporto di intervento e presenza online per artigiani',
    tipoServizio: 'Rapporto di intervento digitale, sito e risposta telefonica per elettricisti, idraulici e manutentori',
    promessa:
      'Ogni intervento resta documentato con foto e firma del cliente, e le chiamate che arrivano mentre lavori trovano risposta. Nessuna promessa sul numero di lavori.',
    notaPrezzi: `Modulo di intervento su preventivo: dipende dal numero di operatori e dai modelli di scheda. Sito ${PREZZI.web}. Assistente telefonico ${PREZZI.voce}. Prezzi IVA esclusa.`,
    segnali: ['Firma del cliente sul telefono', 'PDF inviato prima di ripartire', 'Chiamate raccolte mentre lavori'],
    risultati: [
      { title: 'Niente doppia scrittura', text: 'Quello che scrivi in cantiere è già il documento finale: non si ricopia in ufficio la sera e non si perde per strada.' },
      { title: 'Contestazioni che si chiudono', text: 'Foto dell’impianto, materiali usati e firma del cliente stanno nello stesso rapporto: la discussione finisce con un documento.' },
      { title: 'Chiamate non perse', text: 'Chi chiama mentre hai le mani in un quadro elettrico trova risposta, orari e un appuntamento fissato.' },
    ],
    cosaTitolo: 'Che cosa facciamo per un artigiano.',
    cosaIntro:
      'Il percorso è lo stesso delle altre categorie, tarato sul furgone: il sito porta la chiamata, il telefono la raccoglie, il rapporto chiude il lavoro.',
    cosaFacciamo: [
      { title: 'Rapporto sul telefono', text: 'Scheda precompilata per tipo di intervento, materiali, note sulle anomalie e foto: si compila sul posto, anche con poca linea.' },
      { title: 'Firma del cliente', text: 'Il cliente firma direttamente sullo schermo a fine lavoro, e la firma resta dentro il documento insieme alla data e all’ora.' },
      { title: 'PDF subito al cliente', text: 'Il rapporto esce in PDF e parte via email, WhatsApp o Telegram prima che tu risalga in furgone.' },
      { title: 'Ore che si contano da sole', text: 'Entrata, uscita e pausa diventano il totale delle ore, pronte da riportare in fattura senza rifare i conti.' },
      { title: 'Il sito che porta chiamate', text: `Una pagina che dice che cosa fai, dove intervieni e come chiamarti, costruita per il telefono. Da ${PREZZI.web}.` },
      { title: 'Chi risponde per te', text: `L’assistente informa su zone e disponibilità, raccoglie la richiesta e fissa l’intervento. ${PREZZI.voce}.` },
    ],
    ciclo: [
      { number: '01', title: 'Modelli', text: 'Scriviamo insieme le schede dei tuoi interventi tipo, così il rapporto è già mezzo compilato.' },
      { number: '02', title: 'Prova sul campo', text: 'Provi su lavori veri per qualche giorno e correggiamo le schede dove sono scomode.' },
      { number: '03', title: 'In esercizio', text: 'Ogni intervento si chiude sul posto e il cliente riceve il documento firmato.' },
      { number: '04', title: 'Chiamate', text: 'Sito e assistente raccolgono le richieste mentre sei sotto un lavandino.' },
    ],
    faq: [
      { q: 'Funziona anche senza campo in cantina?', a: 'Sì. Il rapporto si compila anche con una connessione lenta: le foto vengono compresse sul telefono prima di partire e il testo resta salvato mentre scrivi, così una cantina o un tunnel non fanno perdere il lavoro già fatto.' },
      { q: 'La firma sul telefono ha valore?', a: 'La firma raccolta sullo schermo vale come prova della presa in consegna del lavoro, insieme a foto, data e ora registrate nel documento. Per gli usi che richiedono una firma elettronica qualificata serve un servizio dedicato, da valutare con il vostro consulente.' },
      { q: 'Posso usarlo con più operatori?', a: 'Sì. Ogni operatore ha il proprio accesso e compila i rapporti dei suoi interventi, mentre chi sta in ufficio vede la giornata di tutti, filtra per operatore o cliente e approva o contesta.' },
      { q: 'Che differenza c’è con un blocchetto?', a: 'Il blocchetto si scrive due volte, si perde e non contiene foto. Il rapporto digitale parte già compilato dalla scheda del tipo di intervento, porta le immagini dentro il documento e arriva al cliente lo stesso giorno.' },
      { q: 'Sostituisce la fattura?', a: 'No. È il documento del lavoro svolto, non un documento fiscale: descrive intervento, materiali, ore e firma. La fattura resta al vostro gestionale o al commercialista.' },
      { q: 'Quanto costa mettere in piedi tutto?', a: `Il modulo di intervento è su preventivo, perché dipende dagli operatori e dai modelli di scheda. Il sito parte da ${PREZZI.web} e l’assistente telefonico da ${PREZZI.voce}, con il costo di avvio indicato prima dell’attivazione.` },
      { q: 'Serve un telefono nuovo?', a: 'No. L’applicazione si installa dal browser sui telefoni Android e iPhone già in uso e occupa poco: è pensata per essere aperta con una mano mentre l’altra tiene un attrezzo.' },
      { q: 'Vale anche per altri mestieri?', a: 'Sì, ma con una lavorazione di adattamento. L’impianto è lo stesso — scheda, foto, firme, PDF, stati, pannello — mentre le voci della checklist, l’elenco delle anomalie e le diciture del documento oggi sono tarate sulle imprese di pulizia. Riscriverle per impianti, condizionamento, antincendio o assistenza tecnica è parte del progetto e viene quotata prima di partire.' },
    ],
    correlati: [
      { href: '/servizi/gestione-lavorazioni', label: 'Sito e gestione lavorazioni' },
      { href: '/servizi/automazione-gestionali', label: 'Automazione e gestionali' },
      { href: '/servizi/siti-e-commerce', label: 'Siti web e landing' },
      { href: '/servizi/segretaria-telefonica-ai', label: 'Segretaria telefonica AI' },
      { href: '/servizi/ricerca-clienti-b2b', label: 'Ricerca Clienti B2B' },
    ],
  },
]


export function settoreBySlug(slug: string): Settore | undefined {
  return SETTORI.find(s => s.slug === slug)
}
