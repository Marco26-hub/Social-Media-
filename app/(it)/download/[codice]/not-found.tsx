import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import { buildWhatsAppUrl } from '@/lib/download-area'
import { instagramUrl } from '@/lib/social-links'
import pageStyles from '@/styles/content-page.module.css'

// Messaggio generico di proposito: chi arriva qui non ha chiesto niente di
// specifico, e il testo non deve lasciare intuire cosa stesse cercando.
const WHATSAPP_URL = buildWhatsAppUrl('Ciao! Vorrei conoscere meglio Social Web Automation e valutare un progetto.')

// 404 pubblica del segmento /download: la stessa risposta per un indirizzo
// sbagliato, vecchio o inventato, senza dire cosa ci sarebbe stato. Per questo
// occhiello, titolo e pulsanti sono generici. Il resto del sito ha la sua 404.
export default function DownloadNotFound() {
  return (
    <main id="main-content" className={pageStyles.page}>
      <a className={pageStyles.skipLink} href="#main-content">Vai al contenuto</a>

      <PublicHeader ctaHref={WHATSAPP_URL} ctaLabel="Scrivici su WhatsApp" />

      <section className={pageStyles.hero} aria-labelledby="not-found-title">
        <p className={pageStyles.eyebrow}>Pagina non trovata</p>
        <h1 id="not-found-title">Questa pagina non esiste o non è più disponibile.</h1>
        <div className={pageStyles.heroActions}>
          <Link className={pageStyles.primary} href="/">
            Vai alla home <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <a className={pageStyles.secondary} href={instagramUrl()} target="_blank" rel="noopener noreferrer">
            Seguici su Instagram
          </a>
          <a className={pageStyles.secondary} href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            Scrivici su WhatsApp
          </a>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}
