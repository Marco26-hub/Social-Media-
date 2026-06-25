# Social Automation V2 — Admin Dashboard

Next.js 15 + Neon/Postgres. Sostituisce Google Sheets con dashboard web full.

## Stack

- **Next.js 15** (App Router, Server Components)
- **Neon/Postgres** via `DATABASE_URL`
- **NextAuth** con login credentials
- **Tailwind CSS**
- **API Routes** (generazione contenuti via AI)

## Setup

### 1. Database Neon/Postgres

1. Crea un database Neon/Postgres.
2. Configura `DATABASE_URL` in `.env.local`.
3. Applica lo schema SQL esistente al database.
4. Esegui `db/migrations/004_operations_foundation.sql` per job backend ed eventi integrazione.

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
- `ANTHROPIC_API_KEY` per modelli Claude (default)
- `OPENROUTER_API_KEY` per modelli free/esterni (opzionale)

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

1. Applicare `db/migrations/004_operations_foundation.sql` su Neon per tracciare job backend ed eventi integrazione.
2. Usare `/api/system/health` come controllo rapido di env, DB e AI prima del deploy.
3. Collegare il flusso `APPROVATO → publish` con Blotato o webhook custom, salvando gli esiti in `integration_events`.

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
TU (dashboard web)
  → /dashboard/piano → genera piano → AI scrive in calendario
  → /dashboard/social/* → genera contenuto → AI scrive in calendario
  → /dashboard/calendario → approva con 1 click → DA_APPROVARE → APPROVATO

NEXT (blotato/webhook esterno)
  → APPROVATO → pubblica sul social → PUBBLICATO
```

## Multi-cliente

La migration `003_multi_tenant.sql` aggiunge:

- tabella `clienti`
- tabella `profiles`
- tabella `user_client_access`
- campo `cliente_id` su calendario, prodotti, brand, account social, promo, settings, log, blog e audit
- policy RLS per separare i dati tra utenti/clienti
- RPC `create_cliente_for_current_user` per creare un cliente e assegnare l'utente come owner

Il cliente attivo viene salvato nel cookie `active_cliente_id`.
