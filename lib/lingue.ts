import { SETTORI_EN } from '@/lib/settori.en'

// Corrispondenze fra pagine italiane e inglesi.
//
// Il pulsante EN portava sempre alla home inglese, anche quando la traduzione
// della pagina che stai leggendo esiste: chi legge /pacchetti e clicca EN
// finiva su /en invece che su /en/pricing, e doveva ricominciare a navigare.
// La mappa stava dentro app/sitemap.ts, dove serviva solo agli hreflang.

export const COPPIE_LINGUA: Record<string, string> = {
  '/': '/en',
  '/servizi': '/en/services',
  '/metodo': '/en/method',
  '/pacchetti': '/en/pricing',
  '/chi-siamo': '/en/about',
  '/faq': '/en/faq',
  '/contatti': '/en/contact',
  '/settori': '/en/settori',
  ...Object.fromEntries(SETTORI_EN.map(s => [`/settori/${s.slug}`, `/en/settori/${s.slug}`])),
}

const INVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(COPPIE_LINGUA).map(([it, en]) => [en, it]),
)

/**
 * Dove porta il cambio lingua da un percorso. Se la traduzione non esiste si
 * torna alla radice dell'altra lingua: meglio la home che una pagina assente.
 */
export function altraLingua(percorso: string, verso: 'it' | 'en'): string {
  const pulito = percorso.replace(/[?#].*$/, '').replace(/\/+$/, '') || '/'
  return verso === 'en' ? (COPPIE_LINGUA[pulito] ?? '/en') : (INVERSE[pulito] ?? '/')
}
