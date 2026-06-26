import { NextResponse } from 'next/server'
import { dbReady, q } from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'
import { demoClienti } from '@/lib/demo-data'

export async function GET() {
  try {
    const user = await requireAuth()
    if (isDemo() || !dbReady()) return NextResponse.json(demoClienti)
    const rows = await q(
      `SELECT c.* FROM clienti c
       INNER JOIN user_client_access uca ON uca.cliente_id = c.id
       WHERE uca.user_id = $1 AND uca.attivo = true
       ORDER BY c.nome`,
      [user.id]
    )
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const { nome, settore, email, telefono, piano } = await request.json()
    if (!nome) return NextResponse.json({ error: 'nome richiesto' }, { status: 400 })
    if (isDemo() || !dbReady()) return NextResponse.json({ id: `demo-${Date.now().toString(36)}`, demo: true })
    const slug = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const rows = await q(
      'INSERT INTO clienti (nome, slug, settore, email, telefono, piano, attivo) VALUES ($1,$2,$3,$4,$5,$6,true) RETURNING id',
      [nome, slug, settore || null, email || null, telefono || null, piano || 'pro']
    )
    const clienteId = (rows[0] as { id: string }).id
    await q(
      'INSERT INTO user_client_access (user_id, cliente_id, ruolo, attivo) VALUES ($1,$2,$3,true)',
      [user.id, clienteId, 'owner']
    )
    return NextResponse.json({ id: clienteId })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
