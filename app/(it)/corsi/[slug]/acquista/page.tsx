import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { BadgeCheck, LockKeyhole, MonitorPlay } from 'lucide-react'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import RegistratiEAcquista from '@/components/corsi/RegistratiEAcquista'
import { getSession } from '@/lib/auth-utils'
import { getCorsoPubblicoBySlug } from '@/lib/corsi-db'
import { euro } from '@/lib/euro'
import base from '@/styles/content-page.module.css'
import styles from '../../corsi.module.css'

// Acquisto per chi non ha ancora un account: si compila, si paga, e il pagamento
// attiva l'account. Chi e gia entrato non passa di qui: compra dalla pagina del
// corso, dove il modulo e piu corto.
export const dynamic = 'force-dynamic'

// Pagina di acquisto: fuori dall'indice. Il contenuto indicizzabile e la pagina
// del corso, questa e solo un passaggio del pagamento.
export const metadata: Metadata = { robots: { index: false, follow: true } }

function dataItaliana(iso: string): string {
  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))
}

const wa = `https://wa.me/393477196603?text=${encodeURIComponent('Ciao! Vorrei informazioni su un corso online di Social Web Automation.')}`

export default async function AcquistaCorsoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const corso = await getCorsoPubblicoBySlug(slug)
  if (!corso) notFound()

  // Gia entrato: il modulo qui chiederebbe di nuovo dati che abbiamo gia e
  // creerebbe un secondo account. Si compra dalla pagina del corso.
  const session = await getSession()
  if (session?.user?.id) redirect(`/corsi/${corso.slug}`)

  return (
    <main id="main-content" className={base.page}>
      <a className={base.skipLink} href="#main-content">Vai al contenuto</a>
      <PublicHeader ctaHref={wa} ctaLabel="Parla con noi" />

      <section className={base.hero}>
        <nav className={base.breadcrumbs}>
          <Link href="/">Home</Link><span>/</span>
          <Link href="/corsi">Corsi</Link><span>/</span>
          <Link href={`/corsi/${corso.slug}`}>{corso.titolo}</Link><span>/</span>
          <span>Acquisto</span>
        </nav>
        <p className={base.eyebrow}>{corso.in_prevendita ? 'Prevendita' : 'Acquisto'}</p>
        <h1>Crea il tuo accesso e completa l’acquisto</h1>
        <p className={base.lead}>
          Stai acquistando <strong>{corso.titolo}</strong> a {euro(corso.prezzo_cents / 100)} IVA esclusa.
          L’account serve a darti l’area riservata dove troverai le lezioni: viene
          attivato appena il pagamento è confermato, senza attese di approvazione.
        </p>
      </section>

      <section className={base.section}>
        <div className={styles.dueColonne}>
          <RegistratiEAcquista slug={corso.slug} titolo={corso.titolo} inPrevendita={corso.in_prevendita} />

          <aside className={styles.acquisto}>
            <p className={styles.prezzo}>
              {euro(corso.prezzo_cents / 100)}
              <small>IVA esclusa</small>
            </p>
            {corso.in_prevendita && corso.disponibile_dal && (
              <p className={styles.prevendita}>
                <strong>Prevendita.</strong> Le lezioni saranno nella tua area riservata
                dal {dataItaliana(corso.disponibile_dal)} e ti avvisiamo per email appena
                sono online.
              </p>
            )}
            <ul className={styles.inclusi}>
              <li>
                {corso.in_prevendita && corso.disponibile_dal
                  ? `Accesso dal ${dataItaliana(corso.disponibile_dal)}`
                  : 'Accesso immediato dopo il pagamento'}
              </li>
              <li>{corso.lezioni_totali} {corso.lezioni_totali === 1 ? 'lezione' : 'lezioni'} in programma</li>
              <li>Nessuna scadenza: le lezioni restano tue</li>
              <li>Fattura intestata alla tua azienda</li>
            </ul>
            <p className={styles.meta}><MonitorPlay size={15} aria-hidden="true" /> Si guarda da computer, tablet e telefono</p>
            <p className={styles.meta}><LockKeyhole size={15} aria-hidden="true" /> Pagamento gestito da Stripe</p>
            <p className={styles.meta}><BadgeCheck size={15} aria-hidden="true" /> Un solo accesso per corsi e servizi</p>
            <p className={styles.sottotitolo}>
              <Link href={`/corsi/${corso.slug}`}>Torna al programma del corso</Link>
            </p>
          </aside>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}
