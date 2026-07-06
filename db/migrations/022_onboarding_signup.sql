-- Onboarding self-serve: registrazione con pacchetto + gate di attivazione.
-- Gli utenti esistenti restano 'active' (default) e non perdono accesso.
-- Le nuove registrazioni pubbliche entrano come 'pending' finché un admin attiva.

alter table profiles add column if not exists status text not null default 'active'
  check (status in ('pending', 'active', 'rejected'));

alter table profiles add column if not exists azienda   text;
alter table profiles add column if not exists telefono  text;
alter table profiles add column if not exists pacchetto text;
alter table profiles add column if not exists note      text;

-- Indice per la coda di attivazione lato admin.
create index if not exists idx_profiles_status on profiles (status) where status = 'pending';
