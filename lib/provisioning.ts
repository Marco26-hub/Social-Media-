// Provisioning workspace da una registrazione. Logica CONDIVISA tra:
// - attivazione manuale admin (/api/admin/registrazioni PATCH activate)
// - attivazione automatica dopo pagamento Stripe (webhook checkout.session.completed)
// Prima la logica viveva solo in admin/registrazioni: duplicarla nel webhook
// avrebbe fatto divergere le due strade. Fonte unica qui.

import { q, q1 } from '@/lib/db'

export const PACCHETTO_LABEL: Record<string, string> = {
  starter: 'Starter', presenza: 'Presenza', slancio: 'Slancio', crescita: 'Crescita', ecommerce: 'E-commerce', dominio: 'Dominio',
}

// Pacchetto vendita → piano DB (enum free/pro/agency/enterprise) + contenuti/mese.
export const PACCHETTO_PIANO: Record<string, { piano: string; contenuti: number }> = {
  starter:   { piano: 'pro',        contenuti: 8 },
  presenza:  { piano: 'pro',        contenuti: 12 },
  slancio:   { piano: 'agency',     contenuti: 16 },
  crescita:  { piano: 'agency',     contenuti: 20 },
  ecommerce: { piano: 'agency',     contenuti: 30 },
  dominio:   { piano: 'enterprise', contenuti: 50 },
}

// Fallback sicuro: pacchetto ignoto → Starter (8), non regala quote alte.
export const PACCHETTO_FALLBACK = { piano: 'pro', contenuti: 8 }

export function slugify(value: string): string {
  return value
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    || 'cliente'
}

type Profile = {
  id: string
  nome: string | null
  azienda: string | null
  email: string | null
  telefono: string | null
  pacchetto: string | null
  status: string
}

export type ActivationResult = {
  clienteId: string | null
  alreadyActive: boolean
}

// Attiva una registrazione pending: crea il workspace (clienti + user_client_access
// owner) se manca e imposta lo stato 'active'. Idempotente: se già attivo, non
// duplica. Se passati, collega gli id Stripe al cliente.
export async function activateRegistration(opts: {
  profileId: string
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
}): Promise<ActivationResult> {
  const prof = (await q1(
    `SELECT id, nome, azienda, email, telefono, pacchetto, status FROM profiles WHERE id = $1`,
    [opts.profileId],
  )) as Profile | null

  if (!prof) throw new Error(`Registrazione ${opts.profileId} non trovata`)

  // Trova (o crea) il workspace collegato all'utente.
  const access = await q1('SELECT cliente_id FROM user_client_access WHERE user_id = $1 LIMIT 1', [opts.profileId])
  let clienteId: string | null = access?.cliente_id ? String(access.cliente_id) : null

  if (!clienteId) {
    const base = slugify(prof.azienda || prof.nome || 'cliente')
    const slug = `${base}-${prof.id.slice(0, 6)}`
    const pkgLabel = prof.pacchetto ? (PACCHETTO_LABEL[prof.pacchetto] || prof.pacchetto) : '—'
    const pkgMap = (prof.pacchetto && PACCHETTO_PIANO[prof.pacchetto]) || PACCHETTO_FALLBACK
    const cli = await q1(
      `INSERT INTO clienti (nome, slug, email, telefono, piano, contenuti_mese, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (slug) DO UPDATE SET updated_at = now()
       RETURNING id`,
      [prof.azienda || prof.nome || 'Cliente', slug, prof.email || null, prof.telefono || null, pkgMap.piano, pkgMap.contenuti, `Pacchetto: ${pkgLabel} · registrazione self-serve`],
    )
    clienteId = (cli as { id: string }).id
    await q(
      `INSERT INTO user_client_access (user_id, cliente_id, ruolo, attivo)
       VALUES ($1, $2, 'owner', true)
       ON CONFLICT (user_id, cliente_id) DO NOTHING`,
      [opts.profileId, clienteId],
    )
  }

  // Collega gli id Stripe se forniti (pagamento andato a buon fine).
  if (clienteId && (opts.stripeCustomerId || opts.stripeSubscriptionId)) {
    await q(
      `UPDATE clienti
       SET stripe_customer_id = COALESCE($1, stripe_customer_id),
           stripe_subscription_id = COALESCE($2, stripe_subscription_id),
           updated_at = now()
       WHERE id = $3`,
      [opts.stripeCustomerId || null, opts.stripeSubscriptionId || null, clienteId],
    )
  }

  if (prof.status === 'active') {
    return { clienteId, alreadyActive: true }
  }

  await q(`UPDATE profiles SET status = 'active', updated_at = now() WHERE id = $1`, [opts.profileId])
  return { clienteId, alreadyActive: false }
}
