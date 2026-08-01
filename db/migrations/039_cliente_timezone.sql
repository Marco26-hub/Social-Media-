-- Fuso orario del cliente per la programmazione dei post. Le ore del piano (es. 10:00)
-- sono interpretate in questo fuso e convertite in UTC per Blotato (scheduledTime ISO).
-- Default Europe/Rome (clienti italiani). Additivo e idempotente.
alter table clienti add column if not exists timezone text not null default 'Europe/Rome';
