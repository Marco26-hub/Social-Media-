import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import ItalianRootLayout from '../(it)/layout'
import '../marketplace/ecosystem.css'

// Anche /corsi deve avere html lang, tema, stili e metadati della radice IT.
export { metadata, viewport } from '../(it)/layout'

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <ItalianRootLayout><PublicHeader ctaHref="https://wa.me/393477196603" ctaLabel="Parliamone" /><div className="swa-marketplace-scope">{children}</div><PublicFooter /></ItalianRootLayout>
}
