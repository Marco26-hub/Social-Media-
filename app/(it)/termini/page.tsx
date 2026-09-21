import { anteprimaOg } from '@/lib/anteprima'
import { TERMINI_DATA, TERMINI_VERSIONE } from '@/lib/termini-versione'
import type { Metadata } from 'next'
import LegalShell, { PH } from '@/components/LegalShell'
import { TITOLARE } from '@/lib/legal-config'
import { SITE_URL } from '@/lib/site-config'
import { PREZZI } from '@/lib/prezzi-ingresso'

const META_TITLE = 'Termini e Condizioni — Social Web Automation'
const META_DESCRIPTION = 'Termini e condizioni dei servizi Social Web Automation: canoni, attività incluse, revisioni, recesso, responsabilità e limiti dichiarati prima della firma.'

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/termini`,
    // La traduzione di cortesia esiste: la coppia va dichiarata da tutte e
    // due le parti, altrimenti un motore la scarta.
    languages: {
      'it-IT': `${SITE_URL}/termini`,
      en: `${SITE_URL}/en/terms`,
      'x-default': `${SITE_URL}/termini`,
    },
  },
  openGraph: { title: META_TITLE, description: META_DESCRIPTION, url: `${SITE_URL}/termini` , images: anteprimaOg('/termini'), type: 'website',},
  robots: { index: true, follow: true },
}

function val(v: string) {
  return v.startsWith('[DA COMPILARE') ? <PH>{v}</PH> : v
}

export default function TerminiPage() {
  return (
    <LegalShell eyebrow="Termini e Condizioni" title="Termini e Condizioni d’uso" currentPath="/termini" altraLinguaHref="/en/terms">
      <p>
        Le presenti Condizioni Generali regolano l’utilizzo dei servizi di {TITOLARE.brand}, forniti da {val(TITOLARE.ragioneSociale)},
        con sede in {val(TITOLARE.sedeLegale)}, P.IVA {val(TITOLARE.partitaIva)}, C.F. {val(TITOLARE.codiceFiscale)} e
        PEC <a href={`mailto:${TITOLARE.pec}`}>{TITOLARE.pec}</a>. La registrazione, l’acquisto o l’utilizzo dei servizi
        comportano l’accettazione delle presenti condizioni.
      </p>
      {/* La versione e la stessa scritta su ogni ordine (`terms_version`): chi
          acquista deve poter vedere quale testo sta accettando, e noi dobbiamo
          poter risalire a quale testo ha accettato. */}
      <p>
        <strong>Versione {TERMINI_VERSIONE}</strong>, in vigore dal{' '}
        {new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(TERMINI_DATA)}.
        Questa è la versione registrata sugli ordini effettuati da tale data.
      </p>

      <h2>1. Oggetto del servizio</h2>
      <p>{TITOLARE.brand} è una piattaforma e un servizio gestito che, tramite intelligenza artificiale, genera contenuti social,
        piani editoriali, articoli, campagne e li pubblica sui canali del cliente previa <strong>approvazione umana</strong>. Sono inoltre
        offerti servizi di siti/e-commerce, visibilità e — tramite lo Studio Legale BCS — consulenze legali e AI compliance.
        Sono infine offerti <strong>corsi online</strong>, nelle due forme descritte al punto 4, e il servizio
        <strong>«AI a casa tua»</strong> descritto al punto 5: installazione e configurazione di sistemi di intelligenza
        artificiale che funzionano sul computer del cliente.</p>

      <h2>2. Registrazione e account</h2>
      <ul>
        <li>La registrazione richiede dati veritieri e completi. L’account è attivato previa approvazione.</li>
        <li>Sei responsabile della custodia delle credenziali e delle attività svolte con il tuo account.</li>
        <li>Devi avere almeno 18 anni e, se agisci per un’azienda, i poteri per vincolarla.</li>
      </ul>

      <h2>3. Piani, prezzi e pagamenti</h2>
      <ul>
        <li>I canoni e gli eventuali costi iniziali sono indicati nella pagina <a href="/pacchetti">Pacchetti</a>. I prezzi sono mensili e IVA esclusa, salvo diversa indicazione.</li>
        <li>La fatturazione degli abbonamenti è gestita tramite Stripe, con rinnovo automatico mensile salvo disdetta.</li>
        <li><strong>Blog SEO + GEO:</strong> il canone di {PREZZI.blog} comprende il ciclo editoriale descritto nella relativa pagina. Tempi, accessi al CMS e modalità di pubblicazione vengono definiti nella fase di avvio.</li>
        <li><strong>Sito Web Base:</strong> il canone è a partire da €19,90/mese per una landing page semplice o un sito web base. Siti multi-pagina, e-commerce, progettazione avanzata, configurazioni, dominio, licenze e funzioni ulteriori vengono definiti e approvati prima di eventuali costi aggiuntivi.</li>
        <li><strong>Pilot Ricerca Clienti B2B:</strong> il prezzo di €149 è una tantum e comprende la definizione del profilo ideale, la ricerca e la qualificazione di un massimo di 30 aziende. Non include invii automatici, campagne outbound, garanzie di risposta, appuntamenti o vendite.</li>
        <li>Il budget destinato alle campagne pubblicitarie è sempre separato dal canone del servizio.</li>
        <li>Le consulenze legali (€150/30 min) sono erogate dallo Studio Legale BCS e regolate anche dalle condizioni dello Studio.</li>
      </ul>

      <h2>4. Corsi online</h2>
      <p>I corsi sono venduti in due forme, indicate sulla pagina di ciascun corso prima dell’acquisto.</p>
      <ul>
        <li><strong>Videocorsi su richiesta:</strong> lezioni registrate, disponibili nell’area riservata dell’acquirente. L’accesso non ha scadenza e resta legato all’account che ha effettuato l’acquisto.</li>
        <li><strong>Aule in diretta:</strong> incontri online a numero chiuso, nelle date e negli orari dichiarati sulla pagina del corso prima dell’acquisto. Il collegamento alla stanza virtuale viene reso disponibile ai soli iscritti nell’area riservata.</li>
        <li><strong>Prevendita:</strong> quando la pagina del corso indica una data di disponibilità futura, l’acquisto avviene prima che i contenuti siano fruibili. La data indicata è l’impegno di consegna; se non potesse essere rispettata ne viene data comunicazione all’acquirente.</li>
        <li><strong>Account:</strong> l’acquisto di un corso richiede un account, che viene creato durante l’acquisto e attivato al momento della conferma del pagamento, senza ulteriore approvazione.</li>
        <li><strong>Uso personale:</strong> l’accesso è personale e non cedibile. Le lezioni si consultano esclusivamente all’interno della piattaforma: non è consentito scaricarle, registrarle, riprodurle, diffonderle o renderle accessibili a terzi, anche a titolo gratuito. I video riportano in sovrimpressione i dati identificativi di chi li sta guardando.</li>
        <li><strong>Condivisione delle credenziali:</strong> l’utilizzo dell’account da parte di persone diverse dall’acquirente costituisce inadempimento e può comportare la sospensione dell’accesso.</li>
        <li><strong>Prezzi:</strong> i prezzi indicati sulla pagina di ciascun corso sono IVA esclusa. Il pagamento è gestito da Stripe; {TITOLARE.brand} non conserva i dati della carta.</li>
        <li><strong>Aule in diretta, variazioni:</strong> qualora un incontro non potesse tenersi nella data prevista, viene proposta una data sostitutiva. Se la nuova data non fosse accettata dall’iscritto, questi ha diritto al rimborso della quota relativa agli incontri non tenuti.</li>
        <li><strong>Materiali:</strong> i documenti messi a disposizione con il corso possono essere scaricati e utilizzati dall’acquirente per la propria attività. Non possono essere rivenduti né distribuiti come prodotto autonomo.</li>
        <li><strong>Finalità:</strong> i contenuti dei corsi hanno finalità formativa e non costituiscono parere professionale sul caso concreto.</li>
      </ul>

      <h2>5. Servizio «AI a casa tua»</h2>
      <p>Il servizio consiste nella scelta della configurazione, nell’installazione, nella taratura, nel collaudo e nella
        formazione relativi a un sistema di intelligenza artificiale che funziona in locale sul computer del cliente. È
        descritto nella pagina <a href="/servizi/ai-a-casa-tua">AI a casa tua</a>.</p>

      <h3>5.1 Il computer non è venduto dal Titolare</h3>
      <ul>
        <li>Il computer è acquistato <strong>direttamente dal cliente</strong> presso Apple o altro rivenditore, al prezzo praticato da quest’ultimo. Il Titolare non lo rivende, non lo intermedia e non applica alcun ricarico.</li>
        <li>Garanzia, conformità, assistenza hardware, sostituzioni e diritto di recesso sul computer restano rapporti fra il cliente e il venditore del computer.</li>
        <li>Il Titolare risponde del proprio servizio di configurazione, non di difetti, ritardi di consegna o indisponibilità della macchina.</li>
        <li>Su richiesta il Titolare può assistere il cliente nell’ordine. L’assistenza all’ordine non rende il Titolare parte del contratto di acquisto.</li>
      </ul>

      <h3>5.2 Prezzi del servizio</h3>
      <ul>
        <li>I corrispettivi dei pacchetti sono indicati nella pagina del servizio e sono <strong>una tantum</strong>, IVA esclusa, salvo diversa indicazione scritta.</li>
        <li>L’analisi iniziale è un servizio autonomo a pagamento. Se il cliente prosegue con un pacchetto, l’importo versato per l’analisi viene scalato per intero dal corrispettivo del pacchetto.</li>
        <li>La manutenzione è un canone periodico, con rinnovo automatico salvo disdetta secondo il punto 10.</li>
        <li>La trasferta è compresa entro il raggio indicato nella pagina del servizio. Oltre tale raggio è dovuto l’importo indicato o, dove previsto, il rimborso chilometrico e il tempo di viaggio, sempre quantificati nel preventivo prima dell’intervento.</li>
        <li>Le attività non comprese nel pacchetto sono quotate a ore alla tariffa indicata nella pagina del servizio e concordate prima dell’esecuzione.</li>
      </ul>

      <h3>5.3 Che cosa il servizio non garantisce</h3>
      <ul>
        <li>I modelli installati sono <strong>modelli di terze parti</strong>, distribuiti con licenze proprie che il cliente accetta usandoli. Il Titolare non ne è l’autore e non ne garantisce prestazioni, aggiornamenti futuri o continuità di distribuzione.</li>
        <li>Le risposte prodotte da un sistema di intelligenza artificiale <strong>possono essere errate o incomplete</strong>. Vanno verificate da una persona prima di qualsiasi uso che produca effetti verso terzi. Il servizio non sostituisce una consulenza professionale.</li>
        <li>Le prestazioni dipendono dalla macchina scelta dal cliente. I riferimenti di velocità e di durata delle sessioni sono misurazioni effettuate su macchine di prova e non costituiscono un livello di servizio garantito.</li>
        <li><strong>Modelli in cloud:</strong> la configurazione consegnata funziona con il solo modello installato in locale. Se il cliente richiede il collegamento a un servizio di intelligenza artificiale esterno, <strong>i dati inviati a quel servizio escono dal computer</strong> e sono trattati secondo le condizioni e l’informativa del fornitore di quel servizio, di cui il Titolare non risponde. Il collegamento è attivato solo su richiesta del cliente, è documentato nel verbale di consegna e può essere disattivato in qualsiasi momento.</li>
        <li>Il servizio non comprende l’assistenza informatica generale della postazione: antivirus, backup, rete, stampanti, posta e sistema operativo restano fuori dal perimetro, salvo accordo scritto separato.</li>
      </ul>

      <h3>5.4 Obblighi del cliente su privacy e AI Act</h3>
      <ul>
        <li>Il cliente resta <strong>titolare del trattamento</strong> dei dati presenti sui propri computer e sui documenti che sottopone al sistema, e ne risponde.</li>
        <li>Rispetto al Regolamento (UE) 2024/1689 il cliente valuta il proprio ruolo e i propri obblighi in relazione all’uso che fa del sistema. L’esecuzione in locale non esclude di per sé l’applicazione del regolamento.</li>
        <li>Il Titolare non fornisce pareri legali. La valutazione di conformità può essere richiesta tramite la <a href="/consulenza">consulenza legale</a> erogata dallo {TITOLARE.partnerLegale}.</li>
        <li>Se durante l’installazione o l’assistenza il Titolare tratta dati personali per conto del cliente, il trattamento è regolato da un accordo ai sensi dell’art. 28 del Regolamento (UE) 2016/679, sottoscritto prima dell’intervento.</li>
        <li>Gli interventi da remoto avvengono con il consenso del cliente e sotto la sua sorveglianza. Il cliente è tenuto a disporre di una copia di sicurezza aggiornata dei propri dati prima di ogni intervento.</li>
      </ul>

      <h3>5.5 Assistenza inclusa</h3>
      <ul>
        <li>L’assistenza compresa nel pacchetto decorre dalla consegna, ha la durata indicata nella pagina del servizio e riguarda il funzionamento di quanto installato dal Titolare.</li>
        <li>Non rientrano nell’assistenza inclusa: i guasti hardware, le modifiche eseguite da terzi sulla configurazione, la reinstallazione del sistema operativo e le nuove funzioni richieste dopo la consegna.</li>
      </ul>

      <h2>6. Contenuti generati dall’AI</h2>
      <ul>
        <li>I contenuti sono generati con il supporto di sistemi di intelligenza artificiale e <strong>rivisti o approvati dal cliente</strong> prima della pubblicazione. L’approvazione finale spetta al cliente.</li>
        <li>Non garantiamo che i contenuti siano privi di errori: sei tenuto a verificarne accuratezza, veridicità e conformità prima di pubblicarli.</li>
        <li>Sei responsabile dei diritti sui materiali che carichi (immagini, marchi, testi) e delle autorizzazioni necessarie.</li>
      </ul>

      <h2>7. Uso consentito</h2>
      <p>È vietato utilizzare il servizio per contenuti illeciti, diffamatori, ingannevoli, che violino diritti di terzi o le
        policy delle piattaforme social. Ci riserviamo di sospendere account che violino queste condizioni.</p>

      <h2>8. Proprietà intellettuale</h2>
      <p>Il software, il marchio e la struttura della piattaforma restano di proprietà del Titolare. I contenuti generati per
        il cliente e i materiali da lui caricati restano di proprietà del cliente.</p>

      <h2>9. Limitazione di responsabilità</h2>
      <p>Il servizio è fornito «così com’è». Nei limiti di legge, il Titolare non risponde di danni indiretti, perdita di
        profitti, o conseguenze derivanti dalla pubblicazione di contenuti approvati dal cliente. La responsabilità complessiva
        è comunque limitata all’importo dei canoni versati negli ultimi 12 mesi.</p>

      <h2>10. Recesso e cessazione</h2>
      <ul>
        <li><strong>Imprese e professionisti:</strong> possono disdire l’abbonamento con effetto dal periodo di fatturazione successivo, dal pannello, tramite la funzione <a href="/recesso">Recesso e disdetta</a> o scrivendo a <a href={`mailto:${TITOLARE.email}`}>{TITOLARE.email}</a>. Il diritto di recesso previsto dal Codice del consumo non si applica agli acquisti effettuati per finalità imprenditoriali o professionali.</li>
        <li><strong>Consumatori:</strong> la persona fisica che acquista per scopi estranei alla propria attività imprenditoriale o professionale può recedere da un contratto a distanza entro 14 giorni dalla conclusione, senza indicarne il motivo, fatte salve le eccezioni previste dalla legge.</li>
        <li>Il consumatore può utilizzare in ogni momento utile la funzione online chiaramente identificata come <a href="/recesso"><strong>Recedere dal contratto qui</strong></a>. Dopo il riepilogo, il comando «Conferma recesso» trasmette la dichiarazione e genera una ricevuta con contenuto, data e ora.</li>
        <li>Se il consumatore ha chiesto espressamente l’avvio del servizio durante il periodo di recesso e poi recede, può essere dovuto un importo proporzionale alla parte di servizio già eseguita, nei casi e limiti dell’art. 57 del Codice del consumo.</li>
        <li>Il diritto può essere escluso per un servizio integralmente eseguito quando l’esecuzione è iniziata con il previo consenso espresso del consumatore e con l’accettazione della perdita del diritto dopo la completa esecuzione. Le altre eccezioni dell’art. 59 restano applicabili se pertinenti.</li>
        <li><strong>Corsi acquistati da consumatori — accesso immediato:</strong> quando il corso è già fruibile al momento dell’acquisto, l’accesso viene dato solo se il consumatore ne fa richiesta espressa e dichiara di essere informato che, ottenendolo, perde il diritto di recesso sul contenuto digitale. Le due dichiarazioni sono raccolte separatamente prima del pagamento e conservate.</li>
        <li><strong>Corsi acquistati da consumatori — prevendita:</strong> quando il corso è acquistato prima della data di disponibilità, <strong>il diritto di recesso resta integro</strong> e i quattordici giorni decorrono secondo legge: l’esecuzione non è ancora iniziata e nessuna rinuncia viene chiesta né registrata al momento dell’acquisto.</li>
        <li><strong>Aule in diretta:</strong> costituiscono prestazione di servizi. Il consumatore che chieda espressamente l’avvio della prestazione prima della scadenza dei quattordici giorni e receda successivamente è tenuto al pagamento della quota proporzionale agli incontri già svolti.</li>
        <li><strong>Effetti del rimborso:</strong> al rimborso integrale del prezzo consegue la chiusura dell’accesso al corso e ai relativi materiali.</li>
        <li><strong>Servizio «AI a casa tua» acquistato da consumatori:</strong> si tratta di una prestazione di servizi. Se il consumatore chiede espressamente che l’esecuzione inizi prima della scadenza dei quattordici giorni e poi recede, è tenuto al pagamento di un importo proporzionale a quanto già eseguito. Se il servizio è stato interamente eseguito con il suo previo consenso espresso e con l’accettazione della perdita del diritto a esecuzione completata, il diritto di recesso non si applica.</li>
        <li><strong>Computer:</strong> il recesso sul computer non passa dal Titolare, che non lo vende. Va esercitato verso il venditore presso cui il cliente lo ha acquistato, secondo le condizioni di quest’ultimo.</li>
        <li><strong>Manutenzione:</strong> la disdetta ha effetto dal periodo di fatturazione successivo. Alla cessazione il sistema installato resta sul computer del cliente e continua a funzionare: cessano gli aggiornamenti, i controlli periodici e l’assistenza.</li>
        <li>La funzione online non limita la possibilita di inviare la dichiarazione con gli altri mezzi consentiti, inclusi email e PEC.</li>
      </ul>

      <h2>11. Legge applicabile e foro</h2>
      <p>Le presenti condizioni sono regolate dalla legge italiana. Per le controversie con consumatori è competente il foro di
        residenza del consumatore; negli altri casi il foro di {TITOLARE.foroCompetente}.</p>

      <h2>12. Modifiche</h2>
      <p>Il Titolare può aggiornare i presenti termini. Le modifiche rilevanti saranno comunicate con modalità adeguate e si applicheranno dalla data indicata nella comunicazione, nel rispetto della normativa vigente.</p>
    </LegalShell>
  )
}
