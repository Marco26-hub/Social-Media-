import type { Metadata } from 'next'
import LegalShell from '@/components/LegalShell'
import { TITOLARE } from '@/lib/legal-config'
import { SITE_URL } from '@/lib/site-config'
import styles from '@/components/legal.module.css'

// Dichiarazione di accessibilita.
//
// Non e un adempimento formale che si scrive per spuntare una casella: e la
// pagina che dice a chi usa uno screen reader o naviga solo da tastiera che cosa
// funziona, che cosa non e ancora verificato e a chi scrivere quando qualcosa si
// rompe. Per questo dichiara anche i limiti, invece del solo livello raggiunto.

const META_TITLE = 'Dichiarazione di accessibilità — Social Web Automation'
const META_DESCRIPTION =
  'Livello di accessibilità del sito Social Web Automation, che cosa è stato verificato, quali limiti restano e come segnalare una barriera che ti impedisce di usare il sito.'

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/accessibilita` },
  openGraph: { title: META_TITLE, description: META_DESCRIPTION, url: `${SITE_URL}/accessibilita` , images: ['/og.png'], type: 'website',},
  robots: { index: true, follow: true },
}

export default function AccessibilitaPage() {
  return (
    <LegalShell eyebrow="Accessibilità" title="Dichiarazione di accessibilità" currentPath="/accessibilita">
      <p>
        {TITOLARE.brand} si impegna a rendere il proprio sito utilizzabile da chiunque, comprese le persone che navigano
        con uno screen reader, solo da tastiera, con ingrandimento del testo o con un contrasto elevato. Questa pagina
        dichiara a che punto siamo, che cosa è stato verificato e che cosa no.
      </p>

      <h2>1. Standard di riferimento</h2>
      <p>
        Il riferimento sono le <strong>Web Content Accessibility Guidelines (WCAG) 2.1, livello AA</strong>, richiamate
        dalla norma europea EN 301 549 e, in Italia, dalla L. 4/2004 come modificata dal D.Lgs. 82/2022 che recepisce
        l’European Accessibility Act.
      </p>

      <h2>2. Stato di conformità</h2>
      <p>
        Dichiariamo una <strong>conformità parziale</strong> alle WCAG 2.1 AA. «Parziale» non è una formula di comodo:
        significa che i criteri elencati al punto 3 sono stati verificati e risultano soddisfatti, mentre quelli al punto 4
        non sono ancora stati verificati con strumenti automatici e prove manuali complete.
      </p>

      <h2>3. Che cosa è stato verificato</h2>
      <ul>
        <li><strong>Testo alternativo</strong>: tutte le immagini informative hanno una descrizione; quelle decorative sono marcate come tali.</li>
        <li><strong>Struttura dei titoli</strong>: un solo <code>h1</code> per pagina e gerarchia senza salti di livello.</li>
        <li><strong>Etichette dei moduli</strong>: ogni campo ha un’etichetta associata o un <code>aria-label</code>.</li>
        <li><strong>Testo dei collegamenti</strong>: nessun «clicca qui» o «leggi di più» privo di contesto.</li>
        <li><strong>Lingua della pagina</strong>: dichiarata e corretta anche sulle pagine inglesi, dove viene impostata prima del primo disegno della pagina.</li>
        <li><strong>Ingrandimento e dispositivi mobili</strong>: il contenuto resta leggibile e utilizzabile fino al 200% di zoom e su schermi stretti.</li>
        <li><strong>Salto al contenuto</strong>: ogni pagina apre con un collegamento «Vai al contenuto» raggiungibile da tastiera.</li>
        <li><strong>Tema chiaro e scuro</strong>: entrambi progettati, non ottenuti per inversione automatica.</li>
      </ul>

      <h2>4. Limiti noti</h2>
      <p>Li scriviamo perché sapere dove il sito è debole è più utile di una dichiarazione generica.</p>
      <ul>
        <li><strong>Contrasto dei colori</strong>: verificato sulle superfici principali, non ancora su ogni combinazione di ogni componente in entrambi i temi.</li>
        <li><strong>Percorso da tastiera</strong>: navigabile, ma l’ordine di tabulazione e la visibilità del focus non sono stati collaudati pagina per pagina.</li>
        <li><strong>Prove con screen reader</strong>: non è ancora stato eseguito un ciclo completo con NVDA, VoiceOver o JAWS.</li>
        <li><strong>Documenti allegati</strong>: eventuali PDF generati dai servizi non sono garantiti accessibili.</li>
        <li><strong>Contenuti di terze parti</strong>: i post incorporati dai social, quando presenti, seguono l’accessibilità della piattaforma che li ospita e non la nostra.</li>
      </ul>

      <h2>5. Come segnalare una barriera</h2>
      <p>
        Se qualcosa ti impedisce di usare il sito, scrivi a <a href={`mailto:${TITOLARE.email}`}>{TITOLARE.email}</a>
        indicando la pagina e che cosa hai provato a fare. Rispondiamo entro <strong>30 giorni</strong>. Non serve conoscere
        il nome tecnico del problema: «non riesco a compilare il modulo con la tastiera» è una segnalazione perfetta.
      </p>
      <p className={styles.nota}>
        Se la risposta non ti soddisfa, puoi rivolgerti all’<strong>Agenzia per l’Italia Digitale (AgID)</strong>, che
        gestisce il meccanismo di reclamo previsto dalla L. 4/2004.
      </p>

      <h2>6. Come miglioriamo</h2>
      <p>
        L’accessibilità viene controllata quando si aggiunge una pagina o si cambia un componente condiviso, non una volta
        l’anno. I limiti del punto 4 sono nella lista di lavoro: quando uno viene chiuso, questa pagina cambia insieme al
        sito, non dopo.
      </p>

      <h2>7. Data della dichiarazione</h2>
      <p>
        Redatta l’<strong>8 settembre 2026</strong> sulla base di una verifica interna del codice e delle pagine pubbliche.
        Non è stata condotta da un valutatore terzo.
      </p>
    </LegalShell>
  )
}
