import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, CalendarDays, Video } from 'lucide-react'
import ConsensoConsegna from '@/components/portale/ConsensoConsegna'
import CorsoStudente from '@/components/portale/CorsoStudente'
import { getSession } from '@/lib/auth-utils'
import { getCorsoPerStudente, getSpettatore } from '@/lib/corsi-db'
import styles from '../../portale.module.css'
import corsi from '../corsi-portale.module.css'

// Lettore del corso acquistato. getCorsoPerStudente torna null se il corso non
// e stato pagato: il controllo di accesso sta li, in SQL, non in questa pagina.
export const dynamic = 'force-dynamic'

function dataOraItaliana(iso: string): string {
  const data = new Date(iso)
  const giorno = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).format(data)
  const ora = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(data)
  return `${giorno}, ${ora}`
}

function dataItaliana(iso: string): string {
  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))
}

export default async function CorsoStudentePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await getSession()
  const userId = session?.user?.id ? String(session.user.id) : null
  if (!userId) redirect(`/login?callbackUrl=${encodeURIComponent(`/portale/corsi/${slug}`)}`)

  const corso = await getCorsoPerStudente(userId, slug)
  // Non comprato e non esistente danno la stessa risposta: chi prova indirizzi a
  // caso non deve capire quali corsi esistono.
  if (!corso) notFound()

  const spettatore = await getSpettatore(userId)
  const haLezioni = corso.moduli.some(m => m.lezioni.length > 0)
  const prossimo = corso.incontri.find(i => new Date(i.inizio_il) > new Date())

  return (
    <div>
      <Link href="/portale/corsi" className={corsi.torna}>
        <ArrowLeft size={15} aria-hidden="true" /> I tuoi corsi
      </Link>

      <h1 className={`${styles.display} ${styles.hello}`}>{corso.titolo}</h1>
      {corso.sottotitolo && <p className={styles.helloSub}>{corso.sottotitolo}</p>}

      {corso.consenso_richiesto ? (
        <ConsensoConsegna slug={corso.slug} titolo={corso.titolo} live={corso.modalita === 'live'} />
      ) : (
        <>
      {corso.modalita === 'live' && (
        <section style={{ display: 'grid', gap: 14, marginTop: 26 }}>
          {corso.link_accesso ? (
            <>
              <a className={corsi.stanza} href={corso.link_accesso} target="_blank" rel="noreferrer noopener">
                <Video size={17} aria-hidden="true" /> Entra nella stanza
              </a>
              <p className={corsi.avanzamento}>
                Il link è personale: vale per te e per gli incontri di questa edizione.
              </p>
            </>
          ) : (
            <p className={corsi.avviso}>
              Il link per entrare arriva qui e per email qualche giorno prima del primo
              incontro.
            </p>
          )}

          {prossimo && (
            <p className={corsi.avanzamento}>
              <CalendarDays size={14} aria-hidden="true" /> Prossimo incontro:{' '}
              <strong>{dataOraItaliana(prossimo.inizio_il)}</strong>
            </p>
          )}

          {corso.incontri.length > 0 && (
            <ul className={corsi.incontri}>
              {corso.incontri.map((incontro, indice) => (
                <li key={incontro.id} className={corsi.incontro}>
                  <strong>{indice + 1}. {incontro.titolo}</strong>
                  <small>
                    <time dateTime={incontro.inizio_il}>{dataOraItaliana(incontro.inizio_il)}</time>
                    {' · '}{incontro.durata_min} minuti
                    {incontro.registrazione_disponibile ? ' · registrazione disponibile' : ''}
                  </small>
                  {incontro.note && <small>{incontro.note}</small>}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {haLezioni && spettatore ? (
        <CorsoStudente moduli={corso.moduli} spettatore={spettatore} />
      ) : (
        <p className={corsi.avviso} style={{ marginTop: 26 }}>
          {corso.in_prevendita && corso.disponibile_dal
            ? `Le lezioni saranno qui dal ${dataItaliana(corso.disponibile_dal)}. Ti avvisiamo per email appena sono online.`
            : corso.modalita === 'live'
              ? 'I materiali e le registrazioni degli incontri compariranno qui.'
              : 'Le lezioni di questo corso stanno arrivando. Ti avvisiamo per email appena sono online.'}
        </p>
      )}
        </>
      )}
    </div>
  )
}
