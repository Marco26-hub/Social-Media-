import Link from 'next/link'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'
import FloatingNavigation from './FloatingNavigation'
import AiCasaScena from './AiCasaScena'
import { SITE_URL } from '@/lib/site-config'
import styles from './ai-casa-landing.module.css'

const PERCORSO = '/servizi/ai-a-casa-tua'
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}${PERCORSO}#service`,
    name: 'AI a casa tua',
    serviceType: 'Installazione di intelligenza artificiale locale su Mac',
    description:
      'Mac e Mac mini consegnati con l’intelligenza artificiale gia’ installata, tarata sulla memoria della macchina e collaudata. L’AI lavora sul computer del cliente, senza cloud e senza canone.',
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: 'IT',
    url: `${SITE_URL}${PERCORSO}`,
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
          L&rsquo;AI che usi ogni giorno non dovrebbe vivere a casa di qualcun altro.
        </h2>
        <p className={styles.introSezione}>
          Le tre cose che cambiano quando il modello gira sul computer che hai davanti.
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
          <article className={styles.piano}>
            <h3 className={styles.pianoNome}>Installazione</h3>
            <p className={styles.pianoPerChi}>Hai già il Mac</p>
            <p className={styles.pianoPrezzo}>
              490 <small>€</small>
            </p>
            <p className={styles.pianoTesto}>
              Un intervento sulla macchina che usi già, se regge il lavoro.
            </p>
            <ul className={styles.pianoElenco}>
              <li>Installazione completa e taratura</li>
              <li>Collaudo della macchina</li>
              <li>30 minuti di formazione</li>
              <li>30 giorni di assistenza</li>
            </ul>
          </article>

          <article className={`${styles.piano} ${styles.pianoScelto}`}>
            <span className={styles.pianoEtichetta}>Il più scelto</span>
            <h3 className={styles.pianoNome}>Chiavi in mano</h3>
            <p className={styles.pianoPerChi}>Professionisti e studi</p>
            <p className={styles.pianoPrezzo}>
              990 <small>€</small>
            </p>
            <p className={styles.pianoTesto}>
              Dalla scelta della macchina alla consegna, acceso e collaudato.
            </p>
            <ul className={styles.pianoElenco}>
              <li>Scelta della configurazione e ordine assistito</li>
              <li>Installazione, taratura e collaudo registrato</li>
              <li>1 ora di formazione e documento scritto</li>
              <li>90 giorni di assistenza</li>
            </ul>
          </article>

          <article className={styles.piano}>
            <h3 className={styles.pianoNome}>Studio</h3>
            <p className={styles.pianoPerChi}>Fino a 3 postazioni</p>
            <p className={styles.pianoPrezzo}>
              1.990 <small>€</small>
            </p>
            <p className={styles.pianoTesto}>
              Tre macchine, oppure una sola condivisa con un profilo a testa.
            </p>
            <ul className={styles.pianoElenco}>
              <li>Profili separati per persona</li>
              <li>Procedure scritte per il gruppo</li>
              <li>2 ore di formazione</li>
              <li>6 mesi di assistenza</li>
            </ul>
          </article>

          <article className={styles.piano}>
            <h3 className={styles.pianoNome}>PMI</h3>
            <p className={styles.pianoPerChi}>Da 4 a 10 postazioni</p>
            <p className={styles.pianoPrezzo}>
              4.900 <small>€</small>
            </p>
            <p className={styles.pianoTesto}>
              L&rsquo;AI dentro l&rsquo;azienda, sui documenti che avete già, con regole
              scritte su cosa può leggere e cosa no.
            </p>
            <ul className={styles.pianoElenco}>
              <li>Macchina condivisa in rete, permessi per reparto</li>
              <li>Formazione al gruppo in due sessioni</li>
              <li>Referente unico</li>
              <li>12 mesi di assistenza</li>
            </ul>
          </article>
        </div>

        <div className={styles.dichiarazione}>
          <p className={styles.dichiarazioneTitolo}>Prima si decide, poi si spende.</p>
          <p className={styles.dichiarazioneTesto}>
            L&rsquo;analisi costa <strong>290 €</strong>: sopralluogo o call, scelta della
            configurazione e proposta scritta a prezzo fisso. Se poi procedi, la
            scaliamo per intero dal pacchetto.
          </p>
        </div>

        <div className={styles.righe}>
          <div className={styles.riga}>
            <span className={styles.rigaVoce}>Manutenzione (facoltativa)</span>
            <span className={styles.rigaDettaglio}>
              Aggiornamento dei modelli, controllo trimestrale, assistenza da remoto
              entro un giorno lavorativo. Copre la parte di intelligenza artificiale,
              non l&rsquo;assistenza informatica generale.
            </span>
            <span className={styles.rigaPrezzo}>da 79 €/mese</span>
          </div>

          <div className={styles.riga}>
            <span className={styles.rigaVoce}>Interventi fuori pacchetto</span>
            <span className={styles.rigaDettaglio}>In sede o da remoto, minimo un&rsquo;ora.</span>
            <span className={styles.rigaPrezzo}>120 €/ora</span>
          </div>

          <div className={styles.riga}>
            <span className={styles.rigaVoce}>Trasferta</span>
            <span className={styles.rigaDettaglio}>
              Compresa entro 30 km. Da 30 a 100 km, 60 € a intervento. Oltre, il
              chilometraggio e il tempo di viaggio, sempre scritti nel preventivo.
            </span>
            <span className={styles.rigaPrezzo}>inclusa entro 30 km</span>
          </div>
        </div>

        <p className={styles.nota}>
          Prezzi del servizio IVA esclusa. Il prezzo della macchina è quello del
          listino Apple, IVA inclusa, e lo paghi direttamente ad Apple: non passa da
          noi e non ci guadagniamo sopra. Che cosa comprende ciascun pacchetto, che
          cosa non garantisce e come si recede sta scritto nelle{' '}
          <Link href="/termini">condizioni</Link>, al punto 5.
        </p>
      </section>

      <section className={styles.sezione} aria-labelledby="titolo-domande">
        <p className={styles.occhiello}>Domande</p>
        <h2 id="titolo-domande" className={styles.titoloSezione}>
          Quelle che ci fanno sempre.
        </h2>

        <div className={styles.faq}>
          <details className={styles.faqVoce}>
            <summary>Me lo installo da solo, no?</summary>
            <p>
              Puoi. Il software si scarica gratis, e il primo giorno funziona. Poi arriva la
              sessione lunga, la memoria finisce e il Mac si inchioda mentre stai lavorando. Quello
              che compri qui è la macchina che non si inchioda: tarata, provata e con
              qualcuno a cui scrivere.
            </p>
          </details>

          <details className={styles.faqVoce}>
            <summary>È come ChatGPT?</summary>
            <p>
              Si usa allo stesso modo, ma gira sul tuo computer. Non ha il mondo intero dentro e non
              naviga: in cambio non manda i tuoi documenti a nessuno, non ha limiti mensili e
              funziona anche senza rete.
            </p>
          </details>

          <details className={styles.faqVoce}>
            <summary>E se voglio usare anche un modello in cloud?</summary>
            <p>
              Si può fare, e a volte conviene: per certi lavori i modelli grandi online
              sono più bravi. Ma va detto chiaro: <strong>quello che mandi a un servizio
              in cloud esce dalla tua macchina</strong> e finisce sotto le condizioni di
              quel fornitore. Per questo consegniamo le macchine con il solo modello
              locale attivo. Il collegamento a un servizio esterno lo aggiungiamo solo se
              ce lo chiedi, resta separato, e prima ti diciamo quali dati passano di là.
            </p>
          </details>

          <details className={styles.faqVoce}>
            <summary>Posso usarlo sul Mac che ho già?</summary>
            <p>
              Dipende dalla macchina, e te lo diciamo prima: se non regge, te lo diciamo invece di
              venderti un&rsquo;installazione che ti rallenta il lavoro.
            </p>
          </details>

          <details className={styles.faqVoce}>
            <summary>Se si rompe qualcosa?</summary>
            <p>
              Il Mac ha la garanzia del produttore. Sulla parte che installiamo noi restiamo
              raggiungibili: si riprende la configurazione e si rimette a posto senza rifare tutto
              da zero.
            </p>
          </details>

          <details className={styles.faqVoce}>
            <summary>Quanto costa?</summary>
            <p>
              Il nostro lavoro parte da 490 € e il pacchetto più scelto costa 990 €:
              il listino completo è <a href="#prezzi">qui sopra</a>. La macchina la
              paghi ad Apple al suo prezzo, e dipende da quanta memoria ti serve
              davvero: te lo diciamo dopo dieci minuti di telefonata.
            </p>
          </details>
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
