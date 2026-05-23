-- Social Automation V2 - Multi cliente + multiutente
-- Eseguire dopo 001_initial_schema.sql e 002_blog_seo.sql

create extension if not exists "uuid-ossp";

-- Utenti applicativi collegati a Supabase Auth.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nome text,
  ruolo_globale text not null default 'user'
    check (ruolo_globale in ('super_admin','admin','user')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists clienti (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  slug text unique not null,
  settore text,
  email text,
  telefono text,
  piano text not null default 'pro'
    check (piano in ('free','pro','agency','enterprise')),
  contenuti_mese integer not null default 30,
  attivo boolean not null default true,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists user_client_access (
  user_id uuid not null references auth.users(id) on delete cascade,
  cliente_id uuid not null references clienti(id) on delete cascade,
  ruolo text not null default 'editor'
    check (ruolo in ('owner','admin','editor','viewer')),
  attivo boolean not null default true,
  created_at timestamptz default now(),
  primary key (user_id, cliente_id)
);

-- Client default per backfill dei dati mono-brand esistenti.
insert into clienti (nome, slug, settore, piano, contenuti_mese)
values ('SILKinCOM', 'silkincom', 'Fashion e-commerce', 'pro', 30)
on conflict (slug) do nothing;

-- Backfill utenti gia esistenti prima dell'introduzione multiutente.
insert into profiles (id, email)
select id, email
from auth.users
on conflict (id) do update set
  email = excluded.email,
  updated_at = now();

insert into user_client_access (user_id, cliente_id, ruolo)
select u.id, c.id, 'owner'
from auth.users u
cross join clienti c
where c.slug = 'silkincom'
on conflict (user_id, cliente_id) do nothing;

-- Mantiene profiles allineata quando nasce un utente Supabase.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nome)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name')
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

-- Helper RLS.
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.ruolo_globale = 'super_admin'
  );
$$;

create or replace function public.has_cliente_access(target_cliente_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin()
    or exists (
      select 1
      from public.user_client_access uca
      where uca.user_id = auth.uid()
        and uca.cliente_id = target_cliente_id
        and uca.attivo = true
    );
$$;

create or replace function public.can_manage_cliente(target_cliente_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin()
    or exists (
      select 1
      from public.user_client_access uca
      where uca.user_id = auth.uid()
        and uca.cliente_id = target_cliente_id
        and uca.attivo = true
        and uca.ruolo in ('owner','admin')
    );
$$;

create or replace function public.create_cliente_for_current_user(
  cliente_nome text,
  cliente_slug text,
  cliente_settore text default null,
  cliente_email text default null,
  cliente_telefono text default null,
  cliente_piano text default 'pro'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_cliente_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Utente non autenticato';
  end if;

  insert into public.clienti (nome, slug, settore, email, telefono, piano)
  values (
    cliente_nome,
    lower(regexp_replace(cliente_slug, '[^a-zA-Z0-9]+', '-', 'g')),
    cliente_settore,
    cliente_email,
    cliente_telefono,
    cliente_piano
  )
  returning id into new_cliente_id;

  insert into public.user_client_access (user_id, cliente_id, ruolo)
  values (auth.uid(), new_cliente_id, 'owner');

  return new_cliente_id;
end;
$$;

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tr_profiles_updated_at on profiles;
create trigger tr_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

drop trigger if exists tr_clienti_updated_at on clienti;
create trigger tr_clienti_updated_at
  before update on clienti
  for each row execute function update_updated_at();

-- Aggiunge cliente_id alle tabelle operative.
alter table brand add column if not exists cliente_id uuid;
alter table prodotti add column if not exists cliente_id uuid;
alter table account_social add column if not exists cliente_id uuid;
alter table promo add column if not exists cliente_id uuid;
alter table settings add column if not exists cliente_id uuid;
alter table calendario add column if not exists cliente_id uuid;
alter table log_pubblicazioni add column if not exists cliente_id uuid;
alter table backup_log add column if not exists cliente_id uuid;
alter table blog_articoli add column if not exists cliente_id uuid;
alter table seo_audit add column if not exists cliente_id uuid;

do $$
declare
  default_cliente uuid;
begin
  select id into default_cliente from clienti where slug = 'silkincom';

  update brand set cliente_id = default_cliente where cliente_id is null;
  update prodotti set cliente_id = default_cliente where cliente_id is null;
  update account_social set cliente_id = default_cliente where cliente_id is null;
  update promo set cliente_id = default_cliente where cliente_id is null;
  update settings set cliente_id = default_cliente where cliente_id is null;
  update calendario set cliente_id = default_cliente where cliente_id is null;
  update log_pubblicazioni set cliente_id = default_cliente where cliente_id is null;
  update backup_log set cliente_id = default_cliente where cliente_id is null;
  update blog_articoli set cliente_id = default_cliente where cliente_id is null;
  update seo_audit set cliente_id = default_cliente where cliente_id is null;
end $$;

alter table brand alter column cliente_id set not null;
alter table prodotti alter column cliente_id set not null;
alter table account_social alter column cliente_id set not null;
alter table promo alter column cliente_id set not null;
alter table settings alter column cliente_id set not null;
alter table calendario alter column cliente_id set not null;
alter table log_pubblicazioni alter column cliente_id set not null;
alter table backup_log alter column cliente_id set not null;
alter table blog_articoli alter column cliente_id set not null;
alter table seo_audit alter column cliente_id set not null;

alter table brand
  add constraint brand_cliente_id_fkey foreign key (cliente_id) references clienti(id) on delete cascade;
alter table prodotti
  add constraint prodotti_cliente_id_fkey foreign key (cliente_id) references clienti(id) on delete cascade;
alter table account_social
  add constraint account_social_cliente_id_fkey foreign key (cliente_id) references clienti(id) on delete cascade;
alter table promo
  add constraint promo_cliente_id_fkey foreign key (cliente_id) references clienti(id) on delete cascade;
alter table settings
  add constraint settings_cliente_id_fkey foreign key (cliente_id) references clienti(id) on delete cascade;
alter table calendario
  add constraint calendario_cliente_id_fkey foreign key (cliente_id) references clienti(id) on delete cascade;
alter table log_pubblicazioni
  add constraint log_pubblicazioni_cliente_id_fkey foreign key (cliente_id) references clienti(id) on delete cascade;
alter table backup_log
  add constraint backup_log_cliente_id_fkey foreign key (cliente_id) references clienti(id) on delete cascade;
alter table blog_articoli
  add constraint blog_articoli_cliente_id_fkey foreign key (cliente_id) references clienti(id) on delete cascade;
alter table seo_audit
  add constraint seo_audit_cliente_id_fkey foreign key (cliente_id) references clienti(id) on delete cascade;

-- Rimuove vincoli globali mono-cliente e li sostituisce con vincoli per cliente.
alter table calendario drop constraint if exists calendario_product_id_fkey;
alter table calendario drop constraint if exists calendario_promo_id_fkey;
alter table prodotti drop constraint if exists prodotti_product_id_key;
alter table promo drop constraint if exists promo_promo_id_key;
alter table settings drop constraint if exists settings_chiave_key;
alter table calendario drop constraint if exists calendario_id_contenuto_key;
alter table blog_articoli drop constraint if exists blog_articoli_slug_key;

create unique index if not exists ux_prodotti_cliente_product_id on prodotti(cliente_id, product_id);
create unique index if not exists ux_promo_cliente_promo_id on promo(cliente_id, promo_id);
create unique index if not exists ux_settings_cliente_chiave on settings(cliente_id, chiave);
create unique index if not exists ux_calendario_cliente_id_contenuto on calendario(cliente_id, id_contenuto);
create unique index if not exists ux_blog_cliente_slug on blog_articoli(cliente_id, slug);

alter table calendario
  add constraint calendario_cliente_product_fkey
  foreign key (cliente_id, product_id)
  references prodotti(cliente_id, product_id);

alter table calendario
  add constraint calendario_cliente_promo_fkey
  foreign key (cliente_id, promo_id)
  references promo(cliente_id, promo_id);

create index if not exists idx_clienti_attivo on clienti(attivo);
create index if not exists idx_user_client_access_user on user_client_access(user_id);
create index if not exists idx_calendario_cliente_status on calendario(cliente_id, status);
create index if not exists idx_calendario_cliente_data on calendario(cliente_id, data_pubblicazione);
create index if not exists idx_log_cliente_timestamp on log_pubblicazioni(cliente_id, timestamp desc);
create index if not exists idx_prodotti_cliente on prodotti(cliente_id);
create index if not exists idx_settings_cliente on settings(cliente_id);

-- RLS multiutente.
alter table profiles enable row level security;
alter table clienti enable row level security;
alter table user_client_access enable row level security;

drop policy if exists "profiles_self_read" on profiles;
drop policy if exists "profiles_self_update" on profiles;
drop policy if exists "clienti_access" on clienti;
drop policy if exists "clienti_manage" on clienti;
drop policy if exists "uca_read" on user_client_access;
drop policy if exists "uca_manage" on user_client_access;

create policy "profiles_self_read" on profiles
  for select using (id = auth.uid() or public.is_super_admin());

create policy "profiles_self_update" on profiles
  for update using (id = auth.uid() or public.is_super_admin())
  with check (id = auth.uid() or public.is_super_admin());

create policy "clienti_access" on clienti
  for select using (public.has_cliente_access(id));

create policy "clienti_manage" on clienti
  for update using (public.can_manage_cliente(id))
  with check (public.can_manage_cliente(id));

create policy "uca_read" on user_client_access
  for select using (
    user_id = auth.uid()
    or public.is_super_admin()
    or public.can_manage_cliente(cliente_id)
  );

create policy "uca_manage" on user_client_access
  for all using (public.can_manage_cliente(cliente_id))
  with check (public.can_manage_cliente(cliente_id));

-- Sostituisce le policy permissive create nelle migration precedenti.
drop policy if exists "auth_all" on calendario;
drop policy if exists "auth_all" on prodotti;
drop policy if exists "auth_all" on brand;
drop policy if exists "auth_all" on account_social;
drop policy if exists "auth_all" on promo;
drop policy if exists "auth_all" on settings;
drop policy if exists "auth_all" on log_pubblicazioni;
drop policy if exists "auth_all" on backup_log;
drop policy if exists "auth_all" on blog_articoli;
drop policy if exists "auth_all" on seo_audit;

create policy "tenant_all" on calendario
  for all using (public.has_cliente_access(cliente_id))
  with check (public.has_cliente_access(cliente_id));
create policy "tenant_all" on prodotti
  for all using (public.has_cliente_access(cliente_id))
  with check (public.has_cliente_access(cliente_id));
create policy "tenant_all" on brand
  for all using (public.has_cliente_access(cliente_id))
  with check (public.has_cliente_access(cliente_id));
create policy "tenant_all" on account_social
  for all using (public.has_cliente_access(cliente_id))
  with check (public.has_cliente_access(cliente_id));
create policy "tenant_all" on promo
  for all using (public.has_cliente_access(cliente_id))
  with check (public.has_cliente_access(cliente_id));
create policy "tenant_all" on settings
  for all using (public.has_cliente_access(cliente_id))
  with check (public.has_cliente_access(cliente_id));
create policy "tenant_all" on log_pubblicazioni
  for all using (public.has_cliente_access(cliente_id))
  with check (public.has_cliente_access(cliente_id));
create policy "tenant_all" on backup_log
  for all using (public.has_cliente_access(cliente_id))
  with check (public.has_cliente_access(cliente_id));
create policy "tenant_all" on blog_articoli
  for all using (public.has_cliente_access(cliente_id))
  with check (public.has_cliente_access(cliente_id));
create policy "tenant_all" on seo_audit
  for all using (public.has_cliente_access(cliente_id))
  with check (public.has_cliente_access(cliente_id));
