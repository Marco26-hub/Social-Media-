# Social Web Automation V2 — Admin Dashboard

Next.js 15 + Neon/Postgres. Sostituisce Google Sheets con dashboard web full.

## Deploy su Render

1. Vai su [render.com](https://render.com) → New → Blueprint.
2. Collega il repo → Render legge `render.yaml` automaticamente.
3. Compila le env `sync: false`: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`, chiave AI e Blotato quando pronto.
4. Il deploy Render esegue `npm run migrate` prima dello start; in alternativa lancialo manualmente con `DATABASE_URL="postgresql://..." npm run migrate`.
5. Apri `/api/system/health` e verifica `status: "ready"`.

**Env da impostare su Render:**
- `DATABASE_URL` — connection string Neon (da neon.tech → Dashboard → Connection)
- `AUTH_SECRET` — generato automaticamente da Render
- `NEXTAUTH_URL` — URL Render o dominio custom
- `NEXT_PUBLIC_SITE_URL` — stesso URL pubblico
- `OPENROUTER_API_KEY` — chiave AI (OpenRouter; anche per-browser dal pannello modello)
- `BLOTATO_API_KEY` / `BLOTATO_WEBHOOK_SECRET` — da Blotato quando vendi autopubblicazione

Guida completa: `RENDER_PRODUCTION.md`.

**Cold start:** Render free tier si spegne dopo 15 min di inattività. Prima richiesta ~30s. Per admin panel è accettabile.

## Stack

- **Next.js 15** (App Router, Server Components)
- **Neon/Postgres** via `DATABASE_URL`
- **NextAuth** con login credentials
- **Tailwind CSS**
- **API Routes** (generazione contenuti via AI)

## Setup

## Accesso admin

- Login: `/login`
- Dashboard admin: `/dashboard/clienti`
- In demo/setup senza DB il sito mostra il box **Accesso Admin** con `admin` / `1234567`.
- In produzione esegui `db/migrations/011_admin_user.sql`, entra con `admin` / `1234567`, poi cambia password o crea un admin reale.
- Non lasciare `SHOW_LOGIN_HINT=true` su un sito pubblico venduto: serve solo per demo controllate.

### 1. Database Neon/Postgres

1. Crea un database Neon/Postgres.
2. Configura `DATABASE_URL` in `.env.local`.
3. Applica tutte le migration con `npm run migrate`.
4. Usa `npm run migrate:dry` per controllare l'ordine senza toccare il DB.

### 2. Variabili ambiente

```bash
cp .env.local.example .env.local
# Compila con i tuoi valori reali
```

```
DATABASE_URL=postgresql://...
AUTH_SECRET=una-stringa-lunga-random
```

### 3. Crea utente admin

Crea una riga in `profiles` con `email`, `nome` e `password_hash` bcrypt.
Il login usa NextAuth credentials.

### 4. Install + dev

```bash
npm install
npm run dev
# → http://localhost:3000
```

### 5. Chiavi AI

Aggiungi almeno una chiave AI in `.env.local`:
- `OPENROUTER_API_KEY` — unico provider AI: testo (modelli :free o a pagamento) e immagini (/api/v1/images)

### 6. Deploy (Vercel)

```bash
npx vercel --prod
# Aggiungi le 3 env vars nel Vercel dashboard
```

Per produzione Render usa `RENDER_PRODUCTION.md`.

## Struttura

```
app/
  login/              → pagina login
  dashboard/          → layout con sidebar
    page.tsx          → overview stats
    calendario/       → approvazione contenuti (realtime)
    clienti/          → gestione clienti/brand multiutente
    log/              → log pubblicazioni
    prodotti/         → catalogo prodotti
    settings/         → configurazione automazione
  servizi/            → landing premium vendita servizi
components/
  Sidebar.tsx
  StatusBadge.tsx
lib/
  db.ts               → helper query Neon/Postgres
  auth.ts             → configurazione NextAuth credentials
  types.ts            → TypeScript types
db/
  migrations/         → migration operative Neon/Postgres
api/generate/         → contenuti, piano, blog, audit
app/api/system/       → health check operativo
db/migrations/004_operations_foundation.sql → job + eventi integrazioni
```

## Goal immediato

La priorita ora e portare il prodotto da demo a operativo:

1. Applicare `npm run migrate` su Neon per schema, seed e tabelle operative.
2. Usare `/api/system/health` come controllo rapido di env, DB e AI prima del deploy.
3. Collegare il flusso `APPROVATO → publish` con Blotato o webhook custom, salvando gli esiti in `integration_events`.

## Strategia commerciale

Il file `PACCHETTI-VENDITA.md` contiene i pacchetti consigliati per vendere il servizio:

- Presenza Social
- Sito + Social Start
- Crescita Business
- E-commerce Attivo
- Dominio Digitale

Regola base: Social Web Automation vende il servizio gestito, non il motore interno. Workflow, prompt, chiavi API e automazioni restano proprieta Social Web Automation.

Il file `CHECKLIST-VENDITA.md` contiene la checklist operativa: accesso admin, demo call, cosa configurare prima di vendere e cosa non promettere finché Blotato non è testato end-to-end.

## Brand

- **Software / prodotto**: Social Web Automation (servizio gestito SaaS-as-a-service)
- **Primo cliente test**: SILKinCOM (seedato in `db/migrations/002_seed.sql` — fashion e-commerce, piano `pro`, 30 contenuti/mese)
- I documenti commerciali (brochure, landing, pacchetti) usano il brand **Social Web Automation**
- Il cliente test SILKinCOM resta nel DB come esempio operativo per QA e demo

## Brochure

Materiali commerciali pronti (brand: Social Web Automation):

- `BROCHURE.md` testo modificabile.
- `brochure.html` brochure grafica stampabile A4.
- `brochure.pdf` brochure pronta da inviare al cliente.

## Landing vendita

La pagina `/servizi` e una landing premium pubblica per vendere sito, e-commerce e gestione social automatizzata. Non espone workflow interni, chiavi API o logica tecnica del motore.

## Flusso operativo

```
TU (dashboard web)
  → /dashboard/piano → genera piano → AI scrive in calendario
  → /dashboard/social/* → genera contenuto → AI scrive in calendario
  → /dashboard/calendario → approva con 1 click → DA_APPROVARE → APPROVATO

NEXT (blotato/webhook esterno)
  → APPROVATO → pubblica sul social → PUBBLICATO
```

## Multi-cliente

La migration `001_full_schema.sql` crea la base multi-cliente:

- tabella `clienti`
- tabella `profiles`
- tabella `user_client_access`
- campo `cliente_id` su calendario, prodotti, brand, account social, promo, settings, log, blog e audit
- policy RLS per separare i dati tra utenti/clienti
- RPC `create_cliente_for_current_user` per creare un cliente e assegnare l'utente come owner

Il cliente attivo viene salvato nel cookie `active_cliente_id`.
