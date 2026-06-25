-- Social Automation V2 — Brand compliance fields
-- Esegui dopo 008_brand_settore.sql

alter table brand add column if not exists disclaimer_text text;
alter table brand add column if not exists gdpr_note text;
alter table brand add column if not exists privacy_note text;
alter table brand add column if not exists cookie_policy text;

comment on column brand.disclaimer_text is 'Testo del disclaimer legale';
comment on column brand.gdpr_note is 'Nota GDPR / trattamento dati';
comment on column brand.privacy_note is 'Informativa privacy sintetica';
comment on column brand.cookie_policy is 'Policy cookie sintetica';
