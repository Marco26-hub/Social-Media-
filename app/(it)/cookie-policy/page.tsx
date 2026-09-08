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
  alternates: { canonical: `${SITE_URL}/cookie-policy` },
  openGraph: { title: META_TITLE, description: META_DESCRIPTION, url: `${SITE_URL}/cookie-policy` , images: ['/og.png'], type: 'website',},
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
            <tr><td>_fbp</td><td>Marketing</td><td>Misurazione delle campagne Meta e attribuzione degli eventi del sito</td><td>Fino a 3 mesi</td><td>Richiesto</td></tr>
            <tr><td>_fbc</td><td>Marketing</td><td>Attribuzione delle visite provenienti da inserzioni Meta</td><td>Fino a 3 mesi</td><td>Richiesto</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        I cookie tecnici sono sempre attivi perché necessari. I cookie marketing vengono caricati <strong>solo</strong> dopo
        consenso esplicito tramite banner, e servono a Meta Pixel e Conversions API.
      </p>
      <p className={styles.nota}>
        <strong>Stato attuale: il Meta Pixel è predisposto ma non attivo.</strong> La Content-Security-Policy del sito non
        ammette lo script di Meta, quindi oggi i cookie <code>_fbp</code> e <code>_fbc</code> <strong>non vengono impostati
        nemmeno se dai il consenso</strong>. Li elenchiamo lo stesso perché la predisposizione esiste: quando verrà attivata,
        questa riga sparirà e la tabella sopra descriverà il comportamento reale. Preferiamo dichiarare più di quanto facciamo,
        mai il contrario.
      </p>

      <h2>3. Cookie di terze parti</h2>
      <p>Alla data di aggiornamento di questa pagina il sito <strong>non carica alcuno script di terze parti</strong>: nessun
        strumento di analisi, nessun pixel pubblicitario attivo, nessun contenuto incorporato. La predisposizione per Meta Pixel
        — misurazione di visite, lead e avvii di checkout collegati alle campagne — è descritta al punto precedente e resta
        subordinata sia al tuo consenso sia all’attivazione tecnica.</p>
      <p>Ogni ulteriore strumento verrà indicato nella tabella <strong>prima</strong> dell’attivazione, non dopo.</p>

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
