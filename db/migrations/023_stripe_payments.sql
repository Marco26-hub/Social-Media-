-- Pagamenti Stripe — Fase 2.
-- Additivo/idempotente: collega clienti a customer/subscription Stripe e salva
-- storico fatture/pagamenti senza inventare dati in UI.

alter table clienti add column if not exists stripe_customer_id text;
alter table clienti add column if not exists stripe_subscription_id text;

create unique index if not exists clienti_stripe_customer_uidx
  on clienti(stripe_customer_id)
  where stripe_customer_id is not null;

create table if not exists stripe_subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  cliente_id               uuid not null references clienti(id) on delete cascade,
  stripe_subscription_id   text not null unique,
  stripe_customer_id       text,
  status                   text not null,
  price_id                 text,
  pacchetto_slug           text,
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  cancel_at_period_end     boolean not null default false,
  latest_invoice_id        text,
  metadata                 jsonb,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists stripe_subscriptions_cliente_idx
  on stripe_subscriptions(cliente_id);

create table if not exists pagamenti (
  id                       uuid primary key default gen_random_uuid(),
  cliente_id               uuid not null references clienti(id) on delete cascade,
  stripe_invoice_id        text unique,
  stripe_payment_intent_id text,
  stripe_customer_id       text,
  stripe_subscription_id   text,
  amount_due               integer not null default 0,
  amount_paid              integer not null default 0,
  currency                 text not null default 'eur',
  status                   text not null,
  hosted_invoice_url       text,
  invoice_pdf              text,
  paid_at                  timestamptz,
  due_at                   timestamptz,
  period_start             timestamptz,
  period_end               timestamptz,
  raw                      jsonb,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists pagamenti_cliente_created_idx
  on pagamenti(cliente_id, created_at desc);

create index if not exists pagamenti_status_idx
  on pagamenti(status);
