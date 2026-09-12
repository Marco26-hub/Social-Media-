import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import EsitoAcquisto from '@/components/corsi/EsitoAcquisto'
import { getCorsoPubblicoBySlug } from '@/lib/corsi-db'
import base from '@/styles/content-page.module.css'

export const dynamic = 'force-dynamic'

// Pagina di ritorno dal pagamento: non deve finire nell'indice.
export const metadata: Metadata = { robots: { index: false, follow: false } }

const wa = `https://wa.me/393477196603?text=${encodeURIComponent('Ciao! Ho appena acquistato un corso online.')}`

export default async function GrazieCorsoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const corso = await getCorsoPubblicoBySlug(slug)
  if (!corso) notFound()

  return (
    <main id="main-content" className={base.page}>
      <a className={base.skipLink} href="#main-content">Vai al contenuto</a>
      <PublicHeader ctaHref={wa} ctaLabel="Parla con noi" />

      <section className={base.hero}>
        <nav className={base.breadcrumbs}>
          <Link href="/">Home</Link><span>/</span>
          <Link href="/corsi">Corsi</Link><span>/</span>
          <span>Grazie</span>
        </nav>
        <p className={base.eyebrow}>Acquisto</p>
        <h1>Grazie.</h1>
        <p className={base.lead}>{corso.titolo}</p>
      </section>

      <section className={base.section}>
        <Suspense fallback={<p>Caricamento…</p>}>
          <EsitoAcquisto slug={corso.slug} titolo={corso.titolo} />
        </Suspense>
      </section>

      <PublicFooter />
    </main>
  )
}
