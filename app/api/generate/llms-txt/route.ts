import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { q } from '@/lib/db'
import { getClientGenerationContext, brandField } from '@/lib/client-context'
import { buildLlmsTxt, validateLlmsTxt, type LlmsTxtDoc } from '@/lib/geo/llms-txt'

export const dynamic = 'force-dynamic'

type Row = Record<string, unknown>

// Genera llms.txt dai dati REALI del cliente: brand (nome/descrizione) + articoli
// blog PUBBLICATI (url_pubblicato). Nessuna pagina inventata: se il cliente non ha
// blog_domain o articoli pubblicati, il file esce minimale e lo si segnala.
export async function POST(request: Request) {
  try {
    await requireAuth()
    const body = await request.json()
    const { cliente_id, validate_only, content } = body

    if (validate_only) {
      if (typeof content !== 'string' || !content.trim()) {
        return NextResponse.json({ error: 'Fornisci "content" da validare' }, { status: 400 })
      }
      return NextResponse.json({ ok: true, validation: validateLlmsTxt(content) })
    }

    const ctx = await getClientGenerationContext(cliente_id)
    if (!ctx.clienteId) return NextResponse.json({ error: 'Nessun cliente selezionato' }, { status: 400 })
    const brand = ctx.brand as Row | null
    const cliente = ctx.cliente as Row | null
    const blogDomain = (cliente?.blog_domain as string) || ''
    const warnings: string[] = []
    if (!blogDomain) warnings.push('Cliente senza blog_domain configurato: gli URL degli articoli saranno relativi (/blog/slug).')

    const nomeBrand = brand ? brandField(brand, 'brand_name', brandField(brand, 'nome', 'Il brand')) : (cliente?.nome as string) || 'Il brand'
    const description = brand
      ? brandField(brand, 'promessa_brand', brandField(brand, 'descrizione', `${nomeBrand}: e-commerce e contenuti su ${brandField(brand, 'settore', 'moda')}.`))
      : `${nomeBrand}: sito e blog.`

    const rows = await q(
      `SELECT slug, meta_title, meta_description, h1, url_pubblicato
       FROM blog_articoli
       WHERE cliente_id = $1 AND status = 'PUBBLICATO'
       ORDER BY data_pubblicazione DESC LIMIT 50`,
      [ctx.clienteId],
    )
    if (!rows.length) warnings.push('Nessun articolo PUBBLICATO trovato: la sezione Docs sarà vuota.')

    const base = blogDomain ? (/^https?:\/\//.test(blogDomain) ? blogDomain.replace(/\/+$/, '') : `https://${blogDomain.replace(/\/+$/, '')}`) : ''
    const docs: LlmsTxtDoc[] = (rows as Row[]).map(r => ({
      title: (r.meta_title as string) || (r.h1 as string) || (r.slug as string),
      url: (r.url_pubblicato as string) || `${base}/blog/${r.slug}`,
      description: (r.meta_description as string) || undefined,
    }))

    const txt = buildLlmsTxt({ siteName: nomeBrand, description, baseUrl: base || undefined, docs })

    return NextResponse.json({
      ok: true,
      llms_txt: txt,
      articoli_inclusi: docs.length,
      ...(warnings.length ? { warnings } : {}),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Errore generazione llms.txt'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
