// Accesso al database dell'area download segreta (tabelle della migrazione 052).
// Solo server: la logica pura (validazione, codice) sta in lib/download-area.ts.

import { dbReady, q, q1, withTransaction } from '@/lib/db'

export type DownloadKind = 'file' | 'link'

export type DownloadItem = {
  id: string
  kind: DownloadKind
  title: string
  description: string | null
  url: string
  downloadUrl: string | null
  blobPathname: string | null
  fileName: string | null
  contentType: string | null
  sizeBytes: number | null
  position: number
  visible: boolean
  createdAt: string
}

export type NewDownloadItem = Omit<DownloadItem, 'id' | 'position' | 'visible' | 'createdAt'>

const ITEM_COLUMNS = `id, kind, title, description, url, download_url, blob_pathname,
  file_name, content_type, size_bytes, position, visible, created_at`

// Stesso messaggio che apiError traduce in 503: senza DB niente è stato salvato.
function requireDb() {
  if (!dbReady()) throw new Error('Database non disponibile')
}

function nullableText(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value)
}

// pg restituisce i bigint come stringa e i timestamptz come Date: qui si
// riportano a number e a stringa ISO, cioè a ciò che il JSON delle API può portare.
export function rowToDownloadItem(row: Record<string, unknown>): DownloadItem {
  const createdAt = row.created_at
  return {
    id: String(row.id),
    kind: row.kind === 'link' ? 'link' : 'file',
    title: String(row.title),
    description: nullableText(row.description),
    url: String(row.url),
    downloadUrl: nullableText(row.download_url),
    blobPathname: nullableText(row.blob_pathname),
    fileName: nullableText(row.file_name),
    contentType: nullableText(row.content_type),
    sizeBytes: row.size_bytes === null || row.size_bytes === undefined ? null : Number(row.size_bytes),
    position: Number(row.position),
    visible: Boolean(row.visible),
    createdAt: createdAt instanceof Date ? createdAt.toISOString() : String(createdAt),
  }
}

// Migrazione 052 non ancora applicata: la pagina admin mostra l'avviso invece di un 500.
export function isMissingDownloadSchema(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code || ''
  if (code === '42P01') return true
  const message = error instanceof Error ? error.message : String(error || '')
  return /download_(items|access)/i.test(message) && /does not exist/i.test(message)
}

export async function getActiveCode(): Promise<string | null> {
  requireDb()
  const row = await q1('SELECT code FROM download_access WHERE id = 1')
  return row ? String(row.code) : null
}

// Riga unica (id = 1): ruotare significa sostituire il codice, e il vecchio link smette di funzionare.
export async function rotateCode(code: string): Promise<void> {
  requireDb()
  await q(
    `INSERT INTO download_access (id, code, rotated_at)
     VALUES (1, $1, now())
     ON CONFLICT (id) DO UPDATE SET code = EXCLUDED.code, rotated_at = now()`,
    [code],
  )
}

export async function listItems(opts: { includeHidden: boolean }): Promise<DownloadItem[]> {
  requireDb()
  const rows = await q(
    `SELECT ${ITEM_COLUMNS}
     FROM download_items
     ${opts.includeHidden ? '' : 'WHERE visible = true'}
     ORDER BY position, created_at`,
  )
  return rows.map(rowToDownloadItem)
}

// La nuova scheda va in fondo alla lista. Se due creazioni arrivano insieme e
// ottengono la stessa posizione, created_at nell'ORDER BY ne decide l'ordine.
//
// Idempotente sul blob: un blob regge una sola scheda (indice unico parziale
// download_items_blob_pathname_key, migrazione 052). Se esiste già una scheda con
// quel blob_pathname (riprova dopo una risposta persa, doppio invio) non si crea
// un duplicato e si restituisce quella esistente. Il target di ON CONFLICT deve
// ripetere il predicato dell'indice parziale, altrimenti Postgres non lo riconosce.
// Le schede link hanno blob_pathname nullo e non entrano mai nell'indice.
export async function createItem(input: NewDownloadItem): Promise<DownloadItem> {
  requireDb()
  const row = await q1(
    `INSERT INTO download_items
       (kind, title, description, url, download_url, blob_pathname, file_name, content_type, size_bytes, position)
     VALUES
       ($1, $2, $3, $4, $5, $6, $7, $8, $9,
        (SELECT coalesce(max(position), -1) + 1 FROM download_items))
     ON CONFLICT (blob_pathname) WHERE blob_pathname IS NOT NULL DO NOTHING
     RETURNING ${ITEM_COLUMNS}`,
    [
      input.kind,
      input.title,
      input.description,
      input.url,
      input.downloadUrl,
      input.blobPathname,
      input.fileName,
      input.contentType,
      input.sizeBytes,
    ],
  )
  if (row) return rowToDownloadItem(row)

  // Nessuna riga restituita: il conflitto c'è stato. Si legge la scheda che ha già quel blob.
  if (input.blobPathname) {
    const existing = await q1(`SELECT ${ITEM_COLUMNS} FROM download_items WHERE blob_pathname = $1`, [input.blobPathname])
    if (existing) return rowToDownloadItem(existing)
  }
  throw new Error('Inserimento scheda non riuscito')
}

// Gli id arrivano dall'URL: si confrontano come testo così un id malformato
// risulta "non trovata" (null) invece di far fallire il cast uuid con un 500.
export async function updateItem(
  id: string,
  patch: { title?: string; description?: string | null; visible?: boolean },
): Promise<DownloadItem | null> {
  requireDb()
  const params: unknown[] = [id]
  const sets: string[] = []
  const set = (column: string, value: unknown) => {
    params.push(value)
    sets.push(`${column} = $${params.length}`)
  }
  if (patch.title !== undefined) set('title', patch.title)
  if (patch.description !== undefined) set('description', patch.description)
  if (patch.visible !== undefined) set('visible', patch.visible)
  sets.push('updated_at = now()')

  const row = await q1(
    `UPDATE download_items SET ${sets.join(', ')} WHERE id::text = $1 RETURNING ${ITEM_COLUMNS}`,
    params,
  )
  return row ? rowToDownloadItem(row) : null
}

// Restituisce la riga eliminata: serve blobPathname per cancellare anche il file da Blob.
export async function deleteItem(id: string): Promise<DownloadItem | null> {
  requireDb()
  const row = await q1(`DELETE FROM download_items WHERE id::text = $1 RETURNING ${ITEM_COLUMNS}`, [id])
  return row ? rowToDownloadItem(row) : null
}

// Transazione: un ordine applicato a metà lascerebbe posizioni duplicate o saltate.
export async function reorderItems(ids: string[]): Promise<void> {
  requireDb()
  await withTransaction(async query => {
    for (let index = 0; index < ids.length; index++) {
      await query('UPDATE download_items SET position = $2 WHERE id::text = $1', [ids[index], index])
    }
  })
}
