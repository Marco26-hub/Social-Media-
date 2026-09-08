import { anteprimaOg } from '@/lib/anteprima'
import { CANONE_A_CARICO_CLIENTE } from '@/lib/canone-incluso'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CalendarClock, CircleCheck, Clapperboard, Globe2, MapPin, Newspaper, PhoneCall, Target } from 'lucide-react'
import FloatingNavigation from '@/components/FloatingNavigation'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import { BLOG_SERVICE } from '@/lib/blog-service'
import { SEGRETARIA_LISTINO } from '@/lib/segretaria-listino'
import { VIDEO_COMPRESO, VIDEO_CONSEGNA, VIDEO_PACCHETTI, euroVideo } from '@/lib/video-listino'
import { PACCHETTI } from '@/lib/pacchetti'
import { STANDALONE_SERVICES } from '@/lib/standalone-services'
import { SITE_URL } from '@/lib/site-config'
import base from '@/styles/content-page.module.css'
import styles from './pacchetti.module.css'
import { CONSULENZA_LEGALE, CONSULENZA_PREZZO, CORSO_AI_ACT, CORSO_PREZZO } from '@/lib/consulenza-listino'
import { PREZZI } from '@/lib/prezzi-ingresso'

const title = 'Pacchetti Social, Blog, Siti Web e Lead B2B | SWA'
const description = 'Listino Social Web Automation: piani social Presenza e Crescita, blog, sito web, ricerca clienti B2B, segretaria telefonica AI e agenda. Prezzi IVA esclusa.'
const wa = `https://wa.me/393477196603?text=${encodeURIComponent('Ciao! Vorrei capire quale pacchetto Social Web Automation è adatto alla mia azienda.')}`

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}/pacchetti`,
    languages: { 'it-IT': `${SITE_URL}/pacchetti`, en: `${SITE_URL}/en/pricing`, 'x-default': `${SITE_URL}/pacchetti` },
  },
  openGraph: { title, description, url: `${SITE_URL}/pacchetti` , images: anteprimaOg('/pacchetti'), type: 'website',},
  twitter: { card: 'summary_large_image', title, description, images: anteprimaOg('/pacchetti') },
}

const faq = [
  { q: 'I prezzi includono l’IVA?', a: 'No. I prezzi indicati sono mensili e IVA esclusa.' },
  { q: 'L’hosting è compreso? E il dominio?', a: CANONE_A_CARICO_CLIENTE },
  { q: 'Il setup iniziale ha un costo?', a: 'Nei pacchetti social Presenza e Crescita il setup è incluso. Per Blog e Web eventuali integrazioni esterne vengono definite prima dell’avvio.' },
  { q: 'Il piano Crescita comprende le campagne a pagamento?', a: 'No. Presenza e Crescita sono piani di sola crescita organica. Le campagne ADS rientrano nella configurazione personalizzata: la gestione viene concordata e il budget versato alla piattaforma resta separato e sotto il controllo del cliente.' },
  { q: 'Blog SEO + GEO è incluso nei pacchetti social?', a: 'Crescita include un articolo al mese. Il servizio Blog autonomo comprende invece 12 articoli mensili e può essere combinato con qualsiasi piano.' },
  { q: 'Sito web ed e-commerce sono inclusi nei pacchetti social?', a: 'No. Il sito web è un servizio separato, combinabile con gli altri. Il canone è a partire da 19,90 euro al mese per una landing page semplice; e-commerce e funzioni avanzate vengono quotati a parte.' },
  { q: 'Cosa comprende il Pilot Ricerca Clienti B2B?', a: 'È un servizio una tantum da 149 euro: definiamo il profilo ideale, analizziamo fino a 30 aziende e consegniamo una lista verificata e prioritaria. Non comprende invii automatici e non garantisce appuntamenti o vendite.' },
  { q: 'Qual è la differenza tra SEO + GEO e Blog SEO + GEO?', a: 'SEO + GEO definisce audit, struttura, intenti e priorità. Blog SEO + GEO produce con continuità il piano editoriale e 12 articoli al mese.' },
  { q: 'Posso richiedere una configurazione diversa?', a: 'Sì. Più brand, canali, volumi, video, automazioni e integrazioni vengono quotati dopo una valutazione iniziale.' },
]

// Piani d'ingresso delle due famiglie: prezzi, soglie e voci vengono dal
// listino, non riscritti qui.
const VOCE = SEGRETARIA_LISTINO.find(f => f.id === 'voce')!.piani[0]
const AGENDA = SEGRETARIA_LISTINO.find(f => f.id === 'agenda')!.piani[0]
const WEB_BASE = STANDALONE_SERVICES.find(s => s.slug === 'web-commerce')!
const SITO_IMPRESA = STANDALONE_SERVICES.find(s => s.slug === 'web-impresa')!
const PROFILI = STANDALONE_SERVICES.find(s => s.slug === 'profili-social-gbp')!

const comparisonRows = [
  ['Prezzo mensile, IVA esclusa', PACCHETTI[0].prezzo, PACCHETTI[1].prezzo, BLOG_SERVICE.displayPrice, PREZZI.web.replace('a partire da ', 'da '), PREZZI.b2b],
  ['Canali social a scelta', '2', '2', '—', '—', '—'],
  ['Contenuti social mensili', '16', '24', '—', '—', '—'],
  ['Reel, Story o Short', '4', '6', '—', '—', '—'],
  ['Articoli SEO + GEO', '—', '1/mese', '12/mese', 'SEO tecnica', '—'],
  // Le campagne a pagamento sono uscite dai piani: restano nelle
  // configurazioni personalizzate, con budget separato dal canone.
  ['Campagna promozionale organica', '1/mese', '1/mese', '—', '—', '—'],
  ['Campagne a pagamento (ADS)', 'Su richiesta', 'Su richiesta', '—', 'Tracking', '—'],
  ['Pubblicazione blog', '—', '1 articolo', 'Inclusa o export CMS', 'Integrazione', '—'],
  ['Sito web base', '—', '—', '—', 'A partire da 19,90 €/mese', '—'],
  ['Aziende B2B analizzate', '—', '—', '—', '—', 'Fino a 30'],
  ['Fonti e priorità', '—', '—', '—', '—', 'Incluse'],
  ['Proprietà dopo 12 mesi', '—', '—', '—', 'Sì', '—'],
]

export default function PacchettiPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', url: `${SITE_URL}/pacchetti`, name: title, description, inLanguage: 'it-IT' },
      {
        '@type': 'OfferCatalog',
        name: 'Pacchetti Social Web Automation',
        itemListElement: [
          ...PACCHETTI.map(plan => ({
            '@type': 'Offer', name: plan.nome, price: plan.prezzo.replace(/[^0-9]/g, ''), priceCurrency: 'EUR',
            url: `${SITE_URL}/register?piano=${plan.slug}`, description: plan.sottotitolo,
          })),
          {
            '@type': 'Offer', name: BLOG_SERVICE.name, price: BLOG_SERVICE.price, priceCurrency: 'EUR',
            url: `${SITE_URL}${BLOG_SERVICE.path}`, description: `${BLOG_SERVICE.articlesPerMonth} articoli SEO e GEO al mese.`,
          },
          {
            '@type': 'Offer', name: 'Sito Web Base', price: '19.90', priceCurrency: 'EUR',
            url: `${SITE_URL}/servizi/siti-e-commerce`, description: 'Landing page o sito web base mobile-first. E-commerce e funzioni avanzate su preventivo.',
          },
          {
            '@type': 'Offer', name: 'Pilot Ricerca Clienti B2B', price: '149', priceCurrency: 'EUR',
            url: `${SITE_URL}/servizi/ricerca-clienti-b2b`, description: 'Profilo ideale, ricerca fino a 30 aziende, fonti verificabili e lista prioritaria.',
          },
        ],
      },
      { '@type': 'FAQPage', mainEntity: faq.map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: 'Pacchetti', item: `${SITE_URL}/pacchetti` }] },
    ],
  }

  return (
    <main id="main-content" className={base.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <a className={base.skipLink} href="#main-content">Vai al contenuto</a>
      <PublicHeader ctaHref={wa} ctaLabel="Scegli il piano" />

      <section className={base.hero}>
        <nav className={base.breadcrumbs}><Link href="/">Home</Link><span>/</span><span>Pacchetti</span></nav>
        <p className={base.eyebrow}>Soluzioni e prezzi trasparenti</p>
        <h1>Cinque soluzioni chiare. Una configurazione su misura quando serve.</h1>
        <p className={base.lead}>Presenza e Crescita gestiscono i social. Blog costruisce copertura organica, Web realizza il punto di conversione e il Pilot B2B qualifica nuove aziende in target.</p>
        <div className={base.heroActions}>
          <a href="#confronto" className={base.primary}>Confronta le soluzioni <ArrowRight size={17} aria-hidden="true" /></a>
          <a href={wa} target="_blank" rel="noopener noreferrer" className={base.secondary}>Aiutami a scegliere</a>
        </div>
      </section>

      <section id="confronto" className={styles.pricing}>
        <div className={base.sectionHeading}>
          <p className={base.eyebrow}>Social, contenuti, Web o opportunità B2B</p>
          <h2>Scegli in base al risultato, non al numero di funzioni.</h2>
          <p>Blog, Web e Pilot B2B possono essere attivati da soli oppure affiancati a Presenza e Crescita.</p>
        </div>

        <div className={styles.grid}>
          {PACCHETTI.map(plan => (
            <article key={plan.slug} className={`${styles.card} ${plan.consigliato ? styles.featured : ''}`}>
              <div className={styles.top}><div><span className={styles.audience}>{plan.eyebrow}</span><h2>{plan.nome}</h2></div>{plan.consigliato && <span className={styles.badge}>Più scelto</span>}</div>
              <p className={styles.result}>{plan.risultato}</p>
              <p className={styles.price}><strong>{plan.prezzo}</strong><span>/mese</span></p>
              <p className={styles.setup}>{plan.setup}</p>
              <p className={styles.description}>{plan.sottotitolo}</p>
              <div className={styles.fit}><strong>È adatto a te se</strong><p>{plan.idealePer}</p></div>
              {plan.includeDa && <p className={styles.includes}>Include tutto di {plan.includeDa}, piu:</p>}
              <p className={styles.listLabel}>Nel canone trovi</p>
              <ul>{plan.features.map(feature => <li key={feature}><CircleCheck size={15} aria-hidden="true" />{feature}</li>)}</ul>
              <Link href={`/register?piano=${plan.slug}`}>{plan.cta}<ArrowRight size={16} aria-hidden="true" /></Link>
              <p className={styles.note}>Setup incluso · IVA esclusa · rinnovo mensile</p>
            </article>
          ))}

          <article className={`${styles.card} ${styles.blogCard}`}>
            <div className={styles.top}><div><span className={styles.audience}>Aziende che vogliono traffico organico</span><h2>{BLOG_SERVICE.name}</h2></div><span className={styles.badge}>{BLOG_SERVICE.trialDays} giorni</span></div>
            <p className={styles.result}>{BLOG_SERVICE.articlesPerMonth} articoli al mese, pianificati e controllati.</p>
            <p className={styles.price}><strong>{BLOG_SERVICE.displayPrice}</strong><span>/mese</span></p>
            <p className={styles.setup}>Servizio autonomo, combinabile con i piani social</p>
            <p className={styles.description}>Piano editoriale SEO + GEO con pubblicazione sul blog collegato o consegna pronta per CMS.</p>
            <div className={styles.fit}><strong>È adatto a te se</strong><p>Vuoi rispondere alle ricerche dei clienti con continuità, senza gestire internamente il calendario editoriale.</p></div>
            <p className={styles.listLabel}>Nel canone trovi</p>
            <ul>{BLOG_SERVICE.features.map(feature => <li key={feature}><CircleCheck size={15} aria-hidden="true" />{feature}</li>)}</ul>
            <Link href="/acquista?servizio=blog-seo"><Newspaper size={16} aria-hidden="true" /> Attiva Blog <ArrowRight size={16} aria-hidden="true" /></Link>
            <p className={styles.note}>IVA esclusa · rinnovo mensile</p>
          </article>

          <article className={`${styles.card} ${styles.webCard}`}>
            <div className={styles.top}><div><span className={styles.audience}>Professionisti, PMI e negozi</span><h2>Sito Web Base</h2></div><span className={styles.badge}>Sito tuo</span></div>
            <p className={styles.result}>Una landing o un sito credibile che trasforma visite in contatti.</p>
            <p className={styles.price}><span className={styles.priceLabel}>a partire da</span><strong>{WEB_BASE.displayPrice}</strong><span>/mese</span></p>
            <p className={styles.setup}>Dopo 12 mesi di canone, il sito è tuo</p>
            <p className={styles.description}>Il canone {PREZZI.web} riguarda una landing page semplice. Siti più articolati, e-commerce e funzioni avanzate vengono quotati prima dell’avvio.</p>
            <div className={styles.fit}><strong>È adatto a te se</strong><p>Ti serve una landing o un sito aziendale collegato a campagne, contenuti e analytics.</p></div>
            <p className={styles.listLabel}>Nel progetto trovi</p>
            <ul>{['Architettura, UX e design responsive', 'Landing page o sito web base', 'SEO tecnica, sitemap e dati strutturati', 'Moduli, analytics e integrazioni essenziali', 'Collegamento a social e campagne', 'E-commerce su preventivo separato'].map(feature => <li key={feature}><CircleCheck size={15} aria-hidden="true" />{feature}</li>)}</ul>
            <Link href="/acquista?servizio=web-commerce"><Globe2 size={16} aria-hidden="true" /> Attiva Sito Web <ArrowRight size={16} aria-hidden="true" /></Link>
            <p className={styles.note}>IVA esclusa · hosting compreso · dominio e caselle di posta a carico tuo · e-commerce separato</p>
          </article>

          {/* Sopra il sito base e sotto il progetto su misura: 19,90 e' la
              landing, e senza un gradino intermedio la scala si leggeva come
              un'offerta sola, troppo bassa per un'azienda strutturata. */}
          <article className={`${styles.card} ${styles.impresaCard}`}>
            <div className={styles.top}><div><span className={styles.audience}>Aziende con più servizi da spiegare</span><h2>{SITO_IMPRESA.name}</h2></div><span className={styles.badge}>Su misura</span></div>
            <p className={styles.result}>Un sito costruito sugli intenti di ricerca del tuo settore.</p>
            <p className={styles.price}><span className={styles.priceLabel}>{SITO_IMPRESA.pricePrefix}</span><strong>{SITO_IMPRESA.displayPrice}</strong><span>/mese</span></p>
            <p className={styles.setup}>Dopo 12 mesi di canone, il sito è tuo</p>
            <p className={styles.description}>{SITO_IMPRESA.description}</p>
            <div className={styles.fit}><strong>È adatto a te se</strong><p>Hai più servizi o più sedi da spiegare, e una landing sola non basta a far arrivare la richiesta giusta.</p></div>
            <p className={styles.listLabel}>Nel canone trovi</p>
            <ul>{SITO_IMPRESA.features.map(feature => <li key={feature}><CircleCheck size={15} aria-hidden="true" />{feature}</li>)}</ul>
            <Link href="/acquista?servizio=web-impresa"><Globe2 size={16} aria-hidden="true" /> Attiva Sito impresa <ArrowRight size={16} aria-hidden="true" /></Link>
            <p className={styles.note}>IVA esclusa · canone definitivo scritto nella proposta</p>
          </article>

          {/* Il passo zero: chi non ha profili né scheda Google non ha niente da
              gestire, e finora la pagina partiva dal secondo passo. */}
          <article className={`${styles.card} ${styles.profiliCard}`}>
            <div className={styles.top}><div><span className={styles.audience}>Chi parte da zero o ha profili abbandonati</span><h2>Profili social e Google</h2></div><span className={styles.badge}>Una tantum</span></div>
            <p className={styles.result}>Trovabile su Google e sui social prima ancora di pubblicare.</p>
            <p className={styles.price}><strong>{PROFILI.displayPrice}</strong><span>{PROFILI.cadenceLabel}</span></p>
            <p className={styles.setup}>Accessi intestati a te, consegnati a fine lavoro</p>
            <p className={styles.description}>{PROFILI.description}</p>
            <div className={styles.fit}><strong>È adatto a te se</strong><p>Non hai profili, oppure ne hai di vecchi con nome, orari e contatti diversi da quelli veri.</p></div>
            <p className={styles.listLabel}>Nel lavoro trovi</p>
            <ul>{PROFILI.features.map(feature => <li key={feature}><CircleCheck size={15} aria-hidden="true" />{feature}</li>)}</ul>
            <Link href="/acquista?servizio=profili-social-gbp"><MapPin size={16} aria-hidden="true" /> Apri i profili <ArrowRight size={16} aria-hidden="true" /></Link>
            <p className={styles.note}>IVA esclusa · i tempi di verifica della scheda Google dipendono da Google</p>
          </article>


          {/* Il telefono e l'agenda.
              Sono i passi 3 e 4 del percorso descritto in home, hanno un prezzo
              pubblico e non comparivano qui: la pagina dei pacchetti ne mostrava
              cinque su sette, e chi arrivava dal percorso non li ritrovava. I
              dati vengono dal listino, non riscritti. */}
          <article className={`${styles.card} ${styles.voceCard}`}>
            <div className={styles.top}><div><span className={styles.audience}>Chi lavora su appuntamento</span><h2>Segretaria telefonica AI</h2></div><span className={styles.badge}>Passo 3</span></div>
            <p className={styles.result}>Una voce che risponde mentre hai le mani occupate.</p>
            <p className={styles.price}><span className={styles.priceLabel}>a partire da</span><strong>{`€${VOCE.canone}`}</strong><span>/mese</span></p>
            <p className={styles.setup}>{VOCE.avvio} · {VOCE.soglia}</p>
            <p className={styles.description}>Dice servizi, prezzi e orari che hai approvato tu, legge il calendario e fissa l’appuntamento. Se la richiesta esce dalle regole, prende i dati e la passa a te.</p>
            <div className={styles.fit}><strong>È adatto a te se</strong><p>Perdi chiamate mentre lavori, la sera o nel giorno di chiusura, e ogni chiamata persa è un appuntamento andato altrove.</p></div>
            <p className={styles.listLabel}>Nel canone trovi</p>
            <ul>{VOCE.voci.slice(0, 6).map(v => <li key={v}><CircleCheck size={15} aria-hidden="true" />{v}</li>)}</ul>
            <Link href="/servizi/segretaria-telefonica-ai"><PhoneCall size={16} aria-hidden="true" /> Come risponde al telefono <ArrowRight size={16} aria-hidden="true" /></Link>
            <p className={styles.note}>IVA esclusa · numero e traffico dell’operatore non inclusi</p>
          </article>

          <article className={`${styles.card} ${styles.agendaCard}`}>
            <div className={styles.top}><div><span className={styles.audience}>Chi ha già un archivio clienti</span><h2>Agenda, clienti e WhatsApp</h2></div><span className={styles.badge}>Passo 4</span></div>
            <p className={styles.result}>Chi non torna da mesi rientra fra le priorità del giorno.</p>
            <p className={styles.price}><span className={styles.priceLabel}>a partire da</span><strong>€390</strong><span>/mese</span></p>
            <p className={styles.setup}>{AGENDA.avvio} · {AGENDA.soglia}</p>
            <p className={styles.description}>Ogni giorno il sistema legge agenda e storico, trova chi manca da troppo tempo e prepara il messaggio. Resta in bozza: parte solo dopo il tuo sì.</p>
            <div className={styles.fit}><strong>È adatto a te se</strong><p>Hai clienti che smettono di tornare senza dirlo, e spazi liberi in settimana che nessuno ha il tempo di riempire.</p></div>
            <p className={styles.listLabel}>Nel canone trovi</p>
            <ul>{AGENDA.voci.slice(0, 6).map(v => <li key={v}><CircleCheck size={15} aria-hidden="true" />{v}</li>)}</ul>
            <Link href="/servizi/agenda-clienti-whatsapp"><CalendarClock size={16} aria-hidden="true" /> Come funziona l’agenda <ArrowRight size={16} aria-hidden="true" /></Link>
            <p className={styles.note}>IVA esclusa · nessun invio senza la tua approvazione</p>
          </article>


          {/* Riprese video: quattro pacchetti a lotto. Era l'unico servizio del
              listino senza un numero, e il costo per video e' invece noto. */}
          <article className={`${styles.card} ${styles.videoCard}`}>
            <div className={styles.top}><div><span className={styles.audience}>Chi vuole materiale girato, non foto d’archivio</span><h2>Riprese video in azienda</h2></div><span className={styles.badge}>Canone</span></div>
            <p className={styles.result}>Una sessione al mese produce cinque video: il materiale di tutte le settimane.</p>
            <p className={styles.price}><span className={styles.priceLabel}>a partire da</span><strong>€{VIDEO_PACCHETTI[0].prezzo}</strong><span>/mese</span></p>
            <p className={styles.setup}>{VIDEO_PACCHETTI[0].video} video al mese in {VIDEO_PACCHETTI[0].sessioni} sessione di ripresa</p>
            <p className={styles.description}>Veniamo a girare dove lavori, con fotografo, luci e ottiche. Quattro canoni mensili, da 5 a 20 video al mese. {VIDEO_CONSEGNA}</p>
            <div className={styles.fit}><strong>È adatto a te se</strong><p>Pubblichi ogni settimana e non vuoi che si veda che le immagini sono comprate da un archivio.</p></div>
            <p className={styles.listLabel}>In ogni video trovi</p>
            <ul>{VIDEO_COMPRESO.slice(0, 6).map(v => <li key={v}><CircleCheck size={15} aria-hidden="true" />{v}</li>)}</ul>
            <div className={styles.videoScala}>
              {VIDEO_PACCHETTI.map(v => (
                <Link key={v.id} href={`/acquista?servizio=video-${v.id}`}>
                  <b>{v.nome}</b> {v.video} video/mese · {euroVideo(v)}
                </Link>
              ))}
            </div>
            <Link href="/servizi/video-produzione"><Clapperboard size={16} aria-hidden="true" /> Come si gira in azienda <ArrowRight size={16} aria-hidden="true" /></Link>
            <p className={styles.note}>IVA esclusa · rinnovo mensile · spostamento nell’area concordata compreso</p>
          </article>

          <article className={`${styles.card} ${styles.leadCard}`}>
            <div className={styles.top}><div><span className={styles.audience}>Imprese che cercano aziende in target</span><h2>Pilot Ricerca Clienti B2B</h2></div><span className={styles.badge}>Una tantum</span></div>
            <p className={styles.result}>Una lista verificata per decidere chi approfondire.</p>
            <p className={styles.price}><strong>€149</strong><span>una tantum</span></p>
            <p className={styles.setup}>Fino a 30 aziende analizzate</p>
            <p className={styles.description}>Ricerca e qualificazione con fonti pubbliche tracciabili. Nessun invio automatico e nessuna promessa di appuntamenti o vendite.</p>
            <div className={styles.fit}><strong>È adatto a te se</strong><p>Hai un’offerta B2B chiara e vuoi una base commerciale ordinata prima di investire tempo nel contatto.</p></div>
            <p className={styles.listLabel}>Nel Pilot trovi</p>
            <ul>{['Profilo cliente ideale e criteri di esclusione', 'Ricerca fino a 30 aziende coerenti', 'Fonti pubbliche consultabili', 'Priorità e motivazione per ogni azienda', 'Rimozione di duplicati e profili fuori target', 'Consegna strutturata per valutazione o CRM'].map(feature => <li key={feature}><CircleCheck size={15} aria-hidden="true" />{feature}</li>)}</ul>
            <Link href="/acquista?servizio=lead-pilot"><Target size={16} aria-hidden="true" /> Attiva il Pilot B2B <ArrowRight size={16} aria-hidden="true" /></Link>
            <p className={styles.note}>IVA esclusa · servizio una tantum</p>
          </article>
        </div>

        <div className={styles.comparison}>
          <table>
            <caption>Confronto rapido</caption>
            <thead><tr><th>Servizio</th><th>Presenza</th><th>Crescita</th><th>Blog SEO + GEO</th><th>Web &amp; Commerce</th><th>Pilot B2B</th></tr></thead>
            <tbody>{comparisonRows.map(row => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <td key={cell}>{cell}</td> : <td key={`${row[0]}-${index}`}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </section>

      {/* Dove stanno questi prezzi rispetto al mercato.
          Il sito dichiarava i propri numeri senza mai dire a che altezza
          cadono: il lettore non ha un metro. I valori di riferimento sono
          pubblici e citati, non nostri, ed e' l'unico dato sul mondo esterno
          che il sito porta. */}
      <section className={`${base.section}`} aria-labelledby="mercato-title">
        <div className={base.sectionHeading}>
          <p className={base.eyebrow}>Dove cadono questi prezzi</p>
          <h2 id="mercato-title">Quanto costa la stessa cosa altrove.</h2>
          <p>
            Numeri pubblici, non nostri. Servono a darti un metro: senza, un canone
            e&rsquo; solo una cifra.
          </p>
        </div>
        <div className={styles.mercato}>
          <table>
            <caption>Gestione social continuativa per una PMI italiana, canone mensile IVA esclusa</caption>
            <thead>
              <tr>
                <th scope="col">Chi</th>
                <th scope="col">Canone mensile</th>
                <th scope="col">Che cosa comprende di solito</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Freelance</th>
                <td>300 – 1.500 &euro;</td>
                <td>Una persona sola, di norma senza riprese ne&rsquo; sviluppo.</td>
              </tr>
              <tr>
                <th scope="row"><strong>Social Web Automation</strong></th>
                <td><strong>490 – 990 &euro;</strong></td>
                <td>Piano, produzione, approvazione e pubblicazione su 2 canali. Setup compreso.</td>
              </tr>
              <tr>
                <th scope="row">Agenzia, fascia d&rsquo;ingresso</th>
                <td>1.500 – 2.000 &euro;</td>
                <td>Struttura piu&rsquo; ampia, spesso con minimi di durata.</td>
              </tr>
              <tr>
                <th scope="row">Agenzia, fascia dove sta il 70% delle PMI</th>
                <td>2.000 – 5.000 &euro;</td>
                <td>Multicanale, con campagne a pagamento gestite a parte.</td>
              </tr>
            </tbody>
          </table>
          <p className={styles.mercatoNota}>
            Fasce rilevate a settembre 2026 da{' '}
            <a href="https://www.migliore-agenzia.com/it/blog/costo-gestione-social-media-agenzia-2026" target="_blank" rel="noopener noreferrer">migliore-agenzia.com</a>{' '}
            e{' '}
            <a href="https://alessandromazzadigital.com/quanto-costa-la-gestione-dei-social-media-guida-ai-prezzi-in-italia-2026/" target="_blank" rel="noopener noreferrer">alessandromazzadigital.com</a>.
            Il budget pubblicitario resta separato dal canone in tutte le fasce, compresa la nostra.
          </p>
        </div>
      </section>

      {/* Le due voci legali hanno un prezzo pubblico ma non sono servizi nostri:
          li eroga lo Studio Legale BCS. Stanno in una fascia a parte, perche'
          mescolarli alle schede farebbe credere che li facciamo noi. */}
      <section className={`${base.section}`} aria-labelledby="legale-title">
        <div className={base.sectionHeading}>
          <p className={base.eyebrow}>Erogato dal partner legale</p>
          <h2 id="legale-title">Le due voci che non facciamo noi.</h2>
          <p>
            Consulenza e formazione su AI Act e GDPR sono erogate dallo Studio Legale BCS,
            con l’Avv. Vincenzo Sapone, cassazionista. Hanno un prezzo pubblico come il
            resto, ma la responsabilità professionale è sua, non nostra.
          </p>
        </div>
        <div className={styles.legaleGrid}>
          <article>
            <span>Consulenza individuale</span>
            <h3>AI Act e GDPR, sul tuo caso</h3>
            <p><strong>{CONSULENZA_PREZZO}</strong> per {CONSULENZA_LEGALE.durataMinuti} minuti, IVA esclusa</p>
            <Link href="/consulenza">Prenota la consulenza <ArrowRight size={15} aria-hidden="true" /></Link>
          </article>
          <article>
            <span>{CORSO_AI_ACT.stato}</span>
            <h3>Video corsi AI Act per PMI</h3>
            <p><strong>{CORSO_PREZZO}</strong> {CORSO_AI_ACT.perChi}, IVA esclusa</p>
            <Link href="/consulenza#corso-ai-act">Prenota il posto <ArrowRight size={15} aria-hidden="true" /></Link>
          </article>
        </div>
      </section>

      <section className={styles.custom}>
        <div><span>Configurazione personalizzata</span><h2>Più brand, volumi elevati o integrazioni.</h2><p>Costruiamo un perimetro dedicato quando le cinque soluzioni standard non rappresentano il processo reale dell’azienda.</p></div>
        <a href={wa} target="_blank" rel="noopener noreferrer">Progettiamo la soluzione <ArrowRight size={17} aria-hidden="true" /></a>
      </section>
      <section className={`${base.section} ${base.faqLayout}`}><div className={base.sectionHeading}><p className={base.eyebrow}>FAQ pacchetti</p><h2>Costi e condizioni in chiaro.</h2></div><div className={base.faqList}>{faq.map(item => <details key={item.q}><summary>{item.q}<span>+</span></summary><p>{item.a}</p></details>)}</div></section>
      <section className={base.finalCta}><div><p className={base.eyebrow}>Prima di scegliere</p><h2>Valutiamo insieme canali e obiettivi.</h2><p>Ti indichiamo la soluzione sostenibile o il perimetro personalizzato necessario.</p></div><a href={wa} target="_blank" rel="noopener noreferrer">Richiedi una valutazione <ArrowRight size={17} aria-hidden="true" /></a></section>
      <PublicFooter />
      <FloatingNavigation />
    </main>
  )
}
