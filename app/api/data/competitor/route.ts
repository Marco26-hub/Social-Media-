import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady, q } from '@/lib/db'
import { requireAuth, requireClienteId } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'

export const dynamic = 'force-dynamic'

// Lista competitor persistente del cliente attivo. Serve all'agente AUTO per sapere
// CHI analizzare (prima erano solo stato del form, persi al refresh).

export async function GET() {
  try {
    await requireAuth()
    if (isDemo() || !dbReady()) return NextResponse.json([])
    const cid = await requireClienteId()
    const rows = await q('SELECT * FROM competitor WHERE cliente_id = $1 ORDER BY created_at DESC', [cid])
    return NextResponse.json(rows)
  } catch (e) {
    return apiError(e)
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth()
    const { nome, sito, social } = await request.json()
    if (!nome || typeof nome !== 'string' || !nome.trim()) {
      return NextResponse.json({ error: 'nome competitor richiesto' }, { status: 400 })
    }
    if (isDemo() || !dbReady()) return NextResponse.json({ ok: true, demo: true })
    const cid = await requireClienteId()
    const socialArr = Array.isArray(social) ? social.filter((s: unknown) => typeof s === 'string' && s.trim()) : []
    const row = await q(
      `INSERT INTO competitor (cliente_id, nome, sito, social)
       VALUES ($1, $2, $3, $4::jsonb) RETURNING *`,
      [cid, nome.trim(), (typeof sito === 'string' && sito.trim()) || null, JSON.stringify(socialArr)],
    )
    return NextResponse.json(row[0] || { ok: true })
  } catch (e) {
    return apiError(e)
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAuth()
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id richiesto' }, { status: 400 })
    if (isDemo() || !dbReady()) return NextResponse.json({ ok: true, demo: true })
    const cid = await requireClienteId()
    await q('DELETE FROM competitor WHERE id = $1 AND cliente_id = $2', [id, cid])
    return NextResponse.json({ ok: true })
  } catch (e) {
    return apiError(e)
  }
}
