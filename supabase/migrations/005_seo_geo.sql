-- Migration: SEO + GEO Tables
-- Descrizione: Analisi SEO e GEO optimization

CREATE TABLE IF NOT EXISTS seo_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,

  audit_date DATE,
  audit_week INT, -- Week number

  -- SEO Scores
  seo_score INT, -- 0-100
  page_speed_score INT,
  mobile_score INT,
  ux_score INT,
  seo_health TEXT, -- EXCELLENT, GOOD, NEEDS_WORK

  -- Keyword Data
  total_keywords INT,
  ranking_1_10 INT, -- Keywords ranking 1-10
  ranking_11_50 INT,
  ranking_51_100 INT,

  -- Top Keywords
  top_keywords JSONB, -- [{keyword: "xyz", position: 5, search_volume: 1200}, ...]

  -- Competitor Benchmarking
  competitors_analyzed INT,
  vs_competitor_1 TEXT, -- "Ahead of xyz", "Behind xyz"
  vs_competitor_2 TEXT,

  -- Backlinks
  total_backlinks INT,
  quality_backlinks INT,
  new_backlinks_week INT,

  -- Traffic
  organic_traffic INT,
  organic_traffic_change DECIMAL(5,2), -- %
  featured_snippets INT,

  -- Issues
  critical_issues INT,
  warnings INT,
  opportunities INT,

  -- Top Opportunities
  opportunities_list JSONB, -- [{issue: "Missing alt text", pages: 45, impact: "HIGH"}, ...]

  created_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS geo_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,

  audit_date DATE,

  -- Target Geographies
  target_city TEXT,
  target_region TEXT,
  target_country TEXT DEFAULT 'IT',

  -- Local SEO Score
  local_seo_score INT, -- 0-100
  gmb_status TEXT, -- COMPLETE, INCOMPLETE, OPTIMIZED
  gmb_reviews_count INT,
  gmb_rating DECIMAL(3,2),

  -- Local Rankings
  local_keywords INT,
  local_top_3 INT, -- How many local keywords rank top 3

  -- Local Competitors
  local_competitors INT,
  competitive_position TEXT, -- LEADER, STRONG, WEAK

  -- Recommendations
  quick_wins JSONB, -- [{"action": "Update GMB hours", "impact": "HIGH", "time": "15 min"}]
  long_term JSONB, -- [{"action": "Build local citations", "impact": "MEDIUM", "time": "1 week"}]

  created_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS seo_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,
  seo_audit_id UUID REFERENCES seo_audits(id),

  recommendation_type TEXT, -- TECHNICAL, CONTENT, BACKLINKS, LOCAL
  priority TEXT, -- HIGH, MEDIUM, LOW
  title TEXT,
  description TEXT,

  -- Implementation
  estimated_time INT, -- Minutes
  estimated_traffic_impact INT, -- Estimated +X visitors/month
  difficulty TEXT, -- EASY, MEDIUM, HARD

  status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, IN_PROGRESS, COMPLETED
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES profiles(id),

  -- Results
  actual_impact INT, -- Actual +X visitors/month after implementation
  completed_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_seo_audits_cliente ON seo_audits(cliente_id, audit_date);
CREATE INDEX idx_geo_analysis_cliente ON geo_analysis(cliente_id, target_city);
CREATE INDEX idx_seo_recommendations_status ON seo_recommendations(cliente_id, status);

-- RLS
ALTER TABLE seo_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own client SEO" ON seo_audits
  FOR SELECT USING (
    cliente_id IN (
      SELECT id FROM clienti WHERE id IN (
        SELECT cliente_id FROM user_client_access WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service can insert SEO" ON seo_audits FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

CREATE POLICY "Users view own client GEO" ON geo_analysis
  FOR SELECT USING (
    cliente_id IN (
      SELECT id FROM clienti WHERE id IN (
        SELECT cliente_id FROM user_client_access WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service can insert GEO" ON geo_analysis FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

CREATE POLICY "Users manage recommendations" ON seo_recommendations
  FOR ALL USING (
    cliente_id IN (
      SELECT id FROM clienti WHERE id IN (
        SELECT cliente_id FROM user_client_access WHERE user_id = auth.uid()
      )
    )
  );
