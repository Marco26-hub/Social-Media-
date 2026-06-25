-- Social Automation V2 — Publish Bridge: campo scheduling Blotato
-- Esegui dopo 006_social_accounts.sql

alter table calendario add column if not exists blotato_scheduled_at timestamptz;
alter table calendario add column if not exists blotato_post_id text;

comment on column calendario.blotato_scheduled_at is 'Timestamp quando schedulato su Blotato';
comment on column calendario.blotato_post_id is 'ID post su Blotato/piattaforma';
