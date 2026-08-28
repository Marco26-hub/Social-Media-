import { q, q1 } from '@/lib/db'

const MIGRATION = '043_standalone_service_orders.sql'
const CHECKSUM = 'd58a805a43d4ad1e38bf04d2260e67cbfaf7d05dc866d4e824c579c740f1e8fd'

let schemaPromise: Promise<void> | null = null

async function initializeSchema() {
  const existing = await q1(`SELECT
    to_regclass('public.standalone_service_orders') AS relation,
    to_regclass('public.schema_migrations') AS migrations`)
  if (existing?.relation && existing?.migrations) {
    const applied = await q1('SELECT checksum FROM schema_migrations WHERE filename = $1 LIMIT 1', [MIGRATION])
    if (applied?.checksum) {
      if (String(applied.checksum) !== CHECKSUM) throw new Error(`Checksum diversa per ${MIGRATION}`)
      return
    }
  }
  if (!existing?.relation) {
    await q(`CREATE TABLE IF NOT EXISTS standalone_service_orders (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      service_slug text NOT NULL CHECK (service_slug IN ('blog-seo', 'web-commerce', 'lead-pilot')),
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
