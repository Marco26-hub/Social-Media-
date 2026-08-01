// Source-of-truth del mapping verso il contratto Blotato v2 (/v2/posts).
// Prima il mapping canale era duplicato in schedule.ts e blotato-accounts.ts (rischio
// drift); qui è uno solo. Modulo PURO (solo Intl) → importabile sia server che client
// (il badge pre-flight del calendario lo usa lato client).

// Canale interno → nome piattaforma Blotato. content.platform E target.targetType
// devono essere identici (contratto): usiamo sempre questo valore per entrambi.
// 'blog' non è una piattaforma Blotato → assente = non pubblicabile.
export const CANALE_TO_BLOTATO: Record<string, string> = {
  instagram: 'instagram',
  facebook: 'facebook',
  tiktok: 'tiktok',
  pinterest: 'pinterest',
  linkedin: 'linkedin',
  threads: 'threads',
  x: 'twitter',
  youtube_shorts: 'youtube',
}

// Formato interno → Blotato mediaType. Instagram/Facebook: senza mediaType un video o
// un contenuto viene trattato come reel di DEFAULT da Blotato → un post-immagine
// finirebbe reel. Quindi: reel/short/video → 'reel', story → 'story', post/carousel →
// undefined (immagine singola/carosello, NON reel).
export function formatoToMediaType(formato: string): 'reel' | 'story' | undefined {
  const f = String(formato || '').toLowerCase()
  if (f === 'reel' || f === 'short' || f === 'video') return 'reel'
  if (f === 'story') return 'story'
  return undefined
}

// Requisiti minimi per piattaforma, usati dal pre-flight (e allineati al resolver).
// `targetRequired` = campi target che DEVONO essere presenti (li popola resolveBlotatoTarget).
// `needsMedia` = la piattaforma non pubblica senza almeno un media.
export const PLATFORM_REQUIREMENTS: Record<string, { needsMedia: boolean; targetRequired: string[]; titleMax?: number }> = {
  instagram: { needsMedia: true, targetRequired: [] },
  facebook: { needsMedia: false, targetRequired: ['pageId'] },
  tiktok: { needsMedia: true, targetRequired: ['privacyLevel'], titleMax: 90 },
  pinterest: { needsMedia: true, targetRequired: ['boardId'] },
  linkedin: { needsMedia: false, targetRequired: [] },
  threads: { needsMedia: false, targetRequired: [] },
  twitter: { needsMedia: false, targetRequired: [] },
  youtube: { needsMedia: true, targetRequired: ['title', 'privacyStatus', 'shouldNotifySubscribers'] },
}

// Offset (tz − UTC) in ms per un dato istante, calcolato via Intl (nessuna dipendenza).
function tzOffsetMs(instant: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
  const map: Record<string, number> = {}
  for (const p of dtf.formatToParts(instant)) {
    if (p.type !== 'literal') map[p.type] = Number(p.value)
  }
  // 'instant' visto nel tz corrisponde a questi componenti locali: la loro lettura
  // come-se-UTC meno l'istante reale = offset del fuso.
  const asIfUtc = Date.UTC(map.year, map.month - 1, map.day, map.hour, map.minute, map.second)
  return asIfUtc - instant.getTime()
}

// Interpreta data (YYYY-MM-DD) + ora (HH:mm) come ora LOCALE nel fuso `tz` e ritorna
// l'ISO UTC corrispondente. Es. 10:00 Europe/Rome (estate) → 08:00:00.000Z.
// Due passaggi di offset per gestire correttamente i bordi DST.
export function zonedToUtcIso(dateStr: unknown, timeStr: unknown, tz: string): string {
  const d = String(dateStr || '').trim()
  const t = String(timeStr || '00:00').slice(0, 5)
  if (!d) throw new Error('data_pubblicazione mancante: impossibile programmare il post')
  const [Y, M, D] = d.split('-').map(Number)
  const [h, m] = t.split(':').map(Number)
  if (![Y, M, D, h, m].every(n => Number.isFinite(n))) throw new Error(`data/ora non valide: ${d} ${t}`)
  const naiveUtc = Date.UTC(Y, M - 1, D, h, m, 0)
  let offset = tzOffsetMs(new Date(naiveUtc), tz)
  offset = tzOffsetMs(new Date(naiveUtc - offset), tz)
  return new Date(naiveUtc - offset).toISOString()
}

// Fuso di default per clienti senza timezone impostata.
export const DEFAULT_TIMEZONE = 'Europe/Rome'
