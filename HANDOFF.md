# Handoff - Social Automation V2

Data: 2026-05-23
Progetto: Social Automation — software/servizio gestito (primo cliente test: SILKinCOM)
Repo: https://github.com/Marco26-hub/Post.git
Percorso locale: `/Users/md/Downloads/social_automation_v2`

## Stato Attuale

Il progetto e una dashboard Next.js 15 per gestire automazione social con Supabase, n8n, Claude e Blotato.

La preview locale funziona su:

```bash
http://localhost:3000
```

La build produzione e stata verificata con env di test e passa:

```bash
npm run build
```

Nota: il file `.env.local` locale contiene placeholder di test. Prima del deploy vanno sostituiti con valori Supabase reali.

## Cosa E Gia Pronto

- Dashboard Next.js con pagine admin.
- Login Supabase.
- Calendario contenuti con approvazione.
- Log pubblicazioni.
- Catalogo prodotti.
- Settings automazione.
- Pagine generatori social per canale.
- Sezione piano editoriale.
- Sezione SEO/GEO audit.
- Multi-cliente con selettore cliente attivo.
- Multiutente con accessi per cliente e RLS.
- Schema Supabase con migration SQL.
- Workflow n8n per generazione, validazione, pubblicazione, report, blog e audit.
- Workflow pubblicazione `SOCIAL_C_PUBBLICA_APPROVATI` rinforzato per uso produzione.
- Strategia pacchetti e prezzi in `PACCHETTI-VENDITA.md`.
- Brochure commerciale cliente in Markdown, HTML e PDF.
- Landing premium vendita servizi su `/servizi`.

## File Importanti

- Frontend: `app/`, `components/`, `lib/`
- Schema DB: `supabase/migrations/001_initial_schema.sql`
- Blog/SEO DB: `supabase/migrations/002_blog_seo.sql`
- Multi-cliente/multiutente DB: `supabase/migrations/003_multi_tenant.sql`
- Workflow n8n: `n8n_workflows/`
- Workflow pubblicazione Blotato: `n8n_workflows/SOCIAL_C_PUBBLICA_APPROVATI.json`
- Config progetto: `package.json`, `next.config.ts`, `tailwind.config.ts`
- Pacchetti/prezzi: `PACCHETTI-VENDITA.md`
- Brochure modificabile: `BROCHURE.md`
- Brochure grafica: `brochure.html`
- Brochure PDF: `brochure.pdf`
- Landing servizi: `app/servizi/page.tsx`, `app/servizi/servizi.module.css`

## DB Supabase

La struttura DB per la gestione post admin e pronta a livello schema.

Tabelle principali:

- `calendario`
- `log_pubblicazioni`
- `prodotti`
- `account_social`
- `promo`
- `settings`
- `brand`
- `blog_articoli`
- `seo_audit`
- `clienti`
- `profiles`
- `user_client_access`

Da eseguire su Supabase SQL Editor:

```sql
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_blog_seo.sql
supabase/migrations/003_multi_tenant.sql
```

La migration 003 crea il cliente test `SILKinCOM` (primo cliente del software Social Automation), aggiunge `cliente_id` alle tabelle operative, crea RLS multiutente e assegna gli utenti Supabase esistenti al cliente test come `owner`. SILKinCOM è solo un seed di esempio — il software si chiama Social Automation.

Dopo le migration, creare almeno un utente admin in Supabase Auth se non esiste gia.

## Multi-cliente / Multiutente

Ora l'admin supporta piu clienti in modo tenant-aware:

- dopo login l'utente arriva su `Dashboard -> Clienti`
- pagina `Clienti` collegata a Supabase
- cookie `active_cliente_id` per il cliente selezionato
- selettore cliente nella sidebar
- dashboard, calendario, prodotti, log, settings, social, SEO e piano filtrano per cliente
- webhook n8n ricevono `cliente_id`
- workflow n8n leggono/scrivono dati per cliente

Per iniziare a lavorare, l'utente seleziona un cliente nella pagina `Dashboard -> Clienti` e viene portato alla dashboard filtrata su quel cliente. Per aggiungere un nuovo cliente, usare la stessa pagina. La creazione usa la RPC `create_cliente_for_current_user`, che assegna l'utente corrente come `owner`.

## Pacchetti Vendita

Il file `PACCHETTI-VENDITA.md` contiene il listino consigliato allineato alla concorrenza online 2026.

Pacchetti principali:

- Presenza Social: 490 euro setup + 590 euro/mese.
- Sito + Social Start: 1.900 euro setup + 790 euro/mese.
- Crescita Business: 3.900 euro setup + 1.290 euro/mese.
- E-commerce Attivo: 6.900 euro setup + 1.990 euro/mese.
- Dominio Digitale: da 9.900 euro setup + da 2.900 euro/mese.

Regola commerciale: il cliente compra il servizio gestito, non il motore interno. Workflow, prompt, automazioni, chiavi API e logica strategica restano proprieta Social Automation.

L'approvazione cliente e opzionale e attivabile solo dall'admin. Non va venduta come revisione infinita: ogni pacchetto deve avere un limite chiaro di revisioni incluse.

## Brochure Commerciale

Sono disponibili tre versioni:

- `BROCHURE.md`: testo modificabile (brand Social Automation).
- `brochure.html`: versione grafica stampabile A4 (6 pagine, palette indigo/viola/oro).
- `brochure.pdf`: versione pronta da inviare al cliente.

La brochure e pensata per il cliente finale: non contiene dettagli tecnici interni su workflow, chiavi API o motore AI.

## Landing Premium

La pagina pubblica `/servizi` e dedicata alla vendita dei servizi Social Automation:

- hero commerciale premium
- problema/soluzione
- pacchetti con prezzi
- metodo operativo
- approvazione controllata
- extra e FAQ
- CTA consulenza

La landing non richiede login ed e pensata per essere usata online come pagina vendita. Il link e presente anche nella home preview.

## Env Locali E Deploy

Frontend/Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

n8n:

```bash
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
```

Nota importante: `SUPABASE_SERVICE_ROLE_KEY` nel frontend e `SUPABASE_SERVICE_KEY` in n8n devono contenere lo stesso valore service role.

## n8n E Blotato

Il workflow critico e:

```bash
n8n_workflows/SOCIAL_C_PUBBLICA_APPROVATI.json
```

Fa:

- legge contenuti `APPROVATO`
- verifica orario pubblicazione
- controlla campi obbligatori
- controlla review umana
- controlla media validato
- controlla account social attivo
- controlla stock prodotto
- controlla promo
- costruisce UTM
- imposta lock pubblicazione
- invia a Blotato
- aggiorna `PUBBLICATO`
- scrive log
- gestisce retry/errori

Migliorie gia applicate:

- controllo `platform_account_id`
- controllo almeno un media URL
- successo Blotato valido solo con `id` o `postId`
- reset `publish_lock_id` su successo
- reset `errore_tecnico` su successo
- retry con lock pulito a `null`

Per pubblicare davvero su Blotato servono:

- credential n8n `BLOTATO`
- credential n8n `SUPABASE`
- variabili n8n configurate
- righe in `account_social` con `platform_account_id` corretto
- post in `calendario` con status `APPROVATO`
- `settings.dry_run = FALSE`

## Checklist Collaudo Finale

1. Inserire chiavi vere in `.env.local`.
2. Eseguire le migration su Supabase.
3. Creare utente admin Supabase.
4. Configurare Vercel con le 3 env frontend.
5. Importare workflow n8n.
6. Configurare variabili n8n.
7. Configurare credential `SUPABASE`.
8. Configurare credential `BLOTATO`.
9. Popolare `account_social`.
10. Popolare almeno un prodotto in `prodotti`.
11. Creare un contenuto test in `calendario`.
12. Validare media con `SOCIAL_J_VALIDA_MEDIA`.
13. Approvare contenuto da dashboard.
14. Eseguire `SOCIAL_C_PUBBLICA_APPROVATI`.
15. Verificare passaggio `APPROVATO -> IN_PUBBLICAZIONE -> PUBBLICATO`.
16. Verificare `blotato_post_id`.
17. Verificare riga in `log_pubblicazioni`.

## Stato Git

Al momento risultano modificati:

- `README.md`
- `app/page.tsx`
- `components/AIModelSelector.tsx`
- `n8n_workflows/SOCIAL_C_PUBBLICA_APPROVATI.json`
- `supabase/migrations/003_multi_tenant.sql`
- `components/ClienteSelector.tsx`
- `lib/tenant/client.ts`
- `lib/tenant/server.ts`

Nuovo file:

- `HANDOFF.md`

Prima di fare commit, rivedere il diff completo e confermare che le modifiche a `app/page.tsx` e `components/AIModelSelector.tsx` siano intenzionali.

## Prossimo Passo Consigliato

Fare un test end-to-end reale con un solo post Instagram in dry run, poi con Blotato attivo. Dopo il primo successo, replicare su Facebook, TikTok, Pinterest, LinkedIn e YouTube Shorts.
