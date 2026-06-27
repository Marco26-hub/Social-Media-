# SEO + GEO Agent Setup Guide

## 🚀 Quick Start

L'agente SEO+GEO automatizza l'intera analisi di ricerca locale e optimization settimanale.

**Frequenza:** Ogni lunedì 7:15 AM
**Output:** SEO audit + GEO analysis + raccomandazioni pending nel dashboard

---

## 🔧 Configuration

### 1. Add Target Cities to Client Config
In Supabase, update `clienti.config`:

```json
{
  "target_cities": [
    { "city": "Milano", "region": "Lombardia" },
    { "city": "Roma", "region": "Lazio" },
    { "city": "Napoli", "region": "Campania" }
  ],
  "website_url": "https://yoursite.com",
  "gsc_property": "https://yoursite.com" // Google Search Console
}
```

### 2. Connect Google Search Console (Optional)
For real data instead of simulated:
- Add `GOOGLE_SEARCH_CONSOLE_API_KEY` to `.env.local`
- Setup OAuth flow for GSC API access

For now, the agent generates realistic mock data.

---

## 📊 What the Agent Does

### 1. SEO Audit (Weekly)
Analyzes:
- **Overall SEO Score** (0-100)
- **Core Web Vitals** (Page Speed, Mobile, UX)
- **Keyword Rankings** (Top 10, 11-50, 51-100)
- **Organic Traffic** (with trend)
- **Issues & Opportunities** (critical issues, warnings)
- **Backlink Profile** (total, quality, new)

Saved to `seo_audits` table (status: auto-analyzed)

### 2. GEO Analysis (Per Target City)
Analyzes:
- **Local SEO Score** (0-100)
- **Google My Business** (completeness, reviews, rating)
- **Local Rankings** (keywords ranking top 3 in city)
- **Competitive Position** (LEADER, STRONG, WEAK)
- **Quick Wins** (immediate optimizations, <1 hour)
- **Long-term Strategy** (1+ week projects)

Saved to `geo_analysis` table (one per city)

### 3. Generates Recommendations
Creates actionable items like:
- "Optimize page speed" (HIGH priority, 8h, +120 traffic)
- "Fix mobile usability" (HIGH, 4h, +80 traffic)
- "Create SEO content" (MEDIUM, 20h, +250 traffic)
- "Build backlinks" (MEDIUM, 10h, +150 traffic)

Saved to `seo_recommendations` with status=**PENDING**
→ Tu approvi nel dashboard
→ Auto-implementate come best practices guide

---

## 📈 Dashboard Usage

### View Recommendations
```
Dashboard → Analytics → SEO Analysis
```

Shows:
- ✅ SEO Scores (4 metrics)
- 📊 GEO Analysis per città
- 💡 Pending Recommendations with:
  - Priority (HIGH/MEDIUM/LOW)
  - Estimated time & traffic impact
  - Implementation difficulty

### Approve & Implement
```
Click "✅ Approve & Implementa"
```

Changes status to APPROVED + creates action plan

---

## 🔄 Data Flow

```
Weekly (Monday 7:15 AM)
  ↓
Agent analyzes Google Search Console data (or simulated)
  ↓
Saves to seo_audits
  ↓
Saves to geo_analysis (per city)
  ↓
Generates recommendations (PENDING)
  ↓
Email sent: "SEO Report ready - Review in dashboard"
  ↓
You review in dashboard
  ↓
Click approve → status changes to APPROVED
  ↓
Recommendation shows implementation checklist
```

---

## 🔌 API Endpoints

### GET Latest SEO Audit
```bash
GET /api/ai-automation/seo-audit?cliente_id=xxx&limit=4
```

### GET GEO Analysis
```bash
GET /api/ai-automation/geo-analysis?cliente_id=xxx
```

### GET Pending Recommendations
```bash
GET /api/ai-automation/seo-recommendations?cliente_id=xxx&status=PENDING
```

### PATCH Approve Recommendation
```bash
PATCH /api/ai-automation/seo-recommendations
{
  "recommendation_id": "xxx",
  "status": "APPROVED",
  "approved_by": "user_id"
}
```

---

## 🎯 Next Phase: API Integrations

For production data, integrate with:

### Google Search Console API
```javascript
// Fetch real GSC data
GET https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchanalytics/query
{
  "startDate": "2026-06-20",
  "endDate": "2026-06-27",
  "dimensions": ["query", "page", "device"]
}
```

### Competitor Analysis (Semrush / Ahrefs)
```javascript
// Real competitor keywords & rankings
GET https://api.semrush.com?
  type=phrase_organic&
  domain=competitor.com&
  api_key=XXX
```

### Local Rankings (BrightLocal / Whitespark)
```javascript
// Real local ranking data
GET https://api.brightlocal.com/api/v4/rankings
```

---

## 🧪 Testing

### Run Manual Weekly Scan
In Dashboard, find scheduled task "weekly-seo-geo-agent"
→ Click "Run Now"

### Check Generated Data
```sql
SELECT * FROM seo_audits WHERE cliente_id = 'xxx' ORDER BY audit_date DESC LIMIT 1;
SELECT * FROM seo_recommendations WHERE status = 'PENDING' LIMIT 5;
```

### Verify Email Sent
Check email inbox for "SEO Report - [Client Name]"

---

## 🐛 Troubleshooting

**No recommendations appearing?**
→ Check if `seo_audits` was created (agent runs Monday 7:15 AM)
→ Manual run: trigger scheduled task

**Scores look random?**
→ Yes, mock data for demo. Connect real APIs for production.

**GEO Analysis not showing?**
→ Ensure `config.target_cities` is set on client

**Email not sent?**
→ Check `clienti.email` field has valid email address
