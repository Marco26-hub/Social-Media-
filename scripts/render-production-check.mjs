#!/usr/bin/env node

const strict = process.argv.includes('--strict')
const env = process.env

const required = [
  {
    name: 'DATABASE_URL',
    ok: Boolean(env.DATABASE_URL?.trim()),
    hint: 'Connection string Neon/Postgres con sslmode=require',
  },
  {
    name: 'AUTH_SECRET oppure NEXTAUTH_SECRET',
    ok: Boolean(env.AUTH_SECRET?.trim() || env.NEXTAUTH_SECRET?.trim()),
    hint: 'Segreto lungo generato da Render o openssl rand -base64 32',
  },
  {
    name: 'NEXTAUTH_URL',
    ok: Boolean(env.NEXTAUTH_URL?.trim()),
    hint: 'URL pubblico Render o dominio custom, es. https://social-automation.onrender.com',
  },
  {
    name: 'OPENROUTER_API_KEY oppure ANTHROPIC_API_KEY',
    ok: Boolean(env.OPENROUTER_API_KEY?.trim() || env.ANTHROPIC_API_KEY?.trim()),
    hint: 'Almeno una chiave AI reale per generazione contenuti',
  },
]

const recommended = [
  {
    name: 'NEXT_PUBLIC_SITE_URL',
    ok: Boolean(env.NEXT_PUBLIC_SITE_URL?.trim()),
    hint: 'Stesso URL pubblico usato da OpenRouter e link generati',
  },
  {
    name: 'BLOTATO_API_KEY',
    ok: Boolean(env.BLOTATO_API_KEY?.trim()),
    hint: 'Richiesta se vendi pubblicazione/scheduling automatico',
  },
  {
    name: 'BLOTATO_WEBHOOK_SECRET',
    ok: Boolean(env.BLOTATO_WEBHOOK_SECRET?.trim()),
    hint: 'Firma webhook Blotato in produzione',
  },
]

const unsafeFlags = [
  {
    name: 'NEXT_PUBLIC_DEMO_MODE=true',
    active: env.NEXT_PUBLIC_DEMO_MODE === 'true',
    hint: 'Disattiva demo mode sul sito venduto',
  },
  {
    name: 'SHOW_LOGIN_HINT=true',
    active: env.SHOW_LOGIN_HINT === 'true',
    hint: 'Non mostrare credenziali admin su sito pubblico',
  },
]

function printSection(title, rows, iconOk = '✓', iconBad = '✗') {
  console.log(`\n${title}`)
  for (const row of rows) {
    const ok = 'ok' in row ? row.ok : !row.active
    console.log(`${ok ? iconOk : iconBad} ${row.name}${ok ? '' : ` — ${row.hint}`}`)
  }
}

printSection('Obbligatori', required)
printSection('Consigliati', recommended, '✓', '!')
printSection('Flag pericolosi', unsafeFlags, '✓', '!')

const missingRequired = required.filter((item) => !item.ok)
const activeUnsafeFlags = unsafeFlags.filter((item) => item.active)

if (missingRequired.length || activeUnsafeFlags.length) {
  console.log('\nStato: produzione non pronta.')
  if (strict) {
    process.exit(1)
  }
} else {
  console.log('\nStato: env production-ready.')
}
