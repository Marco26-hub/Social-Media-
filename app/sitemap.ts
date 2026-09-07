import type { MetadataRoute } from 'next'
import { dbReady, q } from '@/lib/db'
import { resolveBlogClienteIdForHost } from '@/lib/blog-tenant'
import { SITE_URL } from '@/lib/site-config'
import { SETTORI } from '@/lib/settori'
import { SETTORI_EN } from '@/lib/settori.en'
import { SWA_BLOG_ARTICLES } from '@/lib/swa-blog-content'

type PublishedArticle = { slug: string; updated_at: string | Date | null }

const ENGLISH_PAIRS: Record<string, string> = {
  '/': '/en',
  '/servizi': '/en/services',
  '/metodo': '/en/method',
  '/pacchetti': '/en/pricing',
  '/chi-siamo': '/en/about',
  '/faq': '/en/faq',
  '/contatti': '/en/contact',
  '/settori': '/en/settori',
  ...Object.fromEntries(SETTORI_EN.map(settore => [`/settori/${settore.slug}`, `/en/settori/${settore.slug}`])),
}

function languageAlternates(italianPath: string) {
  const englishPath = ENGLISH_PAIRS[italianPath]
  if (!englishPath) return undefined
  return {
    languages: {
      'it-IT': `${SITE_URL}${italianPath === '/' ? '' : italianPath}`,
      en: `${SITE_URL}${englishPath}`,
      'x-default': `${SITE_URL}${italianPath === '/' ? '' : italianPath}`,
    },
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Date per gruppo, non una sola per tutto.
  // Quarantadue URL con lo stesso identico istante e' il pattern che porta un
  // motore a ignorare lastmod per l'intero sito: si perde il segnale anche
  // quando una pagina cambia davvero. Aggiornare solo il gruppo toccato.
  const marketingUpdated = new Date('2026-09-07T00:00:00.000Z')
  const serviziUpdated = new Date('2026-09-07T12:00:00.000Z')
  const settoriUpdated = new Date('2026-09-07T09:00:00.000Z')
  const englishUpdated = new Date('2026-09-07T15:00:00.000Z')
  const legalUpdated = new Date('2026-08-11T00:00:00.000Z')

  const pages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: marketingUpdated,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: languageAlternates('/'),
    },
    {
      url: `${SITE_URL}/servizi`,
      lastModified: marketingUpdated,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: languageAlternates('/servizi'),
    },
    ...['/en', '/en/services', '/en/method', '/en/pricing', '/en/about', '/en/faq', '/en/contact', '/en/settori'].map(path => ({
      url: `${SITE_URL}${path}`,
      lastModified: englishUpdated,
      changeFrequency: 'monthly' as const,
      priority: path === '/en' ? 0.85 : 0.75,
      alternates: languageAlternates(Object.keys(ENGLISH_PAIRS).find(key => ENGLISH_PAIRS[key] === path) || ''),
    })),
    ...[
      '/servizi/gestione-social-media',
      '/servizi/seo-geo',
      '/servizi/blog-seo',
      '/servizi/siti-e-commerce',
      '/servizi/ricerca-clienti-b2b',
      '/servizi/segretaria-telefonica-ai',
      '/servizi/agenda-clienti-whatsapp',
      '/servizi/video-produzione',
      '/servizi/automazione-gestionali',
      '/servizi/gestione-lavorazioni',
      '/metodo',
      '/pacchetti',
      '/faq',
      '/contatti',
    ].map(path => ({
      url: `${SITE_URL}${path}`,
      lastModified: serviziUpdated,
      changeFrequency: 'monthly' as const,
      priority: path.startsWith('/servizi/') ? 0.85 : 0.75,
      alternates: languageAlternates(path),
    })),
    {
      url: `${SITE_URL}/settori`,
      lastModified: marketingUpdated,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: languageAlternates('/settori'),
    },
    ...SETTORI.map(settore => ({
      url: `${SITE_URL}/settori/${settore.slug}`,
      lastModified: settoriUpdated,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
      alternates: languageAlternates(`/settori/${settore.slug}`),
    })),
    ...SETTORI_EN.map(settore => ({
      url: `${SITE_URL}/en/settori/${settore.slug}`,
      lastModified: englishUpdated,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
      alternates: languageAlternates(`/settori/${settore.slug}`),
    })),
    {
      url: `${SITE_URL}/autore/marco-dibenedetto`,
      lastModified: marketingUpdated,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/chi-siamo`,
      lastModified: marketingUpdated,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: languageAlternates('/chi-siamo'),
    },
    {
      url: `${SITE_URL}/consulenza`,
      lastModified: marketingUpdated,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    { url: `${SITE_URL}/privacy`, lastModified: legalUpdated, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/cookie-policy`, lastModified: legalUpdated, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/termini`, lastModified: legalUpdated, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/recesso`, lastModified: legalUpdated, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/trasparenza-ai`, lastModified: legalUpdated, changeFrequency: 'yearly', priority: 0.4 },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(SWA_BLOG_ARTICLES[0].data_pubblicazione || marketingUpdated),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...SWA_BLOG_ARTICLES.map(article => ({
      url: `${SITE_URL}/blog/${article.slug}`,
      lastModified: new Date(article.data_pubblicazione || marketingUpdated),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]

  if (!dbReady()) return pages

  try {
    const clienteId = await resolveBlogClienteIdForHost(new URL(SITE_URL).hostname)
    if (!clienteId) return pages
    const articles = await q(
      `SELECT slug, updated_at
       FROM blog_articoli
       WHERE status = 'PUBBLICATO' AND cliente_id = $1
       ORDER BY updated_at DESC
       LIMIT 1000`,
      [clienteId],
    ) as PublishedArticle[]

    if (!articles.length) return pages
    const staticSlugs = new Set(SWA_BLOG_ARTICLES.map(article => article.slug))
    pages.push(...articles.filter(article => !staticSlugs.has(article.slug)).map(article => ({
      url: `${SITE_URL}/blog/${article.slug}`,
      lastModified: article.updated_at ? new Date(article.updated_at) : marketingUpdated,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })))
  } catch {
    return pages
  }

  return pages
}
