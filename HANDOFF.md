# HANDOFF — Social Web Automation

Stato al 2026-08-31 (sera). Piattaforma SaaS di social media automation con AI (Next.js 15, App Router).

## Sessione 2026-08-31: partenza campagna Caso Studio Bowling

Contesto: la strategia del cliente `swa` parte il 1 settembre. La generazione del
piano mensile falliva, e da li e emersa una catena di difetti. Tutto risolto e in
produzione (26 commit, da `69c9512` a `6449461`). Quello che segue serve a non
riaprire strade gia percorse.

### Generazione del piano — cosa era rotto e come e stato chiuso

- **Il timeout valeva per OGNI modello della cascata**, non per la richiesta: un
  blocco poteva spendere 300s mentre il browser mollava a 140s, e la funzione
  continuava a scrivere DOPO l'errore (rischio piano doppio al rilancio).
  `callAI` ora accetta `deadlineAt`, la route ha un budget (215s mensile / 135s
  settimanale) e il client aspetta sempre di piu del server.
- **Ogni settimana viaggia in DUE blocchi da 6**, non in uno da 12: con una
  cartella campagna e qualita high il JSON superava il tetto di token e tornava
  troncato, o veniva abortito. Le due meta girano in parallelo: stessa attesa,
  meta del rischio. `mixIndice/mixBlocchi` (8 blocchi) governano i formati,
  `faseIndice/faseBlocchi` (4 settimane) la fase del funnel: sono separati apposta.
- **Il retry compatto toglieva lo schema esteso**, quindi anche `scenes` e
  `slides` che il cancello narrativo poi pretendeva: JSON troncato -> retry ->
  zero scene -> 20 contenuti su 24 parcheggiati. Ora il fallback accorcia i campi
  strategici ma tiene la struttura obbligatoria.
- **La fase 2 si ancorava a "oggi + 14 giorni"**: ora riprende dal giorno dopo
  l'ultimo contenuto pianificato. L'ancora e a mezzogiorno UTC perche `addDays`
  conta in ora locale e `fmtDate` legge UTC.
- I gruppi della cartella si distribuiscono per **concetto**, non per gruppo:
  Instagram e Facebook dello stesso contenuto sono chiavi diverse e a rotazione
  finivano in blocchi diversi, quindi in giorni diversi.

### Cancelli (gate) — erano fail-closed su contenuti validi

- `sequenceText` leggeva solo meta degli alias: un carosello con 5 slide scritte
  con `overlay_text` (inglese) veniva bocciato per "slide duplicate". E il
  conteggio dei duplicati trasformava in duplicato QUALUNQUE elemento senza testo
  riconosciuto. Ora conta i duplicati veri.
- **`campaign_content_key` mancava fra le colonne dello storico**, quindi
  l'esenzione per le varianti coordinate non poteva scattare: il gemello
  Instagram di un contenuto Facebook risultava "somiglianza 100%" con se stesso.
- **Quando le creativita esistono gia, la sequenza si DERIVA dai media**
  (`lib/derive-sequence.ts`): chiedere all'AI di descrivere cinque immagini che
  sono sul disco, e bloccare il contenuto se non lo fa, fermava caroselli
  completi. Se i media non bastano non deriva nulla e il cancello resta severo.
- La **rigenerazione singola** accetta ora anche `[NARRATIVE_GATE]` e
  `[NOVELTY_GATE]` (prima solo `[GENERATION_FALLBACK]`: gli altri due erano un
  vicolo cieco), riceve il motivo del blocco, e **ricontrolla** il risultato —
  senza il ricontrollo sarebbe un lavaggio.
- La rigenerazione **non aveva alcun controllo anti-clone** e riscriveva proprio
  l'hook: ha prodotto 4 contenuti con hook gia usati. Ora riceve gli hook in uso
  e passa dallo stesso metro del piano.

### Pubblicazione

- **Le colonne `date` tornano come stringa** (`types.setTypeParser(1082)`): il
  parser di pg le costruiva a mezzanotte LOCALE mentre `toYmd` legge UTC, quindi
  fuori da UTC ogni data del calendario slittava indietro di un giorno.
- La caption dei formati video veniva tagliata con `slice(0, 300)`, a meta
  parola. Ora `lib/caption-limits.ts` chiude sull'ultima frase o sull'ultima
  parola intera con i puntini. Il limite vive in un posto solo e alimenta anche
  le regole di scrittura.
- La sincronizzazione **si ferma prima del tetto di 5 minuti** e dichiara quanti
  contenuti restano: il ciclo veniva ucciso a meta, la risposta non arrivava, e i
  contenuti gia lavorati sparivano dagli approvati (tornano in Da approvare per
  la revisione del montaggio, che e voluta).

### Interfaccia — cosa e nuovo in /dashboard/calendario

- **Verifica piano**: referto del ciclo di 28 giorni (non del mese solare, i
  blocchi partono da oggi) con nove controlli. `lib/plan-audit.ts`.
- **Sposta piano**: spostamento di N giorni oppure "riparti dal giorno X".
  Anteprima obbligatoria; non tocca mai i contenuti gia inviati a Blotato e
  rifiuta INTERO uno spostamento che finirebbe nel passato. `lib/plan-shift.ts`.
- **Rigenera diverso** sui contenuti sani, **Rimuovi** sulla traccia audio.
- Anteprima Reel senza le barrette segmentate delle Story.

### Regole di scrittura aggiunte

Lunghezza caption per formato, igiene degli hashtag (solo nel campo hashtag, max
5, niente hashtag-frase), e l'obbligo di **proseguire il testo gia impresso sulle
immagini** quando i media vengono da una cartella campagna.

### Aperto — da fare

1. **Il `PIANO-EDITORIALE.json` della cartella non entra nel sistema.** Contiene
   `intent` e `visual_brief` per contenuto: senza, il modello scrive attorno alle
   immagini invece che dal brief. E la causa dello scollamento fra hook e visual.
2. **Generatore immagini in blocco**: oggi `Genera immagine AI` funziona su un
   contenuto solo e non vede ne il DNA mensile ne le immagini vicine, quindi
   produce buone immagini singole, non una griglia coerente. Serve tetto di spesa.
3. **12 contenuti hanno ancora `tema = "Slot del piano da completare"`**: residuo
   dei fallback, visibile come etichetta in calendario.
4. **Audio**: i 28 MP3 sono i brani INTERI (4-5 minuti), non estratti. Le clip
   tagliate a 15s (reel) e 9s (story) con fade sono pronte in
   `04_Sorgenti/audio/clip_pronte/` ma vanno caricate a mano. Licenza Pixabay
   verificata e scritta sui contenuti; due tracce senza pagina confermata
   (**Upbeat Lead 231424** e **Spider The Band 282981**).
5. Due clienti quasi omonimi, `swa` (24 contenuti) e `SWA` (vuoto): rinominare o
   cancellare quello inutilizzato.

## Memoria operativa campagne SWA

### Struttura cartelle canonica

Per ogni strategia mensile destinata a Instagram e Facebook usare sempre questa struttura, senza mischiare media, copy e documenti strategici:

```text
<CAMPAGNA>/
  04_CRESCITA_Per_Strategia/
    Instagram/
      01_ATTENZIONE/
      02_FIDUCIA/
      03_SCELTA/
      04_AZIONE/
    Facebook/
      01_ATTENZIONE/
      02_FIDUCIA/
      03_SCELTA/
      04_AZIONE/
    audio/
```

Dentro ogni fase, ogni contenuto ha una cartella autonoma con nome numerato e descrittivo:

```text
REEL_01_NOME_CONTENUTO/
  REEL_01_COVER.png
  REEL_01_SCENA_01.png ... REEL_01_SCENA_05.png
  AUDIO_REEL_01_NOME.mp3

CAROSELLO_02_NOME_CONTENUTO/
  CAROSELLO_02_SLIDE_01.png ... CAROSELLO_02_SLIDE_05.png

STORY_03_NOME_CONTENUTO/
  STORY_03_FRAME_01.png ... STORY_03_FRAME_03.png
  AUDIO_STORY_03_NOME.mp3

POST_04_NOME_CONTENUTO/
  POST_04.png
```

Regole permanenti:

- duplicare la stessa gerarchia per `Instagram` e `Facebook`, mantenendo file distinti per piattaforma;
- ordinare ogni contenuto con il numero editoriale globale 01-24, non con il formato;
- mantenere la corrispondenza tra numero, fase, settimana, copy e media;
- usare `04_Sorgenti` per storyboard e materiali originali, `05_Script_Reel` per gli script, `06_Copy` per copy e CTA, `07_Audio` per audio e licenze, `08_QA` per validazione;
- non caricare `00_Strategia`, sorgenti, script, copy o QA come media nel piano SWA;
- tenere audio e media dentro la cartella del contenuto quando devono essere associati automaticamente;
- non rinominare o spostare una cartella dopo l'import senza aggiornare manifest e numeri;
- la cartella `04_CRESCITA_Per_Strategia` della campagna Bowling esistente conserva il vecchio mix consumer; per il nuovo Caso Studio Bowling usare la stessa struttura ma il mix strategico aggiornato: 10 Reel, 6 caroselli, 4 Story e 4 post.

Percorso di riferimento verificato: `/Users/md/Documents/SWA/CRESCITA_Campagna_Mese_04_Bowling/04_CRESCITA_Per_Strategia/`.

### Caso Studio Bowling - direzione corrente

La campagna parla a titolari e gestori di bowling e usa il bowling come caso studio per vendere i servizi SWA. Non deve invitare i giocatori a prenotare o giocare. Mix: 10 Reel, 6 caroselli, 4 Story e 4 post, per 24 contenuti. Direzione visuale: fotografia professionale/editoriale, forest `#223F2C`, ink `#10120E`, gold `#D6A839`, rust `#A8532D`, cream `#FFFAF0`. Hook e CTA vengono composti graficamente in safe area; nessun watermark Canvas, riquadro bianco invasivo o interazione simulata.

Pacchetto finale verificato: `/Users/md/Documents/SWA/CRESCITA_Campagna_Mese_04_CASO_STUDIO_BOWLING_SWA/`. Contiene 24 concept completi per Instagram e Facebook: 10 Reel x 5 scene, 6 caroselli per 32 slide complessive, 4 Story x 3 frame e 4 post. Totale: 196 PNG finali, 28 audio e 98 master unici. ZIP pronto in `/Users/md/Downloads/CRESCITA_Campagna_Mese_04_CASO_STUDIO_BOWLING_SWA.zip`; PDF lead magnet in `/Users/md/Downloads/Mappa-Regia-Bowling-SWA.pdf`.

Il piano editoriale corrente e la distinta visuale sono in `/Users/md/Documents/SWA/CRESCITA_Campagna_Mese_04_CASO_STUDIO_BOWLING_SWA/00_Strategia/PIANO-EDITORIALE.md` e `PIANO-EDITORIALE.json`. La regia e ordinata in quattro fasi: diagnosi/ATTENZIONE, dimostrazione/FIDUCIA, servizio+obiezioni/SCELTA, strumenti+contatto/AZIONE. Il vecchio hook "Ho analizzato una serata, ecco 5 contenuti" e stato sostituito perche autoreferenziale.

**Gate visuale chiuso il 2026-08-31:** `scripts/build-case-study-bowling-package.mjs` ha ricostruito il pacchetto e `scripts/validate-case-study-bowling-package.mjs` ha confermato `PASS: 24 contenuti, 196 PNG, 28 audio, 98 master`. Il builder esegue il validatore automaticamente e rifiuta master o sequenze duplicate. L'ultimo audit ha inoltre rilevato `0` hook identici, `0` collisioni semantiche oltre soglia e `0` hash immagine duplicati: Reel 05 tratta il costo dell'improvvisazione, Reel 22 il flusso brief-pubblicazione e Post 24 il prossimo mese con regia, senza riciclare il carosello diagnostico o la promessa del Reel 02.

## Stack
- **Frontend/Backend:** Next.js 15.5 (App Router), React 19, Tailwind. Deploy su **Vercel**.
- **DB:** **Supabase** Postgres. Accesso via SQL raw (`lib/db.ts`, driver `pg`, helper `q()/q1()`). Nessun ORM.
- **Storage media:** **Supabase Storage** (bucket pubblico `media`), via S3-compatible + `aws4fetch` (`lib/storage.ts`).
- **Auth:** NextAuth (JWT, `CredentialsProvider`, bcrypt su `profiles`). Secret `AUTH_SECRET`.
- **AI:** SOLO OpenRouter (testo + immagini via /api/v1/images), `lib/ai.ts`. Key server o per-browser.
- **Scheduling:** GitHub Actions cron (`.github/workflows/agenti-cron.yml`, lun 07:00 UTC) → chiama `/api/agents/*` con `CRON_SECRET`.

## Database
- Migrazioni in **`db/migrations/`** (001–048; la **003 non esiste**: buco storico nella numerazione, il runner ordina per nome file e non se ne accorge — non reintrodurla). Runner: `npm run migrate` (usa `DIRECT_DATABASE_URL`, invia ogni file intero a Postgres). `npm run migrate:dry` per il dry-run. La 047 aggiunge `strategy_profile`, la 048 `business_category`; il codice usa introspezione dinamica nel piano per restare compatibile durante il rollout.
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
- **Regia deterministica per slot:** `lib/editorial-content-direction.ts` assegna prima dell'AI a ogni card un lavoro commerciale, fase funnel, angolo, archetipo hook, prova, arco narrativo, firma visuale, CTA, famiglia hashtag e adattamento canale. La firma include settimana e concept, quindi due fasi lanciate separatamente non possono riciclare la stessa regia. Le coppie IG/FB condividono il concept e gli asset dichiarati, ma hook, caption, CTA e blocco hashtag devono essere adattati.
- **Profili realmente collegati:** `lib/strategy-profiles.ts` non e piu solo configurazione inutilizzata. Piano e rigenerazione risolvono `SWA servizi`, `SilkInCom e-commerce`, `ristorante` o `Caso Studio Bowling` dai dati del cliente e dal nome/percorso della cartella; il contesto campagna ha precedenza sul settore anagrafico quando SWA usa una nicchia come caso studio.
- **Gate anti-residuo e anti-clone:** non viene piu persistito `tema = "Slot del piano da completare"`; il fallback conserva una direzione editoriale concreta e resta in `ERRORE_MANUALE`. Il novelty gate blocca hook/caption/hashtag copiati fra piattaforme, blocchi hashtag completi riciclati e somiglianze fra concept diversi.
- **Audit dell'intero ciclo:** `lib/plan-audit.ts` controlla APPROVATI e DA_APPROVARE insieme e ora segnala anche segnaposto, URL media riutilizzate fra concept, adattamenti IG/FB copiati, blocchi hashtag ripetuti e firme visuali duplicate. Le coppie coordinate dello stesso `campaign_content_key` sono escluse dal riuso media legittimo.
- **Contratto narrativo:** `lib/format-narrative.ts` governa Reel (hook, tensione, prova, payoff, CTA/loop), Carosello (cover, problema, sviluppo/prova, payoff, CTA), Story (apertura, sviluppo, risoluzione/CTA) e Post (hook visuale, prova, takeaway, CTA). Per Crescita/High il `NARRATIVE_GATE` manda in `ERRORE_MANUALE` sequenze incomplete o duplicate invece di approvarle. Il gate legge anche gli alias italiani che la route gia accetta (`messaggio_chiave`, `didascalia`, `call_to_action`) e le sequenze serializzate come stringa JSON: un campo scritto in italiano non e un contenuto incompleto. `short` e `video` seguono lo stesso contratto a 5 scene del Reel, e `lib/content-quality.ts` lo chiede esplicitamente al modello per entrambi.
- **Identita campagna:** ogni root importata riceve un `campaignKey` stabile; chiavi contenuto, gruppi media, audio e DNA mensile sono scoped alla campagna. Due campagne nello stesso mese possono quindi convivere senza fondere `REEL_01`/`CAROSELLO_01`; una nuova fase della stessa campagna continua invece la sequenza esistente. La chiave nasce dal **nome della cartella radice**: caricare direttamente una sottocartella (`Settimana_02`) o rinominare la radice crea una campagna nuova. Con piu campagne nello stesso caricamento il DNA mensile si ancora alla chiave minore in ordine alfabetico (scelta deterministica, non "la prima arrivata"). Senza cartella campagna il seme resta quello storico `cliente:brand`, cosi il DNA dei clienti che non importano cartelle non si sposta.
- **Fallback generazione:** un blocco AI riuscito viene conservato. Ogni elemento mancante diventa uno slot `ERRORE_MANUALE` con prefisso nota `[GENERATION_FALLBACK]`, mantenendo data, canale, formato, media e distinta editoriale concreta. Il popup finale mostra quanti elementi sistemare e apre `/dashboard/calendario?filter=ERRORE_MANUALE`. Dal dettaglio si può correggere manualmente o usare `POST /api/data/calendario/[id]/regenerate`; anche la rigenerazione applica profilo, direzione per-slot e gate anti-clone.
- **Calendario:** giorni cliccabili; trascinamento tramite maniglia verso griglia, barra settimanale o intestazione del giorno; spostamento multiplo con data e ora opzionale. `DA_APPROVARE`, bozze ed errori sono spostabili; elementi già sincronizzati/pubblicati richiedono prima il requeue. Copy/media/audio Reel sono modificabili e visibili in anteprima prima dell'approvazione.
- **Audio Reel:** upload separato MP3/WAV/M4A/OGG (25 MB) dal piano o dai dettagli calendario, assegnato esclusivamente ai Reel e mostrato con player in anteprima. La migrazione 042 persiste sorgente/licenza e stato del render audio. L'incorporamento nel video finale via template Blotato `Combine Clips` richiede autorizzazione esplicita al trasferimento dell'audio al servizio esterno.
- **Storage cliente e pulizia:** `uploads/<cliente_id>/` su Supabase Storage e indipendente dal calendario — **cancellare i contenuti non libera un byte**. `lib/asset-cleanup.ts` elimina solo cio che non e referenziato da un contenuto e, per default, protegge anche l'ultimo caricamento (gruppo di file entro 30 minuti): dopo un import in un colpo solo la pulizia normale trova quindi 0 orfani. Il pulsante **Libera tutto lo spazio non usato** (pagina Piano) chiama la stessa API con `preserva_ultimo_caricamento: false` proteggendo esplicitamente i media selezionati nel piano; e l'unico modo dall'interfaccia per recuperare lo spazio dell'ultimo import. `proteggi_url` non viene piu troncato in silenzio: oltre 1000 URL l'API risponde 400 invece di cancellare i media che doveva proteggere. La barra di capienza somma **tutti** gli oggetti del prefisso, e la pagina dichiara a parte i file con estensione non riconosciuta (`.mov`, `.heic`, …) che occupano spazio senza comparire in nessun elenco.
- **`lib/pacchetti.ts`** (vetrina commerciale, campo `piano`) e **`lib/packages.ts`** (generazione, campo `pacchetto`) sono **due sistemi paralleli** che oggi coincidono solo perché allineati a mano — da unificare prima di avere molti clienti.
- Ogni punto di creazione cliente (`lib/provisioning.ts` per l'attivazione registrazione, `app/api/data/clienti` POST per l'onboarding manuale) deve impostare `pacchetto`+`contenuti_mese` derivandoli dallo stesso mapping piano→pacchetto — trovati e corretti bug identici in entrambi i punti (quota rimasta al default schema 30 invece che 16/24).

## Punto di ripristino (2026-08-28)

Prima dei fix dell'audit, lo stato di produzione funzionante era il commit **`c437f64`**.
Due vie di ritorno, indipendenti:

- **Git:** tag `backup-pre-audit-2026-08-28` su `c437f64`, pushato su origin.
  Ripristino: `git checkout backup-pre-audit-2026-08-28` (oppure `git reset --hard` di `main` su quel tag).
- **Vercel:** deployment di produzione `dpl_8rN3iy5XZkDScY5arqdMgdHmZAGM`
  (`social-media-1wt52nuz5`), marcato `isRollbackCandidate: true`.
  Ripristino istantaneo dal dashboard Vercel → Deployments → Promote to Production,
  senza passare da un nuovo build.

Env var aggiunte in questa sessione (non sono nel repo): `VERCEL_SUPPORT_LARGE_FUNCTIONS=1`
su Production e sul branch di preview `fix/audit-sicurezza-e-render-remotion`. Alza il tetto
del bundle della funzione da 250 MB a 5 GB: serve perche il Chromium di Remotion pesa 193 MB.
Rimuoverla fa tornare l'errore di dimensione, non un errore di codice.

## Pipeline editoriale premium — Remotion + import campagne (2026-08-27/28)
- **Rendering video Remotion:** `lib/remotion-renderer.ts` sostituisce il montaggio via Blotato per i Reel generati dalla pipeline premium. Bundle Remotion (`@remotion/bundler`) + `renderMedia`/`selectComposition` (`@remotion/renderer`), composizione in `remotion/SwaSocialVideo.tsx` (max 10 immagini, preset motion `trending|premium|minimal|classico`, hook/CTA/logo/brand testuali, audio opzionale con volume musica configurabile). Output caricato su Supabase Storage (`lib/storage.ts`). Hash sorgente deterministico (`remotionSourceHash`) per evitare re-render identici. Build ora richiede `npm run remotion:browser` (`scripts/ensure-remotion-browser.mjs`) prima di `next build` — verificare che l'ambiente Vercel scarichi il browser headless Remotion senza timeout.
- **Import cartelle campagna:** `lib/campaign-folder.ts` interpreta nomi file caricati in blocco (settimana, piattaforma, tag media, chiave contenuto, sequenza) e li assegna agli slot calendario corretti; gestisce anche audio ed errori di parsing per file non riconosciuti. Integrato in `app/dashboard/piano/page.tsx` (upload cartella) e `app/api/generate/plan/route.ts` (creazione slot dai file importati).
- **Migration 044** (`db/migrations/044_campaign_folder_import.sql`): aggiunge a `calendario` le colonne `campaign_content_key`, `campaign_week`, `campaign_source_paths` (tutte nullable, compatibili con piani creati a mano) + indice su `(cliente_id, campaign_week, campaign_content_key)`. **Applicata in produzione il 2026-08-28** sul progetto Supabase `npxtaciwuzkzgiqonhgo`, e registrata in `schema_migrations` col checksum del runner: colonne, constraint `calendario_campaign_week_check` e indice verificati presenti.
- **Fix correlati:** `lib/blotato-visual.ts` — risoluzione corretta del template visual Blotato (bug su template sbagliato in certi casi); `components/PostPreview.tsx` e `lib/publish/schedule.ts` — assegnazione asset campagna e anteprima social allineate al nuovo flusso import.
- Nuovi test: `lib/campaign-folder.test.ts`, `lib/remotion-renderer.test.ts`, `lib/blotato-visual.test.ts`, `lib/editorial-skills.test.ts`, `lib/editorial-variation.test.ts`, `lib/editorial-content-direction.test.ts`, `lib/plan-audit.test.ts`, `scripts/remotion-demo.test.ts`, `scripts/remotion-smoke.test.ts`.

## Rebrand e SEO internazionale (2026-08-25)
- Prodotto rinominato **Social Web Automation** in tutta l'app pubblica (header, footer, email, JSON-LD, checkout, blog) — denominazione legale **Social Web Automation di Marco Dibenedetto**.
- `/en`, `/en/services`, `/en/pricing`: metadata corretti per pagina (prima servivano metadata italiani sulle route inglesi), hreflang reciproci in `middleware.ts`.
- Griglia percorso commerciale in Home completata (`app/page.tsx`).

## Blotato (pubblicazione social) — multi-cliente, workspace condiviso
Il workspace Blotato ospita gli account di **più clienti reali insieme** (SILKinCOM, Studio Legale BCS, SWA — l'agenzia stessa) più altri brand gestiti dallo stesso studio. **Mai scegliere un account implicitamente**: `lib/blotato-accounts.ts` fallisce chiuso (`pickAccount`/`pickSubaccount`) se per una piattaforma ci sono più account/Pagine senza una scelta esplicita salvata (`settings.blotato_account_<canale>` / `blotato_subaccount_<canale>`). Anteprima sola-lettura in scheda cliente ("Account Blotato — dove verranno pubblicati i contenuti") prima di qualunque test live.
- **Endpoint corretto**: `GET /v2/users/me/accounts` (non `/v2/accounts`, che risponde 404 — bug trovato e corretto, non era un problema di chiave). Sotto-destinazioni (Facebook Page/Pinterest board/LinkedIn Company Page) via `GET /v2/users/me/accounts/{id}/subaccounts`, chiamata separata per account.
- **Gate di pubblicazione**: `PUBLISH_ENABLED` (env) + `dry_run` per cliente (settings) — entrambi devono essere sbloccati. Default fail-safe: valore mancante o non `FALSE` esplicito = dry-run.
- **Payload Instagram:** massimo 5 hashtag applicato anche al payload finale; per le Story `firstComment` è sempre rimosso perché non supportato.
- **Payload Facebook:** la Page (`target.pageId`) viene sempre risolta e validata anche se la riga conserva gia `platform_account_id`; non esiste piu il fallback col solo account. `video` usa `mediaType=video`, Reel/Short usa `mediaType=reel`, Post/Carosello non impostano `mediaType`. Poiche il contratto Blotato non espone la Story Facebook nativa, la pipeline monta i frame in MP4 9:16 e la pubblica esplicitamente come Reel video. Le Story Instagram vengono sempre montate in MP4 verticale; i Reel da immagini passano dallo stesso renderer.
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
- **Gate pagamenti:** `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` ora configurate su Vercel LIVE (confermato 2026-08-28). Resta da fare un acquisto reale controllato per verificare ordine, email e Customer Portal end-to-end prima di dichiarare i checkout pienamente operativi.
- Server locale di prova della sessione: `http://127.0.0.1:3112` (processo temporaneo, non URL pubblico).
- Commit principali: `4014da5`, `9fbaa1e`, `81f9ef3`, `da439a5`, `d0869de`, `70d9ef6`.

## Da completare
1. **Pagamenti:** chiavi Stripe configurate su Vercel. Resta da eseguire un acquisto reale controllato e verificare ordine, email e Customer Portal.
2. GitHub → repo variable `APP_BASE_URL` = dominio Vercel (per il cron).
3. **Sicurezza:** gli account `admin` e `cliente` usano ancora la password di default `1234567` — cambiarle prima del go-live.
4. Spegnere Render solo dopo che Vercel è verificato (media e dati sono già su Supabase).
5. Eseguire **Verifica Blotato** sul mese corrente e risolvere gli stati `failed`/`scheduled` passati prima di rimetterli in coda.
6. Verificare `PUBLISH_ENABLED=true`, `dry_run=FALSE`, API key e account/subaccount fissati per cliente prima di una pubblicazione reale. Il primo test va fatto con **Sincronizza questo** su un solo contenuto.
7. Verificare in produzione che le migration 047 (`strategy_profile`) e 048 (`business_category`) siano registrate in `schema_migrations`. `LATEST_REQUIRED_MIGRATION` in `app/api/system/health/route.ts` va allineato alla migration realmente richiesta dal deploy.
8. Verificare che il build Vercel completi `npm run remotion:browser` senza timeout/errori (dipendenza nuova nella pipeline di build, non testata ancora su deploy live).
