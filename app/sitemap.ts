import type { MetadataRoute } from 'next'
import { dbReady, q } from '@/lib/db'
import { resolveBlogClienteIdForHost } from '@/lib/blog-tenant'
import { SITE_URL } from '@/lib/site-config'
import { SETTORI } from '@/lib/settori'
import { SETTORI_EN } from '@/lib/settori.en'
import { SERVIZI_EN } from '@/lib/servizi.en'
// Le coppie reciproche, non quelle del cambio lingua: hreflang e' una
// dichiarazione di equivalenza fra due pagine, e vale solo se e' vera in
// tutte e due le direzioni.
import { TRADUZIONI as ENGLISH_PAIRS } from '@/lib/lingue'
import { SWA_BLOG_ARTICLES } from '@/lib/swa-blog-content'
import { SWA_BLOG_ARTICLES_EN } from '@/lib/swa-blog-content.en'

type PublishedArticle = { slug: string; updated_at: string | Date | null }


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
      '/servizi/gestionale-ristoranti',
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
    // Le schede di servizio tradotte. La coppia la dichiara il servizio stesso,
    // quindi non c'e' un secondo elenco da tenere allineato.
    // Le pagine legali inglesi. Le italiane hanno gia' la loro riga altrove:
    // qui ci sono le gemelle, che senza questa aggiunta sarebbero pubblicate e
    // invisibili.
    ...[
      ['/en/privacy', '/privacy'],
      ['/en/cookie-policy', '/cookie-policy'],
      ['/en/terms', '/termini'],
      ['/en/ai-transparency', '/trasparenza-ai'],
      ['/en/withdrawal', '/recesso'],
      ['/en/security', '/sicurezza'],
      ['/en/accessibility', '/accessibilita'],
    ].map(([en, it]) => ({
      url: `${SITE_URL}${en}`,
      lastModified: legalUpdated,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
      alternates: languageAlternates(it),
    })),
    // Le due landing inglesi: non passano da SERVIZI_EN perche' hanno un
    // componente proprio, ma la coppia e' reciproca come le altre.
    ...[
      ['/en/services/ai-phone-assistant', '/servizi/segretaria-telefonica-ai'],
      ['/en/services/client-diary-whatsapp', '/servizi/agenda-clienti-whatsapp'],
      ['/en/services/restaurant-management-system', '/servizi/gestionale-ristoranti'],
    ].map(([en, it]) => ({
      url: `${SITE_URL}${en}`,
      lastModified: englishUpdated,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
      alternates: languageAlternates(it),
    })),
    {
      url: `${SITE_URL}/en/legal-advice`,
      lastModified: englishUpdated,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: languageAlternates('/consulenza'),
    },
    ...SERVIZI_EN.map(servizio => ({
      url: `${SITE_URL}/en/services/${servizio.slug}`,
      lastModified: englishUpdated,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
      alternates: languageAlternates(servizio.slugIt),
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
      alternates: languageAlternates('/autore/marco-dibenedetto'),
    },
    {
      url: `${SITE_URL}/en/author/marco-dibenedetto`,
      lastModified: englishUpdated,
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: languageAlternates('/autore/marco-dibenedetto'),
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
      alternates: languageAlternates('/consulenza'),
    },
    { url: `${SITE_URL}/privacy`, lastModified: legalUpdated, changeFrequency: 'yearly', priority: 0.3, alternates: languageAlternates('/privacy') },
    { url: `${SITE_URL}/cookie-policy`, lastModified: legalUpdated, changeFrequency: 'yearly', priority: 0.3, alternates: languageAlternates('/cookie-policy') },
    { url: `${SITE_URL}/termini`, lastModified: legalUpdated, changeFrequency: 'yearly', priority: 0.3, alternates: languageAlternates('/termini') },
    { url: `${SITE_URL}/recesso`, lastModified: legalUpdated, changeFrequency: 'yearly', priority: 0.3, alternates: languageAlternates('/recesso') },
    { url: `${SITE_URL}/trasparenza-ai`, lastModified: legalUpdated, changeFrequency: 'yearly', priority: 0.4, alternates: languageAlternates('/trasparenza-ai') },
    { url: `${SITE_URL}/accessibilita`, lastModified: legalUpdated, changeFrequency: 'yearly', priority: 0.4, alternates: languageAlternates('/accessibilita') },
    { url: `${SITE_URL}/sicurezza`, lastModified: legalUpdated, changeFrequency: 'yearly', priority: 0.5, alternates: languageAlternates('/sicurezza') },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(SWA_BLOG_ARTICLES[0].data_pubblicazione || marketingUpdated),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: languageAlternates('/blog'),
    },
    ...SWA_BLOG_ARTICLES.map(article => ({
      url: `${SITE_URL}/blog/${article.slug}`,
      lastModified: new Date(article.data_pubblicazione || marketingUpdated),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: languageAlternates(`/blog/${article.slug}`),
    })),
    {
      url: `${SITE_URL}/en/blog`,
      lastModified: new Date(SWA_BLOG_ARTICLES_EN[0].data_pubblicazione || marketingUpdated),
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: languageAlternates('/blog'),
    },
    ...SWA_BLOG_ARTICLES_EN.map(article => ({
      url: `${SITE_URL}/en/blog/${article.slug}`,
      lastModified: new Date(article.data_pubblicazione || marketingUpdated),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: languageAlternates(`/blog/${article.slugIt}`),
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
