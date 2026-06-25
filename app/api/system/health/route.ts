import { NextResponse } from 'next/server'
import { isDemo } from '@/lib/demo'
import { dbReady } from '@/lib/db'

export const dynamic = 'force-dynamic'

function hasEnv(name: string) {
  return Boolean(process.env[name]?.trim())
}

export async function GET() {
  const demo = isDemo()
  const checks = {
    databaseUrl: dbReady(),
    authSecret: hasEnv('AUTH_SECRET') || hasEnv('NEXTAUTH_SECRET'),
    anthropic: hasEnv('ANTHROPIC_API_KEY'),
    openrouter: hasEnv('OPENROUTER_API_KEY'),
  }

  const hasDatabase = demo || checks.databaseUrl
  const hasAi = checks.anthropic || checks.openrouter
  const ready = hasDatabase && checks.authSecret && hasAi

  return NextResponse.json({
    status: ready ? 'ready' : 'needs_setup',
    mode: demo ? 'demo' : 'production',
    database: 'neon-postgres',
    checked_at: new Date().toISOString(),
    checks,
    next_actions: [
      ...(!hasDatabase ? ['Configura DATABASE_URL per Neon/Postgres'] : []),
      ...(!checks.authSecret ? ['Configura AUTH_SECRET o NEXTAUTH_SECRET'] : []),
      ...(!hasAi ? ['Aggiungi ANTHROPIC_API_KEY o OPENROUTER_API_KEY'] : []),
      'Esegui db/migrations/004_operations_foundation.sql su Neon',
      'Collega pubblicazione APPROVATO → Blotato/webhook',
    ],
  })
}
