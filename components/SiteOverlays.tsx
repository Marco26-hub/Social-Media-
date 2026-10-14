'use client'

import { usePathname } from 'next/navigation'
import { siteOverlaysEnabled } from '@/lib/download-path'
import CookieBanner from './CookieBanner'
import Odino from './Odino'

// Il layout è un server component e non conosce il percorso: per tenere banner e Odino
// fuori da /download/* serve un client component che lo legga con usePathname().
// Su quelle pagine Odino non viene montato affatto, quindi non carica nemmeno le sue immagini.
export default function SiteOverlays() {
  const pathname = usePathname()
  if (!siteOverlaysEnabled(pathname)) return null

  return (
    <>
      <Odino />
      <CookieBanner />
    </>
  )
}
