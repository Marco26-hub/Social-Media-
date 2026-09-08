import type { Metadata } from 'next'
import LegalShell from '@/components/LegalShell'
import { TITOLARE } from '@/lib/legal-config'
import { SITE_URL } from '@/lib/site-config'
import styles from '@/components/legal.module.css'

// Pagina sicurezza.
//
// Le misure erano gia descritte dentro l'informativa privacy, ma un cliente
// strutturato le cerca su una pagina propria: se non la trova, la domanda arriva
// per email e la trattativa si allunga di una settimana. Qui non si dichiara
// niente che non sia gia vero e verificabile — nessuna certificazione che non
// abbiamo, nessun uptime che non misuriamo.

const META_TITLE = 'Sicurezza e trattamento dei dati — Social Web Automation'
const META_DESCRIPTION =
  'Come sono protetti i dati su Social Web Automation: cifratura, isolamento fra clienti, fornitori usati, dove risiedono i dati e che cosa succede in caso di violazione.'

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/sicurezza` },
  openGraph: { title: META_TITLE, description: META_DESCRIPTION, url: `${SITE_URL}/sicurezza` , images: ['/og.png'], type: 'website',},
  robots: { index: true, follow: true },
}

export default function SicurezzaPage() {
  return (
    <LegalShell eyebrow="Sicurezza" title="Sicurezza e trattamento dei dati" currentPath="/sicurezza">
      <p>
        Questa pagina raccoglie le misure tecniche e organizzative con cui {TITOLARE.brand} protegge i dati dei clienti.
        È scritta per chi deve valutare un fornitore prima di firmare: dice che cosa facciamo e, dove non facciamo qualcosa,
        lo dice invece di girarci intorno.
      </p>

      <h2>1. Trasporto e intestazioni</h2>
      <ul>
        <li><strong>HTTPS su tutto il sito</strong>, con <code>Strict-Transport-Security</code> a due anni, esteso ai sottodomini e con preload.</li>
        <li><strong>Content-Security-Policy restrittiva</strong>: gli script possono provenire solo dal nostro dominio; <code>object-src</code> disabilitato e <code>base-uri</code> bloccato.</li>
        <li><strong><code>frame-ancestors: none</code></strong> e <code>X-Frame-Options: DENY</code>: il sito non è incorporabile in un iframe altrui, quindi il clickjacking non è praticabile.</li>
        <li><strong><code>X-Content-Type-Options: nosniff</code></strong> e <code>Referrer-Policy: strict-origin-when-cross-origin</code>.</li>
        <li><strong><code>Permissions-Policy</code></strong>: fotocamera, microfono e geolocalizzazione disattivate a livello di documento.</li>
      </ul>

      <h2>2. Accesso e account</h2>
      <ul>
        <li>Password conservate con <strong>bcrypt</strong>, mai in chiaro e mai reversibili.</li>
        <li><strong>Isolamento multi-tenant</strong>: ogni richiesta è vincolata al cliente che l’ha originata; i dati di un cliente non sono raggiungibili da un altro.</li>
        <li><strong>Rate limiting</strong> su login, registrazione, cambio password e sulle interfacce che generano contenuti.</li>
        <li>Accesso al pannello riservato agli account approvati; le credenziali sono responsabilità di chi le detiene.</li>
      </ul>

      <h2>3. Pagamenti</h2>
      <p>
        I pagamenti passano da <strong>Stripe Checkout ospitato</strong>: la pagina in cui si inserisce la carta è di Stripe,
        sul dominio di Stripe. <strong>Nessun dato di carta transita, viene elaborato o viene conservato dai nostri sistemi</strong>,
        e non esiste alcun campo carta nel nostro codice. Sul piano PCI-DSS questo colloca l’attività nel perimetro
        <strong> SAQ-A</strong>, il più leggero previsto dallo standard.
      </p>

      <h2>4. Dove risiedono i dati e chi li tratta</h2>
      <p>
        L’elenco completo dei responsabili esterni, con l’attività svolta e la base giuridica di ogni trasferimento fuori
        dall’Unione europea, è nella <a href="/privacy">Privacy Policy</a> al punto 5. È un elenco nominativo, non per
        categorie: i fornitori sono indicati uno per uno. I trasferimenti extra-UE avvengono su Clausole Contrattuali
        Standard e/o adesione al Data Privacy Framework.
      </p>

      <h2>5. Intelligenza artificiale</h2>
      <ul>
        <li>I materiali caricati vengono usati <strong>solo</strong> per generare i contenuti richiesti.</li>
        <li><strong>Non addestriamo modelli</strong> sui dati dei clienti e selezioniamo fornitori che offrono garanzie contrattuali in tal senso.</li>
        <li>Nessuna pubblicazione avviene senza approvazione umana. Il dettaglio è nella <a href="/trasparenza-ai">nota di trasparenza AI</a>.</li>
      </ul>

      <h2>6. In caso di violazione</h2>
      <p>
        La procedura è scritta prima che serva: rilevazione e contenimento, valutazione del rischio, notifica al Garante
        entro <strong>72 ore</strong> ai sensi dell’art. 33 GDPR, comunicazione agli interessati senza ingiustificato ritardo
        quando il rischio è elevato, e annotazione nel registro delle violazioni anche quando la notifica non è dovuta.
        Il testo integrale è al punto 9 della <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>7. Segnalare una vulnerabilità</h2>
      <p>
        Se individui un problema di sicurezza, scrivi a <a href={`mailto:${TITOLARE.email}`}>{TITOLARE.email}</a> con
        oggetto <strong>«Sicurezza»</strong>, descrivendo come riprodurlo. Rispondiamo entro cinque giorni lavorativi.
        Chiediamo di non divulgare il problema finché non è stato chiuso, e di non accedere a dati che non siano i tuoi.
      </p>

      <h2>8. Che cosa non dichiariamo</h2>
      <p className={styles.nota}>
        Per onestà verso chi sta valutando: <strong>non siamo certificati SOC 2 né ISO 27001</strong>, non pubblichiamo una
        status page e non offriamo un SLA contrattuale di disponibilità. Sono scelte coerenti con la dimensione dell’impresa,
        non omissioni. Se il tuo processo di selezione fornitori richiede una di queste, dillo prima: è meglio saperlo
        all’inizio che a metà progetto.
      </p>
      <p>
        Un <strong>accordo sul trattamento dei dati (DPA, art. 28 GDPR)</strong> viene predisposto su richiesta per i clienti
        che ne hanno bisogno.
      </p>

      <h2>9. Aggiornamento</h2>
      <p>Questa pagina viene rivista a ogni modifica delle misure descritte. Ultima revisione: <strong>8 settembre 2026</strong>.</p>
    </LegalShell>
  )
}
