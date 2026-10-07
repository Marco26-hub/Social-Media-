import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import './ecosystem.css'

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return <><PublicHeader ctaHref="https://wa.me/393477196603" ctaLabel="Parliamone" /><div className="swa-marketplace-scope">{children}</div><PublicFooter /></>
}
