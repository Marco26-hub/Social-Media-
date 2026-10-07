import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import '../marketplace/ecosystem.css'

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <><PublicHeader ctaHref="https://wa.me/393477196603" ctaLabel="Parliamone" /><div className="swa-marketplace-scope">{children}</div><PublicFooter /></>
}
