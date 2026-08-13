-- Dichiarazioni di recesso consumer e disdette professionali.
-- Il contenuto trasmesso, data/ora e hash sono conservati per produrre una
-- ricevuta verificabile ai sensi dell'art. 54-bis del Codice del consumo.

create table if not exists recessi (
  id                     uuid primary key default gen_random_uuid(),
  reference_code         text not null unique,
  request_type           text not null check (request_type in ('recesso_consumatore', 'disdetta_professionale')),
  customer_type          text not null check (customer_type in ('consumatore', 'impresa_professionista')),
  contract_category      text not null check (contract_category in ('servizi_digitali', 'sito_ecommerce', 'consulenza_legale', 'altro')),
  execution_status       text not null check (execution_status in ('non_iniziata', 'iniziata', 'completata', 'non_so')),
  full_name              text not null,
  email                  text not null,
  contract_reference     text not null,
  contract_date          date not null,
  declaration_text       text not null,
  consumer_declaration   boolean not null default false,
  timeliness             text not null check (timeliness in ('entro_14_giorni', 'verifica_necessaria', 'non_applicabile')),
  status                 text not null default 'ricevuta' check (status in ('ricevuta', 'in_verifica', 'elaborata', 'non_applicabile')),
  admin_note             text,
  receipt_status         text not null default 'pending' check (receipt_status in ('pending', 'sent', 'failed', 'skipped')),
  receipt_email_id       text,
  receipt_sent_at        timestamptz,
  payload_hash           char(64) not null,
  form_version           text not null,
  submitted_at           timestamptz not null,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists recessi_status_submitted_idx
  on recessi(status, submitted_at desc);

create index if not exists recessi_email_contract_idx
  on recessi(lower(email), contract_reference);

-- Classificazione e consensi raccolti al momento dell'acquisto online.
alter table profiles add column if not exists customer_type text
  check (customer_type in ('consumatore', 'impresa_professionista'));
alter table profiles add column if not exists terms_accepted_at timestamptz;
alter table profiles add column if not exists terms_version text;
alter table profiles add column if not exists early_performance_requested boolean not null default false;
alter table profiles add column if not exists withdrawal_loss_acknowledged boolean not null default false;
