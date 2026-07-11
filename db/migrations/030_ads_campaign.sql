-- Campagne pubblicitarie generate dall'agente Ads (e riusabile dal manuale). Prima
-- la generazione ads restituiva solo JSON e si perdeva; ora viene persistita così
-- l'admin la rilegge in dashboard e l'agente AUTO ha dove salvare. Modellata su
-- seo_audit (jsonb per il payload variabile per-piattaforma).
create table if not exists ads_campaign (
  id            uuid primary key default gen_random_uuid(),
  cliente_id    uuid not null references clienti(id) on delete cascade,
  platform      text not null check (platform in ('google','facebook','tiktok')),
  obiettivo     text,
  budget        text,
  brand_source  text,
  campagna      jsonb,
  generato_da   text,
  fonte_generazione text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_ads_campaign_cliente on ads_campaign(cliente_id);
