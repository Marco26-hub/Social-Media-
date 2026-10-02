export type DownloadItem = {
  id: string
  title: string
  description: string
  originalName: string
  pathname: string
  url: string
  downloadUrl: string
  contentType: string
  size: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export function createDownloadPathname(fileName: string) {
  const safeName = fileName
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'file'
  return `swa-download/files/${crypto.randomUUID()}-${safeName}`
}
