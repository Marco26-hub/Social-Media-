import Link from 'next/link'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'
import FloatingNavigation from './FloatingNavigation'
import AiCasaScena from './AiCasaScena'
import { metodoServizio } from '@/lib/metodo'
import { SITE_URL } from '@/lib/site-config'
import styles from './ai-casa-landing.module.css'

const PERCORSO = '/servizi/ai-a-casa-tua'

/** Il listino. Sta qui perché lo leggono sia le schede sia i dati strutturati:
 *  un prezzo scritto due volte prima o poi diverge, e il prezzo che finisce nei
 *  dati strutturati è quello che i motori mostrano fuori dal sito. */
const PACCHETTI = [
  {
    id: 'installazione',
    nome: 'Installazione',
    perChi: 'Hai già il Mac',
    prezzo: 490,
    sintesi: 'Un intervento sulla macchina che usi già, se regge il lavoro.',
    voci: [
      'Installazione completa e taratura',
      'Collaudo della macchina',
      '30 minuti di formazione',
      '30 giorni di assistenza',
    ],
  },
  {
    id: 'chiavi-in-mano',
    nome: 'Chiavi in mano',
    perChi: 'Professionisti e studi',
    prezzo: 990,
    scelto: true,
    sintesi: 'Dalla scelta della macchina alla consegna, acceso e collaudato.',
    voci: [
      'Scelta della configurazione e ordine assistito',
      'Installazione, taratura e collaudo registrato',
      '1 ora di formazione e documento scritto',
      '90 giorni di assistenza',
    ],
  },
  {
    id: 'studio',
    nome: 'Studio',
    perChi: 'Fino a 3 postazioni',
    prezzo: 1990,
    sintesi: 'Tre macchine, oppure una sola condivisa con un profilo a testa.',
    voci: [
      'Profili separati per persona',
      'Procedure scritte per il gruppo',
      '2 ore di formazione',
      '6 mesi di assistenza',
    ],
  },
  {
    id: 'pmi',
    nome: 'PMI',
    perChi: 'Da 4 a 10 postazioni',
    prezzo: 4900,
    sintesi:
      'L’AI dentro l’azienda, sui documenti che avete già, con regole scritte su cosa può leggere e cosa no.',
    voci: [
      'Macchina condivisa in rete, permessi per reparto',
      'Formazione al gruppo in due sessioni',
      'Referente unico',
      '12 mesi di assistenza',
    ],
  },
] as const

/** Le domande. Stesso motivo del listino: la pagina e il nodo FAQPage devono
 *  dire la stessa cosa, e le risposte sono già scritte per stare in piedi da
 *  sole — che è quello che serve a un assistente che le cita. */
const DOMANDE = [
  {
    q: 'Me lo installo da solo, no?',
    a: 'Puoi. Il software si scarica gratis, e il primo giorno funziona. Poi arriva la sessione lunga, la memoria finisce e il Mac si inchioda mentre stai lavorando. Quello che compri qui è la macchina che non si inchioda: tarata, provata e con qualcuno a cui scrivere.',
  },
  {
    q: 'È come ChatGPT?',
    a: 'Si usa allo stesso modo, ma gira sul tuo computer. Non ha il mondo intero dentro e non naviga: in cambio non manda i tuoi documenti a nessuno, non ha limiti mensili e funziona anche senza rete.',
  },
  {
    q: 'E se voglio usare anche un modello in cloud?',
    a: 'Si può fare, e a volte conviene: per certi lavori i modelli grandi online sono più bravi. Ma va detto chiaro: quello che mandi a un servizio in cloud esce dalla tua macchina e finisce sotto le condizioni di quel fornitore. Per questo consegniamo le macchine con il solo modello locale attivo. Il collegamento a un servizio esterno lo aggiungiamo solo se ce lo chiedi, resta separato, e prima ti diciamo quali dati passano di là.',
  },
  {
    q: 'Posso usarlo sul Mac che ho già?',
    a: 'Dipende dalla macchina, e te lo diciamo prima: se non regge, te lo diciamo invece di venderti un’installazione che ti rallenta il lavoro.',
  },
  {
    q: 'Se si rompe qualcosa?',
    a: 'Il Mac ha la garanzia del produttore. Sulla parte che installiamo noi restiamo raggiungibili: si riprende la configurazione e si rimette a posto senza rifare tutto da zero.',
  },
  {
    q: 'Quanto costa?',
    a: 'Il nostro lavoro parte da 490 € e il pacchetto più scelto costa 990 €. La macchina la paghi ad Apple al suo prezzo, e dipende da quanta memoria ti serve davvero: te lo diciamo dopo dieci minuti di telefonata.',
  },
] as const
const WHATSAPP_NUMBER = '393477196603'
const WHATSAPP = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  'Ciao! Vorrei un Mac con l’AI gia’ installata.',
)}`

/**
 * Landing verticale "AI a casa tua": un Mac consegnato con l'intelligenza
 * artificiale gia' installata, tarata sulla macchina e collaudata.
 *
 * Due regole che reggono tutti i testi di questa pagina.
 *
 * 1. Niente cifre inventate. Non ci sono ancora prezzi hardware, tempi di
 *    consegna ne' condizioni di garanzia decisi: finche' non esistono, la
 *    pagina porta a una conversazione e non espone un listino.
 * 2. Si vende il risultato, non la ricetta. Nomi dei modelli, quantizzazioni,
 *    script, porte e variabili d'ambiente non compaiono: sono il motivo per cui
 *    la macchina non si blocca, e restano nostri.
 */
export default function AiCasaLanding() {
  const urlPagina = `${SITE_URL}${PERCORSO}`
  const fasi = metodoServizio('ai-a-casa-tua').fasi

  // Le altre pagine di servizio passano da MarketingDetailPage, che costruisce
  // questo grafo da sé. Questa ha un'impaginazione propria, quindi il grafo si
  // scrive qui — ma nella stessa forma, o due pagine sorelle direbbero ai
  // motori due cose diverse sullo stesso tipo di servizio.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${urlPagina}#webpage`,
        url: urlPagina,
        name: 'AI a casa tua',
        inLanguage: 'it-IT',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        // Quali blocchi hanno senso letti ad alta voce da un assistente: il
        // titolo, l'attacco e le domande, che sono già scritte per stare in
        // piedi fuori dalla pagina.
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '[class*="lead"]', '[class*="faq"] summary', '[class*="faq"] p'],
        },
        about: { '@id': `${urlPagina}#service` },
      },
      {
        '@type': 'Service',
        '@id': `${urlPagina}#service`,
        name: 'AI a casa tua',
        serviceType: 'Installazione di intelligenza artificiale locale su Mac',
        description:
          'Mac e Mac mini consegnati con l’intelligenza artificiale già installata, tarata sulla memoria della macchina e collaudata. Il modello lavora sul computer del cliente, senza cloud e senza canone.',
        provider: { '@id': `${SITE_URL}/#organization` },
        areaServed: { '@type': 'Country', name: 'Italia' },
        url: urlPagina,
        // I prezzi dichiarati sono quelli del nostro lavoro. Il computer non
        // entra: non lo vendiamo, e metterlo qui farebbe credere il contrario
        // a chi legge solo i dati strutturati.
        offers: PACCHETTI.map(pacchetto => ({
          '@type': 'Offer',
          name: pacchetto.nome,
          description: pacchetto.sintesi,
          price: pacchetto.prezzo,
          priceCurrency: 'EUR',
          url: `${urlPagina}#prezzi`,
          category: pacchetto.perChi,
          priceSpecification: {
            '@type': 'PriceSpecification',
            price: pacchetto.prezzo,
            priceCurrency: 'EUR',
            valueAddedTaxIncluded: false,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Servizi', item: `${SITE_URL}/servizi` },
          { '@type': 'ListItem', position: 3, name: 'AI a casa tua', item: urlPagina },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: DOMANDE.map(domanda => ({
          '@type': 'Question',
          name: domanda.q,
          acceptedAnswer: { '@type': 'Answer', text: domanda.a },
        })),
      },
      {
        '@type': 'HowTo',
        '@id': `${urlPagina}#howto`,
        name: 'Come funziona AI a casa tua, passo per passo',
        description:
          'Dal primo colloquio alla macchina consegnata accesa, con l’intelligenza artificiale installata e collaudata.',
        inLanguage: 'it-IT',
        step: fasi.map((fase, indice) => ({
          '@type': 'HowToStep',
          position: indice + 1,
          name: fase.title,
          text: fase.text,
          url: `${urlPagina}#come-funziona`,
        })),
      },
    ],
  }

  return (
    <main id="main-content" className={styles.pagina}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <PublicHeader ctaHref={WHATSAPP} ctaLabel="Parliamo della macchina" />

      {/* Il palco: l'unica parte scura della pagina, dove stanno le luci. */}
      <section className={styles.palco} aria-labelledby="titolo-ai-casa">
        <div className={styles.hero}>
          <div className={styles.heroTesto}>
            {/* Le briciole mancavano: le pagine sorelle le hanno, e il nodo
                BreadcrumbList di questa pagina dichiarava un percorso che sullo
                schermo non esisteva. */}
            <nav className={styles.briciole} aria-label="Percorso">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/servizi">Servizi</Link>
              <span aria-hidden="true">/</span>
              <span>AI a casa tua</span>
            </nav>

            <p className={`${styles.occhiello} ${styles.occhielloChiaro}`}>
              AI locale · Mac configurati da SWA
            </p>
            <h1 id="titolo-ai-casa" className={styles.titolo}>
              AI a casa tua.
            </h1>
            <p className={styles.lead}>
              Scegliamo insieme il Mac giusto, lo ordini tu ad Apple, e te lo mettiamo in mano
              con l&rsquo;intelligenza artificiale già dentro: installata, tarata sulla macchina e
              collaudata. Si accende e funziona. I tuoi documenti restano sulla tua scrivania.
            </p>

            <div className={styles.azioni}>
              <a className={styles.azionePrimaria} href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                Parliamo della macchina
              </a>
              <a className={styles.azioneSecondaria} href="#come-funziona">
                Come funziona
              </a>
            </div>

            <p className={styles.prove}>
              <span>Gira sul tuo Mac</span>
              <span>I dati restano sulla macchina</span>
              <span>Funziona senza rete</span>
              <span>Un solo pulsante</span>
            </p>
          </div>
        </div>

        <AiCasaScena />
      </section>

      {/* Perche' locale invece che in abbonamento. */}
      <section className={styles.sezione} aria-labelledby="titolo-perche">
        <p className={styles.occhiello}>Perché sulla tua macchina</p>
        <h2 id="titolo-perche" className={styles.titoloSezione}>
          L&rsquo;intelligenza artificiale in locale non è una rinuncia. È il contrario.
        </h2>
        <p className={styles.introSezione}>
          Le tre cose che cambiano quando il modello gira sul computer che hai davanti,
          invece che a casa di qualcun altro.
        </p>

        <div className={styles.griglia3}>
          <article className={styles.card}>
            <p className={styles.cardNumero}>01</p>
            <h3 className={styles.cardTitolo}>I documenti restano tuoi</h3>
            <p className={styles.cardTesto}>
              Preventivi, contratti, elenchi clienti: il modello li legge sulla macchina. Non
              vengono caricati da nessuna parte, quindi non c&rsquo;è un fornitore a cui
              chiedere che fine hanno fatto.
            </p>
          </article>

          <article className={styles.card}>
            <p className={styles.cardNumero}>02</p>
            <h3 className={styles.cardTitolo}>Nessun canone che cresce</h3>
            <p className={styles.cardTesto}>
              La macchina la compri una volta. Non ci sono crediti da ricaricare, limiti mensili o
              aumenti di listino decisi altrove. La manutenzione, se la vuoi, è una tua scelta:
              senza, il sistema continua a funzionare lo stesso.
            </p>
          </article>

          <article className={styles.card}>
            <p className={styles.cardNumero}>03</p>
            <h3 className={styles.cardTitolo}>Funziona anche senza rete</h3>
            <p className={styles.cardTesto}>
              In treno, in cantiere, in aereo, con la linea che va e viene. L&rsquo;AI è nel
              computer: se si accende il Mac, funziona.
            </p>
          </article>
        </div>
      </section>

      {/* Il percorso, in quattro passi. */}
      <section className={styles.sezione} id="come-funziona" aria-labelledby="titolo-come">
        <p className={styles.occhiello}>Come funziona</p>
        <h2 id="titolo-come" className={styles.titoloSezione}>
          Dalla telefonata alla macchina accesa sulla tua scrivania.
        </h2>

        <div className={styles.griglia4}>
          <article className={styles.card}>
            <p className={styles.cardNumero}>Passo 01</p>
            <h3 className={styles.cardTitolo}>Sentiamo cosa ti serve</h3>
            <p className={styles.cardTesto}>
              Che lavoro fai fare all&rsquo;AI, su quali documenti, quante ore al giorno. Da qui
              esce il taglio di macchina giusto, non dal catalogo.
            </p>
          </article>

          <article className={styles.card}>
            <p className={styles.cardNumero}>Passo 02</p>
            <h3 className={styles.cardTitolo}>Scegliamo la macchina</h3>
            <p className={styles.cardTesto}>
              Mac mini se resta sulla scrivania, portatile se ti segue. La memoria decide quanto
              lunga può essere una conversazione: è il numero che conta davvero.
            </p>
          </article>

          <article className={styles.card}>
            <p className={styles.cardNumero}>Passo 03</p>
            <h3 className={styles.cardTitolo}>Installiamo e tariamo</h3>
            <p className={styles.cardTesto}>
              Non &ldquo;installiamo un programma&rdquo;: tariamo il sistema su quella macchina,
              perché regga il lavoro lungo senza rallentare tutto il resto.
            </p>
          </article>

          <article className={styles.card}>
            <p className={styles.cardNumero}>Passo 04</p>
            <h3 className={styles.cardTitolo}>Collaudo e consegna</h3>
            <p className={styles.cardTesto}>
              La macchina parte solo dopo una prova lunga, registrata. Te la consegniamo accesa,
              e restiamo il tempo che serve a vedere insieme come si usa.
            </p>
          </article>
        </div>
      </section>

      {/* Cosa trova acceso il primo giorno. */}
      <section className={styles.sezione} aria-labelledby="titolo-primo-giorno">
        <div className={styles.fascia}>
          <div>
            <p className={`${styles.occhiello} ${styles.occhielloChiaro}`}>Il primo giorno</p>
            <h2 id="titolo-primo-giorno" className={styles.titoloSezione}>
              Apri il Mac e c&rsquo;è già tutto.
            </h2>
            <p className={styles.introSezione}>
              Nessuna installazione da fare, nessuna configurazione da capire, nessun terminale.
            </p>
          </div>

          <div className={styles.elenco}>
            <div className={styles.voce}>
              <p className={styles.voceTitolo}>Un pulsante nel Dock</p>
              <p className={styles.voceTesto}>
                Lo premi, scegli cosa ti serve, lavori. Quando chiudi, la macchina torna libera da
                sola.
              </p>
            </div>
            <div className={styles.voce}>
              <p className={styles.voceTitolo}>Sai sempre cosa sta facendo</p>
              <p className={styles.voceTesto}>
                In alto vedi se l&rsquo;AI è accesa e quanta memoria resta. Niente attese al
                buio.
              </p>
            </div>
            <div className={styles.voce}>
              <p className={styles.voceTitolo}>Il Mac resta usabile</p>
              <p className={styles.voceTesto}>
                Mentre l&rsquo;AI lavora continui con posta, browser e fogli di calcolo. La macchina
                non si pianta: è il motivo per cui esiste questo servizio.
              </p>
            </div>
            <div className={styles.voce}>
              <p className={styles.voceTitolo}>Istruzioni scritte in italiano</p>
              <p className={styles.voceTesto}>
                Due pagine, non un manuale. E un numero a cui scrivere quando qualcosa non torna.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* I tagli. Nessuna cifra promessa: la scelta si fa insieme. */}
      <section className={styles.sezione} aria-labelledby="titolo-tagli">
        <p className={styles.occhiello}>Che macchina serve</p>
        <h2 id="titolo-tagli" className={styles.titoloSezione}>
          La memoria decide quanto lunga può essere una conversazione.
        </h2>
        <p className={styles.introSezione}>
          È l&rsquo;unica regola che conta davvero, e vale per qualsiasi Mac: più
          memoria, più lungo il discorso che l&rsquo;AI riesce a tenere a mente prima di
          perdere il filo.
        </p>

        <div className={styles.griglia3}>
          <article className={styles.taglio}>
            <div className={styles.taglioBarra} />
            <h3 className={styles.taglioNome}>Scrivania</h3>
            <p className={styles.taglioRuolo}>Mac mini</p>
            <p className={styles.taglioTesto}>
              Per chi lavora da fermo: la macchina sta accesa, l&rsquo;AI è sempre pronta e
              costa meno di un portatile a parità di memoria.
            </p>
          </article>

          <article className={styles.taglio}>
            <div className={styles.taglioBarra} />
            <h3 className={styles.taglioNome}>In giro</h3>
            <p className={styles.taglioRuolo}>Portatile</p>
            <p className={styles.taglioTesto}>
              Per chi va dai clienti. Stessa AI, stesso pulsante, anche senza linea: in sala
              d&rsquo;attesa o in cantiere cambia poco.
            </p>
          </article>

          <article className={styles.taglio}>
            <div className={styles.taglioBarra} />
            <h3 className={styles.taglioNome}>Lavoro lungo</h3>
            <p className={styles.taglioRuolo}>Memoria alta</p>
            <p className={styles.taglioTesto}>
              Per chi lavora su documenti lunghi e sessioni di ore. Qui la memoria in più non
              è un vezzo: è la differenza tra ricominciare da capo e continuare.
            </p>
          </article>
        </div>

        <p className={styles.nota}>
          Il taglio esatto lo scegliamo insieme, sul lavoro che devi fare: consigliamo solo
          configurazioni che abbiamo provato davvero, e i riferimenti che usiamo sono misurati sulle
          nostre macchine, non presi da una scheda tecnica. Prezzo della macchina, tempi di consegna
          e garanzia sono quelli di Apple: te li mettiamo per iscritto insieme alla configurazione,
          prima che tu ordini qualsiasi cosa.
        </p>
      </section>

      {/* Conformità.

          Qui si vende, non si spiega la norma: niente articoli, niente date,
          niente importi di sanzione. Il dettaglio normativo sta nei termini e
          nella consulenza dello Studio Legale BCS, che è dove qualcuno ne
          risponde. Resta una riga sola di verità scomoda — tenere il modello in
          casa non esenta da niente — perché toglierla sarebbe una promessa
          falsa, e il pubblico di questa pagina (avvocati, commercialisti) la
          smonterebbe in dieci secondi. */}
      <section className={styles.sezione} id="conformita" aria-labelledby="titolo-conformita">
        <p className={styles.occhiello}>AI Act &middot; già in vigore</p>
        <h2 id="titolo-conformita" className={styles.titoloSezione}>
          Non è un problema del 2027. È adesso.
        </h2>
        <p className={styles.introSezione}>
          Le regole europee sull&rsquo;intelligenza artificiale sono già in vigore, e
          la prima domanda che ti farà chiunque venga a controllare è sempre la
          stessa: dove sono finiti i dati. Se la risposta è &ldquo;non si sono mai
          mossi da qui&rdquo;, hai già risolto la parte più scomoda.
        </p>

        <div className={styles.griglia4}>
          <article className={styles.card}>
            <p className={styles.cardNumero}>Dati</p>
            <h3 className={styles.cardTitolo}>Non sono mai usciti</h3>
            <p className={styles.cardTesto}>
              Nessun fornitore esterno da dichiarare, nessun documento finito chissà
              dove. La risposta più semplice è anche la più difficile da contestare.
            </p>
          </article>

          <article className={styles.card}>
            <p className={styles.cardNumero}>Segreto</p>
            <h3 className={styles.cardTitolo}>Il riserbo professionale regge</h3>
            <p className={styles.cardTesto}>
              Avvocati, commercialisti, consulenti del lavoro, studi medici: il
              fascicolo del cliente resta dov&rsquo;è sempre stato.
            </p>
          </article>

          <article className={styles.card}>
            <p className={styles.cardNumero}>Tracce</p>
            <h3 className={styles.cardTitolo}>Le tracce le tieni tu</h3>
            <p className={styles.cardTesto}>
              Quando devi dimostrare come hai lavorato, non devi chiederlo a un
              fornitore e aspettare che risponda.
            </p>
          </article>

          <article className={styles.card}>
            <p className={styles.cardNumero}>Riuso</p>
            <h3 className={styles.cardTitolo}>Niente si allena sui tuoi file</h3>
            <p className={styles.cardTesto}>
              Non c&rsquo;è una clausola di cui fidarsi: il modello lavora sul tuo
              computer e non ha nessun posto dove mandare niente.
            </p>
          </article>
        </div>

        <div className={styles.dichiarazione}>
          <p className={styles.dichiarazioneTitolo}>Una cosa te la diciamo contro il nostro interesse.</p>
          <p className={styles.dichiarazioneTesto}>
            Tenere l&rsquo;intelligenza artificiale in casa <strong>non ti esenta dalle
            regole</strong>: dipendono da cosa ci fai, non da dove gira. Chi te la
            vende come una scorciatoia ti sta creando un problema più grande di
            quello che ti risolve. Noi installiamo la macchina; per la parte legale
            c&rsquo;è chi ne risponde con la firma. E se in futuro vuoi affiancare un
            modello in cloud, <strong>quello che gli mandi esce dalla macchina</strong>:
            te lo diciamo prima, lo attiviamo solo se lo chiedi e resta separato da
            quello che gira in locale.
          </p>
        </div>

        <div className={styles.azioni}>
          <Link className={styles.azionePrimaria} href="/consulenza">
            Parlane con l&rsquo;avvocato
          </Link>
          <Link className={styles.azioneSecondaria} href="/corsi">
            Corsi sull&rsquo;AI Act
          </Link>
          <Link className={styles.azioneSecondaria} href="/trasparenza-ai">
            Come la usiamo noi
          </Link>
        </div>
      </section>

      {/* Il listino.

          Va in pagina e non dietro un preventivo per una ragione sola: la frase
          "il Mac lo paghi ad Apple, noi non ci guadagniamo sopra" vale come
          argomento solo se accanto c'e' scritto quanto costa il nostro lavoro.
          I prezzi qui sono quelli del servizio, decisi da noi. Il prezzo della
          macchina resta quello di Apple e non lo scriviamo: cambia quando lo
          cambia Apple, e una cifra vecchia in pagina e' peggio di nessuna. */}
      <section className={styles.sezione} id="prezzi" aria-labelledby="titolo-prezzi">
        <p className={styles.occhiello}>Quanto costa</p>
        <h2 id="titolo-prezzi" className={styles.titoloSezione}>
          Il Mac lo paghi ad Apple. A noi paghi il lavoro.
        </h2>
        <p className={styles.introSezione}>
          Non ricarichiamo un euro sulla macchina: la ordini tu, al prezzo di listino
          Apple, e la garanzia resta la loro. Noi ti diciamo quale prendere e te la
          consegniamo che funziona.
        </p>

        <div className={styles.listino}>
          {PACCHETTI.map(pacchetto => (
            <article
              key={pacchetto.id}
              className={'scelto' in pacchetto && pacchetto.scelto ? `${styles.piano} ${styles.pianoScelto}` : styles.piano}
            >
              {'scelto' in pacchetto && pacchetto.scelto && (
                <span className={styles.pianoEtichetta}>Il più scelto</span>
              )}
              <h3 className={styles.pianoNome}>{pacchetto.nome}</h3>
              <p className={styles.pianoPerChi}>{pacchetto.perChi}</p>
              <p className={styles.pianoPrezzo}>
                {pacchetto.prezzo.toLocaleString('it-IT')} <small>€</small>
              </p>
              <p className={styles.pianoTesto}>{pacchetto.sintesi}</p>
              <ul className={styles.pianoElenco}>
                {pacchetto.voci.map(voce => (
                  <li key={voce}>{voce}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className={styles.dichiarazione}>
          <p className={styles.dichiarazioneTitolo}>Una cosa te la diciamo contro il nostro interesse.</p>
          <p className={styles.dichiarazioneTesto}>
            Tenere l&rsquo;intelligenza artificiale in casa <strong>non ti esenta dalle
            regole</strong>: dipendono da cosa ci fai, non da dove gira. Chi te la
            vende come una scorciatoia ti sta creando un problema più grande di
            quello che ti risolve. Noi installiamo la macchina; per la parte legale
            c&rsquo;è chi ne risponde con la firma. E se in futuro vuoi affiancare un
            modello in cloud, <strong>quello che gli mandi esce dalla macchina</strong>:
            te lo diciamo prima, lo attiviamo solo se lo chiedi e resta separato da
            quello che gira in locale.
          </p>
        </div>

        <div className={styles.azioni}>
          <Link className={styles.azionePrimaria} href="/consulenza">
            Parlane con l&rsquo;avvocato
          </Link>
          <Link className={styles.azioneSecondaria} href="/corsi">
            Corsi sull&rsquo;AI Act
          </Link>
          <Link className={styles.azioneSecondaria} href="/trasparenza-ai">
            Come la usiamo noi
          </Link>
        </div>
      </section>

      <section className={styles.sezione} aria-labelledby="titolo-domande">
        <p className={styles.occhiello}>Domande</p>
        <h2 id="titolo-domande" className={styles.titoloSezione}>
          Quelle che ci fanno sempre.
        </h2>

        <div className={styles.faq}>
          {DOMANDE.map(domanda => (
            <details key={domanda.q} className={styles.faqVoce}>
              <summary>{domanda.q}</summary>
              <p>{domanda.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.finale} aria-labelledby="titolo-finale">
        <p className={styles.occhiello}>Partiamo</p>
        <h2 id="titolo-finale" className={styles.titoloSezione}>
          Dieci minuti per capire che macchina ti serve.
        </h2>
        <p className={styles.introSezione}>
          Ci racconti che lavoro vuoi far fare all&rsquo;AI. Noi ti diciamo che Mac serve, cosa ci
          installiamo sopra e quanto costa. Se non conviene, te lo diciamo.
        </p>

        <div className={styles.azioni}>
          <a className={styles.azionePrimaria} href={WHATSAPP} target="_blank" rel="noopener noreferrer">
            Scrivici su WhatsApp
          </a>
          <Link className={styles.azioneSecondaria} href="/contatti">
            Tutti i contatti
          </Link>
        </div>
      </section>

      <PublicFooter />
      <FloatingNavigation />
    </main>
  )
}
