import type { MediaTag } from '@/lib/media-requirements'

export type RepairPlatform = 'instagram' | 'facebook'

export type RepairAsset = {
  url: string
  relative_path?: string | null
  week?: number | null
  platform?: RepairPlatform | null
  content_key?: string | null
  sequence?: number | null
  tag?: MediaTag | null
  kind?: 'image' | 'video' | 'audio' | null
}

export type RepairGroup = {
  key: string
  week: number
  platform: RepairPlatform
  tag: Exclude<MediaTag, 'auto'>
  contentKey: string
  assets: RepairAsset[]
}

export type RepairRow = Record<string, unknown> & {
  id: string
  canale?: string | null
  formato?: string | null
  data_pubblicazione?: string | Date | null
  ora_pubblicazione?: string | null
  created_at?: string | Date | null
  campaign_content_key?: string | null
  campaign_week?: number | null
  blotato_post_id?: string | null
  blotato_status?: string | null
  status?: string | null
}

export type RepairMatch = {
  row: RepairRow
  group: RepairGroup
  method: 'metadata' | 'filename' | 'sequence'
  locked: boolean
}

const CONTENT_FILE_RE = /(?:^|[/_-])w([1-5])-(instagram|facebook)-(reel|carosello|story|post)_0?(\d{1,2})-(?:0?\d{1,2}|cover)(?:\.|[/_?-])/i

function normalizedContentKey(value: unknown): string {
  const match = String(value || '').trim().toLowerCase().match(/^(reel|carosello|carousel|story|post)_?0?(\d{1,2})$/)
  if (!match) return ''
  const tag = match[1] === 'carousel' ? 'carosello' : match[1]
  return `${tag}_${String(Number(match[2])).padStart(2, '0')}`
}

export function repairTag(value: unknown): Exclude<MediaTag, 'auto'> | null {
  const text = String(value || '').trim().toLowerCase()
  if (['carousel', 'carosello'].includes(text)) return 'carosello'
  if (['reel', 'short', 'video'].includes(text)) return 'reel'
  if (['story', 'stories', 'storia', 'storie'].includes(text)) return 'story'
  if (['post', 'pin'].includes(text)) return 'post'
  return null
}

export function repairGroupKey(week: number, platform: RepairPlatform, contentKey: string): string {
  return `${week}:${platform}:${contentKey}`
}

export function buildRepairGroups(assets: RepairAsset[]): RepairGroup[] {
  const groups = new Map<string, RepairGroup>()
  for (const asset of assets) {
    if (!asset?.url || asset.kind === 'audio') continue
    const week = Number(asset.week)
    const platform = asset.platform === 'instagram' || asset.platform === 'facebook' ? asset.platform : null
    const contentKey = normalizedContentKey(asset.content_key)
    const tag = repairTag(asset.tag || contentKey.split('_')[0])
    if (!Number.isInteger(week) || week < 1 || week > 5 || !platform || !contentKey || !tag) continue
    const key = repairGroupKey(week, platform, contentKey)
    const group = groups.get(key) || { key, week, platform, tag, contentKey, assets: [] }
    group.assets.push(asset)
    groups.set(key, group)
  }
  return [...groups.values()]
    .map(group => ({
      ...group,
      assets: [...group.assets].sort((left, right) => (left.sequence ?? 999) - (right.sequence ?? 999) || left.url.localeCompare(right.url)),
    }))
    .sort((left, right) => left.platform.localeCompare(right.platform) || contentNumber(left.contentKey) - contentNumber(right.contentKey))
}

export function placementFromStoredValue(value: unknown): { week: number; platform: RepairPlatform; contentKey: string } | null {
  const values = Array.isArray(value) ? value : [value]
  for (const item of values) {
    if (!item) continue
    const match = CONTENT_FILE_RE.exec(decodeURIComponent(String(item)))
    if (!match) continue
    const platform = match[2].toLowerCase() as RepairPlatform
    const contentKey = normalizedContentKey(`${match[3]}_${match[4]}`)
    if (contentKey) return { week: Number(match[1]), platform, contentKey }
  }
  return null
}

function rowStoredPlacement(row: RepairRow): { week: number; platform: RepairPlatform; contentKey: string } | null {
  const metadataKey = normalizedContentKey(row.campaign_content_key)
  const metadataWeek = Number(row.campaign_week)
  const platform = row.canale === 'instagram' || row.canale === 'facebook' ? row.canale : null
  if (metadataKey && platform && Number.isInteger(metadataWeek) && metadataWeek >= 1 && metadataWeek <= 5) {
    return { week: metadataWeek, platform, contentKey: metadataKey }
  }
  const sourcePaths = parseJsonArray(row.campaign_source_paths)
  const values = [
    ...sourcePaths,
    ...Array.from({ length: 10 }, (_, index) => row[`link_media_${index + 1}`]),
  ]
  return placementFromStoredValue(values)
}

function parseJsonArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (typeof value !== 'string' || !value.trim()) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function contentNumber(contentKey: string): number {
  return Number(contentKey.match(/(\d+)$/)?.[1] || 999)
}

function rowTime(row: RepairRow): number {
  const date = row.data_pubblicazione instanceof Date
    ? row.data_pubblicazione.toISOString().slice(0, 10)
    : String(row.data_pubblicazione || '').slice(0, 10)
  const time = String(row.ora_pubblicazione || '00:00').slice(0, 5)
  const parsed = Date.parse(`${date}T${time}:00Z`)
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER
}

function isLocked(row: RepairRow): boolean {
  return Boolean(row.blotato_post_id)
    || ['scheduled', 'published'].includes(String(row.blotato_status || '').toLowerCase())
    || ['PUBBLICATO', 'IN_PUBBLICAZIONE', 'ARCHIVIATO'].includes(String(row.status || ''))
}

export function matchRepairRows(rows: RepairRow[], groups: RepairGroup[]): RepairMatch[] {
  const groupsByKey = new Map(groups.map(group => [group.key, group]))
  const matches = new Map<string, RepairMatch>()
  const claimedGroups = new Set<string>()

  // Prima scelta: metadati 044 o nome canonico gia presente negli URL.
  for (const row of [...rows].sort((left, right) => String(right.created_at || '').localeCompare(String(left.created_at || '')))) {
    const placement = rowStoredPlacement(row)
    if (!placement) continue
    const key = repairGroupKey(placement.week, placement.platform, placement.contentKey)
    const group = groupsByKey.get(key)
    if (!group || claimedGroups.has(key) || repairTag(row.formato) !== group.tag) continue
    const method = normalizedContentKey(row.campaign_content_key) ? 'metadata' : 'filename'
    matches.set(row.id, { row, group, method, locked: isLocked(row) })
    claimedGroups.add(key)
  }

  // Recupero prudente dei record senza media: si usa l'ordine solo quando una
  // piattaforma contiene l'intera sequenza mensile e tutti i formati coincidono.
  for (const platform of ['instagram', 'facebook'] as const) {
    const platformGroups = groups.filter(group => group.platform === platform)
      .sort((left, right) => contentNumber(left.contentKey) - contentNumber(right.contentKey))
    const platformRows = rows.filter(row => row.canale === platform)
      .sort((left, right) => rowTime(left) - rowTime(right))
    if (!platformGroups.length || platformRows.length !== platformGroups.length) continue
    if (!platformRows.every((row, index) => repairTag(row.formato) === platformGroups[index].tag)) continue
    platformRows.forEach((row, index) => {
      const group = platformGroups[index]
      if (matches.has(row.id) || claimedGroups.has(group.key)) return
      matches.set(row.id, { row, group, method: 'sequence', locked: isLocked(row) })
      claimedGroups.add(group.key)
    })
  }

  return [...matches.values()].sort((left, right) => rowTime(left.row) - rowTime(right.row))
}
