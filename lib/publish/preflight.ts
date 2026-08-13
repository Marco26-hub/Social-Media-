// Pre-flight Blotato: verifica se una riga `calendario` produrrà un post valido
// PRIMA di tentare il sync, così l'errore si vede in dashboard con la causa invece
// di fallire con un 4xx durante il POST /v2/posts.
//
// Modulo PURO (nessun accesso rete/DB) → usabile sia lato server (nel sync, come
// guardia "blocca solo il sync") sia lato client (badge nel calendario). I controlli
// che dipendono dall'account Blotato (pageId Facebook, boardId Pinterest) NON sono
// qui: li copre resolveBlotatoTarget nel sync, che lancia un errore esplicito.

import { CANALE_TO_BLOTATO, PLATFORM_REQUIREMENTS, formatoToMediaType, zonedToUtcIso, DEFAULT_TIMEZONE } from './blotato-map'
import { MAX_BLOTATO_INSTAGRAM_HASHTAGS, hashtagCount } from '@/lib/hashtags'

export type PreflightIssue = { code: string; message: string }
export type PreflightResult = { ok: boolean; errors: PreflightIssue[]; warnings: string[] }

const VIDEO_RE = /\.(mp4|mov|webm|m4v|avi)(\?|$)/i

function collectMedia(row: Record<string, unknown>): string[] {
  const urls: string[] = []
  for (let i = 1; i <= 10; i++) {
    const u = row[`link_media_${i}`]
    if (typeof u === 'string' && u.trim()) urls.push(u.trim())
  }
  return urls
}

export function preflightRow(row: Record<string, unknown>, tz: string = DEFAULT_TIMEZONE): PreflightResult {
  const errors: PreflightIssue[] = []
  const warnings: string[] = []
  const canale = String(row.canale || '')
  const formato = String(row.formato || 'post').toLowerCase()
  const platform = CANALE_TO_BLOTATO[canale]

  // Canale non pubblicabile (es. blog): errore secco, niente altri controlli.
  if (!platform) {
    errors.push({ code: 'canale', message: `Canale "${canale}" non pubblicabile via Blotato` })
    return { ok: false, errors, warnings }
  }
  const req = PLATFORM_REQUIREMENTS[platform] || { needsMedia: false, targetRequired: [] as string[] }

  // Testo
  const hook = String(row.hook || '').trim()
  const caption = String(row.caption || '').trim()
  const hashtag = String(row.hashtag || '').trim()
  if (!hook && !caption) warnings.push('Testo vuoto (hook e caption mancanti)')
  if (platform === 'instagram') {
    const count = hashtagCount([hashtag, hook, caption, String(row.cta || '')].join('\n'))
    if (count > MAX_BLOTATO_INSTAGRAM_HASHTAGS) {
      warnings.push(`Instagram/Blotato accetta massimo ${MAX_BLOTATO_INSTAGRAM_HASHTAGS} hashtag: verranno ridotti da ${count} a ${MAX_BLOTATO_INSTAGRAM_HASHTAGS}`)
    }
  }

  // Media
  const media = collectMedia(row)
  const mediaType = formatoToMediaType(formato)
  if (req.needsMedia && media.length === 0) {
    errors.push({ code: 'media', message: `${platform}: serve almeno un media (nessuna immagine/video caricato)` })
  }
  if (formato === 'carousel' && media.length > 0 && (media.length < 2 || media.length > 10)) {
    errors.push({ code: 'carousel', message: `Carosello: servono 2–10 media (attuali: ${media.length})` })
  }
  if (mediaType === 'reel' && media.length > 0 && !media.some(u => VIDEO_RE.test(u))) {
    warnings.push('Formato video/reel ma nessun media sembra un video')
  }

  // Data/ora deve essere nel FUTURO nel fuso del cliente (Blotato: passato → 422).
  try {
    const iso = zonedToUtcIso(row.data_pubblicazione, row.ora_pubblicazione, tz)
    if (new Date(iso).getTime() <= Date.now()) {
      errors.push({ code: 'past', message: `Data/ora nel passato (${String(row.data_pubblicazione)} ${String(row.ora_pubblicazione)}): Blotato rifiuta la programmazione` })
    }
  } catch (e) {
    errors.push({ code: 'schedule', message: (e as Error).message })
  }

  // TikTok/altri con limite titolo (di norma già troncato dal resolver: safety)
  if (req.titleMax) {
    const title = (hook || String(row.nome_prodotto || ''))
    if (title.length > req.titleMax) warnings.push(`Titolo oltre ${req.titleMax} caratteri: verrà troncato`)
  }

  return { ok: errors.length === 0, errors, warnings }
}
