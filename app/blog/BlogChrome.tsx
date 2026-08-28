import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'

const WHATSAPP_URL = `https://wa.me/393477196603?text=${encodeURIComponent('Ciao! Vorrei capire quale servizio Social Web Automation è adatto alla mia azienda.')}`

export function BlogHeader() {
  return <PublicHeader ctaHref={WHATSAPP_URL} ctaLabel="Parliamo del progetto" />
}

export function BlogFooter() {
  return <PublicFooter />
}
