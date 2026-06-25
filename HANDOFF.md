# HANDOFF — Social Automation V2

> Documento per AI agent (Claude, Codex, Cursor, etc.). Stato attuale del progetto.

**Data**: 2026-06-25
**Progetto**: Social Automation — SaaS gestito per sito, e-commerce e social automation
**Stack**: Next.js 15 + Supabase + Tailwind + AI (Anthropic/OpenRouter)
**Percorso**: `/Users/md/Downloads/social_automation_v2`
**Repo**: https://github.com/Marco26-hub/Post.git

---

## 1. ARCHITETTURA

```
Browser → Next.js (App Router)
            ├── /dashboard/*         → pagine admin (protette da auth)
            ├── /servizi             → landing vendita pubblica
            ├── /login               → login Supabase
            └── /api/generate/*      → API route (chiamano AI → Supabase)

Supabase:
  ├── Auth (login, RLS)
  ├── Postgres (13 tabelle)
  └── Realtime (calendario aggiornamenti live)
```

**n8n eliminato**. La generazione contenuti ora avviene direttamente nelle API route Next.js.

---

## 2. STRUTTURA FILE (solo ciò che conta)

```
app/
  api/generate/
    content/route.ts    → POST: genera post/reel/carousel/story/pin/short
    plan/route.ts       → POST: genera piano settimanale/mensile
    seo-audit/route.ts  → POST: genera audit SEO/GEO
  dashboard/
    page.tsx            → overview stats + griglia social
    calendario/page.tsx → approvazione contenuti (realtime)
    clienti/page.tsx    → gestione clienti multi-tenant
    prodotti/page.tsx   → catalogo prodotti
    social/[platform]/page.tsx → generatori per piattaforma
    piano/page.tsx      → piano editoriale (settimanale/mensile)
    seo/page.tsx        → audit SEO/GEO
    log/page.tsx        → storico pubblicazioni
    settings/page.tsx   → configurazione automazione
    layout.tsx          → layout con sidebar
  servizi/
    page.tsx            → landing vendita premium
    servizi.module.css
  layout.tsx            → root layout
  middleware.ts         → auth guard + redirect
components/
  Sidebar.tsx           → navigazione + selettore cliente
  StatusBadge.tsx       → badge colorato per status
  PostPreview.tsx       → anteprime visuali per ogni formato social
  AIModelSelector.tsx   → selezione modello AI (Claude / OpenRouter free)
  ClienteSelector.tsx   → cambio cliente attivo
  ConfirmModal.tsx      → modale conferma generazione
  GeneratorCards.tsx    → [non usato] versione vecchia dei generatori
lib/
  ai.ts                 → chiamata AI (Anthropic + OpenRouter) + extractJSON
  types.ts              → tutti i tipi TypeScript
  social-config.ts      → configurazione piattaforme e formati
  demo.ts               → demo mode detection
  demo-data.ts          → dati finti per demo
  supabase/
    client.ts           → browser client
    server.ts           → server client (cookies)
    admin.ts            → service role client (bypass RLS, per API route)
  tenant/
    client.ts           → hook useActiveClienteId
    server.ts           → getActiveClienteId (server)
prompts/
  G_blog_article.txt    → [riferimento] prompt blog
  K_piano_mensile.txt   → [riferimento] prompt piano mensile
  L_seo_geo_audit.txt   → [riferimento] prompt audit
n8n_workflows/          → [riferimento storico] 9 workflow n8n non più usati
supabase/migrations/
  001_initial_schema.sql
  002_blog_seo.sql
  003_multi_tenant.sql
```

---

## 3. API ROUTE — COME FUNZIONANO

### `POST /api/generate/content`
- **Input**: `{ cliente_id, canale, formato, model?, openrouter_key?, tema?, nome_prodotto?, product_id? }`
- **Cosa fa**: carica brand + prodotti da Supabase, builda prompt (inline), chiama AI, scrive in `calendario` con status `DA_APPROVARE`
- **Supporta formati**: post, carousel, reel, video, short, story, pin, articolo
- **Prompt**: inline nel file (estratti dai vecchi workflow n8n SOCIAL_B, SOCIAL_D, SOCIAL_E, SOCIAL_G)

### `POST /api/generate/plan`
- **Input**: `{ cliente_id, piattaforme[], obiettivo?, model?, openrouter_key?, periodo? }`
- **Cosa fa**: genera array di contenuti (7-10 weekly / 25-35 monthly), inserisce tutto in `calendario` con status `BOZZA`
- **Prompt**: inline (ex SOCIAL_A/SOCIAL_K)

### `POST /api/generate/seo-audit`
- **Input**: `{ cliente_id, sito_url, periodo?, model?, openrouter_key? }`
- **Cosa fa**: carica brand + ultimi 30 contenuti + log, chiama AI, scrive in `seo_audit`
- **Prompt**: inline (ex SOCIAL_L)

### `lib/ai.ts` — utility condivisa
- Supporta **Anthropic** (modelli `claude-*`) e **OpenRouter** (modelli con `:` es. `nvidia/nemotron-3-super:free`)
- `extractJSON(text)` → estrae primo `{...}` dalla risposta
- `extractJSONArray(text)` → estrae primo `[...]` dalla risposta

---

## 4. STATO COMPONENTI

| Componente | Stato | Note |
|---|---|---|
| Dashboard overview | ✅ Fatto | Stats + griglia social + ultimi log |
| Login Supabase | ✅ Fatto | Auth + redirect |
| Calendario approvazione | ✅ Fatto | Realtime, filtri status/canale, modale dettaglio |
| Generatori social per piattaforma | ✅ Fatto | 7 pagine (IG, FB, TT, Pin, LI, YT, Blog) |
| Piano editoriale | ✅ Fatto | Step wizard (periodo → piattaforme → obiettivo) |
| SEO/GEO audit | ✅ Fatto | Form + score card + miglioramenti |
| Prodotti | ✅ Fatto | CRUD catalogo |
| Log pubblicazioni | ✅ Fatto | Storico |
| Settings | ✅ Fatto | Toggle automazione, dry run, etc. |
| Multi-tenancy | ✅ Fatto | Cliente selector, RLS, cookie, filtro dati |
| API route generate/content | ✅ Fatto | Sostituisce SOCIAL_B/D/E/G |
| API route generate/plan | ✅ Fatto | Sostituisce SOCIAL_A/K |
| API route generate/seo-audit | ✅ Fatto | Sostituisce SOCIAL_L |
| AI utility (lib/ai.ts) | ✅ Fatto | Anthropic + OpenRouter |
| Supabase admin client | ✅ Fatto | Service role per API route |
| Landing servizi | ✅ Fatto | Pagina vendita pubblica |
| Brochure (MD/HTML/PDF) | ✅ Fatto | Materiali commerciali |
| Pacchetti vendita | ✅ Fatto | Listino + regole |
| n8n workflows | 🗑️ Rimosso | Sostituito da API route |
| Pubblicazione Blotato | ❌ Da fare | Workflow n8n SOCIAL_C come riferimento |
| Validazione media | ❌ Da fare | Ex SOCIAL_J |
| Report automatico | ❌ Da fare | Ex SOCIAL_F |
| Test end-to-end reale | ❌ Da fare | Con chiavi vere e Blotato |

---

## 5. FLUSSO OPERATIVO ATTUALE

```
1. Admin seleziona cliente
2. Admin va su /dashboard/piano o /dashboard/social/instagram
3. Clicca "Genera" → chiama /api/generate/* → AI risponde → scritto in Supabase
4. Admin apre /dashboard/calendario → vede contenuti in DA_APPROVARE
5. Admin approva con 1 click → status → APPROVATO
6. [NEXT] Sistema esterno (es. Blotato) legge APPROVATO e pubblica → PUBBLICATO
```

---

## 6. ENV RICHIESTO

```bash
NEXT_PUBLIC_SUPABASE_URL=      # Obbligatorio
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Obbligatorio
SUPABASE_SERVICE_ROLE_KEY=     # Obbligatorio (per API route)
ANTHROPIC_API_KEY=             # Almeno 1 chiave AI
OPENROUTER_API_KEY=            # Opzionale (per modelli free)
```

**Nota**: `.env.local` attuale ha placeholder di test → modalità demo automatica.

---

## 7. COSA MANCA / PROSSIMI PASSI

### Critico per produzione
- [ ] Inserire chiavi Supabase reali in `.env.local`
- [ ] Eseguire migration SQL su Supabase
- [ ] Creare utente admin Supabase
- [ ] Popolare `account_social` con piattaforme reali
- [ ] Popolare `prodotti` con prodotti reali
- [ ] Popolare `brand` con dati cliente
- [ ] Testare generazione contenuti con chiave AI vera
- [ ] Implementare pubblicazione (Blotato o webhook custom)

### Miglioramenti possibili
- [ ] `/api/generate/blog` route per articoli blog
- [ ] Validazione media (ex SOCIAL_J)
- [ ] Report automatico (ex SOCIAL_F)
- [ ] Rate limiting e job queue per generazione batch
- [ ] Pagina di onboarding per nuovi clienti
- [ ] Dashboard analytics (engagement, reach, etc.)

---

## 8. DECISIONI TECNICHE

- **n8n eliminato**: non serve un orchestratore esterno. Next.js API route sono sufficienti.
- **Prompt inline**: i prompt AI sono dentro le route (non in file separati) per semplicità. I file in `prompts/` e `n8n_workflows/` sono riferimento storico.
- **Service role per API**: le API route usano `SUPABASE_SERVICE_ROLE_KEY` per bypassare RLS, dato che operano in contesto server-trusted.
- **Demo mode**: se `NEXT_PUBLIC_SUPABASE_URL` è placeholder/test, tutto funziona con dati finti senza DB/AI reali.
- **Multi-tenancy**: ogni dato ha `cliente_id`. Il cliente attivo è in cookie `active_cliente_id`.

---

## 9. TIPO DI MODELLI AI DISPONIBILI

L'`AIModelSelector` salva in `localStorage`:
- `ai_model`: id del modello selezionato
- `openrouter_key`: chiave OpenRouter (se usi modelli free)

**Anthropic** (richiede `ANTHROPIC_API_KEY` in env):
- `claude-sonnet-4-6` (default, consigliato)
- `claude-opus-4-7` (premium, più costoso)
- `claude-haiku-4-5` (veloce, economico)

**OpenRouter** (richiede chiave in localStorage o `OPENROUTER_API_KEY` in env):
- `nvidia/nemotron-3-super:free`
- `deepseek/deepseek-v4-flash:free`
- `openai/gpt-oss-120b:free`
- e altri 6 modelli free

---

## 10. COMANDI

```bash
npm run dev      # → http://localhost:3000
npm run build    # build produzione
npm run lint     # lint
```

---

*Fine handoff. Se qualcosa non è chiaro, chiedi.*
