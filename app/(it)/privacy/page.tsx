import type { Metadata } from 'next'
import LegalShell, { PH } from '@/components/LegalShell'
import { TITOLARE, SUB_RESPONSABILI } from '@/lib/legal-config'
import { SITE_URL } from '@/lib/site-config'
import styles from '@/components/legal.module.css'

const META_TITLE = 'Privacy Policy — Social Web Automation'
const META_DESCRIPTION = 'Informativa privacy di Social Web Automation: quali dati trattiamo, per quali finalità, per quanto tempo li conserviamo e come esercitare i tuoi diritti.'

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: { title: META_TITLE, description: META_DESCRIPTION, url: `${SITE_URL}/privacy` , images: ['/og.png'], type: 'website',},
  robots: { index: true, follow: true },
}

function val(v: string) {
  return v.startsWith('[DA COMPILARE') ? <PH>{v}</PH> : v
}

export default function PrivacyPage() {
  return (
    <LegalShell eyebrow="Informativa Privacy · GDPR" title="Privacy Policy" currentPath="/privacy">
      <p>
        La presente informativa descrive le modalità di trattamento dei dati personali degli utenti che
        consultano il sito e utilizzano i servizi di {TITOLARE.brand}, ai sensi dell’art. 13 del
        <strong> Regolamento UE 2016/679 (GDPR)</strong> e del D.Lgs. 196/2003 (Codice Privacy) come modificato dal D.Lgs. 101/2018.
      </p>

      <h2>1. Titolare del trattamento</h2>
      <p>
        Il Titolare del trattamento è {val(TITOLARE.ragioneSociale)} ({TITOLARE.brand}), con sede legale in {val(TITOLARE.sedeLegale)},
        P.IVA {val(TITOLARE.partitaIva)}, C.F. {val(TITOLARE.codiceFiscale)}.<br />
        Email: <a href={`mailto:${TITOLARE.email}`}>{TITOLARE.email}</a> · PEC: {val(TITOLARE.pec)} · Tel: {val(TITOLARE.telefono)}.
      </p>
      {TITOLARE.dpo ? (
        <p>Responsabile della Protezione dei Dati (DPO): {TITOLARE.dpo.nome} — <a href={`mailto:${TITOLARE.dpo.email}`}>{TITOLARE.dpo.email}</a>.</p>
      ) : (
        <p>
          Il Titolare non ha nominato un Responsabile della Protezione dei Dati (DPO).
          Per richieste relative alla privacy è possibile contattare direttamente il Titolare
          all’indirizzo <a href={`mailto:${TITOLARE.email}`}>{TITOLARE.email}</a>.
        </p>
      )}

      <h2>2. Quali dati trattiamo</h2>
      <h3>a) Dati forniti volontariamente</h3>
      <ul>
        <li><strong>Dati di registrazione</strong>: nome, email, azienda, telefono, pacchetto scelto, password (cifrata con bcrypt).</li>
        <li><strong>Dati di contatto</strong>: quando ci scrivi via email, WhatsApp o form.</li>
        <li><strong>Dati di fatturazione</strong>: ragione sociale, P.IVA, indirizzo — gestiti tramite Stripe.</li>
        <li><strong>Dati di recesso e disdetta</strong>: nome, email, riferimento e data del contratto, categoria della richiesta, dichiarazione trasmessa, data e ora, codice pratica e ricevuta.</li>
        <li><strong>Contenuti caricati</strong>: immagini, testi, dati del brand e dei prodotti che inserisci nella piattaforma.</li>
      </ul>
      <h3>b) Dati raccolti automaticamente</h3>
      <ul>
        <li><strong>Dati di navigazione</strong>: indirizzo IP, tipo di browser, pagine visitate, orari (log tecnici del server).</li>
        <li><strong>Cookie tecnici</strong>: necessari al funzionamento (sessione, autenticazione). Dettagli nella <a href="/cookie-policy">Cookie Policy</a>.</li>
      </ul>

      <h2>3. Finalità e basi giuridiche</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Finalità</th><th>Base giuridica (art. 6 GDPR)</th></tr></thead>
          <tbody>
            <tr><td>Erogazione del servizio (account, generazione e pubblicazione contenuti)</td><td>Esecuzione del contratto — lett. b)</td></tr>
            <tr><td>Fatturazione e adempimenti fiscali</td><td>Obbligo legale — lett. c)</td></tr>
            <tr><td>Assistenza e risposta alle richieste</td><td>Esecuzione di misure precontrattuali — lett. b)</td></tr>
            <tr><td>Sicurezza, prevenzione abusi, log tecnici</td><td>Legittimo interesse — lett. f)</td></tr>
            <tr><td>Invio email transazionali (attivazione, notifiche)</td><td>Esecuzione del contratto — lett. b)</td></tr>
            <tr><td>Gestione e prova delle dichiarazioni di recesso o disdetta</td><td>Obbligo legale — lett. c) ed esecuzione del contratto — lett. b)</td></tr>
            <tr><td>Marketing e newsletter (se attivati)</td><td>Consenso — lett. a)</td></tr>
          </tbody>
        </table>
      </div>

      <h2>4. Uso dell’intelligenza artificiale</h2>
      <p>
        La piattaforma utilizza <strong>OpenRouter</strong>, che instrada modelli di AI di terze parti (Google, OpenAI, Anthropic,
        Meta e altri) per generare testi e immagini. I dati che inserisci (brand, prodotti, immagini) possono essere inviati a
        questi fornitori esclusivamente per generare i contenuti richiesti. <strong>Non usiamo i tuoi dati per addestrare modelli AI</strong> e
        selezioniamo fornitori che offrono garanzie contrattuali in tal senso. Vedi anche la <a href="/trasparenza-ai">nota di trasparenza AI</a> (art. 50 Regolamento UE 2024/1689).
      </p>

      <h2>5. Destinatari e responsabili esterni</h2>
      <p>I dati possono essere trattati, per nostro conto, dai seguenti fornitori nominati Responsabili del trattamento (art. 28 GDPR):</p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Fornitore</th><th>Attività</th><th>Trasferimento extra-UE</th></tr></thead>
          <tbody>
            {SUB_RESPONSABILI.map(s => (
              <tr key={s.nome}><td>{s.nome}</td><td>{s.ruolo}</td><td>{s.extraUe}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Alcuni fornitori hanno sede negli USA: i trasferimenti avvengono sulla base di <strong>Clausole Contrattuali Standard (SCC)</strong> e/o
        adesione al <strong>Data Privacy Framework</strong>, come previsto dagli artt. 44-49 GDPR.
      </p>

      <h2>6. Periodo di conservazione</h2>
      <ul>
        <li><strong>Dati account</strong>: per tutta la durata del rapporto e fino a 24 mesi dopo la cessazione.</li>
        <li><strong>Dati di fatturazione</strong>: 10 anni (obbligo civilistico/fiscale).</li>
        <li><strong>Dichiarazioni di recesso e disdetta</strong>: fino a 10 anni per documentare la richiesta e gestire eventuali contestazioni, salvo diverso obbligo di legge.</li>
        <li><strong>Contenuti caricati</strong> (immagini, testi, dati di brand e prodotti): per tutta la durata del rapporto e fino a 24 mesi dopo la cessazione, insieme ai dati account. La cancellazione anticipata si può chiedere in qualsiasi momento.</li>
        <li><strong>Log tecnici</strong>: massimo 12 mesi.</li>
        <li><strong>Dati marketing</strong>: fino a revoca del consenso.</li>
      </ul>

      <h2>7. I tuoi diritti</h2>
      <p>Ai sensi degli artt. 15-22 GDPR hai diritto di: accesso, rettifica, cancellazione («diritto all’oblio»), limitazione,
        portabilità, opposizione, e di revocare il consenso in qualsiasi momento. Per esercitarli scrivi a <a href={`mailto:${TITOLARE.email}`}>{TITOLARE.email}</a>. Rispondiamo entro 30 giorni, prorogabili di
        altri 60 nei casi previsti dall’art. 12.3 GDPR, dandotene comunicazione.</p>
      <p>Per il <strong>diritto alla portabilità</strong> (art. 20) consegniamo i dati che ci hai fornito in un archivio
        <strong>JSON</strong>, formato strutturato e leggibile da dispositivo automatico: dati account, contenuti caricati,
        storico delle pubblicazioni e registro delle richieste. Le immagini e i file vengono consegnati nel formato originale.
        Hai inoltre diritto di proporre reclamo al <strong>Garante per la Protezione dei Dati Personali</strong> (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">garanteprivacy.it</a>).</p>

      <h2>8. Sicurezza</h2>
      <p>Adottiamo misure tecniche e organizzative adeguate: password cifrate (bcrypt), connessioni HTTPS con HSTS,
        Content-Security-Policy restrittiva, controllo accessi multi-tenant, rate limiting e isolamento dei dati per cliente.
        Nessun sistema è sicuro al 100%: per questo la procedura in caso di violazione è scritta prima che serva, qui sotto.</p>

      <h2>9. Che cosa succede in caso di violazione dei dati</h2>
      <p>Una violazione è qualsiasi evento che comporti distruzione, perdita, modifica, divulgazione o accesso non autorizzato
        ai dati personali. La procedura è questa, nell’ordine:</p>
      <ul>
        <li><strong>Rilevazione e contenimento</strong>: chiusura dell’accesso, revoca delle credenziali coinvolte e
          conservazione dei log utili a ricostruire l’accaduto.</li>
        <li><strong>Valutazione del rischio</strong>: entro poche ore, a cura del Titolare, per stabilire natura, categorie e
          numero approssimativo di interessati e di dati coinvolti.</li>
        <li><strong>Notifica al Garante entro 72 ore</strong> dal momento in cui il Titolare ne viene a conoscenza, ai sensi
          dell’<strong>art. 33 GDPR</strong>, salvo che la violazione sia improbabile che presenti un rischio per i diritti e
          le libertà delle persone. Se le 72 ore non bastano, la notifica indica il motivo del ritardo.</li>
        <li><strong>Comunicazione agli interessati senza ingiustificato ritardo</strong>, ai sensi dell’<strong>art. 34
          GDPR</strong>, quando la violazione presenta un rischio elevato: che cosa è successo, quali dati, quali conseguenze
          probabili, che cosa abbiamo fatto e che cosa conviene fare a te.</li>
        <li><strong>Registro delle violazioni</strong>: ogni evento viene annotato con effetti e misure adottate, ai sensi
          dell’art. 33.5 GDPR, anche quando la notifica non è dovuta.</li>
      </ul>
      <p>Se la violazione riguarda un fornitore che tratta dati per nostro conto, il contratto ex art. 28 GDPR gli impone di
        avvisarci senza ingiustificato ritardo, così che i termini di cui sopra decorrano correttamente.</p>

      <h2>10. Modifiche</h2>
      <p>Ci riserviamo di aggiornare questa informativa. Le modifiche sostanziali saranno comunicate via email o tramite avviso sul sito.</p>
    </LegalShell>
  )
}
