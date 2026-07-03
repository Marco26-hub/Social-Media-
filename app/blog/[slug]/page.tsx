import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { dbReady, q } from '@/lib/db'
import { normalizeArticle, buildJsonLd, type BlogArticleData } from '@/lib/blog-render'
import { resolveBlogClienteId } from '@/lib/blog-tenant'

export const dynamic = 'force-dynamic'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || ''

// Carica l'articolo PUBBLICATO con questo slug, scoping per il cliente del dominio
// (vedi lib/blog-tenant.ts). Niente slug-hijack cross-tenant (unique è (cliente_id, slug)).
async function loadArticle(slug: string): Promise<BlogArticleData | null> {
  if (!dbReady()) return null
  const clienteId = await resolveBlogClienteId()
  if (!clienteId) return null
  try {
    const rows = await q(
      `SELECT * FROM blog_articoli WHERE slug = $1 AND status = 'PUBBLICATO' AND cliente_id = $2 LIMIT 1`,
      [slug, clienteId],
    )
    return rows[0] ? normalizeArticle(rows[0]) : null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const a = await loadArticle(slug)
  if (!a) return { title: 'Articolo non trovato' }
  const url = SITE ? `${SITE.replace(/\/$/, '')}/blog/${a.slug}` : undefined
  return {
    title: a.meta_title,
    description: a.meta_description || undefined,
    keywords: a.keywords_target,
    alternates: url ? { canonical: url } : undefined,
    openGraph: {
      title: a.meta_title,
      description: a.meta_description || undefined,
      type: 'article',
      ...(a.immagine_cover ? { images: [a.immagine_cover] } : {}),
      ...(url ? { url } : {}),
    },
  }
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const a = await loadArticle(slug)
  if (!a) notFound()

  const jsonLd = buildJsonLd(a, SITE)

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      {/* JSON-LD: Article + FAQPage — citabile da Google e dalle AI.
          Escape di < in <: i campi vengono da AI/DB e un "</script>" iniettato
          spezzerebbe il tag script (stored XSS). < resta JSON valido. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <article className="prose prose-gray max-w-none">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">{a.h1}</h1>
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-6">
          <span>{a.autore}</span>
          {a.tempo_lettura_min ? <span>· {a.tempo_lettura_min} min</span> : null}
        </div>
        {a.immagine_cover && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={a.immagine_cover} alt={a.h1} className="w-full rounded-xl mb-6" />
        )}
        {a.intro && <p className="text-lg text-gray-700 leading-relaxed mb-6">{a.intro}</p>}

        {a.sezioni.map((s, i) => (
          <section key={i} className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{s.h2}</h2>
            {s.paragrafi.map((p, j) => <p key={j} className="text-gray-700 leading-relaxed mb-3">{p}</p>)}
            {s.lista_punti && s.lista_punti.length > 0 && (
              <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-3">
                {s.lista_punti.map((li, k) => <li key={k}>{li}</li>)}
              </ul>
            )}
          </section>
        ))}

        {a.faq.length > 0 && (
          <section className="mt-8 pt-6 border-t border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Domande frequenti</h2>
            {a.faq.map((f, i) => (
              <div key={i} className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-1">{f.domanda}</h3>
                <p className="text-gray-700">{f.risposta}</p>
              </div>
            ))}
          </section>
        )}

        {a.cta_finale && (
          <p className="mt-8 text-lg font-medium text-brand-700">{a.cta_finale}</p>
        )}
      </article>
    </main>
  )
}
