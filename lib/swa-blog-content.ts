import type { BlogArticleData } from '@/lib/blog-render'
import { SITE_URL } from '@/lib/site-config'

export const SWA_BLOG_ARTICLES: BlogArticleData[] = [
  {
    slug: 'gestione-social-media-pmi-cosa-include-costi',
    meta_title: 'Gestione social media per PMI: servizi e costi | SWA',
    meta_description: 'Che cosa comprende davvero la gestione social per una PMI, quanto costa al mese e come si contano i contenuti per canale, senza promesse di risultato.',
    h1: 'Gestione social media per PMI: cosa comprende e quanto costa',
    intro: 'La gestione social media per una PMI non consiste nel pubblicare qualche post. È un processo continuativo che unisce strategia, piano editoriale, produzione, approvazione, pubblicazione e analisi dei risultati. Il costo dipende soprattutto da numero di canali, quantità e formato dei contenuti, campagne e livello di supporto richiesto.',
    sezioni: [
      {
        h2: 'Cosa significa affidare la gestione dei social',
        paragrafi: [
          'Affidare la gestione dei social significa trasferire a un professionista o a un team la responsabilità operativa del calendario editoriale. L’impresa conserva il controllo su obiettivi, posizionamento e approvazione finale, mentre il fornitore organizza il lavoro necessario per mantenere una presenza coerente.',
          'Un servizio completo parte dall’analisi del brand, del pubblico e dell’offerta. Solo dopo vengono scelti canali, rubriche, formati e frequenza. Senza questa fase, anche contenuti visivamente curati rischiano di non sostenere alcun obiettivo commerciale.',
        ],
        lista_punti: [
          'Analisi del brand, del pubblico e dei concorrenti',
          'Strategia e piano editoriale mensile',
          'Copy, grafiche, caroselli e video brevi',
          'Revisione e approvazione prima della pubblicazione',
          'Programmazione sui canali concordati',
          'Report con priorità per il mese successivo',
        ],
      },
      {
        h2: 'Quali attività incidono sul prezzo',
        paragrafi: [
          'Il numero di post, da solo, non descrive il valore del servizio. Un contenuto deve essere ideato, scritto, progettato, adattato alle piattaforme e verificato. Un Reel richiede un flusso diverso da un post statico; una campagna pubblicitaria richiede impostazione, monitoraggio e gestione separata del budget.',
          'Incidono sul costo anche il numero di brand, il numero di persone coinvolte nelle approvazioni, la disponibilità di materiali originali, la produzione video e la necessità di collegare social, sito, e-commerce o CRM.',
        ],
      },
      {
        h2: 'Quanto costa la gestione social media con SWA',
        paragrafi: [
          'Social Web Automation propone due livelli mensili trasparenti. Il piano Presenza costa 490 euro al mese, IVA esclusa, e comprende 16 contenuti al mese per ciascuno dei due social coordinati, cioè 32 pubblicazioni. È pensato per imprese che devono comunicare con continuità e desiderano un flusso gestito di produzione, approvazione e pubblicazione.',
          'Il piano Crescita costa 990 euro al mese, IVA esclusa. Comprende 24 contenuti al mese per ciascuno dei due social, cioè 48 pubblicazioni, un articolo SEO e GEO e l’analisi competitor. Entrambi i piani coprono la sola crescita organica: le campagne a pagamento rientrano in una configurazione personalizzata, con il budget versato alle piattaforme separato dal canone.',
          'Per e-commerce, più brand, volumi elevati, integrazioni o produzioni complesse viene definita una configurazione personalizzata. Il preventivo deve indicare con chiarezza attività, revisioni, responsabilità, tempi e costi esclusi.',
        ],
      },
      {
        h2: 'Come scegliere il servizio adatto alla propria PMI',
        paragrafi: [
          'La scelta dovrebbe partire dalla capacità interna. Se l’azienda possiede già strategia, materiali e una persona che coordina le pubblicazioni, può bastare un supporto specialistico. Se invece il lavoro rimane fermo perché manca tempo, serve una gestione più completa.',
          'Prima di acquistare, è utile chiedere chi approva i contenuti, quante revisioni sono previste, quali formati sono inclusi, chi possiede gli account e come vengono letti i risultati. Un servizio affidabile evita promesse di viralità o vendite garantite e definisce ciò che può controllare.',
        ],
      },
      {
        h2: 'Quali risultati misurare',
        paragrafi: [
          'Follower e visualizzazioni aiutano a comprendere la distribuzione, ma non bastano per valutare il ritorno. Una PMI dovrebbe collegare le attività social a visite qualificate, richieste di contatto, appuntamenti, vendite e qualità delle conversazioni generate.',
          'Il report mensile deve quindi trasformare i numeri in decisioni: quali temi hanno attirato il pubblico giusto, quali formati hanno generato azioni e cosa conviene modificare nel ciclo editoriale successivo.',
        ],
      },
    ],
    faq: [
      { domanda: 'Il budget pubblicitario è incluso nel canone?', risposta: 'No. La gestione della campagna può essere inclusa nel servizio, ma il budget versato a Meta, Google o altre piattaforme resta separato.' },
      { domanda: 'I contenuti vengono pubblicati senza approvazione?', risposta: 'No. Il processo SWA prevede controllo e approvazione del cliente prima della pubblicazione, nel rispetto delle revisioni incluse.' },
      { domanda: 'È possibile iniziare con due social?', risposta: 'Sì. Il piano Presenza include due social coordinati con 16 contenuti mensili per ciascun canale, cioè 32 pubblicazioni.' },
      { domanda: 'La gestione social garantisce vendite?', risposta: 'No. Nessun fornitore serio può garantire vendite o viralità. È possibile progettare e misurare un processo orientato a obiettivi concreti.' },
    ],
    cta_finale: 'Vuoi capire quale piano è sostenibile per la tua impresa? Confronta i pacchetti SWA oppure richiedi un’analisi iniziale.',
    keywords_target: ['Social media', 'gestione social media per PMI', 'gestione social media costi', 'pacchetti social media'],
    immagine_cover: null,
    autore: 'Marco Dibenedetto',
    tempo_lettura_min: 7,
    data_pubblicazione: '2026-08-11T08:00:00.000Z',
    // Fonti primarie: un contenuto ancorato e' piu' facile da citare per un
    // motore di risposta di uno che afferma e basta.
    fonti: [
      { titolo: 'Instagram, account professionali e strumenti per le aziende', url: 'https://help.instagram.com/1038071743007909', nota: 'Guida ufficiale Meta: che cosa cambia fra profilo personale e account professionale.' },
      { titolo: 'Google Search Central, contenuti utili e affidabili', url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content', nota: 'I criteri con cui Google giudica se un contenuto è scritto per le persone.' },
    ],
    // Rimandi ai servizi di cui l’articolo parla: senza, il blog non porta
    // da nessuna parte.
    collegamenti: [
      { href: '/servizi/gestione-social-media', label: 'Gestione social multicanale', nota: 'Piano, produzione, tua approvazione e pubblicazione su 2 canali a scelta.' },
      { href: '/pacchetti', label: 'Pacchetti e prezzi', nota: 'Presenza e Crescita voce per voce, con quello che resta fuori.' },
      { href: '/servizi/video-produzione', label: 'Riprese video in azienda', nota: 'Mezza giornata sul posto, da cui escono i verticali di più settimane.' },
    ],
    url_pubblicato: `${SITE_URL}/blog/gestione-social-media-pmi-cosa-include-costi`,
  },
  {
    slug: 'seo-geo-differenze-visibilita-motori-ai',
    meta_title: 'SEO e GEO: differenze e strategia per le PMI | SWA',
    meta_description: 'SEO e GEO non sono la stessa cosa: la prima lavora sull’essere trovati in un elenco, la seconda sull’essere compresi e citati dai sistemi di risposta AI.',
    h1: 'SEO e GEO: differenze e strategia per essere trovati anche dai motori AI',
    intro: 'La SEO migliora la visibilità nei risultati dei motori di ricerca. La GEO lavora sulla probabilità che contenuti, fonti ed entità siano compresi e utilizzati dai sistemi generativi. Le due discipline condividono la stessa base: contenuti utili, accessibili, verificabili e collegati a un’identità chiara.',
    sezioni: [
      {
        h2: 'Che cos’è la SEO',
        paragrafi: [
          'La Search Engine Optimization comprende le attività che aiutano i motori di ricerca a scoprire, interpretare e presentare una pagina. Include aspetti tecnici, architettura delle informazioni, qualità editoriale, collegamenti interni, autorevolezza e prestazioni.',
          'Per una PMI, l’obiettivo non è comparire per ogni parola possibile. È presidiare le ricerche che esprimono un problema, un confronto o un’intenzione di acquisto coerente con i servizi realmente offerti.',
        ],
      },
      {
        h2: 'Che cos’è la GEO',
        paragrafi: [
          'Generative Engine Optimization è il nome usato per descrivere l’ottimizzazione della presenza nei sistemi di risposta basati sull’intelligenza artificiale. Questi sistemi possono sintetizzare più fonti, citare pagine e proporre risposte senza mostrare un elenco tradizionale di risultati.',
          'Non esiste un codice capace di garantire una citazione. Aiuta invece pubblicare informazioni chiare, coerenti e aggiornate, specificare chi è responsabile dei contenuti, usare dati strutturati aderenti alla pagina e ottenere menzioni da fonti pertinenti.',
        ],
      },
      {
        h2: 'SEO e GEO a confronto, voce per voce',
        paragrafi: [
          'Le due discipline lavorano sullo stesso contenuto ma rispondono a due domande diverse: la SEO chiede «questa pagina merita di comparire fra i risultati?», la GEO chiede «questo passaggio si può citare in una risposta?». La tabella mette le differenze una accanto all’altra.',
        ],
        tabella: {
          caption: 'Differenze fra SEO e GEO su sei dimensioni operative',
          colonne: ['Dimensione', 'SEO', 'GEO'],
          righe: [
            ['Obiettivo', 'Comparire fra i risultati di ricerca', 'Essere citati dentro una risposta generata'],
            ['Dove appare il risultato', 'Nella pagina dei risultati, come link', 'Dentro il testo della risposta, con o senza link'],
            ['Unità di misura', 'Posizione, clic, impressioni', 'Presenza e frequenza della citazione'],
            ['Che cosa premia', 'Rilevanza, autorevolezza del dominio, esperienza d’uso', 'Risposte brevi e autonome, dati verificabili, fonti citate'],
            ['Struttura utile', 'Titoli, link interni, dati strutturati', 'Blocchi domanda e risposta, tabelle, elenchi, definizioni'],
            ['Come si verifica', 'Search Console e posizionamento sulle chiavi', 'Interrogando i motori di risposta sulle domande dei clienti'],
          ],
        },
      },
      {
        h2: 'Cosa SEO e GEO hanno in comune',
        paragrafi: [
          'Un sito deve essere accessibile ai crawler, avere URL stabili, canonical corretti e pagine collegate tra loro. Titoli e descrizioni devono distinguere gli argomenti, mentre il testo deve rispondere direttamente alla domanda dell’utente prima di approfondire.',
          'Identità e fiducia hanno un ruolo centrale. Ragione sociale, autore, contatti, competenze, fonti e date di aggiornamento aiutano persone e sistemi automatici a valutare il contesto della pubblicazione.',
        ],
        lista_punti: [
          'Contenuti originali e utili per un intento preciso',
          'Struttura con titoli descrittivi e risposte dirette',
          'Dati strutturati coerenti con il testo visibile',
          'Pagine autore e chi siamo verificabili',
          'Collegamenti interni e fonti esterne pertinenti',
          'Aggiornamento dei contenuti quando cambia il contesto',
        ],
      },
      {
        h2: 'Un percorso pratico per una PMI',
        paragrafi: [
          'Il primo passo è correggere indicizzazione, sitemap, canonical, performance e pagine duplicate. Il secondo è costruire un’architettura che separi servizi, domande commerciali, guide e casi studio. Il terzo è pubblicare contenuti basati su esperienza reale e verificare quali query generano impression e contatti.',
          'Per la GEO conviene inoltre controllare come l’azienda viene descritta dai principali sistemi AI, senza considerare una singola risposta come risultato definitivo. Le risposte possono cambiare in base al modello, alla data, alla formulazione della domanda e alle fonti disponibili.',
        ],
      },
      {
        h2: 'Cosa evitare',
        paragrafi: [
          'Ripetere keyword, creare decine di pagine quasi uguali o pubblicare testi automatici senza revisione non costruisce autorevolezza. Anche i dati strutturati non devono dichiarare recensioni, FAQ o servizi che l’utente non vede realmente nella pagina.',
          'La strategia più sostenibile consiste nel coprire bene poche aree in cui l’impresa possiede competenza, mostrare prove autentiche e migliorare i contenuti sulla base dei dati di ricerca e delle domande ricevute dai clienti.',
        ],
      },
    ],
    faq: [
      { domanda: 'La GEO sostituisce la SEO?', risposta: 'No. La GEO utilizza una base tecnica ed editoriale molto simile alla SEO e la estende al modo in cui i sistemi generativi comprendono e sintetizzano le fonti.' },
      { domanda: 'È possibile garantire una citazione su ChatGPT o Gemini?', risposta: 'No. Nessun operatore può controllare o garantire le citazioni prodotte da un sistema AI esterno.' },
      { domanda: 'Serve un file llms.txt?', risposta: 'Può fornire un riepilogo utile ad alcuni sistemi, ma non sostituisce indicizzazione, contenuti di qualità, dati strutturati e autorevolezza.' },
      { domanda: 'Quanto tempo serve per vedere risultati?', risposta: 'Dipende dallo stato iniziale del sito, dalla concorrenza, dalla frequenza di pubblicazione e dall’autorevolezza acquisita. Non esiste una tempistica garantita.' },
    ],
    cta_finale: 'Una strategia SEO e GEO efficace parte da un audit concreto. Scopri il servizio SWA dedicato alla visibilità organica.',
    keywords_target: ['SEO + GEO', 'SEO e GEO differenze', 'visibilità motori AI', 'GEO per PMI'],
    immagine_cover: '/blog/seo-geo-ai-discoverability.webp',
    autore: 'Marco Dibenedetto',
    tempo_lettura_min: 7,
    data_pubblicazione: '2026-08-11T08:10:00.000Z',
    // Fonti primarie: un contenuto ancorato e' piu' facile da citare per un
    // motore di risposta di uno che afferma e basta.
    fonti: [
      { titolo: 'Google Search Central, funzionalità AI nella ricerca', url: 'https://developers.google.com/search/docs/appearance/ai-features', nota: 'Come Google seleziona le pagine da mostrare nelle risposte generate.' },
      { titolo: 'Schema.org, tipo FAQPage', url: 'https://schema.org/FAQPage', nota: 'La specifica del vocabolario usato per marcare le domande frequenti.' },
      { titolo: 'llms.txt, la proposta di standard', url: 'https://llmstxt.org/', nota: 'Il formato con cui un sito dichiara i propri contenuti ai modelli linguistici.' },
      { titolo: 'OpenAI, i crawler e come consentirli', url: 'https://platform.openai.com/docs/bots', nota: 'Elenco ufficiale degli user agent di OpenAI e regole per robots.txt.' },
    ],
    // Rimandi ai servizi di cui l’articolo parla: senza, il blog non porta
    // da nessuna parte.
    collegamenti: [
      { href: '/servizi/seo-geo', label: 'SEO e GEO', nota: 'Audit, intenti, entità e dati strutturati: che cosa cambiare e in che ordine.' },
      { href: '/servizi/blog-seo', label: 'Blog SEO + GEO', nota: 'Dodici articoli al mese, revisionati da una persona.' },
      { href: '/servizi/siti-e-commerce', label: 'Siti web e landing', nota: 'La base tecnica su cui poggia tutto il resto.' },
    ],
    url_pubblicato: `${SITE_URL}/blog/seo-geo-differenze-visibilita-motori-ai`,
  },
  {
    slug: 'piano-editoriale-social-esempio-pmi',
    meta_title: 'Piano editoriale social per PMI: metodo ed esempio | SWA',
    meta_description: 'Come si costruisce un piano editoriale che regge un mese intero: rubriche, formati, quantità di materiale da procurare e chi approva prima della pubblicazione.',
    h1: 'Piano editoriale social per PMI: metodo, struttura ed esempio pratico',
    intro: 'Un piano editoriale social traduce obiettivi e posizionamento in un calendario sostenibile di contenuti. Non è un elenco di ricorrenze: stabilisce pubblico, messaggi, rubriche, formati, responsabilità, date di approvazione e indicatori da osservare.',
    sezioni: [
      {
        h2: 'Da dove parte un piano editoriale',
        paragrafi: [
          'Il punto di partenza è la priorità commerciale. Un’impresa può dover spiegare un servizio complesso, aumentare la fiducia, generare richieste, sostenere una rete vendita o valorizzare un e-commerce. Ogni obiettivo richiede contenuti e inviti all’azione diversi.',
          'Prima del calendario vanno definiti pubblico, problemi, obiezioni, prove disponibili e tono del brand. È utile anche chiarire chi fornisce materiali, chi approva e quanto tempo può dedicare il team interno.',
        ],
      },
      {
        h2: 'Le rubriche che rendono il calendario equilibrato',
        paragrafi: [
          'Le rubriche evitano di improvvisare ogni settimana. Una PMI può alternare educazione, prova, prodotto, persone e conversazione. Il peso di ciascuna area dipende dal settore e dal livello di conoscenza del pubblico.',
        ],
        lista_punti: [
          'Educazione: spiegazioni, errori comuni e risposte alle domande',
          'Prova: casi studio, metodo, processi e risultati verificabili',
          'Offerta: servizi, prodotti, differenze e condizioni',
          'Persone: competenze, cultura e lavoro dietro le quinte',
          'Conversazione: domande, sondaggi e contenuti che raccolgono segnali',
        ],
      },
      {
        h2: 'Esempio di settimana editoriale',
        paragrafi: [
          'Un lunedì può essere dedicato a un carosello educativo che risponde a una domanda frequente. Il mercoledì può mostrare un passaggio del processo con un breve video. Il venerdì può presentare un servizio o un caso, collegandolo a una pagina del sito e a un invito all’azione misurabile.',
          'Lo stesso tema non deve essere copiato identico su tutte le piattaforme. LinkedIn può sviluppare il ragionamento, Instagram può usare una sequenza visuale, mentre Facebook può privilegiare contesto locale e conversazione. La direzione resta unica, il linguaggio cambia.',
        ],
      },
      {
        h2: 'Approvazione e produzione senza colli di bottiglia',
        paragrafi: [
          'Il calendario deve includere le scadenze interne, non soltanto le date di pubblicazione. Testi e visual dovrebbero essere approvati in blocco, con un referente preciso e un numero definito di revisioni.',
          'Un portale di approvazione riduce messaggi dispersi e versioni duplicate. L’intelligenza artificiale può velocizzare ricerca, varianti e adattamenti, ma il controllo umano resta necessario per accuratezza, tono e responsabilità editoriale.',
        ],
      },
      {
        h2: 'Come misurare e migliorare il piano',
        paragrafi: [
          'Ogni rubrica dovrebbe essere collegata a un segnale. Per i contenuti educativi possono contare salvataggi, visite qualificate e tempo sulla pagina. Per i contenuti commerciali contano click, richieste, appuntamenti e vendite attribuibili.',
          'A fine mese non serve eliminare tutto ciò che non ha ottenuto molte visualizzazioni. Occorre distinguere distribuzione, qualità del pubblico e obiettivo. Un contenuto con meno copertura può comunque aver generato una richiesta di valore.',
        ],
      },
    ],
    faq: [
      { domanda: 'Quanti contenuti deve pubblicare una PMI?', risposta: 'Non esiste un numero universale. Frequenza e formati devono essere sostenibili e coerenti con canali, obiettivi e capacità produttiva.' },
      { domanda: 'Lo stesso post può essere usato su tutti i social?', risposta: 'Il tema può essere condiviso, ma testo, formato e invito all’azione dovrebbero essere adattati al comportamento del pubblico su ciascun canale.' },
      { domanda: 'Quanto prima vanno approvati i contenuti?', risposta: 'È consigliabile lavorare per blocchi e chiudere l’approvazione con anticipo sufficiente per revisioni, programmazione e imprevisti.' },
      { domanda: 'L’AI può creare tutto il piano editoriale?', risposta: 'Può supportare analisi e produzione, ma priorità, accuratezza, tono e approvazione devono restare sotto controllo umano.' },
    ],
    cta_finale: 'SWA costruisce e gestisce il piano editoriale insieme a produzione, approvazione e pubblicazione. Confronta i pacchetti disponibili.',
    keywords_target: ['Piano editoriale', 'piano editoriale social PMI', 'calendario social esempio', 'strategia contenuti social'],
    immagine_cover: '/blog/piano-editoriale-social-pmi.webp',
    autore: 'Marco Dibenedetto',
    tempo_lettura_min: 6,
    data_pubblicazione: '2026-08-11T08:20:00.000Z',
    // Fonti primarie: un contenuto ancorato e' piu' facile da citare per un
    // motore di risposta di uno che afferma e basta.
    fonti: [
      { titolo: 'Google Search Central, contenuti utili e affidabili', url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content', nota: 'I criteri di qualità editoriale a cui si allinea anche un piano social.' },
      { titolo: 'Instagram, account professionali e strumenti per le aziende', url: 'https://help.instagram.com/1038071743007909', nota: 'Che cosa mette a disposizione la piattaforma a chi pubblica come azienda.' },
    ],
    // Rimandi ai servizi di cui l’articolo parla: senza, il blog non porta
    // da nessuna parte.
    collegamenti: [
      { href: '/servizi/gestione-social-media', label: 'Gestione social multicanale', nota: 'Il piano editoriale che descriviamo qui, fatto per la tua attività.' },
      { href: '/pacchetti', label: 'Quanti contenuti al mese', nota: '16 o 24 per canale, secondo il piano.' },
      { href: '/settori', label: 'Il tuo settore', nota: 'Undici categorie, ognuna con le sue rubriche.' },
    ],
    url_pubblicato: `${SITE_URL}/blog/piano-editoriale-social-esempio-pmi`,
  },
  {
    slug: 'chiamate-perse-agenda-vuota-cosa-fare',
    meta_title: 'Chiamate perse e agenda vuota: cosa fare davvero | SWA',
    meta_description: 'Perché una chiamata persa è quasi sempre un appuntamento perso, come recuperare i clienti che non tornano e cosa valutare prima di automatizzare la risposta.',
    h1: 'Chiamate perse e agenda vuota: due problemi diversi, due soluzioni diverse',
    intro: 'In un’attività che lavora su appuntamento ci sono due buchi che si somigliano ma non sono la stessa cosa. Il primo è chi ti cerca e non ti trova: il telefono squilla mentre sei con un cliente e chi chiama passa al nome successivo. Il secondo è chi non ti cerca più: il cliente che veniva ogni sei settimane e da quattro mesi non si vede. Confonderli porta a comprare lo strumento sbagliato.',
    sezioni: [
      {
        h2: 'Perché una chiamata persa pesa più di quanto sembri',
        paragrafi: [
          'Chi telefona a un centro estetico, a uno studio dentistico o a un’officina ha già deciso di prenotare: non sta cercando informazioni generiche, sta cercando un posto libero. Se non trova risposta, raramente richiama più tardi. Chiama il prossimo numero della lista, e quel numero è quasi sempre un concorrente.',
          'Il problema è strutturale, non organizzativo. Le telefonate arrivano proprio quando non puoi rispondere: durante un trattamento, con le mani occupate, mentre stai parlando con qualcuno allo sportello. Le fasce in cui il telefono squilla di più sono le stesse in cui sei più occupato.',
          'La segreteria telefonica classica non risolve, sposta soltanto: registra un messaggio che qualcuno dovrà ascoltare, capire e richiamare. Nel frattempo il cliente ha già prenotato altrove.',
        ],
        lista_punti: [
          'Chi chiama per prenotare ha già deciso: la richiesta è calda',
          'Le chiamate arrivano nelle ore in cui sei meno disponibile',
          'La segreteria rimanda il problema invece di chiuderlo',
          'Nessuno tiene il conto delle chiamate perse, quindi il costo resta invisibile',
        ],
      },
      {
        h2: 'L’altro buco: i clienti che smettono di tornare senza dirlo',
        paragrafi: [
          'Un cliente che non torna quasi mai se ne va sbattendo la porta. Semplicemente dirada: salta un appuntamento, poi rimanda, poi passano i mesi. Nessuno se ne accorge, perché non c’è un momento preciso in cui succede.',
          'È il valore più grande che hai in archivio e anche il più trascurato. Quelle persone ti conoscono, sanno dove sei, hanno già speso da te: riportarle dentro costa molto meno che trovarne di nuove. Ma richiede di ricordarsi di loro al momento giusto, ed è esattamente la cosa che nessuno ha il tempo di fare a fine giornata.',
          'Lo stesso vale per gli spazi liberi. Una disdetta lascia un buco che si potrebbe riempire, se solo qualcuno sapesse chi chiamare nelle due ore che restano.',
        ],
      },
      {
        h2: 'Cosa si può fare senza tecnologia',
        paragrafi: [
          'Prima di comprare qualsiasi strumento vale la pena sistemare tre cose, perché costano zero e a volte bastano.',
          'La prima: sapere quante chiamate perdi davvero. Quasi nessuna attività lo misura, e senza quel numero ogni decisione è a occhio. Il tabulato del telefono lo dice.',
          'La seconda: scrivere le risposte alle domande che ricevi cento volte. Prezzi, orari, tempi, come si arriva. Se sono scritte, chiunque in studio può rispondere senza chiamare te.',
          'La terza: un elenco, anche su un foglio, di chi non si vede da più di tre mesi. Guardarlo una volta a settimana è già una forma di recupero clienti.',
        ],
        lista_punti: [
          'Misura le chiamate perse: senza quel numero decidi al buio',
          'Metti per iscritto le risposte alle domande ricorrenti',
          'Tieni una lista di chi non torna da più di tre mesi',
          'Definisci chi richiama, e quando: se è compito di tutti non è di nessuno',
        ],
      },
      {
        h2: 'Cosa può fare un assistente telefonico AI',
        paragrafi: [
          'Quando il volume di chiamate supera quello che una persona può gestire mentre lavora, un assistente telefonico può rispondere al posto tuo: dà informazioni su servizi, prezzi e orari, controlla il calendario, propone gli orari liberi e fissa l’appuntamento. Le richieste delicate o non previste le passa a una persona.',
          'La differenza con un centralino automatico è che non c’è un menu da attraversare: chi chiama parla normalmente. E ogni telefonata lascia una trascrizione, quindi non devi più riascoltare messaggi per capire cosa è successo.',
          'Il limite va detto: un assistente gestisce bene le richieste ripetitive, non le conversazioni delicate. Un reclamo, una situazione clinica, una trattativa vogliono una persona. Chi lo vende come sostituto completo del personale sta esagerando.',
        ],
      },
      {
        h2: 'Cosa può fare il recupero clienti automatizzato',
        paragrafi: [
          'Sul secondo buco lo strumento è diverso. Un sistema che legge agenda e storico può segnalare chi manca da troppo tempo, chi ha lasciato un percorso a metà e chi potrebbe coprire l’orario rimasto libero venerdì, e preparare il messaggio già scritto.',
          'Qui la regola che conta è una sola: il messaggio non deve partire da solo. Deve arrivare a te, tu lo leggi e decidi se inviarlo. Un sistema che scrive ai tuoi clienti senza il tuo controllo prima o poi manda la cosa sbagliata alla persona sbagliata, e il danno lo paghi tu.',
          'Vanno gestiti anche consenso e possibilità di esclusione: contattare via WhatsApp chi non ha dato il consenso non è solo scorretto, è un problema normativo.',
        ],
      },
      {
        h2: 'Cosa chiedere prima di comprare',
        paragrafi: [
          'Le domande che separano un fornitore serio da uno che improvvisa sono poche e concrete.',
          'Come vengono contati i minuti o i messaggi, e cosa succede oltre la soglia. Che cosa comprende esattamente il costo di avvio. Se il numero di telefono e il traffico sono inclusi o separati. Se puoi ascoltare come risponde prima di attivarlo sul tuo numero. Chi possiede i dati e dove vengono conservati.',
          'E soprattutto: che cosa viene garantito. Un fornitore corretto garantisce il funzionamento del servizio, non un numero di appuntamenti recuperati. Quello dipende anche dalla tua offerta, dalla stagione e dal rapporto che hai con i clienti — e chi promette una cifra non sa di cosa sta parlando.',
        ],
        lista_punti: [
          'Come si contano minuti e messaggi, e il costo oltre soglia',
          'Che cosa comprende il costo di avvio, voce per voce',
          'Se numero e traffico telefonico sono compresi',
          'Se puoi provare prima di andare online',
          'Chi possiede i dati e dove sono conservati',
          'Che cosa viene garantito davvero, messo per iscritto',
        ],
      },
    ],
    faq: [
      { domanda: 'Un assistente telefonico AI sostituisce la segretaria?', risposta: 'No. Gestisce le chiamate ripetitive e quelle che altrimenti andrebbero perse. Le richieste delicate o non previste vengono passate a una persona, e le decisioni restano dello studio.' },
      { domanda: 'Il cliente capisce che sta parlando con un sistema automatico?', risposta: 'Dovrebbe, e l’assistente dovrebbe presentarsi come tale. Nascondere che si tratta di un sistema automatico non è una scelta consigliabile, né dal punto di vista normativo né da quello del rapporto con il cliente.' },
      { domanda: 'I messaggi di recupero partono automaticamente?', risposta: 'Non devono. Il sistema può preparare le bozze, ma l’invio va approvato da una persona. Un messaggio sbagliato inviato a un cliente è un danno che paga l’attività, non il fornitore.' },
      { domanda: 'Serve cambiare gestionale?', risposta: 'Di norma no. I dati di clienti e agenda si possono importare da file o dal gestionale già in uso. Collegamenti particolari vanno valutati prima e non sono automaticamente compresi.' },
      { domanda: 'Quanti clienti si recuperano?', risposta: 'Non è un numero che si può promettere. Il sistema individua le occasioni e prepara il lavoro; quante persone tornano dipende anche da offerta, stagionalità e rapporto esistente.' },
    ],
    cta_finale: 'Vuoi capire quale dei due buchi ti pesa di più? Guarda come funziona la segretaria telefonica AI oppure il recupero clienti via WhatsApp, e parliamone.',
    keywords_target: ['chiamate perse', 'segretaria telefonica AI', 'recuperare clienti', 'riempire agenda', 'appuntamenti persi'],
    immagine_cover: '/blog/chiamate-perse-segretaria-ai.webp',
    autore: 'Marco Dibenedetto',
    tempo_lettura_min: 8,
    data_pubblicazione: '2026-09-07T09:00:00.000Z',
    // Fonti primarie: un contenuto ancorato e' piu' facile da citare per un
    // motore di risposta di uno che afferma e basta.
    fonti: [
      { titolo: 'WhatsApp Business Messaging Policy', url: 'https://business.whatsapp.com/policy', nota: 'Le regole di Meta su che cosa si può scrivere a un cliente e con quale consenso.' },
      { titolo: 'Regolamento (UE) 2016/679, GDPR', url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj', nota: 'Testo ufficiale su EUR-Lex: basi giuridiche del trattamento e diritti dell’interessato.' },
      { titolo: 'Registro Pubblico delle Opposizioni', url: 'https://www.registrodelleopposizioni.it/', nota: 'Il registro con cui una persona si oppone alle chiamate promozionali.' },
    ],
    // Rimandi ai servizi di cui l’articolo parla: senza, il blog non porta
    // da nessuna parte.
    collegamenti: [
      { href: '/servizi/segretaria-telefonica-ai', label: 'Assistente telefonico AI', nota: 'Risponde mentre lavori, con il tuo listino e i tuoi orari.' },
      { href: '/servizi/agenda-clienti-whatsapp', label: 'Agenda e recupero clienti', nota: 'Chi non torna da mesi rientra fra le priorità del giorno.' },
      { href: '/settori/parrucchieri', label: 'Parrucchieri e barberie', nota: 'Come funziona in salone, con le mani occupate.' },
      { href: '/settori/studi-dentistici', label: 'Studi dentistici', nota: 'Richiami di igiene e cure preventivate mai iniziate.' },
    ],
    url_pubblicato: `${SITE_URL}/blog/chiamate-perse-agenda-vuota-cosa-fare`,
  },
  {
    slug: 'ai-act-obblighi-pmi-cosa-fare',
    meta_title: 'AI Act: quali obblighi ha davvero una PMI | SWA',
    meta_description: 'Quali obblighi dell’AI Act riguardano una PMI italiana, la differenza fra chi sviluppa e chi usa l’AI, le scadenze e la formazione del personale già in vigore.',
    h1: 'AI Act: che cosa riguarda davvero una piccola impresa',
    intro: 'Il regolamento europeo sull’intelligenza artificiale è in vigore e le regole principali si applicano dal 2 agosto 2026. Molte imprese non sanno di rientrarci, perché pensano che riguardi chi sviluppa sistemi AI. In realtà riguarda anche chi li usa, e usare un assistente che risponde ai clienti o uno strumento che scrive testi basta a far scattare qualche obbligo. Non tutti, però, e la differenza conta.',
    sezioni: [
      {
        h2: 'Le date, in ordine',
        paragrafi: [
          'L’AI Act è il regolamento (UE) 2024/1689. È entrato in vigore il 1° agosto 2024, ma non tutto si applica subito: le scadenze sono scaglionate, ed è il motivo per cui molti hanno smesso di seguirlo dopo i primi titoli di giornale.',
          'Le pratiche vietate — quelle a rischio inaccettabile — si applicano dal 2 febbraio 2025, insieme all’obbligo di garantire una alfabetizzazione adeguata sull’AI a chi la usa in azienda. Dal 2 agosto 2025 valgono le regole sui modelli di uso generale, la governance e le sanzioni. Dal 2 agosto 2026 si applica la parte generale del regolamento, quindi gli obblighi che toccano la maggior parte delle imprese. Per alcuni sistemi ad alto rischio legati a prodotti regolamentati la scadenza è il 2 agosto 2027.',
        ],
        lista_punti: [
          '1 agosto 2024: entrata in vigore',
          '2 febbraio 2025: pratiche vietate e obbligo di alfabetizzazione',
          '2 agosto 2025: modelli di uso generale, governance, sanzioni',
          '2 agosto 2026: applicazione generale del regolamento',
          '2 agosto 2027: alcuni sistemi ad alto rischio legati a prodotti',
        ],
      },
      {
        h2: 'Fornitore o utilizzatore: la domanda da cui parte tutto',
        paragrafi: [
          'Il regolamento assegna obblighi diversi in base al ruolo. Chi sviluppa un sistema AI e lo mette sul mercato con il proprio nome è un fornitore, e ha gli obblighi più pesanti. Chi invece usa un sistema sviluppato da altri, sotto la propria autorità e nell’ambito della propria attività, è un utilizzatore, e ha obblighi molto più contenuti.',
          'La grande maggioranza delle piccole imprese sta nella seconda categoria: usa strumenti fatti da altri. Un centro estetico che attiva un assistente telefonico non diventa un fornitore di AI, così come non diventa un produttore di software perché usa un gestionale.',
          'Attenzione però: il ruolo può cambiare. Se un sistema viene modificato in modo sostanziale, oppure se viene rivenduto con il proprio marchio, chi lo fa può assumere gli obblighi del fornitore. È la verifica che va fatta prima, non dopo.',
        ],
      },
      {
        h2: 'I livelli di rischio, e perché quasi tutto ciò che usi non è ad alto rischio',
        paragrafi: [
          'Il regolamento classifica i sistemi per rischio. Alcune pratiche sono vietate del tutto: manipolazione che provoca danno, sfruttamento di vulnerabilità, punteggio sociale, alcune forme di riconoscimento delle emozioni sul lavoro.',
          'Poi ci sono i sistemi ad alto rischio, quelli usati in ambiti come selezione del personale, accesso al credito, istruzione, alcuni servizi essenziali. Qui gli obblighi sono seri.',
          'Sotto, c’è la fascia che riguarda la stragrande maggioranza degli usi aziendali quotidiani: strumenti che scrivono testi, rispondono al telefono, organizzano appuntamenti. Non sono ad alto rischio, ma non sono nemmeno esenti da tutto: hanno obblighi di trasparenza.',
        ],
      },
      {
        h2: 'Trasparenza: la regola che tocca chi risponde ai clienti',
        paragrafi: [
          'Se una persona interagisce con un sistema di AI, deve poterlo sapere, a meno che non sia già evidente dal contesto. Tradotto: un assistente che risponde al telefono o in chat non dovrebbe far credere di essere una persona.',
          'Ci sono poi obblighi sui contenuti generati o manipolati artificialmente, che vanno resi riconoscibili. È il punto che tocca chi produce immagini o video con l’AI, e vale la pena guardarlo con attenzione se se ne fa un uso commerciale.',
          'Il rovescio positivo: dichiarare che è un assistente non allontana i clienti. Quello che li allontana è scoprirlo dopo.',
        ],
      },
      {
        h2: 'L’obbligo di cui quasi nessuno parla: la formazione',
        paragrafi: [
          'Dal febbraio 2025 fornitori e utilizzatori devono adoperarsi perché il personale che si occupa dell’uso dei sistemi AI abbia un livello sufficiente di competenza, tenendo conto delle conoscenze, del contesto e delle persone su cui i sistemi vengono usati.',
          'Non significa mandare tutti a un master. Significa che chi in azienda usa uno strumento AI deve sapere che cosa fa, che cosa non fa e quando fermarsi. È un obbligo di mezzi, e per una piccola impresa si soddisfa con una formazione proporzionata e documentata.',
          'È anche la ragione per cui questo obbligo passa inosservato: non c’è un modulo da compilare né un ente a cui mandarlo. Ma in caso di contestazione, dimostrare di averci pensato fa la differenza.',
        ],
      },
      {
        h2: 'Che cosa fare, in pratica',
        paragrafi: [
          'Il primo passo non è comprare niente: è fare l’inventario. Quali strumenti AI si usano davvero in azienda, chi li usa, su quali dati lavorano e con quali persone entrano in contatto. Spesso la lista è più lunga di quanto ci si aspetti.',
          'Da lì si guarda il ruolo — fornitore o utilizzatore — per ciascuno, si verifica se qualcuno rientra fra le pratiche vietate o ad alto rischio, e si controllano le informazioni date ai clienti quando parlano con un sistema.',
          'Infine i contratti: chi ti fornisce lo strumento che cosa garantisce, dove tiene i dati, che cosa succede se il servizio cambia. Sono clausole che si negoziano prima della firma, non dopo.',
        ],
        lista_punti: [
          'Inventario degli strumenti AI realmente in uso',
          'Ruolo per ciascuno: fornitore o utilizzatore',
          'Verifica delle pratiche vietate e dei casi ad alto rischio',
          'Informazione ai clienti quando parlano con un sistema',
          'Formazione proporzionata di chi li usa, documentata',
          'Contratti con i fornitori: garanzie, dati, continuità',
        ],
      },
    ],
    faq: [
      { domanda: 'L’AI Act riguarda anche chi usa soltanto strumenti fatti da altri?', risposta: 'Sì, con obblighi diversi e più contenuti rispetto a chi sviluppa. Chi usa un sistema AI sotto la propria autorità nell’ambito della propria attività è un utilizzatore e ha comunque doveri, in particolare di trasparenza e di competenza del personale.' },
      { domanda: 'Devo dire ai clienti che rispondo con un assistente AI?', risposta: 'Il regolamento prevede che chi interagisce con un sistema di AI debba poterlo sapere, salvo che sia evidente dal contesto. In pratica un assistente che risponde al telefono o in chat non dovrebbe far credere di essere una persona.' },
      { domanda: 'Usare l’AI per scrivere i post rende la mia azienda ad alto rischio?', risposta: 'In genere no: gli usi di marketing e comunicazione non rientrano nelle categorie ad alto rischio, che riguardano ambiti come selezione del personale, credito o servizi essenziali. Restano però gli obblighi di trasparenza sui contenuti generati artificialmente. La valutazione va fatta sul caso concreto.' },
      { domanda: 'Che cosa rischia chi non si adegua?', risposta: 'Il regolamento prevede sanzioni amministrative, con importi diversi a seconda della violazione: le più alte riguardano le pratiche vietate. L’entità applicabile dipende dalla violazione e dalle dimensioni dell’impresa.' },
      { domanda: 'Basta un documento per essere in regola?', risposta: 'No. Gli obblighi riguardano comportamenti, non moduli: che cosa dici ai clienti, come formi chi usa gli strumenti, che cosa hai verificato prima di attivarli. La documentazione serve a dimostrarlo, non a sostituirlo.' },
    ],
    cta_finale: 'Questo articolo ha finalità informative e non sostituisce il parere sul caso concreto. Stiamo preparando dei video corsi sull’AI Act con l’Avv. Vincenzo Sapone, cassazionista: puoi prenotare il posto dalla pagina della consulenza legale AI.',
    keywords_target: ['AI Act', 'AI Act obblighi PMI', 'regolamento intelligenza artificiale imprese', 'trasparenza AI clienti', 'alfabetizzazione AI'],
    immagine_cover: '/blog/ai-act.webp',
    autore: 'Marco Dibenedetto',
    tempo_lettura_min: 9,
    data_pubblicazione: '2026-09-07T14:00:00.000Z',
    // Fonti primarie: un contenuto ancorato e' piu' facile da citare per un
    // motore di risposta di uno che afferma e basta.
    fonti: [
      { titolo: 'Regolamento (UE) 2024/1689, AI Act', url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj', nota: 'Testo ufficiale su EUR-Lex. Alfabetizzazione all’articolo 4, pratiche vietate all’articolo 5, trasparenza all’articolo 50, sanzioni all’articolo 99.' },
      { titolo: 'Commissione europea, quadro normativo sull’intelligenza artificiale', url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai', nota: 'La pagina istituzionale con il calendario di applicazione.' },
      { titolo: 'Garante per la protezione dei dati personali', url: 'https://www.garanteprivacy.it/', nota: 'L’autorità italiana competente quando l’AI tratta dati personali.' },
    ],
    // Rimandi ai servizi di cui l’articolo parla: senza, il blog non porta
    // da nessuna parte.
    collegamenti: [
      { href: '/consulenza', label: 'Consulenza AI Act e GDPR', nota: 'Erogata dallo Studio Legale BCS, con l’Avv. Vincenzo Sapone.' },
      { href: '/trasparenza-ai', label: 'Come usiamo l’AI', nota: 'Che cosa produciamo con assistenza AI e chi risponde delle scelte.' },
    ],
    url_pubblicato: `${SITE_URL}/blog/ai-act-obblighi-pmi-cosa-fare`,
  },
  {
    slug: 'video-social-aziendali-come-farli-bene',
    meta_title: 'Video per i social aziendali: cosa fa la differenza | SWA',
    meta_description: 'Dove si perde davvero la qualità di un video aziendale: luce, audio e stabilità contano più della fotocamera. Perché conviene girare a blocchi, non uno alla volta.',
    h1: 'Video per i social: cosa cambia con strumenti professionali',
    intro: 'Un telefono recente gira video ottimi, e non è lì che si perde. La differenza la fanno gli strumenti che stanno intorno alla camera — illuminazione controllata, microfoni dedicati, stabilizzazione, ottiche — e chi sa usarli. Sono strumenti professionali, e sono il motivo per cui due video girati nello stesso posto sembrano fatti da due aziende diverse.',
    sezioni: [
      {
        h2: 'Gli strumenti che fanno la differenza',
        paragrafi: [
          'La luce è la prima cosa. Un neon a soffitto crea ombre dure sotto gli occhi e appiattisce tutto il resto; la finestra alle spalle trasforma le persone in sagome scure. Nessuna app corregge una luce sbagliata in fase di ripresa: si può solo rigirare.',
          'L’audio è la seconda, ed è quella sottovalutata di più. Il microfono del telefono raccoglie tutto: il riverbero della stanza, il condizionatore, la strada. La gente perdona un’immagine mediocre, ma smette di guardare un video che si sente male dopo pochi secondi.',
          'La terza è la stabilità, insieme all’inquadratura. Camera a mano, orizzonte storto e soggetto scentrato comunicano fretta. Ed è un peccato, perché il lavoro che stai mostrando spesso è fatto con cura.',
        ],
        lista_punti: [
          'Luce: morbida e davanti al soggetto, mai alle spalle',
          'Audio: microfono dedicato, lontano da riverbero e rumori',
          'Stabilità: treppiede o gimbal, orizzonte dritto',
          'Verticale 9:16: si gira per il formato in cui verrà visto',
        ],
      },
      {
        h2: 'Girare a blocchi, non un video alla volta',
        paragrafi: [
          'L’errore organizzativo più comune è produrre un video quando serve. Significa rimettere in piedi luci, audio e attrezzatura ogni volta, per un contenuto solo, e finisce che non si gira più niente.',
          'Chi lavora bene fa il contrario: concentra le riprese in una sessione e ne esce con il materiale di settimane. Le stesse luci montate una volta servono per dieci scene, e il costo per contenuto crolla.',
          'Questo però richiede che il piano editoriale esista prima delle riprese. Bisogna sapere che cosa si pubblicherà nelle settimane successive, altrimenti si gira materiale generico che poi non serve a niente.',
        ],
      },
      {
        h2: 'Serve una persona davanti alla camera?',
        paragrafi: [
          'Dipende, e non c’è una risposta unica. I contenuti con un volto creano più familiarità: chi guarda associa un viso all’attività e la ricorda. Quelli senza volto — mani che lavorano, dettagli, prima e dopo — funzionano molto bene quando il mestiere è visivo, e non richiedono che qualcuno sia a suo agio in ripresa.',
          'Il punto è la sostenibilità. Se il titolare non è a suo agio, si vede, e dopo due video smette. Meglio un formato senza volto fatto con continuità che un formato parlato abbandonato dopo tre settimane.',
          'Le alternative sono tre: compare il titolare, compare qualcuno dello staff, oppure si porta un volto professionista. La scelta fra maschile e femminile si fa guardando a chi parla il tuo servizio, non alle preferenze personali.',
        ],
      },
      {
        h2: 'Che cosa preparare prima del giorno delle riprese',
        paragrafi: [
          'Una giornata di riprese improvvisata produce poco e stanca tutti. Quella preparata produce settimane di contenuti e finisce prima.',
          'Serve sapere quali scene servono e per quali messaggi, quali spazi sono utilizzabili e in che ore la luce naturale aiuta, chi compare e in quali momenti si può girare senza fermare il lavoro. E serve avere gli ambienti in ordine: un dettaglio fuori posto in campo si nota in un video molto più che dal vivo.',
        ],
        lista_punti: [
          'Elenco delle scene, legato al piano editoriale dei mesi successivi',
          'Sopralluogo su spazi, luce naturale e rumore',
          'Fasce orarie in cui girare senza bloccare l’attività',
          'Chi compare, e con quale ruolo',
          'Ambienti sistemati: in campo si vede tutto',
        ],
      },
      {
        h2: 'Le riprese non bastano: contano montaggio e continuità',
        paragrafi: [
          'Del girato la maggior parte non viene usata, ed è normale. Il valore lo produce la selezione: quali secondi tenere, dove tagliare, che cosa mettere nei primi tre secondi, che sono quelli che decidono se qualcuno resta.',
          'I sottotitoli non sono un accessorio: gran parte dei video sui social viene guardata senza audio. Un video senza testo in sovrimpressione perde una fetta consistente di pubblico prima ancora di iniziare.',
          'E poi c’è la continuità. Un bel video ogni tanto conta molto meno di contenuti regolari fatti decentemente. La costanza è quello che gli algoritmi premiano e che il pubblico riconosce.',
        ],
      },
    ],
    faq: [
      { domanda: 'Con un telefono di fascia alta si possono fare video professionali?', risposta: 'Sì, la camera non è il limite: molti contenuti professionali si girano con telefoni recenti. Quello che serve intorno sono luce controllata, audio pulito, una direzione della scena e il tempo per farlo. Sono quelli gli elementi che mancano, non i megapixel.' },
      { domanda: 'Quanti contenuti escono da una giornata di riprese?', risposta: 'Dipende dal numero di scene e di location, ma girando a blocchi una sessione copre di norma diverse settimane di pubblicazioni. È il motivo per cui conviene concentrare le riprese invece di produrre un video alla volta.' },
      { domanda: 'Devo comparire io nei video?', risposta: 'No. Può comparire una persona dello staff, si può usare un volto professionista, oppure si possono costruire contenuti senza volto basati su mani, dettagli e lavorazione. Conta la sostenibilità nel tempo più della scelta in sé.' },
      { domanda: 'Bisogna chiudere l’attività per girare?', risposta: 'Di norma no, e spesso è controproducente: le riprese fatte mentre si lavora sono le più credibili. Le fasce orarie si concordano in sopralluogo per stare fuori dai momenti di punta.' },
      { domanda: 'I video servono se pubblico già foto?', risposta: 'Le due cose non si escludono. Il video regge meglio la distribuzione sulla maggior parte delle piattaforme, ma un piano fatto solo di video è difficile da sostenere: la combinazione di formati è quasi sempre più solida.' },
    ],
    cta_finale: 'Se il materiale è il collo di bottiglia, veniamo noi a girarlo: fotografo, attrezzatura e un volto se serve, con montaggio e pubblicazione già dentro il piano social.',
    keywords_target: ['video per social aziendali', 'come fare video per instagram azienda', 'riprese video aziendali', 'reel professionali PMI', 'video marketing piccole imprese'],
    immagine_cover: '/blog/video-produzione.webp',
    autore: 'Marco Dibenedetto',
    tempo_lettura_min: 8,
    data_pubblicazione: '2026-09-07T16:00:00.000Z',
    // Fonti primarie: un contenuto ancorato e' piu' facile da citare per un
    // motore di risposta di uno che afferma e basta.
    fonti: [
      { titolo: 'Google Search Central, buone pratiche per i video', url: 'https://developers.google.com/search/docs/appearance/video', nota: 'Come rendere un video comprensibile e indicizzabile.' },
      { titolo: 'Instagram, account professionali e strumenti per le aziende', url: 'https://help.instagram.com/1038071743007909', nota: 'I formati e gli strumenti che la piattaforma mette a disposizione delle aziende.' },
    ],
    // Rimandi ai servizi di cui l’articolo parla: senza, il blog non porta
    // da nessuna parte.
    collegamenti: [
      { href: '/servizi/video-produzione', label: 'Riprese video in azienda', nota: 'Fotografo, luci e ottiche, girate dove lavori.' },
      { href: '/servizi/gestione-social-media', label: 'Gestione social multicanale', nota: 'Dove finiscono i video girati: piano, montaggio e uscita.' },
    ],
    url_pubblicato: `${SITE_URL}/blog/video-social-aziendali-come-farli-bene`,
  },
  {
    slug: 'ricerca-clienti-b2b-come-costruire-lista',
    meta_title: 'Ricerca clienti B2B: una lista che serve davvero | SWA',
    meta_description: 'Perché i database comprati non funzionano, come si definisce il cliente ideale, quali segnali pubblici verificare e che cosa dice il GDPR sul contatto B2B.',
    h1: 'Ricerca clienti B2B: come si costruisce una lista che serve davvero',
    intro: 'Comprare un database di aziende è la scorciatoia più tentata e quella che delude di più. Non perché i dati siano falsi, ma perché rispondono alla domanda sbagliata: dicono quali aziende esistono, non quali hanno motivo di ascoltarti adesso. La differenza fra un elenco e una lista di lavoro sta tutta lì.',
    sezioni: [
      {
        h2: 'Perché gli elenchi comprati rendono poco',
        paragrafi: [
          'Un database venduto a chiunque è già stato contattato da chiunque. Le aziende dentro hanno ricevuto la stessa email da decine di fornitori, e hanno imparato a ignorarla.',
          'C’è poi un problema di coerenza. I filtri disponibili — settore, dimensione, area — sono grossolani rispetto a quello che serve davvero. Due aziende dello stesso codice ATECO e della stessa dimensione possono avere bisogni opposti.',
          'Infine i dati invecchiano. Le persone cambiano ruolo, le aziende chiudono sedi, gli indirizzi smettono di funzionare. Un elenco fermo a un anno fa contiene una percentuale di rumore che nessuno ti dichiara.',
        ],
      },
      {
        h2: 'Si parte dal cliente ideale, non dal mercato',
        paragrafi: [
          'La domanda giusta non è «quante aziende posso contattare», ma «a quali aziende sono già utile». La risposta si trova guardando i clienti che hai: quali sono i più redditizi, quali tornano, quali portano meno problemi.',
          'Da lì emergono i criteri veri, che quasi mai coincidono con i filtri di un database. Possono essere il modello organizzativo, il fatto di avere o non avere una figura interna dedicata, la fase in cui si trova l’azienda.',
          'Altrettanto importanti sono i criteri di esclusione: chi non vuoi come cliente. Definirli in anticipo evita di riempire la lista di aziende che ti farebbero perdere tempo.',
        ],
        lista_punti: [
          'Guarda i clienti attuali migliori, non il mercato in astratto',
          'Cerca i criteri veri, non quelli che il database offre',
          'Scrivi anche chi escludere, e perché',
          'Definisci che cosa rende un’azienda contattabile adesso',
        ],
      },
      {
        h2: 'I segnali pubblici che dicono qualcosa',
        paragrafi: [
          'Quello che distingue una lista utile è la presenza di un motivo. Non basta che l’azienda esista e sia del settore giusto: serve un segnale che spieghi perché ha senso parlarle ora.',
          'I segnali utili sono pubblici e verificabili: un sito rifatto da poco o fermo da anni, l’apertura di una sede, una ricerca di personale che rivela una direzione, la presenza o l’assenza su un canale rilevante per quel mercato.',
          'La regola operativa è semplice: ogni voce della lista deve avere accanto la fonte da cui è stata tratta. Se una riga non ha una fonte consultabile, non è informazione ma supposizione, e in una telefonata si sente.',
        ],
      },
      {
        h2: 'Che aspetto ha una lista fatta bene',
        paragrafi: [
          'Una lista utile è corta e ordinata. Trenta aziende verificate valgono più di tremila righe che nessuno guarderà mai, perché trenta si possono davvero lavorare.',
          'Ogni voce dovrebbe portare tre cose: chi è l’azienda, perché è coerente con il tuo cliente ideale, e da dove viene l’informazione. Con questi tre elementi chi telefona sa già che cosa dire.',
          'Vanno tolti i duplicati, le aziende fuori target e quelle su cui i dati non sono abbastanza solidi. Una lista pulita è più corta, e va bene così.',
        ],
        lista_punti: [
          'Poche aziende verificate invece di molte righe grezze',
          'Per ognuna: il motivo e la fonte consultabile',
          'Duplicati e profili fuori target rimossi',
          'Ordine di priorità, non un elenco piatto',
        ],
      },
      {
        h2: 'Il contatto: che cosa dice la normativa',
        paragrafi: [
          'Il fatto che un indirizzo sia pubblico non lo rende automaticamente utilizzabile per qualsiasi scopo. Nel contatto commerciale verso imprese esistono margini, ma vanno valutati caso per caso, insieme alla base giuridica su cui ci si appoggia.',
          'In concreto: informare chi viene contattato, rendere semplice l’opposizione, non riutilizzare i dati per finalità diverse da quelle dichiarate. E tenere traccia di dove i dati sono stati raccolti, che è utile a te prima ancora che a un’autorità.',
          'Per questo motivo ricerca e contatto vanno tenuti distinti. Costruire una lista qualificata è un lavoro di analisi; contattarla è un’attività separata, che va impostata con attenzione.',
        ],
      },
    ],
    faq: [
      { domanda: 'Perché non comprare semplicemente un database?', risposta: 'Perché risponde alla domanda sbagliata: dice quali aziende esistono, non quali hanno motivo di ascoltarti adesso. Inoltre è stato venduto anche ai tuoi concorrenti e i dati invecchiano rapidamente.' },
      { domanda: 'Quante aziende servono per iniziare?', risposta: 'Poche e lavorate bene rendono più di molte e ignorate. Un primo ciclo su una trentina di aziende verificate permette di capire se il profilo cliente è quello giusto prima di allargare.' },
      { domanda: 'La ricerca include l’invio dei messaggi?', risposta: 'Sono due attività diverse. La ricerca produce una lista qualificata con fonti e motivazioni; il contatto ha regole proprie, anche dal punto di vista normativo, e va impostato separatamente.' },
      { domanda: 'Si possono garantire appuntamenti?', risposta: 'No. Si può garantire il lavoro di ricerca e verifica concordato. Gli appuntamenti dipendono anche da offerta, messaggio e processo commerciale, che non sono nella disponibilità di chi costruisce la lista.' },
      { domanda: 'Come si verifica che i dati siano attendibili?', risposta: 'Riportando per ogni voce la fonte pubblica da cui proviene, così che possa essere controllata. Una riga senza fonte consultabile va trattata come una supposizione, non come un’informazione.' },
    ],
    cta_finale: 'Se vuoi partire da criteri chiari invece che da un elenco comprato, il Pilot di ricerca clienti B2B analizza fino a trenta aziende coerenti e consegna una lista con fonti e priorità.',
    keywords_target: ['ricerca clienti B2B', 'lista aziende target', 'lead generation B2B', 'profilo cliente ideale', 'database aziende'],
    immagine_cover: '/blog/ricerca-b2b.webp',
    autore: 'Marco Dibenedetto',
    tempo_lettura_min: 8,
    data_pubblicazione: '2026-09-07T17:30:00.000Z',
    // Fonti primarie: un contenuto ancorato e' piu' facile da citare per un
    // motore di risposta di uno che afferma e basta.
    fonti: [
      { titolo: 'Regolamento (UE) 2016/679, GDPR', url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj', nota: 'Testo ufficiale su EUR-Lex: legittimo interesse, informativa e diritto di opposizione.' },
      { titolo: 'Registro Pubblico delle Opposizioni', url: 'https://www.registrodelleopposizioni.it/', nota: 'Da consultare prima di qualsiasi contatto telefonico promozionale.' },
      { titolo: 'Garante per la protezione dei dati personali', url: 'https://www.garanteprivacy.it/', nota: 'L’autorità che vigila sui contatti commerciali non richiesti.' },
    ],
    // Rimandi ai servizi di cui l’articolo parla: senza, il blog non porta
    // da nessuna parte.
    collegamenti: [
      { href: '/servizi/ricerca-clienti-b2b', label: 'Ricerca Clienti B2B', nota: 'Il Pilot: fino a 30 aziende verificate, con fonti e priorità.' },
      { href: '/settori/imprese-di-pulizia', label: 'Imprese di pulizia', nota: 'Un settore dove la lista si costruisce per zona e per tipo di edificio.' },
    ],
    url_pubblicato: `${SITE_URL}/blog/ricerca-clienti-b2b-come-costruire-lista`,
  },
]

export function getSwaBlogArticle(slug: string) {
  return SWA_BLOG_ARTICLES.find(article => article.slug === slug) || null
}
