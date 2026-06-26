# HANDOFF — Social Automation V2

> Documento per AI agent multipli (Claude CLI, Cursor/Cline, Codex). Lavoriamo come un team unificato.

**Data**: 2026-06-26
**Progetto**: Social Automation — SaaS social media management per agenzie
**Stack**: Next.js 15.5.19 + Neon/Postgres + NextAuth + Tailwind + AI (Anthropic/OpenRouter)
**Percorso locale**: `/Users/md/Downloads/social_automation_v2`
**Repo**: `https://github.com/Marco26-hub/social-media-manager.git`

---

## 📌 Regole per Multi-Agent Team

### Convenzioni per evitare conflitti

1. **Leggi sempre HANDOFF.md prima di iniziare** — contiene lo stato attuale.
2. **Non modificare HANDOFF.md** durante il lavoro (lo fa solo l'agente che completa una fase).
3. **Commit atomici**: un commit = una feature o un fix. Mai commit "wip" o "fix vari".
4. **Messaggi commit**: `tipo: cosa (area)` — es. `feat: brand discovery API (brand)` o `fix: TS type errors in ads page (ads)`.
5. **TypeScript**: MAI usare `as Type` in JSX (causa errori `unknown is not assignable to ReactNode`). Estrarre sempre le variabili prima del return:
   ```tsx
   // ❌ SCORRETTO
   <p>{data.valore as string}</p>

   // ✅ CORRETTO
   const valore = typeof data.valore === 'string' ? data.valore : ''
   <p>{valore}</p>
   ```
6. **Componenti**: un componente per file. Se un componente diventa >400 righe, spezzare.
7. **Client vs Server**: pagine dashboard in `app/dashboard/` possono essere `'use client'` se usano stati/hooks. API routes in `app/api/` sono server.
8. **AI provider**: tutti i generate endpoint accettano `model` e `openrouter_key` dal body. `lib/ai.ts` gestisce fallback automatico OpenRouter → Anthropic.
9. **Demo mode**: ogni pagina DEVE funzionare anche senza DB (`isDemo()` → dati finti). Non rompere mai la demo.

---

## 1. Stato Build

```bash
npm run build                  # ✅ 42 route, verde
npm audit --audit-level=moderate # ✅ 0 vulnerabilità
npm run dev                    # http://localhost:3000
npm run start                  # build produzione
```

Smoke test:
```bash
bash scripts/smoke-test.sh http://localhost:3000
```

---

## 2. Architettura

```
Next.js 15 App Router
  ├── /login              → NextAuth credentials
  ├── /dashboard/*        → admin (protetto da middleware)
  ├── /servizi            → landing pubblica
  ├── /api/data/*         → CRUD Neon/Postgres
  ├── /api/generate/*     → AI generation con fallback
  ├── /api/auth/*         → NextAuth
  └── /api/system/health  → health check

Database (Neon/Postgres):
  14 tabelle: profiles, clienti, brand, prodotti, calendario,
  log_pubblicazioni, blog_articoli, seo_audit, settings,
  promo, account_social, user_client_access,
  generation_jobs, integration_events
```

---

## 3. Pagine Esistenti

| Pagina | Route | Descrizione |
|---|---|---|
| **Dashboard** | `/dashboard` | Control room, stats, pipeline, AI score |
| **Brand** | `/dashboard/brand` | Profilo brand + AI discovery + SEO/GEO + Lead scraping + Client/Marketing |
| **Calendario** | `/dashboard/calendario` | Lista contenuti con filtri, approva/rifiuta, AI content scoring |
| **Social** | `/dashboard/social/[platform]` | Generatore contenuti per ogni piattaforma (6) |
| **Piano** | `/dashboard/piano` | Piano editoriale settimanale/mensile |
| **Ads** | `/dashboard/ads` | Campagne Google, FB/IG, TikTok generate da AI |
| **SEO** | `/dashboard/seo` | Audit SEO + GEO, score, miglioramenti |
| **Prodotti** | `/dashboard/prodotti` | Catalogo prodotti |
| **Clienti** | `/dashboard/clienti` | Gestione clienti multi-tenant |
| **Log** | `/dashboard/log` | Storico pubblicazioni |
| **Settings** | `/dashboard/settings` | Configurazioni operativa |
| **Report** | `/dashboard/report` | KPI, grafici per canale/formato, stampa PDF |
| **Login** | `/login` | Auto-login in demo mode |
| **Preview** | `/preview/[id]` | Anteprima multi-piattaforma (IG, FB, TT, Pinterest) con condivisione WA/TG/Email |
| **Approve** | `/approve/[token]` | Client portal pubblico: approva/richiedi modifica senza login |
| **Competitor** | `/dashboard/competitor` | Analisi AI social competitor: strategy, engagement, hashtag, punti forza/debolezza, azioni |
| **Onboarding** | `/dashboard/onboarding` | Wizard 5-step: cliente → brand AI → prodotti → contenuti → fine |
| **Dettaglio Cliente** | `/dashboard/clienti/[id]` | Stats cliente, contenuti recenti, azioni rapide |
| **Landing** | `/servizi` | Pagina vendita con 5 pacchetti (Starter €390 → Dominio €2.590) |

---

## 4. API Route — Complete

### Data API (GET/PATCH)

| Route | GET | PATCH/POST |
|---|---|---|
| `/api/data/calendario` | Lista contenuti filtrata | Aggiorna status + eventuale publish Blotato |
| `/api/data/brand` | Profilo brand | Upsert brand |
| `/api/data/clienti` | Lista clienti | Crea cliente |
| `/api/data/prodotti` | Lista prodotti | Crea prodotto |
| `/api/data/settings` | Lista settings | Aggiorna valore |
| `/api/data/log` | Log pubblicazioni | — |
| `/api/data/stats` | Statistiche dashboard | — |
| `/api/data/seo-audit` | Lista audit | — |
| `/api/data/report` | Report KPI | — |
| `/api/data/approve` | GET token info (pubblico) | POST crea token / PATCH approva/rifiuta |

### Generate API (POST)

| Route | Input | Output |
|---|---|---|
| `/api/generate/content` | canale, formato, model, openrouter_key | Contenuto salvato in calendario |
| `/api/generate/plan` | piattaforme, periodo, model | Piano salvato in calendario |
| `/api/generate/blog` | tema, model | Articolo salvato in blog_articoli |
| `/api/generate/seo-audit` | sito_url, periodo, model | Audit salvato in seo_audit |
| `/api/generate/brand-discovery` | url, model | Profilo brand (SETTORE, TONO, TARGET...) |
| `/api/generate/score-content` | canale, formato, hook, caption | Score 0-100 con suggerimenti |
| `/api/generate/ads` | platform, brand, obiettivo, budget | Campagna Google/FB/TikTok completa |
| `/api/generate/strategy` | brand, settore, target, tono | Content pillars, frequenza, best time |
| `/api/generate/scrape-contacts` | url, model | Email, WA, TG, social, indirizzo |
| `/api/generate/client-discovery` | url, settore, model | ICP, buyer personas, competitor, KPI |
| `/api/generate/brand-keywords` | brand, settore | Parole da usare/evitare, hashtag, emoji |
| `/api/generate/compliance` | brand, tipologia | Cookie Policy, GDPR, Privacy, Disclaimer, Vendita |
| `/api/generate/competitor-analysis` | competitor_nome, social | Content strategy, engagement, hashtag, gap, azioni migliorative |

### System API
| Route | Descrizione |
|---|---|
| `GET /api/system/health` | Stato: DB, Auth, AI, modalità demo/prod |
| `POST /api/webhook/blotato` | Callback Blotato: aggiorna status pubblicazione (scheduled/published/failed) |

---

## 5. Componenti

| Componente | File | Uso |
|---|---|---|
| `AIModelSelector` | `components/AIModelSelector.tsx` | Selettore modello AI con task context (dashboard, piano, seo, brand) |
| `OpenRouterKeyInput` | `components/OpenRouterKeyInput.tsx` | Input key OpenRouter (dashboard) |
| `SeoScoreGrid` | `components/SeoScoreGrid.tsx` | Card punteggi SEO/GEO a 6 colonne |
| `LeadsCard` | `components/LeadsCard.tsx` | Risultati scraping contatti (email, WA, TG) |
| `ClientsCard` | `components/ClientsCard.tsx` | Risultati client discovery (ICP, personas, competitor) |
| `PostPreview` | `components/PostPreview.tsx` | Anteprima post per canale |
| `StatusBadge` | `components/StatusBadge.tsx` | Badge colorato per status |
| `ConfirmModal` | `components/ConfirmModal.tsx` | Modale conferma con stima token |
| `ClienteSelector` | `components/ClienteSelector.tsx` | Dropdown cambio cliente attivo |
| `Sidebar` | `components/Sidebar.tsx` | Navigazione principale |
| `GeneratorCards` | `components/GeneratorCards.tsx` | Card generazione rapida |
| `BlotatoStatusBadge` | `components/BlotatoStatusBadge.tsx` | Stato sincronizzazione Blotato |

---

## 6. Modelli AI

Provider supportati (in `lib/ai.ts`):
- **Anthropic**: `claude-sonnet-4-6` (default), `claude-opus-4-7`, `claude-haiku-4-5`
- **OpenRouter free**: `nvidia/nemotron-3-super-120b-a12b:free`, `nvidia/nemotron-3-super:free`, `nvidia/nemotron-3.5-content-safety:free`, `deepseek/deepseek-v4-flash:free`, altri 8 modelli

**Fallback automatico**: se OpenRouter fallisce, prova altri modelli gratuiti in cascade.
**Silent fallback**: errori AI loggati ma non bloccanti per l'utente.

---

## 7. Flusso Brand Discovery (completo)

```
Inserisci URL → [✓] SEO Audit → [✓] GEO Audit → [✓] Trova Contatti → [✓] Clienti & Marketing
                                                                    ↓
                    ┌──────────────┬───────────────┬─────────────────┐
                    ↓              ↓               ↓                 ↓
              Profilo Brand   SEO/GEO Score    Email/WA/TG       ICP+Personas
              (Tono, Target,  (6 dimensioni)   Telefono/Social   +Competitor
               Promessa...)                                       +KPI Vendita

                    └──────────────┴───────────────┴─────────────────┘
                    Tutto in parallelo con 1 click "Analizza sito"
```

---

## 8. Flusso Pubblicazione

```
Genera contenuto (AI con contesto brand) → Calendario → Score (AI valuta) → Approva
→ Blotato schedulazione → Pubblicato
```

---

## 9. Cosa NON aggiungere mai

- ❌ Supabase (rimosso dal runtime)
- ❌ n8n (rimosso)
- ❌ `as Type` in JSX (usa estrazione variabili)
- ❌ `ANY` Nuove dipendenze senza approvazione

---

## 10. Sicurezza

Audit/fix P0 completato il 26/06/2026:
- **Auth AI route**: tutte le `/api/generate/*` richiedono `requireAuth()`.
- **Tenant access**: `requireClienteId()` verifica `user_client_access.attivo = true`; i super admin passano via `profiles.ruolo_globale = 'super_admin'`.
- **Payload `cliente_id`**: endpoint che ricevono `cliente_id` dal client usano `requireClienteAccess(cliente_id)`.
- **SQL dinamico**: PATCH `brand` e `calendario` usano whitelist colonne; niente nomi colonna dal body non validati.
- **IDOR fix**: PATCH `settings` e `calendario` aggiornano solo record del cliente attivo (`cliente_id` nel `WHERE`).
- **Webhook Blotato**: `POST /api/webhook/blotato` richiede `BLOTATO_WEBHOOK_SECRET` in produzione; supporta `Authorization: Bearer`, `x-blotato-signature`, `x-webhook-signature`, `x-hub-signature-256` HMAC SHA-256.
- **Dependency audit**: `next` aggiornato a `15.5.19`, `postcss` a `8.5.15`, override `uuid=11.1.1`; `npm audit --audit-level=moderate` verde.
- `GET /api/data/approve` e `PATCH /api/data/approve` restano pubblici per portal token.

## 11. Media Validation

`lib/media-validate.ts` — valida URL media prima di approvare/pubblicare:
- HEAD request con timeout 5s
- Verifica content-type (image/jpeg, png, webp, gif, avif, video/mp4, webm, quicktime)
- Integrato in:
  - `app/api/data/calendario/route.ts` PATCH — prima di APPROVATO
  - `lib/publish/schedule.ts` — prima di inviare a Blotato
- Errori salvati in `errore_tecnico` con formato `media KO code=404 — link_media_N non raggiungibile`

## 12. Notifiche Telegram

`lib/notifications.ts` — invio notifiche via Telegram Bot API:
- Per cliente: `telegram_bot_token` + `telegram_chat_id` da settings DB
- Per agenzia: `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` da env
- Eventi: approvazione, pubblicato, errore, richiesta modifica
- Integrato in `app/api/data/calendario/route.ts` PATCH (status APPROVATO, ERRORE)
- Graceful fallback: se non configurato, non blocca

## 13. In Lavoro / Prossimi Step

- [ ] **Deploy effettivo su Render**: DATABASE_URL + AUTH_SECRET + BLOTATO_API_KEY + BLOTATO_WEBHOOK_SECRET
- [ ] **API key OpenRouter/Blotato**: per test end-to-end produzione
- [ ] **Multi-lingua**: generazione contenuti in altre lingue
- [ ] **White-label**: logo agenzia custom
- [ ] **Stripe**: pagamenti integrati nel funnel di vendita

---

## 11. Variabili Ambiente

```bash
DATABASE_URL=postgresql://...    # Neon
AUTH_SECRET=...                   # NextAuth
NEXTAUTH_URL=...                  # URL produzione
ANTHROPIC_API_KEY=...             # Claude (opzionale se usi OpenRouter)
OPENROUTER_API_KEY=...            # Modelli free (opzionale se usi Claude)
NEXT_PUBLIC_DEMO_MODE=true        # Demo mode senza DB
BLOTATO_API_KEY=...               # Quando pronto
BLOTATO_API_URL=https://api.blotato.com
BLOTATO_WEBHOOK_SECRET=...        # Firma webhook Blotato in produzione
```

---

## 14. Ultima Fase Locale

```bash
fix: audit sicurezza P0, tenant isolation, webhook signing, dependency CVE
```

**42 route, build verde, audit npm verde.**

*Fine handoff. Non reintrodurre Supabase o n8n. Mantieni la demo mode funzionante.*
