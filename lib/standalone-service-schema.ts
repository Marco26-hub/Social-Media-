import { q, q1 } from '@/lib/db'
import { STANDALONE_SERVICES } from '@/lib/standalone-services'

const MIGRATION = '043_standalone_service_orders.sql'
const CHECKSUM = 'd58a805a43d4ad1e38bf04d2260e67cbfaf7d05dc866d4e824c579c740f1e8fd'
const SERVICE_EXTENSION_MIGRATION = '051_standalone_service_orders_agenda_voice.sql'
const SERVICE_EXTENSION_CHECKSUM = 'c9cb5385b9f7e6f922166a5621c78e7d833ac1c67f48850dbdb7e7005d5e4f26'
// L'elenco ammesso dal vincolo si ricava dal catalogo, non si riscrive a mano.
//
// Scritto a mano si era gia' rotto: 'web-impresa', 'profili-social-gbp' e i
// quattro pacchetti video erano in vendita sulle pagine e nel form di acquisto,
// ma non in questo elenco. Chi li avesse comprati avrebbe pagato su Stripe e
// l'ordine sarebbe stato respinto dal database — un incasso senza ordine, che
// e' il modo peggiore di scoprire un difetto. Qui il vincolo segue il catalogo
// per costruzione, quindi non puo' piu' restare indietro.
const SLUG_AMMESSI = STANDALONE_SERVICES.map(servizio => servizio.slug)
const SERVICE_SLUG_CHECK = `service_slug IN (${SLUG_AMMESSI.map(slug => `'${slug}'`).join(', ')})`

let schemaPromise: Promise<void> | null = null

/** I promemoria delle fatture da emettere a mano. Vedi 054_fatture_da_emettere.sql. */
async function ensureInvoicesTable() {
  await q(`CREATE TABLE IF NOT EXISTS standalone_service_invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES standalone_service_orders(id) ON DELETE CASCADE,
    stripe_ref text NOT NULL,
    kind text NOT NULL CHECK (kind IN ('invoice', 'payment')),
    amount_cents integer NOT NULL CHECK (amount_cents > 0),
    currency text NOT NULL DEFAULT 'eur',
    paid_at timestamptz NOT NULL DEFAULT now(),
    period_start timestamptz,
    period_end timestamptz,
    hosted_invoice_url text,
    invoice_pdf text,
    issued_at timestamptz,
    issued_note text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`)
  await q(`CREATE UNIQUE INDEX IF NOT EXISTS standalone_service_invoices_ref_uidx
    ON standalone_service_invoices(stripe_ref)`)
  await q(`CREATE INDEX IF NOT EXISTS standalone_service_invoices_da_emettere_idx
    ON standalone_service_invoices(paid_at DESC) WHERE issued_at IS NULL`)
}

async function initializeSchema() {
  const existing = await q1(`SELECT
    to_regclass('public.standalone_service_orders') AS relation,
    to_regclass('public.schema_migrations') AS migrations`)
  if (existing?.relation) {
    const constraint = await q1(`SELECT pg_get_constraintdef(oid) AS definition
      FROM pg_constraint
      WHERE conrelid = 'public.standalone_service_orders'::regclass
        AND conname = 'standalone_service_orders_service_slug_check'
      LIMIT 1`)
    const definition = String(constraint?.definition || '')
    // Basta che ne manchi uno: il vincolo va riscritto per intero.
    const mancanti = SLUG_AMMESSI.filter(slug => !definition.includes(`'${slug}'`))
    if (mancanti.length > 0) {
      await q('ALTER TABLE standalone_service_orders DROP CONSTRAINT IF EXISTS standalone_service_orders_service_slug_check')
      await q(`ALTER TABLE standalone_service_orders ADD CONSTRAINT standalone_service_orders_service_slug_check CHECK (${SERVICE_SLUG_CHECK})`)
    }
  }
  if (existing?.relation) {
    await ensureInvoicesTable()
  }
  if (existing?.relation && existing?.migrations) {
    const applied = await q1('SELECT checksum FROM schema_migrations WHERE filename = $1 LIMIT 1', [MIGRATION])
    if (applied?.checksum) {
      if (String(applied.checksum) !== CHECKSUM) throw new Error(`Checksum diversa per ${MIGRATION}`)
      const extension = await q1(
        'SELECT checksum FROM schema_migrations WHERE filename = $1 LIMIT 1',
        [SERVICE_EXTENSION_MIGRATION],
      )
      if (extension?.checksum && String(extension.checksum) !== SERVICE_EXTENSION_CHECKSUM) {
        throw new Error(`Checksum diversa per ${SERVICE_EXTENSION_MIGRATION}`)
      }
      if (!extension?.checksum) {
        await q(
          'INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)',
          [SERVICE_EXTENSION_MIGRATION, SERVICE_EXTENSION_CHECKSUM],
        )
      }
      return
    }
  }
  if (!existing?.relation) {
    await q(`CREATE TABLE IF NOT EXISTS standalone_service_orders (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      service_slug text NOT NULL CHECK (${SERVICE_SLUG_CHECK}),
      service_name text NOT NULL,
      billing_mode text NOT NULL DEFAULT 'subscription' CHECK (billing_mode IN ('subscription', 'payment')),
      amount_cents integer NOT NULL CHECK (amount_cents > 0),
      currency text NOT NULL DEFAULT 'eur',
      status text NOT NULL DEFAULT 'checkout_pending',
      nome text NOT NULL,
      azienda text,
      email text NOT NULL,
      telefono text,
      customer_type text NOT NULL CHECK (customer_type IN ('consumatore', 'impresa_professionista')),
      terms_accepted_at timestamptz NOT NULL,
      terms_version text NOT NULL DEFAULT '2026-08-11',
      early_performance_requested boolean NOT NULL DEFAULT false,
      withdrawal_loss_acknowledged boolean NOT NULL DEFAULT false,
      stripe_session_id text,
      stripe_customer_id text,
      stripe_subscription_id text,
      stripe_payment_intent_id text,
      current_period_start timestamptz,
      current_period_end timestamptz,
      cancel_at_period_end boolean NOT NULL DEFAULT false,
      last_invoice_id text,
      last_invoice_url text,
      last_invoice_pdf text,
      paid_at timestamptz,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`)
  }

  await q(`CREATE UNIQUE INDEX IF NOT EXISTS standalone_service_orders_session_uidx
    ON standalone_service_orders(stripe_session_id) WHERE stripe_session_id IS NOT NULL`)
  await q(`CREATE UNIQUE INDEX IF NOT EXISTS standalone_service_orders_subscription_uidx
    ON standalone_service_orders(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL`)
  await q(`CREATE INDEX IF NOT EXISTS standalone_service_orders_status_created_idx
    ON standalone_service_orders(status, created_at DESC)`)
  await q(`CREATE INDEX IF NOT EXISTS standalone_service_orders_email_idx
    ON standalone_service_orders(lower(email), created_at DESC)`)
  await q(`CREATE TABLE IF NOT EXISTS standalone_service_invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES standalone_service_orders(id) ON DELETE CASCADE,
    stripe_ref text NOT NULL,
    kind text NOT NULL CHECK (kind IN ('invoice', 'payment')),
    amount_cents integer NOT NULL CHECK (amount_cents > 0),
    currency text NOT NULL DEFAULT 'eur',
    paid_at timestamptz NOT NULL DEFAULT now(),
    period_start timestamptz,
    period_end timestamptz,
    hosted_invoice_url text,
    invoice_pdf text,
    issued_at timestamptz,
    issued_note text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`)
  await q(`CREATE UNIQUE INDEX IF NOT EXISTS standalone_service_invoices_ref_uidx
    ON standalone_service_invoices(stripe_ref)`)
  await q(`CREATE INDEX IF NOT EXISTS standalone_service_invoices_da_emettere_idx
    ON standalone_service_invoices(paid_at DESC) WHERE issued_at IS NULL`)

  await q(`CREATE TABLE IF NOT EXISTS schema_migrations (
    filename text PRIMARY KEY,
    checksum text NOT NULL,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`)
  await q(
    `INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)
     ON CONFLICT (filename) DO NOTHING`,
    [MIGRATION, CHECKSUM],
  )
  await q(
    `INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)
     ON CONFLICT (filename) DO NOTHING`,
    [SERVICE_EXTENSION_MIGRATION, SERVICE_EXTENSION_CHECKSUM],
  )
}

export async function ensureStandaloneServiceOrdersSchema() {
  if (!schemaPromise) {
    schemaPromise = initializeSchema().catch(error => {
      schemaPromise = null
      throw error
    })
  }
  return schemaPromise
}
