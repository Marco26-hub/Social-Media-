'use client'

import { useEffect, useRef } from 'react'
import {
  TRUSTPILOT_ATTIVO,
  TRUSTPILOT_BUSINESS_UNIT_ID,
  TRUSTPILOT_PROFILO_URL,
  TRUSTPILOT_TEMPLATE_ID,
} from '@/lib/trustpilot'

const BOOTSTRAP_SRC = 'https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js'

declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement: (el: HTMLElement, forceReload?: boolean) => void
    }
  }
}

// Lo script di bootstrap va caricato una volta sola per pagina, anche se il
// widget compare in piu' punti: la seconda copia rimonterebbe tutti i widget
// gia' presenti.
let bootstrapPromise: Promise<void> | null = null

function caricaBootstrap(): Promise<void> {
  if (window.Trustpilot) return Promise.resolve()
  if (bootstrapPromise) return bootstrapPromise

  bootstrapPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = BOOTSTRAP_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      // Se il caricamento fallisce (CSP, blocco di rete, ad blocker) la
      // promessa viene liberata: un rientro successivo puo' riprovare invece
      // di restare appeso a un fallimento vecchio.
      bootstrapPromise = null
      reject(new Error('Trustpilot: bootstrap non caricato'))
    }
    document.head.appendChild(script)
  })

  return bootstrapPromise
}

type Props = {
  /** Altezza dichiarata dal template scelto nella dashboard TrustBox. */
  height?: string
  /** Tema del box: va accordato al fondo su cui viene messo. */
  theme?: 'light' | 'dark'
  /**
   * Lingua del box. Era fissa a `it-IT`, e sulla home inglese avrebbe stampato
   * «recensioni» e le date in italiano dentro una pagina in inglese.
   */
  locale?: 'it-IT' | 'en-US'
  className?: string
}

export default function TrustpilotWidget({
  height = '52px',
  theme = 'light',
  locale = 'it-IT',
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!TRUSTPILOT_ATTIVO) return
    const el = ref.current
    if (!el) return

    let annullato = false
    caricaBootstrap()
      .then(() => {
        if (annullato || !window.Trustpilot) return
        window.Trustpilot.loadFromElement(el, true)
      })
      .catch(() => {
        // Il link di fallback dentro il contenitore resta visibile: l'utente
        // arriva comunque al profilo.
      })

    return () => {
      annullato = true
    }
  }, [locale, height, theme])

  if (!TRUSTPILOT_ATTIVO) return null

  return (
    <div
      ref={ref}
      className={`trustpilot-widget${className ? ` ${className}` : ''}`}
      data-locale={locale}
      data-template-id={TRUSTPILOT_TEMPLATE_ID}
      data-businessunit-id={TRUSTPILOT_BUSINESS_UNIT_ID}
      data-style-height={height}
      data-style-width="100%"
      data-theme={theme}
    >
      <a href={TRUSTPILOT_PROFILO_URL} target="_blank" rel="noopener noreferrer">
        {locale === 'en-US'
          ? 'Social Web Automation reviews on Trustpilot'
          : 'Recensioni di Social Web Automation su Trustpilot'}
      </a>
    </div>
  )
}
