# Area download segreta — piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** pagina nascosta `/download/<codice>` con testata e footer SWA, dove chi ha il link scarica file (Vercel Blob) o apre link, gestita dal pannello `/admin/download`.

**Architecture:** la logica pura (codice, validazioni, ordinamento, formattazione) sta in `lib/download-area.ts` ed è coperta da test. L'accesso al DB sta in `lib/download-area-db.ts` (catalogo e codice in Postgres, migrazione 052). La pagina pubblica è un server component che legge il DB direttamente; il pannello è un client component che usa API admin. I file vanno dal browser a Blob con `@vercel/blob/client`.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, `pg` tramite `lib/db.ts`, `@vercel/blob` ^2.8.1, CSS Modules (pagina pubblica), Tailwind (pannello, come la dashboard), test con `playwright/test` + `node:assert/strict`.

**Spec:** `docs/superpowers/specs/2026-10-10-download-area-design.md`

## Global Constraints

- Branch di lavoro: `feat/download-area`. Niente push né deploy senza conferma del titolare.
- Unica dipendenza nuova: `@vercel/blob@^2.8.1`.
- Il repository è pubblico: nessun codice di accesso, token o URL di store va scritto in file versionati.
- Testi UI e commenti in italiano, con lo stile del repo; messaggi di commit in inglese, chiusi da `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Test singolo: `npx playwright test lib/<nome>.test.ts --workers=1`. Suite completa: `npm test`.
- Codice: 16 caratteri dall'alfabeto `abcdefghjkmnpqrstuvwxyz23456789` (esclusi `0 o 1 l i`).
- File: massimo 250 MB (`250 * 1024 * 1024`). Estensioni ammesse: pdf, zip, png, jpg, jpeg, webp, gif, mp4, txt, md, csv, json, docx, xlsx, pptx.
- Testi delle schede: titolo da 1 a 120 caratteri, descrizione fino a 600 (vuota → `null`).
- Prefisso dei blob: `swa-download/files/`.
- Pagine Next nel gruppo `app/(it)/` (non esiste un `app/layout.tsx` radice).
- Le API di gestione rifiutano la modalità demo (403) e l'assenza di DB (503): `requireAdmin()` da solo in quei casi lascia passare.

## Review Focus

1. **Codice digitato a mano dal post social** (`/download/K7F3Q9XZ...` maiuscolo, oppure con spazi o trattini): ci si aspetta che funzioni. `normalizeAccessCode` porta tutto in minuscolo e toglie spazi e trattini (test nel Task 1).
2. **Link incollato senza `https://`** (`github.com/marco/repo`): ci si aspetta che venga accettato come `https://github.com/marco/repo`. Test in `normalizeLinkUrl` (Task 1).
3. **Pannello aperto prima della migrazione 052**: ci si aspetta un messaggio "Applica la migrazione 052", non un errore 500. `isMissingDownloadSchema` è testato nel Task 2, e il GET restituisce `needs_migration: true` (Task 3).
4. **Riordino con un elenco non aggiornato** (due schede aperte, una scheda appena eliminata): ci si aspetta un rifiuto chiaro e il ricaricamento, non posizioni corrotte. `validateReorder` è testato nel Task 3.
5. **File troppo grande o di tipo non ammesso** (`.exe`, `.heic`, 300 MB): ci si aspetta il rifiuto prima del caricamento, con un messaggio in italiano. `validateFileMeta` è testato nel Task 1; il token di caricamento lo impone anche lato server (Task 3).

---

### Task 1: Logica pura dell'area download

**Files:**
- Create: `lib/download-area.ts`
- Test: `lib/download-area.test.ts`

**Interfaces:**
- Consumes: nulla.
- Produces:
  - `ACCESS_CODE_LENGTH = 16`, `MAX_FILE_BYTES`, `DOWNLOAD_BLOB_PREFIX = 'swa-download/files/'`, `ALLOWED_FILE_TYPES: Record<string, string>` (estensione → MIME, una voce per ogni estensione dei Global Constraints; per `md` usare `text/markdown`)
  - `generateAccessCode(): string`
  - `normalizeAccessCode(raw: unknown): string | null`: minuscolo, spazi e `-` rimossi; restituisce la stringa se ha il formato valido, altrimenti `null`
  - `normalizeLinkUrl(raw: unknown): string | null`
  - `validateFileMeta(meta: { name: string; size: number; contentType?: string | null }): { ok: true; extension: string; contentType: string } | { ok: false; error: string }`
  - `validateItemText(input: { title: unknown; description?: unknown }): { ok: true; title: string; description: string | null } | { ok: false; error: string }`
  - `moveItem(ids: string[], id: string, direction: 'up' | 'down'): string[]`
  - `formatBytes(bytes: number): string`
  - `buildBlobPathname(fileName: string): string` e `isDownloadBlobPathname(pathname: string): boolean`
  - `linkHostname(url: string): string`: hostname senza `www.`

- [x] **Step 1: Scrivere i test che falliscono** in `lib/download-area.test.ts` (stile di `lib/ai-model.test.ts`):

```ts
test('generateAccessCode: 16 caratteri dall’alfabeto, 1000 codici tutti diversi', () => {
  const codes = Array.from({ length: 1000 }, generateAccessCode)
  for (const c of codes) assert.match(c, /^[abcdefghjkmnpqrstuvwxyz23456789]{16}$/)
  assert.equal(new Set(codes).size, 1000)
})
test('normalizeAccessCode accetta maiuscole, spazi e trattini; rifiuta formati errati', () => {
  assert.equal(normalizeAccessCode('k7f3q9xzm2p4v8wn'), 'k7f3q9xzm2p4v8wn')
  assert.equal(normalizeAccessCode(' K7F3-Q9XZ-M2P4-V8WN '), 'k7f3q9xzm2p4v8wn')
  for (const bad of ['', 'k7f3q9xz', 'k7f3q9xzm2p4v8wn1', 'k7f3q9xzm2p4v8w0', 'k7f3q9xzm2p4v8wl', '../../etc', null, 42])
    assert.equal(normalizeAccessCode(bad), null)
})
test('normalizeLinkUrl', () => {
  assert.equal(normalizeLinkUrl('https://github.com/marco/repo'), 'https://github.com/marco/repo')
  assert.equal(normalizeLinkUrl('http://esempio.it/x'), 'https://esempio.it/x')
  assert.equal(normalizeLinkUrl('github.com/marco/repo'), 'https://github.com/marco/repo')
  for (const bad of ['javascript:alert(1)', 'data:text/html,x', '/relativo', 'https://user:pw@x.it', 'ftp://x.it', 'non un url', '', 'https://' + 'a'.repeat(2050) + '.it'])
    assert.equal(normalizeLinkUrl(bad), null)
})
test('validateFileMeta', () => {
  assert.deepEqual(validateFileMeta({ name: 'Guida UGC.PDF', size: 2_000_000, contentType: 'application/pdf' }), { ok: true, extension: 'pdf', contentType: 'application/pdf' })
  assert.equal(validateFileMeta({ name: 'x.exe', size: 10 }).ok, false)
  assert.equal(validateFileMeta({ name: 'foto.heic', size: 10 }).ok, false)
  assert.equal(validateFileMeta({ name: 'grande.zip', size: 250 * 1024 * 1024 + 1 }).ok, false)
  assert.equal(validateFileMeta({ name: 'vuoto.pdf', size: 0 }).ok, false)
  assert.equal(validateFileMeta({ name: 'senza-estensione', size: 10 }).ok, false)
})
test('validateItemText', () => {
  assert.deepEqual(validateItemText({ title: '  Guida   UGC ', description: '' }), { ok: true, title: 'Guida UGC', description: null })
  assert.equal(validateItemText({ title: '   ' }).ok, false)
  assert.equal(validateItemText({ title: 'x'.repeat(121) }).ok, false)
  assert.equal(validateItemText({ title: 'ok', description: 'd'.repeat(601) }).ok, false)
})
test('moveItem agli estremi e con id sconosciuto', () => {
  assert.deepEqual(moveItem(['a', 'b', 'c'], 'b', 'up'), ['b', 'a', 'c'])
  assert.deepEqual(moveItem(['a', 'b', 'c'], 'c', 'down'), ['a', 'b', 'c'])
  assert.deepEqual(moveItem(['a', 'b', 'c'], 'a', 'up'), ['a', 'b', 'c'])
  assert.deepEqual(moveItem(['a', 'b', 'c'], 'z', 'down'), ['a', 'b', 'c'])
})
test('formatBytes in italiano', () => {
  assert.equal(formatBytes(512), '512 B')
  assert.equal(formatBytes(1536), '1,5 KB')
  assert.equal(formatBytes(1048576), '1 MB')
  assert.equal(formatBytes(250 * 1024 * 1024), '250 MB')
})
test('pathname dei blob', () => {
  assert.equal(buildBlobPathname('Guida Città UGC (v2).PDF'), 'swa-download/files/guida-citta-ugc-v2.pdf')
  assert.equal(isDownloadBlobPathname('swa-download/files/guida-abc123.pdf'), true)
  assert.equal(isDownloadBlobPathname('swa-download/catalog.json'), false)
  assert.equal(isDownloadBlobPathname('swa-download/files/../x.pdf'), false)
})
test('linkHostname', () => {
  assert.equal(linkHostname('https://www.github.com/marco'), 'github.com')
})
```

- [x] **Step 2: Eseguire i test e verificare che falliscano**
  Run: `npx playwright test lib/download-area.test.ts --workers=1`. Expected: FAIL (modulo `./download-area` non trovato).

- [x] **Step 3: Implementare `lib/download-area.ts`.**
  - `generateAccessCode`: usa `crypto.getRandomValues` con campionamento a rifiuto (scarta i byte `>= 248`, cioè `31 * 8`) per non introdurre distorsioni.
  - `normalizeLinkUrl`: se manca lo schema e la stringa ha la forma `dominio.tld/...` senza spazi, prefissa `https://`; poi usa `new URL()`. Accetta solo `http:`/`https:` e promuove `http:` a `https:`. Rifiuta username/password e lunghezze oltre 2048.
  - `buildBlobPathname`: separa prima estensione e base (sull'ultimo `.`); NFD e rimozione degli accenti, minuscolo; nella base `[^a-z0-9]+` → `-` (punti compresi), trattini ai bordi rimossi, troncata a 80 caratteri; estensione in minuscolo; risultato `swa-download/files/<base>.<ext>`.
  - `isDownloadBlobPathname`: inizia con il prefisso, non contiene `..` né `//`.
  - `formatBytes`: base 1024, `toLocaleString('it-IT', { maximumFractionDigits: 1 })`.

- [x] **Step 4: Eseguire i test**
  Run: `npx playwright test lib/download-area.test.ts --workers=1`. Expected: PASS, 9 test.

- [x] **Step 5: Commit**
  `git add lib/download-area.ts lib/download-area.test.ts && git commit -m "Add pure logic for the secret download area"`

### Task 2: Migrazione 052 e accesso al database

**Files:**
- Create: `db/migrations/052_download_area.sql`: lo SQL esatto è nella sezione 3 della spec, con un commento introduttivo in italiano nello stile di `050_corso_ai_act.sql`
- Create: `lib/download-area-db.ts`
- Test: `lib/download-area-db.test.ts`: solo la parte pura `isMissingDownloadSchema` e il mapping delle righe

**Interfaces:**
- Consumes: `q`, `q1`, `withTransaction`, `dbReady` da `lib/db.ts`.
- Produces:
  - `type DownloadKind = 'file' | 'link'`
  - `type DownloadItem = { id: string; kind: DownloadKind; title: string; description: string | null; url: string; downloadUrl: string | null; blobPathname: string | null; fileName: string | null; contentType: string | null; sizeBytes: number | null; position: number; visible: boolean; createdAt: string }`
  - `type NewDownloadItem = Omit<DownloadItem, 'id' | 'position' | 'visible' | 'createdAt'>`
  - `rowToDownloadItem(row: Record<string, unknown>): DownloadItem`: snake_case → camelCase; `size_bytes` (bigint, stringa da `pg`) → `number`
  - `isMissingDownloadSchema(error: unknown): boolean`: codice `42P01`, oppure messaggio con `download_items`/`download_access` e "does not exist"
  - `getActiveCode(): Promise<string | null>`
  - `rotateCode(code: string): Promise<void>`: upsert della riga `id = 1`, `rotated_at = now()`
  - `listItems(opts: { includeHidden: boolean }): Promise<DownloadItem[]>`: ordine `position, created_at`
  - `createItem(input: NewDownloadItem): Promise<DownloadItem>`: `position = coalesce(max(position), -1) + 1`
  - `updateItem(id: string, patch: { title?: string; description?: string | null; visible?: boolean }): Promise<DownloadItem | null>`: aggiorna anche `updated_at`
  - `deleteItem(id: string): Promise<DownloadItem | null>`: restituisce la riga eliminata
  - `reorderItems(ids: string[]): Promise<void>`: in `withTransaction`, `position = indice`
  - Ogni funzione DB lancia `new Error('Database non disponibile')` se `!dbReady()`: `apiError` lo traduce in 503.

- [x] **Step 1: Scrivere i test che falliscono**:

```ts
test('isMissingDownloadSchema riconosce la migrazione mancante', () => {
  assert.equal(isMissingDownloadSchema({ code: '42P01' }), true)
  assert.equal(isMissingDownloadSchema(new Error('relation "download_items" does not exist')), true)
  assert.equal(isMissingDownloadSchema(new Error('timeout')), false)
})
test('rowToDownloadItem converte i campi', () => {
  const item = rowToDownloadItem({ id: 'x', kind: 'file', title: 'G', description: null, url: 'https://b/x.pdf', download_url: 'https://b/x.pdf?download=1', blob_pathname: 'swa-download/files/x.pdf', file_name: 'x.pdf', content_type: 'application/pdf', size_bytes: '2048', position: 0, visible: true, created_at: new Date('2026-10-10T10:00:00Z') })
  assert.equal(item.sizeBytes, 2048)
  assert.equal(item.downloadUrl, 'https://b/x.pdf?download=1')
  assert.equal(item.createdAt, '2026-10-10T10:00:00.000Z')
})
```

- [x] **Step 2:** Run `npx playwright test lib/download-area-db.test.ts --workers=1`. Expected: FAIL (modulo mancante).
- [x] **Step 3:** Creare la migrazione e `lib/download-area-db.ts` con le firme sopra.
- [x] **Step 4:** Run `npx playwright test lib/download-area-db.test.ts --workers=1` → PASS. Run `npm run migrate:dry` → l'output elenca `052_download_area.sql` dopo `051_...`, senza errori. Se lo script chiede un DB, verificare almeno che il file venga ordinato correttamente leggendo `scripts/run-migrations.mjs`.
- [x] **Step 5: Commit** `"Add download area schema and data access"`.

### Task 3: API admin, controllo accessi e caricamento su Blob

**Files:**
- Modify: `package.json` / `package-lock.json` (`npm install @vercel/blob@^2.8.1`)
- Modify: `lib/download-area.ts` (aggiungere i parser dei body) e il relativo test
- Create: `lib/download-area-guard.ts`
- Create: `app/api/admin/downloads/route.ts` (GET, POST)
- Create: `app/api/admin/downloads/[id]/route.ts` (PATCH, DELETE)
- Create: `app/api/admin/downloads/reorder/route.ts` (POST)
- Create: `app/api/admin/downloads/code/route.ts` (POST)
- Create: `app/api/admin/downloads/upload/route.ts` (POST, `handleUpload`)

**Interfaces:**
- Consumes: tutto il Task 1 e il Task 2; `requireAdmin` (`lib/auth-utils`), `isDemo` (`lib/demo`), `dbReady` (`lib/db`), `apiError` (`lib/api-error`).
- Produces (in `lib/download-area.ts`):
  - `parseCreateItemBody(body: unknown): { ok: true; value: { kind: 'link'; title: string; description: string | null; url: string } | { kind: 'file'; title: string; description: string | null; blob: { url: string; downloadUrl: string; pathname: string; contentType: string; size: number; fileName: string } } } | { ok: false; error: string }`
  - `parseUpdateItemBody(body: unknown): { ok: true; value: { title?: string; description?: string | null; visible?: boolean } } | { ok: false; error: string }`: almeno un campo
  - `validateReorder(ids: unknown, currentIds: string[]): { ok: true; ids: string[] } | { ok: false; error: string }`: stesso insieme di id, senza duplicati
- Produces (in `lib/download-area-guard.ts`): `requireDownloadAdmin(): Promise<void>`. Lancia `Error('Operazione riservata ad admin')` se `isDemo()` (403 tramite `apiError`), `Error('Database non disponibile')` se `!dbReady()` (503), poi esegue `requireAdmin()`.
- Contratto HTTP (lo usa il pannello del Task 6):
  - `GET /api/admin/downloads` → `{ items: DownloadItem[]; code: string | null; needs_migration: boolean }`; con lo schema mancante: `{ items: [], code: null, needs_migration: true }`
  - `POST /api/admin/downloads` → 201 `{ item }` | 400 `{ error }`. Per `kind:'file'`: `isDownloadBlobPathname(blob.pathname)`, `validateFileMeta`, `head(blob.url)` deve esistere, altrimenti 400 "File non trovato nello storage".
  - `PATCH /api/admin/downloads/[id]` → `{ item }` | 404. `DELETE` → `{ ok: true }`: se la scheda è un file, `del(blobPathname)` best-effort, con `console.error` se fallisce.
  - `POST /api/admin/downloads/reorder` `{ ids }` → `{ ok: true }` | 409 `{ error: 'L’elenco è cambiato, ricarica la pagina.' }`
  - `POST /api/admin/downloads/code` → `{ code }` (genera e salva un codice nuovo)
  - `POST /api/admin/downloads/upload`: `handleUpload`. In `onBeforeGenerateToken(pathname)`: `requireDownloadAdmin()`, `isDownloadBlobPathname(pathname)`, poi restituisce `{ addRandomSuffix: true, maximumSizeInBytes: MAX_FILE_BYTES, allowedContentTypes: Object.values(ALLOWED_FILE_TYPES) }`. `onUploadCompleted` vuoto (il webhook arriverebbe senza sessione).
  - Firma delle route dinamiche come in `app/api/data/calendario/[id]/regenerate/route.ts`: `{ params }: { params: Promise<{ id: string }> }`. Tutte con `export const dynamic = 'force-dynamic'` ed errori tramite `apiError`.

- [x] **Step 1: Test che falliscono** (aggiunti a `lib/download-area.test.ts`):

```ts
test('parseCreateItemBody: link valido, link pericoloso, file fuori prefisso', () => {
  assert.deepEqual(parseCreateItemBody({ kind: 'link', title: 'App UGC', url: 'ugc.example.com' }), { ok: true, value: { kind: 'link', title: 'App UGC', description: null, url: 'https://ugc.example.com/' } })
  assert.equal(parseCreateItemBody({ kind: 'link', title: 'x', url: 'javascript:alert(1)' }).ok, false)
  assert.equal(parseCreateItemBody({ kind: 'file', title: 'x', blob: { url: 'https://s/x.pdf', downloadUrl: 'https://s/x.pdf?download=1', pathname: 'altro/x.pdf', contentType: 'application/pdf', size: 10, fileName: 'x.pdf' } }).ok, false)
  assert.equal(parseCreateItemBody({ kind: 'video' }).ok, false)
})
test('parseUpdateItemBody richiede almeno un campo valido', () => {
  assert.deepEqual(parseUpdateItemBody({ visible: false }), { ok: true, value: { visible: false } })
  assert.equal(parseUpdateItemBody({}).ok, false)
  assert.equal(parseUpdateItemBody({ title: '' }).ok, false)
})
test('validateReorder rifiuta elenchi non aggiornati', () => {
  assert.deepEqual(validateReorder(['b', 'a'], ['a', 'b']), { ok: true, ids: ['b', 'a'] })
  assert.equal(validateReorder(['a'], ['a', 'b']).ok, false)
  assert.equal(validateReorder(['a', 'a'], ['a', 'b']).ok, false)
  assert.equal(validateReorder(['a', 'c'], ['a', 'b']).ok, false)
})
```

  Nota: `normalizeLinkUrl` restituisce l'URL serializzato da `new URL()`, quindi `https://ugc.example.com/` con la barra finale. Il test del Task 1 su `github.com/marco/repo` non ha la barra perché c'è un percorso.

- [x] **Step 2:** Run `npx playwright test lib/download-area.test.ts --workers=1` → FAIL sui 3 test nuovi.
- [x] **Step 3:** `npm install @vercel/blob@^2.8.1`, poi implementare parser, guard e le 5 route secondo il contratto.
- [x] **Step 4:** Run `npx playwright test lib/download-area.test.ts lib/download-area-db.test.ts --workers=1` → PASS. Run `npx tsc --noEmit -p tsconfig.json` → nessun errore.
- [x] **Step 5: Commit** `"Add admin API for the download area"`.

### Task 4: Middleware, intestazioni e CSP

**Files:**
- Modify: `middleware.ts`: senza token, `/admin` e `/admin/*` reindirizzano a `/login?callbackUrl=<percorso>`; con un token non admin, reindirizzano a `/portale`. Stessa logica e posizione dei controlli su `/dashboard`.
- Modify: `next.config.mjs`, in `headers()`, **dopo** la voce `{ source: '/:path*', headers: securityHeaders }`:
  - `/download/:path*`: `X-Robots-Tag: noindex, nofollow, noarchive`, `Referrer-Policy: no-referrer`, `Cache-Control: private, no-store`
  - `/admin/:path*`: `X-Robots-Tag` come sopra e una `Content-Security-Policy` uguale a `csp` ma con l'host delle API Blob aggiunto a `connect-src`
- Modify: `app/(it)/dashboard/...`: nessuna modifica (il pannello non è nel menu, per scelta)

**Interfaces:**
- Consumes: nulla dai task precedenti, tranne `@vercel/blob` installato (Task 3) per ricavare l'host.
- Produces: header e redirect che i Task 5 e 6 danno per scontati.

- [x] **Step 1:** Ricavare l'host delle API Blob dalla versione installata: `grep -rhoE "https://[a-z.]*vercel[a-z.-]*\.(com|app)[a-z/]*blob[a-z/]*" node_modules/@vercel/blob/dist | sort -u`. Annotare l'host esatto (atteso: `https://vercel.com/api/blob/`) da usare in `connect-src`.
- [x] **Step 2:** Modificare `middleware.ts` e `next.config.mjs`.
- [x] **Step 3: Verifica delle intestazioni**: `node -e "import('./next.config.mjs').then(async m => { const h = await m.default.headers(); const i = s => h.findIndex(x => x.source === s); console.log(i('/:path*') < i('/download/:path*') && i('/:path*') < i('/admin/:path*') ? 'ORDINE OK' : 'ORDINE ERRATO'); console.log(JSON.stringify(h.filter(x => /download|admin/.test(x.source)), null, 1)) })"`. Expected: `ORDINE OK`, il `Referrer-Policy: no-referrer` su `/download/:path*`, l'host Blob in `connect-src` su `/admin/:path*`.
- [x] **Step 4:** Run `npx tsc --noEmit -p tsconfig.json` → nessun errore.
- [x] **Step 5: Commit** `"Protect /admin and harden /download headers"`.

### Task 5: Pagina pubblica `/download/[codice]`

**Files:**
- Create: `app/(it)/download/[codice]/page.tsx`
- Create: `app/(it)/download/[codice]/download.module.css`: solo lo stile delle schede; hero e sezioni riusano `@/styles/content-page.module.css`
- Modify: `lib/download-area.ts` (aggiungere `describeItem`) e il relativo test

**Interfaces:**
- Consumes: `normalizeAccessCode`, `formatBytes`, `linkHostname` (Task 1); `getActiveCode`, `listItems`, `isMissingDownloadSchema`, `DownloadItem` (Task 2).
- Produces: `describeItem(item: Pick<DownloadItem, 'kind' | 'url' | 'downloadUrl' | 'fileName' | 'sizeBytes'>): { actionLabel: 'Scarica' | 'Apri'; href: string; meta: string; external: boolean }`. Per un file: href `downloadUrl`, meta `"PDF · 2,4 MB"` (estensione in maiuscolo da `fileName`); per un link: href `url`, meta `linkHostname(url)`, `external: true`.

- [x] **Step 1: Test che fallisce**:

```ts
test('describeItem', () => {
  assert.deepEqual(describeItem({ kind: 'file', url: 'https://s/g.pdf', downloadUrl: 'https://s/g.pdf?download=1', fileName: 'guida.pdf', sizeBytes: 2_516_582 }), { actionLabel: 'Scarica', href: 'https://s/g.pdf?download=1', meta: 'PDF · 2,4 MB', external: false })
  assert.deepEqual(describeItem({ kind: 'link', url: 'https://www.github.com/marco/repo', downloadUrl: null, fileName: null, sizeBytes: null }), { actionLabel: 'Apri', href: 'https://www.github.com/marco/repo', meta: 'github.com', external: true })
})
```

- [x] **Step 2:** Run del test → FAIL.
- [x] **Step 3: Implementare `describeItem` e la pagina.**
  - `export const dynamic = 'force-dynamic'`.
  - `metadata` statica: `title: 'Materiali riservati | Social Web Automation'`, `robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } }`, nessun `alternates`.
  - `params: Promise<{ codice: string }>`. Flusso: `normalizeAccessCode(codice)` → se `null`, `notFound()` senza toccare il DB. Poi `getActiveCode()`: se c'è un errore, lo schema manca o il codice è diverso, `notFound()`. Infine `listItems({ includeHidden: false })`.
  - Struttura come la FAQ:
    - `<main id="main-content" className={styles.page}>` con skip link;
    - `PublicHeader` con la stessa CTA di `app/(it)/chi-siamo/page.tsx` (`WHATSAPP_URL`, "Conosciamoci");
    - un hero con eyebrow "Riservato a chi ha il link", h1 "I tuoi materiali SWA." e un lead segnaposto ("Guide, strumenti e link preparati per te. Scarica quello che ti serve: non chiediamo registrazione né email.");
    - la sezione con la griglia delle schede (titolo, descrizione, `meta`, pulsante `actionLabel`; i link esterni con `target="_blank" rel="noopener noreferrer"`);
    - se l'elenco è vuoto: "Stiamo preparando i materiali, torna a trovarci presto.";
    - in fondo `PublicFooter` e `FloatingNavigation`;
    - niente breadcrumbs (porterebbero a Home e confermerebbero la struttura) e niente JSON-LD.
  - Icone da `lucide-react`: `FileText`, `FileArchive`, `FileImage`, `Film`, `Link2`.
  - CSS solo con i token del sito (`--ink`, `--muted`, `--line`, `--surface`, `--green`, `--paper`), verificati in entrambi i temi.
- [x] **Step 4:** Run `npx playwright test lib/download-area.test.ts --workers=1` → PASS. Run `npm run build` → la route `ƒ /download/[codice]` compare nell'elenco e la build termina con exit 0.
- [x] **Step 5: Commit** `"Add secret download page with SWA layout"`.

### Task 6: Pannello `/admin/download`

**Files:**
- Create: `app/(it)/admin/download/page.tsx` (server): `requireDownloadAdmin()`; se fallisce, `redirect('/login?callbackUrl=/admin/download')`. Metadata noindex, titolo "Area download | Pannello SWA".
- Create: `app/(it)/admin/download/DownloadAdmin.tsx` (client, Tailwind come le pagine `app/(it)/dashboard/*`)

**Interfaces:**
- Consumes: il contratto HTTP del Task 3; `validateFileMeta`, `validateItemText`, `normalizeLinkUrl`, `buildBlobPathname`, `moveItem`, `formatBytes`, `describeItem` (Task 1 e Task 5); `upload` da `@vercel/blob/client`.
- Produces: nessuna interfaccia (foglia).

- [x] **Step 1: Sezione "Link segreto".**
  - Mostra `${location.origin}/download/${code}` con il pulsante "Copia" (`navigator.clipboard.writeText`, conferma "Copiato").
  - "Genera nuovo link" chiede conferma con "Il link attuale smetterà di funzionare per tutti. Continuare?" e chiama `POST /api/admin/downloads/code`.
  - Senza codice, mostra solo "Genera il link".
  - Con `needs_migration`, mostra solo l'avviso "Database non pronto: applica la migrazione 052 (npm run migrate) e ricarica."
- [x] **Step 2: Sezione "Aggiungi".**
  - Due moduli. **File:** input file, titolo (precompilato dal nome del file), descrizione. Valida con `validateFileMeta` e `validateItemText` prima di caricare, poi `upload(buildBlobPathname(file.name), file, { access: 'public', handleUploadUrl: '/api/admin/downloads/upload', multipart: true, onUploadProgress })`, mostrando una barra percentuale, e infine `POST /api/admin/downloads` con `kind:'file'` e i dati del blob. **Link:** titolo, descrizione e URL, validato con `normalizeLinkUrl` (errore "Indirizzo non valido: usa un link https").
  - Un errore dopo il caricamento ("Il file è stato caricato ma la scheda non è stata creata: riprova") non perde i dati del modulo.
- [x] **Step 3: Elenco schede.**
  - Per ogni scheda: titolo e descrizione modificabili in linea ("Salva" chiama PATCH), un interruttore Visibile/Nascosto (PATCH `visible`), "Su"/"Giù" (`moveItem` + POST reorder; con 409 si ricarica l'elenco e compare il messaggio del server), "Elimina" con conferma ("Eliminare la scheda? Se è un file verrà cancellato.").
  - Accanto a ogni scheda il `meta` di `describeItem` e un link "Anteprima" che apre `href`.
- [x] **Step 4:** Run `npx tsc --noEmit -p tsconfig.json`, `npm run lint` e `npm run build` → tutti con exit 0. La build elenca `ƒ /admin/download`.
- [x] **Step 5: Commit** `"Add /admin/download panel"`.

### Task 7: Verifica finale e consegna

**Files:**
- Modify: `docs/superpowers/plans/2026-10-10-download-area.md`: spuntare i passi completati

- [x] **Step 1:** Run `npm test` → tutti i test passano, compresi quelli già esistenti. Run `npm run lint` e `npm run build` → exit 0.
- [x] **Step 2:** Controllare che nei file versionati non ci siano segreti: `git diff origin/main --stat` e `git diff origin/main | grep -iE "BLOB_READ_WRITE_TOKEN=|vercel-storage\.com/|[a-hjkmnp-z2-9]{16}"` → nessun valore reale (sono ammessi solo i nomi delle variabili e i codici di esempio dei test).
- [ ] **Step 3:** Fermarsi e riferire al titolare. Restano da fare, con la sua conferma:
  - push del branch;
  - migrazione 052 sul database;
  - verifica dello store Blob collegato al progetto `social-media`;
  - deploy e promozione in produzione;
  - prova completa secondo la sezione 6 della spec.
