// ─────────────────────────────────────────────────────────────────────────
// Ottimizzatore META TAG — skill "meta-tags-optimizer". Costruisce e valida title,
// meta description, canonical, robots, Open Graph e Twitter Card. Le lunghezze sono
// quelle che Google/social mostrano per intero senza troncare. Parte deterministica
// (build+validate) + prompt AI opzionale per generare varianti ad alto CTR.
// ─────────────────────────────────────────────────────────────────────────

// Regole di lunghezza (caratteri) per la resa piena nei SERP e nelle preview social.
export const SERP_LIMITS = {
  titleMin: 50,
  titleMax: 60,
  titleHardMax: 65, // oltre = troncamento con "..."
  descMin: 150,
  descMax: 160,
  descHardMax: 165,
  ogTitleMax: 60,
  ogDescMax: 110,
} as const

export type MetaInput = {
  title: string
  description: string
  url?: string
  imageUrl?: string
  siteName?: string
  locale?: string // es. it_IT
  type?: 'website' | 'article' | 'product'
  noindex?: boolean
  twitterHandle?: string // @brand
}

export type MetaTags = {
  title: string
  description: string
  canonical?: string
  robots: string
  og: Record<string, string>
  twitter: Record<string, string>
}

function trimTo(s: string, hardMax: number): string {
  const t = (s || '').replace(/\s+/g, ' ').trim()
  if (t.length <= hardMax) return t
  // Taglia all'ultima parola intera entro il limite (niente parole mozzate).
  return t.slice(0, hardMax).replace(/\s+\S*$/, '').trim()
}

export function buildMetaTags(i: MetaInput): MetaTags {
  const title = trimTo(i.title, SERP_LIMITS.titleHardMax)
  const description = trimTo(i.description, SERP_LIMITS.descHardMax)
  const locale = i.locale || 'it_IT'
  const type = i.type || 'website'
  const og: Record<string, string> = {
    'og:title': trimTo(i.title, SERP_LIMITS.ogTitleMax),
    'og:description': trimTo(i.description, SERP_LIMITS.ogDescMax),
    'og:type': type,
    'og:locale': locale,
  }
  if (i.url) og['og:url'] = i.url
  if (i.imageUrl) og['og:image'] = i.imageUrl
  if (i.siteName) og['og:site_name'] = i.siteName

  const twitter: Record<string, string> = {
    'twitter:card': i.imageUrl ? 'summary_large_image' : 'summary',
    'twitter:title': trimTo(i.title, SERP_LIMITS.ogTitleMax),
    'twitter:description': trimTo(i.description, SERP_LIMITS.ogDescMax),
  }
  if (i.imageUrl) twitter['twitter:image'] = i.imageUrl
  if (i.twitterHandle) twitter['twitter:site'] = i.twitterHandle

  return {
    title,
    description,
    canonical: i.url,
    robots: i.noindex ? 'noindex, nofollow' : 'index, follow',
    og,
    twitter,
  }
}

// Validazione onesta: elenca i problemi reali (troppo corto/lungo, keyword assente).
// warnings vuoto = meta ottimale. Non "aggiusta in silenzio": segnala.
export function validateMeta(tags: MetaTags, primaryKeyword?: string): { ok: boolean; warnings: string[] } {
  const w: string[] = []
  const tl = tags.title.length
  const dl = tags.description.length
  if (tl < SERP_LIMITS.titleMin) w.push(`Title corto (${tl} char): punta a ${SERP_LIMITS.titleMin}-${SERP_LIMITS.titleMax}.`)
  if (tl > SERP_LIMITS.titleMax) w.push(`Title lungo (${tl} char): Google può troncarlo oltre ${SERP_LIMITS.titleMax}.`)
  if (dl < SERP_LIMITS.descMin) w.push(`Description corta (${dl} char): punta a ${SERP_LIMITS.descMin}-${SERP_LIMITS.descMax}.`)
  if (dl > SERP_LIMITS.descMax) w.push(`Description lunga (${dl} char): può troncare oltre ${SERP_LIMITS.descMax}.`)
  if (primaryKeyword) {
    const kw = primaryKeyword.toLowerCase()
    if (!tags.title.toLowerCase().includes(kw)) w.push(`Keyword "${primaryKeyword}" assente dal title (idealmente in testa).`)
    if (!tags.description.toLowerCase().includes(kw)) w.push(`Keyword "${primaryKeyword}" assente dalla description.`)
  }
  return { ok: w.length === 0, warnings: w }
}

// Rende i meta tag come HTML pronto da incollare nell'<head>.
export function renderMetaHtml(tags: MetaTags): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const lines: string[] = [
    `<title>${esc(tags.title)}</title>`,
    `<meta name="description" content="${esc(tags.description)}" />`,
    `<meta name="robots" content="${esc(tags.robots)}" />`,
  ]
  if (tags.canonical) lines.push(`<link rel="canonical" href="${esc(tags.canonical)}" />`)
  for (const [k, v] of Object.entries(tags.og)) lines.push(`<meta property="${esc(k)}" content="${esc(v)}" />`)
  for (const [k, v] of Object.entries(tags.twitter)) lines.push(`<meta name="${esc(k)}" content="${esc(v)}" />`)
  return lines.join('\n')
}

// Prompt AI per generare VARIANTI ad alto CTR (title + description) grounded sul
// brand. L'AI propone, poi buildMetaTags+validateMeta fanno da rete di sicurezza
// deterministica sui limiti di lunghezza. Trigger/formule dalla skill meta-tags.
export function metaOptimizePrompt(p: {
  brandBlock: string
  content: string
  primaryKeyword?: string
  secondaryKeywords?: string[]
  url?: string
}): string {
  return `Sei un SEO copywriter senior specializzato in title tag e meta description ad alto CTR.

BRAND:
${p.brandBlock}

KEYWORD PRIMARIA: ${p.primaryKeyword || '(deducila dal contenuto)'}
KEYWORD SECONDARIE: ${(p.secondaryKeywords || []).join(', ') || '(nessuna)'}
${p.url ? `URL: ${p.url}` : ''}

CONTENUTO / PAGINA:
${p.content.slice(0, 4000)}

Genera 3 varianti di title tag e 3 di meta description ottimizzate per la SERP di Google.
REGOLE FERREE:
- Title: 50-60 caratteri, keyword primaria all'inizio, un beneficio o trigger emotivo, nome brand se ci sta.
- Description: 150-160 caratteri, include keyword primaria + una CTA ("Scopri", "Ordina", "Leggi la guida"), invoglia il click senza clickbait.
- Trigger CTR consentiti: numeri, "2026", parentesi, domanda, beneficio ultra-specifico. Vietato inventare prezzi/sconti/dati non forniti.
- Ogni variante deve avere un angolo diverso (beneficio / urgenza / curiosità).

Rispondi SOLO con JSON valido:
{"titles":[{"text":"","chars":0,"angle":""}],"descriptions":[{"text":"","chars":0,"cta":"","angle":""}],"recommended":{"title":"","description":""}}`
}
