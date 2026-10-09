import Link from 'next/link'
import type { Metadata } from 'next'
import { anteprimaOg } from '@/lib/anteprima'
import { getPublicCourses, type PublicCourse } from '@/lib/ecosystem/catalog'
import { SITE_URL } from '@/lib/site-config'
import styles from './courses.module.css'
import { courseFaq as faq } from '@/lib/public-faq'

const title = 'Corsi AI e automazione online | SWA Academy'
const description = 'Formazione AI e automazione per PMI e professionisti. Informazioni sui percorsi SWA Academy e sulla formazione AI Act in preparazione con Studio Legale BCS.'
const contact = 'https://wa.me/393477196603?text=Vorrei%20informazioni%20sui%20corsi%20AI%20SWA'
const aiActContact = 'https://wa.me/393477196603?text=Vorrei%20informazioni%20sui%20video%20corsi%20AI%20Act%20per%20PMI%20con%20Studio%20Legale%20BCS'
const aiActTopics = [
  ['Ruoli e responsabilità', 'Inquadrare il ruolo dell’azienda quando sviluppa, acquista o utilizza sistemi di intelligenza artificiale.'],
  ['Obblighi e tempistiche', 'Orientarsi tra gli obblighi applicabili al proprio contesto e le relative tempistiche, da verificare sul caso concreto.'],
  ['Contratti con i fornitori AI', 'Comprendere quali aspetti valutare nei rapporti con chi fornisce strumenti e servizi di intelligenza artificiale.'],
  ['Trasparenza verso le persone', 'Ragionare su quando e come informare chi interagisce con sistemi o contenuti generati dall’AI.'],
  ['Documentazione e controlli', 'Individuare le informazioni da organizzare e conservare per rendere comprensibili scelte, utilizzi e responsabilità.'],
  ['Alfabetizzazione AI del personale', 'Impostare la formazione in relazione alle competenze delle persone, agli strumenti utilizzati e al contesto di lavoro.'],
]

export const metadata: Metadata = {
  title, description,
  alternates: { canonical: `${SITE_URL}/corsi` },
  openGraph: { title, description, url: `${SITE_URL}/corsi`, type: 'website', locale: 'it_IT', siteName: 'SWA Academy', images: anteprimaOg('/corsi') },
  twitter: { card: 'summary_large_image', title, description, images: anteprimaOg('/corsi') },
}
export default async function CoursesPage() {
  let courses: PublicCourse[] = []
  let unavailable = false
  try { courses = await getPublicCourses() } catch { unavailable = true }
  const structuredData = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', url: `${SITE_URL}/corsi`, name: title, description, inLanguage: 'it-IT' },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Corsi AI', item: `${SITE_URL}/corsi` },
    ] },
    ...(courses.length ? [{ '@type': 'ItemList', name: 'Corsi pubblicati SWA Academy', itemListElement: courses.map((course, index) => ({ '@type': 'ListItem', position: index + 1, name: course.title, url: `${SITE_URL}/corsi/${course.slug}` })) }] : []),
  ] }
  return <main id="main-content" className={`swa-detail ${styles.page}`}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
    <section className="swa-section swa-detail-hero">
      <nav aria-label="Percorso di navigazione" className="swa-breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Corsi AI</span></nav>
      <div className={styles.heroGrid}><div><p className="swa-kicker">SWA ACADEMY · FORMAZIONE ONLINE</p>
      <h1>Corsi AI e automazione.<br /><span className={styles.highlight}>Dal capire al fare.</span></h1>
      <p className="swa-detail-intro">L’intelligenza artificiale diventa utile quando sai dove applicarla, cosa chiedere e come controllare il risultato. Esplora la formazione SWA per portare più metodo nel tuo lavoro digitale.</p>
      <div className="swa-actions"><a href={courses.length ? '#catalogo' : contact} className="swa-button">{courses.length ? 'Esplora i corsi' : 'Richiedi informazioni'}</a><a href="#corso-ai-act" className="swa-text-link">Formazione AI Act →</a><a href="#come-funziona" className="swa-text-link">Come funziona →</a></div>
      {!courses.length && <p className={styles.heroNote}>Il catalogo non è al momento consultabile. Puoi chiedere programma, disponibilità e condizioni: questa pagina non conferma iscrizioni o acquisti.</p>}
      <p className={styles.heroNote}>Per professionisti, imprese e chi vuole orientarsi nell’AI. Programmi e requisiti sono specifici per ogni percorso.</p></div>
      <aside className={styles.learningMap} aria-label="Un metodo per usare l’AI nel lavoro"><p className={styles.mapKicker}>PRIMA IL METODO. POI LO STRUMENTO.</p><h2>Un obiettivo.<br />Un processo.<br />Una verifica.</h2><ol>
        <li><span>01</span><div><strong>Definisci il compito</strong><p>Quale problema vuoi affrontare?</p></div></li>
        <li><span>02</span><div><strong>Costruisci il flusso</strong><p>Input, istruzioni e passaggi chiari.</p></div></li>
        <li><span>03</span><div><strong>Controlla il risultato</strong><p>Qualità, fonti e revisione umana.</p></div></li>
      </ol><p className={styles.mapNote}>Una guida al ragionamento, non una promessa di risultati automatici.</p></aside></div>
    </section>

    <section className={`swa-section ${styles.section}`} aria-labelledby="destinatari"><p className="swa-kicker">IL TUO PUNTO DI PARTENZA</p><h2 id="destinatari">Non serve partire tutti<br />dallo stesso livello.</h2><div className="swa-benefits">
      <article><span>PROFESSIONISTI</span><h3>Un lavoro più consapevole</h3><p>Per chi vuole valutare l’AI nelle attività quotidiane, senza delegarle decisioni e responsabilità.</p></article>
      <article><span>IMPRESE E TEAM</span><h3>Processi prima delle mode</h3><p>Per chi cerca un linguaggio comune su strumenti, automazioni e controlli da introdurre nel proprio lavoro.</p></article>
      <article><span>CHI INIZIA</span><h3>Orientarsi con criterio</h3><p>Per distinguere possibilità, limiti e prerequisiti. Scegli il percorso in base al livello indicato nella scheda.</p></article>
    </div></section>

    <section className="swa-method"><div className={`swa-section ${styles.section}`}><p className="swa-kicker">DALLA TEORIA AL CONTESTO</p><h2>Dove può entrare l’AI<br />nel tuo lavoro?</h2><p className={styles.lead}>Questi sono esempi di applicazione, non il programma di tutti i corsi. Per conoscere gli argomenti effettivamente inclusi, consulta il percorso che ti interessa.</p><div className="swa-steps">
      <div><span>CONTENUTI</span><h3>Dal brief alla bozza</h3><p>Definire obiettivi, preparare istruzioni e revisionare testi: la qualità dipende anche dalle domande e dai controlli.</p></div>
      <div><span>AUTOMAZIONI</span><h3>Dal compito al flusso</h3><p>Riconoscere attività ripetitive e ragionare su dati in ingresso, passaggi, eccezioni e verifica dell’output.</p></div>
      <div><span>USO RESPONSABILE</span><h3>Dal risultato alla verifica</h3><p>Controllare informazioni e fonti; evitare di inserire dati personali o riservati senza le necessarie autorizzazioni.</p></div>
    </div><p className="swa-small">Approfondisci <Link href="/metodo">il metodo SWA</Link> e <Link href="/trasparenza-ai">la trasparenza sull’uso dell’AI</Link>.</p></div></section>

    <section id="catalogo" className={`swa-section ${styles.section}`}><div className="swa-section-top"><div><p className="swa-kicker">IL CATALOGO SWA ACADEMY</p><h2>{courses.length ? 'I corsi pubblicati.' : 'Informazioni sui percorsi.'}</h2></div><p>{courses.length ? 'Confronta programma, livello e condizioni.' : 'Chiedi disponibilità e programma prima di iscriverti.'}</p></div>
      {courses.length ? <div className="swa-tool-grid">{courses.map(course => <article key={course.id} className="swa-tool-card">
        <p className="swa-kicker">{course.category || 'Formazione SWA'}</p><h3>{course.title}</h3><p>{course.subtitle || course.description}</p>
        <p>Livello: {course.level} · {course.modules.reduce((sum, module) => sum + module.lessons.length, 0)} lezioni</p>
        <div className="swa-card-bottom"><strong>{course.priceCents === 0 ? 'Gratuito' : new Intl.NumberFormat('it-IT', { style: 'currency', currency: course.currency }).format(course.priceCents / 100)}</strong><Link href={`/corsi/${course.slug}`}>Programma e dettagli →</Link></div>
      </article>)}</div> : <div className={`swa-empty ${styles.empty}`}><h3>{unavailable ? 'Il catalogo è temporaneamente non disponibile.' : 'I percorsi sono in preparazione.'}</h3><p>{unavailable ? 'Riprova più tardi oppure chiedi informazioni a SWA. Nessun acquisto viene avviato da questa pagina.' : 'Qui compariranno i corsi pubblicati, con programma e prezzo. Nel frattempo raccontaci cosa vorresti imparare: ti aiutiamo a orientarti senza anticipare disponibilità non confermate.'}</p><a href={contact} className="swa-button">Chiedi informazioni sui corsi</a></div>}
    </section>
    <section id="corso-ai-act" className="swa-method" aria-labelledby="ai-act-title"><div className={`swa-section ${styles.section}`}>
      <div className="swa-section-top"><div><p className="swa-kicker">FORMAZIONE NORMATIVA · IN PREPARAZIONE</p><h2 id="ai-act-title">Video corsi AI Act<br />per piccole e medie imprese.</h2></div><p>Studio Legale BCS<br />con l’Avv. Vincenzo Sapone</p></div>
      <div className={styles.aiActGrid}><div>
        <p className={styles.lead}>Usare l’AI e comprenderne il quadro normativo sono due competenze diverse. Il percorso in preparazione affronta ruoli, responsabilità e aspetti da valutare quando l’intelligenza artificiale entra nel lavoro dell’azienda.</p>
        <p className={styles.lead}>La formazione legale è erogata dallo Studio Legale BCS, con l’Avv. Vincenzo Sapone, cassazionista. SWA presenta il percorso; la responsabilità professionale dei contenuti legali resta al partner.</p>
        <h3>Gli argomenti del percorso in preparazione</h3>
        <div className={styles.aiActTopics}>{aiActTopics.map(([topic, detail]) => <details key={topic}><summary>{topic}<span aria-hidden="true">+</span></summary><p>{detail}</p></details>)}</div>
        <p className="swa-small">Riferimento per l’alfabetizzazione AI: <a href="https://digital-strategy.ec.europa.eu/en/faqs/ai-literacy-questions-answers" target="_blank" rel="noopener noreferrer">domande e risposte della Commissione europea</a>.</p>
      </div><aside className={styles.aiActAside}><p className="swa-kicker">PER TITOLARI, RESPONSABILI E TEAM</p><h3>Informati sul percorso.</h3><p>I video corsi non sono ancora disponibili nell’Academy. Chiedi a SWA programma definitivo, calendario, prezzo e condizioni di partecipazione.</p><a href={aiActContact} className="swa-button">Richiedi informazioni AI Act</a><p className="swa-small">Questo collegamento apre una richiesta su WhatsApp: non conferma un’iscrizione e non avvia alcun pagamento.</p><hr /><h3>Hai un caso specifico?</h3><p>La consulenza individuale è un servizio distinto dalla formazione.</p><Link href="/consulenza" className="swa-text-link">Scopri la consulenza legale →</Link></aside></div>
      <p className={styles.aiActDisclaimer}>I contenuti hanno finalità formativa: non sostituiscono il parere sul caso concreto e non costituiscono una certificazione o una garanzia automatica di conformità.</p>
    </div></section>
    <section id="come-funziona" className="swa-method"><div className={`swa-section ${styles.section}`}><p className="swa-kicker">UN PERCORSO CHIARO</p><h2>{courses.length ? 'Prima scegli. Poi entra nella tua Academy.' : 'Prima verifica disponibilità e programma.'}</h2><p className="swa-small">Il percorso di iscrizione e accesso qui descritto si applica ai corsi effettivamente pubblicati. Se il catalogo non è disponibile, chiedi informazioni a SWA: nessun corso è prenotato o acquistato da questa pagina.</p><div className="swa-steps">
      <div><span>01</span><h3>Scegli</h3><p>Leggi programma, livello e condizioni del corso.</p></div>
      <div><span>02</span><h3>Accedi</h3><p>Iscriviti nell’area corsi e completa l’acquisto quando previsto.</p></div>
      <div><span>03</span><h3>Impara</h3><p>Segui le lezioni e ritrova il tuo avanzamento nella tua area personale.</p></div>
    </div>{process.env.SWA_ACADEMY_ORIGIN && <p className="swa-small">Sei già iscritto? <a href="/academy/dashboard">Accedi ai tuoi corsi</a>.</p>}</div></section>

    <section className={`swa-section swa-trial ${styles.section}`}><div><p className="swa-kicker">FORMAZIONE CON UN CONTESTO</p><h2>L’approccio SWA.<br />Anche quando impari.</h2><p>Strategia, strumenti e controllo umano: il metodo SWA parte dal compito da svolgere, non dalla promessa che un software possa fare tutto da solo.</p><p>Prima dell’iscrizione verifica chi presenta il corso e cosa contiene il programma. Per dubbi su docenti, prerequisiti o materiali, chiedi informazioni sul percorso specifico.</p><Link href="/chi-siamo" className="swa-text-link">Conosci Social Automation →</Link></div><aside><p className="swa-kicker">UNA SCELTA INFORMATA</p><h3>Controlla cosa è incluso.</h3><p>Prezzo del corso, contenuti, durata dell’accesso e servizi esterni non sono la stessa cosa. Non dare per inclusi abbonamenti AI o certificazioni non indicati.</p><div className={styles.legalLinks}><Link href="/termini">Termini e condizioni</Link><Link href="/recesso">Informazioni sul recesso</Link><Link href="/privacy">Privacy</Link></div></aside></section>

    <section id="faq-corsi" className={`swa-section swa-faq ${styles.section}`}><div><p className="swa-kicker">DOMANDE FREQUENTI</p><h2>Prima di iniziare.</h2><p>Le informazioni generali per orientarti. Programma e condizioni specifiche restano nella scheda di ogni corso.</p><a href={contact} className="swa-text-link">Hai una domanda sul percorso? →</a></div><div>{faq.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>

    <section className="swa-final"><div><p className="swa-kicker">IL PROSSIMO PASSO</p><h2>Parti da ciò<br />che ti serve.</h2><p>{courses.length ? 'Scegli un percorso pubblicato oppure raccontaci il tuo obiettivo.' : 'Raccontaci cosa vuoi imparare e chiedi informazioni sui percorsi.'}</p></div><div className="swa-final-actions"><a href={courses.length ? '#catalogo' : contact} className="swa-button light">{courses.length ? 'Esplora il catalogo' : 'Chiedi informazioni sui corsi'}</a><Link href="/blog" className="swa-text-link">Leggi le guide del Journal SWA →</Link></div></section>
  </main>
}
