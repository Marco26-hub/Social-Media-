-- Social Automation V2 — Schema iniziale
-- Esegui su Supabase SQL Editor

-- ─────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- BRAND
-- ─────────────────────────────────────────
create table if not exists brand (
  id            uuid primary key default uuid_generate_v4(),
  brand_name    text not null,
  sito_url      text,
  tono_voce     text,
  target        text,
  promessa_brand text,
  colori_brand  text,
  parole_da_usare    text,
  parole_da_evitare  text,
  emoji_policy  text,
  hashtag_base  text,
  cta_base      text,
  note_legali   text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─────────────────────────────────────────
-- PRODOTTI
-- ─────────────────────────────────────────
create table if not exists prodotti (
  id              uuid primary key default uuid_generate_v4(),
  product_id      text unique not null,
  nome_prodotto   text not null,
  categoria       text,
  collezione      text,
  prezzo          numeric(10,2),
  prezzo_promo    numeric(10,2),
  link_prodotto   text,
  link_img_1      text,
  link_img_2      text,
  link_img_3      text,
  colori          text,
  taglie          text,
  mood            text,
  target          text,
  priorita        text check (priorita in ('alta','media','bassa')),
  prodotto_attivo text not null default 'SI' check (prodotto_attivo in ('SI','NO')),
  stock_status    text check (stock_status in ('disponibile','esaurito','in_arrivo')),
  stock_quantity  integer,
  data_ultimo_controllo_stock date,
  note            text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─────────────────────────────────────────
-- ACCOUNT SOCIAL
-- ─────────────────────────────────────────
create table if not exists account_social (
  id                  uuid primary key default uuid_generate_v4(),
  canale              text not null,
  nome_account        text not null,
  platform_account_id text not null,
  attivo              text not null default 'SI' check (attivo in ('SI','NO')),
  formati_permessi    text not null,
  default_media_type  text,
  note                text,
  created_at          timestamptz default now()
);

-- ─────────────────────────────────────────
-- PROMO
-- ─────────────────────────────────────────
create table if not exists promo (
  id               uuid primary key default uuid_generate_v4(),
  promo_id         text unique not null,
  promo_nome       text not null,
  promo_codice     text,
  promo_attiva     text not null default 'NO' check (promo_attiva in ('SI','NO')),
  promo_data_inizio date,
  promo_data_fine   date,
  descrizione      text,
  prodotti_inclusi text,
  canali_abilitati text,
  note             text,
  created_at       timestamptz default now()
);

-- ─────────────────────────────────────────
-- SETTINGS
-- ─────────────────────────────────────────
create table if not exists settings (
  id          uuid primary key default uuid_generate_v4(),
  chiave      text unique not null,
  valore      text not null,
  descrizione text,
  updated_at  timestamptz default now()
);

-- ─────────────────────────────────────────
-- CALENDARIO (tabella principale)
-- ─────────────────────────────────────────
create table if not exists calendario (
  id                  uuid primary key default uuid_generate_v4(),
  id_contenuto        text unique not null,
  data_pubblicazione  date not null,
  ora_pubblicazione   time not null default '12:00',
  canale              text not null,
  formato             text not null,
  obiettivo           text,
  product_id          text references prodotti(product_id),
  nome_prodotto       text,
  tema                text,
  hook                text,
  caption             text,
  hashtag             text,
  cta                 text,
  link_media_1        text,
  link_media_2        text,
  link_media_3        text,
  link_media_4        text,
  link_media_5        text,
  link_media_6        text,
  link_media_7        text,
  link_prodotto       text,
  link_prodotto_finale text,
  status              text not null default 'BOZZA'
    check (status in ('BOZZA','IDEA','DA_APPROVARE','APPROVATO',
                      'IN_PUBBLICAZIONE','PUBBLICATO','ERRORE',
                      'ERRORE_MANUALE','DRY_RUN_OK','ARCHIVIATO')),
  approvato_da        text,
  data_approvazione   timestamptz,
  blotato_post_id     text,
  errore              text,
  note                text,
  platform_account_id text,
  publish_lock_id     text,
  media_type          text,
  media_validato      text check (media_validato in ('SI','NO')),
  retry_count         integer default 0,
  last_retry_at       timestamptz,
  errore_tecnico      text,
  checked_copy        text check (checked_copy in ('SI','NO')),
  checked_media       text check (checked_media in ('SI','NO')),
  checked_link        text check (checked_link in ('SI','NO')),
  checked_price       text check (checked_price in ('SI','NO')),
  checked_by          text,
  checked_at          timestamptz,
  utm_source          text,
  utm_medium          text,
  utm_campaign        text,
  utm_content         text,
  promo_id            text references promo(promo_id),
  promo_codice        text,
  promo_validata      text check (promo_validata in ('SI','NO')),
  fonte_media         text,
  consenso_utilizzo   text check (consenso_utilizzo in ('SI','NO')),
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ─────────────────────────────────────────
-- LOG PUBBLICAZIONI
-- ─────────────────────────────────────────
create table if not exists log_pubblicazioni (
  id               uuid primary key default uuid_generate_v4(),
  timestamp        timestamptz default now(),
  id_contenuto     text,
  canale           text,
  formato          text,
  status_precedente text,
  status_finale    text not null,
  blotato_post_id  text,
  messaggio        text,
  errore           text
);

-- ─────────────────────────────────────────
-- BACKUP LOG
-- ─────────────────────────────────────────
create table if not exists backup_log (
  id           uuid primary key default uuid_generate_v4(),
  timestamp    timestamptz default now(),
  tipo         text,
  file_url     text,
  righe        integer,
  esito        text,
  note         text
);

-- ─────────────────────────────────────────
-- TRIGGERS — updated_at automatico
-- ─────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tr_calendario_updated_at
  before update on calendario
  for each row execute function update_updated_at();

create trigger tr_prodotti_updated_at
  before update on prodotti
  for each row execute function update_updated_at();

create trigger tr_brand_updated_at
  before update on brand
  for each row execute function update_updated_at();

create trigger tr_settings_updated_at
  before update on settings
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────
-- RLS — Row Level Security
-- ─────────────────────────────────────────
alter table calendario        enable row level security;
alter table prodotti          enable row level security;
alter table brand             enable row level security;
alter table account_social    enable row level security;
alter table promo             enable row level security;
alter table settings          enable row level security;
alter table log_pubblicazioni enable row level security;
alter table backup_log        enable row level security;

-- Policy: solo utenti autenticati
create policy "auth_all" on calendario        for all using (auth.role() = 'authenticated');
create policy "auth_all" on prodotti          for all using (auth.role() = 'authenticated');
create policy "auth_all" on brand             for all using (auth.role() = 'authenticated');
create policy "auth_all" on account_social    for all using (auth.role() = 'authenticated');
create policy "auth_all" on promo             for all using (auth.role() = 'authenticated');
create policy "auth_all" on settings          for all using (auth.role() = 'authenticated');
create policy "auth_all" on log_pubblicazioni for all using (auth.role() = 'authenticated');
create policy "auth_all" on backup_log        for all using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
-- DATI INIZIALI — Settings
-- ─────────────────────────────────────────
insert into settings (chiave, valore, descrizione) values
  ('automation_enabled',       'TRUE',         'Se FALSE nessun contenuto viene pubblicato'),
  ('dry_run',                  'FALSE',        'Se TRUE simula senza pubblicare'),
  ('timezone',                 'Europe/Rome',  'Timezone ufficiale del workflow'),
  ('max_retry',                '2',            'Numero massimo di retry automatici'),
  ('default_utm_campaign',     'social_default','Campagna UTM di default'),
  ('telegram_notifications',   'TRUE',         'Abilita notifiche Telegram'),
  ('backup_enabled',           'TRUE',         'Abilita backup giornaliero'),
  ('approval_required',        'TRUE',         'Pubblica solo contenuti approvati'),
  ('media_validation_required','TRUE',         'Blocca contenuti con media non validi'),
  ('stock_check_required',     'TRUE',         'Blocca prodotti non attivi o esauriti')
on conflict (chiave) do nothing;

-- ─────────────────────────────────────────
-- INDICI per performance
-- ─────────────────────────────────────────
create index if not exists idx_calendario_status          on calendario(status);
create index if not exists idx_calendario_data            on calendario(data_pubblicazione);
create index if not exists idx_calendario_canale          on calendario(canale);
create index if not exists idx_log_timestamp              on log_pubblicazioni(timestamp desc);
create index if not exists idx_log_id_contenuto           on log_pubblicazioni(id_contenuto);
