import { BLOG_SERVICE } from '@/lib/blog-service'
import { PACCHETTI } from '@/lib/pacchetti'
import { SEGRETARIA_LISTINO } from '@/lib/segretaria-listino'
import { STANDALONE_SERVICES } from '@/lib/standalone-services'
import { VIDEO_DA } from '@/lib/video-listino'

// Prezzi d’ingresso, derivati una volta sola dalle sorgenti uniche dei servizi.
//
// Le pagine che citano un prezzo — servizi, settori, pacchetti — non lo scrivono
// a mano: lo leggono da qui. E' la lezione di public/llms.txt, che era rimasto a
// dichiarare Presenza 390 e Crescita 790 mentre il listino diceva 490 e 990:
// due copie dello stesso numero divergono sempre, e la copia sbagliata e' quella
// che il cliente legge per prima.

/**
 * Porta il simbolo dopo il numero, come vuole l'italiano: «490 €», non «€490».
 * Le sorgenti uniche tengono il simbolo davanti perche' li' e' un lockup
 * grafico — il prezzo grande della scheda. In un elenco o in una tabella i
 * due formati finiscono affiancati, e l'incoerenza si vede subito.
 */
function convenzioneItaliana(prezzo: string): string {
  return prezzo.replace(/€\s?([\d.,]+)/g, '$1 €')
}

function canoneStandalone(slug: string): string {
  const servizio = STANDALONE_SERVICES.find(s => s.slug === slug)
  if (!servizio) throw new Error(`Servizio standalone sconosciuto: ${slug}`)
  return convenzioneItaliana(`${servizio.displayPrice} ${servizio.cadenceLabel}`)
}

function canoneNudoMinimo(id: 'agenda' | 'voce'): string {
  const famiglia = SEGRETARIA_LISTINO.find(f => f.id === id)
  if (!famiglia) throw new Error(`Famiglia sconosciuta: ${id}`)
  return `${Math.min(...famiglia.piani.map(p => p.canone))} € al mese`
}

function canoneMinimo(id: 'agenda' | 'voce'): string {
  return `da ${canoneNudoMinimo(id)}`
}

/** Usato nei testi discorsivi delle pagine di settore. */
export const PREZZI = {
  presenza: convenzioneItaliana(`${PACCHETTI[0].prezzo} al mese`),
  crescita: convenzioneItaliana(`${PACCHETTI[1].prezzo} al mese`),
  // «a partire da» e' obbligatorio qui: 19,90 e' una landing semplice, e da li'
  // si sale. Senza il prefisso il prezzo si legge come se coprisse tutto.
  web: `a partire da ${canoneStandalone('web-commerce')}`,
  blog: convenzioneItaliana(`${BLOG_SERVICE.displayPrice} al mese`),
  b2b: canoneStandalone('lead-pilot'),
  voce: canoneMinimo('voce'),
  agenda: canoneMinimo('agenda'),
  // I pacchetti video hanno un prezzo pubblico dal settembre 2026.
  video: VIDEO_DA,
} as const

/**
 * Gli stessi canoni senza il prefisso «da» / «a partire da», per le frasi che
 * il prefisso ce l'hanno gia: «il sito parte da ${CANONE.web}». Usando PREZZI
 * in quelle posizioni usciva «parte da a partire da 19,90 € al mese», ed e'
 * esattamente il difetto che si leggeva su nove pagine di settore.
 */
export const CANONE = {
  web: canoneStandalone('web-commerce'),
  voce: canoneNudoMinimo('voce'),
  agenda: canoneNudoMinimo('agenda'),
  video: convenzioneItaliana(VIDEO_DA.replace('da ', '')),
} as const

/**
 * Prezzo d’ingresso per ogni area di servizio, con la stessa formula ovunque.
 * Le aree senza listino pubblico dicono "Su preventivo": una scheda senza
 * prezzo lascia il lettore a indovinare, ed e' la domanda che arriva comunque.
 */
export const PREZZO_INGRESSO: Record<string, string> = {
  social: convenzioneItaliana(`${PACCHETTI[0].prezzo} al mese`),
  'seo-geo': 'Su preventivo',
  'blog-seo': convenzioneItaliana(`${BLOG_SERVICE.displayPrice} al mese`),
  web: convenzioneItaliana(`a partire da ${STANDALONE_SERVICES.find(s => s.slug === 'web-commerce')!.displayPrice} al mese`),
  'lead-b2b': convenzioneItaliana(`${STANDALONE_SERVICES.find(s => s.slug === 'lead-pilot')!.displayPrice} una tantum`),
  'segretaria-ai': PREZZI.voce,
  'agenda-whatsapp': PREZZI.agenda,
  'video-produzione': VIDEO_DA,
  'gestione-lavorazioni': 'Su preventivo',
  automazione: 'Su preventivo',
  legale: '150 € / 30 minuti',
}

export function prezzoIngresso(id: string): string {
  return PREZZO_INGRESSO[id] ?? 'Su preventivo'
}
