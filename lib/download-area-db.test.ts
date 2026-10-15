import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Pool } from 'pg'
import { test } from 'playwright/test'
import { DEFAULT_PAGE_TEXTS } from './download-area'
import {
  EMPTY_PAGE_SETTINGS,
  createItem,
  deleteItem,
  getActiveCode,
  getPageSettings,
  getPageTextsOrDefault,
  isMissingDownloadSchema,
  listItems,
  reorderItems,
  rotateCode,
  rowToDownloadItem,
  rowToPageSettings,
  savePageSettings,
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

test('isMissingDownloadSchema riconosce anche la tabella dei testi (053)', () => {
  assert.equal(isMissingDownloadSchema(new Error('relation "download_page_settings" does not exist')), true)
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
      () => getPageSettings(),
      () => savePageSettings({ eyebrow: null, title: null, lead: null, whatsappText: null }),
    ]
    for (const call of calls) {
      await assert.rejects(call, { message: 'Database non disponibile' })
    }
  } finally {
    if (previous !== undefined) process.env.DATABASE_URL = previous
  }
})

// Senza Postgres in test non si puo eseguire l'SQL: questo controllo tiene allineati
// l'indice unico parziale della migrazione 052 e il target di ON CONFLICT di createItem,
// che deve ripetere il predicato (altrimenti Postgres risponde "no unique or exclusion
// constraint matching the ON CONFLICT specification" e ogni creazione di file fallisce).
test('052: indice unico parziale su blob_pathname e ON CONFLICT con lo stesso predicato', () => {
  const migration = readFileSync(join(process.cwd(), 'db', 'migrations', '052_download_area.sql'), 'utf8')
  const source = readFileSync(join(process.cwd(), 'lib', 'download-area-db.ts'), 'utf8')
  assert.match(
    migration,
    /CREATE UNIQUE INDEX IF NOT EXISTS download_items_blob_pathname_key ON download_items \(blob_pathname\) WHERE blob_pathname IS NOT NULL;/,
  )
  assert.match(source, /ON CONFLICT \(blob_pathname\) WHERE blob_pathname IS NOT NULL DO NOTHING/)
})

// ---- Testi della pagina regali (migrazione 053) ----------------------------

// Senza Postgres in test non si esegue l'SQL: si sostituisce `query` del pool di pg
// (un pool non si connette finche non esegue una query) e si guarda cosa verrebbe
// eseguito. Il percorso vero di lettura e salvataggio gira fino al confine col database.
// Come per fetch negli altri test, ripristina sempre cio che ha sostituito.
type StubbedQuery = (sql: string, params: unknown[]) => Promise<{ rows: unknown[] }>

async function withStubbedPool<T>(query: StubbedQuery, run: () => Promise<T>): Promise<T> {
  const previousUrl = process.env.DATABASE_URL
  const pool = Pool.prototype as unknown as { query?: unknown }
  // `query` di solito è ereditata dal pool di base e non propria di questa classe: in quel
  // caso a fine prova si toglie la proprietà messa dallo stub, invece di riassegnarla, così
  // il prototipo torna com'era e non resta una proprietà propria in più.
  const hadOwnQuery = Object.hasOwn(pool, 'query')
  const previousQuery = pool.query
  // Host riservato `.invalid` (RFC 2606), senza credenziali: non si risolve mai. Se lo stub
  // smettesse di intercettare `query` il test fallirebbe senza contattare nessun server.
  process.env.DATABASE_URL = 'postgres://stub.invalid/finto'
  pool.query = (sql: string, params: unknown[] = []) => query(sql, params)
  try {
    return await run()
  } finally {
    if (hadOwnQuery) pool.query = previousQuery
    else delete pool.query
    if (previousUrl === undefined) delete process.env.DATABASE_URL
    else process.env.DATABASE_URL = previousUrl
  }
}

// Cosa finisce in console.error durante `run` (e fuori dai log del test).
async function recordConsoleError<T>(run: () => Promise<T>): Promise<{ result: T; logged: unknown[][] }> {
  const previous = console.error
  const logged: unknown[][] = []
  console.error = (...args: unknown[]) => { logged.push(args) }
  try {
    return { result: await run(), logged }
  } finally {
    console.error = previous
  }
}

const readTexts = (query: StubbedQuery) => withStubbedPool(query, () => recordConsoleError(() => getPageTextsOrDefault()))

test('rowToPageSettings: campi nulli e interruttore', () => {
  assert.deepEqual(rowToPageSettings({ eyebrow: null, title: 'T', lead: null, whatsapp_text: null, show_ugc: true }), { eyebrow: null, title: 'T', lead: null, whatsappText: null, showUgc: true })
})

test('getPageTextsOrDefault: senza database usa i testi standard, in silenzio', async () => {
  const previous = process.env.DATABASE_URL
  delete process.env.DATABASE_URL
  try {
    const { result, logged } = await recordConsoleError(() => getPageTextsOrDefault())
    assert.deepEqual(result, DEFAULT_PAGE_TEXTS)
    assert.deepEqual(logged, [])
  } finally {
    if (previous !== undefined) process.env.DATABASE_URL = previous
  }
})

test('getPageTextsOrDefault: con la migrazione 053 non applicata usa i testi standard, in silenzio', async () => {
  const missing = Object.assign(new Error('relation "download_page_settings" does not exist'), { code: '42P01' })
  const { result, logged } = await readTexts(async () => { throw missing })
  assert.deepEqual(result, DEFAULT_PAGE_TEXTS)
  // La pagina si legge a ogni visita: un ripiego atteso non deve riempire i log.
  assert.deepEqual(logged, [])
})

test('getPageTextsOrDefault: con un errore del database usa i testi standard e registra un solo log', async () => {
  const { result, logged } = await readTexts(async () => { throw new Error('connection terminated unexpectedly') })
  assert.deepEqual(result, DEFAULT_PAGE_TEXTS)
  assert.equal(logged.length, 1)
  assert.match(String(logged[0][0]), /^\[download-area\] /)
  assert.equal(logged[0][1], 'connection terminated unexpectedly')
})

test('getPageTextsOrDefault non lancia mai, qualunque cosa venga lanciata', async () => {
  for (const failure of [new Error('boom'), 'testo', null, undefined, { code: '57P01' }]) {
    const { result } = await readTexts(async () => { throw failure })
    assert.deepEqual(result, DEFAULT_PAGE_TEXTS)
  }
})

test('getPageTextsOrDefault: tabella vuota usa i testi standard, riga salvata usa i testi salvati', async () => {
  const empty = await readTexts(async () => ({ rows: [] }))
  assert.deepEqual(empty.result, DEFAULT_PAGE_TEXTS)
  assert.deepEqual(empty.logged, [])

  // Un campo di soli spazi vale come vuoto: la pagina non resta mai senza testo.
  const saved = await readTexts(async () => ({
    rows: [{ eyebrow: null, title: 'Il mio titolo', lead: '   ', whatsapp_text: null, show_ugc: false }],
  }))
  assert.deepEqual(saved.result, { ...DEFAULT_PAGE_TEXTS, title: 'Il mio titolo' })
  assert.deepEqual(saved.logged, [])
})

test('getPageSettings: tabella vuota restituisce le impostazioni vuote, riga presente i campi convertiti', async () => {
  await withStubbedPool(async () => ({ rows: [] }), async () => {
    const settings = await getPageSettings()
    assert.deepEqual(settings, EMPTY_PAGE_SETTINGS)
    // una copia e non la costante condivisa: chi la modifica non deve toccare EMPTY_PAGE_SETTINGS
    assert.notEqual(settings, EMPTY_PAGE_SETTINGS)
  })
  await withStubbedPool(
    async () => ({ rows: [{ eyebrow: 'E', title: null, lead: null, whatsapp_text: 'W', show_ugc: true }] }),
    async () => {
      assert.deepEqual(await getPageSettings(), { eyebrow: 'E', title: null, lead: null, whatsappText: 'W', showUgc: true })
    },
  )
})

test('savePageSettings: senza showUgc passa null all upsert, con showUgc passa il valore', async () => {
  const seen: unknown[][] = []
  await withStubbedPool(
    async (_sql, params) => {
      seen.push(params)
      return { rows: [{ eyebrow: 'E', title: null, lead: null, whatsapp_text: null, show_ugc: true }] }
    },
    async () => {
      // Il risultato e la riga com'e sul database, non l'eco della richiesta.
      const saved = await savePageSettings({ eyebrow: 'E', title: null, lead: null, whatsappText: null })
      assert.equal(saved.showUgc, true)
      await savePageSettings({ eyebrow: null, title: null, lead: null, whatsappText: 'W', showUgc: false })
    },
  )
  assert.deepEqual(seen[0], ['E', null, null, null, null])
  // `false` e un valore, non "assente": con null l'interruttore non si spegnerebbe piu.
  assert.deepEqual(seen[1], [null, null, null, 'W', false])
})

// Senza Postgres non si esegue l'SQL: questi controlli tengono la migrazione 053
// allineata al codice e a cio che la 052 garantisce.
test('053: RLS attiva, privilegi revocati, nessun inserimento del codice o dei testi', () => {
  const migration = readFileSync(join(process.cwd(), 'db', 'migrations', '053_download_page_settings.sql'), 'utf8')
  assert.match(migration, /ALTER TABLE download_page_settings ENABLE ROW LEVEL SECURITY;/)
  // Niente FORCE: varrebbe anche per il proprietario, cioè per l'app e per il runner delle
  // migrazioni, che senza policy non vedrebbero né scriverebbero più niente.
  assert.doesNotMatch(migration, /FORCE\s+ROW\s+LEVEL/i)
  assert.match(migration, /REVOKE ALL ON download_page_settings FROM anon;/)
  assert.match(migration, /REVOKE ALL ON download_page_settings FROM authenticated;/)
  // I due ruoli esistono solo su Supabase: la revoca sta sotto la guardia pg_roles, altrimenti
  // su un Postgres normale la migrazione si fermerebbe con "role does not exist".
  assert.match(migration, /pg_roles WHERE rolname = 'anon'/)
  assert.match(migration, /pg_roles WHERE rolname = 'authenticated'/)
  assert.match(migration, /CHECK \(id = 1\)/)
  assert.doesNotMatch(migration, /INSERT\s+INTO/i)
})

// Il PUT della PR 1 non manda showUgc: l'upsert non deve azzerarlo.
test('savePageSettings: lascia invariato show_ugc quando non viene passato', () => {
  const source = readFileSync(join(process.cwd(), 'lib', 'download-area-db.ts'), 'utf8')
  assert.match(source, /show_ugc = COALESCE\(\$5::boolean, download_page_settings\.show_ugc\)/)
})
