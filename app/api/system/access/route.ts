import { NextResponse } from 'next/server'
import { dbReady } from '@/lib/db'
import { isDemo } from '@/lib/demo'

const DEFAULT_DEMO_USER = 'admin'
const DEFAULT_DEMO_PASSWORD = '1234567'

export async function GET() {
  const demo = isDemo() || !dbReady()
  const showInProduction = process.env.SHOW_LOGIN_HINT === 'true'

  if (!demo && !showInProduction) {
    return NextResponse.json({ enabled: false }, { status: 404 })
  }

  // SICUREZZA: la password viene esposta SOLO in demo puro, dove il login
  // accetta comunque qualunque credenziale (quindi non è un segreto reale).
  // In production-hint mostriamo solo lo username, mai la password admin reale.
  return NextResponse.json({
    enabled: true,
    mode: demo ? 'demo' : 'production-hint',
    username: process.env.ADMIN_LOGIN_USER || DEFAULT_DEMO_USER,
    ...(demo ? { password: process.env.ADMIN_LOGIN_PASSWORD || DEFAULT_DEMO_PASSWORD } : {}),
    login_url: '/login',
    dashboard_url: '/dashboard/clienti',
    note: demo
      ? 'Credenziali demo/setup. Con DATABASE_URL mancante il login accetta qualunque credenziale.'
      : 'Hint login abilitato da SHOW_LOGIN_HINT=true. Usa la password admin configurata; disattiva prima della vendita.',
  })
}
