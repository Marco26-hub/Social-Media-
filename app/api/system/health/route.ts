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
    nextauthUrl: hasEnv('NEXTAUTH_URL'),
    siteUrl: hasEnv('NEXT_PUBLIC_SITE_URL'),
    anthropic: hasEnv('ANTHROPIC_API_KEY'),
    openrouter: hasEnv('OPENROUTER_API_KEY'),
    blotatoApiKey: hasEnv('BLOTATO_API_KEY'),
    blotatoWebhookSecret: hasEnv('BLOTATO_WEBHOOK_SECRET'),
  }

  const hasDatabase = demo || checks.databaseUrl
  const hasAi = checks.anthropic || checks.openrouter
  const ready = hasDatabase && checks.authSecret && checks.nextauthUrl && hasAi

  return NextResponse.json({
    status: ready ? 'ready' : 'needs_setup',
    mode: demo ? 'demo' : 'production',
    database: 'neon-postgres',
    checked_at: new Date().toISOString(),
    checks,
    next_actions: [
      ...(!hasDatabase ? ['Configura DATABASE_URL per Neon/Postgres'] : []),
      ...(!checks.authSecret ? ['Configura AUTH_SECRET o NEXTAUTH_SECRET'] : []),
      ...(!checks.nextauthUrl ? ['Configura NEXTAUTH_URL con URL Render o dominio custom'] : []),
      ...(!checks.siteUrl ? ['Configura NEXT_PUBLIC_SITE_URL per link e referrer OpenRouter'] : []),
      ...(!hasAi ? ['Aggiungi ANTHROPIC_API_KEY o OPENROUTER_API_KEY'] : []),
      ...(!checks.blotatoApiKey ? ['Configura BLOTATO_API_KEY prima di vendere pubblicazione automatica'] : []),
      ...(!checks.blotatoWebhookSecret ? ['Configura BLOTATO_WEBHOOK_SECRET per firmare i callback Blotato'] : []),
      'Esegui npm run migrate con DATABASE_URL Neon',
      'Collega pubblicazione APPROVATO → Blotato/webhook',
    ],
  })
}
