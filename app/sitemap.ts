import type { MetadataRoute } from 'next'
import { dbReady, q } from '@/lib/db'
import { resolveBlogClienteIdForHost } from '@/lib/blog-tenant'
import { SITE_URL } from '@/lib/site-config'
import { SWA_BLOG_ARTICLES } from '@/lib/swa-blog-content'

type PublishedArticle = { slug: string; updated_at: string | Date | null }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const marketingUpdated = new Date('2026-08-11T00:00:00.000Z')
  const legalUpdated = new Date('2026-07-28T00:00:00.000Z')

  const pages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: marketingUpdated,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/servizi`,
      lastModified: marketingUpdated,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...[
      '/servizi/gestione-social-media',
      '/servizi/seo-geo',
      '/servizi/siti-e-commerce',
      '/metodo',
      '/pacchetti',
      '/faq',
    ].map(path => ({
      url: `${SITE_URL}${path}`,
      lastModified: marketingUpdated,
      changeFrequency: 'monthly' as const,
      priority: path.startsWith('/servizi/') ? 0.85 : 0.75,
    })),
    {
      url: `${SITE_URL}/chi-siamo`,
      lastModified: marketingUpdated,
      changeFrequency: 'monthly',
      priority: 0.7,
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
