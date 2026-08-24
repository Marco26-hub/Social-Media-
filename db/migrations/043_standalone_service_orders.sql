-- Ordini dei servizi autonomi (Blog SEO + GEO e Web & Commerce).
-- Separati dai pacchetti social: non creano quote contenuti né workspace social.

create table if not exists standalone_service_orders (
  id                         uuid primary key default gen_random_uuid(),
  service_slug               text not null check (service_slug in ('blog-seo', 'web-commerce', 'lead-pilot')),
  service_name               text not null,
  billing_mode               text not null default 'subscription' check (billing_mode in ('subscription', 'payment')),
  amount_cents               integer not null check (amount_cents > 0),
  currency                   text not null default 'eur',
  status                     text not null default 'checkout_pending',
  nome                       text not null,
  azienda                    text,
  email                      text not null,
  telefono                   text,
  customer_type              text not null check (customer_type in ('consumatore', 'impresa_professionista')),
  terms_accepted_at          timestamptz not null,
  terms_version              text not null default '2026-08-11',
  early_performance_requested boolean not null default false,
  withdrawal_loss_acknowledged boolean not null default false,
  stripe_session_id          text,
  stripe_customer_id         text,
  stripe_subscription_id     text,
  stripe_payment_intent_id   text,
  current_period_start       timestamptz,
  current_period_end         timestamptz,
  cancel_at_period_end       boolean not null default false,
  last_invoice_id            text,
  last_invoice_url           text,
  last_invoice_pdf           text,
  paid_at                    timestamptz,
  metadata                   jsonb not null default '{}'::jsonb,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

create unique index if not exists standalone_service_orders_session_uidx
  on standalone_service_orders(stripe_session_id)
  where stripe_session_id is not null;

create unique index if not exists standalone_service_orders_subscription_uidx
  on standalone_service_orders(stripe_subscription_id)
  where stripe_subscription_id is not null;

create index if not exists standalone_service_orders_status_created_idx
  on standalone_service_orders(status, created_at desc);

create index if not exists standalone_service_orders_email_idx
  on standalone_service_orders(lower(email), created_at desc);
