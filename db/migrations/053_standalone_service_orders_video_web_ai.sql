-- Allinea il vincolo sugli slug al catalogo dei servizi.
--
-- Il vincolo era fermo agli otto slug del 2026-08. Nel frattempo il catalogo
-- ha aggiunto 'web-impresa', 'profili-social-gbp' e i quattro pacchetti video:
-- erano acquistabili dalle pagine e dal form, ma un ordine con quegli slug
-- veniva respinto dal database DOPO il pagamento su Stripe — cioe' un incasso
-- senza ordine registrato. Qui si rimettono in pari, e si aggiunge
-- 'ai-analisi' e 'ai-manutenzione', i due pezzi acquistabili del servizio
-- «AI a casa tua».

alter table standalone_service_orders
  drop constraint if exists standalone_service_orders_service_slug_check;

alter table standalone_service_orders
  add constraint standalone_service_orders_service_slug_check
  check (service_slug in (
    'blog-seo',
    'web-commerce',
    'web-impresa',
    'lead-pilot',
    'agenda-clienti',
    'tutto-in-uno',
    'voce-base',
    'voce-attivita',
    'voce-azienda',
    'video-start',
    'video-silver',
    'video-gold',
    'video-platinum',
    'profili-social-gbp',
    'ai-analisi',
    'ai-manutenzione'
  ));
