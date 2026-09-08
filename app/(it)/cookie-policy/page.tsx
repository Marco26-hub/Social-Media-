import { anteprimaOg } from '@/lib/anteprima'
import type { Metadata } from 'next'
import LegalShell from '@/components/LegalShell'
import { TITOLARE } from '@/lib/legal-config'
import { SITE_URL } from '@/lib/site-config'
import styles from '@/components/legal.module.css'

const META_TITLE = 'Cookie Policy — Social Web Automation'
const META_DESCRIPTION = 'Cookie policy di Social Web Automation: quali cookie usiamo, quali richiedono il tuo consenso, come cambiarlo in ogni momento e per quanto restano attivi.'

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/cookie-policy`,
    // La traduzione di cortesia esiste: la coppia va dichiarata da tutte e
    // due le parti, altrimenti un motore la scarta.
    languages: {
      'it-IT': `${SITE_URL}/cookie-policy`,
      en: `${SITE_URL}/en/cookie-policy`,
      'x-default': `${SITE_URL}/cookie-policy`,
    },
  },
  openGraph: { title: META_TITLE, description: META_DESCRIPTION, url: `${SITE_URL}/cookie-policy` , images: anteprimaOg('/cookie-policy'), type: 'website',},
  robots: { index: true, follow: true },
}

export default function CookiePolicyPage() {
  return (
    <LegalShell eyebrow="Cookie Policy" title="Informativa Cookie" currentPath="/cookie-policy">
      <p>
        Questa pagina descrive l’uso dei cookie e delle tecnologie simili sul sito di {TITOLARE.brand}, in conformità
        alle <strong>Linee Guida del Garante Privacy sui cookie del 10 giugno 2021</strong> e alla Direttiva ePrivacy.
      </p>

      <h2>1. Cosa sono i cookie</h2>
      <p>I cookie sono piccoli file di testo che i siti salvano sul dispositivo dell’utente. Si distinguono in cookie
        <strong> tecnici</strong> (necessari al funzionamento, non richiedono consenso) e cookie <strong>di profilazione/marketing</strong>
        (richiedono consenso esplicito preventivo).</p>

      <h2>2. Cookie utilizzati da questo sito</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Cookie</th><th>Tipo</th><th>Finalità</th><th>Durata</th><th>Consenso</th></tr></thead>
          <tbody>
            <tr><td>next-auth.session-token</td><td>Tecnico</td><td>Autenticazione utente (login pannello)</td><td>Sessione / 30 gg</td><td>Non richiesto</td></tr>
            <tr><td>next-auth.csrf-token</td><td>Tecnico</td><td>Protezione anti-CSRF</td><td>Sessione</td><td>Non richiesto</td></tr>
            <tr><td>active_cliente_id</td><td>Tecnico</td><td>Cliente/workspace attivo (multi-tenant)</td><td>Sessione</td><td>Non richiesto</td></tr>
            <tr><td>cookie_consent</td><td>Tecnico</td><td>Memorizza la tua scelta sui cookie</td><td>6 mesi</td><td>Non richiesto</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        I cookie tecnici sono sempre attivi perché necessari. I cookie marketing vengono caricati <strong>solo</strong> dopo
        consenso esplicito tramite banner, e servono a Meta Pixel e Conversions API.
      </p>
      <p className={styles.nota}>
        <strong>Sul sito non è attivo alcun cookie di marketing.</strong> Non carichiamo il pixel di Meta né
        alcun altro script pubblicitario, quindi i cookie <code>_fbp</code> e <code>_fbc</code> non vengono
        mai impostati. Il consenso che ti chiediamo nel banner non riguarda dei cookie: riguarda la
        <strong> misurazione delle campagne</strong>, descritta al punto 3.
      </p>

      <h2>3. Terze parti e misurazione delle campagne</h2>
      <p>Il sito <strong>non carica alcuno script di terze parti</strong>: nessuno strumento di analisi, nessun
        pixel pubblicitario, nessun contenuto incorporato. È una scelta, non una mancanza: uno script esterno
        vede tutto quello che fai sulla pagina, e per misurare una campagna non serve.</p>
      <p>Quando è attiva una campagna pubblicitaria e <strong>solo se hai dato il consenso al marketing</strong>,
        il nostro server comunica a Meta due eventi: la richiesta di una consulenza e l’avvio di un acquisto.
        La comunicazione parte dal server, non dal tuo browser. Vengono trasmessi l’indirizzo email e il numero
        di telefono <strong>cifrati con SHA-256</strong> — Meta non riceve i valori in chiaro — insieme
        all’indirizzo IP, al tipo di browser e all’importo dell’operazione.</p>
      <p>Senza il tuo consenso non parte nulla: il controllo è nel codice, non solo nell’intenzione. Se revochi
        il consenso, gli invii si fermano. Il dettaglio del trattamento è nella <a href="/privacy">Privacy Policy</a>.</p>

      <h2>4. Gestione del consenso</h2>
      <p>Puoi modificare o revocare le tue preferenze in qualsiasi momento tramite il banner cookie (che ricompare alla revoca)
        o cancellando i cookie dalle impostazioni del browser. La disabilitazione dei cookie tecnici può compromettere il
        funzionamento del pannello (es. impossibilità di restare autenticato).</p>

      <h2>5. Come gestire i cookie dal browser</h2>
      <ul>
        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
        <li><a href="https://support.mozilla.org/it/kb/Gestione%20dei%20cookie" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
        <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
        <li><a href="https://support.microsoft.com/it-it/microsoft-edge" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
      </ul>

      <h2>6. Titolare e contatti</h2>
      <p>Per qualsiasi richiesta relativa ai cookie: <a href={`mailto:${TITOLARE.email}`}>{TITOLARE.email}</a>. Vedi anche la <a href="/privacy">Privacy Policy</a>.</p>
    </LegalShell>
  )
}
