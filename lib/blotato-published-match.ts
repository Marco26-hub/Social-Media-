type Row = Record<string, unknown>
const clean = (value: unknown) => String(value || '').replace(/\s+/g, ' ').trim()

// Una ricerca per testo è solo un candidato. Richiediamo la prova del payload
// originale: stesso account, piattaforma, hook e un asset esatto, nel ciclo.
export function matchesPublishedProof(row: Row, published: Row, start: string, end: string): boolean {
  const timestamp = String(published.createdAt || '')
  if (timestamp < start || timestamp >= end || !Number.isFinite(Date.parse(timestamp))) return false
  if (published.platform !== row.canale || !row.platform_account_id) return false
  const raw = published.rawPost as Row | null
  const post = (raw?.post || raw) as Row | null
  if (!post || String(post.accountId || '') !== String(row.platform_account_id)) return false
  const content = post.content as Row | undefined
  if (!content || content.platform !== row.canale) return false
  const hook = clean(row.hook)
  if (!hook || !clean(published.content).startsWith(hook) || !clean(content.text).startsWith(hook)) return false
  const localMedia = new Set([
    ...Array.from({ length: 10 }, (_, i) => row[`link_media_${i + 1}`]),
    row.blotato_visual_media_url, row.blotato_audio_visual_media_url,
  ].filter(Boolean).map(String))
  const remoteMedia = Array.isArray(published.mediaUrls) ? published.mediaUrls.map(String) : []
  const payloadMedia = Array.isArray(content.mediaUrls) ? content.mediaUrls.map(String) : []
  return remoteMedia.some(url => localMedia.has(url) && payloadMedia.includes(url))
}
