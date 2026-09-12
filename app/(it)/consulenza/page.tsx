'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, CheckCircle2, Clock, FileCheck2, LockKeyhole, Scale, ShieldCheck } from 'lucide-react'
import FloatingNavigation from '@/components/FloatingNavigation'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import styles from '@/styles/consulenza.module.css'
import { CONSULENZA_LEGALE, CONSULENZA_PREZZO } from '@/lib/consulenza-listino'

const WHATSAPP_URL = `https://wa.me/393477196603?text=${encodeURIComponent('Ciao! Vorrei informazioni sulla consulenza legale AI e GDPR con Studio BCS.')}`

// Le sei domande con cui chiamano davvero, dette con le parole con cui arrivano
// al telefono. Non sono categorie di servizio: chi si riconosce in una frase
// capisce di essere nel posto giusto molto prima di leggere un elenco di materie.
const CASI = [
  {
    norma: 'L. 132/2025, art. 13',
    voce: 'Uso l’intelligenza artificiale per lavorare. Devo dirlo ai miei clienti?',
    risposta:
      'Se eserciti una professione intellettuale, sì, e in modo preventivo, chiaro e completo. Quello che cambia da studio a studio è quando scatta l’obbligo, in che forma darlo e come tenerne prova.',
  },
  {
    norma: 'Contratti',
    voce: 'Il fornitore mi ha mandato un contratto pieno di clausole sull’AI. Cosa sto firmando?',
    risposta:
      'Chi risponde se lo strumento sbaglia, che fine fanno i dati che ci metti dentro, di chi è quello che produce. Sono tre righe in fondo al contratto e decidono chi paga quando qualcosa va storto.',
  },
  {
    norma: 'GDPR',
    voce: 'I dati dei miei clienti finiscono in uno strumento americano. È un problema?',
    risposta:
      'Dipende da quali dati, con che base giuridica e con quali garanzie sul trasferimento. La domanda vera non è se sia vietato, ma cosa devi avere scritto e firmato prima di continuare a farlo.',
  },
  {
    norma: 'Diritto d’autore',
    voce: 'Pubblico contenuti fatti con l’AI. Di chi sono?',
    risposta:
      'Di chi li usa, di chi li ha generati, o di nessuno. Cambia se puoi difenderli da chi te li copia e se rischi qualcosa usandoli in pubblicità.',
  },
  {
    norma: 'AI Act, art. 4',
    voce: 'Mi hanno detto che devo formare il personale. Quanta formazione basta?',
    risposta:
      'Dal luglio 2026 la norma chiede misure proporzionate ai ruoli e al contesto, non un attestato uguale per tutti. Serve capire cosa basta per la tua realtà e come dimostrarlo se te lo chiedono.',
  },
  {
    norma: 'Responsabilità',
    voce: 'Ho consegnato un lavoro con un errore che veniva dallo strumento. Come mi difendo?',
    risposta:
      'La responsabilità verso il cliente resta tua: l’output del sistema non è una giustificazione. Si lavora su cosa si può ancora fare adesso e su cosa mettere per iscritto perché non succeda più.',
  },
]

const PASSI = [
  {
    titolo: 'Prenoti e paghi',
    testo:
      'Compili il modulo e paghi con carta. Nel campo «argomento» scrivi due righe sul tuo caso: servono a non spendere i primi minuti dell’incontro a raccontare il contesto.',
  },
  {
    titolo: 'Fissi l’appuntamento',
    testo:
      'Subito dopo il pagamento ricevi per email le indicazioni per concordare giorno e ora con lo Studio.',
  },
  {
    titolo: 'Parli con l’avvocato',
    testo:
      `${CONSULENZA_LEGALE.durataMinuti} minuti con l’Avv. Vincenzo Sapone, Cassazionista dello Studio Legale BCS. Sul tuo caso, non su un caso di scuola.`,
  },
]

// Date verificate su fonti pubbliche a settembre 2026. Se questa pagina resta
// ferma mentre il quadro si muove diventa il contrario di quello che vende:
// vanno ricontrollate a ogni modifica, ed e il professionista a doverle validare.
const SCADENZE = [
  {
    quando: '10 ottobre 2025',
    cosa: 'Entra in vigore la legge 132/2025. L’articolo 13 chiede a chi esercita una professione intellettuale di informare il cliente sull’uso di sistemi di intelligenza artificiale, in modo preventivo, chiaro, semplice ed esauriente.',
  },
  {
    quando: '27 luglio 2026',
    cosa: 'Il Digital Omnibus (regolamento UE 2026/1744) riformula l’articolo 4 dell’AI Act: l’alfabetizzazione del personale diventa un obbligo di mezzi e non più di risultato. Non sparisce — si misura diversamente.',
  },
  {
    quando: '2 agosto 2026',
    cosa: 'Diventano applicabili gli obblighi dell’AI Act che riguardano chi l’intelligenza artificiale la usa, non solo chi la produce.',
  },
]

const DOMANDE = [
  {
    q: 'Chi svolge la consulenza?',
    a: 'L’Avv. Vincenzo Sapone, Cassazionista dello Studio Legale BCS. L’attività legale è dello Studio: Social Web Automation si occupa della parte tecnologica e della prenotazione.',
  },
  {
    q: 'Quanto costa e cosa comprende?',
    a: `${CONSULENZA_PREZZO} IVA esclusa per ${CONSULENZA_LEGALE.durataMinuti} minuti di confronto individuale sul tuo caso. Se dal confronto emerge un lavoro più ampio — un parere scritto, la revisione di un contratto, un adeguamento — viene quotato a parte e lo decidi tu.`,
  },
  {
    q: 'La mia è una domanda piccola. Vale la pena?',
    a: 'Le domande piccole sono quelle che si risolvono meglio in mezz’ora. Le grandi, spesso, nascono da una domanda piccola che nessuno aveva fatto in tempo.',
  },
  {
    q: 'Non sono un professionista, ho un’azienda. Serve lo stesso?',
    a: 'Sì, e cambiano le norme di riferimento: l’obbligo di informare il cliente riguarda le professioni intellettuali, mentre gli obblighi dell’AI Act e del GDPR riguardano chiunque usi questi strumenti nella propria attività.',
  },
  {
    q: 'Fate anche formazione?',
    a: 'Sì, ed è una cosa diversa da questa. I corsi con l’Avv. Sapone hanno una pagina dedicata, con programma, durata e date.',
  },
  {
    q: 'Quello che leggo qui vale come parere legale?',
    a: 'No. Questa pagina serve a orientarsi. Il parere riguarda il caso concreto e si dà durante la consulenza, dopo aver visto i tuoi documenti.',
  },
]

function ConsulenzaForm() {
  const params = useSearchParams()
  const esito = params.get('esito')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [messaggio, setMessaggio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError(''); setLoading(true)
    try {
      const response = await fetch('/api/consulenza', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, telefono, messaggio }),
      })
      const data = await response.json()
      if (!response.ok) { setError(data.error || 'Errore. Riprova.'); setLoading(false); return }
      if (data.checkout_url) { window.location.href = data.checkout_url; return }
      if (data.demo) { setError(data.message || 'Non disponibile in demo.'); setLoading(false); return }
      setPending(true)
    } catch {
      setError('Errore di rete. Riprova.')
      setLoading(false)
    }
  }

  if (esito === 'ok' || pending) {
    return (
      <div className={styles.formCard} id="prenota">
        <span className={styles.successIcon}><CheckCircle2 size={30} aria-hidden="true" /></span>
        <h2>{esito === 'ok' ? 'Pagamento ricevuto' : 'Richiesta registrata'}</h2>
        <p>{esito === 'ok' ? 'La consulenza è confermata. Riceverai le indicazioni per fissare l’appuntamento con il professionista dello Studio BCS.' : 'Ti contattiamo a breve per completare la prenotazione.'}</p>
        <Link href="/" className={styles.textLink}>Torna alla Home <ArrowRight size={15} aria-hidden="true" /></Link>
      </div>
    )
  }

  return (
    <div className={styles.formCard} id="prenota">
      <p className={styles.formEyebrow}><Scale size={14} aria-hidden="true" /> Consulenza individuale</p>
      <h2>Prenota il confronto con il professionista.</h2>
      <div className={styles.price}><strong>{CONSULENZA_PREZZO}</strong><span><Clock size={14} aria-hidden="true" /> {CONSULENZA_LEGALE.durataMinuti} minuti</span></div>
      <ul className={styles.formProof}>
        <li><CheckCircle2 size={15} aria-hidden="true" /> Analisi del caso durante la call</li>
        <li><CheckCircle2 size={15} aria-hidden="true" /> Avvocato Cassazionista Studio BCS</li>
        <li><CheckCircle2 size={15} aria-hidden="true" /> Pagamento sicuro con Stripe</li>
      </ul>

      {esito === 'annullato' && <p className={styles.error}>Pagamento annullato. Puoi riprovare quando vuoi.</p>}
      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={submit}>
        <label>Nome e cognome<input value={nome} onChange={event => setNome(event.target.value)} required autoComplete="name" placeholder="Mario Rossi" /></label>
        <label>Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" placeholder="mario@azienda.it" /></label>
        <label>Telefono <span>(opzionale)</span><input value={telefono} onChange={event => setTelefono(event.target.value)} autoComplete="tel" placeholder="+39 ..." /></label>
        <label>Argomento <span>(opzionale)</span><textarea value={messaggio} onChange={event => setMessaggio(event.target.value)} placeholder="Es. AI Act, privacy, contratti, copyright..." /></label>
        <button type="submit" disabled={loading}>{loading ? 'Attendi…' : <>Paga {CONSULENZA_PREZZO} e prenota <ArrowRight size={17} aria-hidden="true" /></>}</button>
      </form>
      <p className={styles.secure}><ShieldCheck size={14} aria-hidden="true" /> Pagamento gestito da Stripe. Consulenza erogata dallo Studio Legale BCS.</p>
    </div>
  )
}

export default function ConsulenzaPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Service', name: 'Consulenza legale AI Act e GDPR', serviceType: 'Consulenza legale', provider: { '@type': 'LegalService', name: 'Studio Legale BCS' }, areaServed: 'Italia', offers: { '@type': 'Offer', price: '150', priceCurrency: 'EUR' } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.socialautomation.app' }, { '@type': 'ListItem', position: 2, name: 'Consulenza legale AI', item: 'https://www.socialautomation.app/consulenza' }] },
      // Il corso non e' piu qui: ha una pagina sua, /corsi, con il suo Course
      // marcato li. Lasciarne una copia su questa pagina significherebbe due
      // schede prodotto per lo stesso corso, con due prezzi che prima o poi
      // divergono — e il motore di ricerca non ha modo di sapere quale vale.
      {
        '@type': 'FAQPage',
        mainEntity: DOMANDE.map(voce => ({
          '@type': 'Question',
          name: voce.q,
          acceptedAnswer: { '@type': 'Answer', text: voce.a },
        })),
      },
    ],
  }

  return (
    <main id="main-content" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <a className={styles.skipLink} href="#main-content">Vai al contenuto</a>
      <PublicHeader ctaHref={WHATSAPP_URL} ctaLabel="Chiedi informazioni" />
      <section className={styles.hero}>
        <div className={styles.copy}>
          <nav className={styles.breadcrumbs}><Link href="/">Home</Link><span>/</span><span>Consulenza legale AI</span></nav>
          <p className={styles.eyebrow}>Studio Legale BCS × Social Web Automation</p>
          <h1>Consulenza legale su AI Act, GDPR e tecnologie digitali.</h1>
          <p className={styles.lead}>Un confronto individuale per inquadrare obblighi, rischi e prossimi passi. L’attività legale è svolta dall’Avv. Vincenzo Sapone, Cassazionista dello Studio Legale BCS.</p>
          <div className={styles.areas}>
            <article><ShieldCheck size={20} aria-hidden="true" /><div><h2>AI Act e GDPR</h2><p>Ruoli, rischio, basi giuridiche e flussi di dati.</p></div></article>
            <article><FileCheck2 size={20} aria-hidden="true" /><div><h2>Trasparenza AI</h2><p>Processi, responsabilità e documentazione.</p></div></article>
            <article><LockKeyhole size={20} aria-hidden="true" /><div><h2>Copyright e contratti</h2><p>Licenze, utilizzi, clausole e responsabilità.</p></div></article>
          </div>
          <p className={styles.disclaimer}>Le informazioni del sito hanno finalità informative e non sostituiscono il parere sul caso concreto.</p>
        </div>
        <Suspense fallback={<div className={styles.formCard}>Caricamento…</div>}><ConsulenzaForm /></Suspense>
      </section>
      <section className={styles.sezione} id="quando-serve" aria-labelledby="quando-serve-titolo">
        <div className={styles.intestazione}>
          <h2 id="quando-serve-titolo">Le domande con cui ci chiamano.</h2>
          <p>
            Arrivano dette più o meno così. Se ne riconosci una, mezz’ora con un
            avvocato serve più di un altro mese passato a cercare online.
          </p>
        </div>
        <ul className={styles.casi}>
          {CASI.map(caso => (
            <li key={caso.voce}>
              <span className={styles.casoNorma}>{caso.norma}</span>
              <p className={styles.casoVoce}>«{caso.voce}»</p>
              <p className={styles.casoRisposta}>{caso.risposta}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.sezione} id="come-funziona" aria-labelledby="come-funziona-titolo">
        <div className={styles.intestazione}>
          <h2 id="come-funziona-titolo">Come si svolge.</h2>
          <p>
            Un incontro individuale, non un webinar. Si parla del tuo caso.
          </p>
        </div>
        <ol className={styles.passi}>
          {PASSI.map(passo => (
            <li key={passo.titolo}>
              <h3>{passo.titolo}</h3>
              <p>{passo.testo}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.sezione} id="date" aria-labelledby="date-titolo">
        <div className={styles.intestazione}>
          <h2 id="date-titolo">Le date che sono già passate.</h2>
          <p>
            Non è un quadro che arriverà: è in vigore. Chi usa strumenti di intelligenza
            artificiale nel proprio lavoro è già dentro questi obblighi.
          </p>
        </div>
        <ul className={styles.scadenze}>
          {SCADENZE.map(voce => (
            <li key={voce.quando}>
              <p className={styles.scadenzaQuando}>{voce.quando}</p>
              <p className={styles.scadenzaCosa}>{voce.cosa}</p>
            </li>
          ))}
        </ul>
        <p className={styles.disclaimer}>
          I riferimenti normativi sono indicati per orientarsi. Quale obbligo ricada
          davvero sulla tua attività dipende da cosa fai e con quali strumenti: è
          esattamente ciò che si stabilisce durante la consulenza.
        </p>
      </section>

      <section className={styles.sezione} aria-labelledby="domande-titolo">
        <div className={styles.intestazione}>
          <h2 id="domande-titolo">Prima di prenotare.</h2>
        </div>
        <div className={styles.domande}>
          {DOMANDE.map(voce => (
            <details key={voce.q}>
              <summary>{voce.q}</summary>
              <p>{voce.a}</p>
            </details>
          ))}
        </div>

        <div className={styles.rimando}>
          <p>
            <strong>Cerchi formazione e non un parere?</strong> I corsi con l’Avv. Sapone
            hanno una pagina loro, con il programma e le date.
          </p>
          <Link href="/corsi">Vedi i corsi <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className={styles.chiusura}>
        <h2>Mezz’ora spesa bene costa meno di un anno passato a sperare.</h2>
        <p>
          {CONSULENZA_PREZZO} IVA esclusa, con l’Avv. Vincenzo Sapone. Se dopo l’incontro
          serve altro, te lo dice lui — e ti dice anche quando non serve.
        </p>
        <div className={styles.chiusuraAzioni}>
          <a className={styles.chiusuraPrimaria} href="#prenota">
            Prenota la consulenza <ArrowRight size={16} aria-hidden="true" />
          </a>
          <a className={styles.chiusuraSecondaria} href={WHATSAPP_URL} target="_blank" rel="noreferrer noopener">
            Chiedi prima informazioni
          </a>
        </div>
      </section>

      <PublicFooter />
      <FloatingNavigation />
    </main>
  )
}
