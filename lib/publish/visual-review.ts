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
    // FAIL-CLOSED. Questo valore decide se il montaggio puo essere pubblicato
    // SENZA che nessuno lo guardi (vedi requiresRenderedVisualReview): un dato
    // illeggibile deve chiudere il cancello, non aprirlo. Prima un
    // campaign_source_paths corrotto veniva scambiato per "asset finale gia
    // approvato" e il video usciva senza revisione.
    return false
  }
}

export function requiresRenderedVisualReview(row: ContentRow): boolean {
  return !hasFinalCampaignAsset(row)
}
