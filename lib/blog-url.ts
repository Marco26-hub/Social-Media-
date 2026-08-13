export function normalizeBlogDomain(value: string): string | null {
  const raw = value.trim()
  if (!raw) return null

  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) return null
    const hostname = url.hostname.toLowerCase().replace(/\.$/, '')
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(hostname)) return null
    return hostname
  } catch {
    return null
  }
}

export function publicBlogUrl(value: string): string {
  const domain = normalizeBlogDomain(value)
  return domain ? `https://${domain}/blog` : ''
}
