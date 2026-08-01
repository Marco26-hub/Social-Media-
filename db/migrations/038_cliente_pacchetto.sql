-- Pacchetto commerciale acquistato dal cliente (vedi lib/packages.ts).
-- Guida la generazione del "piano del pacchetto": numero, mix formati, social e
-- qualità dei contenuti compresi. Nullable: i clienti senza pacchetto usano solo
-- il piano libero. Modificabile dal menu impostazioni in caso di upgrade.
-- Additivo e idempotente: nessun impatto sui clienti esistenti.
alter table clienti add column if not exists pacchetto text
  check (pacchetto is null or pacchetto in ('presenza', 'crescita'));
