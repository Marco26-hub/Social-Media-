'use client'

import { useId } from 'react'

// Campo di deformazione limitato alla mano e all'avambraccio. Il resto della
// mappa è neutro: testa, busto, seconda mano e piedi non vengono trasformati.
// Nessun ritaglio o arto sovrapposto: viene disegnata una sola immagine integra.
const MAPPA = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="768" viewBox="0 0 512 768">
  <defs>
    <linearGradient id="peso" x1="60" y1="330" x2="150" y2="450" gradientUnits="userSpaceOnUse">
      <stop stop-color="rgb(255,150,128)"/><stop offset="1" stop-color="rgb(128,128,128)"/>
    </linearGradient>
    <filter id="morbido"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>
  <path fill="rgb(128,128,128)" d="M0 0h512v768H0z"/>
  <path fill="url(#peso)" filter="url(#morbido)" d="M10 290H95L110 348 130 397 159 449 142 463 103 440 65 404 20 363Z"/>
</svg>`)

export default function OdinoSaluto({ src, className }: { src: string; className: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={className} viewBox="0 0 512 768" aria-hidden="true" data-odino-wave>
      <defs>
        <filter id={id} x="-5%" y="-3%" width="110%" height="106%" colorInterpolationFilters="sRGB">
          <feImage href={MAPPA} x="0" y="0" width="512" height="768" result="mano" />
          <feDisplacementMap in="SourceGraphic" in2="mano" scale="0" xChannelSelector="R" yChannelSelector="G">
            <animate attributeName="scale" values="0;18;-18;16;-14;0" keyTimes="0;.18;.38;.58;.8;1" dur="3.6s" repeatCount="1" fill="freeze" calcMode="spline" keySplines=".4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1" />
          </feDisplacementMap>
        </filter>
      </defs>
      <image href={src} width="512" height="768" filter={`url(#${id})`} />
    </svg>
  )
}

const MAPPA_GAMBE = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="768">
  <defs>
    <linearGradient id="sinistra" x1="0" y1="590" x2="0" y2="725" gradientUnits="userSpaceOnUse"><stop stop-color="rgb(128,128,128)"/><stop offset="1" stop-color="rgb(128,255,128)"/></linearGradient>
    <linearGradient id="destra" x1="0" y1="590" x2="0" y2="725" gradientUnits="userSpaceOnUse"><stop stop-color="rgb(128,128,128)"/><stop offset="1" stop-color="rgb(128,0,128)"/></linearGradient>
    <filter id="morbido"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>
  <path fill="rgb(128,128,128)" d="M0 0h512v768H0z"/>
  <g filter="url(#morbido)"><path fill="url(#sinistra)" d="M65 590H232V767H65z"/><path fill="url(#destra)" d="M250 590H410V767H250z"/></g>
</svg>`)

const MASCHERA_BUSTO = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="768"><path fill="white" d="M0 0h512v570H0z"/></svg>')

export function OdinoGambe({ src, className, attivo }: { src: string; className: string; attivo: boolean }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={className} viewBox="0 0 512 768" aria-hidden="true" data-odino-legs={attivo}>
      <defs>
        <filter id={id} x="-3%" y="-3%" width="106%" height="106%" colorInterpolationFilters="sRGB">
          <feImage href={MAPPA_GAMBE} x="0" y="0" width="512" height="768" result="gambe" />
          {/* 128/255 non è esattamente 0.5: corregge il grigio neutro per
              evitare anche il minimo spostamento subpixel di testa e busto. */}
          <feComponentTransfer in="gambe" result="gambeNeutre">
            <feFuncR type="linear" slope="1" intercept="-0.00196078431372549" />
            <feFuncG type="linear" slope="1" intercept="-0.00196078431372549" />
          </feComponentTransfer>
          <feDisplacementMap in="SourceGraphic" in2="gambeNeutre" scale="0" xChannelSelector="R" yChannelSelector="G" result="passo">
            {attivo && <animate attributeName="scale" values="0;0;20;4;-18;-3;0" keyTimes="0;.3;.43;.56;.69;.82;1" dur="8.4s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1" />}
          </feDisplacementMap>
          {/* Conserva i pixel originali del busto. Il confine è nella zona
              neutra della mappa, sopra le ginocchia: nessun arto separato. */}
          <feImage href={MASCHERA_BUSTO} x="0" y="0" width="512" height="768" result="busto" />
          <feComposite in="SourceGraphic" in2="busto" operator="in" result="alto" />
          <feComposite in="passo" in2="busto" operator="out" result="basso" />
          <feMerge><feMergeNode in="basso" /><feMergeNode in="alto" /></feMerge>
        </filter>
      </defs>
      <image href={src} width="512" height="768" filter={`url(#${id})`} />
    </svg>
  )
}
