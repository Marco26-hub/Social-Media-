import type { Metadata } from 'next'
import Image from 'next/image'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import { SEGRETARIA_LISTINO, SEGRETARIA_NOTA } from '@/lib/segretaria-listino'
import { SITE_URL } from '@/lib/site-config'
import styles from './landing.module.css'

// Landing della Segretaria AI: struttura e impaginazione sono quelle della
// landing AgendaPiena, portate qui perche il dominio resti uno solo. Cambia la
// palette (vedi landing.module.css) e cambiano i collegamenti, che puntano alle
// pagine esistenti di questo sito invece che a quelle del progetto separato.

const path = '/servizi/segretaria-ai'
const title = 'Segretaria telefonica AI e agenda intelligente | SWA'
const description = 'Risponde alle chiamate, fissa appuntamenti, recupera clienti e prepara i messaggi WhatsApp per le attività che lavorano su appuntamento. I messaggi partono solo dopo la tua approvazione.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: { title, description, url: `${SITE_URL}${path}` },
  twitter: { title, description },
}

const WA = 'https://wa.me/393477196603?text=' + encodeURIComponent('Ciao! Vorrei una call sulla Segretaria telefonica AI.')

// Esempio di pannello, senza cifre: i numeri di una demo non sono risultati e in
// una pagina che vende si leggono come promesse.
const opportunita = [
  ['Agenda', 'Orario libero domani alle 15:30', 'Propone i clienti adatti a coprirlo'],
  ['Recupero', 'Clienti che non tornano da tempo', 'Prepara il messaggio, tu approvi'],
]

const funzioni = [
  ['Risponde al telefono', 'Accoglie chi chiama e spiega servizi, prezzi e orari usando soltanto le informazioni approvate da te.'],
  ['Fissa gli appuntamenti', 'Controlla gli orari disponibili, raccoglie i dati e salva la prenotazione dopo la conferma del cliente.'],
  ['Recupera i clienti', 'Trova chi non torna da tempo, i percorsi interrotti e le persone adatte a un orario rimasto libero.'],
  ['Prepara i messaggi', 'Scrive messaggi WhatsApp personali. Tu li controlli e decidi quali inviare.'],
]

const passi = [
  ['Colleghiamo i dati', 'Importiamo clienti e agenda dal file o dal gestionale che usi già.'],
  ['Trova le occasioni', 'Controlla assenze, percorsi interrotti, richiami e orari rimasti vuoti.'],
  ['Tu approvi', 'Ogni mattina trovi poche azioni chiare, con i messaggi già pronti.'],
  ['Misuri i risultati', 'Vedi risposte, appuntamenti recuperati e orari riempiti.'],
]

const citta = ['Milano', 'Roma', 'Torino', 'Bologna', 'Firenze', 'Napoli', 'Verona', 'Rimini', 'Como', 'Bergamo']

const settori = [
  ['Centri estetici', 'Richiami, pacchetti, laser, viso e corpo.'],
  ['Cliniche estetiche e longevità', 'Follow-up, controlli e continuità dei percorsi.'],
  ['Parrucchieri e barberie', 'Telefonate, appuntamenti, colore e richiami personali.'],
  ['Studi dentistici', 'Prenotazioni, spostamenti e richiami organizzativi.'],
  ['Fisioterapia e osteopatia', 'Sedute, cicli da completare e richieste da passare allo studio.'],
  ['Altre attività', 'Officine, studi professionali, ristorazione e servizi locali.'],
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      '@id': `${SITE_URL}${path}#service`,
      name: 'Segretaria telefonica AI e agenda intelligente',
      serviceType: 'Assistente telefonica e gestione agenda per attività su appuntamento',
      description,
      provider: { '@type': 'Organization', name: 'Social Web Automation', url: SITE_URL },
      areaServed: 'IT',
      offers: {
        '@type': 'Offer',
        price: '199',
        priceCurrency: 'EUR',
        description: 'Canone mensile a partire dal piano Voce Base, IVA esclusa, oltre al costo di avvio indicato in proposta.',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}${path}#faq`,
      mainEntity: [
        ['Sostituisce la mia segretaria?', 'No. Gestisce le richieste ripetitive e le chiamate che altrimenti andrebbero perse. Le richieste delicate vengono passate a una persona.'],
        ['I messaggi partono da soli?', 'No. Il sistema prepara le bozze: nessun messaggio raggiunge un cliente senza la tua approvazione.'],
        ['Per quali attività è pensata?', 'Per chi lavora su appuntamento: centri estetici, cliniche, parrucchieri, studi dentistici, fisioterapia e altri servizi locali su prenotazione.'],
        ['Garantite un numero di appuntamenti recuperati?', 'No. Il servizio individua le occasioni e prepara il lavoro; il risultato dipende anche da offerta, stagionalità e rapporto con i clienti.'],
      ].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
  ],
}

export default function SegretariaAiPage() {
  return (
    <div className={styles.pagina}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PublicHeader ctaHref={WA} ctaLabel="Richiedi una call" />

      <main>
        <div className="home-hero">
          {/* Foto e strati cinematici dell'originale: vignettatura, luce, grana
              e le due orbite. Restano invariati, cambia solo la palette. */}
          <div className="cinematic-media" aria-hidden="true">
            <Image
              src="/segretaria-ai-hero.webp"
              alt=""
              fill
              priority
              fetchPriority="high"
              quality={90}
              sizes="100vw"
              style={{ objectFit: 'cover', objectPosition: 'center 22%' }}
            />
            <div className="cinematic-vignette" />
            <div className="cinematic-light" />
            <div className="film-grain" />
            <div className="tech-orbit orbit-one" />
            <div className="tech-orbit orbit-two" />
          </div>
          <section className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Segretaria telefonica e agenda</span>
              <h1>Risponde al telefono. Fissa appuntamenti. Riempie l’agenda.</h1>
              <p>
                Un’assistente per chi lavora su appuntamento. Risponde alle chiamate quando tu non
                puoi, prenota negli orari davvero liberi e prepara i messaggi per recuperare chi non
                torna da tempo. Le decisioni restano tue: niente parte senza il tuo sì.
              </p>
              <div className="hero-actions">
                <a className="primary-action" href={WA}>Richiedi una call</a>
                <a className="secondary-action" href="#listino">Vedi i piani</a>
              </div>
              <div className="proof-strip" aria-label="Caratteristiche principali">
                <span>Italiano e inglese</span>
                <span>Le regole le scegli tu</span>
                <span>Attiva anche quando sei occupato</span>
              </div>
            </div>

            <div className="hero-stage luxury-stage" aria-label="Anteprima del pannello">
              <span className="live-caption"><i /> Conversazione assistita</span>
              <div className="phone-frame floating-console">
                <div className="phone-top"><span>Esempio di pannello</span><strong>Oggi</strong></div>
                <div className="pulse-card"><span className="live-dot" />Assistente attiva</div>
                {opportunita.map(([tag, titolo, dettaglio]) => (
                  <article className="opportunity-card" key={titolo}>
                    <div><span>{tag}</span><h3>{titolo}</h3><p>{dettaglio}</p></div>
                  </article>
                ))}
                <button className="approve-button" type="button">Controlla i messaggi pronti</button>
              </div>
            </div>
          </section>
        </div>

        <section className="service-clarity section">
          <div className="section-title">
            <span>In parole semplici</span>
            <h2>Due servizi, anche nello stesso piano.</h2>
            <p>Puoi usare soltanto la segretaria telefonica, soltanto il sistema per recuperare clienti, oppure collegarli e gestire tutto da un pannello unico.</p>
          </div>
          <div className="service-clarity-grid">
            <article><span>01</span><h3>Segretaria telefonica AI</h3><p>Risponde al numero dell’attività, parla con il cliente, dà le informazioni corrette e fissa, sposta o annulla appuntamenti.</p></article>
            <article><span>02</span><h3>Agenda, clienti e WhatsApp</h3><p>Controlla agenda e storico, segnala chi ricontattare e prepara messaggi personali da approvare prima dell’invio.</p></article>
            <article><span>03</span><h3>Tutto in uno</h3><p>Telefonate, prenotazioni, recupero clienti e messaggi lavorano insieme. Tu e il personale vedete tutto nello stesso posto.</p></article>
          </div>
        </section>

        <section className="statement-band">
          <p>Quando non puoi rispondere, risponde lei.</p>
          <h2>Il cliente riceve aiuto subito. Tu ritrovi la richiesta e l’appuntamento nel pannello.</h2>
        </section>

        <section className="section">
          <div className="section-title">
            <span>Cosa fa davvero</span>
            <h2>Gestisce le richieste ripetitive, senza toglierti il controllo.</h2>
            <p>L’assistente usa servizi, prezzi, orari e regole inseriti dalla tua attività. Le richieste delicate o non previste vengono passate a una persona.</p>
          </div>
          <div className="benefit-grid">
            {funzioni.map(([titolo, testo], i) => (
              <article className="benefit-item" key={titolo}>
                <span>0{i + 1}</span><h3>{titolo}</h3><p>{testo}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="full-workflow">
          <div className="section-title"><span>Il flusso completo</span><h2>Da una richiesta a un appuntamento confermato.</h2></div>
          <div className="workflow-rail">
            {['Riceve la richiesta', 'Capisce cosa serve', 'Controlla l’agenda', 'Prenota o prepara il messaggio', 'Registra il risultato'].map((label, i) => (
              <div key={label}><span>{String(i + 1).padStart(2, '0')}</span><strong>{label}</strong></div>
            ))}
          </div>
          <p>Ogni passaggio resta visibile: puoi controllare cosa ha chiesto il cliente, quale risposta ha ricevuto e se l’appuntamento è stato fissato.</p>
        </section>

        <section className="product-band">
          <div className="admin-copy">
            <span>Una schermata, poche decisioni</span>
            <h2>Apri. Controlla. Approva.</h2>
            <p>Dal telefono vedi le occasioni più importanti della giornata, i messaggi pronti e il valore possibile. Il tuo staff continua a lavorare come sempre.</p>
            <a className="light-action" href={WA}>Richiedi una call</a>
          </div>
          <div className="admin-phone">
            <div className="admin-head"><span>Esempio di pannello</span><b>Che cosa vedi</b></div>
            <div className="admin-kpis">
              <div><span>Chi ricontattare, con il motivo</span></div>
              <div><span>Gli orari rimasti liberi</span></div>
              <div><span>I messaggi pronti da approvare</span></div>
              <div><span>Le risposte e gli appuntamenti ottenuti</span></div>
            </div>
            <div className="task-list">
              <article><div><h3>Riprendi il percorso interrotto</h3><p>Messaggi pronti, in attesa del tuo sì</p></div><button>Controlla</button></article>
              <article><div><h3>Riempi l’orario libero di venerdì</h3><p>Clienti adatti già selezionati</p></div><button>Controlla</button></article>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-title"><span>Come si parte</span><h2>Operativa in quattro passaggi.</h2></div>
          <div className="workflow-grid">
            {passi.map(([titolo, testo], i) => (
              <article className="workflow-card" key={titolo}><span>0{i + 1}</span><h3>{titolo}</h3><p>{testo}</p></article>
            ))}
          </div>
        </section>

        <section className="section audience-section">
          <div className="section-title"><span>Per chi lavora su appuntamento</span><h2>Utile ogni volta che una chiamata persa può diventare lavoro perso.</h2></div>
          <div className="audience-grid">
            {settori.map(([titolo, testo], i) => (
              <div key={titolo}><span>0{i + 1}</span><h3>{titolo}</h3><p>{testo}</p></div>
            ))}
          </div>
        </section>

        <section className="geo-section">
          <div className="section-title">
            <span>In tutta Italia</span>
            <h2>Vicino al modo in cui lavora la tua attività.</h2>
            <p>Configurazione e affiancamento da remoto, con messaggi in italiano naturale e attenzione al rapporto con ogni cliente.</p>
          </div>
          <div className="area-list">
            {citta.map(c => <span key={c}>Segretaria AI a {c}</span>)}
          </div>
        </section>

        <section className="section" id="listino">
          <div className="section-title">
            <span>Listino</span>
            <h2>Due famiglie, cinque piani. Scegli cosa automatizzare.</h2>
            <p>Agenda e clienti prepara i messaggi e aiuta a riempire gli spazi liberi. La segretaria telefonica risponde e gestisce le prenotazioni. Puoi usarle separate oppure insieme.</p>
          </div>

          {SEGRETARIA_LISTINO.map(famiglia => (
            <div className={styles.famiglia} key={famiglia.id}>
              <div className={styles.famigliaTesta}>
                <span>{famiglia.occhiello}</span>
                <h3>{famiglia.nome}</h3>
                <p>{famiglia.descrizione}</p>
              </div>
              <div className={styles.piani}>
                {famiglia.piani.map(piano => (
                  <article className={`${styles.piano} ${piano.evidenza ? styles.pianoEvidenza : ''}`} key={piano.id}>
                    <p className={styles.pianoPerChi}>{piano.evidenza ?? piano.perChi}</p>
                    <h4>{piano.nome}</h4>
                    <p className={styles.pianoPrezzo}>
                      <strong>€{piano.canone}</strong><span>al mese</span>
                    </p>
                    <p className={styles.pianoAvvio}>Avvio {piano.avvio} · {piano.soglia}</p>
                    <ul>{piano.voci.map(v => <li key={v}>{v}</li>)}</ul>
                    <p className={styles.pianoExtra}>{piano.extra}</p>
                    <a className={styles.pianoCta} href={WA}>Richiedi una call</a>
                  </article>
                ))}
              </div>
            </div>
          ))}

          <p className={styles.listinoNota}>{SEGRETARIA_NOTA}</p>
        </section>

      </main>

      <PublicFooter />
    </div>
  )
}
