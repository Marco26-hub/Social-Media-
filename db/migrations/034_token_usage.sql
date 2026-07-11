-- Log dei token AI consumati (per la pagina Consumi Token). Una riga per chiamata AI
-- riuscita. cliente_id/agent_name NULL = generazione globale/manuale non attribuita
-- (Fase 1: logging globale; l'attribuzione per-cliente/agente arriva incrementale).
create table if not exists token_usage (
  id                uuid primary key default gen_random_uuid(),
  cliente_id        uuid references clienti(id) on delete cascade,
  tipo              text,
  agent_name        text,
  provider          text,
  model             text,
  prompt_tokens     integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens      integer not null default 0,
  created_at        timestamptz not null default now()
);
create index if not exists idx_token_usage_created on token_usage(created_at desc);
create index if not exists idx_token_usage_cliente on token_usage(cliente_id, created_at desc);
