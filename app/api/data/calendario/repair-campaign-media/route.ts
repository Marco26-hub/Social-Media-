import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { requireAuth, requireClienteId } from '@/lib/auth-utils'
import { dbReady, q } from '@/lib/db'
import { getTableColumns, mediaSlotColumns } from '@/lib/db-schema'
import { buildRepairGroups, matchRepairRows, placementFromStoredValue, type RepairAsset, type RepairRow } from '@/lib/campaign-media-repair'
import { isDemo } from '@/lib/demo'

const MAX_ASSETS = 180
const BATCH_WINDOW_MS = 6 * 60 * 60 * 1000

function createdAt(row: RepairRow): number {
  const value = row.created_at instanceof Date ? row.created_at.getTime() : Date.parse(String(row.created_at || ''))
  return Number.isFinite(value) ? value : 0
}

function rowHasKnownPlacement(row: RepairRow): boolean {
  if (row.campaign_content_key && row.campaign_week) return true
  return Boolean(placementFromStoredValue(Array.from({ length: 10 }, (_, index) => row[`link_media_${index + 1}`])))
}

function jsonValue(value: unknown): string {
  return JSON.stringify(value)
}

export async function POST(request: Request) {
  try {
    await requireAuth()
    const body = await request.json() as { assets?: RepairAsset[]; confirm?: boolean }
    const assets = Array.isArray(body.assets) ? body.assets.slice(0, MAX_ASSETS) : []
    const groups = buildRepairGroups(assets)
    if (!groups.length) return NextResponse.json({ error: 'Nessun gruppo campagna valido da riallineare' }, { status: 400 })

    if (isDemo() || !dbReady()) {
      return NextResponse.json({ ok: true, demo: true, groups: groups.length, matched: 0, updated: 0, locked: 0, unmatched: groups.length })
    }

    const cid = await requireClienteId()
    const rows = await q(
      `SELECT * FROM calendario
       WHERE cliente_id = $1
         AND canale IN ('instagram', 'facebook')
         AND data_pubblicazione BETWEEN CURRENT_DATE - INTERVAL '120 days' AND CURRENT_DATE + INTERVAL '240 days'
       ORDER BY created_at DESC, data_pubblicazione ASC, ora_pubblicazione ASC
       LIMIT 500`,
      [cid],
    ) as RepairRow[]

    // L'URL canonico di almeno una foto identifica il batch di generazione.
    // Limitiamo l'inferenza cronologica alle card create nello stesso blocco.
    const anchorRows = rows.filter(row => rowHasKnownPlacement(row))
    const anchorTime = anchorRows.reduce((latest, row) => Math.max(latest, createdAt(row)), 0)
    const batchRows = anchorTime
      ? rows.filter(row => Math.abs(createdAt(row) - anchorTime) <= BATCH_WINDOW_MS)
      : rows.filter(row => row.campaign_content_key && row.campaign_week)
    const matches = matchRepairRows(batchRows, groups)
    const locked = matches.filter(match => match.locked)
    const editable = matches.filter(match => !match.locked)
    const matchedGroupKeys = new Set(matches.map(match => match.group.key))
    const unmatchedGroups = groups.filter(group => !matchedGroupKeys.has(group.key))

    const summary = {
      ok: true,
      groups: groups.length,
      matched: matches.length,
      editable: editable.length,
      locked: locked.length,
      unmatched: unmatchedGroups.length,
      exact: matches.filter(match => match.method !== 'sequence').length,
      inferred: matches.filter(match => match.method === 'sequence').length,
      locked_items: locked.map(match => ({ id: match.row.id, content_key: match.group.contentKey, platform: match.group.platform })),
      unmatched_groups: unmatchedGroups.map(group => ({ content_key: group.contentKey, platform: group.platform, week: group.week, media: group.assets.length })),
    }
    if (!body.confirm) return NextResponse.json({ ...summary, updated: 0, preview: true })

    const columns = await getTableColumns('calendario')
    const slots = mediaSlotColumns(10).filter(column => columns.has(column))
    let updated = 0
    for (const match of editable) {
      const urls = match.group.assets.map(asset => asset.url).slice(0, slots.length)
      const sets: string[] = []
      const params: unknown[] = [match.row.id, cid]
      const setValue = (column: string, value: unknown) => {
        if (!columns.has(column)) return
        params.push(value)
        sets.push(`${column} = $${params.length}`)
      }
      slots.forEach((column, index) => setValue(column, urls[index] || null))
      setValue('thumbnail_url', urls[0] || null)
      setValue('campaign_content_key', match.group.contentKey)
      setValue('campaign_week', match.group.week)
      setValue('campaign_source_paths', jsonValue(match.group.assets.map(asset => asset.relative_path).filter(Boolean)))
      setValue('media_validato', 'NO')
      setValue('checked_media', 'NO')
      setValue('checked_media_valid', 'NO')
      setValue('blotato_visual_id', null)
      setValue('blotato_visual_status', null)
      setValue('blotato_visual_media_url', null)
      setValue('blotato_visual_source_hash', null)
      setValue('blotato_audio_visual_id', null)
      setValue('blotato_audio_visual_status', null)
      setValue('blotato_audio_visual_media_url', null)
      if (columns.has('updated_at')) sets.push('updated_at = now()')
      if (!sets.length) continue
      await q(`UPDATE calendario SET ${sets.join(', ')} WHERE id = $1 AND cliente_id = $2`, params)
      updated++
    }

    return NextResponse.json({ ...summary, updated, preview: false })
  } catch (error) {
    return apiError(error)
  }
}
