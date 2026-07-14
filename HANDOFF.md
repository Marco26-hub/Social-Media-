# HANDOFF — Social Automation

Stato al 2026-07-15. Piattaforma SaaS di social media automation con AI (Next.js 15, App Router).

## Stack
- **Frontend/Backend:** Next.js 15.5 (App Router), React 19, Tailwind. Deploy su **Vercel**.
- **DB:** **Supabase** Postgres. Accesso via SQL raw (`lib/db.ts`, driver `pg`, helper `q()/q1()`). Nessun ORM.
- **Storage media:** **Supabase Storage** (bucket pubblico `media`), via S3-compatible + `aws4fetch` (`lib/storage.ts`).
- **Auth:** NextAuth (JWT, `CredentialsProvider`, bcrypt su `profiles`). Secret `AUTH_SECRET`.
- **AI:** cascata multi-provider (Anthropic/OpenRouter/…), `lib/ai.ts`.
- **Scheduling:** GitHub Actions cron (`.github/workflows/agenti-cron.yml`, lun 07:00 UTC) → chiama `/api/agents/*` con `CRON_SECRET`.

## Database
- Migrazioni in **`db/migrations/`** (001–034). Runner: `npm run migrate` (usa `DIRECT_DATABASE_URL`, invia ogni file intero a Postgres). `npm run migrate:dry` per il dry-run.
- **Due connection string** (pooler Supavisor, IPv4):
  - `DATABASE_URL` — transaction pooler **:6543** (runtime app serverless).
  - `DIRECT_DATABASE_URL` — session pooler **:5432** (migrazioni, script). La connessione diretta `db.<ref>.supabase.co:5432` è IPv6-only → non usabile da Vercel/CI.
- RLS **spento**: tenant-scoping applicativo via `cliente_id` nelle query.

## Variabili ambiente (Vercel + `.env.local`)
`DATABASE_URL`, `DIRECT_DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`,
`STORAGE_ENDPOINT` (endpoint S3, sottodominio `.storage.`), `STORAGE_REGION`, `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY`, `STORAGE_BUCKET`, `STORAGE_PUBLIC_URL`,
`ANTHROPIC_API_KEY`/`OPENROUTER_API_KEY`, `BLOTATO_*`, `STRIPE_*`, `RESEND_API_KEY`/`EMAIL_FROM`, `TURNSTILE_*`, `META_*`, `CRON_SECRET`, `PUBLISH_ENABLED`.
Template completi in `.env.example` / `.env.local.example`. Storage read-only su Vercel: `STORAGE_*` è **obbligatorio** (no fallback su disco).

## Migrazione Render+Neon → Vercel+Supabase (fatta)
- Driver DB spostato da Neon HTTP a `pg` sul pooler Supabase.
- Schema (34 migrazioni) + dati reali migrati su Supabase; file media re-hostati su Supabase Storage.
- Route agent `/api/agents/*` con `export const maxDuration = 300` (Vercel Pro).

## Da completare
1. Deploy Vercel: push del codice + tutte le env Supabase. Il progetto Vercel auto-deploya da `main`.
2. GitHub → repo variable `APP_BASE_URL` = dominio Vercel (per il cron).
3. **Sicurezza:** gli account `admin` e `cliente` usano ancora la password di default `1234567` — cambiarle prima del go-live.
4. Spegnere Render solo dopo che Vercel è verificato (media e dati sono già su Supabase).
