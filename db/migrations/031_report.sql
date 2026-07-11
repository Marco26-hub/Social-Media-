-- Report cliente periodici generati dall'agente Report (executive report AI +
-- statistiche fattuali). Prima /api/data/report calcolava tutto al volo senza AI e
-- senza persistenza; questo salva uno snapshot arricchito, leggibile nello storico.
-- Modellata su ads_campaign (corpo in un unico jsonb).
create table if not exists report (
  id            uuid primary key default gen_random_uuid(),
  cliente_id    uuid not null references clienti(id) on delete cascade,
  periodo       text not null check (periodo in ('settimanale','mensile')),
  periodo_da    date,
  periodo_a     date,
  titolo        text,
  contenuto     jsonb,          -- { executive_summary, health, highlights, bottlenecks, next_actions, stats }
  generato_da   text,           -- model AI
  fonte_generazione text,       -- 'agente_auto' | 'manuale'
  created_at    timestamptz not null default now()
);

create index if not exists idx_report_cliente on report(cliente_id);
