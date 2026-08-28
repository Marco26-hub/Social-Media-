# HANDOFF — Social Web Automation

Stato al 2026-08-24. Piattaforma SaaS di social media automation con AI (Next.js 15, App Router).

## Stack
- **Frontend/Backend:** Next.js 15.5 (App Router), React 19, Tailwind. Deploy su **Vercel**.
- **DB:** **Supabase** Postgres. Accesso via SQL raw (`lib/db.ts`, driver `pg`, helper `q()/q1()`). Nessun ORM.
- **Storage media:** **Supabase Storage** (bucket pubblico `media`), via S3-compatible + `aws4fetch` (`lib/storage.ts`).
- **Auth:** NextAuth (JWT, `CredentialsProvider`, bcrypt su `profiles`). Secret `AUTH_SECRET`.
- **AI:** SOLO OpenRouter (testo + immagini via /api/v1/images), `lib/ai.ts`. Key server o per-browser.
- **Scheduling:** GitHub Actions cron (`.github/workflows/agenti-cron.yml`, lun 07:00 UTC) → chiama `/api/agents/*` con `CRON_SECRET`.

## Database
- Migrazioni in **`db/migrations/`** (001–043). Runner: `npm run migrate` (usa `DIRECT_DATABASE_URL`, invia ogni file intero a Postgres). `npm run migrate:dry` per il dry-run. La 043 crea gli ordini autonomi Blog/Web/Lead; il backend può inizializzarla in modo idempotente tramite `lib/standalone-service-schema.ts` usando la connessione runtime Vercel, senza esportare segreti di produzione.
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
- `/dashboard/marketing` — Blog SEO · Campagne Ads · SEO+GEO · Competitor · Performance · Report · Log · Consumi AI. Il vecchio tab Leads e lo scraper dimostrativo sono stati rimossi: il motore Lead vive in un progetto separato.
- `/dashboard/clienti` — Clienti · Registrazioni · Pagamenti · Onboarding
- `/dashboard/settings` — Impostazioni · Profilo Brand · Prodotti · Setup Produzione

## Sito pubblico e offerta commerciale
- La vetrina usa una tassonomia unica per **Presenza**, **Crescita**, **Blog SEO + GEO**, **Web & Commerce** e **Pilot Ricerca Clienti B2B**. Lead B2B è presente in Home, menu Soluzioni, Servizi, Pacchetti, metadata, JSON-LD e sitemap.
- Presenza e Crescita sono i due pacchetti social. Blog e Web sono servizi autonomi e combinabili, non pacchetti social impliciti.
- **Blog SEO + GEO:** `/servizi/blog-seo`, 12 articoli al mese a 29,90 euro/mese, 14 giorni iniziali. Include piano editoriale, SEO on-page, GEO/FAQ, revisione umana e pubblicazione sul blog SWA collegato oppure consegna/integrazione per CMS esterni. Non promette ranking o traffico garantiti.
- **Web & Commerce:** `/servizi/siti-e-commerce`, da 19,90 euro/mese; dopo 12 mesi di canone il sito diventa del cliente. La stessa formula è ora esposta anche in Home e nella pagina Pacchetti.
- Checkout Stripe LIVE autonomo in `/acquista`: Blog €29,90/mese e Web Base €19,90/mese sono abbonamenti; Pilot Lead €149 è un pagamento una tantum. Gli ordini non creano workspace o quote social, vengono sincronizzati dal webhook e sono visibili nel tab Admin Pagamenti con fatture e Customer Portal.
- **Ricerca Clienti B2B:** `/servizi/ricerca-clienti-b2b`, fino a 30 aziende analizzate, fonti verificabili e lista prioritaria. In questo repository non gira il motore di ricerca e non esistono dati demo; il motore operativo resta nel progetto separato.
- **Architettura commerciale:** farsi conoscere (Social e Blog), essere trovati (SEO + GEO), convertire (Web & Commerce), trovare opportunità (Lead B2B), operare correttamente (AI Act, GDPR e compliance).
- **SEO + GEO** è audit, strategia, architettura e ottimizzazione; **Blog SEO + GEO** è la produzione continuativa di 12 articoli mensili. Questa distinzione è esplicita in Home, Servizi, Pacchetti e nelle due pagine dedicate.
- **SEO internazionale:** `/en`, `/en/services` e `/en/pricing` sono pagine inglesi reali con URL localizzati, canonical e hreflang reciproci. Cermenate resta sede legale e non limita l’area servita.
- **Social ufficiali:** Instagram `https://www.instagram.com/socialwebautomation/`; Facebook `https://www.facebook.com/profile.php?id=61592835840985`. I link sono presenti nel footer e nei dati strutturati Organization.

## Piano editoriale — generazione con AI
- **`lib/scheduling.ts`**: orari e giorni non più a caso. Fasce per canale (`CHANNEL_SLOTS`, con motivazione per ciascuna), cadenza dal pacchetto (`cadenzaDaPacchetto`), niente più default fisso `10:00`.
- **`lib/media-requirements.ts`**: calcola le quantità esatte per Post, Story, Caroselli e Reel dal pacchetto/quota e dal periodo. I caricamenti sono separati per destinazione. Un Reel accetta 1 MP4 oppure 5 foto verticali 9:16.
- **Reel da foto:** Blotato monta le 3–5 foto in un MP4 9:16. Il video torna in stato `ready_for_review`, deve essere visto in Anteprima e approvato una seconda volta; non viene mai pubblicato appena generato.
- **`app/api/generate/plan/route.ts`**: MP4 vincolato ai formati video, marcatura manuale (`auto|carosello|reel|story|post`) rispettata, mix formati e numero generazioni derivati dallo stesso pacchetto. Settimanale e mensile sono separati: Crescita = 6/24, Presenza = 4/16 salvo quota cliente esplicita.
- **Fallback generazione:** un blocco AI riuscito viene conservato. Ogni elemento mancante diventa uno slot `ERRORE_MANUALE` con prefisso nota `[GENERATION_FALLBACK]`, mantenendo data, canale, formato e media. Il popup finale mostra quanti elementi sistemare e apre `/dashboard/calendario?filter=ERRORE_MANUALE`. Dal dettaglio si può correggere manualmente o usare `POST /api/data/calendario/[id]/regenerate`; il risultato torna sempre `DA_APPROVARE`, mai direttamente in pubblicazione.
- **Calendario:** giorni cliccabili; trascinamento tramite maniglia verso griglia, barra settimanale o intestazione del giorno; spostamento multiplo con data e ora opzionale. `DA_APPROVARE`, bozze ed errori sono spostabili; elementi già sincronizzati/pubblicati richiedono prima il requeue. Copy/media/audio Reel sono modificabili e visibili in anteprima prima dell'approvazione.
- **Audio Reel:** upload separato MP3/WAV/M4A/OGG (25 MB) dal piano o dai dettagli calendario, assegnato esclusivamente ai Reel e mostrato con player in anteprima. La migrazione 042 persiste sorgente/licenza e stato del render audio. L'incorporamento nel video finale via template Blotato `Combine Clips` richiede autorizzazione esplicita al trasferimento dell'audio al servizio esterno.
- **`lib/pacchetti.ts`** (vetrina commerciale, campo `piano`) e **`lib/packages.ts`** (generazione, campo `pacchetto`) sono **due sistemi paralleli** che oggi coincidono solo perché allineati a mano — da unificare prima di avere molti clienti.
- Ogni punto di creazione cliente (`lib/provisioning.ts` per l'attivazione registrazione, `app/api/data/clienti` POST per l'onboarding manuale) deve impostare `pacchetto`+`contenuti_mese` derivandoli dallo stesso mapping piano→pacchetto — trovati e corretti bug identici in entrambi i punti (quota rimasta al default schema 30 invece che 16/24).

## Blotato (pubblicazione social) — multi-cliente, workspace condiviso
Il workspace Blotato ospita gli account di **più clienti reali insieme** (SILKinCOM, Studio Legale BCS, SWA — l'agenzia stessa) più altri brand gestiti dallo stesso studio. **Mai scegliere un account implicitamente**: `lib/blotato-accounts.ts` fallisce chiuso (`pickAccount`/`pickSubaccount`) se per una piattaforma ci sono più account/Pagine senza una scelta esplicita salvata (`settings.blotato_account_<canale>` / `blotato_subaccount_<canale>`). Anteprima sola-lettura in scheda cliente ("Account Blotato — dove verranno pubblicati i contenuti") prima di qualunque test live.
- **Endpoint corretto**: `GET /v2/users/me/accounts` (non `/v2/accounts`, che risponde 404 — bug trovato e corretto, non era un problema di chiave). Sotto-destinazioni (Facebook Page/Pinterest board/LinkedIn Company Page) via `GET /v2/users/me/accounts/{id}/subaccounts`, chiamata separata per account.
- **Gate di pubblicazione**: `PUBLISH_ENABLED` (env) + `dry_run` per cliente (settings) — entrambi devono essere sbloccati. Default fail-safe: valore mancante o non `FALSE` esplicito = dry-run.
- **Payload Instagram:** massimo 5 hashtag applicato anche al payload finale; per le Story `firstComment` è sempre rimosso perché non supportato.
- **Payload Facebook:** la Page (`target.pageId`) viene sempre risolta e validata anche se la riga conserva gia `platform_account_id`; non esiste piu il fallback col solo account. `video` usa `mediaType=video`, Reel/Short usa `mediaType=reel`, Post/Carosello non impostano `mediaType`. Le Story Facebook sono bloccate dal pre-flight perche il contratto Blotato Facebook non espone quel formato.
- **Riconciliazione reale:** `POST /api/data/blotato-reconcile` interroga `GET /v2/posts/{postSubmissionId}` per ogni invio del mese e aggiorna `published`, `failed`, `scheduled` o `in-progress`, URL pubblico ed errore. Il pulsante **Verifica Blotato** mostra pubblicati confermati, in coda, non inviati, falliti, mancanti da creare e mancanti da pubblicare rispetto a `clienti.contenuti_mese`. Anche **Sincronizza Blotato** esegue la riconciliazione dopo l'invio. Non contare mai `scheduled` come pubblicato.
- **Retry pubblicazione:** `Riprova pubblicazione` azzera ID/stato remoto solo quando il tentativo e realmente `failed`/`ERRORE`; poi lo scheduler puo creare una nuova submission. Prima lasciava il vecchio `blotato_post_id`, quindi il click non reinviava nulla. Non azzera mai contenuti ancora `scheduled` o gia `published`.
- **Pagina Facebook SWA** ("Social Web Automation", account id `44606`) configurata in questa sessione: Pagina business collegata, Instagram, sito aggiuntivo e indirizzo. La denominazione pubblica e legale da usare è **Social Web Automation di Marco Dibenedetto**. Verificare che l'Impressum Meta non conservi la vecchia dicitura.
- Per gli invii storici usare prima **Verifica Blotato**. Non azzerare un `blotato_post_id` fermo su `scheduled` finché non è stato controllato sul social/Blotato: il requeue può altrimenti duplicare un post già uscito.

## Verifiche 2026-08-25
- `npm run build`: passa; restano 2 warning lint preesistenti in moduli non toccati.
- Landing verificata con Playwright su Home, Servizi, Pacchetti, `/en`, `/en/services` e `/en/pricing` a 1440×1000 e 390×844: tutte le route rispondono 200, nessun errore console e nessun overflow orizzontale.
- Playwright: popup fallback → filtro esatto → modifica/rigenerazione → anteprima → `DA_APPROVARE`, senza pubblicazione automatica; consuntivo pacchetto Blotato verificato con API mock.
- Checkout/Home/Chi siamo/Pilot Lead verificati con Playwright a 1440 px e mobile: nessun errore console e nessun overflow orizzontale.
- Deploy produzione commit `5d10c7c` online su `https://www.socialautomation.app`: Home, Chi siamo, pagina Pilot e i tre checkout rispondono 200. La migration 043 è applicata e la tabella ordini risponde correttamente.
- **Gate pagamenti:** nel progetto Vercel LIVE mancano ancora `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET`; il backend fallisce chiuso con HTTP 503 prima di creare l'ordine. Non dichiarare i checkout operativi finché entrambe le env non sono configurate e il webhook Stripe non è testato.
- Server locale di prova della sessione: `http://127.0.0.1:3112` (processo temporaneo, non URL pubblico).
- Commit principali: `4014da5`, `9fbaa1e`, `81f9ef3`, `da439a5`, `d0869de`, `70d9ef6`.

## Da completare
1. **Blocco go-live pagamenti:** aggiungere su Vercel `STRIPE_SECRET_KEY` LIVE e `STRIPE_WEBHOOK_SECRET`, configurare in Stripe l'endpoint `https://www.socialautomation.app/api/stripe/webhook`, quindi eseguire un acquisto reale controllato e verificare ordine, email e Customer Portal.
2. GitHub → repo variable `APP_BASE_URL` = dominio Vercel (per il cron).
3. **Sicurezza:** gli account `admin` e `cliente` usano ancora la password di default `1234567` — cambiarle prima del go-live.
4. Spegnere Render solo dopo che Vercel è verificato (media e dati sono già su Supabase).
5. Eseguire **Verifica Blotato** sul mese corrente e risolvere gli stati `failed`/`scheduled` passati prima di rimetterli in coda.
6. Verificare `PUBLISH_ENABLED=true`, `dry_run=FALSE`, API key e account/subaccount fissati per cliente prima di una pubblicazione reale. Il primo test va fatto con **Sincronizza questo** su un solo contenuto.
