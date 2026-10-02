import { del, get, head, put, type PutBlobResult } from '@vercel/blob'
import type { DownloadItem } from '@/lib/downloads-shared'

export type { DownloadItem } from '@/lib/downloads-shared'

const CATALOG_PATHNAME = 'swa-download/catalog.json'
const FILES_PREFIX = 'swa-download/files/'

type DownloadCatalog = {
  version: 1
  items: DownloadItem[]
}

export class DownloadStorageError extends Error {
  constructor(
    public readonly code: 'not_configured' | 'unavailable' | 'invalid_catalog',
    message: string,
  ) {
    super(message)
    this.name = 'DownloadStorageError'
  }
}

function emptyCatalog(): DownloadCatalog {
  return { version: 1, items: [] }
}

export function isDownloadStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN))
}

export function isDownloadStorageError(error: unknown): error is DownloadStorageError {
  return error instanceof DownloadStorageError
}

export function isDownloadPathname(pathname: string) {
  return pathname.startsWith(FILES_PREFIX) && !pathname.includes('..')
}

async function readCatalog(): Promise<DownloadCatalog> {
  // Questo catalogo è la fonte dati dei download: non esiste un fallback su DB
  // locale o un elenco fittizio. Un errore deve restare visibile a admin e log.
  if (!isDownloadStorageConfigured()) {
    throw new DownloadStorageError('not_configured', 'Storage download non configurato')
  }

  let result: Awaited<ReturnType<typeof get>>
  try {
    result = await get(CATALOG_PATHNAME, { access: 'public', useCache: false })
  } catch (error) {
    console.error('[downloads] catalog read failed:', error)
    throw new DownloadStorageError('unavailable', 'Storage download momentaneamente non disponibile')
  }

  // Il primo utilizzo non ha ancora un catalogo: è l'unico caso in cui un elenco
  // vuoto è valido. Tutti gli altri problemi restano errori espliciti.
  if (!result) return emptyCatalog()
  if (result.statusCode !== 200 || !result.stream) {
    console.error('[downloads] unexpected catalog response:', result.statusCode)
    throw new DownloadStorageError('unavailable', 'Storage download momentaneamente non disponibile')
  }

  try {
    const raw = await new Response(result.stream).text()
    const parsed = JSON.parse(raw) as Partial<DownloadCatalog>
    if (parsed.version !== 1 || !Array.isArray(parsed.items)) {
      throw new Error('Formato catalogo non supportato')
    }
    const items = parsed.items.filter(isValidDownloadItem)
    if (items.length !== parsed.items.length) {
      throw new Error('Il catalogo contiene materiali non validi')
    }
    return { version: 1, items }
  } catch (error) {
    console.error('[downloads] invalid catalog:', error)
    throw new DownloadStorageError('invalid_catalog', 'Catalogo download non valido')
  }
}

function isValidDownloadItem(value: unknown): value is DownloadItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<DownloadItem>
  return typeof item.id === 'string'
    && typeof item.title === 'string'
    && typeof item.description === 'string'
    && typeof item.originalName === 'string'
    && typeof item.pathname === 'string'
    && typeof item.url === 'string'
    && typeof item.downloadUrl === 'string'
    && typeof item.contentType === 'string'
    && typeof item.size === 'number'
    && typeof item.isPublished === 'boolean'
    && typeof item.createdAt === 'string'
    && typeof item.updatedAt === 'string'
}

async function writeCatalog(catalog: DownloadCatalog) {
  await put(CATALOG_PATHNAME, JSON.stringify(catalog), {
    access: 'public',
    contentType: 'application/json; charset=utf-8',
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  })
}

export async function getVerifiedDownloadBlob(pathname: string): Promise<Pick<PutBlobResult, 'pathname' | 'url' | 'downloadUrl' | 'contentType'>> {
  if (!isDownloadPathname(pathname)) throw new Error('Percorso file non consentito')
  if (!isDownloadStorageConfigured()) {
    throw new DownloadStorageError('not_configured', 'Storage download non configurato')
  }

  try {
    const blob = await head(pathname)
    if (!isDownloadPathname(blob.pathname)) throw new Error('Percorso file non consentito')
    return {
      pathname: blob.pathname,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      contentType: blob.contentType,
    }
  } catch (error) {
    if (error instanceof DownloadStorageError) throw error
    console.error('[downloads] uploaded file verification failed:', error)
    throw new DownloadStorageError('unavailable', 'Il file caricato non è verificabile nello storage')
  }
}

export async function listDownloads(includeHidden = false) {
  const catalog = await readCatalog()
  const items = includeHidden ? catalog.items : catalog.items.filter(item => item.isPublished)
  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}


export async function addDownload(input: {
  title: string
  description: string
  originalName: string
  blob: Pick<PutBlobResult, 'pathname' | 'url' | 'downloadUrl' | 'contentType'>
  size: number
}) {
  const catalog = await readCatalog()
  const now = new Date().toISOString()
  const item: DownloadItem = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    description: input.description.trim(),
    originalName: input.originalName,
    pathname: input.blob.pathname,
    url: input.blob.url,
    downloadUrl: input.blob.downloadUrl,
    contentType: input.blob.contentType,
    size: input.size,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }
  catalog.items.unshift(item)
  await writeCatalog(catalog)
  return item
}

export async function updateDownload(id: string, changes: Pick<DownloadItem, 'title' | 'description' | 'isPublished'>) {
  const catalog = await readCatalog()
  const item = catalog.items.find(entry => entry.id === id)
  if (!item) throw new Error('Materiale non trovato')

  item.title = changes.title.trim()
  item.description = changes.description.trim()
  item.isPublished = changes.isPublished
  item.updatedAt = new Date().toISOString()
  await writeCatalog(catalog)
  return item
}

export async function replaceDownload(id: string, input: {
  originalName: string
  blob: Pick<PutBlobResult, 'pathname' | 'url' | 'downloadUrl' | 'contentType'>
  size: number
}) {
  const catalog = await readCatalog()
  const item = catalog.items.find(entry => entry.id === id)
  if (!item) throw new Error('Materiale non trovato')

  const previousUrl = item.url
  item.originalName = input.originalName
  item.pathname = input.blob.pathname
  item.url = input.blob.url
  item.downloadUrl = input.blob.downloadUrl
  item.contentType = input.blob.contentType
  item.size = input.size
  item.updatedAt = new Date().toISOString()
  await writeCatalog(catalog)
  await del(previousUrl)
  return item
}

export async function removeDownload(id: string) {
  const catalog = await readCatalog()
  const position = catalog.items.findIndex(entry => entry.id === id)
  if (position === -1) throw new Error('Materiale non trovato')

  const [item] = catalog.items.splice(position, 1)
  await writeCatalog(catalog)
  await del(item.url)
}
