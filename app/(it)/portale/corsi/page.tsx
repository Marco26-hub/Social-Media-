import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CalendarDays, GraduationCap, MonitorPlay, Radio } from 'lucide-react'
import { getSession } from '@/lib/auth-utils'
import { listCorsiUtente } from '@/lib/corsi-db'
import styles from '../portale.module.css'
import corsi from './corsi-portale.module.css'

// I corsi acquistati. Server component: l'elenco viene da un acquisto pagato,
// non da qualcosa che il browser possa chiedere per conto di qualcun altro.
export const dynamic = 'force-dynamic'

function dataItaliana(iso: string): string {
  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))
}

export default async function PortaleCorsiPage() {
  const session = await getSession()
  const userId = session?.user?.id ? String(session.user.id) : null
  if (!userId) redirect(`/login?callbackUrl=${encodeURIComponent('/portale/corsi')}`)

  const elenco = await listCorsiUtente(userId)

  return (
    <div>
      <h1 className={`${styles.display} ${styles.hello}`}>I tuoi corsi</h1>
      <p className={styles.helloSub}>
        Restano qui senza scadenza. Il punto in cui sei arrivato viene salvato.
      </p>

      {elenco.length === 0 ? (
        <div className={corsi.vuoto}>
          <GraduationCap size={26} aria-hidden="true" />
          <p><b>Non hai ancora nessun corso.</b></p>
          <p>Il catalogo è nella pagina pubblica, con il programma completo di ognuno.</p>
          <Link className={corsi.azione} href="/corsi">Vedi i corsi</Link>
        </div>
      ) : (
        <ul className={corsi.griglia}>
          {elenco.map(corso => {
            const percentuale = corso.lezioni_totali > 0
              ? Math.round((corso.lezioni_completate / corso.lezioni_totali) * 100)
              : 0
            return (
              <li key={corso.id}>
                <Link href={`/portale/corsi/${corso.slug}`} className={corsi.scheda}>
                  <span className={corsi.tipo}>
                    {corso.modalita === 'live'
                      ? <><Radio size={14} aria-hidden="true" /> In diretta</>
                      : <><MonitorPlay size={14} aria-hidden="true" /> Videocorso</>}
                  </span>
                  <h2 className={styles.display}>{corso.titolo}</h2>
                  {corso.sottotitolo && <p className={corsi.sottotitolo}>{corso.sottotitolo}</p>}

                  {corso.in_prevendita && corso.disponibile_dal ? (
                    <p className={corsi.attesa}>
                      <CalendarDays size={14} aria-hidden="true" />
                      Disponibile dal {dataItaliana(corso.disponibile_dal)}
                    </p>
                  ) : corso.lezioni_totali === 0 ? (
                    <p className={corsi.attesa}>
                      <CalendarDays size={14} aria-hidden="true" />
                      I materiali stanno arrivando
                    </p>
                  ) : (
                    <>
                      <div className={corsi.barra}>
                        <span className={corsi.barraPiena} style={{ width: `${percentuale}%` }} />
                      </div>
                      <p className={corsi.avanzamento}>
                        {corso.lezioni_completate} di {corso.lezioni_totali} lezioni · {percentuale}%
                      </p>
                    </>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
