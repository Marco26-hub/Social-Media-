import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { requireAdmin, requireClienteAccess } from '@/lib/auth-utils'
import { dbReady, withTransaction, type TransactionQuery } from '@/lib/db'
import { filterExistingColumnPairs, getTableColumns } from '@/lib/db-schema'
import { isDemo } from '@/lib/demo'
import {
  buildReadyCampaignPublications,
  parseReadyCampaignManifest,
  type ReadyCampaignAsset,
  type ReadyCampaignPublication,
} from '@/lib/ready-campaign'
import { inspectNonLiveCalendar } from '@/lib/calendar-cleanup'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const NON_LIVE_STATUSES = [
  'BOZZA', 'IDEA', 'DA_APPROVARE', 'APPROVATO', 'ERRORE',
  'ERRORE_MANUALE', 'DRY_RUN_OK', 'NON_APPROVATO',
]

function cleanAsset(value: unknown): ReadyCampaignAsset | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const url = typeof raw.url === 'string' ? raw.url.trim() : ''
  if (!url) return null
  return {
    url,
    name: typeof raw.name === 'string' ? raw.name : undefined,
    kind: raw.kind === 'video' || raw.kind === 'audio' ? raw.kind : 'image',
    tag: typeof raw.tag === 'string' ? raw.tag as ReadyCampaignAsset['tag'] : undefined,
    campaign_key: typeof raw.campaign_key === 'string' ? raw.campaign_key : undefined,
    relative_path: typeof raw.relative_path === 'string' ? raw.relative_path : undefined,
    week: raw.week !== null && raw.week !== undefined && Number.isInteger(Number(raw.week)) ? Number(raw.week) : null,
    platform: raw.platform === 'instagram' || raw.platform === 'facebook' ? raw.platform : null,
    content_key: typeof raw.content_key === 'string' ? raw.content_key.toLowerCase() : null,
    sequence: raw.sequence !== null && raw.sequence !== undefined && Number.isInteger(Number(raw.sequence)) ? Number(raw.sequence) : null,
  }
}

function deletionGuards(columns: Set<string>): string[] {
  const guards = ['cliente_id = $1', 'status = ANY($2::text[])']
  if (columns.has('blotato_post_id')) guards.push(`(blotato_post_id IS NULL OR btrim(blotato_post_id) = '')`)
  if (columns.has('blotato_status')) guards.push(`(blotato_status IS NULL OR LOWER(blotato_status) NOT IN ('scheduled', 'published', 'in-progress'))`)
  if (columns.has('publish_lock_id')) guards.push(`(publish_lock_id IS NULL OR btrim(publish_lock_id) = '')`)
  return guards
}

function publicationRow(
  clienteId: string,
  publication: ReadyCampaignPublication,
  expectedContents: number,
  expectedPublications: number,
  expectedMix: Record<string, number>,
): { columns: string[]; values: unknown[] } {
  const media = Array.from({ length: 10 }, (_, index) => publication.media[index]?.url || null)
  const sourcePaths = publication.media.map(asset => asset.relative_path || asset.name || '').filter(Boolean)
  const columns = [
    'cliente_id', 'id_contenuto', 'data_pubblicazione', 'ora_pubblicazione',
    'canale', 'formato', 'obiettivo', 'tema', 'hook', 'caption', 'hashtag', 'cta',
    'status', 'note', 'media_validato', 'checked_copy', 'checked_media',
    'link_media_1', 'link_media_2', 'link_media_3', 'link_media_4', 'link_media_5',
    'link_media_6', 'link_media_7', 'link_media_8', 'link_media_9', 'link_media_10',
    'quality_level', 'audience_segment', 'funnel_stage', 'angle', 'primary_message',
    'idea_visual', 'creative_brief', 'production_notes', 'expected_outcome',
    'production_cycle_stage', 'content_checklist',
    'campaign_content_key', 'campaign_week', 'campaign_source_paths',
    'campaign_cycle_id', 'campaign_mode', 'campaign_order',
    'campaign_expected_contents', 'campaign_expected_publications', 'campaign_expected_mix',
  ]
  const values = [
    clienteId,
    publication.id_contenuto,
    publication.date,
    publication.platform === 'instagram' ? '19:30' : '20:30',
    publication.platform,
    publication.format,
    publication.objective,
    publication.intent,
    publication.hook,
    publication.caption,
    publication.hashtags || null,
    publication.cta,
    'DA_APPROVARE',
    '[READY_CAMPAIGN] Import esatto dal piano approvato; nessun contenuto inviato a Blotato.',
    'SI',
    'SI',
    'SI',
    ...media,
    'high',
    'PMI e professionisti italiani',
    publication.phase,
    publication.intent,
    publication.hook,
    publication.visual_brief,
    publication.visual_brief,
    'READY_CAMPAIGN: copy, CTA e media bloccati dal manifesto approvato. Nessuna generazione AI.',
    publication.objective,
    'review',
    JSON.stringify(['hook presente', 'caption presente', 'CTA presente', 'media completi', 'approvazione umana richiesta']),
    publication.campaign_content_key,
    publication.campaign_week,
    JSON.stringify(sourcePaths),
    publication.campaign_cycle_id,
    'ready_free',
    publication.campaign_order,
    expectedContents,
    expectedPublications,
    JSON.stringify(expectedMix),
  ]
  return { columns, values }
}

async function insertRow(
  tx: TransactionQuery,
  calendarColumns: Set<string>,
  row: { columns: string[]; values: unknown[] },
): Promise<void> {
  const filtered = filterExistingColumnPairs(row.columns, row.values, calendarColumns)
  if (filtered.skipped.some(column => column.startsWith('campaign_'))) {
    throw new Error(`Schema non aggiornato: esegui le migrazioni (mancano ${filtered.skipped.filter(column => column.startsWith('campaign_')).join(', ')})`)
  }
  await tx(
    `INSERT INTO calendario (${filtered.columns.join(', ')}) VALUES (${filtered.columns.map((_, index) => `$${index + 1}`).join(', ')})`,
    filtered.values,
  )
}

async function archiveRows(
  tx: TransactionQuery,
  rows: Record<string, unknown>[],
  calendarColumns: Set<string>,
  historyColumns: Set<string>,
): Promise<number> {
  const wanted = [
    'cliente_id', 'id_contenuto', 'hook', 'tema', 'angle', 'primary_message',
    'idea_visual', 'template_style', 'production_notes', 'formato', 'canale',
    'data_pubblicazione', 'blotato_post_id',
  ]
  const columns = wanted.filter(column => historyColumns.has(column)
    && (column === 'cliente_id' || column === 'id_contenuto' || calendarColumns.has(column)))
  if (!columns.includes('cliente_id') || !columns.includes('id_contenuto')) return 0
  let archived = 0
  for (const row of rows) {
    const result = await tx(
      `INSERT INTO contenuti_storico (${columns.join(', ')})
       VALUES (${columns.map((_, index) => `$${index + 1}`).join(', ')})
       ON CONFLICT (cliente_id, id_contenuto) WHERE id_contenuto IS NOT NULL DO NOTHING
       RETURNING id`,
      columns.map(column => row[column] ?? null),
    )
    archived += result.length
  }
  return archived
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json().catch(() => ({})) as Record<string, unknown>
    const clienteId = typeof body.cliente_id === 'string' ? body.cliente_id : ''
    if (!clienteId) return NextResponse.json({ error: 'cliente_id richiesto' }, { status: 400 })
    await requireClienteAccess(clienteId)
    if (isDemo() || !dbReady()) return NextResponse.json({ error: 'Import non disponibile in modalità demo' }, { status: 503 })

    const manifest = parseReadyCampaignManifest(body.manifest)
    const assets = Array.isArray(body.uploaded_assets)
      ? body.uploaded_assets.map(cleanAsset).filter((asset): asset is ReadyCampaignAsset => Boolean(asset))
      : []
    const built = buildReadyCampaignPublications(manifest, assets)
    if (!built.validation.ok) {
      return NextResponse.json({
        error: 'Campagna non importabile: correggi il manifesto o i media mancanti.',
        validation: built.validation,
      }, { status: 422 })
    }

    const cleanup = await inspectNonLiveCalendar(clienteId)
    if (body.dry_run !== false) {
      return NextResponse.json({
        ok: true,
        dry_run: true,
        campaign: manifest.campaign_cycle_id,
        concepts: manifest.expected_contents,
        publications: built.publications.length,
        assets: assets.filter(asset => asset.kind !== 'audio').length,
        replaceable: cleanup.contenuti,
        preserved_live: true,
        validation: built.validation,
        note: 'Simulazione completata: nessun dato è stato modificato e nulla è stato inviato a Blotato.',
      })
    }

    const calendarColumns = await getTableColumns('calendario')
    const historyColumns = await getTableColumns('contenuti_storico')
    const guards = deletionGuards(calendarColumns)
    const publicationMix = {
      post: manifest.mix.post * manifest.platforms.length,
      carousel: manifest.mix.carousel * manifest.platforms.length,
      reel: manifest.mix.reel * manifest.platforms.length,
      story: manifest.mix.story * manifest.platforms.length,
    }

    const applied = await withTransaction(async tx => {
      // Serializza qualunque sostituzione contemporanea per lo stesso cliente.
      await tx('SELECT id FROM clienti WHERE id = $1 FOR UPDATE', [clienteId])
      const oldRows = await tx<Record<string, unknown>>(
        `SELECT * FROM calendario WHERE ${guards.join(' AND ')} FOR UPDATE`,
        [clienteId, NON_LIVE_STATUSES],
      )
      const archived = await archiveRows(tx, oldRows, calendarColumns, historyColumns)
      const oldContentIds = oldRows.map(row => row.id_contenuto).filter((value): value is string => typeof value === 'string' && Boolean(value))
      if (oldContentIds.length) {
        await tx('DELETE FROM approval_tokens WHERE cliente_id = $1 AND contenuto_id = ANY($2::text[])', [clienteId, oldContentIds])
      }
      if (oldRows.length) {
        await tx('DELETE FROM calendario WHERE id = ANY($1::uuid[])', [oldRows.map(row => String(row.id))])
      }

      for (const publication of built.publications) {
        await insertRow(tx, calendarColumns, publicationRow(
          clienteId,
          publication,
          manifest.expected_contents,
          manifest.expected_publications,
          publicationMix,
        ))
      }

      await tx(
        `UPDATE clienti SET pacchetto = 'libero', contenuti_mese = $2, updated_at = now() WHERE id = $1`,
        [clienteId, manifest.expected_contents],
      )
      await tx(
        `INSERT INTO log_pubblicazioni
          (cliente_id, id_contenuto, canale, formato, status_precedente, status_finale, messaggio)
         VALUES ($1, $2, NULL, NULL, NULL, 'DA_APPROVARE', $3)`,
        [clienteId, `READY:${manifest.campaign_cycle_id}`, `Import campagna pronta: ${built.publications.length} pubblicazioni; sostituite ${oldRows.length} bozze non inviate. Nessun invio a Blotato.`],
      )
      return { removed: oldRows.length, archived }
    })

    return NextResponse.json({
      ok: true,
      dry_run: false,
      campaign: manifest.campaign_cycle_id,
      package: 'libero',
      quota: manifest.expected_contents,
      concepts: manifest.expected_contents,
      publications: built.publications.length,
      removed: applied.removed,
      archived: applied.archived,
      blotato_sent: 0,
      validation: built.validation,
      note: 'Piano importato in stato Da approvare. Nessun contenuto è stato inviato a Blotato.',
    })
  } catch (error) {
    return apiError(error)
  }
}
