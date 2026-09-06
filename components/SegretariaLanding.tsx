import Image from 'next/image'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import { SEGRETARIA_NOTA, type FamigliaSegretaria } from '@/lib/segretaria-listino'
import { SITE_URL } from '@/lib/site-config'
import styles from './segretaria-landing.module.css'

// Impianto condiviso dalle pagine della Segretaria AI.
//
// Le due pagine rispondono a due ricerche diverse — chi ha il telefono che
// squilla a vuoto e chi ha l'agenda con i buchi — quindi hanno testi, titoli e
// dati strutturati propri. Qui sta solo l'impaginazione, che e la stessa: il
// contenuto arriva tutto dalla configurazione, cosi due pagine non diventano
// due copie della stessa pagina agli occhi di un motore.

export type ContenutoLanding = {
  path: string
  briciola: string
  occhiello: string
  h1: string
  lead: string
  descrizione: string
  /** Nome del servizio nei dati strutturati. */
  servizio: string
  tipoServizio: string
  waTesto: string
  foto: string
  consolePrima: string
  console: readonly (readonly [string, string, string])[]
  consoleCta: string
  chiarezza: { occhiello: string; h2: string; intro: string; voci: readonly (readonly [string, string])[] }
  dichiarazione: { occhiello: string; h2: string }
  funzioni: { occhiello: string; h2: string; intro: string; voci: readonly (readonly [string, string])[] }
  flusso: { occhiello: string; h2: string; passi: readonly string[]; chiusura: string }
  pannello: { occhiello: string; h2: string; testo: string; vedi: readonly string[]; righe: readonly (readonly [string, string])[] }
  avvio: { occhiello: string; h2: string; passi: readonly (readonly [string, string])[] }
  settori: { occhiello: string; h2: string; voci: readonly (readonly [string, string])[] }
  citta: readonly string[]
  listino: { occhiello: string; h2: string; intro: string; famiglia: FamigliaSegretaria }
  faq: readonly (readonly [string, string])[]
  /** Rimando all'altra pagina: il ponte fra i due servizi. */
  gemella: { href: string; occhiello: string; h2: string; testo: string; cta: string }
}

export default function SegretariaLanding({ c }: { c: ContenutoLanding }) {
  const wa = `https://wa.me/393477196603?text=${encodeURIComponent(c.waTesto)}`
  const url = `${SITE_URL}${c.path}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#briciole`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Servizi', item: `${SITE_URL}/servizi` },
          { '@type': 'ListItem', position: 3, name: c.briciola, item: url },
        ],
      },
      {
        '@type': 'Service',
        '@id': `${url}#servizio`,
        name: c.servizio,
        serviceType: c.tipoServizio,
        description: c.descrizione,
        url,
        provider: { '@type': 'Organization', name: 'Social Web Automation', url: SITE_URL },
        areaServed: { '@type': 'Country', name: 'Italia' },
        // Un'offerta per piano: un motore che legge il catalogo puo mostrare il
        // prezzo giusto invece di indovinarlo dal testo.
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: c.listino.famiglia.nome,
          itemListElement: c.listino.famiglia.piani.map(p => ({
            '@type': 'Offer',
            name: p.nome,
            price: String(p.canone),
            priceCurrency: 'EUR',
            description: `${p.perChi}. ${p.soglia}. Avvio ${p.avvio}. Prezzi IVA esclusa.`,
            availability: 'https://schema.org/InStock',
          })),
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: c.faq.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  }

  return (
    <div className={styles.pagina}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PublicHeader ctaHref={wa} ctaLabel="Richiedi una call" />

      <main id="main-content">
        <div className="home-hero">
          <div className="cinematic-media" aria-hidden="true">
            <Image src={c.foto} alt="" fill priority fetchPriority="high" quality={90} sizes="100vw"
              style={{ objectFit: 'cover', objectPosition: 'center 22%' }} />
            <div className="cinematic-vignette" />
            <div className="cinematic-light" />
            <div className="film-grain" />
            <div className="tech-orbit orbit-one" />
            <div className="tech-orbit orbit-two" />
          </div>
          <section className="hero-grid">
            <div className="hero-copy">
              <nav className={styles.briciole} aria-label="Percorso">
                <Link href="/">Home</Link><span aria-hidden="true">/</span>
                <Link href="/servizi">Servizi</Link><span aria-hidden="true">/</span>
                <span>{c.briciola}</span>
              </nav>
              <span className="eyebrow">{c.occhiello}</span>
              <h1>{c.h1}</h1>
              <p>{c.lead}</p>
              <div className="hero-actions">
                <a className="primary-action" href={wa}>Richiedi una call</a>
                <a className="secondary-action" href="#listino">Vedi i piani</a>
              </div>
              <div className="proof-strip" aria-label="In sintesi">
                <span>Italiano e inglese</span>
                <span>Le regole le scegli tu</span>
                <span>Nessun invio senza la tua approvazione</span>
              </div>
            </div>

            <div className="hero-stage luxury-stage" aria-label="Esempio del pannello">
              <span className="live-caption"><i /> {c.consolePrima}</span>
              <div className="phone-frame floating-console">
                <div className="phone-top"><span>Esempio di pannello</span><strong>Oggi</strong></div>
                <div className="pulse-card"><span className="live-dot" />Assistente attiva</div>
                {c.console.map(([tag, titolo, dettaglio]) => (
                  <article className="opportunity-card" key={titolo}>
                    <div><span>{tag}</span><h3>{titolo}</h3><p>{dettaglio}</p></div>
                  </article>
                ))}
                <button className="approve-button" type="button">{c.consoleCta}</button>
              </div>
            </div>
          </section>
        </div>

        <section className="service-clarity section">
          <div className="section-title">
            <span>{c.chiarezza.occhiello}</span>
            <h2>{c.chiarezza.h2}</h2>
            <p>{c.chiarezza.intro}</p>
          </div>
          <div className="service-clarity-grid">
            {c.chiarezza.voci.map(([t, p], i) => (
              <article key={t}><span>0{i + 1}</span><h3>{t}</h3><p>{p}</p></article>
            ))}
          </div>
        </section>

        <section className="statement-band">
          <p>{c.dichiarazione.occhiello}</p>
          <h2>{c.dichiarazione.h2}</h2>
        </section>

        <section className="section">
          <div className="section-title">
            <span>{c.funzioni.occhiello}</span>
            <h2>{c.funzioni.h2}</h2>
            <p>{c.funzioni.intro}</p>
          </div>
          <div className="benefit-grid">
            {c.funzioni.voci.map(([t, p], i) => (
              <article className="benefit-item" key={t}><span>0{i + 1}</span><h3>{t}</h3><p>{p}</p></article>
            ))}
          </div>
        </section>

        <section className="full-workflow">
          <div className="section-title"><span>{c.flusso.occhiello}</span><h2>{c.flusso.h2}</h2></div>
          <div className="workflow-rail">
            {c.flusso.passi.map((label, i) => (
              <div key={label}><span>{String(i + 1).padStart(2, '0')}</span><strong>{label}</strong></div>
            ))}
          </div>
          <p>{c.flusso.chiusura}</p>
        </section>

        <section className="product-band">
          <div className="admin-copy">
            <span>{c.pannello.occhiello}</span>
            <h2>{c.pannello.h2}</h2>
            <p>{c.pannello.testo}</p>
            <a className="light-action" href={wa}>Richiedi una call</a>
          </div>
          <div className="admin-phone">
            <div className="admin-head"><span>Esempio di pannello</span><b>Che cosa vedi</b></div>
            <div className="admin-kpis">
              {c.pannello.vedi.map(v => <div key={v}><span>{v}</span></div>)}
            </div>
            <div className="task-list">
              {c.pannello.righe.map(([t, p]) => (
                <article key={t}><div><h3>{t}</h3><p>{p}</p></div><button>Controlla</button></article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-title"><span>{c.avvio.occhiello}</span><h2>{c.avvio.h2}</h2></div>
          <div className="workflow-grid">
            {c.avvio.passi.map(([t, p], i) => (
              <article className="workflow-card" key={t}><span>0{i + 1}</span><h3>{t}</h3><p>{p}</p></article>
            ))}
          </div>
        </section>

        <section className="section audience-section">
          <div className="section-title"><span>{c.settori.occhiello}</span><h2>{c.settori.h2}</h2></div>
          <div className="audience-grid">
            {c.settori.voci.map(([t, p], i) => (
              <div key={t}><span>0{i + 1}</span><h3>{t}</h3><p>{p}</p></div>
            ))}
          </div>
        </section>

        <section className="geo-section">
          <div className="section-title">
            <span>In tutta Italia</span>
            <h2>Vicino al modo in cui lavora la tua attività.</h2>
            <p>Configurazione e affiancamento da remoto, con messaggi in italiano naturale e attenzione al rapporto con ogni cliente.</p>
          </div>
          <div className="area-list">{c.citta.map(x => <span key={x}>{c.briciola} a {x}</span>)}</div>
        </section>

        <section className="section" id="listino">
          <div className="section-title">
            <span>{c.listino.occhiello}</span>
            <h2>{c.listino.h2}</h2>
            <p>{c.listino.intro}</p>
          </div>
          <div className={styles.famiglia}>
            <div className={styles.piani}>
              {c.listino.famiglia.piani.map(p => (
                <article className={`${styles.piano} ${p.evidenza ? styles.pianoEvidenza : ''}`} key={p.id}>
                  <p className={styles.pianoPerChi}>{p.evidenza ?? p.perChi}</p>
                  <h3>{p.nome}</h3>
                  <p className={styles.pianoPrezzo}><strong>€{p.canone}</strong><span>al mese</span></p>
                  <p className={styles.pianoAvvio}>Avvio {p.avvio} · {p.soglia}</p>
                  <ul>{p.voci.map(v => <li key={v}>{v}</li>)}</ul>
                  <p className={styles.pianoExtra}>{p.extra}</p>
                  <a className={styles.pianoCta} href={wa}>Richiedi una call</a>
                </article>
              ))}
            </div>
          </div>
          <p className={styles.listinoNota}>{SEGRETARIA_NOTA}</p>
        </section>

        {/* Ponte verso l'altro servizio: tiene i due percorsi collegati senza
            farne una pagina sola. */}
        <section className={styles.gemella}>
          <div>
            <p className={styles.gemellaOcchiello}>{c.gemella.occhiello}</p>
            <h2>{c.gemella.h2}</h2>
            <p className={styles.gemellaTesto}>{c.gemella.testo}</p>
          </div>
          <Link href={c.gemella.href} className={styles.gemellaCta}>{c.gemella.cta}</Link>
        </section>

        <section className="section">
          <div className="section-title"><span>Domande</span><h2>Le domande che ci fanno più spesso.</h2></div>
          <div className={styles.faq}>
            {c.faq.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
