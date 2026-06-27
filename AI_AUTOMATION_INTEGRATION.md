# AI Automation Integration Guide

## 🚀 Overview

Sistema completo di business automation per Social Automation V2:

```
┌─ SOCIAL AUTOMATION ─────────────────────────────────┐
│                                                      │
│  Strategic Planner (mensile)                         │
│    ↓                                                 │
│  Editorial Planner (settimanale)                     │
│    ↓                                                 │
│  5 Content Generators (giornaliero)                  │
│    ↓                                                 │
│  Content Queue (dashboard approval)                  │
│    ↓                                                 │
│  Blotato Publish (automatic)                         │
│    ↓                                                 │
│  Feedback Loop (analytics daily)                     │
│                                                      │
└──────────────────────────────────────────────────────┘

┌─ SEO + GEO AUTOMATION ──────────────────────────────┐
│                                                      │
│  Weekly SEO Agent (lunedì 7:15 AM)                  │
│    ├─ Scarica SEO audit data                        │
│    ├─ Analizza GEO per città target                 │
│    ├─ Genera raccomandazioni                        │
│    └─ Salva nel DB (PENDING)                        │
│                                                      │
│  SEO Dashboard (SEOAnalysisApproval)                │
│    └─ Tu approvi & implementa                       │
│                                                      │
└──────────────────────────────────────────────────────┘

┌─ LEAD SCRAPING AUTOMATION ─────────────────────────┐
│                                                      │
│  Weekly Lead Agent (domenica 6 AM)                  │
│    ├─ Scrapa da TUTTI (Google, Social, Competitor) │
│    ├─ Categorizza CALDO/TIEPIDO/FREDDO             │
│    ├─ Salva nel DB (PENDING)                       │
│    └─ Invia email report                           │
│                                                      │
│  Lead Dashboard (ScrapedLeadsApproval)              │
│    └─ Tu revisionu & flagga                        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 📦 Setup

### 1. Apply Migrations
```bash
# Apply all migrations to Postgres
npm run migrate

# Creates tables:
- strategic_plans, editorial_plans, editorial_plan_days
- content_queue, published_content, performance_analytics
- seo_audits, geo_analysis, seo_recommendations
- scraped_leads, lead_actions, lead_sources
```

### 2. Environment Variables
Add to `.env.local`:
```
BLOTATO_API_KEY=your_blotato_key
NEXT_PUBLIC_BLOTATO_API_KEY=your_blotato_key
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
```

### 3. Add Components to Dashboard
In `/app/dashboard/analytics/page.tsx` or create new pages:

```tsx
// Social Automation
import { AIContentApproval } from '@/components/AIContentApproval';

// SEO + GEO Automation
import { SEOAnalysisApproval } from '@/components/SEOAnalysisApproval';

// Lead Scraping
import { ScrapedLeadsApproval } from '@/components/ScrapedLeadsApproval';

export default function AnalyticsPage() {
  const clienteId = 'active-client-id';
  
  return (
    <div className="space-y-6">
      <AIContentApproval clienteId={clienteId} />
      <SEOAnalysisApproval clienteId={clienteId} />
      <ScrapedLeadsApproval clienteId={clienteId} />
    </div>
  );
}
```

### 4. Scheduled Tasks
All configured automatically:
- **Social Automation**: Daily at 6:00 AM
- **SEO+GEO Agent**: Monday at 7:15 AM
- **Lead Scraper**: Sunday at 6:00 AM

---

## 🔗 API Endpoints

### SEO + GEO AUTOMATION

#### POST /api/ai-automation/seo-audit
Save SEO audit data
```json
{
  "cliente_id": "uuid",
  "seo_score": 78,
  "page_speed_score": 72,
  "mobile_score": 85,
  "ux_score": 80,
  "total_keywords": 245,
  "ranking_1_10": 35,
  "ranking_11_50": 60,
  "ranking_51_100": 75,
  "top_keywords": [
    {"keyword": "main service", "position": 5, "search_volume": 500}
  ],
  "organic_traffic": 2500,
  "organic_traffic_change": 5.2,
  "critical_issues": 2,
  "warnings": 5,
  "opportunities": 8,
  "opportunities_list": [
    {"issue": "Missing meta descriptions", "pages": 15, "impact": "MEDIUM"}
  ]
}
```

#### POST /api/ai-automation/geo-analysis
Save GEO analysis for target locations
```json
{
  "cliente_id": "uuid",
  "target_city": "Milano",
  "target_region": "Lombardia",
  "target_country": "IT",
  "local_seo_score": 72,
  "gmb_status": "COMPLETE",
  "gmb_reviews_count": 23,
  "gmb_rating": 4.7,
  "local_keywords": 85,
  "local_top_3": 18,
  "local_competitors": 12,
  "competitive_position": "STRONG",
  "quick_wins": [
    {"action": "Update GMB hours", "impact": "HIGH", "time": "15 min"}
  ],
  "long_term": [
    {"action": "Build local citations", "impact": "MEDIUM", "time": "1 week"}
  ]
}
```

#### GET /api/ai-automation/seo-audit?cliente_id=xxx&limit=4
Fetch latest SEO audits

#### GET /api/ai-automation/geo-analysis?cliente_id=xxx
Fetch latest GEO analysis

#### POST /api/ai-automation/seo-recommendations
Save SEO recommendation
```json
{
  "cliente_id": "uuid",
  "seo_audit_id": "uuid",
  "recommendation_type": "TECHNICAL|CONTENT|BACKLINKS|LOCAL",
  "priority": "HIGH|MEDIUM|LOW",
  "title": "Optimize page speed",
  "description": "Improve Core Web Vitals...",
  "estimated_time": 480,
  "estimated_traffic_impact": 120,
  "difficulty": "EASY|MEDIUM|HARD"
}
```

#### GET /api/ai-automation/seo-recommendations?cliente_id=xxx&status=PENDING
Fetch recommendations awaiting approval

#### PATCH /api/ai-automation/seo-recommendations
Approve/implement recommendation
```json
{
  "recommendation_id": "uuid",
  "status": "APPROVED|IN_PROGRESS|COMPLETED",
  "approved_by": "user_id",
  "actual_impact": 150
}
```

---

### SOCIAL AUTOMATION

#### POST /api/ai-automation/strategic-plan
Save monthly strategic plan
```json
{
  "clienteId": "uuid",
  "mese": "2026-07",
  "pillar1": "Product Showcase",
  "pillar1Desc": "...",
  "toneVoice": "Friendly, aspirational",
  "segment1": "20-30F: Focus on trends"
}
```

### POST /api/ai-automation/editorial-plan
Save 28-day editorial calendar
```json
{
  "clienteId": "uuid",
  "strategicPlanId": "uuid",
  "weekNumber": 1,
  "planDate": "2026-07-21",
  "days": [
    {
      "planDate": "2026-07-21",
      "pillar": "PRODUCT",
      "contentType": "Reel",
      "topic": "Summer collection",
      "bestTime": "14:00"
    }
  ]
}
```

### POST /api/ai-automation/content-queue
Save generated content (called by generators)
```json
{
  "clienteId": "uuid",
  "contentType": "Reel",
  "topic": "Styling tips",
  "copyHook": "3 errori styling che invecchiano...",
  "copyBody": "Step 1: ...",
  "copyCta": "Salva questo post!",
  "hashtags": ["#styling", "#tips"],
  "generatedBy": "ReelGenerator"
}
```

### GET /api/ai-automation/content-queue?clienteId=xxx
Fetch pending content for approval

### PATCH /api/ai-automation/content-queue
Approve/reject content
```json
{
  "contentId": "uuid",
  "status": "APPROVED" | "REJECTED"
}
```

### POST /api/ai-automation/publish
Publish to Blotato
```json
{
  "contentId": "uuid",
  "platform": "Instagram",
  "blotatoApiKey": "xxx",
  "copyHook": "...",
  "hashtags": ["#fashion"]
}
```

### PATCH /api/ai-automation/publish
Sync engagement metrics from Blotato
```json
{
  "publishedContentId": "uuid",
  "blotatoApiKey": "xxx",
  "blotatoPostId": "xxx"
}
```

### POST /api/ai-automation/analytics
Save daily performance insights
```json
{
  "clienteId": "uuid",
  "publishedContentId": "uuid",
  "analysisDate": "2026-07-21",
  "contentType": "Reel",
  "reach": 5000,
  "engagementRate": 8.5,
  "performanceScore": "EXCELLENT",
  "whatWorked": ["Hook was strong", "Trending sound"],
  "whatFailed": ["CTA was weak"],
  "recommendation": "More reels this type next week"
}
```

---

## 🎯 How It Works

### Weekly Schedule
```
SUNDAY 6:00 AM
  → Lead Scraper Agent runs
  → Scrapes from ALL sources (Google, Social, Competitors, Marketplace)
  → Categorizes by temperature (CALDO/TIEPIDO/FREDDO)
  → Saves to scraped_leads (status=PENDING)
  → Email report sent
  
MONDAY 7:15 AM
  → SEO+GEO Agent runs
  → Analyzes website SEO performance
  → Generates GEO analysis for target cities
  → Creates actionable recommendations (status=PENDING)
  → Email report with top 5 recommendations

DAILY FLOW (6:00 AM onwards)
  6:00 AM
    → Content Generators run
    → 5 content options saved to content_queue
    
  Throughout day
    → YOU: See dashboard with pending items:
       - 5 Social content options
       - SEO recommendations (once weekly)
       - Scraped leads (once weekly)
    → YOU: Click "✅ Approve & Implement"
    
  2 sec later
    → Content published to Blotato (goes live)
    → SEO recommendations implemented
    → Leads flagged as APPROVED
    
  Next day 9 PM
    → Feedback Loop analyzes social performance
    → Saves insights to analytics
    → Email sent with recommendations
```

---

## 🎛️ Toggle Automation

### Enable (Default)
Agents generate automatically, you approve

### Disable
Keep manual mode - dashboard works as before

---

## 📊 Dashboard Views

### Content Queue
See 5 auto-generated options for today
- Hook, body, CTA all ready
- Approve with 1 click
- Reject or edit manually

### Editorial Plan
See 28-day calendar planned

### Analytics
See what worked yesterday
- Performance scores
- Recommendations for today
- Audience engagement patterns

---

## 🔐 Security

- All data scoped by `cliente_id`
- RLS policies enforce access
- Service role used for agent writes
- User role used for approvals

---

## 🐛 Troubleshooting

**Content not appearing?**
→ Check `content_queue` status (should be PENDING)

**Blotato not publishing?**
→ Verify `BLOTATO_API_KEY` is correct

**Analytics not syncing?**
→ Check `published_content.blotato_post_id` is set

**No generators running?**
→ Check scheduled tasks in /Claude/Scheduled/

---

## 📈 Implementation Status

### ✅ Completed
- Migration 003: Social Automation tables
- Migration 004: Lead Scraper tables
- Migration 005: SEO+GEO tables
- Migration 006: Client Reports + ADS + Competitor tables
- APIs: All endpoints implemented (social, SEO, leads, reports, ADS, competitor)
- Components: 
  - AIContentApproval (5 content options daily)
  - SEOAnalysisApproval (weekly SEO + GEO)
  - ScrapedLeadsApproval (weekly leads)
  - (TBD: ReportsBoard, AdsBoard, CompetitorBoard)
- Scheduled Tasks: 
  - **Daily 6:00 AM** - Content generation (5 options)
  - **Daily 8:00 AM** - ADS optimizer (monitor + suggest)
  - **Sunday 6:00 AM** - Lead scraper (all sources)
  - **Sunday 6:30 PM** - Client reports (comprehensive weekly)
  - **Monday 7:15 AM** - SEO+GEO agent (audit + analyze)
  - **Wednesday 7:30 AM** - Competitor watcher (threats + changes)

### 🔄 In Progress
- Dashboard consolidation (all agents on one page)
- Real API integrations (Google Search Console, Meta, Google Ads API)

### ⏰ Next Phase
- Google Search Console API integration
- Meta / Google Ads API direct connection
- Semrush/Ahrefs competitor data
- A/B testing automation
- Revenue-to-action correlation tracking
