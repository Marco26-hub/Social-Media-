import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { apiError } from '@/lib/api-error'
import { dbReady, q, q1 } from '@/lib/db'
import { isDemo } from '@/lib/demo'

// Pacchetti validi (slug) — allineati a /servizi e alla landing.
const PACCHETTI = new Set(['starter', 'presenza', 'crescita', 'ecommerce', 'dominio'])

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const nome = String(body.nome || '').trim()
    const azienda = String(body.azienda || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const telefono = String(body.telefono || '').trim()
    const password = String(body.password || '')
    const pacchetto = String(body.pacchetto || '').trim().toLowerCase()

    // Validazione input
    if (!nome) return NextResponse.json({ error: 'Nome richiesto' }, { status: 400 })
    if (!azienda) return NextResponse.json({ error: 'Azienda richiesta' }, { status: 400 })
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Email non valida' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ error: 'La password deve avere almeno 8 caratteri' }, { status: 400 })
    if (pacchetto && !PACCHETTI.has(pacchetto)) return NextResponse.json({ error: 'Pacchetto non valido' }, { status: 400 })

    // In demo / senza DB non si registra davvero: risposta chiara.
    if (isDemo() || !dbReady()) {
      return NextResponse.json(
        { ok: false, demo: true, message: 'Registrazione non disponibile in modalità demo. Contattaci per attivare un account reale.' },
        { status: 200 },
      )
    }

    // Email già usata?
    const existing = await q1('SELECT id FROM profiles WHERE email = $1 LIMIT 1', [email])
    if (existing) {
      return NextResponse.json({ error: 'Esiste già un account con questa email' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await q(
      `INSERT INTO profiles (email, nome, password_hash, ruolo_globale, status, azienda, telefono, pacchetto)
       VALUES ($1, $2, $3, 'user', 'pending', $4, $5, $6)`,
      [email, nome, passwordHash, azienda, telefono || null, pacchetto || null],
    )

    return NextResponse.json({
      ok: true,
      status: 'pending',
      message: 'Richiesta ricevuta. Ti attiviamo a breve e ti avvisiamo via email.',
    })
  } catch (e) {
    return apiError(e)
  }
}
