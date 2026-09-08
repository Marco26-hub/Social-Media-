'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { EVENTO_CONSENSO, marketingConcesso } from '@/lib/cookie-consent'

// Il pixel nel browser e' una scelta a parte dalla misurazione lato server, e
// va acceso apposta. Senza questo flag bastava valorizzare l'id del pixel per
// ritrovarsi uno script di Facebook nelle pagine — che oggi la CSP blocca,
// quindi fallirebbe in silenzio a ogni caricamento senza che nessuno se ne
// accorga. La Conversions API funziona senza niente di tutto questo.
const BROWSER_ATTIVO = process.env.NEXT_PUBLIC_META_PIXEL_BROWSER === 'true'
const PIXEL_ID = BROWSER_ATTIVO ? process.env.NEXT_PUBLIC_META_PIXEL_ID : undefined

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

function MetaPixelTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const sync = () => setEnabled(marketingConcesso(document.cookie))
    sync()
    window.addEventListener(EVENTO_CONSENSO, sync)
    return () => window.removeEventListener(EVENTO_CONSENSO, sync)
  }, [])

  useEffect(() => {
    if (!enabled || !PIXEL_ID) return

    if (!window.fbq) {
      const fbq = function (...args: unknown[]) {
        if (fbq.callMethod) {
          fbq.callMethod(...args)
        } else {
          fbq.queue.push(args)
        }
      } as ((...args: unknown[]) => void) & {
        callMethod?: (...args: unknown[]) => void
        queue: unknown[][]
        loaded: boolean
        version: string
        push: typeof Array.prototype.push
      }
      fbq.push = Array.prototype.push
      fbq.loaded = true
      fbq.version = '2.0'
      fbq.queue = []
      window.fbq = fbq

      const script = document.createElement('script')
      script.async = true
      script.src = 'https://connect.facebook.net/en_US/fbevents.js'
      document.head.appendChild(script)
      window.fbq('init', PIXEL_ID)
    }

    window.fbq('track', 'PageView')
  }, [enabled, pathname, searchParams])

  if (!enabled || !PIXEL_ID) return null

  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        height="1"
        src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        style={{ display: 'none' }}
        width="1"
      />
    </noscript>
  )
}

export default function MetaPixel() {
  return (
    <Suspense fallback={null}>
      <MetaPixelTracker />
    </Suspense>
  )
}
