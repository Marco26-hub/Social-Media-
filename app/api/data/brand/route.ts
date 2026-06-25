import { NextResponse } from 'next/server'
import { q } from '@/lib/db'
import { requireAuth, requireClienteId } from '@/lib/auth-utils'

export async function GET() {
  try {
    await requireAuth()
    const cid = await requireClienteId()
    const row = await q('SELECT * FROM brand WHERE cliente_id = $1 LIMIT 1', [cid])
    return NextResponse.json(row[0] || null)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAuth()
    const cid = await requireClienteId()
    const body = await request.json() as Record<string, unknown>

    // Upsert: insert if not exists, update if exists
    const existing = await q('SELECT id FROM brand WHERE cliente_id = $1 LIMIT 1', [cid])

    if (!existing.length) {
      await q(
        `INSERT INTO brand (cliente_id, brand_name, settore, sito_url, tono_voce, target, promessa_brand,
          colori_brand, parole_da_usare, parole_da_evitare, emoji_policy, hashtag_base, cta_base, note_legali)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [
          cid,
          body.brand_name || '',
          body.settore || null,
          body.sito_url || null,
          body.tono_voce || null,
          body.target || null,
          body.promessa_brand || null,
          body.colori_brand || null,
          body.parole_da_usare || null,
          body.parole_da_evitare || null,
          body.emoji_policy || null,
          body.hashtag_base || null,
          body.cta_base || null,
          body.note_legali || null,
        ],
      )
    } else {
      const fields: string[] = []
      const params: unknown[] = []
      for (const [key, val] of Object.entries(body)) {
        if (key === 'id' || key === 'cliente_id' || key === 'created_at' || key === 'updated_at') continue
        params.push(val)
        fields.push(`${key} = $${params.length}`)
      }
      if (!fields.length) return NextResponse.json({ error: 'niente da aggiornare' }, { status: 400 })
      params.push(cid)
      await q(`UPDATE brand SET ${fields.join(', ')} WHERE cliente_id = $${params.length}`, params)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
