-- Corsi online a pagamento: catalogo, erogazione e acquisti.
--
-- Da non confondere con `corso_iscrizioni` (migrazione 050): quella e la lista
-- d'attesa dei Video corsi AI Act, cioe una manifestazione di interesse senza
-- pagamento. Queste tabelle sono il prodotto vero: si comprano, si guardano e
-- tengono traccia dei progressi. I due imbuti restano separati.
--
-- L'utente non ha una tabella propria: e `profiles`, la stessa del portale e
-- della dashboard. Chi compra un corso ottiene un account attivo con
-- ruolo_globale 'user', quindi entra in /portale e mai in /dashboard.

create table if not exists corsi (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  titolo          text not null,
  sottotitolo     text,
  descrizione     text not null default '',
  immagine_url    text,
  -- In centesimi come tutto il resto degli importi del progetto. Il vincolo > 0
  -- e voluto: il listino corsi non prevede omaggi, e un prezzo a zero sarebbe
  -- quasi sempre un errore di battitura in fase di inserimento.
  prezzo_cents    integer not null check (prezzo_cents > 0),
  currency        text not null default 'eur',
  livello         text not null default 'base'
    check (livello in ('base', 'intermedio', 'avanzato')),
  categoria       text,
  pubblicato      boolean not null default false,
  in_evidenza     boolean not null default false,
  ordine          integer not null default 0,
  seo_title       text,
  seo_description text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists corsi_pubblicati_idx
  on corsi (pubblicato, in_evidenza desc, ordine, created_at desc);

create table if not exists corso_moduli (
  id         uuid primary key default gen_random_uuid(),
  corso_id   uuid not null references corsi(id) on delete cascade,
  titolo     text not null,
  ordine     integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists corso_moduli_corso_idx
  on corso_moduli (corso_id, ordine);

create table if not exists corso_lezioni (
  id                 uuid primary key default gen_random_uuid(),
  modulo_id          uuid not null references corso_moduli(id) on delete cascade,
  titolo             text not null,
  ordine             integer not null default 0,
  tipo               text not null default 'video' check (tipo in ('video', 'testo')),
  video_url          text,
  contenuto          text,
  durata_min         integer,
  -- Lezione visibile senza acquisto: serve a far assaggiare il corso prima di
  -- pagarlo. Le altre non escono mai dal database verso una pagina pubblica.
  anteprima_gratuita boolean not null default false,
  created_at         timestamptz not null default now()
);

create index if not exists corso_lezioni_modulo_idx
  on corso_lezioni (modulo_id, ordine);

create table if not exists corso_acquisti (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references profiles(id) on delete cascade,
  -- restrict, non cascade: cancellare un corso gia venduto deve fallire invece
  -- di cancellare la prova che qualcuno lo ha pagato. Nell'amministrazione un
  -- corso con vendite si archivia (pubblicato = false), non si elimina.
  corso_id                 uuid not null references corsi(id) on delete restrict,
  amount_cents             integer not null,
  currency                 text not null default 'eur',
  status                   text not null default 'checkout_pending',
  stripe_session_id        text,
  stripe_payment_intent_id text,
  paid_at                  timestamptz,
  -- Stessi obblighi verso il consumatore degli ordini servizi (migrazione 043):
  -- un corso e contenuto digitale, e l'accesso immediato fa decadere il recesso
  -- solo se il cliente lo ha chiesto e ne e stato informato.
  customer_type            text not null
    check (customer_type in ('consumatore', 'impresa_professionista')),
  terms_accepted_at        timestamptz not null,
  terms_version            text not null default '2026-08-11',
  early_performance_requested  boolean not null default false,
  withdrawal_loss_acknowledged boolean not null default false,
  metadata                 jsonb not null default '{}'::jsonb,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- Unico solo sugli acquisti pagati: un checkout abbandonato non deve impedire
-- di riprovare l'acquisto dello stesso corso.
create unique index if not exists corso_acquisti_pagato_uidx
  on corso_acquisti (user_id, corso_id)
  where status = 'paid';

-- Idempotenza del webhook Stripe, come standalone_service_orders_session_uidx.
create unique index if not exists corso_acquisti_session_uidx
  on corso_acquisti (stripe_session_id)
  where stripe_session_id is not null;

create index if not exists corso_acquisti_user_idx
  on corso_acquisti (user_id, status);

create index if not exists corso_acquisti_corso_idx
  on corso_acquisti (corso_id, status, created_at desc);

create table if not exists corso_progressi (
  user_id      uuid not null references profiles(id) on delete cascade,
  lezione_id   uuid not null references corso_lezioni(id) on delete cascade,
  completata   boolean not null default true,
  completed_at timestamptz not null default now(),
  primary key (user_id, lezione_id)
);
