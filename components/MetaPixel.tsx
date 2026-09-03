'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const CONSENT_COOKIE = 'cookie_consent'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

function readConsent(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)cookie_consent=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

function MetaPixelTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const sync = () => setEnabled(readConsent() === 'marketing')
    sync()
    window.addEventListener('swa-cookie-consent', sync)
    return () => window.removeEventListener('swa-cookie-consent', sync)
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

export { CONSENT_COOKIE }
