import type { MediaTag } from '@/lib/media-requirements'

export const READY_CAMPAIGN_FILENAME = 'swa-ready-campaign.json'

export type ReadyCampaignPlatform = 'instagram' | 'facebook'
export type ReadyCampaignFormat = 'post' | 'carousel' | 'reel' | 'story'

export type ReadyCampaignPlatformCopy = {
  hook: string
  caption: string
  cta: string
  hashtags: string[]
}

export type ReadyCampaignAudio = {
  title: string
  source_url: string
  license: string
}

export type ReadyCampaignContent = {
  order: number
  source_id: string
  content_key: string
  week: number
  date: string
  format: ReadyCampaignFormat
  phase: 'ATTENZIONE' | 'FIDUCIA' | 'SCELTA' | 'AZIONE'
  objective: string
  intent: string
  visual_brief: string
  media_count: number
  audio: ReadyCampaignAudio | null
  copy: Record<ReadyCampaignPlatform, ReadyCampaignPlatformCopy>
}

export type ReadyCampaignManifest = {
  schema_version: 1
  mode: 'ready_campaign'
  package: 'libero' | 'presenza' | 'crescita'
  campaign_id: string
  campaign_cycle_id: string
  brand: string
  month: string
  strategy: string
  audience: string
  cta_keyword: string
  expected_contents: number
  expected_publications: number
  platforms: ReadyCampaignPlatform[]
  mix: Record<ReadyCampaignFormat, number>
  contents: ReadyCampaignContent[]
}

export type ReadyCampaignAsset = {
  url: string
  name?: string
  kind?: 'image' | 'video' | 'audio'
  tag?: MediaTag
  campaign_key?: string
  relative_path?: string
  week?: number | null
  platform?: ReadyCampaignPlatform | null
  content_key?: string | null
  sequence?: number | null
}

export type ReadyCampaignPublication = {
  id_contenuto: string
  campaign_cycle_id: string
  campaign_content_key: string
  campaign_week: number
  campaign_order: number
  platform: ReadyCampaignPlatform
  date: string
  format: ReadyCampaignFormat
  phase: ReadyCampaignContent['phase']
  objective: string
  hook: string
  caption: string
  cta: string
  hashtags: string
  intent: string
  visual_brief: string
  media: ReadyCampaignAsset[]
  audio: ReadyCampaignAsset | null
  audio_title: string | null
  audio_source_url: string | null
  audio_license: string | null
}

export type ReadyCampaignValidation = {
  ok: boolean
  errors: string[]
  warnings: string[]
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const CONTENT_KEY = /^(?:post|carosello|reel|story)_\d{2}$/
const FORMAT_SET = new Set<ReadyCampaignFormat>(['post', 'carousel', 'reel', 'story'])
const PHASE_SET = new Set<ReadyCampaignContent['phase']>(['ATTENZIONE', 'FIDUCIA', 'SCELTA', 'AZIONE'])
const PLATFORM_SET = new Set<ReadyCampaignPlatform>(['instagram', 'facebook'])

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function int(value: unknown): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : 0
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function stableToken(value: string): string {
  let hash = 2166136261
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36).toUpperCase().padStart(7, '0')
}

function normalizeCopy(raw: unknown): ReadyCampaignPlatformCopy {
  const source = isObject(raw) ? raw : {}
  const hashtags = Array.isArray(source.hashtags)
    ? source.hashtags.map(text).filter(Boolean)
    : text(source.hashtags).split(/\s+/).filter(tag => tag.startsWith('#'))
  return {
    hook: text(source.hook),
    caption: text(source.caption),
    cta: text(source.cta),
    hashtags,
  }
}

function normalizeAudio(raw: unknown): ReadyCampaignAudio | null {
  if (!isObject(raw)) return null
  const audio = {
    title: text(raw.title),
    source_url: text(raw.source_url),
    license: text(raw.license),
  }
  return audio.title || audio.source_url || audio.license ? audio : null
}

function normalizeContent(raw: unknown): ReadyCampaignContent {
  const source = isObject(raw) ? raw : {}
  const rawCopy = isObject(source.copy) ? source.copy : {}
  return {
    order: int(source.order),
    source_id: text(source.source_id),
    content_key: text(source.content_key).toLowerCase(),
    week: int(source.week),
    date: text(source.date),
    format: text(source.format).toLowerCase() as ReadyCampaignFormat,
    phase: text(source.phase).toUpperCase() as ReadyCampaignContent['phase'],
    objective: text(source.objective),
    intent: text(source.intent),
    visual_brief: text(source.visual_brief),
    media_count: int(source.media_count),
    audio: normalizeAudio(source.audio),
    copy: {
      instagram: normalizeCopy(rawCopy.instagram),
      facebook: normalizeCopy(rawCopy.facebook),
    },
  }
}

export function parseReadyCampaignManifest(value: unknown): ReadyCampaignManifest {
  const source = typeof value === 'string' ? JSON.parse(value) as unknown : value
  if (!isObject(source)) throw new Error('Manifesto campagna non valido: atteso un oggetto JSON')
  const rawMix = isObject(source.mix) ? source.mix : {}
  return {
    schema_version: int(source.schema_version) as 1,
    mode: text(source.mode) as 'ready_campaign',
    package: text(source.package) as ReadyCampaignManifest['package'],
    campaign_id: text(source.campaign_id),
    campaign_cycle_id: text(source.campaign_cycle_id),
    brand: text(source.brand),
    month: text(source.month),
    strategy: text(source.strategy),
    audience: text(source.audience),
    cta_keyword: text(source.cta_keyword),
    expected_contents: int(source.expected_contents),
    expected_publications: int(source.expected_publications),
    platforms: Array.isArray(source.platforms)
      ? source.platforms.map(platform => text(platform).toLowerCase()).filter((platform): platform is ReadyCampaignPlatform => PLATFORM_SET.has(platform as ReadyCampaignPlatform))
      : [],
    mix: {
      post: int(rawMix.post),
      carousel: int(rawMix.carousel),
      reel: int(rawMix.reel),
      story: int(rawMix.story),
    },
    contents: Array.isArray(source.contents) ? source.contents.map(normalizeContent) : [],
  }
}

export function validateReadyCampaignManifest(manifest: ReadyCampaignManifest): ReadyCampaignValidation {
  const errors: string[] = []
  const warnings: string[] = []
  if (manifest.schema_version !== 1) errors.push('schema_version deve essere 1')
  if (manifest.mode !== 'ready_campaign') errors.push('mode deve essere ready_campaign')
  if (!['libero', 'presenza', 'crescita'].includes(manifest.package)) {
    errors.push('package deve essere libero, presenza o crescita')
  }
  if (!manifest.campaign_id) errors.push('campaign_id mancante')
  if (!manifest.campaign_cycle_id) errors.push('campaign_cycle_id mancante')
  if (!manifest.brand) errors.push('brand mancante')
  if (!manifest.strategy) errors.push('strategy mancante')
  if (!manifest.audience) errors.push('audience mancante')
  if (manifest.platforms.length !== 2 || !manifest.platforms.includes('instagram') || !manifest.platforms.includes('facebook')) {
    errors.push('platforms deve contenere Instagram e Facebook')
  }
  if (manifest.expected_contents !== manifest.contents.length) {
    errors.push(`expected_contents=${manifest.expected_contents}, ma il manifesto contiene ${manifest.contents.length} contenuti`)
  }
  if (manifest.expected_publications !== manifest.expected_contents * manifest.platforms.length) {
    errors.push('expected_publications deve essere contenuti × piattaforme')
  }
  const mixTotal = Object.values(manifest.mix).reduce((sum, count) => sum + count, 0)
  if (mixTotal !== manifest.expected_contents) errors.push(`Il mix formati somma ${mixTotal}, attesi ${manifest.expected_contents}`)

  const orders = new Set<number>()
  const keys = new Set<string>()
  const ids = new Set<string>()
  const actualMix: Record<ReadyCampaignFormat, number> = { post: 0, carousel: 0, reel: 0, story: 0 }
  manifest.contents.forEach((content, index) => {
    const label = content.source_id || content.content_key || `contenuto ${index + 1}`
    if (content.order < 1 || content.order > manifest.expected_contents) errors.push(`${label}: order fuori intervallo`)
    if (orders.has(content.order)) errors.push(`${label}: order ${content.order} duplicato`)
    orders.add(content.order)
    if (!content.source_id) errors.push(`contenuto ${index + 1}: source_id mancante`)
    if (ids.has(content.source_id)) errors.push(`${label}: source_id duplicato`)
    ids.add(content.source_id)
    if (!CONTENT_KEY.test(content.content_key)) errors.push(`${label}: content_key non valido`)
    if (keys.has(content.content_key)) errors.push(`${label}: content_key duplicato`)
    keys.add(content.content_key)
    if (content.week < 1 || content.week > 4) errors.push(`${label}: week deve essere 1-4`)
    if (!ISO_DATE.test(content.date)) errors.push(`${label}: date deve essere YYYY-MM-DD`)
    if (!FORMAT_SET.has(content.format)) errors.push(`${label}: format non valido`)
    else actualMix[content.format]++
    if (!PHASE_SET.has(content.phase)) errors.push(`${label}: phase non valida`)
    if (!content.objective) errors.push(`${label}: objective mancante`)
    if (!content.intent) errors.push(`${label}: intent mancante`)
    if (!content.visual_brief) errors.push(`${label}: visual_brief mancante`)
    if (content.media_count < 1 || content.media_count > 10) errors.push(`${label}: media_count deve essere 1-10`)
    if (content.format === 'carousel' && content.media_count < 3) errors.push(`${label}: un carosello richiede almeno 3 media`)
    if (content.format === 'reel' || content.format === 'story') {
      if (!content.audio) errors.push(`${label}: scheda audio mancante`)
      else {
        if (!content.audio.title) errors.push(`${label}: titolo audio mancante`)
        if (!content.audio.source_url) errors.push(`${label}: fonte audio mancante`)
        if (!content.audio.license) errors.push(`${label}: licenza audio mancante`)
      }
    }
    manifest.platforms.forEach(platform => {
      const copy = content.copy[platform]
      if (!copy.hook) errors.push(`${label}/${platform}: hook mancante`)
      if (!copy.caption) errors.push(`${label}/${platform}: caption mancante`)
      if (!copy.cta) errors.push(`${label}/${platform}: CTA mancante`)
      if (platform === 'instagram' && copy.hashtags.length > 5) errors.push(`${label}/instagram: massimo 5 hashtag`)
      if (!copy.hashtags.length) warnings.push(`${label}/${platform}: nessun hashtag dichiarato`)
    })
  })
  ;(Object.keys(actualMix) as ReadyCampaignFormat[]).forEach(format => {
    if (actualMix[format] !== manifest.mix[format]) {
      errors.push(`Mix ${format}: ${actualMix[format]} contenuti, attesi ${manifest.mix[format]}`)
    }
  })

  return { ok: errors.length === 0, errors, warnings }
}

function assetKey(asset: ReadyCampaignAsset): string {
  return `${String(asset.platform || '').toLowerCase()}:${String(asset.content_key || '').toLowerCase()}`
}

function assetSequence(asset: ReadyCampaignAsset): number {
  return Number.isInteger(Number(asset.sequence)) ? Number(asset.sequence) : Number.MAX_SAFE_INTEGER
}

export function buildReadyCampaignPublications(
  manifest: ReadyCampaignManifest,
  assets: ReadyCampaignAsset[],
): { publications: ReadyCampaignPublication[]; validation: ReadyCampaignValidation; unusedAssets: number } {
  const manifestValidation = validateReadyCampaignManifest(manifest)
  const errors = [...manifestValidation.errors]
  const warnings = [...manifestValidation.warnings]
  const grouped = new Map<string, ReadyCampaignAsset[]>()
  const groupedAudio = new Map<string, ReadyCampaignAsset[]>()
  const usableAssets = assets.filter(asset => asset.kind !== 'audio' && text(asset.url))
  const usableAudio = assets.filter(asset => asset.kind === 'audio' && text(asset.url))
  usableAssets.forEach(asset => {
    const key = assetKey(asset)
    if (key === ':') return
    const group = grouped.get(key) || []
    group.push(asset)
    grouped.set(key, group)
  })
  grouped.forEach(group => group.sort((left, right) => assetSequence(left) - assetSequence(right) || text(left.name).localeCompare(text(right.name), 'it', { numeric: true })))
  usableAudio.forEach(asset => {
    const key = assetKey(asset)
    if (key === ':') return
    const group = groupedAudio.get(key) || []
    group.push(asset)
    groupedAudio.set(key, group)
  })
  groupedAudio.forEach(group => group.sort((left, right) => text(left.name).localeCompare(text(right.name), 'it', { numeric: true })))

  const usedUrls = new Set<string>()
  const publications: ReadyCampaignPublication[] = []
  const cycleToken = stableToken(manifest.campaign_cycle_id)
  manifest.contents
    .slice()
    .sort((left, right) => left.order - right.order)
    .forEach(content => {
      manifest.platforms.forEach(platform => {
        const key = `${platform}:${content.content_key}`
        const group = grouped.get(key) || []
        const label = `${content.source_id}/${platform}`
        if (group.length !== content.media_count) {
          errors.push(`${label}: ${group.length} media trovati, ${content.media_count} attesi`)
        }
        const audioGroup = groupedAudio.get(key) || []
        const requiresAudio = content.format === 'reel' || content.format === 'story'
        if (requiresAudio && audioGroup.length !== 1) {
          errors.push(`${label}: ${audioGroup.length} audio trovati, 1 atteso`)
        }
        if (!requiresAudio && audioGroup.length) {
          warnings.push(`${label}: audio ignorato per formato ${content.format}`)
        }
        group.forEach(asset => usedUrls.add(asset.url))
        if (requiresAudio) audioGroup.forEach(asset => usedUrls.add(asset.url))
        const copy = content.copy[platform]
        publications.push({
          id_contenuto: `READY_${cycleToken}_${String(content.order).padStart(2, '0')}_${platform === 'instagram' ? 'IG' : 'FB'}`,
          campaign_cycle_id: manifest.campaign_cycle_id,
          campaign_content_key: content.content_key,
          campaign_week: content.week,
          campaign_order: content.order,
          platform,
          date: content.date,
          format: content.format,
          phase: content.phase,
          objective: content.objective,
          hook: copy.hook,
          caption: copy.caption,
          cta: copy.cta,
          hashtags: copy.hashtags.join(' '),
          intent: content.intent,
          visual_brief: content.visual_brief,
          media: group.slice(0, 10),
          audio: requiresAudio ? audioGroup[0] || null : null,
          audio_title: requiresAudio ? content.audio?.title || audioGroup[0]?.name || null : null,
          audio_source_url: requiresAudio ? content.audio?.source_url || null : null,
          audio_license: requiresAudio ? content.audio?.license || null : null,
        })
      })
    })

  if (publications.length !== manifest.expected_publications) {
    errors.push(`Create ${publications.length} pubblicazioni, attese ${manifest.expected_publications}`)
  }
  const unusedAssets = [...usableAssets, ...usableAudio].filter(asset => !usedUrls.has(asset.url)).length
  if (unusedAssets) warnings.push(`${unusedAssets} media caricati non appartengono al manifesto`)
  return {
    publications,
    unusedAssets,
    validation: { ok: errors.length === 0, errors, warnings },
  }
}
