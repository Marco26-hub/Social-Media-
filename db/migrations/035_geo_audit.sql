-- Audit GEO (AI-search citability) per cliente. Complementa seo_audit.score_geo_ai_search
-- (un singolo numero stimato dall'AI) con un punteggio CALCOLATO deterministicamente
-- sugli articoli blog pubblicati (lib/geo/citability.ts), più raccomandazioni concrete.
create table if not exists geo_audit (
  id                        uuid primary key default gen_random_uuid(),
  cliente_id                uuid not null references clienti(id) on delete cascade,
  data_audit                date not null,
  articoli_analizzati       integer not null default 0,
  citability_score_medio    numeric,
  citability_coverage       numeric,
  articolo_piu_debole_slug  text,
  articolo_piu_debole_score numeric,
  dettaglio                 jsonb,
  raccomandazioni           jsonb,
  llms_txt_pronto           boolean not null default false,
  generato_da               text,
  fonte_generazione         text,
  created_at                timestamptz not null default now()
);
create index if not exists idx_geo_audit_cliente on geo_audit(cliente_id, data_audit desc);

-- Nuovo agente 'geo' nel pannello abilitazioni (stesso pattern di 033_agent_config).
insert into agent_config (agent_key, enabled) values ('geo', true)
on conflict (agent_key) do nothing;
