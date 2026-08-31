import type { MediaTag } from '@/lib/media-requirements'

export type CampaignPlatform = 'instagram' | 'facebook'

export type CampaignFolderAsset = {
  relativePath: string
  week: number | null
  platform: CampaignPlatform | null
  tag: MediaTag
  contentKey: string | null
  sequence: number | null
  kind: 'image' | 'video' | 'audio' | 'unsupported'
  errors: string[]
}

export type CampaignFolderFile = {
  name: string
  relativePath?: string
  type?: string
}

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'])
const VIDEO_EXTENSIONS = new Set(['mp4'])
const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'm4a', 'ogg'])

function normalized(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function extension(name: string): string {
  return name.toLowerCase().split('.').pop() || ''
}

function inferKind(file: CampaignFolderFile): CampaignFolderAsset['kind'] {
  const mime = String(file.type || '').toLowerCase()
  const ext = extension(file.name)
  if (mime.startsWith('image/') || IMAGE_EXTENSIONS.has(ext)) return 'image'
  if (mime === 'video/mp4' || VIDEO_EXTENSIONS.has(ext)) return 'video'
  if (mime.startsWith('audio/') || AUDIO_EXTENSIONS.has(ext)) return 'audio'
  return 'unsupported'
}

function inferWeek(path: string): number | null {
  const text = normalized(path)
  const direct = /\b(?:settimana|sett|week|w)\s*0?([1-5])\b/.exec(text)
  const reversed = /\b0?([1-5])\s*(?:settimana|sett|week)\b/.exec(text)
  const phase = /\b0?([1-4])\s*(?:attenzione|fiducia|scelta|azione)\b/.exec(text)
  const value = Number(direct?.[1] || reversed?.[1] || phase?.[1] || 0)
  return value >= 1 && value <= 5 ? value : null
}

function inferPlatform(path: string): CampaignPlatform | null {
  const text = ` ${normalized(path)} `
  if (/\b(instagram|insta|ig)\b/.test(text)) return 'instagram'
  if (/\b(facebook|fb|fcb)\b/.test(text)) return 'facebook'
  return null
}

function inferTag(path: string): MediaTag {
  const text = normalized(path)
  const segments = path.split('/').map(normalized).filter(Boolean)
  const explicitFormat = segments.find(segment =>
    /^(?:reel|reels|video|short|shorts)\s*0?\d+\b/.test(segment)
    || /^(?:story|stories|storia|storie)\s*0?\d+\b/.test(segment)
    || /^(?:carousel|carosello|caroselli)\s*0?\d+\b/.test(segment)
    || /^(?:post|feed|pin)\s*0?\d+\b/.test(segment),
  )
  if (explicitFormat) {
    if (/^(?:reel|reels|video|short|shorts)\s*0?\d+\b/.test(explicitFormat)) return 'reel'
    if (/^(?:story|stories|storia|storie)\s*0?\d+\b/.test(explicitFormat)) return 'story'
    if (/^(?:carousel|carosello|caroselli)\s*0?\d+\b/.test(explicitFormat)) return 'carosello'
    if (/^(?:post|feed|pin)\s*0?\d+\b/.test(explicitFormat)) return 'post'
  }
  if (/\b(reel|reels|video|short|shorts)\b/.test(text)) return 'reel'
  if (/\b(story|stories|storia|storie)\b/.test(text)) return 'story'
  if (/\b(carousel|carosello|caroselli)\b/.test(text)) return 'carosello'
  if (/\b(post|feed|pin)\b/.test(text)) return 'post'
  return 'auto'
}

function tagPattern(tag: MediaTag): string {
  if (tag === 'reel') return '(?:reel|reels|video|short|shorts)'
  if (tag === 'story') return '(?:story|stories|storia|storie)'
  if (tag === 'carosello') return '(?:carousel|carosello|caroselli)'
  if (tag === 'post') return '(?:post|feed|pin)'
  return ''
}

function inferContentKey(path: string, tag: MediaTag): string | null {
  if (tag === 'auto') return null
  const segments = path.split('/').map(normalized).filter(Boolean)
  const pattern = new RegExp(`\\b${tagPattern(tag)}\\s*0?(\\d{1,2})\\b`)
  for (const segment of segments) {
    const match = pattern.exec(segment)
    if (match) return `${tag}_${String(Number(match[1])).padStart(2, '0')}`
  }

  const formatIndex = segments.findIndex(segment => new RegExp(`\\b${tagPattern(tag)}\\b`).test(segment))
  const following = formatIndex >= 0 ? segments[formatIndex + 1] : ''
  const numericFolder = /^0?(\d{1,2})$/.exec(following)
  return numericFolder ? `${tag}_${String(Number(numericFolder[1])).padStart(2, '0')}` : null
}

function inferSequence(filename: string): number | null {
  const text = normalized(filename.replace(/\.[a-z0-9]+$/i, ''))
  if (/\bcover\b/.test(text)) return 0
  const explicit = /\b(?:slide|frame|foto|img|image|scena|scene)\s*0?(\d{1,2})\b/.exec(text)
  if (explicit) return Number(explicit[1])
  const trailing = /\b0?(\d{1,2})$/.exec(text)
  return trailing ? Number(trailing[1]) : null
}

function isLooseAudio(relativePath: string, kind: CampaignFolderAsset['kind']): boolean {
  if (kind !== 'audio') return false
  const segments = relativePath.split('/').map(normalized).filter(Boolean)
  if (segments.length < 2 || segments.at(-2) !== 'audio') return false

  // An audio folder directly under the strategy root is a source library,
  // not an editorial assignment. Audio inside a Reel/Story folder is valid.
  return !segments.slice(0, -2).some(segment =>
    /\b(?:reel|reels|video|short|shorts|story|stories|storia|storie)\b/.test(segment),
  )
}

export function parseCampaignFolderFile(file: CampaignFolderFile): CampaignFolderAsset {
  const relativePath = String(file.relativePath || file.name).replace(/^\/+/, '')
  const kind = inferKind(file)
  if (isLooseAudio(relativePath, kind)) {
    return {
      relativePath,
      week: null,
      platform: null,
      tag: 'auto',
      contentKey: null,
      sequence: null,
      kind: 'unsupported',
      errors: [],
    }
  }
  const week = inferWeek(relativePath)
  const platform = inferPlatform(relativePath)
  const tag = inferTag(relativePath)
  const contentKey = inferContentKey(relativePath, tag)
  const sequence = inferSequence(file.name)
  const errors: string[] = []

  if (kind === 'unsupported') return { relativePath, week, platform, tag, contentKey, sequence, kind, errors }
  if (!week) errors.push('settimana non riconosciuta')
  if (!platform) errors.push('social non riconosciuto (Instagram/Facebook)')
  if (tag === 'auto') errors.push('formato non riconosciuto')
  if (!contentKey) errors.push('cartella contenuto non riconosciuta (es. Reel 01)')
  if (kind === 'video' && tag !== 'reel') errors.push('MP4 consentito solo nella cartella Reel/Video')

  return { relativePath, week, platform, tag, contentKey, sequence, kind, errors }
}

export function folderGroupKey(asset: Pick<CampaignFolderAsset, 'week' | 'platform' | 'tag' | 'contentKey'>): string {
  return [asset.week || 0, asset.platform || 'senza-social', asset.tag, asset.contentKey || 'senza-contenuto'].join(':')
}

type CampaignFolderGroupOrder = {
  week: number | null
  platform: string | null
  tag: MediaTag
  contentKey: string | null
}

function contentNumber(contentKey: string | null): number {
  const match = String(contentKey || '').match(/(\d+)(?!.*\d)/)
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER
}

/** Ordina i contenuti secondo la sequenza editoriale, indipendentemente dal formato. */
export function compareCampaignFolderGroups(left: CampaignFolderGroupOrder, right: CampaignFolderGroupOrder): number {
  return (left.week || 0) - (right.week || 0)
    || String(left.platform || '').localeCompare(String(right.platform || ''), 'it')
    || contentNumber(left.contentKey) - contentNumber(right.contentKey)
    || left.tag.localeCompare(right.tag, 'it')
    || String(left.contentKey || '').localeCompare(String(right.contentKey || ''), 'it', { numeric: true })
}
