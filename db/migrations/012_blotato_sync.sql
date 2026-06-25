-- Social Automation V2 — Blotato publish sync fields
-- Esegui dopo 011_admin_user.sql

alter table calendario add column if not exists blotato_status text default null;
alter table calendario add column if not exists blotato_post_url text default null;
alter table calendario add column if not exists blotato_sync_at timestamptz default null;

comment on column calendario.blotato_status is 'Stato pubblicazione Blotato: scheduled|published|failed|pending';
comment on column calendario.blotato_post_url is 'URL del post pubblicato su Blotato/piattaforma';
comment on column calendario.blotato_sync_at is 'Ultima sincronizzazione con Blotato';
