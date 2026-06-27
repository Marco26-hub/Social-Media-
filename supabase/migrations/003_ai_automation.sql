-- Migration: AI Automation Tables
-- Descrizione: Tabelle per Strategic Planner, Editorial Planner, Content Generators, Feedback Loop

-- 1. STRATEGIC PLANS (Piano strategico mensile)
CREATE TABLE IF NOT EXISTS strategic_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,
  mese TEXT NOT NULL, -- "2026-07"

  -- Pillars
  pillar_1 TEXT, -- "Product Showcase"
  pillar_1_desc TEXT,
  pillar_2 TEXT,
  pillar_2_desc TEXT,
  pillar_3 TEXT,
  pillar_3_desc TEXT,
  pillar_4 TEXT,
  pillar_4_desc TEXT,

  -- Tone & Audience
  tone_voice TEXT, -- "Friendly, aspirational, modern"
  primary_audience TEXT, -- "Women 20-50"

  -- Segments
  segment_1 TEXT, -- "20-30F: Focus on trends"
  segment_2 TEXT, -- "30-45F: Focus on quality"
  segment_3 TEXT, -- "45-50F: Focus on elegance"

  -- Seasonal
  seasonal_focus TEXT,

  -- Best times
  instagram_time_1 TEXT, -- "14:00"
  instagram_time_2 TEXT, -- "20:00"
  tiktok_time_1 TEXT,
  tiktok_time_2 TEXT,
  facebook_time TEXT,

  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- 2. EDITORIAL PLANS (Piano editoriale 28 giorni)
CREATE TABLE IF NOT EXISTS editorial_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,
  strategic_plan_id UUID REFERENCES strategic_plans(id),

  week_number INT, -- 1-4
  plan_date DATE, -- Start date of week

  created_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- 3. EDITORIAL PLAN DAYS (Singolo giorno nel piano)
CREATE TABLE IF NOT EXISTS editorial_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  editorial_plan_id UUID NOT NULL REFERENCES editorial_plans(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,

  plan_date DATE,
  day_of_week TEXT, -- "Lunedì"

  pillar TEXT, -- "PRODUCT", "EDUCATION", "LIFESTYLE", "PROMO"
  content_type TEXT, -- "Reel", "Carousel", "Stories", "Post", "Promo"
  topic TEXT, -- "Summer collection showcase"
  audience_segment TEXT, -- "20-30F", "30-45F", "All"

  best_time TIME,
  platform TEXT, -- "Instagram", "TikTok", "Facebook"

  hashtags TEXT, -- JSON array or comma-separated
  repurpose_to TEXT, -- "Story,TikTok"

  created_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- 4. CONTENT QUEUE (Contenuti generati, in attesa di approvazione)
CREATE TABLE IF NOT EXISTS content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,
  editorial_plan_day_id UUID REFERENCES editorial_plan_days(id),

  content_type TEXT, -- "Reel", "Carousel", "Stories", "Educational", "Promo"
  topic TEXT,

  -- Copy
  copy_hook TEXT, -- Primo 2 secondi
  copy_body TEXT, -- Main content
  copy_cta TEXT, -- Call to action

  -- Metadata
  hashtags TEXT, -- JSON array
  suggested_sound TEXT, -- For reels/videos
  effects TEXT, -- Video effects suggestion

  carousel_slides INT, -- If carousel, how many slides

  -- Status
  status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, PUBLISHED, REJECTED
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES profiles(id),

  -- Publishing
  published_at TIMESTAMP,
  published_to TEXT, -- "Instagram", "TikTok", etc
  blotato_post_id TEXT, -- From Blotato API

  generated_by TEXT, -- "ReelGenerator", "CarouselGenerator", etc
  generated_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- 5. PUBLISHED CONTENT (Post pubblicati con engagement)
CREATE TABLE IF NOT EXISTS published_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,
  content_queue_id UUID REFERENCES content_queue(id),

  blotato_post_id TEXT UNIQUE,
  platform TEXT, -- "Instagram", "TikTok", "Facebook"
  content_type TEXT,
  topic TEXT,

  posted_at TIMESTAMP,

  -- Engagement metrics (24h)
  reach INT DEFAULT 0,
  impressions INT DEFAULT 0,
  engagement_count INT DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0, -- %

  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  saves INT DEFAULT 0,

  click_through_rate DECIMAL(5,2) DEFAULT 0, -- %
  conversions INT DEFAULT 0,

  -- Performance scoring
  performance_score TEXT, -- "EXCELLENT", "GOOD", "NEEDS_WORK"

  -- Metadata
  posting_time TIME,
  audience_segment TEXT,

  synced_at TIMESTAMP, -- When we last synced from Blotato

  created_at TIMESTAMP DEFAULT now()
);

-- 6. PERFORMANCE ANALYTICS (Insights giornalieri)
CREATE TABLE IF NOT EXISTS performance_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,
  published_content_id UUID REFERENCES published_content(id),

  analysis_date DATE,

  content_type TEXT,
  topic TEXT,
  platform TEXT,
  posting_time TIME,
  audience_segment TEXT,

  -- Performance
  reach INT,
  engagement_rate DECIMAL(5,2),
  performance_score TEXT, -- "EXCELLENT", "GOOD", "NEEDS_WORK"

  -- Insights
  what_worked TEXT, -- JSON with reasons
  what_failed TEXT, -- JSON with reasons
  recommendation TEXT, -- What to do next week

  -- Comparisons
  vs_platform_avg DECIMAL(5,2), -- % better/worse than platform average
  vs_content_type_avg DECIMAL(5,2), -- % vs content type average

  created_at TIMESTAMP DEFAULT now(),
  created_by UUID DEFAULT (current_user_id())
);

-- INDEXES for performance
CREATE INDEX idx_strategic_plans_cliente ON strategic_plans(cliente_id, mese);
CREATE INDEX idx_editorial_plans_cliente ON editorial_plans(cliente_id, week_number);
CREATE INDEX idx_editorial_plan_days_date ON editorial_plan_days(plan_date, cliente_id);
CREATE INDEX idx_content_queue_status ON content_queue(status, cliente_id);
CREATE INDEX idx_content_queue_date ON content_queue(created_at, cliente_id);
CREATE INDEX idx_published_content_date ON published_content(posted_at, cliente_id);
CREATE INDEX idx_performance_analytics_date ON performance_analytics(analysis_date, cliente_id);

-- RLS: Row Level Security (Solo il cliente/admin vede i propri dati)
ALTER TABLE strategic_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_analytics ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Users can view own client data" ON strategic_plans
  FOR SELECT USING (
    cliente_id IN (
      SELECT id FROM clienti WHERE id IN (
        SELECT cliente_id FROM user_client_access WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view own client data" ON editorial_plans
  FOR SELECT USING (
    cliente_id IN (
      SELECT id FROM clienti WHERE id IN (
        SELECT cliente_id FROM user_client_access WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view own client data" ON editorial_plan_days
  FOR SELECT USING (
    cliente_id IN (
      SELECT id FROM clienti WHERE id IN (
        SELECT cliente_id FROM user_client_access WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view own client data" ON content_queue
  FOR SELECT USING (
    cliente_id IN (
      SELECT id FROM clienti WHERE id IN (
        SELECT cliente_id FROM user_client_access WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view own client data" ON published_content
  FOR SELECT USING (
    cliente_id IN (
      SELECT id FROM clienti WHERE id IN (
        SELECT cliente_id FROM user_client_access WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view own client data" ON performance_analytics
  FOR SELECT USING (
    cliente_id IN (
      SELECT id FROM clienti WHERE id IN (
        SELECT cliente_id FROM user_client_access WHERE user_id = auth.uid()
      )
    )
  );

-- INSERT POLICY (per gli agenti schedulati - via service role)
-- Questo permette agli agenti (che hanno auth.role() = 'service_role') di scrivere
CREATE POLICY "Service can insert" ON strategic_plans FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);
CREATE POLICY "Service can insert" ON editorial_plans FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);
CREATE POLICY "Service can insert" ON editorial_plan_days FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);
CREATE POLICY "Service can insert" ON content_queue FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);
CREATE POLICY "Service can insert" ON published_content FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);
CREATE POLICY "Service can insert" ON performance_analytics FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- UPDATE POLICY (per approval)
CREATE POLICY "Users can update own client data" ON content_queue FOR UPDATE
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
