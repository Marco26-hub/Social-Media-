# 🔍 PROSPECT SCRAPER AGENT — Lead Research & Qualification

## Agent Definition

**Nome:** Prospect Scraper Agent v1  
**Obiettivo:** Trovare e qualificare clienti potenziali per Social Automation V2  
**Input:** ICP parameters (settori, città, budget)  
**Output:** Qualified lead list (CSV + JSON) ready for outreach  
**Tempo esecuzione:** 2-4 ore  

---

## ICP Parameters (INPUT REQUIRED)

Prima di partire, devo sapere:

```
1. SETTORI TARGET
   ☐ E-commerce (Shopify, WooCommerce, Amazon)
   ☐ Local Business (ristoranti, parrucchieri, studi professionali)
   ☐ Service Provider (agenzie, consulenti, freelancer)
   ☐ SaaS/Tech
   ☐ Altro: _______

2. GEOGRAFIA
   ☐ Solo Italia
   ☐ Nord Italia (Lombardia, Piemonte, Veneto)
   ☐ Centro (Toscana, Lazio, Umbria)
   ☐ Sud (Campania, Sicilia, Puglia)
   ☐ Specifiche città: _______

3. DIMENSIONI AZIENDA
   ☐ Micro (1-5 persone, founder-led)
   ☐ Small (5-20 persone, PMI)
   ☐ Medium (20-100 persone)
   ☐ Tutte le dimensioni

4. BUDGET CAPACITY (monthly spend)
   ☐ €300-500 (Starter/Presence)
   ☐ €500-800 (Crescita)
   ☐ €800-1500 (E-commerce)
   ☐ €1500+ (Dominio)
   ☐ Tutte le fasce

5. ENGAGEMENT SIGNALS (come li identifico?)
   ☐ Hanno Instagram attivo (>1000 followers)
   ☐ Hanno TikTok
   ☐ Hanno website con blog
   ☐ Hanno ADS attive (Google/Meta)
   ☐ Hanno ricerca organica (appaiono su Google)
   ☐ Chiunque abbia social media
```

---

## Scraping Sources & Methods

### 1. LinkedIn (Decision Makers + Company Intel)

**What to scrape:**
```
Founder/Owner profiles with:
  • Industry matching ICP
  • Recent activity (posted in last 30 days)
  • Company size matching
  • Email visible or phone
  • Location matching

Data captured:
  - Full name
  - Title (Founder, CEO, Marketing Manager)
  - Company name
  - Company size
  - Industry
  - Location
  - Email (if visible)
  - Phone (if visible)
  - LinkedIn URL
  - Recent posts/activity (engagement indicator)
```

**Query example (pseudocode):**
```
search({
  keywords: ["founder", "ceo", "marketing manager", "business owner"],
  industry: ["e-commerce", "retail", "restaurants"],
  location: ["Italy"],
  company_size: ["1-50", "51-200"],
  activity: ["posted in last 30 days"],
  email_visibility: "public or semi-public"
})
```

---

### 2. Google Maps (Local Business)

**What to scrape:**
```
Local businesses with:
  • Category matching ICP
  • Recent reviews (active, getting engagement)
  • Website present
  • Phone visible
  • Location in target city

Data captured:
  - Business name
  - Address
  - Phone number
  - Website URL
  - Category
  - Rating (4+ stars = good signal)
  - Review count (>10 = active)
  - Recent review dates (active if <30 days)
  - Hours of operation (active if normal hours)
```

**Target categories:**
- Restaurants & bars
- Hair salons & beauty
- Medical practices
- Legal services
- Professional services
- Retail stores

---

### 3. Instagram (Engagement Signals)

**What to scrape:**
```
Business accounts with:
  • Account type: "business" or "creator"
  • Follower count: 500-50k (sweet spot)
  • Posts: active (2+ per week)
  • Engagement rate: >3% (good engagement)
  • Industry tags matching ICP

Data captured:
  - Account handle (@username)
  - Business name
  - Follower count
  - Following count
  - Post count
  - Avg engagement rate
  - Bio (contact info, website)
  - Email (often in bio)
  - Website (often in bio)
  - Last 5 post dates (activity frequency)
```

**Search queries:**
```
Hashtags: #[industry]italy, #[city]business
Locations: [city name]
Business category tags
```

---

### 4. Website Scraping (Contact Info + Product Fit)

**What to scrape:**
```
Company websites to find:
  - Owner/founder name
  - Email addresses
  - Phone numbers
  - Social media links
  - Products/services (validate ICP fit)
  - Website traffic estimate (Similarweb)
  - Tech stack (WordPress, Shopify = good signal)

Data captured:
  - Contact form email
  - Support email
  - Founder email (from about page)
  - Phone
  - Address
  - Social media links
  - Product/service description
```

---

### 5. Apollo.io API (If available)

**What to scrape:**
```
Enriched B2B database:
  - Company data + contact details
  - Multiple emails per company
  - Phone numbers
  - Job titles + decision makers
  - Company size + revenue
  - Industry classification

Data captured:
  - All of above + enrichment data
```

---

## Lead Qualification Scoring

### Engagement Score (0-100)

```
LinkedIn Signal (+40 points max)
  ✓ Founder/CEO title: +15
  ✓ Posted in last 30 days: +15
  ✓ >500 connections: +10

Company Signal (+30 points max)
  ✓ Matches ICP industry: +10
  ✓ Right company size: +10
  ✓ Right location: +10

Contact Signal (+30 points max)
  ✓ Email found: +15
  ✓ Phone found: +15

TOTAL: 0-100 score
```

### Temperature Classification

```
CALDO (Hot) — 70-100 points
  • Decision maker identified (founder/CEO)
  • Recent activity (posted <30 days)
  • Both email AND phone
  • Matches ICP perfectly
  • Action: Contact immediately

TIEPIDO (Warm) — 40-69 points
  • Likely decision maker (title suggests)
  • Some engagement signals
  • Email OR phone (not both)
  • Partial ICP match
  • Action: Contact with personalization

FREDDO (Cold) — 0-39 points
  • No clear decision maker
  • Minimal engagement
  • No contact info
  • Unclear ICP match
  • Action: Research more or skip
```

---

## Output Format

### CSV Format (for outreach lists)

```
First Name,Last Name,Company,Title,Email,Phone,Source,Temperature,Score,LinkedIn,Instagram,Website,Notes
Giovanni,Rossi,Pasta Italia,Founder,giovanni@pastaitalila.it,+39 320 123456,LinkedIn,CALDO,87,https://linkedin.com/in/grossi,@pastaitaliaofficial,https://pastaitallia.it,"Active on social, recent posts"
Maria,Bianchi,Beauty Studio Milano,Owner,maria@beautystudio.it,+39 331 789012,Maps,CALDO,82,https://linkedin.com/in/mbianchi,@beautystudiomi,https://beautystudio.it,"Google Maps 4.8★, recent reviews"
```

### JSON Format (for system integration)

```json
{
  "execution_id": "prospect_scrape_20260627_001",
  "timestamp": "2026-06-27T14:30:00Z",
  "parameters": {
    "sectors": ["e-commerce", "local_business"],
    "locations": ["Milano", "Roma", "Napoli"],
    "company_size": ["micro", "small"],
    "budget_range": "300-1500"
  },
  "results": {
    "total_scraped": 342,
    "qualified": 187,
    "breakdown": {
      "CALDO": 47,
      "TIEPIDO": 89,
      "FREDDO": 51
    },
    "sources": {
      "linkedin": 92,
      "google_maps": 65,
      "instagram": 28,
      "website": 2
    }
  },
  "leads": [
    {
      "id": "lead_001",
      "first_name": "Giovanni",
      "last_name": "Rossi",
      "company": "Pasta Italia",
      "title": "Founder",
      "email": "giovanni@pastaitallia.it",
      "phone": "+39 320 123456",
      "sources": ["LinkedIn", "Website"],
      "temperature": "CALDO",
      "score": 87,
      "engagement_signals": {
        "linkedin_activity": "posted 5 days ago",
        "follower_count": 2400,
        "posting_frequency": "2x per week",
        "website_traffic": "moderate"
      },
      "icp_match": {
        "sector": "e-commerce",
        "location": "Milano",
        "size": "micro",
        "budget_capacity": "€500-800"
      },
      "enrichment": {
        "company_website": "https://pastaitallia.it",
        "instagram_handle": "@pastaitaliaofficial",
        "linkedin_url": "https://linkedin.com/in/grossi",
        "estimated_budget": "€600/month"
      }
    }
  ],
  "ready_for_outreach": true,
  "next_steps": [
    "Send personalized email to CALDO leads (47 people)",
    "Schedule call with top 5 CALDO leads",
    "Research TIEPIDO leads for better targeting"
  ]
}
```

---

## Execution Workflow

```
STEP 1: Validate ICP Parameters (5 min)
  └─ Check all parameters provided
  └─ Validate date ranges, locations
  └─ Setup scraping queries

STEP 2: LinkedIn Scraping (45 min)
  └─ Search decision makers
  └─ Enrich with company data
  └─ Extract emails/phones
  └─ Score engagement
  └─ Result: ~100-150 leads

STEP 3: Google Maps Scraping (30 min)
  └─ Search local businesses
  └─ Filter by rating + reviews
  └─ Extract contact info
  └─ Score activity level
  └─ Result: ~50-80 leads

STEP 4: Instagram Scraping (30 min)
  └─ Search business accounts
  └─ Filter by engagement rate
  └─ Extract contact info
  └─ Score activity level
  └─ Result: ~30-50 leads

STEP 5: Website Enrichment (45 min)
  └─ Visit websites of leads
  └─ Extract additional contact info
  └─ Validate company details
  └─ Find owner/founder names
  └─ Result: enriched lead database

STEP 6: Deduplication & Consolidation (30 min)
  └─ Remove duplicates (same person found multiple times)
  └─ Merge data from multiple sources
  └─ Keep best contact info per person
  └─ Result: clean list

STEP 7: Qualification & Scoring (30 min)
  └─ Score each lead 0-100
  └─ Classify: CALDO / TIEPIDO / FREDDO
  └─ Rank by temperature + score
  └─ Result: prioritized list

STEP 8: Export & Validation (15 min)
  └─ Generate CSV for outreach
  └─ Generate JSON for system
  └─ Create summary report
  └─ Ready for email campaign

TOTAL TIME: 2.5-3.5 hours
```

---

## Quality Checks

```
Data Completeness:
  ✓ Email present: 80%+ (target)
  ✓ Phone present: 60%+ (target)
  ✓ Name: 100%
  ✓ Company: 95%+

Temperature Distribution:
  ✓ CALDO: 20-30% (want hot leads)
  ✓ TIEPIDO: 40-50% (good follow-up)
  ✓ FREDDO: 20-30% (research later)

Score Distribution:
  ✓ >70: High quality
  ✓ 40-70: Medium quality
  ✓ <40: Low quality (skip)

No Duplicates:
  ✓ Same person: consolidated
  ✓ Same company, different contact: kept separate
```

---

## Fallback & Error Handling

```
LinkedIn API rate limit:
  → Wait 1 hour, resume
  → Use cached recent results
  → Continue with other sources

Instagram blocks scraping:
  → Skip Instagram source
  → Continue with other sources
  → Result: -15% leads

Google Maps data unavailable:
  → Skip Google Maps
  → Continue with other sources
  → Result: -20% leads

Website unreachable:
  → Use cached data from previous scrape
  → Skip contact enrichment for that lead
  → Continue

No emails found:
  → Keep leads in list
  → Flag as "email needed"
  → Can be researched manually or via email finder API

Zero results:
  → Alert: "No leads found matching criteria"
  → Suggest: Broaden geography or sectors
  → Retry with different parameters
```

---

## Deliverables

After execution, you get:

📊 **CSV File** — Ready for email tool
```
leads_qualified_20260627.csv
(187 leads, sorted by temperature + score)
```

📋 **JSON File** — System integration
```
prospect_scrape_result_20260627.json
(structured data, metadata, insights)
```

📈 **Summary Report** — Quick overview
```
- Total scraped: 342 leads
- Qualified: 187 (55%)
- CALDO: 47 (25%)
- TIEPIDO: 89 (48%)
- FREDDO: 51 (27%)
- Top source: LinkedIn (92 leads)
- Ready for outreach: YES
```

📧 **Outreach List** — Top leads
```
Top 10 CALDO leads (ready to contact TODAY)
Top 20 TIEPIDO leads (ready to contact TOMORROW)
```

---

## Next Steps (After Scraping)

1. **Email Outreach** — Use CSV to send personalized emails
2. **Soft Launch** — Contact top 5 CALDO leads, aim for 2-3 customers
3. **Feedback Loop** — Refine targeting based on response rate
4. **Scale** — Expand to broader criteria once validated

---

## Implementation

This agent can be executed:

✅ **Manually** — You provide ICP params, I scrape & qualify
✅ **Automated** — Scheduled weekly, keeps lead list fresh
✅ **Hybrid** — Regular updates + on-demand for urgent campaigns

---

## Ready to Execute?

I need the ICP parameters to start:

```
1. Settori target: _______
2. Città/regioni: _______
3. Dimensioni azienda: _______
4. Budget range: _______
5. Engagement signals: _______
```

Once you provide these, I scrape and deliver qualified leads in 3 hours. ⏱️

