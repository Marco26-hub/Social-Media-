-- Promemoria delle fatture da emettere a mano.
--
-- Stripe incassa e manda la sua ricevuta, ma la fattura fiscale la emette il
-- Titolare dal suo gestionale. Con i pagamenti una tantum bastava guardare
-- l'ordine; con gli abbonamenti no: il rinnovo è automatico e ogni mese nasce
-- un incasso nuovo che non lascia traccia sull'ordine, perché la colonna
-- last_invoice_* viene sovrascritta. Il mese scorso sparisce, e con lui la
-- fattura da emettere.
--
-- Qui ogni incasso lascia una riga. Finché issued_at è nullo, quella riga è un
-- promemoria che compare nel pannello.

create table if not exists standalone_service_invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references standalone_service_orders(id) on delete cascade,
  -- L'id Stripe dell'incasso: invoice per gli abbonamenti, sessione di
  -- checkout per i pagamenti unici, che non generano una invoice.
  stripe_ref text not null,
  kind text not null check (kind in ('invoice', 'payment')),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'eur',
  paid_at timestamptz not null default now(),
  period_start timestamptz,
  period_end timestamptz,
  hosted_invoice_url text,
  invoice_pdf text,
  -- Quando il Titolare ha emesso la fattura fiscale. Nullo = da fare.
  issued_at timestamptz,
  issued_note text,
  created_at timestamptz not null default now()
);

create unique index if not exists standalone_service_invoices_ref_uidx
  on standalone_service_invoices(stripe_ref);

create index if not exists standalone_service_invoices_da_emettere_idx
  on standalone_service_invoices(paid_at desc) where issued_at is null;
