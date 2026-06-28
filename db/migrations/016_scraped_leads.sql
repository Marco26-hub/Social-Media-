-- Social Automation V2 — Tabella lead scraping (prospect-scraper agent)
-- Usata da lib/agents/prospect-scraper-agent.ts (INSERT ... ON CONFLICT (email, cliente_id))

create table if not exists scraped_leads (
  id                uuid primary key default gen_random_uuid(),
  cliente_id        uuid not null references clienti(id) on delete cascade,
  first_name        text,
  last_name         text,
  email             text not null,
  phone             text,
  company_name      text,
  title             text,
  engagement_score  integer not null default 0,
  temperature       text not null default 'FREDDO',  -- CALDO | TIEPIDO | FREDDO
  source            text,                             -- LinkedIn | GoogleMaps | Instagram | Website
  status            text not null default 'PENDING',  -- PENDING | CONTACTED | WON | LOST
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (email, cliente_id)
);

create index if not exists idx_scraped_leads_cliente on scraped_leads(cliente_id);
create index if not exists idx_scraped_leads_temperature on scraped_leads(cliente_id, temperature);
create index if not exists idx_scraped_leads_score on scraped_leads(cliente_id, engagement_score desc);

comment on table scraped_leads is 'Lead generati dal prospect-scraper agent, per cliente';
comment on column scraped_leads.temperature is 'CALDO (70-100), TIEPIDO (40-69), FREDDO (0-39)';
comment on column scraped_leads.status is 'Stato follow-up commerciale: PENDING, CONTACTED, WON, LOST';
