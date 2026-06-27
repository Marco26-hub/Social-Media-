# 🔄 HYBRID EXECUTION MODEL — Social Automation V2

## Concept: Scheduled + On-Demand

Il sistema funziona con **due modalità simultanee:**
1. **SCHEDULED** — Agenti girano automaticamente (no user input)
2. **ON-DEMAND** — User può forzare esecuzione immediata

---

## SCHEDULED EXECUTION (Default)

Agenti girano **automaticamente** secondo calendario:

```
LUNEDÌ 7:15 AM
  └─ Weekly SEO + GEO Audit
  └─ Genera: keyword rankings, local SEO, 5 recommendations
  └─ Automatico: Email report + dashboard update

MERCOLEDÌ 7:30 AM
  └─ Weekly Competitor Watch
  └─ Monitora: 3-5 competitors
  └─ Automatico: Threat alerts se HIGH risk

DOMENICA 6:00 AM
  └─ Weekly Lead Scraper
  └─ Genera: 40-100 qualified leads
  └─ Automatico: Dashboard + approval queue

DOMENICA 6:30 PM
  └─ Weekly Client Report
  └─ Aggrega: tutti i metrics della settimana
  └─ Automatico: Email inviata al cliente

GIORNALIERO 8:00 AM
  └─ Daily ADS Optimizer
  └─ Monitora: Google Ads, Meta, TikTok
  └─ Automatico: Optimization suggestions

GIORNALIERO 6:00 AM
  └─ Daily Content Generation
  └─ Genera: 5 content options
  └─ ATTESA: User approva entro 2 ore (14:00 deadline)
  └─ Auto-publish: Se approvato, pubblica automatico a Blotato
```

---

## ON-DEMAND EXECUTION (Override)

User può eseguire **QUALSIASI agente SUBITO**:

```
DASHBOARD VIEW:

┌─────────────────────────────────────────┐
│ AGENTS STATUS & ON-DEMAND CONTROLS      │
├─────────────────────────────────────────┤
│                                         │
│ ✓ Content Generator                     │
│   Last run: Today 6:00 AM               │
│   Next: Tomorrow 6:00 AM                │
│   [🚀 RUN NOW] ← Force immediate       │
│                                         │
│ ✓ Lead Scraper                          │
│   Last run: Sunday 6:00 AM              │
│   Next: Next Sunday 6:00 AM             │
│   [🚀 RUN NOW] ← Force immediate       │
│                                         │
│ ✓ SEO + GEO Analyzer                    │
│   Last run: Monday 7:15 AM              │
│   Next: Next Monday 7:15 AM             │
│   [🚀 RUN NOW] ← Force immediate       │
│                                         │
│ ✓ ADS Optimizer                         │
│   Last run: Today 8:00 AM               │
│   Next: Tomorrow 8:00 AM                │
│   [🚀 RUN NOW] ← Force immediate       │
│                                         │
│ ✓ Competitor Watcher                    │
│   Last run: Wednesday 7:30 AM           │
│   Next: Next Wednesday 7:30 AM          │
│   [🚀 RUN NOW] ← Force immediate       │
│                                         │
│ ✓ Client Report                         │
│   Last run: Sunday 6:30 PM              │
│   Next: Next Sunday 6:30 PM             │
│   [🚀 RUN NOW] ← Force immediate       │
│                                         │
└─────────────────────────────────────────┘
```

**User Workflow:**
1. Click [🚀 RUN NOW] on any agent
2. Agent executes immediately (not waiting for schedule)
3. Results appear in dashboard in 5-60 seconds
4. User approves/acts on results

---

## Use Cases for On-Demand

**Scenario 1: Urgent Lead Need**
- Client says: "Voglio 50 lead ADESSO, non domenica"
- User clicks [🚀 RUN NOW] on Lead Scraper
- 45-50 leads ready in 2 minutes
- Client reviews same day

**Scenario 2: ADS Crisis**
- Client notices: "ROAS dropped, cosa succede?"
- User clicks [🚀 RUN NOW] on ADS Optimizer
- Fresh data fetched, analysis ready
- Optimization suggestions immediately available

**Scenario 3: SEO Emergency**
- Client panics: "Ranking crollati, controllate!"
- User clicks [🚀 RUN NOW] on SEO Analyzer
- Current rankings checked, issues identified
- Recommendations ready instantly

**Scenario 4: Competitor Alert**
- Client says: "Competitor ha lanciato campaign, che fanno?"
- User clicks [🚀 RUN NOW] on Competitor Watcher
- Fresh competitive data analyzed
- Threat assessment + response options ready

**Scenario 5: Report Now**
- Client: "Mi serve report subito per board meeting oggi"
- User clicks [🚀 RUN NOW] on Client Report
- All data aggregated immediately
- Report email sent in 10 minutes

---

## Technical Implementation

### Backend Flow

```
USER CLICKS [🚀 RUN NOW]
  ↓
SYSTEM CHECKS:
  • Is agent already running? (prevent duplicates)
  • Is agent in scheduled queue? (deprioritize scheduled)
  ↓
EXECUTE IMMEDIATELY:
  • Fetch fresh data from all sources
  • Run analysis/generation
  • Save to database
  • Return results to UI
  ↓
DASHBOARD UPDATES:
  • Real-time results appear
  • "Last run: just now" timestamp
  • Next scheduled run still scheduled
```

### Scheduling Logic

```
// Pseudocode
schedule("SEO Audit", "0 7 * * MON", () => {
  runAgent("seo-geo-analyzer");
});

// User can override anytime:
onDemand("seo-geo-analyzer", () => {
  // Execute now, outside of schedule
  runAgent("seo-geo-analyzer");
  // Schedule for Monday still intact
});
```

---

## User Expectations

### Default Behavior (Scheduled)
- **What user does:** Nothing
- **What system does:** Runs agents on schedule
- **Result:** Reports/data automatically appear
- **User effort:** 5 min/day (approving content)

### Override Behavior (On-Demand)
- **What user does:** Click [🚀 RUN NOW]
- **What system does:** Execute immediately
- **Result:** Fresh data in seconds
- **User effort:** 1 click

---

## Implementation Checklist

### Database
- [ ] `scheduled_tasks` table (stores schedule config)
- [ ] `execution_log` table (tracks every run, scheduled vs on-demand)
- [ ] `agent_status` table (current status: idle, running, last_run_time)

### Backend API
- [ ] POST `/api/agents/{agent_id}/run` (on-demand trigger)
- [ ] GET `/api/agents/status` (current status for all agents)
- [ ] GET `/api/agents/{agent_id}/history` (execution history)

### Frontend Components
- [ ] Agent status cards (show schedule + [RUN NOW] button)
- [ ] Execution status page (live progress)
- [ ] History view (past executions, scheduled vs on-demand)

### Queue System
- [ ] Priority queue (on-demand tasks > scheduled tasks)
- [ ] Duplicate prevention (don't run same agent twice in 5 min)
- [ ] Rate limiting (max 3 on-demand runs per agent per day)

---

## Example Execution Log

```
EXECUTION LOG

2026-06-27 06:00 | Content Generator | SCHEDULED | SUCCESS | 5 options
2026-06-27 08:00 | ADS Optimizer | SCHEDULED | SUCCESS | ROAS 2.3x
2026-06-27 10:30 | Lead Scraper | ON-DEMAND | SUCCESS | 42 leads (user clicked)
2026-06-27 14:15 | ADS Optimizer | ON-DEMAND | SUCCESS | Fresh data (user clicked)
2026-06-27 16:45 | Competitor Watch | ON-DEMAND | SUCCESS | 2 changes detected
2026-06-28 06:00 | Content Generator | SCHEDULED | SUCCESS | 5 options
```

---

## SLA

**Scheduled Execution:**
- Target: On-time within ±5 minutes
- Uptime: 99% (alert if missed)

**On-Demand Execution:**
- Target: <60 seconds for most agents
- Max: 5 minutes (for complex analysis)
- Alert if >5 minutes

---

## Benefits

✅ **User Control** — Can force execution anytime (on-demand)  
✅ **Automation** — Runs automatically by default (scheduled)  
✅ **Flexibility** — Best of both worlds  
✅ **Responsiveness** — Can respond to urgent needs immediately  
✅ **No Cognitive Load** — Default automation, manual override when needed  

---

## Summary

**The system is HYBRID:**

- **By default:** Fully automated (scheduled)
- **On-demand:** User can force any agent anytime
- **User effort:** 5 min/day (approving content) + 1 click when needed
- **Result:** Perfect balance of automation + control

This is the **mature automation model** — not too rigid, not too manual.

