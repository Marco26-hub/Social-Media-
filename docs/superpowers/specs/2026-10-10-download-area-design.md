# Area download segreta — design

Data: 2026-10-10 · Stato: approvato a voce, in revisione scritta · Branch: `feat/download-area`

## Scopo

Una campagna social regala materiali a chi la segue: accesso gratuito all'app UGC (con la propria chiave Gemini), guide in PDF, link a repository, video. Chi riceve il link atterra su una pagina del sito SWA che altrimenti non è raggiungibile: nessun pulsante dal sito, nessuna indicizzazione, nessun indirizzo indovinabile.

Successo vuol dire:

- chi ha il link vede la pagina con testata e footer SWA e scarica o apre i materiali senza lasciare l'email;
- chi non ha il link, o ne ha uno vecchio, vede la normale pagina 404 del sito;
- il team carica, modifica, nasconde, ordina ed elimina file e link da `/admin/download` senza toccare il codice né fare deploy;
- il link si può sostituire dal pannello: il vecchio smette di funzionare subito.

Fuori scopo: i testi e i materiali della pagina (si decidono dopo), statistiche di accesso, più codici attivi insieme, raccolta email.

## Decisioni prese

| Tema | Decisione | Motivo |
|---|---|---|
| Accesso | Un solo indirizzo segreto `/download/<codice>`; codice sbagliato o assente → 404 | Scelta del titolare. Il link è la chiave; se trapela si rigenera |
| Contenuti | Schede di due tipi: **file** (su Vercel Blob) e **link** esterno | Servono sia guide PDF sia app UGC e repository |
| Catalogo e codice | Nel database del sito (Postgres), non su Blob | Il vecchio branch teneva `swa-download/catalog.json` pubblico: chiunque vedesse l'indirizzo di un file poteva leggere tutto il catalogo, schede nascoste comprese |
| File | Su Vercel Blob, store pubblico, caricati direttamente dal browser | Logica richiesta dal titolare; evita il limite di 4,5 MB delle funzioni Vercel |
| Template | `PublicHeader` + `PublicFooter` + `FloatingNavigation`, come le altre pagine pubbliche | Il vecchio branch usava un'impaginazione propria |

## 1. Pagina pubblica `/download/[codice]`

File: `app/(it)/download/[codice]/page.tsx` (+ modulo CSS).

- Server component, `dynamic = 'force-dynamic'`. Legge il codice attivo e le schede visibili dal database lato server: non esiste un'API pubblica.
- Codice non valido nel formato, diverso da quello attivo, o nessun codice ancora generato → `notFound()`. La 404 è quella standard del sito: nessun indizio che la pagina esista.
- `/download` senza codice non ha una route: 404.
- Metadata: `robots: { index: false, follow: false, noarchive: true, nocache: true }`, nessun canonical, fuori da `app/sitemap.ts`. In `next.config.mjs`, per `/download/:path*`: `X-Robots-Tag: noindex, nofollow, noarchive`, `Referrer-Policy: no-referrer` e `Cache-Control: private, no-store`. La regola deve stare **dopo** quella generica `/:path*`, perché in Next vince l'ultima che imposta la stessa intestazione.
- `robots.ts` resta com'è: elencare `/download/` in robots.txt rivelerebbe che la sezione esiste.
- Layout:
  - `PublicHeader` con la stessa CTA di Chi siamo (`WHATSAPP_URL`, "Conosciamoci");
  - un hero con titolo e introduzione. Per ora il testo è un segnaposto, da decidere insieme;
  - la griglia delle schede. Per un **file**: titolo, descrizione, tipo, peso e il pulsante "Scarica", che punta a `downloadUrl` del Blob e quindi scarica invece di aprire. Per un **link**: titolo, descrizione, dominio di destinazione e il pulsante "Apri", con `target="_blank" rel="noopener noreferrer"`;
  - se non ci sono schede: "Stiamo preparando i materiali, torna a trovarci presto.";
  - `PublicFooter` e `FloatingNavigation`.
- Tema chiaro e scuro: solo token del sito, nessun colore che si inverte su una superficie fissa (vedi la regola sul contrasto in HANDOFF.md).

## 2. Pannello `/admin/download`

File: `app/(it)/admin/download/page.tsx` (server, controllo accessi) + `DownloadAdmin.tsx` (client). Sta nel gruppo `(it)` perché il sito non ha un `app/layout.tsx` radice: fuori dai gruppi la pagina resterebbe senza layout e senza stili. L'indirizzo resta `/admin/download`.

- Accesso: login SWA con `ruolo_globale` `admin` o `super_admin` (`requireAdmin()`). In più il middleware reindirizza a `/login` chi non ha una sessione su `/admin/*`, come già fa per `/dashboard`. Metadata noindex.
- Sezione **Link segreto**:
  - mostra l'indirizzo completo con il pulsante "Copia";
  - "Genera nuovo link" chiede conferma ("Il link attuale smetterà di funzionare per tutti") e sostituisce il codice;
  - se non esiste ancora un codice, mostra solo il pulsante "Genera il link".
- Sezione **Materiali**:
  - "Carica file": scelta del file, titolo e descrizione facoltativa. Il caricamento va diretto dal browser a Blob, con l'avanzamento visibile, e solo dopo crea la scheda;
  - "Aggiungi link": titolo, descrizione e URL;
  - per ogni scheda: modifica titolo e descrizione, mostra/nascondi, sposta su/giù, elimina (con conferma). Eliminando una scheda file si cancella anche il file su Blob;
  - accanto a ogni file sono indicati tipo e peso.

## 3. Dati — migrazione `052_download_area.sql`

```sql
CREATE TABLE IF NOT EXISTS download_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind          text NOT NULL CHECK (kind IN ('file','link')),
  title         text NOT NULL,
  description   text,
  url           text NOT NULL,          -- link esterno, oppure URL pubblico del blob
  download_url  text,                   -- solo file: URL che forza il download
  blob_pathname text,                   -- solo file: per eliminarlo da Blob
  file_name     text,
  content_type  text,
  size_bytes    bigint,
  position      integer NOT NULL DEFAULT 0,
  visible       boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (kind = 'link' OR (blob_pathname IS NOT NULL AND download_url IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS download_items_position_idx ON download_items (position, created_at);

-- Una sola riga: il codice del link segreto attivo.
CREATE TABLE IF NOT EXISTS download_access (
  id          smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  code        text NOT NULL,
  rotated_at  timestamptz NOT NULL DEFAULT now()
);
```

La migrazione **non** inserisce un codice: il repository è pubblico e un codice scritto lì sarebbe noto a tutti. Il primo codice nasce dal pannello.

## 4. Logica e API

Modulo puro `lib/download-area.ts`: nessun accesso a DB o rete, quindi testabile.

- `generateAccessCode()`: 16 caratteri da un alfabeto senza ambiguità (minuscole e cifre, escluse `0 o 1 l i`), generati con `crypto.getRandomValues`. Esempio di forma: `k7f3q9xzm2p4v8wn`.
- `isValidAccessCodeFormat(s)`: controlla esattamente quella forma. Un formato sbagliato produce subito un 404, senza interrogare il DB.
- `normalizeLinkUrl(s)`: accetta solo `https:` (anche `http:`, che viene promosso). Rifiuta `javascript:`, `data:`, URL relativi e credenziali nell'URL.
- `validateFileMeta({ name, size, contentType })`: massimo 250 MB. Tipi ammessi: pdf, zip, png, jpg/jpeg, webp, gif, mp4, txt, md, csv, json, docx, xlsx, pptx.
- `validateItemText({ title, description })`: titolo da 1 a 120 caratteri, descrizione fino a 600, spazi ripuliti.
- `moveItem(ids, id, direction)`: restituisce il nuovo ordine.
- `formatBytes(n)`: per le schede.

Modulo server `lib/download-area-db.ts`:
- funzioni `q()`/`q1()` per codice e schede;
- `getActiveCode()`, `rotateCode()`;
- `listItems({ includeHidden })`, `createItem`, `updateItem`, `deleteItem`, `reorder`.

API, tutte sotto `/api/admin/`, quindi già protette dal middleware per chi non è loggato:

| Route | Metodo | Cosa fa |
|---|---|---|
| `/api/admin/downloads` | GET | Schede, nascoste comprese, e link segreto attivo |
| `/api/admin/downloads` | POST | Crea una scheda `link`, oppure una scheda `file` dopo il caricamento |
| `/api/admin/downloads/[id]` | PATCH / DELETE | Modifica o mostra/nascondi; elimina la scheda (e il blob) |
| `/api/admin/downloads/reorder` | POST | Nuovo ordine `ids[]` |
| `/api/admin/downloads/code` | POST | Genera o sostituisce il codice |
| `/api/admin/downloads/upload` | POST | `handleUpload` di `@vercel/blob/client`: rilascia il token di caricamento solo ad admin, limitato a `swa-download/files/` con tipi e dimensione ammessi |

Ogni route chiama `requireAdmin()` e **rifiuta esplicitamente** la modalità demo e l'assenza di database (403 e 503), perché in quei casi `requireAdmin()` oggi lascia passare chiunque sia autenticato.

Creazione di una scheda file: il client carica, poi invia `url`, `pathname`, `downloadUrl`, nome, tipo e dimensione. Il server verifica con `head(url)` che il blob esista e che il pathname inizi con `swa-download/files/`. Non usa `onUploadCompleted` (il webhook di Vercel), perché quella chiamata arriva senza sessione e verrebbe bloccata dal middleware.

Se l'eliminazione del blob fallisce, la scheda viene comunque eliminata e l'errore finisce nei log: un file orfano costa poco, una scheda che punta a un file inesistente rovina la pagina.

## 5. Sicurezza e privacy

- Codice: ~80 bit di entropia, non indovinabile. Confronto lato server; un formato errato non tocca il DB.
- Il codice non finisce nei referrer: `Referrer-Policy: no-referrer` sulla pagina, `noreferrer` sui link esterni.
- CSP: la pagina pubblica non richiede eccezioni, perché lo scaricamento è una normale navigazione verso il blob. Il pannello richiede di aggiungere l'host delle API Blob a `connect-src`; l'host esatto si verifica sulla versione installata di `@vercel/blob`.
- I file su Blob sono pubblici per URL, ma il nome contiene un suffisso casuale. Chi ha l'URL di un file lo può condividere: è accettato, coerente con "chi ha il link scarica".
- Nessun dato personale raccolto, quindi nessun cookie o trattamento nuovo.

## 6. Test

- `lib/download-area.test.ts` (runner esistente `npm test`, `playwright/test` + `node:assert`):
  - formato del codice (validi e non validi) e unicità statistica su 1000 generazioni;
  - URL dei link (https/http accettati; javascript:, data:, relativi e con credenziali rifiutati);
  - tipi e dimensioni dei file;
  - testi;
  - `moveItem` agli estremi;
  - `formatBytes`.
- `npm run lint` e `npm run build`.
- Prova completa su anteprima o produzione dopo la migrazione:
  - generare il link;
  - caricare un PDF piccolo e aggiungere un link;
  - aprire la pagina e scaricare;
  - nascondere, riordinare ed eliminare;
  - rigenerare il codice e verificare che il vecchio dia 404.

## 7. Messa online

1. Applicare `052_download_area.sql` con `npm run migrate` (`DIRECT_DATABASE_URL`). Vercel non applica le migrazioni da solo.
2. Verificare che lo store Blob sia collegato al progetto `social-media` in Production: c'è già una variabile token Blob, da confermare. Altrimenti si crea e si collega da Vercel → Storage.
3. Deploy. Il titolare ha accettato che il deploy possa rompere `/tools`, finché Marco non sistema `SWA_MARKETPLACE_ORIGIN`. Dopo l'Instant Rollback i deploy automatici sono sospesi: il nuovo deploy va promosso a mano.
4. Generare il link dal pannello e consegnarlo alla campagna.

## Riuso dal branch `codex/fix-blotato-template-id`

Riprendo come riferimento il flusso di caricamento client verso Blob e l'impostazione del pannello. Non riprendo: il catalogo `catalog.json` pubblico, la voce in sitemap, il canonical, l'impaginazione propria della pagina e le modifiche estranee del branch.
