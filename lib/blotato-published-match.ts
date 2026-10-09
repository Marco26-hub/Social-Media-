import { CANALE_TO_BLOTATO } from './publish/blotato-map'
type Row = Record<string, unknown>
const clean = (value: unknown) => String(value || '').replace(/\s+/g, ' ').trim()

// Una ricerca per testo è solo un candidato. Richiediamo la prova del payload
// originale: stesso account, piattaforma, hook e un asset esatto, nel ciclo.
export function publishedProofMismatch(row: Row, published: Row, start: string, end: string): string | null {
  const timestamp = Date.parse(String(published.createdAt || ''))
  if (!Number.isFinite(timestamp) || timestamp < Date.parse(start) || timestamp >= Date.parse(end)) return 'data pubblicazione fuori ciclo'
  const platform = CANALE_TO_BLOTATO[String(row.canale)]
  if (published.platform !== platform || !row.platform_account_id) return 'piattaforma/account locale non verificabile'
  const raw = published.rawPost as Row | null
  const post = (raw?.post || raw) as Row | null
  if (!post) return 'payload originale non disponibile'
  if (String(post.accountId || '') !== String(row.platform_account_id)) return 'account nel payload originale diverso o assente'
  // Facebook/LinkedIn condividono l'account tra pagine: il solo account non basta.
  if (row.canale === 'facebook' || row.canale === 'linkedin') {
    const target = post.target as Row | undefined
    if (!row.blotato_target_page_id || String(target?.pageId || '') !== String(row.blotato_target_page_id)) return 'pagina di destinazione non verificabile'
  }
  const content = post.content as Row | undefined
  if (!content || content.platform !== platform) return 'contenuto del payload originale non verificabile'
  const hook = clean(row.hook)
  if (!hook || !clean(published.content).startsWith(hook) || !clean(content.text).startsWith(hook)) return 'hook del payload originale diverso'
  const localMedia = new Set([
    ...Array.from({ length: 10 }, (_, i) => row[`link_media_${i + 1}`]),
    row.blotato_visual_media_url, row.blotato_audio_visual_media_url,
    ...(Array.isArray(row.blotato_original_media_urls) ? row.blotato_original_media_urls : []),
  ].filter(Boolean).map(String))
  const payloadMedia = Array.isArray(content.mediaUrls) ? content.mediaUrls.map(String) : []
  // Blotato può copiare il file pubblicato sul proprio CDN: gli URL pubblici
  // non devono essere uguali a quelli sorgente. La prova è il payload originale
  // associato dal provider a questo publishedPost, non una somiglianza visiva.
  return payloadMedia.length > 0 && payloadMedia.every(url => localMedia.has(url)) ? null : 'media del payload originale non corrispondenti'
}

export function matchesPublishedProof(row: Row, published: Row, start: string, end: string): boolean {
  return publishedProofMismatch(row, published, start, end) === null
}
