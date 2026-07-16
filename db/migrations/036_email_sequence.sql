-- Sequenze email generate (welcome, cart abandonment, nurture, ...). Modellata su
-- ads_campaign (jsonb per payload variabile per-tipo). L'agente AUTO crea le
-- sequenze essenziali mancanti (welcome/cart_abandonment) una sola volta per
-- cliente; il manuale genera on-demand qualsiasi tipo senza persistere.
create table if not exists email_sequence (
  id            uuid primary key default gen_random_uuid(),
  cliente_id    uuid not null references clienti(id) on delete cascade,
  tipo          text not null check (tipo in ('welcome','nurture','cart_abandonment','onboarding','re_engagement','launch','cold_outreach')),
  contenuto     jsonb,
  generato_da   text,
  fonte_generazione text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_email_sequence_cliente on email_sequence(cliente_id, tipo);

insert into agent_config (agent_key, enabled) values ('email', true)
on conflict (agent_key) do nothing;
