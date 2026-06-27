-- Migration: Client Reports, ADS Tracking, Competitor Intelligence
-- Tables: client_reports, ads_campaigns, ads_daily_performance, competitor_tracking, competitor_changes

-- 1. CLIENT REPORTS (Weekly summary sent to client)
CREATE TABLE IF NOT EXISTS client_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,

  report_date DATE,
  report_week INT,

  -- Sales Summary
  total_revenue DECIMAL(10,2),
  revenue_google_merchant DECIMAL(10,2),
  revenue_etsy DECIMAL(10,2),
  revenue_tiktok_shop DECIMAL(10,2),
  revenue_website DECIMAL(10,2),
  revenue_other DECIMAL(10,2),

  -- Growth
  revenue_change DECIMAL(5,2), -- % vs last week
  orders_count INT,
  avg_order_value DECIMAL(10,2),

  -- Content Performance
  content_published INT, -- How many posts
  total_reach INT, -- Combined reach
  total_engagement INT, -- Combined engagement
  engagement_rate DECIMAL(5,2), -- %

  -- Lead Summary
  leads_generated INT, -- Total new leads
  leads_caldo INT, -- HOT
  leads_tiepido INT, -- WARM
  leads_freddo INT, -- COLD

  -- SEO Changes
  keyword_ranking_changes INT, -- New keywords in top 10
  organic_traffic_change DECIMAL(5,2), -- %

  -- ROI Estimates
  roi_estimate_social DECIMAL(5,2), -- % estimated
  roi_estimate_seo DECIMAL(5,2), -- %
  roi_estimate_ads DECIMAL(5,2), -- %

  -- Top Recommendations
  top_opportunities JSONB, -- [{title: "...", impact: "HIGH", effort: "2h"}]

  -- Status
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP,
  sent_to_email TEXT,

  created_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- 2. ADS CAMPAIGNS (Track all active ad campaigns)
CREATE TABLE IF NOT EXISTS ads_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,

  -- Campaign info
  platform TEXT, -- GOOGLE_ADS, META_ADS, TIKTOK_ADS
  campaign_id TEXT, -- External platform ID
  campaign_name TEXT,

  -- Budget & Status
  monthly_budget DECIMAL(10,2),
  daily_budget DECIMAL(10,2),
  status TEXT, -- ACTIVE, PAUSED, ENDED
  start_date DATE,
  end_date DATE,

  -- Targeting
  target_geo TEXT, -- "Italy", "Milano", etc
  target_keywords JSONB, -- ["keyword1", "keyword2"]
  target_audience TEXT, -- Description

  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 3. ADS DAILY PERFORMANCE (Daily metrics)
CREATE TABLE IF NOT EXISTS ads_daily_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ads_campaign_id UUID REFERENCES ads_campaigns(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,

  performance_date DATE,

  -- Metrics
  impressions INT,
  clicks INT,
  cost DECIMAL(10,2),
  conversions INT,
  revenue DECIMAL(10,2),

  -- Rates
  ctr DECIMAL(5,2), -- Click-through rate %
  cpc DECIMAL(10,2), -- Cost per click
  cpa DECIMAL(10,2), -- Cost per acquisition
  roas DECIMAL(5,2), -- Return on ad spend %

  -- Quality Score
  quality_score INT, -- 1-10 (Google Ads)
  optimization_suggestions TEXT,

  created_at TIMESTAMP DEFAULT now()
);

-- 4. COMPETITOR TRACKING (Snapshot of competitors)
CREATE TABLE IF NOT EXISTS competitor_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,

  -- Competitor info
  competitor_name TEXT,
  competitor_website TEXT,
  competitor_domain TEXT,

  -- SEO Metrics
  seo_score INT,
  top_keywords INT,
  backlinks INT,
  monthly_organic_traffic INT,

  -- Social Metrics
  instagram_followers INT,
  instagram_engagement_rate DECIMAL(5,2),
  tiktok_followers INT,
  tiktok_engagement_rate DECIMAL(5,2),

  -- Product / Pricing
  product_count INT,
  avg_product_price DECIMAL(10,2),
  price_vs_you TEXT, -- "5% cheaper", "10% more expensive"

  -- Recent Activity
  recent_posts_count INT, -- Last 7 days
  recent_campaigns JSONB, -- Observed ad campaigns

  -- Threat Level
  threat_level TEXT, -- LOW, MEDIUM, HIGH
  reason TEXT, -- Why is this competitor a threat

  snapshot_date DATE,
  created_at TIMESTAMP DEFAULT now()
);

-- 5. COMPETITOR CHANGES (Alert on changes)
CREATE TABLE IF NOT EXISTS competitor_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,
  competitor_id UUID REFERENCES competitor_tracking(id),

  -- What changed
  change_type TEXT, -- PRICE_DROP, NEW_PRODUCT, RANKING_UP, NEW_CAMPAIGN, FOLLOWERS_SPIKE
  change_description TEXT,
  change_value DECIMAL(10,2), -- The change (e.g., price dropped by 50)

  -- Impact
  threat_level TEXT, -- LOW, MEDIUM, HIGH
  recommended_action TEXT,

  detected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_client_reports_cliente ON client_reports(cliente_id, report_date);
CREATE INDEX idx_ads_campaigns_active ON ads_campaigns(cliente_id, status);
CREATE INDEX idx_ads_daily_perf ON ads_daily_performance(cliente_id, performance_date);
CREATE INDEX idx_competitor_tracking_cliente ON competitor_tracking(cliente_id, snapshot_date);
CREATE INDEX idx_competitor_changes_threat ON competitor_changes(cliente_id, threat_level);

-- RLS
ALTER TABLE client_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads_daily_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_changes ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Users view own client reports" ON client_reports
  FOR SELECT USING (
    cliente_id IN (
      SELECT id FROM clienti WHERE id IN (
        SELECT cliente_id FROM user_client_access WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service can insert reports" ON client_reports FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- Same for ADS
CREATE POLICY "Users view own ads" ON ads_campaigns
  FOR SELECT USING (
    cliente_id IN (
      SELECT id FROM clienti WHERE id IN (
        SELECT cliente_id FROM user_client_access WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service can manage ads" ON ads_campaigns FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

CREATE POLICY "Users view ads performance" ON ads_daily_performance
  FOR SELECT USING (
    cliente_id IN (
      SELECT id FROM clienti WHERE id IN (
        SELECT cliente_id FROM user_client_access WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service can insert ads perf" ON ads_daily_performance FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- Competitor policies
CREATE POLICY "Users view own competitors" ON competitor_tracking
  FOR SELECT USING (
    cliente_id IN (
      SELECT id FROM clienti WHERE id IN (
        SELECT cliente_id FROM user_client_access WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service can track competitors" ON competitor_tracking FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

CREATE POLICY "Users view competitor changes" ON competitor_changes
  FOR SELECT USING (
    cliente_id IN (
      SELECT id FROM clienti WHERE id IN (
        SELECT cliente_id FROM user_client_access WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service can log changes" ON competitor_changes FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);
