# Social Automation V2 — Admin Dashboard

Next.js 15 + Supabase. Sostituisce Google Sheets con dashboard web full.

## Stack

- **Next.js 15** (App Router, Server Components)
- **Supabase** (Postgres, Auth, Realtime, Row Level Security)
- **Tailwind CSS**
- **n8n** (workflow automation — legge/scrive su Supabase)

## Setup

### 1. Supabase

1. Crea progetto su [supabase.com](https://supabase.com)
2. Vai su **SQL Editor** → esegui `supabase/migrations/001_initial_schema.sql`
3. Copia `Project URL` e le chiavi da **Settings → API**

### 2. Variabili ambiente

```bash
cp .env.local.example .env.local
# Compila con i tuoi valori Supabase
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. Crea utente admin

Supabase Dashboard → **Authentication → Users → Invite user** (o Add user)  
Inserisci email + password per il login admin.

### 4. Install + dev

```bash
npm install
npm run dev
# → http://localhost:3000
```

### 5. n8n

Importa i 3 JSON da `n8n_workflows/` in n8n.

Crea credential **SUPABASE** (HTTP Header Auth):
- Header name: `apikey`
- Header value: `<SUPABASE_ANON_KEY>`

Aggiungi variabili n8n:
```
SUPABASE_URL     = https://xxxx.supabase.co
SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_KEY = eyJ... (service role key)
```

### 6. Deploy (Vercel)

```bash
npx vercel --prod
# Aggiungi le 3 env vars nel Vercel dashboard
```

## Struttura

```
app/
  login/              → pagina login
  dashboard/          → layout con sidebar
    page.tsx          → overview stats
    calendario/       → approvazione contenuti (realtime)
    log/              → log pubblicazioni
    prodotti/         → catalogo prodotti
    settings/         → configurazione automazione
components/
  Sidebar.tsx
  StatusBadge.tsx
lib/
  supabase/           → client + server helpers
  types.ts            → TypeScript types
supabase/
  migrations/         → SQL schema completo
n8n_workflows/        → C (pubblica), B (genera), J (valida media)
```

## Flusso operativo

```
SOCIAL_A (n8n, lun 08:00)
  → genera piano → scrive in Supabase calendario

SOCIAL_B (n8n, ogni 30min)
  → righe IDEA → Claude → DA_APPROVARE

SOCIAL_J (n8n, ogni 30min)
  → HEAD check media → media_validato=SI/NO

TU (dashboard web)
  → /dashboard/calendario → approva con 1 click

SOCIAL_C (n8n, ogni 15min)
  → APPROVATO → valida → pubblica su Blotato → PUBBLICATO
```
