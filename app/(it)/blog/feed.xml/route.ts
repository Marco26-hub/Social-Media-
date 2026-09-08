import { NextResponse } from 'next/server'
import { dbReady, q } from '@/lib/db'
import { resolveBlogClienteIdForHost } from '@/lib/blog-tenant'
import { SITE_URL } from '@/lib/site-config'
import { SWA_BLOG_ARTICLES } from '@/lib/swa-blog-content'

export const dynamic = 'force-dynamic'

type FeedItem = {
  slug: string
  h1: string
  meta_description: string | null
  data_pubblicazione: string | null
}

function xmlEscape(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const host = requestUrl.hostname.toLowerCase()
  const base = `${requestUrl.protocol}//${requestUrl.host}`
  const isSwaHost = host === 'socialautomation.app' || host === 'www.socialautomation.app' || host === 'localhost' || host === '127.0.0.1'
  let items: FeedItem[] = isSwaHost
    ? SWA_BLOG_ARTICLES.map(article => ({
        slug: article.slug,
        h1: article.h1,
        meta_description: article.meta_description,
        data_pubblicazione: article.data_pubblicazione || null,
      }))
    : []

  if (dbReady()) {
    const clienteId = await resolveBlogClienteIdForHost(host)
    if (clienteId) {
      try {
        const dynamicItems = await q(
          `SELECT slug, h1, meta_description, data_pubblicazione
           FROM blog_articoli
           WHERE status = 'PUBBLICATO' AND cliente_id = $1
           ORDER BY COALESCE(data_pubblicazione, updated_at) DESC
           LIMIT 50`,
          [clienteId],
        ) as FeedItem[]
        const dynamicSlugs = new Set(dynamicItems.map(item => item.slug))
        items = [...dynamicItems, ...items.filter(item => !dynamicSlugs.has(item.slug))]
      } catch {
        // Mantiene gli articoli editoriali SWA se il database non è disponibile.
      }
    }
  }

  const entries = items.map(item => {
    const link = `${base}/blog/${item.slug}`
    const pubDate = item.data_pubblicazione ? new Date(item.data_pubblicazione).toUTCString() : new Date().toUTCString()
    return `<item><title>${xmlEscape(item.h1)}</title><link>${xmlEscape(link)}</link><guid isPermaLink="true">${xmlEscape(link)}</guid><description>${xmlEscape(item.meta_description || '')}</description><pubDate>${pubDate}</pubDate></item>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>SWA Journal</title><link>${xmlEscape(base || SITE_URL)}/blog</link><description>Guide su social media, SEO, GEO e AI per PMI.</description><language>it-IT</language>${entries}</channel></rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=1800, stale-while-revalidate=86400',
    },
  })
}
