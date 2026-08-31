import { q } from '@/lib/db'
import { getTableColumns } from '@/lib/db-schema'
import { bytesToMb } from '@/lib/storage-quota'
import { listFromStorage, storageKeyFromUrl } from '@/lib/storage'

// Sono contenuti ancora locali e non inviati. PUBBLICATO e qualunque record con
// riferimento Blotato restano sempre fuori: la pulizia non deve mai cancellare
// una pubblicazione reale o una sincronizzazione in corso.
const NON_LIVE_STATUSES = [
  'BOZZA',
  'IDEA',
  'DA_APPROVARE',
  'APPROVATO',
  'ERRORE',
  'ERRORE_MANUALE',
  'DRY_RUN_OK',
  'NON_APPROVATO',
]

const MEDIA_COLUMNS = [
  ...Array.from({ length: 10 }, (_, index) => `link_media_${index + 1}`),
  'reel_audio_url',
  'blotato_visual_media_url',
  'blotato_audio_visual_media_url',
]

const HISTORY_FIELDS = [
  'hook',
  'tema',
  'angle',
  'primary_message',
  'idea_visual',
  'template_style',
  'production_notes',
  'formato',
  'canale',
  'data_pubblicazione',
] as const

export type NonLiveCalendarSummary = {
  contenuti: number
  perStato: Record<string, number>
  mediaCollegati: number
  bytesMedia: number
  mbMedia: number
  ids: string[]
}

function queryGuards(columns: Set<string>): string[] {
  const guards = [
    'cliente_id = $1',
    `status = ANY($2::text[])`,
  ]
  if (columns.has('blotato_post_id')) {
    guards.push(`(blotato_post_id IS NULL OR btrim(blotato_post_id) = '')`)
  }
  if (columns.has('blotato_status')) {
    guards.push(`(blotato_status IS NULL OR LOWER(blotato_status) NOT IN ('scheduled', 'published', 'in-progress'))`)
  }
  if (columns.has('publish_lock_id')) {
    guards.push(`(publish_lock_id IS NULL OR btrim(publish_lock_id) = '')`)
  }
  return guards
}

async function candidateRows(clienteId: string): Promise<Record<string, unknown>[]> {
  const columns = await getTableColumns('calendario')
  return await q(
    `SELECT * FROM calendario WHERE ${queryGuards(columns).join(' AND ')} ORDER BY data_pubblicazione ASC, ora_pubblicazione ASC`,
    [clienteId, NON_LIVE_STATUSES],
  ) as Record<string, unknown>[]
}

function mediaFromRows(rows: Record<string, unknown>[], columns: Set<string>): string[] {
  const activeColumns = MEDIA_COLUMNS.filter(column => columns.has(column))
  return [...new Set(rows.flatMap(row => activeColumns
    .map(column => row[column])
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map(value => value.trim())))]
}

export async function inspectNonLiveCalendar(clienteId: string): Promise<NonLiveCalendarSummary> {
  const columns = await getTableColumns('calendario')
  const rows = await q(
    `SELECT * FROM calendario WHERE ${queryGuards(columns).join(' AND ')} ORDER BY data_pubblicazione ASC, ora_pubblicazione ASC`,
    [clienteId, NON_LIVE_STATUSES],
  ) as Record<string, unknown>[]
  const perStato: Record<string, number> = {}
  rows.forEach(row => {
    const status = String(row.status || 'SCONOSCIUTO')
    perStato[status] = (perStato[status] || 0) + 1
  })
  const media = mediaFromRows(rows, columns)
  const objects = await listFromStorage(`uploads/${clienteId}/`)
  const bytesByKey = new Map(objects.map(object => [object.key, object.size || 0]))
  const bytesMedia = media.reduce((total, url) => {
    const key = storageKeyFromUrl(url)
    return total + (key ? (bytesByKey.get(key) || 0) : 0)
  }, 0)

  return {
    contenuti: rows.length,
    perStato,
    mediaCollegati: media.length,
    bytesMedia,
    mbMedia: bytesToMb(bytesMedia),
    ids: rows.map(row => String(row.id)),
  }
}

export type NonLiveCalendarDeletion = NonLiveCalendarSummary & {
  eliminati: number
  impronteArchiviate: number
  mediaCandidati: string[]
}

async function archiveCreativeFootprints(rows: Record<string, unknown>[], calendarioColumns: Set<string>): Promise<number> {
  if (!rows.length) return 0
  const storicoColumns = await getTableColumns('contenuti_storico')
  if (!storicoColumns.has('cliente_id') || !storicoColumns.has('id_contenuto')) return 0

  const fields = ['cliente_id', 'id_contenuto', ...HISTORY_FIELDS]
    .filter(field => storicoColumns.has(field) && (field === 'cliente_id' || field === 'id_contenuto' || calendarioColumns.has(field)))
  if (storicoColumns.has('post_url')) fields.push('post_url')
  if (storicoColumns.has('blotato_post_id')) fields.push('blotato_post_id')

  let archived = 0
  for (const row of rows) {
    const values = fields.map(field => {
      if (field === 'cliente_id') return row.cliente_id ?? null
      if (field === 'post_url') return row.blotato_post_url ?? row.post_url ?? null
      return row[field] ?? null
    })
    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ')
    const inserted = await q(
      `INSERT INTO contenuti_storico (${fields.join(', ')}) VALUES (${placeholders})
       ON CONFLICT (cliente_id, id_contenuto) WHERE id_contenuto IS NOT NULL DO NOTHING
       RETURNING id`,
      values,
    )
    archived += inserted.length
  }
  return archived
}

export async function deleteNonLiveCalendar(clienteId: string): Promise<NonLiveCalendarDeletion> {
  const columns = await getTableColumns('calendario')
  const rows = await candidateRows(clienteId)
  const mediaCandidati = mediaFromRows(rows, columns)
  if (!rows.length) {
    return {
      contenuti: 0,
      perStato: {},
      mediaCollegati: mediaCandidati.length,
      bytesMedia: 0,
      mbMedia: 0,
      ids: [],
      eliminati: 0,
      impronteArchiviate: 0,
      mediaCandidati,
    }
  }

  const ids = rows.map(row => String(row.id))
  // Il calendario viene svuotato, ma hook/temi restano nello storico per non
  // farli riproporre alla prossima campagna dello stesso cliente.
  const impronteArchiviate = await archiveCreativeFootprints(rows, columns)
  const contentIds = rows.map(row => row.id_contenuto).filter((value): value is string => typeof value === 'string' && value.length > 0)
  if (contentIds.length) {
    await q(
      `DELETE FROM approval_tokens WHERE cliente_id = $1 AND contenuto_id = ANY($2::text[])`,
      [clienteId, contentIds],
    )
  }

  const placeholders = ids.map((_, index) => `$${index + 2}`).join(', ')
  const deletedRows = await q(
    `DELETE FROM calendario WHERE cliente_id = $1 AND id IN (${placeholders}) RETURNING *`,
    [clienteId, ...ids],
  ) as Record<string, unknown>[]

  for (const row of deletedRows) {
    await q(
      `INSERT INTO log_pubblicazioni (cliente_id, id_contenuto, canale, formato, status_precedente, status_finale, messaggio)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        clienteId,
        row.id_contenuto || null,
        row.canale || null,
        row.formato || null,
        row.status || null,
        'ARCHIVIATO',
        'Contenuto non inviato rimosso prima della generazione di una nuova campagna',
      ],
    )
  }

  return {
    contenuti: rows.length,
    perStato: rows.reduce<Record<string, number>>((result, row) => {
      const status = String(row.status || 'SCONOSCIUTO')
      result[status] = (result[status] || 0) + 1
      return result
    }, {}),
    mediaCollegati: mediaCandidati.length,
    bytesMedia: 0,
    mbMedia: 0,
    ids,
    eliminati: deletedRows.length,
    impronteArchiviate,
    mediaCandidati,
  }
}
