import { BLOG_SERVICE } from '@/lib/blog-service'
import { PACCHETTI } from '@/lib/pacchetti'
import { SEGRETARIA_LISTINO } from '@/lib/segretaria-listino'
import { STANDALONE_SERVICES } from '@/lib/standalone-services'

// Prezzi d’ingresso, derivati una volta sola dalle sorgenti uniche dei servizi.
//
// Le pagine che citano un prezzo — servizi, settori, pacchetti — non lo scrivono
// a mano: lo leggono da qui. E' la lezione di public/llms.txt, che era rimasto a
// dichiarare Presenza 390 e Crescita 790 mentre il listino diceva 490 e 990:
// due copie dello stesso numero divergono sempre, e la copia sbagliata e' quella
// che il cliente legge per prima.

function canoneStandalone(slug: string): string {
  const servizio = STANDALONE_SERVICES.find(s => s.slug === slug)
  if (!servizio) throw new Error(`Servizio standalone sconosciuto: ${slug}`)
  return `${servizio.displayPrice} ${servizio.cadenceLabel}`
}

function canoneMinimo(id: 'agenda' | 'voce'): string {
  const famiglia = SEGRETARIA_LISTINO.find(f => f.id === id)
  if (!famiglia) throw new Error(`Famiglia sconosciuta: ${id}`)
  return `da ${Math.min(...famiglia.piani.map(p => p.canone))} € al mese`
}

/** Usato nei testi discorsivi delle pagine di settore. */
export const PREZZI = {
  presenza: `${PACCHETTI[0].prezzo} al mese`,
  crescita: `${PACCHETTI[1].prezzo} al mese`,
  web: canoneStandalone('web-commerce'),
  blog: `${BLOG_SERVICE.displayPrice} al mese`,
  b2b: canoneStandalone('lead-pilot'),
  voce: canoneMinimo('voce'),
  agenda: canoneMinimo('agenda'),
} as const

/**
 * Prezzo d’ingresso per ogni area di servizio, con la stessa formula ovunque.
 * Le aree senza listino pubblico dicono "Su preventivo": una scheda senza
 * prezzo lascia il lettore a indovinare, ed e' la domanda che arriva comunque.
 */
export const PREZZO_INGRESSO: Record<string, string> = {
  social: `${PACCHETTI[0].prezzo} al mese`,
  'seo-geo': 'Su preventivo',
  'blog-seo': `${BLOG_SERVICE.displayPrice} al mese`,
  web: `a partire da ${STANDALONE_SERVICES.find(s => s.slug === 'web-commerce')!.displayPrice} al mese`,
  'lead-b2b': `${STANDALONE_SERVICES.find(s => s.slug === 'lead-pilot')!.displayPrice} una tantum`,
  'segretaria-ai': PREZZI.voce,
  'agenda-whatsapp': PREZZI.agenda,
  'video-produzione': 'Su preventivo',
  'gestione-lavorazioni': 'Su preventivo',
  automazione: 'Su preventivo',
  legale: '150 € / 30 minuti',
}

export function prezzoIngresso(id: string): string {
  return PREZZO_INGRESSO[id] ?? 'Su preventivo'
}
