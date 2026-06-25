-- Social Automation V2 — Client portal (approvazione pubblica senza login)
-- Esegui dopo 009_brand_compliance.sql

create table if not exists approval_tokens (
  id uuid primary key default gen_random_uuid(),
  cliente_id text not null,
  contenuto_id text not null,
  token text unique not null,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','expired')),
  tipo_invio text not null default 'approvazione'
    check (tipo_invio in ('approvazione','feedback')),
  email_inviato text,
  email_inviato_at timestamptz,
  visualizzato_at timestamptz,
  approvato_at timestamptz,
  note_cliente text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days'
);

create index if not exists idx_approval_tokens_cliente on approval_tokens(cliente_id);
create index if not exists idx_approval_tokens_token on approval_tokens(token);
