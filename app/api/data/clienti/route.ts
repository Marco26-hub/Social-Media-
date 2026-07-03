import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady, q } from '@/lib/db'
import { requireAuth, requireClienteAccess } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'
import { demoClienti } from '@/lib/demo-data'

const CLIENTE_UPDATE_COLUMNS = new Set([
  'nome', 'settore', 'email', 'telefono', 'piano', 'contenuti_mese', 'attivo', 'note', 'blog_domain',
])

// Domini validi: hostname puro (no protocollo/path), lowercase, punti/trattini.
function isValidDomain(value: string): boolean {
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(value)
}

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
    return apiError(e)
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
    return apiError(e)
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAuth()
    const body = await request.json() as Record<string, unknown>
    const id = String(body.id || '')
    if (!id) return NextResponse.json({ error: 'id richiesto' }, { status: 400 })
    await requireClienteAccess(id)
    if (isDemo() || !dbReady()) return NextResponse.json({ ok: true, demo: true })

    if (typeof body.blog_domain === 'string' && body.blog_domain.trim()) {
      const domain = body.blog_domain.trim().toLowerCase()
      if (!isValidDomain(domain)) {
        return NextResponse.json({ error: 'Dominio non valido: usa solo hostname, es. blog.miosito.com (niente https:// o /path)' }, { status: 400 })
      }
      const clash = await q('SELECT id, nome FROM clienti WHERE blog_domain = $1 AND id != $2', [domain, id])
      if (clash.length) {
        return NextResponse.json({ error: `Dominio già assegnato a un altro cliente (${(clash[0] as { nome: string }).nome})` }, { status: 409 })
      }
      body.blog_domain = domain
    }

    const fields: string[] = []
    const params: unknown[] = []
    for (const [key, val] of Object.entries(body)) {
      if (!CLIENTE_UPDATE_COLUMNS.has(key)) continue
      params.push(val === '' ? null : val)
      fields.push(`${key} = $${params.length}`)
    }
    if (!fields.length) return NextResponse.json({ error: 'niente da aggiornare' }, { status: 400 })

    params.push(id)
    await q(`UPDATE clienti SET ${fields.join(', ')}, updated_at = now() WHERE id = $${params.length}`, params)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return apiError(e)
  }
}
