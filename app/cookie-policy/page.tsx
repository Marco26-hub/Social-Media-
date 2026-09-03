import type { Metadata } from 'next'
import LegalShell from '@/components/LegalShell'
import { TITOLARE } from '@/lib/legal-config'
import { SITE_URL } from '@/lib/site-config'
import styles from '@/components/legal.module.css'

const META_TITLE = 'Cookie Policy — Social Web Automation'
const META_DESCRIPTION = 'Informativa estesa sull’uso dei cookie ai sensi delle Linee Guida del Garante Privacy (2021).'

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/cookie-policy` },
  openGraph: { title: META_TITLE, description: META_DESCRIPTION, url: `${SITE_URL}/cookie-policy` },
  robots: { index: true, follow: true },
}

export default function CookiePolicyPage() {
  return (
    <LegalShell eyebrow="Cookie Policy" title="Informativa Cookie" currentPath="/cookie-policy">
      <p>
        Questa pagina descrive l&apos;uso dei cookie e delle tecnologie simili sul sito di {TITOLARE.brand}, in conformità
        alle <strong>Linee Guida del Garante Privacy sui cookie del 10 giugno 2021</strong> e alla Direttiva ePrivacy.
      </p>

      <h2>1. Cosa sono i cookie</h2>
      <p>I cookie sono piccoli file di testo che i siti salvano sul dispositivo dell&apos;utente. Si distinguono in cookie
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
        I cookie tecnici sono sempre attivi perché necessari. I cookie marketing vengono caricati solo dopo consenso esplicito
        tramite banner e sono usati per Meta Pixel e Conversions API.
      </p>

      <h2>3. Cookie di terze parti</h2>
      <p>Il sito può utilizzare Meta Pixel per misurare visite, lead e avvii di checkout collegati alle campagne pubblicitarie.
        Le informazioni sono trattate secondo le impostazioni e le informative di Meta. Eventuali ulteriori strumenti di analisi,
        pixel pubblicitari o contenuti incorporati verranno indicati in questa tabella prima dell&apos;attivazione.</p>

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
