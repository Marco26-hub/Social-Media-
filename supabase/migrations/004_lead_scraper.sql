-- Migration: Lead Scraper Tables
-- Descrizione: Gestione lead da scraping con categorizzazione caldo/freddo

-- 1. LEAD SCRAPER (Lead trovati da scraping)
CREATE TABLE IF NOT EXISTS scraped_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,

  -- Lead info
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  company TEXT,
  role TEXT, -- "Owner", "Manager", "Decision maker"

  -- Contact sources
  source TEXT, -- "Google", "Instagram", "TikTok", "Facebook", "Competitor", "Marketplace"
  source_url TEXT,
  profile_url TEXT, -- Social media profile link

  -- Engagement signals
  engagement_score INT DEFAULT 0, -- 0-100
  recent_engagement INT DEFAULT 0, -- Days since last engagement
  follower_count INT,
  engagement_rate DECIMAL(5,2), -- %

  -- Categorization
  temperature TEXT DEFAULT 'FREDDO', -- CALDO, TIEPIDO, FREDDO
  temperature_reason TEXT, -- Why hot/warm/cold

  -- Status
  status TEXT DEFAULT 'PENDING', -- PENDING (awaiting review), FLAGGED, APPROVED, CONTACTED, PURCHASED, REJECTED
  flagged_reason TEXT, -- Why flagged
  flagged_at TIMESTAMP,
  flagged_by UUID REFERENCES profiles(id),

  -- Action
  action_taken TEXT, -- "email_sent", "call_scheduled", "message_sent", "none"
  action_at TIMESTAMP,
  action_notes TEXT,

  -- Meta
  scraped_at TIMESTAMP DEFAULT now(),
  last_updated TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- 2. LEAD ACTIONS (History of actions taken)
CREATE TABLE IF NOT EXISTS lead_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES scraped_leads(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,

  action_type TEXT, -- "email_sent", "call_made", "message_sent", "meeting_scheduled"
  action_content TEXT, -- What was sent/said
  outcome TEXT, -- "positive", "neutral", "negative", "no_response"
  notes TEXT,

  created_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- 3. LEAD SOURCES (Tracking scraping sources)
CREATE TABLE IF NOT EXISTS lead_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,

  source_name TEXT, -- "Google Local", "Instagram Hashtag", "TikTok Comments", etc
  source_type TEXT, -- "GOOGLE", "SOCIAL", "COMPETITOR", "MARKETPLACE"
  source_config JSONB, -- {"hashtag": "#fashion", "location": "Milan", etc}

  is_active BOOLEAN DEFAULT true,
  last_scraped TIMESTAMP,
  leads_found_today INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_scraped_leads_cliente ON scraped_leads(cliente_id, status);
CREATE INDEX idx_scraped_leads_temp ON scraped_leads(cliente_id, temperature);
CREATE INDEX idx_scraped_leads_email ON scraped_leads(email);
CREATE INDEX idx_lead_actions_lead ON lead_actions(lead_id, created_at);
CREATE INDEX idx_lead_sources_cliente ON lead_sources(cliente_id, is_active);

-- RLS
ALTER TABLE scraped_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Users view own client leads" ON scraped_leads
  FOR SELECT USING (
    cliente_id IN (
      SELECT id FROM clienti WHERE id IN (
        SELECT cliente_id FROM user_client_access WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service can insert leads" ON scraped_leads FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own client leads" ON scraped_leads FOR UPDATE
  USING (
    cliente_id IN (
      SELECT id FROM clienti WHERE id IN (
        SELECT cliente_id FROM user_client_access WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    cliente_id IN (
      SELECT id FROM clienti WHERE id IN (
        SELECT cliente_id FROM user_client_access WHERE user_id = auth.uid()
      )
    )
  );

-- Same for lead_actions
CREATE POLICY "Users view own client actions" ON lead_actions
  FOR SELECT USING (
    cliente_id IN (
      SELECT id FROM clienti WHERE id IN (
        SELECT cliente_id FROM user_client_access WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service can insert actions" ON lead_actions FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- Same for lead_sources
CREATE POLICY "Users view own client sources" ON lead_sources
  FOR SELECT USING (
    cliente_id IN (
      SELECT id FROM clienti WHERE id IN (
        SELECT cliente_id FROM user_client_access WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service can manage sources" ON lead_sources FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);
