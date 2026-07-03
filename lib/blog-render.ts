// Render articoli blog → HTML (con JSON-LD Article + FAQPage per SEO/GEO) e Markdown.
// Funzioni PURE (nessuna dipendenza server): usabili sia nelle pagine pubbliche sia
// nell'export client-side della dashboard.

export type BlogArticleData = {
  slug: string
  meta_title: string
  meta_description: string | null
  h1: string
  intro: string | null
  sezioni: { h2: string; paragrafi: string[]; lista_punti?: string[] }[]
  faq: { domanda: string; risposta: string }[]
  cta_finale: string | null
  keywords_target: string[]
  immagine_cover: string | null
  autore: string
  tempo_lettura_min: number | null
  url_pubblicato?: string | null
  data_pubblicazione?: string | null
}

// jsonb dal DB può arrivare come stringa o oggetto: normalizza.
function asArray<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[]
  if (typeof v === 'string') { try { const p = JSON.parse(v); return Array.isArray(p) ? p : [] } catch { return [] } }
  return []
}

export function normalizeArticle(row: Record<string, unknown>): BlogArticleData {
  return {
    slug: String(row.slug || ''),
    meta_title: String(row.meta_title || row.h1 || ''),
    meta_description: (row.meta_description as string) ?? null,
    h1: String(row.h1 || ''),
    intro: (row.intro as string) ?? null,
    sezioni: asArray<{ h2: string; paragrafi: string[]; lista_punti?: string[] }>(row.sezioni),
    faq: asArray<{ domanda: string; risposta: string }>(row.faq),
    cta_finale: (row.cta_finale as string) ?? null,
    keywords_target: asArray<string>(row.keywords_target),
    immagine_cover: (row.immagine_cover as string) ?? null,
    autore: String(row.autore || 'Editorial'),
    tempo_lettura_min: (row.tempo_lettura_min as number) ?? null,
    url_pubblicato: (row.url_pubblicato as string) ?? null,
    data_pubblicazione: (row.data_pubblicazione as string) ?? null,
  }
}

const esc = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Accetta solo URL immagine http/https: blocca javascript:/data: (XSS via src).
// Ritorna null se lo schema non è sicuro, così il chiamante non persiste URL pericolosi.
export function safeImageUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null
  const u = url.trim()
  if (!u) return null
  return /^https?:\/\//i.test(u) ? u : null
}

// JSON-LD: Article + FAQPage. Le AI (ChatGPT/Perplexity) e Google lo usano per citare.
export function buildJsonLd(a: BlogArticleData, siteUrl?: string): object[] {
  const url = a.url_pubblicato || (siteUrl ? `${siteUrl.replace(/\/$/, '')}/blog/${a.slug}` : `/blog/${a.slug}`)
  const ld: object[] = [{
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.h1,
    description: a.meta_description || '',
    author: { '@type': 'Organization', name: a.autore },
    keywords: a.keywords_target.join(', '),
    ...(a.immagine_cover ? { image: a.immagine_cover } : {}),
    ...(a.data_pubblicazione ? { datePublished: a.data_pubblicazione } : {}),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }]
  if (a.faq.length) {
    ld.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: a.faq.map(f => ({
        '@type': 'Question',
        name: f.domanda,
        acceptedAnswer: { '@type': 'Answer', text: f.risposta },
      })),
    })
  }
  return ld
}

// CSS premium scoped a .silk-article: aggiungilo UNA volta al tema del blog,
// oppure è già incluso nell'export HTML completo. Tipografia editoriale luxury, responsive.
export const BLOG_CSS = `.silk-article{max-width:720px;margin:0 auto;padding:0 20px;font-family:Georgia,'Times New Roman',serif;color:#1c1a17;line-height:1.75;font-size:18px}
.silk-article .cover{width:100%;height:auto;border-radius:14px;margin:0 0 28px;display:block;object-fit:cover}
.silk-article h1{font-size:2.1rem;line-height:1.2;font-weight:700;margin:0 0 18px;color:#100f0d;letter-spacing:-.01em}
.silk-article h2{font-size:1.45rem;line-height:1.3;font-weight:700;margin:36px 0 14px;color:#100f0d}
.silk-article h3{font-size:1.12rem;font-weight:700;margin:24px 0 8px;color:#2a2622}
.silk-article p{margin:0 0 18px}
.silk-article .lead{font-size:1.18rem;color:#3a352f}
.silk-article ul{margin:0 0 18px;padding-left:22px}
.silk-article li{margin:0 0 8px}
.silk-article .faq{margin-top:36px;padding-top:24px;border-top:1px solid #ece7df}
.silk-article .cta{margin-top:32px;padding:18px 22px;background:#f6f1e9;border-left:3px solid #b08d57;border-radius:8px;font-weight:600;color:#5a4a32}
.silk-article .meta-row{font-size:.82rem;color:#8a8275;margin:0 0 24px;letter-spacing:.04em;text-transform:uppercase}
@media(max-width:640px){.silk-article{font-size:17px}.silk-article h1{font-size:1.7rem}.silk-article h2{font-size:1.28rem}}`

// Corpo articolo con classi (cover + h1 + intro + sezioni + faq + cta). Niente <style>/JSON-LD.
function buildInner(a: BlogArticleData): string {
  const cover = a.immagine_cover
    ? `    <img class="cover" src="${esc(a.immagine_cover)}" alt="${esc(a.h1)}" />\n`
    : ''
  const meta = a.tempo_lettura_min
    ? `    <p class="meta-row">${esc(a.autore)} · ${a.tempo_lettura_min} min</p>\n`
    : ''
  const sezioni = a.sezioni.map(s => {
    const ps = (s.paragrafi || []).map(p => `    <p>${esc(p)}</p>`).join('\n')
    const li = s.lista_punti?.length
      ? `\n    <ul>\n${s.lista_punti.map(x => `      <li>${esc(x)}</li>`).join('\n')}\n    </ul>`
      : ''
    return `    <h2>${esc(s.h2)}</h2>\n${ps}${li}`
  }).join('\n')
  const faq = a.faq.length
    ? `\n    <div class="faq">\n    <h2>Domande frequenti</h2>\n${a.faq.map(f => `    <h3>${esc(f.domanda)}</h3>\n    <p>${esc(f.risposta)}</p>`).join('\n')}\n    </div>`
    : ''
  return `${cover}    <h1>${esc(a.h1)}</h1>\n${meta}${a.intro ? `    <p class="lead">${esc(a.intro)}</p>\n` : ''}${sezioni}${faq}${a.cta_finale ? `\n    <p class="cta">${esc(a.cta_finale)}</p>` : ''}`
}

// Corpo AUTOSTILIZZATO: CSS premium integrato (scoped a .silk-article) + articolo.
// Si incolla così com'è in qualsiasi blog/CMS e ha già il layout premium, senza
// dover aggiungere CSS al tema.
export function renderBodyHtml(a: BlogArticleData): string {
  return `<style>\n${BLOG_CSS}\n</style>\n<div class="silk-article">\n${buildInner(a)}\n</div>`
}

// HTML completo AUTOSUFFICIENTE: <style> incluso + immagine + JSON-LD. Pronto da hostare/incollare.
export function renderHtml(a: BlogArticleData, siteUrl?: string): string {
  // Escape di < → <: se un campo contiene "</script>" spezzerebbe il tag
  // (XSS nell'HTML esportato incollato in CMS di terzi). Resta JSON-LD valido.
  const jsonld = `<script type="application/ld+json">\n${JSON.stringify(buildJsonLd(a, siteUrl), null, 2).replace(/</g, '\\u003c')}\n</script>`
  return `<!-- Meta SEO: title/description (anche nel JSON-LD sotto) -->
<!-- title: ${esc(a.meta_title)} -->
<!-- description: ${esc(a.meta_description || '')} -->
${jsonld}
${renderBodyHtml(a)}`
}

// JSON strutturato: il formato PIÙ facile da caricare in un admin custom.
// Campi separati + body_html (con classi) + css (da includere una volta) + json_ld SEO.
export function renderJson(a: BlogArticleData, siteUrl?: string): string {
  return JSON.stringify({
    slug: a.slug,
    title: a.meta_title,
    description: a.meta_description,
    h1: a.h1,
    cover_image: a.immagine_cover,
    keywords: a.keywords_target,
    reading_minutes: a.tempo_lettura_min,
    author: a.autore,
    body_html: renderBodyHtml(a),
    css: BLOG_CSS,
    json_ld: buildJsonLd(a, siteUrl),
  }, null, 2)
}

// Markdown (per siti headless / Next+Supabase / front matter).
export function renderMarkdown(a: BlogArticleData): string {
  const fm = [
    '---',
    `title: "${a.meta_title.replace(/"/g, '\\"')}"`,
    `description: "${(a.meta_description || '').replace(/"/g, '\\"')}"`,
    `slug: "${a.slug}"`,
    `keywords: [${a.keywords_target.map(k => `"${k}"`).join(', ')}]`,
    ...(a.immagine_cover ? [`cover: "${a.immagine_cover}"`] : []),
    `author: "${a.autore}"`,
    '---',
  ].join('\n')

  const body = a.sezioni.map(s => {
    const ps = (s.paragrafi || []).join('\n\n')
    const li = s.lista_punti?.length ? '\n\n' + s.lista_punti.map(x => `- ${x}`).join('\n') : ''
    return `## ${s.h2}\n\n${ps}${li}`
  }).join('\n\n')

  const faq = a.faq.length
    ? '\n\n## Domande frequenti\n\n' + a.faq.map(f => `**${f.domanda}**\n\n${f.risposta}`).join('\n\n')
    : ''

  return `${fm}\n\n# ${a.h1}\n\n${a.intro ? `**${a.intro}**\n\n` : ''}${body}${faq}${a.cta_finale ? `\n\n${a.cta_finale}` : ''}\n`
}
