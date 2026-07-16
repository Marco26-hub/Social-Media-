// ─────────────────────────────────────────────────────────────────────────
// Generatore JSON-LD (Schema.org) DETERMINISTICO — skill "schema-markup-generator".
// Nessuna AI: mappa dati reali (brand, prodotto, contenuto) sui tipi Schema.org che
// abilitano i rich result Google (Article/BlogPosting, Product, FAQPage, HowTo,
// BreadcrumbList, Organization, LocalBusiness). Zero campi inventati: se un dato
// manca, il campo viene omesso (non riempito con un placeholder finto).
// ─────────────────────────────────────────────────────────────────────────

export type JsonLd = Record<string, unknown>

const SCHEMA_CTX = 'https://schema.org'

// Rimuove chiavi vuote/nulle in profondità: un JSON-LD con campi vuoti è peggio che
// senza (Google segnala warning). Meglio omettere che dichiarare il falso.
function clean<T>(obj: T): T {
  if (Array.isArray(obj)) {
    const arr = obj.map(clean).filter(v => v !== undefined && v !== null && v !== '')
    return (arr.length ? arr : undefined) as unknown as T
  }
  if (obj && typeof obj === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) {
      const cv = clean(v)
      if (cv !== undefined && cv !== null && cv !== '') out[k] = cv
    }
    return (Object.keys(out).length ? out : undefined) as unknown as T
  }
  return obj
}

export type OrganizationInput = {
  name: string
  url?: string
  logo?: string
  description?: string
  sameAs?: string[] // profili social/ufficiali
  email?: string
  telephone?: string
}
export function organizationSchema(i: OrganizationInput): JsonLd {
  return clean({
    '@context': SCHEMA_CTX,
    '@type': 'Organization',
    name: i.name,
    url: i.url,
    logo: i.logo,
    description: i.description,
    sameAs: i.sameAs,
    email: i.email,
    telephone: i.telephone,
  })
}

export type WebsiteInput = { name: string; url: string; searchUrlTemplate?: string }
export function websiteSchema(i: WebsiteInput): JsonLd {
  return clean({
    '@context': SCHEMA_CTX,
    '@type': 'WebSite',
    name: i.name,
    url: i.url,
    potentialAction: i.searchUrlTemplate
      ? {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: i.searchUrlTemplate },
          'query-input': 'required name=search_term_string',
        }
      : undefined,
  })
}

export type ArticleInput = {
  headline: string
  description?: string
  url?: string
  image?: string | string[]
  authorName?: string
  publisherName?: string
  publisherLogo?: string
  datePublished?: string // ISO
  dateModified?: string
  keywords?: string[]
  articleBody?: string
}
// BlogPosting è il sottotipo giusto per articoli di blog (più specifico di Article).
export function articleSchema(i: ArticleInput): JsonLd {
  return clean({
    '@context': SCHEMA_CTX,
    '@type': 'BlogPosting',
    headline: i.headline?.slice(0, 110), // Google tronca gli headline > 110 char
    description: i.description,
    image: i.image,
    author: i.authorName ? { '@type': 'Organization', name: i.authorName } : undefined,
    publisher: i.publisherName
      ? {
          '@type': 'Organization',
          name: i.publisherName,
          logo: i.publisherLogo ? { '@type': 'ImageObject', url: i.publisherLogo } : undefined,
        }
      : undefined,
    datePublished: i.datePublished,
    dateModified: i.dateModified || i.datePublished,
    mainEntityOfPage: i.url ? { '@type': 'WebPage', '@id': i.url } : undefined,
    keywords: i.keywords?.length ? i.keywords.join(', ') : undefined,
    articleBody: i.articleBody,
  })
}

export type ProductInput = {
  name: string
  description?: string
  image?: string | string[]
  url?: string
  brandName?: string
  sku?: string
  price?: string | number
  currency?: string // ISO 4217, es. EUR
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
  ratingValue?: number
  reviewCount?: number
}
export function productSchema(i: ProductInput): JsonLd {
  const priceNum = i.price != null && String(i.price).trim() !== '' ? String(i.price).replace(/[^\d.,]/g, '').replace(',', '.') : ''
  return clean({
    '@context': SCHEMA_CTX,
    '@type': 'Product',
    name: i.name,
    description: i.description,
    image: i.image,
    sku: i.sku,
    brand: i.brandName ? { '@type': 'Brand', name: i.brandName } : undefined,
    // Offer solo se c'è un prezzo REALE: niente offerte fantasma.
    offers: priceNum
      ? clean({
          '@type': 'Offer',
          price: priceNum,
          priceCurrency: i.currency || 'EUR',
          availability: `https://schema.org/${i.availability || 'InStock'}`,
          url: i.url,
        })
      : undefined,
    // AggregateRating solo con numeri reali (Google penalizza i rating inventati).
    aggregateRating:
      typeof i.ratingValue === 'number' && typeof i.reviewCount === 'number' && i.reviewCount > 0
        ? { '@type': 'AggregateRating', ratingValue: i.ratingValue, reviewCount: i.reviewCount }
        : undefined,
  })
}

export type FaqItem = { domanda?: string; question?: string; risposta?: string; answer?: string }
export function faqPageSchema(items: FaqItem[]): JsonLd | null {
  const qa = (items || [])
    .map(x => ({ q: (x.domanda || x.question || '').trim(), a: (x.risposta || x.answer || '').trim() }))
    .filter(x => x.q && x.a)
  if (!qa.length) return null
  return clean({
    '@context': SCHEMA_CTX,
    '@type': 'FAQPage',
    mainEntity: qa.map(x => ({
      '@type': 'Question',
      name: x.q,
      acceptedAnswer: { '@type': 'Answer', text: x.a },
    })),
  })
}

export type HowToStep = { name?: string; text: string; image?: string; url?: string }
export function howToSchema(i: { name: string; steps: HowToStep[]; description?: string; totalTime?: string }): JsonLd | null {
  const steps = (i.steps || []).filter(s => s?.text?.trim())
  if (!steps.length) return null
  return clean({
    '@context': SCHEMA_CTX,
    '@type': 'HowTo',
    name: i.name,
    description: i.description,
    totalTime: i.totalTime, // formato ISO 8601 durata, es. PT30M
    step: steps.map((s, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: s.name || `Step ${idx + 1}`,
      text: s.text,
      image: s.image,
      url: s.url,
    })),
  })
}

export type BreadcrumbItem = { name: string; url: string }
export function breadcrumbSchema(items: BreadcrumbItem[]): JsonLd | null {
  const list = (items || []).filter(x => x?.name && x?.url)
  if (!list.length) return null
  return clean({
    '@context': SCHEMA_CTX,
    '@type': 'BreadcrumbList',
    itemListElement: list.map((x, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: x.name,
      item: x.url,
    })),
  })
}

export type LocalBusinessInput = {
  name: string
  url?: string
  image?: string
  telephone?: string
  priceRange?: string
  streetAddress?: string
  city?: string
  postalCode?: string
  region?: string
  country?: string
  latitude?: number
  longitude?: number
  openingHours?: string[] // es. ["Mo-Fr 09:00-18:00"]
}
export function localBusinessSchema(i: LocalBusinessInput): JsonLd {
  return clean({
    '@context': SCHEMA_CTX,
    '@type': 'LocalBusiness',
    name: i.name,
    url: i.url,
    image: i.image,
    telephone: i.telephone,
    priceRange: i.priceRange,
    address:
      i.streetAddress || i.city || i.postalCode
        ? {
            '@type': 'PostalAddress',
            streetAddress: i.streetAddress,
            addressLocality: i.city,
            postalCode: i.postalCode,
            addressRegion: i.region,
            addressCountry: i.country || 'IT',
          }
        : undefined,
    geo:
      typeof i.latitude === 'number' && typeof i.longitude === 'number'
        ? { '@type': 'GeoCoordinates', latitude: i.latitude, longitude: i.longitude }
        : undefined,
    openingHours: i.openingHours,
  })
}

// Campi minimi richiesti per l'idoneità ai rich result Google, per tipo. Ritorna la
// lista dei campi mancanti (vuota = valido). Onesto: segnala i buchi, non li nasconde.
const REQUIRED_BY_TYPE: Record<string, string[]> = {
  Organization: ['name'],
  WebSite: ['name', 'url'],
  BlogPosting: ['headline'],
  Article: ['headline'],
  Product: ['name'],
  FAQPage: ['mainEntity'],
  HowTo: ['name', 'step'],
  BreadcrumbList: ['itemListElement'],
  LocalBusiness: ['name'],
}
export function validateSchema(schema: JsonLd | null): { ok: boolean; type: string; missing: string[] } {
  if (!schema || typeof schema !== 'object') return { ok: false, type: 'unknown', missing: ['schema'] }
  const type = String((schema as Record<string, unknown>)['@type'] || 'unknown')
  const required = REQUIRED_BY_TYPE[type] || []
  const missing = required.filter(f => {
    const v = (schema as Record<string, unknown>)[f]
    return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)
  })
  return { ok: missing.length === 0, type, missing }
}

// Serializza uno o più schemi nel tag <script> pronto da incollare nell'<head>.
export function renderJsonLdHtml(schema: JsonLd | JsonLd[]): string {
  const payload = Array.isArray(schema) ? schema.filter(Boolean) : schema
  return `<script type="application/ld+json">\n${JSON.stringify(payload, null, 2)}\n</script>`
}
