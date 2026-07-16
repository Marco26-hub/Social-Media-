import { NextResponse } from 'next/server'
import { callAI, extractJSONChecked } from '@/lib/ai'
import { requireAuth } from '@/lib/auth-utils'
import { q } from '@/lib/db'
import { getClientGenerationContext } from '@/lib/client-context'
import { scoreCitability, segmentMarkdown, rewriteWeakBlockPrompt, type ContentBlock } from '@/lib/geo/citability'

export const dynamic = 'force-dynamic'

type Row = Record<string, unknown>

// Converte una riga blog_articoli (intro + sezioni + faq) in blocchi già
// strutturati — non serve segmentare markdown, lo schema li dà già separati.
function blocksFromArticle(article: Row): ContentBlock[] {
  const blocks: ContentBlock[] = []
  if (typeof article.intro === 'string' && article.intro.trim()) {
    blocks.push({ heading: 'Introduzione', text: article.intro })
  }
  const sezioni = Array.isArray(article.sezioni) ? article.sezioni : []
  for (const s of sezioni as Row[]) {
    const paragrafi = Array.isArray(s.paragrafi) ? (s.paragrafi as string[]) : []
    const lista = Array.isArray(s.lista_punti) ? (s.lista_punti as string[]).map(p => `- ${p}`) : []
    blocks.push({ heading: String(s.h2 || ''), text: [...paragrafi, ...lista].join('\n\n') })
  }
  const faq = Array.isArray(article.faq) ? article.faq : []
  for (const f of faq as Row[]) {
    blocks.push({ heading: String(f.domanda || 'FAQ'), text: String(f.risposta || '') })
  }
  return blocks
}

export async function POST(request: Request) {
  try {
    await requireAuth()
    const body = await request.json()
    const { cliente_id, content, slug, rewrite_weak, model, openrouter_key, gemini_key, opencode_key } = body

    let blocks: ContentBlock[] = []
    let sourceLabel = 'contenuto fornito'

    if (typeof slug === 'string' && slug.trim()) {
      const ctx = await getClientGenerationContext(cliente_id)
      if (!ctx.clienteId) return NextResponse.json({ error: 'Nessun cliente selezionato' }, { status: 400 })
      const rows = await q('SELECT * FROM blog_articoli WHERE cliente_id = $1 AND slug = $2 LIMIT 1', [ctx.clienteId, slug])
      const article = rows[0] as Row | undefined
      if (!article) return NextResponse.json({ error: `Articolo "${slug}" non trovato per questo cliente` }, { status: 404 })
      blocks = blocksFromArticle(article)
      sourceLabel = (article.h1 as string) || slug
    } else if (typeof content === 'string' && content.trim()) {
      blocks = segmentMarkdown(content)
    } else {
      return NextResponse.json({ error: 'Fornisci "content" (markdown/testo) oppure "slug" (articolo esistente del cliente)' }, { status: 400 })
    }

    if (!blocks.length) {
      return NextResponse.json({ error: 'Nessun blocco di contenuto da analizzare (contenuto vuoto o non segmentabile)' }, { status: 400 })
    }

    const report = scoreCitability(blocks)

    // Riscrittura opzionale SOLO dei blocchi deboli (score<60), con AI grounded
    // sui problemi reali rilevati dallo scorer — non inventa il punteggio.
    let rewrites: Row[] | undefined
    if (rewrite_weak) {
      const weak = report.blocks.filter(b => b.overall < 60).slice(0, 3)
      rewrites = []
      for (const w of weak) {
        const original = blocks.find(b => b.heading === w.heading)?.text || ''
        if (!original) continue
        try {
          const raw = await callAI({
            model: model || 'gemini-2.5-flash',
            systemPrompt: 'Sei un editor GEO/SEO senior. Rispondi SOLO con JSON valido, italiano impeccabile.',
            userPrompt: rewriteWeakBlockPrompt(w, original),
            openrouterKey: openrouter_key, geminiKey: gemini_key, opencodeKey: opencode_key,
            maxTokens: 800,
            meta: { tipo: 'geo_rewrite', agentName: 'geo' },
          })
          const { data } = extractJSONChecked(raw)
          const parsed = (data as Row) || {}
          rewrites.push({ heading_originale: w.heading, ...parsed })
        } catch (e) {
          rewrites.push({ heading_originale: w.heading, errore: (e instanceof Error ? e.message : String(e)).slice(0, 150) })
        }
      }
    }

    return NextResponse.json({
      ok: true,
      source: sourceLabel,
      report,
      ...(rewrites ? { rewrites } : {}),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Errore analisi citabilità'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
