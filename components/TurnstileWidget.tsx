'use client'
import { useEffect, useRef } from 'react'

// Widget Cloudflare Turnstile. Si renderizza SOLO se NEXT_PUBLIC_TURNSTILE_SITE_KEY
// è configurata (baked al build): senza, non mostra nulla e il form funziona lo
// stesso (verifica server no-op). Carica lo script Cloudflare una sola volta.
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      reset: (id?: string) => void
    }
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

export default function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey || !ref.current) return

    function renderWidget() {
      if (!window.turnstile || !ref.current || widgetId.current) return
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        callback: (token: string) => onToken(token),
        'expired-callback': () => onToken(''),
        'error-callback': () => onToken(''),
        theme: 'light',
      })
    }

    if (window.turnstile) {
      renderWidget()
      return
    }
    // Carica lo script una volta.
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
    if (!script) {
      script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
    script.addEventListener('load', renderWidget)
    return () => { script?.removeEventListener('load', renderWidget) }
  }, [siteKey, onToken])

  if (!siteKey) return null
  return <div ref={ref} style={{ marginTop: 4 }} />
}
