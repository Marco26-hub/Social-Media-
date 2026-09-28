import path from 'path'
import { NextResponse } from 'next/server'
import { requireClienteId } from '@/lib/auth-utils'
import { apiError } from '@/lib/api-error'
import { dbReady, q } from '@/lib/db'
import { getTableColumns, filterExistingColumnPairs } from '@/lib/db-schema'
import { insertCalendarioRow } from '@/lib/calendario-insert'
import { isDemo } from '@/lib/demo'
import { isStorageConfigured, listFromStorage, publicUrlForKey } from '@/lib/storage'
import {
  canonicalAssetContentKey,
  canonicalDbContentKey,
  publicationTime,
  validateReadyCampaign,
  type ReadyCampaignContent,
  type ReadyCampaignManifest,
} from '@/lib/ready-campaign'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const ASSET_NAME = /^(c[0-9a-f]{8})-w(\d+)-(instagram|facebook)-([a-z]+)-(\d+)-([0-9]+|xx)-[0-9a-f]{20}$/
const AUDIO_EXT = new Set(['.mp3', '.wav', '.m4a', '.ogg'])
const VISUAL_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.mp4'])

type Platform = 'instagram' | 'facebook'
type StoredAsset = {
  key: string
  url: string
  campaignKey: string
  week: number
  platform: Platform
  contentKey: string
  sequence: number | null
  kind: 'audio' | 'visual'
  updatedAt: string
}

type ImportBody = {
  manifest?: unknown
  campaign_key?: string
  dry_run?: boolean
  remove_duplicates?: boolean
}

function assetFromStorage(clienteId: string, object: { key: string; updatedAt: string }): StoredAsset | null {
  const filename = object.key.split('/').pop() || ''
  const ext = path.extname(filename).toLowerCase()
  if (!AUDIO_EXT.has(ext) && !VISUAL_EXT.has(ext)) return null
  const match = path.basename(filename, ext).match(ASSET_NAME)
  if (!match) return null
  return {
    key: object.key,
    url: publicUrlForKey(object.key) || `/api/assets/file/${encodeURIComponent(clienteId)}/${encodeURIComponent(filename)}`,
    campaignKey: match[1],
    week: Number(match[2]),
    platform: match[3] as Platform,
    contentKey: canonicalAssetContentKey(`${match[4]}_${match[5]}`),
    sequence: match[6] === 'xx' ? null : Number(match[6]),
    kind: AUDIO_EXT.has(ext) ? 'audio' : 'visual',
    updatedAt: object.updatedAt,
  }
}

function chooseCampaignKey(assets: StoredAsset[], manifest: ReadyCampaignManifest, requested?: string): string {
  if (requested) {
    if (!/^c[0-9a-f]{8}$/.test(requested)) throw new Error('campaign_key non valida.')
    if (!assets.some(asset => asset.campaignKey === requested)) throw new Error(`Nessun media trovato per ${requested}.`)
    return requested
  }
  const expected = new Set(manifest.contents.flatMap(content => (
    (['instagram', 'facebook'] as Platform[]).map(platform => `${content.week}|${platform}|${canonicalAssetContentKey(content.content_key)}`)
  )))
  const groups = new Map<string, { slots: Set<string>; newest: string }>()
  for (const asset of assets) {
    const group = groups.get(asset.campaignKey) || { slots: new Set<string>(), newest: '' }
    if (asset.kind === 'visual') group.slots.add(`${asset.week}|${asset.platform}|${asset.contentKey}`)
    if (asset.updatedAt > group.newest) group.newest = asset.updatedAt
    groups.set(asset.campaignKey, group)
  }
  const ranked = [...groups.entries()].map(([key, value]) => ({
    key,
    matched: [...value.slots].filter(slot => expected.has(slot)).length,
    newest: value.newest,
  })).sort((a, b) => b.matched - a.matched || b.newest.localeCompare(a.newest))
  if (!ranked[0]?.matched) throw new Error('Nessun caricamento compatibile con il manifesto.')
  return ranked[0].key
}

function copyFor(content: ReadyCampaignContent, platform: Platform) {
  const copy = content.copy[platform]
  return {
    hook: String(copy.hook || '').trim(),
    caption: String(copy.caption || '').trim(),
    cta: String(copy.cta || '').trim(),
    hashtag: Array.isArray(copy.hashtags) ? copy.hashtags.map(String).join(' ') : '',
  }
}

function canonicalScore(row: Record<string, unknown>, expectedHook: string): number {
  let score = 0
  if (String(row.obiettivo || '').toLowerCase() !== 'vendita') score += 4
  if (String(row.hook || '').trim() === expectedHook) score += 3
  if (String(row.status || '').toUpperCase() !== 'ARCHIVIATO') score += 2
  if (String(row.id_contenuto || '').startsWith('CMUESNN')) score += 1
  return score
}

async function updateRow(id: string, clienteId: string, values: Record<string, unknown>, columns: Set<string>) {
  const entries = Object.entries(values).filter(([key]) => columns.has(key))
  if (!entries.length) return
  const params: unknown[] = [id, clienteId]
  const fields = entries.map(([key, value]) => {
    params.push(value)
    return `${key} = $${params.length}`
  })
  if (columns.has('updated_at')) fields.push('updated_at = now()')
  await q(`UPDATE calendario SET ${fields.join(', ')} WHERE id = $1 AND cliente_id = $2`, params)
}

export async function POST(request: Request) {
  try {
    const clienteId = await requireClienteId()
    const body = await request.json().catch(() => ({})) as ImportBody
    const validation = validateReadyCampaign(body.manifest)
    if (!validation.manifest) return NextResponse.json({ error: validation.errors.join(' ') }, { status: 400 })
    const manifest = validation.manifest
    const dryRun = body.dry_run !== false

    if (isDemo() || !dbReady()) {
      return NextResponse.json({ ok: true, demo: true, applicato: false, month: manifest.contents[0].date.slice(0, 7) })
    }
    if (!isStorageConfigured()) return NextResponse.json({ error: 'Storage media non configurato.' }, { status: 503 })

    const stored = await listFromStorage(`uploads/${clienteId}/`)
    const assets = stored.map(object => assetFromStorage(clienteId, object)).filter((asset): asset is StoredAsset => Boolean(asset))
    const campaignKey = chooseCampaignKey(assets, manifest, body.campaign_key)
    const campaignAssets = assets.filter(asset => asset.campaignKey === campaignKey)
    const month = manifest.contents[0].date.slice(0, 7)

    const existing = await q(
      `SELECT * FROM calendario
        WHERE cliente_id = $1
          AND campaign_content_key LIKE $2
        ORDER BY id_contenuto`,
      [clienteId, `${campaignKey}__%`],
    ) as Record<string, unknown>[]

    const locked = existing.filter(row =>
      Boolean(row.blotato_post_id || row.publish_lock_id)
      || ['scheduled', 'published'].includes(String(row.blotato_status || '').toLowerCase()),
    )
    if (locked.length) {
      return NextResponse.json({
        error: `Ripristino bloccato: ${locked.length} contenuti del ciclo ${campaignKey} risultano già inviati o protetti da Blotato.`,
        locked: locked.map(row => row.id_contenuto),
      }, { status: 409 })
    }

    const slots = manifest.contents.flatMap(content => (['instagram', 'facebook'] as Platform[]).map(platform => {
      const dbContentKey = canonicalDbContentKey(content.content_key)
      const campaignContentKey = `${campaignKey}__${dbContentKey}`
      const copy = copyFor(content, platform)
      const matchingAssets = campaignAssets.filter(asset =>
        asset.week === content.week && asset.platform === platform && asset.contentKey === canonicalAssetContentKey(content.content_key),
      )
      const visuals = matchingAssets.filter(asset => asset.kind === 'visual').sort((a, b) =>
        (a.sequence ?? Number.MAX_SAFE_INTEGER) - (b.sequence ?? Number.MAX_SAFE_INTEGER) || a.key.localeCompare(b.key),
      )
      const audio = matchingAssets.filter(asset => asset.kind === 'audio').sort((a, b) => a.key.localeCompare(b.key))
      const candidates = existing.filter(row =>
        String(row.campaign_content_key || '') === campaignContentKey && String(row.canale || '').toLowerCase() === platform,
      ).sort((a, b) => canonicalScore(b, copy.hook) - canonicalScore(a, copy.hook))
      return { content, platform, copy, campaignContentKey, visuals, audio, canonical: candidates[0], duplicates: candidates.slice(1) }
    }))

    const problems: string[] = []
    for (const slot of slots) {
      const expected = Math.max(1, Math.min(Number(slot.content.media_count || 1), 10))
      if (slot.visuals.length < expected) problems.push(`${slot.platform}/${slot.content.content_key}: ${slot.visuals.length}/${expected} media`)
      if (/^(reel|story)$/.test(slot.content.format) && slot.audio.length !== 1) {
        problems.push(`${slot.platform}/${slot.content.content_key}: servono 1 audio, trovati ${slot.audio.length}`)
      }
    }
    const duplicateRows = slots.flatMap(slot => slot.duplicates)
    const summary = {
      ok: problems.length === 0,
      applicato: !dryRun,
      campaign_cycle_id: manifest.campaign_cycle_id,
      campaign_key: campaignKey,
      month,
      concepts: manifest.contents.length,
      publications: slots.length,
      to_update: slots.filter(slot => slot.canonical).length,
      to_insert: slots.filter(slot => !slot.canonical).length,
      duplicates: duplicateRows.length,
      duplicate_ids: duplicateRows.map(row => row.id_contenuto),
      protected_other_cycles: 0,
      problems,
      dates: manifest.contents.map(content => ({ order: content.order, content_key: content.content_key, date: content.date })),
    }
    if (dryRun || problems.length) {
      return NextResponse.json(summary, { status: problems.length ? 422 : 200 })
    }

    const columns = await getTableColumns('calendario')
    for (const slot of slots) {
      const media = slot.visuals.slice(0, 10).map(asset => asset.url)
      const values: Record<string, unknown> = {
        data_pubblicazione: slot.content.date,
        ora_pubblicazione: slot.canonical?.ora_pubblicazione || publicationTime(slot.platform, slot.content.format),
        canale: slot.platform,
        formato: slot.content.format === 'carousel' ? 'carousel' : slot.content.format,
        obiettivo: 'mix',
        tema: slot.content.intent || slot.content.objective || null,
        hook: slot.copy.hook,
        caption: slot.copy.caption,
        caption_long: slot.copy.caption,
        hashtag: slot.copy.hashtag,
        cta: slot.copy.cta,
        status: 'DA_APPROVARE',
        note: null,
        errore: null,
        errore_tecnico: null,
        quality_level: 'high',
        funnel_stage: slot.content.phase || null,
        angle: slot.content.intent || null,
        primary_message: slot.copy.hook,
        creative_brief: slot.content.visual_brief || null,
        production_notes: `[READY_CAMPAIGN] ${manifest.campaign_cycle_id} · ordine ${slot.content.order}`,
        campaign_content_key: slot.campaignContentKey,
        campaign_week: slot.content.week,
        campaign_source_paths: JSON.stringify(slot.visuals.slice(0, 10).map(asset => asset.key)),
        strategy_profile: 'swa-crescita-high',
        reel_audio_url: slot.audio[0]?.url || null,
        reel_audio_title: slot.content.audio?.title || null,
        reel_audio_source_url: slot.content.audio?.source_url || null,
        reel_audio_license: slot.content.audio?.license || null,
      }
      for (let index = 0; index < 10; index++) values[`link_media_${index + 1}`] = media[index] || null

      if (slot.canonical) {
        await updateRow(String(slot.canonical.id), clienteId, values, columns)
      } else {
        const idContenuto = `CR${Date.now().toString(36).toUpperCase()}_${slot.content.order}_${slot.platform === 'instagram' ? 'IG' : 'FB'}`
        const entries = Object.entries({ cliente_id: clienteId, id_contenuto: idContenuto, ...values })
        const filtered = filterExistingColumnPairs(entries.map(([key]) => key), entries.map(([, value]) => value), columns)
        await insertCalendarioRow(filtered.columns, filtered.values)
      }
    }

    let removedDuplicates = 0
    if (body.remove_duplicates && duplicateRows.length) {
      const ids = duplicateRows.map(row => String(row.id)).filter(Boolean)
      const removed = await q('DELETE FROM calendario WHERE cliente_id = $1 AND id = ANY($2::uuid[]) AND blotato_post_id IS NULL AND publish_lock_id IS NULL RETURNING id', [clienteId, ids])
      removedDuplicates = removed.length
    }

    return NextResponse.json({ ...summary, applicato: true, removed_duplicates: removedDuplicates })
  } catch (error) {
    return apiError(error)
  }
}
