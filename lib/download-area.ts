// Logica pura dell'area download segreta (/download/<codice>): nessun DB, nessuna
// rete, nessun import di Next. Gira sia sul server sia nel browser (il pannello
// admin la importa per validare prima dell'upload), quindi niente `node:crypto`.

export const ACCESS_CODE_LENGTH = 16
export const MAX_FILE_BYTES = 250 * 1024 * 1024
export const DOWNLOAD_BLOB_PREFIX = 'swa-download/files/'

// Estensione → MIME. Il tipo salvato lo decidiamo noi dall'estensione: quello
// dichiarato dal browser è client-controllato e spesso vuoto o diverso (es. lo zip).
export const ALLOWED_FILE_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  zip: 'application/zip',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  mp4: 'video/mp4',
  txt: 'text/plain',
  md: 'text/markdown',
  csv: 'text/csv',
  json: 'application/json',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
}

const TITLE_MAX = 120
const DESCRIPTION_MAX = 600
const LINK_MAX = 2048
const BLOB_BASE_MAX = 80

// Senza 0, o, 1, l, i: il codice si legge e si detta senza ambiguità.
const CODE_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'
// Multiplo dell'alfabeto (31 * 8): i byte >= 248 vengono scartati, altrimenti
// il modulo favorirebbe i primi caratteri.
const CODE_BYTE_LIMIT = CODE_ALPHABET.length * 8
const CODE_PATTERN = new RegExp(`^[${CODE_ALPHABET}]{${ACCESS_CODE_LENGTH}}$`)

export function generateAccessCode(): string {
  let code = ''
  while (code.length < ACCESS_CODE_LENGTH) {
    const bytes = globalThis.crypto.getRandomValues(new Uint8Array(ACCESS_CODE_LENGTH * 2))
    for (const byte of bytes) {
      if (byte >= CODE_BYTE_LIMIT) continue
      code += CODE_ALPHABET[byte % CODE_ALPHABET.length]
      if (code.length === ACCESS_CODE_LENGTH) break
    }
  }
  return code
}

// Il codice può arrivare digitato a mano o incollato con spazi e trattini.
// Restituisce la forma canonica oppure null: mai usare l'input grezzo come chiave.
export function normalizeAccessCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const code = raw.toLowerCase().replace(/[\s-]+/g, '')
  return CODE_PATTERN.test(code) ? code : null
}

// Dominio senza schema (es. "github.com/marco/repo"): solo host con un TLD
// plausibile, opzionale porta, poi percorso/query o fine stringa.
const SCHEMELESS_DOMAIN = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}(:\d+)?([/?#]|$)/i

// Link da mostrare nell'area download: solo http(s), sempre promosso a https.
// Scarta credenziali nell'URL e tutto ciò che non è un indirizzo web assoluto.
export function normalizeLinkUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const input = raw.trim()
  if (!input || input.length > LINK_MAX) return null
  const candidate = SCHEMELESS_DOMAIN.test(input) ? `https://${input}` : input
  let url: URL
  try {
    url = new URL(candidate)
  } catch {
    return null
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
  if (url.username || url.password) return null
  url.protocol = 'https:'
  // L'href può essere più lungo dell'input (percent-encoding): ricontrollo.
  return url.href.length > LINK_MAX ? null : url.href
}

function fileExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot < 0 ? '' : name.slice(dot + 1).trim().toLowerCase()
}

type FileMeta = { name: string; size: number; contentType?: string | null }
type FileMetaResult =
  | { ok: true; extension: string; contentType: string }
  | { ok: false; error: string }

// `contentType` dichiarato dal client è volutamente ignorato: vale il MIME
// canonico dell'estensione (vedi ALLOWED_FILE_TYPES).
export function validateFileMeta(meta: FileMeta): FileMetaResult {
  const extension = fileExtension(meta.name)
  if (!extension || !Object.hasOwn(ALLOWED_FILE_TYPES, extension)) {
    return { ok: false, error: 'Tipo di file non ammesso: usa PDF, ZIP, immagini o documenti Office.' }
  }
  // `!(size > 0)` copre anche NaN.
  if (!(meta.size > 0)) return { ok: false, error: 'Il file è vuoto.' }
  if (meta.size > MAX_FILE_BYTES) {
    return { ok: false, error: `Il file supera il limite di ${formatBytes(MAX_FILE_BYTES)}.` }
  }
  return { ok: true, extension, contentType: ALLOWED_FILE_TYPES[extension] }
}

type ItemTextResult =
  | { ok: true; title: string; description: string | null }
  | { ok: false; error: string }
type DescriptionResult = { ok: true; description: string | null } | { ok: false; error: string }

function validateDescription(raw: unknown): DescriptionResult {
  if (raw === undefined || raw === null) return { ok: true, description: null }
  if (typeof raw !== 'string') return { ok: false, error: 'La descrizione non è valida.' }
  // La descrizione può andare a capo: qui si tolgono solo i bordi.
  const description = raw.trim()
  if (description.length > DESCRIPTION_MAX) {
    return { ok: false, error: `La descrizione può avere al massimo ${DESCRIPTION_MAX} caratteri.` }
  }
  return { ok: true, description: description || null }
}

export function validateItemText(input: { title: unknown; description?: unknown }): ItemTextResult {
  if (typeof input.title !== 'string') return { ok: false, error: 'Inserisci un titolo.' }
  // Il titolo sta su una riga: spazi multipli e a capo diventano uno spazio solo.
  const title = input.title.replace(/\s+/g, ' ').trim()
  if (!title) return { ok: false, error: 'Inserisci un titolo.' }
  if (title.length > TITLE_MAX) {
    return { ok: false, error: `Il titolo può avere al massimo ${TITLE_MAX} caratteri.` }
  }

  const parsed = validateDescription(input.description)
  return parsed.ok ? { ok: true, title, description: parsed.description } : parsed
}

// Scambia l'elemento con il vicino. Non muta l'array e agli estremi (o con id
// sconosciuto) restituisce una copia invariata.
export function moveItem(ids: string[], id: string, direction: 'up' | 'down'): string[] {
  const next = [...ids]
  const from = next.indexOf(id)
  const to = direction === 'up' ? from - 1 : from + 1
  if (from < 0 || to < 0 || to >= next.length) return next
  ;[next[from], next[to]] = [next[to], next[from]]
  return next
}

const BYTE_UNITS = ['KB', 'MB', 'GB']

export function formatBytes(bytes: number): string {
  if (!(bytes >= 1024)) return `${Math.max(0, Math.round(bytes) || 0)} B`
  let value = bytes / 1024
  let unit = 0
  // Il confronto sul valore arrotondato evita "1.024 KB" al posto di "1 MB".
  while (Math.round(value * 10) / 10 >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toLocaleString('it-IT', { maximumFractionDigits: 1 })} ${BYTE_UNITS[unit]}`
}

// Nome del blob leggibile e sicuro: il suffisso casuale lo aggiunge lo storage.
// Estensione e base si separano sull'ultimo punto; i punti restanti nella base
// diventano trattini così il pathname non contiene mai ".." o segmenti strani.
export function buildBlobPathname(fileName: string): string {
  const dot = fileName.lastIndexOf('.')
  const rawBase = dot < 0 ? fileName : fileName.slice(0, dot)
  const extension = dot < 0 ? '' : fileName.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '')
  const base = rawBase
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, BLOB_BASE_MAX)
    .replace(/-+$/g, '') || 'file'
  return `${DOWNLOAD_BLOB_PREFIX}${base}${extension ? `.${extension}` : ''}`
}

export function isDownloadBlobPathname(pathname: string): boolean {
  return (
    typeof pathname === 'string' &&
    pathname.startsWith(DOWNLOAD_BLOB_PREFIX) &&
    !pathname.includes('..') &&
    !pathname.includes('//')
  )
}

// ---- Parser dei body delle API admin ---------------------------------------
// Il body arriva da `request.json()`, quindi è `unknown`: qui si controlla tutto
// e si restituisce solo ciò che le route possono salvare.

type PlainObject = Record<string, unknown>

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const FILE_NAME_MAX = 255

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export type CreateItemValue =
  | { kind: 'link'; title: string; description: string | null; url: string }
  | {
      kind: 'file'
      title: string
      description: string | null
      blob: { url: string; downloadUrl: string; pathname: string; contentType: string; size: number; fileName: string }
    }
type CreateItemResult = { ok: true; value: CreateItemValue } | { ok: false; error: string }

export function parseCreateItemBody(body: unknown): CreateItemResult {
  if (!isPlainObject(body)) return { ok: false, error: 'Richiesta non valida.' }
  if (body.kind !== 'link' && body.kind !== 'file') return { ok: false, error: 'Tipo di scheda non valido.' }

  const text = validateItemText({ title: body.title, description: body.description })
  if (!text.ok) return text
  const { title, description } = text

  if (body.kind === 'link') {
    const url = normalizeLinkUrl(body.url)
    if (!url) return { ok: false, error: 'Inserisci un link valido (http o https).' }
    return { ok: true, value: { kind: 'link', title, description, url } }
  }

  const blob = body.blob
  if (!isPlainObject(blob)) return { ok: false, error: 'Dati del file mancanti.' }
  const { url, downloadUrl, pathname, fileName, size } = blob
  if (!isHttpsUrl(url) || !isHttpsUrl(downloadUrl)) return { ok: false, error: 'Indirizzo del file non valido.' }
  // isDownloadBlobPathname accetta anche il solo prefisso: nome e tipo si validano sotto con validateFileMeta.
  if (typeof pathname !== 'string' || !isDownloadBlobPathname(pathname)) {
    return { ok: false, error: 'Percorso del file non valido.' }
  }
  if (
    typeof fileName !== 'string' ||
    !fileName.trim() ||
    fileName.length > FILE_NAME_MAX ||
    /\p{Cc}/u.test(fileName)
  ) {
    return { ok: false, error: 'Nome del file non valido.' }
  }
  if (typeof size !== 'number' || !Number.isInteger(size)) return { ok: false, error: 'Dimensione del file non valida.' }

  // Il tipo salvato è quello canonico dell'estensione, mai quello dichiarato dal client.
  const meta = validateFileMeta({ name: fileName, size, contentType: typeof blob.contentType === 'string' ? blob.contentType : null })
  if (!meta.ok) return meta
  return {
    ok: true,
    value: { kind: 'file', title, description, blob: { url, downloadUrl, pathname, contentType: meta.contentType, size, fileName } },
  }
}

export type UpdateItemValue = { title?: string; description?: string | null; visible?: boolean }
type UpdateItemResult = { ok: true; value: UpdateItemValue } | { ok: false; error: string }

// PATCH parziale: valgono solo i campi presenti, ma ce ne deve essere almeno uno.
export function parseUpdateItemBody(body: unknown): UpdateItemResult {
  if (!isPlainObject(body)) return { ok: false, error: 'Richiesta non valida.' }
  const value: UpdateItemValue = {}

  if (body.title !== undefined) {
    const text = validateItemText({ title: body.title })
    if (!text.ok) return text
    value.title = text.title
  }
  if (body.description !== undefined) {
    const parsed = validateDescription(body.description)
    if (!parsed.ok) return parsed
    value.description = parsed.description
  }
  if (body.visible !== undefined) {
    if (typeof body.visible !== 'boolean') return { ok: false, error: 'La visibilità non è valida.' }
    value.visible = body.visible
  }

  if (Object.keys(value).length === 0) return { ok: false, error: 'Nessuna modifica da salvare.' }
  return { ok: true, value }
}

// Il nuovo ordine deve contenere esattamente le schede che esistono ora: se nel
// frattempo ne è stata creata o eliminata una, l'elenco del client è vecchio.
export function validateReorder(
  ids: unknown,
  currentIds: string[],
): { ok: true; ids: string[] } | { ok: false; error: string } {
  if (!Array.isArray(ids) || !ids.every(id => typeof id === 'string')) {
    return { ok: false, error: 'Elenco non valido.' }
  }
  const unique = new Set(ids)
  if (unique.size !== ids.length) return { ok: false, error: 'L’elenco contiene schede ripetute.' }
  if (ids.length !== currentIds.length || !currentIds.every(id => unique.has(id))) {
    return { ok: false, error: 'L’elenco è cambiato, ricarica la pagina.' }
  }
  return { ok: true, ids: ids as string[] }
}

// Solo per mostrare la fonte del link: se l'URL non è valido si ricade sul testo.
export function linkHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
