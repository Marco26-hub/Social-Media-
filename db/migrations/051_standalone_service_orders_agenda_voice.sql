-- Estende gli ordini Stripe autonomi ai piani AgendaPiena / Segretaria AI.

alter table standalone_service_orders
  drop constraint if exists standalone_service_orders_service_slug_check;

alter table standalone_service_orders
  add constraint standalone_service_orders_service_slug_check
  check (service_slug in (
    'blog-seo',
    'web-commerce',
    'lead-pilot',
    'agenda-clienti',
    'tutto-in-uno',
    'voce-base',
    'voce-attivita',
    'voce-azienda'
  ));
