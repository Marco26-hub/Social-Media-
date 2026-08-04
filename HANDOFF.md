# HANDOFF — Social Automation

Stato al 2026-08-04. Piattaforma SaaS di social media automation con AI (Next.js 15, App Router).

## Stack
- **Frontend/Backend:** Next.js 15.5 (App Router), React 19, Tailwind. Deploy su **Vercel**.
- **DB:** **Supabase** Postgres. Accesso via SQL raw (`lib/db.ts`, driver `pg`, helper `q()/q1()`). Nessun ORM.
- **Storage media:** **Supabase Storage** (bucket pubblico `media`), via S3-compatible + `aws4fetch` (`lib/storage.ts`).
- **Auth:** NextAuth (JWT, `CredentialsProvider`, bcrypt su `profiles`). Secret `AUTH_SECRET`.
- **AI:** SOLO OpenRouter (testo + immagini via /api/v1/images), `lib/ai.ts`. Key server o per-browser.
- **Scheduling:** GitHub Actions cron (`.github/workflows/agenti-cron.yml`, lun 07:00 UTC) → chiama `/api/agents/*` con `CRON_SECRET`.

## Database
- Migrazioni in **`db/migrations/`** (001–039). Runner: `npm run migrate` (usa `DIRECT_DATABASE_URL`, invia ogni file intero a Postgres). `npm run migrate:dry` per il dry-run — attenzione: elenca TUTTI i file su disco, non quelli mancanti sul DB (non dice nulla sullo stato remoto).
- **⚠️ Vercel NON applica le migrazioni al deploy.** Push del codice e stato del DB sono due cose separate: dopo ogni push (anche del socio) controllare `schema_migrations` prima di assumere che lo schema sia allineato al codice live. Successo passato: codice per pacchetti/timezone in produzione per ore con le colonne ancora assenti (silenzioso finché non si guarda).
- **Due connection string** (pooler Supavisor, IPv4):
  - `DATABASE_URL` — transaction pooler **:6543** (runtime app serverless).
  - `DIRECT_DATABASE_URL` — session pooler **:5432** (migrazioni, script). La connessione diretta `db.<ref>.supabase.co:5432` è IPv6-only → non usabile da Vercel/CI.
- RLS **spento**: tenant-scoping applicativo via `cliente_id` nelle query.

## Variabili ambiente (Vercel + `.env.local`)
`DATABASE_URL`, `DIRECT_DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`,
`STORAGE_ENDPOINT` (endpoint S3, sottodominio `.storage.`), `STORAGE_REGION`, `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY`, `STORAGE_BUCKET`, `STORAGE_PUBLIC_URL`,
`OPENROUTER_API_KEY`, `BLOTATO_*`, `STRIPE_*`, `RESEND_API_KEY`/`EMAIL_FROM`, `TURNSTILE_*`, `META_*`, `CRON_SECRET`, `PUBLISH_ENABLED`.
Template completi in `.env.example` / `.env.local.example`. Storage read-only su Vercel: `STORAGE_*` è **obbligatorio** (no fallback su disco).

## Migrazione Render+Neon → Vercel+Supabase (fatta)
- Driver DB spostato da Neon HTTP a `pg` sul pooler Supabase.
- Schema (34 migrazioni) + dati reali migrati su Supabase; file media re-hostati su Supabase Storage.
- Route agent `/api/agents/*` con `export const maxDuration = 300` (Vercel Pro).

## Dashboard (menu 24 → 10 voci)
Vecchie pagine unificate in poche pagine-contenitore con tab, vecchie URL vive via redirect stub (`lib/tab-redirect.ts`, conserva la query — serve ai callback OAuth Meta/Stripe). Pattern: `components/TabbedPage.tsx` (tab attivo in `?tab=` via `useSearchParams`, **non** `window.location.search` — quello non si aggiorna su navigazione client-side/Link, bug reale trovato e corretto). Struttura attuale:
- `/dashboard/social` — le 9 pagine social unificate con selettore canale a chip
- `/dashboard/marketing` — Blog SEO · Campagne Ads · SEO+GEO · Leads · Competitor · Performance · Report · Log · Consumi AI (9 tab; Performance e Report visibili anche ai clienti, il resto adminOnly)
- `/dashboard/clienti` — Clienti · Registrazioni · Pagamenti · Onboarding
- `/dashboard/settings` — Impostazioni · Profilo Brand · Prodotti · Setup Produzione

## Piano editoriale — generazione con AI (lavoro pesante di questa sessione)
- **`lib/scheduling.ts`**: orari e giorni non più a caso. Fasce per canale (`CHANNEL_SLOTS`, con motivazione per ciascuna), cadenza dal pacchetto (`cadenzaDaPacchetto`), niente più default fisso `10:00`.
- **`lib/media-requirements.ts`**: calcola quante immagini/MP4 servono davvero (dal pacchetto/quota), non una stima fissa. Reel senza MP4 = 1 sola immagine di copertina, il sistema NON monta video dalle foto.
- **`app/api/generate/plan/route.ts`**: MP4 vincolato SOLO a formati video (mai su post/carosello), marcatura manuale media (`auto|carosello|reel|post`) rispettata, distribuzione media tra blocchi settimanali consapevole di tipo/marcatura (non più a fette cieche — un MP4 caricato con le foto poteva finire tutto nell'ultimo blocco), mix formati imposto nel prompt, item senza hook/caption scartati invece di salvati come gusci vuoti, nome del media trattato come vincolante (vince sul catalogo prodotti quando il contenuto usa una foto caricata).
- **`lib/pacchetti.ts`** (vetrina commerciale, campo `piano`) e **`lib/packages.ts`** (generazione, campo `pacchetto`) sono **due sistemi paralleli** che oggi coincidono solo perché allineati a mano — da unificare prima di avere molti clienti.
- Ogni punto di creazione cliente (`lib/provisioning.ts` per l'attivazione registrazione, `app/api/data/clienti` POST per l'onboarding manuale) deve impostare `pacchetto`+`contenuti_mese` derivandoli dallo stesso mapping piano→pacchetto — trovati e corretti bug identici in entrambi i punti (quota rimasta al default schema 30 invece che 16/24).

## Blotato (pubblicazione social) — multi-cliente, workspace condiviso
Il workspace Blotato ospita gli account di **più clienti reali insieme** (SILKinCOM, Studio Legale BCS, SWA — l'agenzia stessa) più altri brand gestiti dallo stesso studio. **Mai scegliere un account implicitamente**: `lib/blotato-accounts.ts` fallisce chiuso (`pickAccount`/`pickSubaccount`) se per una piattaforma ci sono più account/Pagine senza una scelta esplicita salvata (`settings.blotato_account_<canale>` / `blotato_subaccount_<canale>`). Anteprima sola-lettura in scheda cliente ("Account Blotato — dove verranno pubblicati i contenuti") prima di qualunque test live.
- **Endpoint corretto**: `GET /v2/users/me/accounts` (non `/v2/accounts`, che risponde 404 — bug trovato e corretto, non era un problema di chiave). Sotto-destinazioni (Facebook Page/Pinterest board/LinkedIn Company Page) via `GET /v2/users/me/accounts/{id}/subaccounts`, chiamata separata per account.
- **Gate di pubblicazione**: `PUBLISH_ENABLED` (env) + `dry_run` per cliente (settings) — entrambi devono essere sbloccati. Default fail-safe: valore mancante o non `FALSE` esplicito = dry-run.
- **Pagina Facebook SWA** ("Social Web Automation", account id `44606`) configurata in questa sessione: Pagina business collegata, Instagram, sito aggiuntivo, indirizzo (Via G. Verdi 2/B, Cermenate CO), Impressum (SWA S.r.l.). Nessun post ancora pubblicato — resta da fare.
- **Mai testato in produzione**: `blotato_post_id` nullo su tutti i contenuti storici, nessuna pubblicazione reale è mai partita. Il primo test live va fatto un contenuto alla volta.

## Da completare
1. Deploy Vercel: push del codice + tutte le env Supabase. Il progetto Vercel auto-deploya da `main`.
2. GitHub → repo variable `APP_BASE_URL` = dominio Vercel (per il cron).
3. **Sicurezza:** gli account `admin` e `cliente` usano ancora la password di default `1234567` — cambiarle prima del go-live.
4. Spegnere Render solo dopo che Vercel è verificato (media e dati sono già su Supabase).
5. Primo post + prima storia "chi siamo" su Facebook SWA, poi replicare su Instagram (in corso).
6. Verificare se `PUBLISH_ENABLED` su Vercel è impostato correttamente prima del primo test di pubblicazione reale.
