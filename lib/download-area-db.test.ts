import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import {
  createItem,
  deleteItem,
  getActiveCode,
  isMissingDownloadSchema,
  listItems,
  reorderItems,
  rotateCode,
  rowToDownloadItem,
  updateItem,
} from './download-area-db'

test('isMissingDownloadSchema riconosce la migrazione mancante', () => {
  assert.equal(isMissingDownloadSchema({ code: '42P01' }), true)
  assert.equal(isMissingDownloadSchema(new Error('relation "download_items" does not exist')), true)
  assert.equal(isMissingDownloadSchema(new Error('relation "download_access" does not exist')), true)
  assert.equal(isMissingDownloadSchema(new Error('timeout')), false)
  // Un'altra tabella mancante non e la nostra migrazione.
  assert.equal(isMissingDownloadSchema(new Error('relation "consulenze" does not exist')), false)
  assert.equal(isMissingDownloadSchema(null), false)
})

test('rowToDownloadItem converte i campi', () => {
  const item = rowToDownloadItem({ id: 'x', kind: 'file', title: 'G', description: null, url: 'https://b/x.pdf', download_url: 'https://b/x.pdf?download=1', blob_pathname: 'swa-download/files/x.pdf', file_name: 'x.pdf', content_type: 'application/pdf', size_bytes: '2048', position: 0, visible: true, created_at: new Date('2026-10-10T10:00:00Z') })
  assert.equal(item.sizeBytes, 2048)
  assert.equal(item.downloadUrl, 'https://b/x.pdf?download=1')
  assert.equal(item.createdAt, '2026-10-10T10:00:00.000Z')
})

test('rowToDownloadItem lascia a null i campi vuoti di un link', () => {
  const item = rowToDownloadItem({ id: 'y', kind: 'link', title: 'Sito', description: 'd', url: 'https://example.com', download_url: null, blob_pathname: null, file_name: null, content_type: null, size_bytes: null, position: 3, visible: false, created_at: '2026-10-10T10:00:00.000Z' })
  assert.equal(item.kind, 'link')
  assert.equal(item.sizeBytes, null)
  assert.equal(item.downloadUrl, null)
  assert.equal(item.blobPathname, null)
  assert.equal(item.position, 3)
  assert.equal(item.visible, false)
  assert.equal(item.createdAt, '2026-10-10T10:00:00.000Z')
})

// Senza DATABASE_URL ogni funzione deve rifiutare con il messaggio che apiError
// traduce in 503, non con un errore di connessione generico.
test('le funzioni DB rifiutano con "Database non disponibile" senza DATABASE_URL', async () => {
  const previous = process.env.DATABASE_URL
  delete process.env.DATABASE_URL
  try {
    const link = { kind: 'link' as const, title: 't', description: null, url: 'https://example.com', downloadUrl: null, blobPathname: null, fileName: null, contentType: null, sizeBytes: null }
    const calls: Array<() => Promise<unknown>> = [
      () => getActiveCode(),
      () => rotateCode('k7f3q9xzm2p4v8wn'),
      () => listItems({ includeHidden: true }),
      () => createItem(link),
      () => updateItem('id', { title: 'n' }),
      () => deleteItem('id'),
      () => reorderItems(['a', 'b']),
    ]
    for (const call of calls) {
      await assert.rejects(call, { message: 'Database non disponibile' })
    }
  } finally {
    if (previous !== undefined) process.env.DATABASE_URL = previous
  }
})
