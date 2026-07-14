#!/usr/bin/env node
// Bootstrap admin sicuro. Se ADMIN_EMAIL + ADMIN_PASSWORD sono impostate,
// crea/aggiorna l'admin reale (super_admin, attivo) e DISABILITA l'admin di
// default 'admin' (seed migration 011, password nota 1234567).
// La password arriva SOLO da env: non è mai hardcoded nel repo.
// FATALE al go-live reale (PUBLISH_ENABLED=true): exit code >0 se le env mancano
// o l'upsert non ha disabilitato il default → render-start blocca l'avvio così
// nessun deploy con clienti reali gira col default 'admin' attivo. In setup/test
// (PUBLISH_ENABLED!=true) è solo un warning: il default resta per configurare.

import pg from 'pg'
import bcrypt from 'bcryptjs'

// Gira sulla connessione diretta (Supabase: pooler session :5432) come le migrazioni.
const url = (process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL)?.trim()
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD ?? ''
const isProduction = process.env.NODE_ENV === 'production'
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
const isPublishingLive = process.env.PUBLISH_ENABLED === 'true'
// Hardening obbligatorio solo al go-live reale (clienti veri + pubblicazione).
const requireAdminHardening = isProduction && !isDemoMode && isPublishingLive

// Normalizza la connection string per Supabase: rimuove sslmode (pg lo tratta come
// verify-full e rifiuta il cert chain del pooler) e imposta ssl esplicito.
function pgConfig(rawUrl) {
  try {
    const u = new URL(rawUrl)
    const disable = u.searchParams.get('sslmode') === 'disable'
    u.searchParams.delete('sslmode')
    return { connectionString: u.toString(), ssl: disable ? false : { rejectUnauthorized: false } }
  } catch {
    return { connectionString: rawUrl, ssl: { rejectUnauthorized: false } }
  }
}

async function main() {
  if (!url) {
    console.log('[ensure-admin] DATABASE_URL assente: salto.')
    return
  }
  if (!email || password.length < 8) {
    const msg = '[ensure-admin] ADMIN_EMAIL/ADMIN_PASSWORD non impostate (o password < 8).'
    if (requireAdminHardening) {
      console.error(`${msg} FATAL: PUBLISH_ENABLED=true, rifiuto di lasciare attivo il default 'admin'/'1234567'.`)
      process.exit(2)
    }
    console.warn(`${msg} L'admin di default 'admin'/'1234567' resta attivo per il setup. CAMBIALO prima di PUBLISH_ENABLED=true.`)
    return
  }

  // Supabase pooler: rimuovi sslmode (pg lo tratta come verify-full e rifiuta il cert
  // chain) e imposta ssl esplicito. Traffico comunque cifrato (TLS).
  const { connectionString, ssl } = pgConfig(url)
  const client = new pg.Client({ connectionString, ssl })
  await client.connect()
  const hash = bcrypt.hashSync(password, 12)

  try {
    // Upsert admin reale.
    await client.query(
      `INSERT INTO profiles (email, nome, password_hash, ruolo_globale, status)
       VALUES ($1, 'Amministratore', $2, 'super_admin', 'active')
       ON CONFLICT (email) DO UPDATE SET
         password_hash = excluded.password_hash,
         ruolo_globale = 'super_admin',
         status = 'active',
         updated_at = now()`,
      [email, hash],
    )

    // Accesso a tutti i clienti esistenti.
    await client.query(
      `INSERT INTO user_client_access (user_id, cliente_id, ruolo)
       SELECT p.id, c.id, 'owner' FROM profiles p, clienti c
       WHERE p.email = $1
       ON CONFLICT (user_id, cliente_id) DO NOTHING`,
      [email],
    )

    // Verifica post-upsert: l'admin reale deve esistere super_admin/active.
    const verify = (await client.query(
      `SELECT id, ruolo_globale, status FROM profiles WHERE email = $1 LIMIT 1`,
      [email],
    )).rows[0]
    if (!verify || verify.ruolo_globale !== 'super_admin' || verify.status !== 'active') {
      console.error(`[ensure-admin] verify post-upsert fallita per '${email}'. Riga: ${JSON.stringify(verify)}`)
      if (requireAdminHardening) process.exit(2)
    }

    // Disabilita l'admin di default se è diverso da quello reale.
    if (email !== 'admin') {
      const res = await client.query(
        `UPDATE profiles SET status = 'rejected', updated_at = now()
         WHERE email = 'admin' AND status <> 'rejected'`,
      )
      const disabled = res.rowCount ?? 0
      console.log(`[ensure-admin] admin reale '${email}' pronto. Default 'admin' ${disabled ? 'DISABILITATO' : 'assente/già disabilitato'}.`)

      // Doppio-check: nessun 'admin' attivo sopravvissuto.
      const stillActive = (await client.query(
        `SELECT 1 FROM profiles WHERE email = 'admin' AND status = 'active' LIMIT 1`,
      )).rows.length
      if (stillActive) {
        console.error(`[ensure-admin] default 'admin' ancora attivo dopo UPDATE.`)
        if (requireAdminHardening) process.exit(2)
      }
    } else {
      console.log(`[ensure-admin] admin '${email}' aggiornato con la password da env.`)
    }
  } finally {
    await client.end()
  }
}

main().catch((e) => {
  console.error('[ensure-admin] errore:', e instanceof Error ? e.message : String(e))
  // Errore DB fatale solo al go-live reale (non bloccare setup/test).
  if (requireAdminHardening) process.exit(2)
})
