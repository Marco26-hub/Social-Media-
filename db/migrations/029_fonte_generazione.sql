-- Origine della riga di calendario: distingue i contenuti generati dall'agente
-- AUTOMATICO ('agente_auto') da quelli manuali. Prima l'agente scriveva su una
-- colonna inesistente e il tag veniva droppato in silenzio (nessun modo di filtrare
-- le bozze automatiche). Idempotente.
alter table calendario add column if not exists fonte_generazione text;

comment on column calendario.fonte_generazione is
  'Origine generazione: agente_auto | manuale | NULL (storico). Usato per filtrare le bozze automatiche.';
