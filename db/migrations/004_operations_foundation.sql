-- Social Automation V2 - Fondamenta operative per Neon/Postgres
-- Obiettivo: rendere tracciabili job backend, integrazioni e prossime automazioni.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────
-- GENERATION JOBS
-- Traccia richieste lunghe o batch: piano editoriale, contenuti, audit, publish.
-- Le API route attuali possono restare sincrone; questa tabella prepara queue/job async.
-- ─────────────────────────────────────────
create table if not exists generation_jobs (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clienti(id) on delete cascade,
  tipo text not null
    check (tipo in ('content','plan','seo_audit','media_validation','publish','report')),
  status text not null default 'queued'
    check (status in ('queued','running','completed','failed','cancelled')),
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error_message text,
  model text,
  attempts integer not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_generation_jobs_cliente_status
  on generation_jobs(cliente_id, status, created_at desc);

create index if not exists idx_generation_jobs_tipo
  on generation_jobs(tipo, created_at desc);

-- ─────────────────────────────────────────
-- INTEGRATION EVENTS
-- Inbox/outbox minimale per Blotato, webhook custom, media validators, report.
-- ─────────────────────────────────────────
create table if not exists integration_events (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clienti(id) on delete cascade,
  provider text not null,
  event_type text not null,
  direction text not null default 'outbound'
    check (direction in ('inbound','outbound')),
  status text not null default 'received'
    check (status in ('received','processing','processed','failed','ignored')),
  entity_type text,
  entity_id text,
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_integration_events_cliente_status
  on integration_events(cliente_id, status, created_at desc);

create index if not exists idx_integration_events_provider
  on integration_events(provider, event_type, created_at desc);
