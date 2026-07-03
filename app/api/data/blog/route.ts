import { NextResponse } from 'next/server'
import { requireClienteId } from '@/lib/auth-utils'
import { dbReady, q } from '@/lib/db'

export const dynamic = 'force-dynamic'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || ''

// GET — lista articoli del cliente attivo (bozze + pubblicati)
export async function GET() {
  if (!dbReady()) return NextResponse.json({ articoli: [] })
  let clienteId: string
  try { clienteId = await requireClienteId() }
  catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 401 }) }

  const rows = await q(
    `SELECT id, slug, meta_title, meta_description, h1, intro, sezioni, faq, cta_finale,
            keywords_target, immagine_cover, autore, tempo_lettura_min, status, url_pubblicato, updated_at
     FROM blog_articoli WHERE cliente_id = $1 ORDER BY updated_at DESC LIMIT 100`,
    [clienteId],
  )
  return NextResponse.json({ articoli: rows })
}

// PATCH — pubblica / ritira / archivia un articolo
export async function PATCH(request: Request) {
  if (!dbReady()) return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
  let clienteId: string
  try { clienteId = await requireClienteId() }
  catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 401 }) }

  const { id, action } = await request.json()
  if (!id || !action) return NextResponse.json({ error: 'id e action richiesti' }, { status: 400 })

  // Verifica che l'articolo sia del cliente (multi-tenant safe).
  const owned = await q('SELECT slug FROM blog_articoli WHERE id = $1 AND cliente_id = $2 LIMIT 1', [id, clienteId])
  if (!owned.length) return NextResponse.json({ error: 'Articolo non trovato' }, { status: 404 })
  const slug = owned[0].slug as string

  if (action === 'publish') {
    const url = SITE ? `${SITE.replace(/\/$/, '')}/blog/${slug}` : `/blog/${slug}`
    await q(
      `UPDATE blog_articoli SET status = 'PUBBLICATO', url_pubblicato = $1, data_pubblicazione = CURRENT_DATE, updated_at = now()
       WHERE id = $2 AND cliente_id = $3`,
      [url, id, clienteId],
    )
    return NextResponse.json({ ok: true, status: 'PUBBLICATO', url_pubblicato: url })
  }
  if (action === 'unpublish') {
    await q(`UPDATE blog_articoli SET status = 'BOZZA', updated_at = now() WHERE id = $1 AND cliente_id = $2`, [id, clienteId])
    return NextResponse.json({ ok: true, status: 'BOZZA' })
  }
  if (action === 'archive') {
    await q(`UPDATE blog_articoli SET status = 'ARCHIVIATO', updated_at = now() WHERE id = $1 AND cliente_id = $2`, [id, clienteId])
    return NextResponse.json({ ok: true, status: 'ARCHIVIATO' })
  }
  return NextResponse.json({ error: 'action non valida' }, { status: 400 })
}
