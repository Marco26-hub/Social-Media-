import Link from 'next/link'
import type { Metadata } from 'next'
import { dbReady, q } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articoli, guide e approfondimenti.',
}

type Item = { slug: string; h1: string; meta_description: string | null; tempo_lettura_min: number | null; immagine_cover: string | null }

// Deploy single-brand: BLOG_PUBLIC_CLIENTE_ID limita il blog pubblico al cliente
// indicato (niente articoli di altri tenant sul dominio). Se non impostato, mostra
// tutti i pubblicati (namespace condiviso — ok solo per istanza mono-cliente).
const PUBLIC_CID = process.env.BLOG_PUBLIC_CLIENTE_ID?.trim() || ''

async function loadArticles(): Promise<Item[]> {
  if (!dbReady()) return []
  try {
    const rows = PUBLIC_CID
      ? await q(
          `SELECT slug, h1, meta_description, tempo_lettura_min, immagine_cover
           FROM blog_articoli WHERE status = 'PUBBLICATO' AND cliente_id = $1 ORDER BY updated_at DESC LIMIT 50`,
          [PUBLIC_CID],
        )
      : await q(
          `SELECT slug, h1, meta_description, tempo_lettura_min, immagine_cover
           FROM blog_articoli WHERE status = 'PUBBLICATO' ORDER BY updated_at DESC LIMIT 50`,
        )
    return rows as Item[]
  } catch { return [] }
}

export default async function BlogIndexPage() {
  const items = await loadArticles()
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">Blog</h1>
      <p className="text-gray-500 mb-8">Guide e approfondimenti.</p>

      {items.length === 0 ? (
        <p className="text-gray-400">Nessun articolo pubblicato al momento.</p>
      ) : (
        <div className="space-y-4">
          {items.map(a => (
            <Link key={a.slug} href={`/blog/${a.slug}`} className="block card p-4 md:p-5 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                {a.immagine_cover && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={a.immagine_cover} alt={a.h1} className="w-20 h-20 md:w-28 md:h-28 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 leading-snug mb-1">{a.h1}</h2>
                  {a.meta_description && <p className="text-sm text-gray-600 line-clamp-2">{a.meta_description}</p>}
                  {a.tempo_lettura_min ? <p className="text-xs text-gray-400 mt-1">{a.tempo_lettura_min} min di lettura</p> : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
