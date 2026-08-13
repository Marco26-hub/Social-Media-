export const MAX_BLOTATO_INSTAGRAM_HASHTAGS = 5

const HASHTAG_RE = /#[\p{L}\p{N}_]+/gu

export function extractHashtags(text: string): string[] {
  return Array.from(text.matchAll(HASHTAG_RE), m => m[0])
}

export function hashtagCount(text: string): number {
  return extractHashtags(text).length
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
