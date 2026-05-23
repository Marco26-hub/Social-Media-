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
3. Esegui `supabase/migrations/002_blog_seo.sql`
4. Esegui `supabase/migrations/003_multi_tenant.sql`
5. Copia `Project URL` e le chiavi da **Settings → API**

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

Nota: nel frontend la variabile si chiama `SUPABASE_SERVICE_ROLE_KEY`, mentre nei workflow n8n è usata come `SUPABASE_SERVICE_KEY` (stesso valore).

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
    clienti/          → gestione clienti/brand multiutente
    log/              → log pubblicazioni
    prodotti/         → catalogo prodotti
    settings/         → configurazione automazione
  servizi/            → landing premium vendita servizi
components/
  Sidebar.tsx
  StatusBadge.tsx
lib/
  supabase/           → client + server helpers
  types.ts            → TypeScript types
supabase/
  migrations/         → SQL schema completo + multi-cliente/multiutente
n8n_workflows/        → C (pubblica), B (genera), J (valida media)
```

## Strategia commerciale

Il file `PACCHETTI-VENDITA.md` contiene i pacchetti consigliati per vendere il servizio:

- Presenza Social
- Sito + Social Start
- Crescita Business
- E-commerce Attivo
- Dominio Digitale

Regola base: Social Automation vende il servizio gestito, non il motore interno. Workflow, prompt, chiavi API e automazioni restano proprieta Social Automation.

## Brand

- **Software / prodotto**: Social Automation (servizio gestito SaaS-as-a-service)
- **Primo cliente test**: SILKinCOM (seedato in migration `003_multi_tenant.sql` riga 45 — fashion e-commerce, piano `pro`, 30 contenuti/mese)
- I documenti commerciali (brochure, landing, pacchetti) usano il brand **Social Automation**
- Il cliente test SILKinCOM resta nel DB come esempio operativo per QA e demo

## Brochure

Materiali commerciali pronti (brand: Social Automation):

- `BROCHURE.md` testo modificabile.
- `brochure.html` brochure grafica stampabile A4.
- `brochure.pdf` brochure pronta da inviare al cliente.

## Landing vendita

La pagina `/servizi` e una landing premium pubblica per vendere sito, e-commerce e gestione social automatizzata. Non espone workflow interni, chiavi API o logica tecnica del motore.

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
  → APPROVATO → valida per cliente → pubblica su Blotato → PUBBLICATO
```

## Multi-cliente

La migration `003_multi_tenant.sql` aggiunge:

- tabella `clienti`
- tabella `profiles`
- tabella `user_client_access`
- campo `cliente_id` su calendario, prodotti, brand, account social, promo, settings, log, blog e audit
- policy RLS per separare i dati tra utenti/clienti
- RPC `create_cliente_for_current_user` per creare un cliente e assegnare l'utente come owner

Il cliente attivo viene salvato nel cookie `active_cliente_id` e passato ai workflow n8n tramite `cliente_id`.
