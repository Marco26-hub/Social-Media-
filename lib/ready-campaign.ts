import { isCalendarDate, moveCampaignDates } from '@/lib/campaign-start-date'

export type ReadyCampaignCopy = {
  hook?: string
  caption?: string
  cta?: string
  hashtags?: string[]
}

export type ReadyCampaignContent = {
  order: number
  content_key: string
  week: number
  date: string
  format: string
  phase?: string
  objective?: string
  intent?: string
  visual_brief?: string
  media_count?: number
  audio?: { title?: string; source_url?: string; license?: string }
  copy: { instagram: ReadyCampaignCopy; facebook: ReadyCampaignCopy }
}

export type ReadyCampaignManifest = {
  campaign_cycle_id: string
  expected_contents?: number
  expected_publications?: number
  contents: ReadyCampaignContent[]
}

const CONTENT_KEY_RE = /^(reel|post|story|carousel)_([0-9]{2})$/

export function canonicalDbContentKey(contentKey: string): string {
  return String(contentKey || '').trim().toLowerCase().replace(/^carousel_/, 'carosello_')
}

export function canonicalAssetContentKey(contentKey: string): string {
  return canonicalDbContentKey(contentKey)
}

export function validateReadyCampaign(value: unknown): { manifest?: ReadyCampaignManifest; errors: string[] } {
  const errors: string[] = []
  if (!value || typeof value !== 'object') return { errors: ['Manifesto JSON non valido.'] }
  const manifest = value as ReadyCampaignManifest
  if (!String(manifest.campaign_cycle_id || '').trim()) errors.push('campaign_cycle_id mancante.')
  if (!Array.isArray(manifest.contents) || !manifest.contents.length) errors.push('contents deve contenere almeno un contenuto.')
  if (errors.length) return { errors }

  const seen = new Set<string>()
  for (const [index, content] of manifest.contents.entries()) {
    const label = `contenuto ${index + 1}`
    if (!Number.isInteger(content.order) || content.order < 1) errors.push(`${label}: order non valido.`)
    if (!CONTENT_KEY_RE.test(String(content.content_key || ''))) errors.push(`${label}: content_key non valido.`)
    if (seen.has(content.content_key)) errors.push(`${label}: content_key duplicato (${content.content_key}).`)
    seen.add(content.content_key)
    if (!Number.isInteger(content.week) || content.week < 1 || content.week > 5) errors.push(`${label}: week non valida.`)
    if (!isCalendarDate(content.date)) errors.push(`${label}: date non valida.`)
    if (!content.copy?.instagram?.hook || !content.copy?.instagram?.caption) errors.push(`${label}: copy Instagram incompleto.`)
    if (!content.copy?.facebook?.hook || !content.copy?.facebook?.caption) errors.push(`${label}: copy Facebook incompleto.`)
  }
  const ordered = [...manifest.contents].sort((a, b) => a.order - b.order)
  if (ordered.some((content, index) => content.order !== index + 1)) errors.push('La sequenza order deve essere continua da 1 a N.')
  const months = new Set(ordered.map(content => content.date.slice(0, 7)))
  if (months.size !== 1) errors.push('Tutte le date del manifesto devono appartenere allo stesso mese.')
  if (manifest.expected_contents && manifest.expected_contents !== ordered.length) {
    errors.push(`expected_contents=${manifest.expected_contents}, ma contents contiene ${ordered.length} elementi.`)
  }
  if (manifest.expected_publications && manifest.expected_publications !== ordered.length * 2) {
    errors.push(`expected_publications=${manifest.expected_publications}, ma Instagram + Facebook richiedono ${ordered.length * 2} pubblicazioni.`)
  }
  return errors.length ? { errors } : { manifest: { ...manifest, contents: ordered }, errors }
}

export function publicationTime(platform: 'instagram' | 'facebook', format: string): string {
  if (platform === 'instagram') return format === 'story' ? '19:45' : '19:00'
  return format === 'story' ? '20:45' : '20:00'
}

export function readyCampaignWithStart(manifest: ReadyCampaignManifest, start?: string): ReadyCampaignManifest {
  return start ? { ...manifest, contents: moveCampaignDates(manifest.contents, start) } : manifest
}
