import Link from 'next/link'
import AiCasaScena from './AiCasaScena'
import FloatingNavigation from './FloatingNavigation'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'
import type { ContenutoAiCasa } from '@/lib/ai-casa-contenuti'
import { numeroItaliano } from '@/lib/euro'
import { metodoServizio } from '@/lib/metodo'
import { metodoServizioEn } from '@/lib/metodo.en'
import { SITE_URL } from '@/lib/site-config'
import styles from './ai-casa-landing.module.css'

/**
 * Landing del servizio «AI a casa tua»: un Mac consegnato con l'intelligenza
 * artificiale già installata, tarata sulla macchina e collaudata.
 *
 * L'impaginazione è una, i testi arrivano da lib/ai-casa-contenuti.ts: la
 * gemella inglese usa questo stesso componente con l'altro contenuto, invece di
 * essere una copia che diverge al primo ritocco.
 *
 * Due regole che reggono tutti i testi, in entrambe le lingue.
 *
 * 1. Niente cifre inventate. I prezzi in pagina sono quelli del nostro lavoro;
 *    il prezzo della macchina non è scritto perché cambia quando lo cambia
 *    Apple, e una cifra vecchia è peggio di nessuna cifra.
 * 2. Si vende il risultato, non la ricetta. Nomi dei modelli, quantizzazioni,
 *    script, porte e variabili d'ambiente non compaiono: sono il motivo per cui
 *    la macchina non si blocca, e restano nostri.
 *
 * In inglese intestazione e piè di pagina arrivano dal layout di /en, che li
 * monta già: ripeterli qui darebbe due testate sulla stessa pagina.
 */
export default function AiCasaLanding({ contenuto: c }: { contenuto: ContenutoAiCasa }) {
  const inglese = c.locale === 'en'
  const urlPagina = `${SITE_URL}${c.path}`
  const fasi = inglese
    ? metodoServizioEn('ai-a-casa-tua')
    : metodoServizio('ai-a-casa-tua').fasi

  // Le altre pagine di servizio passano da MarketingDetailPage, che costruisce
  // questo grafo da sé. Questa ha un'impaginazione propria, quindi il grafo si
  // scrive qui — ma nella stessa forma, o due pagine sorelle direbbero ai
  // motori due cose diverse sullo stesso tipo di servizio.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${urlPagina}#webpage`,
        url: urlPagina,
        name: c.schema.nome,
        inLanguage: inglese ? 'en' : 'it-IT',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        // Quali blocchi hanno senso letti ad alta voce da un assistente: il
        // titolo, l'attacco e le domande, che sono già scritte per stare in
        // piedi fuori dalla pagina.
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '[class*="lead"]', '[class*="faq"] summary', '[class*="faq"] p'],
        },
        about: { '@id': `${urlPagina}#service` },
      },
      {
        '@type': 'Service',
        '@id': `${urlPagina}#service`,
        name: c.schema.nome,
        serviceType: c.schema.tipoServizio,
        description: c.schema.descrizione,
        provider: { '@id': `${SITE_URL}/#organization` },
        areaServed: { '@type': 'Country', name: c.schema.areaServita },
        url: urlPagina,
        // I prezzi dichiarati sono quelli del nostro lavoro. Il computer non
        // entra: non lo vendiamo, e metterlo qui farebbe credere il contrario
        // a chi legge solo i dati strutturati.
        offers: c.prezzi.pacchetti.map(pacchetto => ({
          '@type': 'Offer',
          name: pacchetto.nome,
          description: pacchetto.sintesi,
          price: pacchetto.prezzo,
          priceCurrency: 'EUR',
          url: `${urlPagina}#prezzi`,
          category: pacchetto.perChi,
          priceSpecification: {
            '@type': 'PriceSpecification',
            price: pacchetto.prezzo,
            priceCurrency: 'EUR',
            valueAddedTaxIncluded: false,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: c.briciole.home, item: `${SITE_URL}${c.briciole.hrefHome === '/' ? '' : c.briciole.hrefHome}` },
          { '@type': 'ListItem', position: 2, name: c.briciole.servizi, item: `${SITE_URL}${c.briciole.hrefServizi}` },
          { '@type': 'ListItem', position: 3, name: c.briciole.qui, item: urlPagina },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: c.faq.domande.map(domanda => ({
          '@type': 'Question',
          name: domanda.q,
          acceptedAnswer: { '@type': 'Answer', text: domanda.a },
        })),
      },
      {
        '@type': 'HowTo',
        '@id': `${urlPagina}#howto`,
        name: c.schema.howToNome,
        description: c.schema.howToDescrizione,
        inLanguage: inglese ? 'en' : 'it-IT',
        step: fasi.map((fase, indice) => ({
          '@type': 'HowToStep',
          position: indice + 1,
          name: fase.title,
          text: fase.text,
          url: `${urlPagina}#come-funziona`,
        })),
      },
    ],
  }

  return (
    <main id="main-content" className={styles.pagina}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {!inglese && <PublicHeader ctaHref={c.whatsapp} ctaLabel="Parliamo della macchina" />}

      {/* Il palco: l'unica parte scura della pagina, dove stanno le luci. */}
      <section className={styles.palco} aria-labelledby="titolo-ai-casa">
        <div className={styles.hero}>
          <div className={styles.heroTesto}>
            {/* Le briciole: le pagine sorelle le hanno, e il nodo
                BreadcrumbList dichiarava un percorso che sullo schermo non
                esisteva. */}
            <nav className={styles.briciole} aria-label={inglese ? 'Breadcrumb' : 'Percorso'}>
              <Link href={c.briciole.hrefHome}>{c.briciole.home}</Link>
              <span aria-hidden="true">/</span>
              <Link href={c.briciole.hrefServizi}>{c.briciole.servizi}</Link>
              <span aria-hidden="true">/</span>
              <span>{c.briciole.qui}</span>
            </nav>

            <p className={`${styles.occhiello} ${styles.occhielloChiaro}`}>{c.hero.occhiello}</p>
            <h1 id="titolo-ai-casa" className={styles.titolo}>{c.hero.h1}</h1>
            <p className={styles.lead}>{c.hero.lead}</p>

            <div className={styles.azioni}>
              <a className={styles.azionePrimaria} href={c.whatsapp} target="_blank" rel="noopener noreferrer">
                {c.hero.ctaPrimaria}
              </a>
              <a className={styles.azioneSecondaria} href="#come-funziona">{c.hero.ctaSecondaria}</a>
            </div>

            <p className={styles.prove}>
              {c.hero.prove.map(prova => <span key={prova}>{prova}</span>)}
            </p>
          </div>
        </div>

        <AiCasaScena intestazione={c.terminale.intestazione} battute={c.terminale.battute} />
      </section>

      <section className={styles.sezione} aria-labelledby="titolo-perche">
        <p className={styles.occhiello}>{c.perche.occhiello}</p>
        <h2 id="titolo-perche" className={styles.titoloSezione}>{c.perche.h2}</h2>
        <p className={styles.introSezione}>{c.perche.intro}</p>

        <div className={styles.griglia3}>
          {c.perche.card.map(card => (
            <article key={card.titolo} className={styles.card}>
              <p className={styles.cardNumero}>{card.numero}</p>
              <h3 className={styles.cardTitolo}>{card.titolo}</h3>
              <p className={styles.cardTesto}>{card.testo}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.sezione} id="come-funziona" aria-labelledby="titolo-come">
        <p className={styles.occhiello}>{c.come.occhiello}</p>
        <h2 id="titolo-come" className={styles.titoloSezione}>{c.come.h2}</h2>

        <div className={styles.griglia4}>
          {c.come.passi.map(passo => (
            <article key={passo.titolo} className={styles.card}>
              <p className={styles.cardNumero}>{passo.numero}</p>
              <h3 className={styles.cardTitolo}>{passo.titolo}</h3>
              <p className={styles.cardTesto}>{passo.testo}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.sezione} aria-labelledby="titolo-primo-giorno">
        <div className={styles.fascia}>
          <div>
            <p className={`${styles.occhiello} ${styles.occhielloChiaro}`}>{c.primoGiorno.occhiello}</p>
            <h2 id="titolo-primo-giorno" className={styles.titoloSezione}>{c.primoGiorno.h2}</h2>
            <p className={styles.introSezione}>{c.primoGiorno.intro}</p>
          </div>

          <div className={styles.elenco}>
            {c.primoGiorno.voci.map(voce => (
              <div key={voce.titolo} className={styles.voce}>
                <p className={styles.voceTitolo}>{voce.titolo}</p>
                <p className={styles.voceTesto}>{voce.testo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sezione} aria-labelledby="titolo-tagli">
        <p className={styles.occhiello}>{c.tagli.occhiello}</p>
        <h2 id="titolo-tagli" className={styles.titoloSezione}>{c.tagli.h2}</h2>
        <p className={styles.introSezione}>{c.tagli.intro}</p>

        <div className={styles.griglia3}>
          {c.tagli.card.map(card => (
            <article key={card.nome} className={styles.taglio}>
              <div className={styles.taglioBarra} />
              <h3 className={styles.taglioNome}>{card.nome}</h3>
              <p className={styles.taglioRuolo}>{card.ruolo}</p>
              <p className={styles.taglioTesto}>{card.testo}</p>
            </article>
          ))}
        </div>

        <p className={styles.nota}>{c.tagli.nota}</p>
      </section>

      {/* Conformità.

          Qui si vende, non si spiega la norma: niente articoli, niente date,
          niente importi di sanzione. Il dettaglio normativo sta nei termini e
          nella consulenza legale, che è dove qualcuno ne risponde. Resta una
          riga di verità scomoda — tenere il modello in casa non esenta da
          niente — perché toglierla sarebbe una promessa falsa, e il pubblico di
          questa pagina la smonterebbe in dieci secondi. */}
      <section className={styles.sezione} id="conformita" aria-labelledby="titolo-conformita">
        <p className={styles.occhiello}>{c.conformita.occhiello}</p>
        <h2 id="titolo-conformita" className={styles.titoloSezione}>{c.conformita.h2}</h2>
        <p className={styles.introSezione}>{c.conformita.intro}</p>

        <div className={styles.griglia4}>
          {c.conformita.card.map(card => (
            <article key={card.titolo} className={styles.card}>
              <p className={styles.cardNumero}>{card.numero}</p>
              <h3 className={styles.cardTitolo}>{card.titolo}</h3>
              <p className={styles.cardTesto}>{card.testo}</p>
            </article>
          ))}
        </div>

        <div className={styles.dichiarazione}>
          <div>
            <p className={styles.dichiarazioneTitolo}>{c.conformita.avviso.titolo}</p>
            <p className={styles.dichiarazioneTesto}>{c.conformita.avviso.testo}</p>
          </div>
        </div>

        <div className={styles.azioni}>
          {c.conformita.azioni.map(azione => (
            <Link
              key={azione.href}
              className={azione.primaria ? styles.azionePrimaria : styles.azioneSecondaria}
              href={azione.href}
            >
              {azione.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Il listino.

          Va in pagina e non dietro un preventivo per una ragione sola: la frase
          «il Mac lo paghi ad Apple, noi non ci guadagniamo sopra» vale come
          argomento solo se accanto c'è scritto quanto costa il nostro lavoro. */}
      <section className={styles.sezione} id="prezzi" aria-labelledby="titolo-prezzi">
        <p className={styles.occhiello}>{c.prezzi.occhiello}</p>
        <h2 id="titolo-prezzi" className={styles.titoloSezione}>{c.prezzi.h2}</h2>
        <p className={styles.introSezione}>{c.prezzi.intro}</p>

        <div className={styles.listino}>
          {c.prezzi.pacchetti.map(pacchetto => (
            <article
              key={pacchetto.id}
              className={pacchetto.scelto ? `${styles.piano} ${styles.pianoScelto}` : styles.piano}
            >
              {pacchetto.scelto && <span className={styles.pianoEtichetta}>{c.prezzi.etichettaScelto}</span>}
              <h3 className={styles.pianoNome}>{pacchetto.nome}</h3>
              <p className={styles.pianoPerChi}>{pacchetto.perChi}</p>
              <p className={styles.pianoPrezzo}>
                {numeroItaliano(pacchetto.prezzo)} <small>€</small>
              </p>
              <p className={styles.pianoTesto}>{pacchetto.sintesi}</p>
              <ul className={styles.pianoElenco}>
                {pacchetto.voci.map(voce => <li key={voce}>{voce}</li>)}
              </ul>
            </article>
          ))}
        </div>

        <div className={styles.dichiarazione}>
          <div>
            <p className={styles.dichiarazioneTitolo}>{c.prezzi.analisi.titolo}</p>
            <p className={styles.dichiarazioneTesto}>{c.prezzi.analisi.testo}</p>
          </div>
          <Link className={styles.azionePrimaria} href={c.prezzi.analisi.href}>{c.prezzi.analisi.cta}</Link>
        </div>

        <div className={styles.righe}>
          {c.prezzi.righe.map(riga => (
            <div key={riga.voce} className={styles.riga}>
              <span className={styles.rigaVoce}>{riga.voce}</span>
              <span className={styles.rigaDettaglio}>{riga.dettaglio}</span>
              <span className={styles.rigaPrezzo}>{riga.prezzo}</span>
            </div>
          ))}
        </div>

        <p className={styles.nota}>
          {c.prezzi.nota.testo}
          <Link href={c.prezzi.nota.hrefLink}>{c.prezzi.nota.link}</Link>
          {c.prezzi.nota.coda}
        </p>
      </section>

      <section className={styles.sezione} aria-labelledby="titolo-domande">
        <p className={styles.occhiello}>{c.faq.occhiello}</p>
        <h2 id="titolo-domande" className={styles.titoloSezione}>{c.faq.h2}</h2>

        <div className={styles.faq}>
          {c.faq.domande.map(domanda => (
            <details key={domanda.q} className={styles.faqVoce}>
              <summary>{domanda.q}</summary>
              <p>{domanda.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.finale} aria-labelledby="titolo-finale">
        <p className={styles.occhiello}>{c.finale.occhiello}</p>
        <h2 id="titolo-finale" className={styles.titoloSezione}>{c.finale.h2}</h2>
        <p className={styles.introSezione}>{c.finale.intro}</p>

        <div className={styles.azioni}>
          <a className={styles.azionePrimaria} href={c.whatsapp} target="_blank" rel="noopener noreferrer">
            {c.finale.ctaPrimaria}
          </a>
          <Link className={styles.azioneSecondaria} href={c.finale.ctaSecondaria.href}>
            {c.finale.ctaSecondaria.label}
          </Link>
        </div>
      </section>

      {!inglese && <PublicFooter />}
      {!inglese && <FloatingNavigation />}
    </main>
  )
}
