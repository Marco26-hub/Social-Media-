-- Social Automation V2 — Admin user seed
-- Esegui dopo 010_client_portal.sql
-- Email: admin   Password: 1234567

insert into profiles (email, nome, password_hash, ruolo_globale)
values (
  'admin',
  'Admin Agenzia',
  '$2b$10$VO1c3nRkltKZS4rYnwH45O5ZumRe4XcE9skwEsoT5V9vEHEsfwKsa',
  'super_admin'
)
on conflict (email) do nothing;

-- Assegna admin a tutti i clienti esistenti
insert into user_client_access (user_id, cliente_id, ruolo)
select p.id, c.id, 'owner'
from profiles p, clienti c
where p.email = 'admin'
on conflict (user_id, cliente_id) do nothing;

update profiles set nome = 'Admin Agenzia' where email = 'admin';
