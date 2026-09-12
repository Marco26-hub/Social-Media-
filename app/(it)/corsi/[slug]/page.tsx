import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays, Clock, FileText, Lock, MonitorPlay, PlayCircle, Users } from 'lucide-react'
import FloatingNavigation from '@/components/FloatingNavigation'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import AcquistaCorso from '@/components/corsi/AcquistaCorso'
import { anteprimaOg } from '@/lib/anteprima'
import { getSession } from '@/lib/auth-utils'
import { getCorsoPubblicoBySlug, haAccessoAlCorso } from '@/lib/corsi-db'
import { euro } from '@/lib/euro'
import { SITE_URL } from '@/lib/site-config'
import base from '@/styles/content-page.module.css'
import styles from '../corsi.module.css'

// Il prezzo e il programma possono cambiare dall'amministrazione: la pagina si
// rigenera a ogni richiesta invece di restare ferma a quando e stata costruita.
export const dynamic = 'force-dynamic'

function dataItaliana(iso: string): string {
  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))
}

/** Data e ora di un incontro live: «giovedì 8 ottobre, 18:00». */
function dataOraItaliana(iso: string): string {
  const data = new Date(iso)
  const giorno = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).format(data)
  const ora = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(data)
  return `${giorno}, ${ora}`
}

const wa = `https://wa.me/393477196603?text=${encodeURIComponent('Ciao! Vorrei informazioni su un corso online di Social Web Automation.')}`

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const corso = await getCorsoPubblicoBySlug(slug)
  if (!corso) return { title: 'Corso non trovato | SWA' }

  const title = corso.seo_title || `${corso.titolo} | Corso online SWA`
  const description = corso.seo_description || corso.sottotitolo || corso.descrizione.slice(0, 155)
  const url = `${SITE_URL}/corsi/${corso.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, images: anteprimaOg('/corsi'), type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: anteprimaOg('/corsi') },
  }
}

export default async function CorsoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const corso = await getCorsoPubblicoBySlug(slug)
  if (!corso) notFound()

  const session = await getSession()
  const userId = session?.user?.id ? String(session.user.id) : null
  const giaAcquistato = userId ? await haAccessoAlCorso(userId, corso.id) : false

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Course',
        name: corso.titolo,
        description: corso.sottotitolo || corso.descrizione.slice(0, 300),
        url: `${SITE_URL}/corsi/${corso.slug}`,
        inLanguage: 'it-IT',
        provider: { '@type': 'Organization', name: 'Social Web Automation', url: SITE_URL },
        offers: {
          '@type': 'Offer',
          price: (corso.prezzo_cents / 100).toFixed(2),
          priceCurrency: corso.currency.toUpperCase(),
          category: 'Paid',
          url: `${SITE_URL}/corsi/${corso.slug}`,
          availability: corso.in_prevendita ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock',
        },
        hasCourseInstance: corso.modalita === 'live' && corso.incontri.length > 0
          ? {
              '@type': 'CourseInstance',
              courseMode: 'online',
              courseSchedule: {
                '@type': 'Schedule',
                startDate: corso.incontri[0].inizio_il,
                endDate: corso.incontri[corso.incontri.length - 1].inizio_il,
                repeatCount: corso.incontri.length,
              },
              maximumAttendeeCapacity: corso.posti_totali ?? undefined,
            }
          : {
              '@type': 'CourseInstance',
              courseMode: 'online',
              courseWorkload: corso.durata_totale_min > 0 ? `PT${corso.durata_totale_min}M` : undefined,
            },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Corsi', item: `${SITE_URL}/corsi` },
          { '@type': 'ListItem', position: 3, name: corso.titolo, item: `${SITE_URL}/corsi/${corso.slug}` },
        ],
      },
    ],
  }

  return (
    <main id="main-content" className={base.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <a className={base.skipLink} href="#main-content">Vai al contenuto</a>
      <PublicHeader ctaHref={wa} ctaLabel="Parla con noi" />

      <section className={base.hero}>
        <nav className={base.breadcrumbs}>
          <Link href="/">Home</Link><span>/</span>
          <Link href="/corsi">Corsi</Link><span>/</span>
          <span>{corso.titolo}</span>
        </nav>
        <p className={base.eyebrow}>
          {corso.in_prevendita ? 'Prevendita · ' : ''}{corso.categoria || 'Corso online'} · livello {corso.livello}
        </p>
        <h1>{corso.titolo}</h1>
        {corso.sottotitolo && <p className={base.lead}>{corso.sottotitolo}</p>}
        <p className={styles.meta}>
          <MonitorPlay size={15} aria-hidden="true" />
          {corso.lezioni_totali} {corso.lezioni_totali === 1 ? 'lezione' : 'lezioni'}
          {corso.durata_totale_min > 0 && (
            <>
              <Clock size={15} aria-hidden="true" />
              {corso.durata_totale_min} minuti di video
            </>
          )}
        </p>
      </section>

      <section className={base.section}>
        <div className={styles.dueColonne}>
          <div>
            <div className={base.sectionHeading}>
              <h2>Che cosa impari</h2>
            </div>
            <p className={styles.descrizione}>{corso.descrizione}</p>

            {corso.modalita === 'live' && corso.incontri.length > 0 && (
              <>
                <div className={base.sectionHeading}>
                  <h2>Le date degli incontri</h2>
                  <p>
                    Sono le date che acquisti: gli incontri si tengono in diretta e non
                    vengono spostati. La registrazione di ogni incontro resta poi nella tua
                    area riservata.
                  </p>
                </div>
                <ol className={styles.incontri}>
                  {corso.incontri.map((incontro, indice) => (
                    <li key={incontro.id}>
                      <span className={styles.incontroNumero}>{indice + 1}</span>
                      <span className={styles.incontroCorpo}>
                        <strong>{incontro.titolo}</strong>
                        <small>
                          <CalendarDays size={14} aria-hidden="true" />
                          <time dateTime={incontro.inizio_il}>{dataOraItaliana(incontro.inizio_il)}</time>
                          {' · '}{Math.round(incontro.durata_min / 60 * 10) / 10} ore
                        </small>
                        {incontro.note && <small>{incontro.note}</small>}
                      </span>
                    </li>
                  ))}
                </ol>
              </>
            )}

            <div className={base.sectionHeading}>
              <h2>{corso.modalita === 'live' ? 'Materiali e registrazioni' : 'Programma'}</h2>
              <p>
                {corso.modalita === 'live'
                  ? 'Quello che resta nella tua area riservata dopo gli incontri.'
                  : 'Le lezioni segnate come anteprima si guardano subito, senza acquistare.'}
              </p>
            </div>

            {corso.moduli.length === 0 ? (
              <p className={styles.vuoto}>Il programma di questo corso sarà pubblicato a breve.</p>
            ) : (
              <ol className={styles.moduli}>
                {corso.moduli.map((modulo, indice) => (
                  <li key={modulo.id}>
                    <h3>Modulo {indice + 1} · {modulo.titolo}</h3>
                    <ul className={styles.lezioni}>
                      {modulo.lezioni.map(lezione => {
                        const aperta = lezione.anteprima_gratuita || giaAcquistato
                        return (
                          <li key={lezione.id} className={aperta ? styles.lezioneAperta : undefined}>
                            {aperta
                              ? (lezione.tipo === 'video'
                                  ? <PlayCircle size={16} aria-hidden="true" />
                                  : <FileText size={16} aria-hidden="true" />)
                              : <Lock size={16} aria-hidden="true" />}
                            <span>{lezione.titolo}</span>
                            {lezione.anteprima_gratuita && !giaAcquistato && (
                              <em className={styles.anteprima}>anteprima</em>
                            )}
                            {lezione.durata_min ? <small>{lezione.durata_min} min</small> : null}
                          </li>
                        )
                      })}
                      {modulo.lezioni.length === 0 && (
                        <li className={styles.lezioneVuota}><span>Lezioni in preparazione</span></li>
                      )}
                    </ul>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <aside className={styles.acquisto}>
            <p className={styles.prezzo}>
              {euro(corso.prezzo_cents / 100)}
              <small>IVA esclusa</small>
            </p>
            {corso.modalita === 'live' && (
              <p className={styles.meta}>
                <Users size={15} aria-hidden="true" />
                {corso.posti_liberi === null
                  ? 'Incontri in diretta'
                  : corso.posti_liberi > 0
                    ? `${corso.posti_liberi} ${corso.posti_liberi === 1 ? 'posto disponibile' : 'posti disponibili'} su ${corso.posti_totali}`
                    : 'Posti esauriti per questa edizione'}
              </p>
            )}
            {corso.in_prevendita && corso.disponibile_dal && (
              <p className={styles.prevendita}>
                <strong>Prevendita.</strong> Le lezioni saranno disponibili nella tua area
                riservata dal {dataItaliana(corso.disponibile_dal)}. Compri ora al prezzo di
                prevendita e ti avvisiamo per email appena sono online.
              </p>
            )}

            {giaAcquistato ? (
              <>
                <p className={styles.possesso}>
                  {corso.in_prevendita && corso.disponibile_dal
                    ? `Hai già prenotato questo corso. Le lezioni arrivano il ${dataItaliana(corso.disponibile_dal)}.`
                    : 'Hai già questo corso.'}
                </p>
                <Link href={`/portale/corsi/${corso.slug}`} className={base.primary}>
                  {corso.in_prevendita ? 'Vedi nella tua area' : 'Vai alle lezioni'}
                </Link>
              </>
            ) : (
              <AcquistaCorso
                slug={corso.slug}
                titolo={corso.titolo}
                autenticato={Boolean(userId)}
                inPrevendita={corso.in_prevendita}
                esaurito={corso.posti_liberi !== null && corso.posti_liberi <= 0}
              />
            )}

            <ul className={styles.inclusi}>
              {corso.modalita === 'live' ? (
                <>
                  <li>
                    {corso.incontri.length > 0
                      ? `${corso.incontri.length} incontri in diretta, il primo il ${dataItaliana(corso.incontri[0].inizio_il)}`
                      : 'Incontri in diretta con il docente'}
                  </li>
                  <li>Gruppo a numero chiuso: si fanno domande davvero</li>
                  <li>Le registrazioni restano nella tua area riservata</li>
                  <li>Fattura intestata alla tua azienda</li>
                </>
              ) : (
                <>
                  <li>
                    {corso.in_prevendita && corso.disponibile_dal
                      ? `Accesso dal ${dataItaliana(corso.disponibile_dal)}`
                      : 'Accesso immediato dopo il pagamento'}
                  </li>
                  <li>Nessuna scadenza: le lezioni restano tue</li>
                  <li>Si guarda da computer, tablet e telefono</li>
                  <li>Fattura intestata alla tua azienda</li>
                </>
              )}
            </ul>
          </aside>
        </div>
      </section>

      <FloatingNavigation />
      <PublicFooter />
    </main>
  )
}
