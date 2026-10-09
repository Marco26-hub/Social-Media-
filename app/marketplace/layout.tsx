import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import type { Metadata } from 'next'
import ItalianRootLayout, { metadata as italianMetadata } from '../(it)/layout'
import './ecosystem.css'

export { viewport } from '../(it)/layout'
export const metadata: Metadata = { ...italianMetadata, robots: { index: false, follow: false } }

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return <ItalianRootLayout><PublicHeader ctaHref="https://wa.me/393477196603" ctaLabel="Parliamone" /><div className="swa-marketplace-scope">{children}</div><PublicFooter /></ItalianRootLayout>
}
