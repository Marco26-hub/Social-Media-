import { del, get, put, type PutBlobResult } from '@vercel/blob'
import type { DownloadItem } from '@/lib/downloads-shared'

export type { DownloadItem } from '@/lib/downloads-shared'

const CATALOG_PATHNAME = 'swa-download/catalog.json'
const FILES_PREFIX = 'swa-download/files/'

type DownloadCatalog = {
  version: 1
  items: DownloadItem[]
}

function emptyCatalog(): DownloadCatalog {
  return { version: 1, items: [] }
}

export function isDownloadStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN))
}

export function isDownloadPathname(pathname: string) {
  return pathname.startsWith(FILES_PREFIX) && !pathname.includes('..')
}

async function readCatalog(): Promise<DownloadCatalog> {
  if (!isDownloadStorageConfigured()) return emptyCatalog()

  const result = await get(CATALOG_PATHNAME, { access: 'public', useCache: false })
  if (!result || result.statusCode !== 200 || !result.stream) return emptyCatalog()

  try {
    const raw = await new Response(result.stream).text()
    const parsed = JSON.parse(raw) as Partial<DownloadCatalog>
    if (parsed.version !== 1 || !Array.isArray(parsed.items)) return emptyCatalog()
    return { version: 1, items: parsed.items.filter(isValidDownloadItem) }
  } catch {
    return emptyCatalog()
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
