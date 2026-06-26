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

  return NextResponse.json({
    enabled: true,
    mode: demo ? 'demo' : 'production-hint',
    username: process.env.ADMIN_LOGIN_USER || DEFAULT_DEMO_USER,
    password: process.env.ADMIN_LOGIN_PASSWORD || DEFAULT_DEMO_PASSWORD,
    login_url: '/login',
    dashboard_url: '/dashboard/clienti',
    note: demo
      ? 'Credenziali demo/setup. Con DATABASE_URL mancante il login accetta qualunque credenziale.'
      : 'Hint esplicitamente abilitato da SHOW_LOGIN_HINT=true. Disattivalo prima della vendita pubblica.',
  })
}
