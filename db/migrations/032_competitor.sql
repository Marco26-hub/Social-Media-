-- Lista competitor per cliente (persistente) + storico analisi. Prima i competitor
-- vivevano solo nello stato del form (persi al refresh) e l'analisi non veniva mai
-- salvata: l'agente AUTO non aveva una lista da iterare né dove salvare.
create table if not exists competitor (
  id            uuid primary key default gen_random_uuid(),
  cliente_id    uuid not null references clienti(id) on delete cascade,
  nome          text not null,
  sito          text,
  social        jsonb,          -- array di handle
  attivo        boolean not null default true,
  created_at    timestamptz not null default now()
);
create index if not exists idx_competitor_cliente on competitor(cliente_id);

create table if not exists competitor_analysis (
  id               uuid primary key default gen_random_uuid(),
  cliente_id       uuid not null references clienti(id) on delete cascade,
  competitor_id    uuid references competitor(id) on delete set null,
  competitor_nome  text not null,
  analisi          jsonb,          -- il report completo generato
  score_competitor integer,
  generato_da      text,
  fonte_generazione text,          -- 'agente_auto' | 'manuale'
  created_at       timestamptz not null default now()
);
create index if not exists idx_competitor_analysis_cliente on competitor_analysis(cliente_id);
