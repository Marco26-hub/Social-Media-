type ContentRow = Record<string, unknown>

export function hasFinalCampaignAsset(row: ContentRow): boolean {
  if (String(row.campaign_content_key || '').trim()) return true

  const paths = row.campaign_source_paths
  if (Array.isArray(paths)) return paths.length > 0
  if (typeof paths !== 'string') return false

  const normalized = paths.trim().toLowerCase()
  if (!normalized || normalized === '[]' || normalized === 'null') return false
  try {
    const parsed = JSON.parse(paths)
    return Array.isArray(parsed) ? parsed.length > 0 : Boolean(parsed)
  } catch {
    return true
  }
}

export function requiresRenderedVisualReview(row: ContentRow): boolean {
  return !hasFinalCampaignAsset(row)
}
