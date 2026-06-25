import { NextResponse } from 'next/server'
import { q } from '@/lib/db'
import { requireAuth, requireClienteId } from '@/lib/auth-utils'

export async function GET(request: Request) {
  try {
    await requireAuth()
    const cid = await requireClienteId()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const canale = searchParams.get('canale')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query: string
    const params: unknown[] = [cid]

    if (status && status !== 'tutti' && canale && canale !== 'tutti') {
      query = 'SELECT * FROM calendario WHERE cliente_id = $1 AND status = $2 AND canale = $3 ORDER BY data_pubblicazione ASC LIMIT $4'
      params.push(status, canale, limit)
    } else if (status && status !== 'tutti') {
      query = 'SELECT * FROM calendario WHERE cliente_id = $1 AND status = $2 ORDER BY data_pubblicazione ASC LIMIT $3'
      params.push(status, limit)
    } else if (canale && canale !== 'tutti') {
      query = 'SELECT * FROM calendario WHERE cliente_id = $1 AND canale = $2 ORDER BY data_pubblicazione ASC LIMIT $3'
      params.push(canale, limit)
    } else {
      query = 'SELECT * FROM calendario WHERE cliente_id = $1 ORDER BY data_pubblicazione ASC LIMIT $2'
      params.push(limit)
    }
    const rows = await q(query, params)
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAuth()
    await requireClienteId()
    const body = await request.json() as Record<string, unknown>
    const { id } = body
    if (!id) return NextResponse.json({ error: 'id richiesto' }, { status: 400 })

    const fields: string[] = []
    const params: unknown[] = [id]
    for (const [key, val] of Object.entries(body)) {
      if (key === 'id') continue
      params.push(val)
      fields.push(`${key} = $${params.length}`)
    }
    if (body.status === 'APPROVATO') {
      params.push(new Date().toISOString())
      fields.push(`data_approvazione = $${params.length}`)
    }
    if (!fields.length) return NextResponse.json({ error: 'niente da aggiornare' }, { status: 400 })
    await q(`UPDATE calendario SET ${fields.join(', ')} WHERE id = $1`, params)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
