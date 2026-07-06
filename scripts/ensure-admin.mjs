#!/usr/bin/env node
// Bootstrap admin sicuro. Se ADMIN_EMAIL + ADMIN_PASSWORD sono impostate,
// crea/aggiorna l'admin reale (super_admin, attivo) e DISABILITA l'admin di
// default 'admin' (seed migration 011, password nota 1234567).
// La password arriva SOLO da env: non è mai hardcoded nel repo.
// Non fatale: se qualcosa va storto, logga e lascia proseguire l'avvio.

import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

const url = process.env.DATABASE_URL?.trim()
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD ?? ''

async function main() {
  if (!url) {
    console.log('[ensure-admin] DATABASE_URL assente: salto.')
    return
  }
  if (!email || password.length < 8) {
    console.warn('[ensure-admin] ⚠️  ADMIN_EMAIL/ADMIN_PASSWORD non impostate (o password < 8): '
      + "l'admin di default 'admin'/'1234567' resta attivo. CAMBIALO prima del go-live.")
    return
  }

  const sql = neon(url)
  const hash = bcrypt.hashSync(password, 12)

  // Upsert admin reale.
  await sql.query(
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
  await sql.query(
    `INSERT INTO user_client_access (user_id, cliente_id, ruolo)
     SELECT p.id, c.id, 'owner' FROM profiles p, clienti c
     WHERE p.email = $1
     ON CONFLICT (user_id, cliente_id) DO NOTHING`,
    [email],
  )

  // Disabilita l'admin di default se è diverso da quello reale.
  if (email !== 'admin') {
    const res = await sql.query(
      `UPDATE profiles SET status = 'rejected', updated_at = now()
       WHERE email = 'admin' AND status <> 'rejected'`,
    )
    const disabled = Array.isArray(res) ? res.length : (res?.rowCount ?? 0)
    console.log(`[ensure-admin] admin reale '${email}' pronto. Default 'admin' ${disabled ? 'DISABILITATO' : 'assente/già disabilitato'}.`)
  } else {
    console.log(`[ensure-admin] admin '${email}' aggiornato con la password da env.`)
  }
}

main().catch((e) => {
  console.error('[ensure-admin] errore non fatale:', e instanceof Error ? e.message : String(e))
})
