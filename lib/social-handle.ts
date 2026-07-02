// Handle social mostrato nelle preview (@nome su IG/TikTok/Threads/X, nome pagina su FB/LinkedIn/Pinterest/YouTube).
// Default derivato dal nome brand (es. "SILKinCOM" -> "silkincom.official"), oppure override manuale da brand.social_handle.

const AT_CANALI = new Set(['instagram', 'tiktok', 'threads', 'x'])

export function deriveHandleSlug(brandName: string): string {
  const slug = brandName
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // rimuove accenti
    .replace(/[^a-z0-9]+/g, '')
  return slug ? `${slug}.official` : 'brand.official'
}

export function resolveHandle(
  canale: string,
  brand?: { brand_name?: string | null; social_handle?: string | null } | null,
): string {
  const raw = brand?.social_handle?.trim() || (brand?.brand_name ? deriveHandleSlug(brand.brand_name) : '') || 'brand.official'
  const slug = raw.replace(/^@/, '')
  if (AT_CANALI.has(canale)) return `@${slug}`
  // Display name per canali "a pagina": capitalizza ogni parola separata da punti/underscore
  return slug
    .split(/[._]/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
