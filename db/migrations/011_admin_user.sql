-- Social Automation V2 — Admin user seed
-- Esegui dopo 010_client_portal.sql
-- Email: admin   Password: 1234567

insert into profiles (email, nome, password_hash, ruolo_globale)
values (
  'admin',
  'Admin Agenzia',
  '$2b$10$v/N5mTBnWfVec9kz1NorZ.RH4.FRi24xbpKyv7W7RWtPc/moeo7Hu',
  'super_admin'
)
on conflict (email) do update set
  nome = excluded.nome,
  password_hash = excluded.password_hash,
  ruolo_globale = excluded.ruolo_globale,
  updated_at = now();

-- Assegna admin a tutti i clienti esistenti
insert into user_client_access (user_id, cliente_id, ruolo)
select p.id, c.id, 'owner'
from profiles p, clienti c
where p.email = 'admin'
on conflict (user_id, cliente_id) do nothing;

update profiles
set
  nome = 'Admin Agenzia',
  password_hash = '$2b$10$v/N5mTBnWfVec9kz1NorZ.RH4.FRi24xbpKyv7W7RWtPc/moeo7Hu',
  ruolo_globale = 'super_admin',
  updated_at = now()
where email = 'admin';
