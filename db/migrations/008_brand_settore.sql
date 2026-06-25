-- Social Automation V2 — Brand Discovery: aggiunta campo settore
-- Esegui dopo 007_blotato_scheduling.sql

alter table brand add column if not exists settore text;

comment on column brand.settore is 'Settore/nicchia di mercato del brand';
