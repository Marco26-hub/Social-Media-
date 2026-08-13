export const MAX_BLOTATO_INSTAGRAM_HASHTAGS = 5

const HASHTAG_RE = /#[\p{L}\p{N}_]+/gu

export function extractHashtags(text: string): string[] {
  return Array.from(text.matchAll(HASHTAG_RE), m => m[0])
}

export function hashtagCount(text: string): number {
  return extractHashtags(text).length
}

export function stripHashtags(text: string): string {
  return text
    .replace(HASHTAG_RE, '')
    .replace(/[ \t]+([,.;:!?])/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function trimHashtags(text: string, max: number): string {
  if (max < 1) return ''
  const seen = new Set<string>()
  const tags: string[] = []
  for (const tag of extractHashtags(text)) {
    const key = tag.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    tags.push(tag)
    if (tags.length >= max) break
  }
  return tags.join(' ')
}

export function normalizeHashtagsForPublish(canale: string, hashtag: string): string {
  const clean = hashtag.trim()
  if (!clean) return ''
  if (canale === 'instagram') return trimHashtags(clean, MAX_BLOTATO_INSTAGRAM_HASHTAGS)
  return clean
}

export function normalizeInstagramPublishPayload(text: string, hashtag: string): {
  text: string
  firstComment: string
} {
  // Blotato applica il limite al totale del post, non soltanto alla colonna
  // hashtag. La colonna dedicata ha priorita, poi recuperiamo eventuali hashtag
  // gia presenti in hook/caption/CTA e li deduplichiamo.
  return {
    text: stripHashtags(text),
    firstComment: trimHashtags(`${hashtag}\n${text}`, MAX_BLOTATO_INSTAGRAM_HASHTAGS),
  }
}
