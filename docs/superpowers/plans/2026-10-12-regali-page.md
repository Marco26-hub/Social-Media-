# Pagina regali che converte (PR 1) — piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** trasformare `/download/<codice>` da elenco di file a pagina che consegna i regali e poi fa una sola richiesta (contenuto di prova gratuito su WhatsApp), con testi modificabili dal pannello, aiuto per il browser interno di Instagram/Facebook, 404 pubblica del segmento e senza banner cookie né Odino.

**Architecture:** la logica pura (testi standard, validazione dei testi, link WhatsApp, etichette dei pulsanti, rilevamento del browser in-app) sta in `lib/*.ts` con test `playwright/test` + `node:assert/strict`. Il DB ha una tabella a riga unica (`download_page_settings`, migrazione 053) letta dalla pagina pubblica con ripiego sui testi standard. La pagina è divisa in `page.tsx` (dati, 404, metadata) e `GiftPage.tsx` (presentazione pura, provabile con dati finti). Banner cookie e Odino passano da un nuovo client component, `SiteOverlays`, che li esclude su `/download/*`.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, `pg` tramite `lib/db.ts`, CSS Modules (pagina pubblica), Tailwind (pannello). Nessuna dipendenza nuova.

**Spec:** `docs/superpowers/specs/2026-10-12-regali-conversione-app-ugc-design.md` (approvato il 2026-10-14). Questa PR copre §1, §2, §4, `SiteOverlays`, 404 del segmento e voce di anteprima `/regali`. **Fuori da questa PR** (arrivano con la PR 2): app UGC, scheda «App UGC» tra i regali, FAQ sull'app, interruttore «Mostra l'app UGC» nel pannello, CSP, `@google/genai`.

## Global Constraints

- Worktree: `C:\dev\Marco\SWA\wt-dashboard-download`, branch `feat/regali-page`. **Non toccare** `C:\dev\Marco\SWA\Social-Media-` (altra sessione). Mai `git stash` senza tag. Niente `git push`, niente migrazione in produzione, niente merge: servono OK espliciti del titolare.
- Repository pubblico: nessun codice di accesso, chiave o token in file versionati. Nei test si usa il codice finto `k7f3q9xzm2p4v8wn`.
- Testi UI e commenti in italiano, con lo stile del repo; apostrofo tipografico `’` nei testi mostrati (come la home). Messaggi di commit in inglese, chiusi da `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- I testi della pagina sono **quelli dello spec**, copiati parola per parola: occhiello, titolo, sottotitolo, messaggio WhatsApp, passi, FAQ, ponte `#prova`, chiusura, 404. Se uno spec e un test divergono, vale lo spec.
- Test singolo: `npx playwright test lib/<nome>.test.ts --workers=1`. Suite completa (in Git Bash): `npx playwright test lib/*.test.ts --workers=1`.
- Mai `npm run build` (scarica Chromium e notifica IndexNow): solo `npx next build`.
- Numero WhatsApp: da `TITOLARE.telefono` (`lib/legal-config.ts`), cifre sole → `393477196603`. Frase marcatore: `Ho preso i regali SWA`.
- `PREZZI.web` contiene già «a partire da»: non va preceduto da «da» (esiste `CANONE` per quello).
- Su `/download/*`: nessun pixel, nessuna CAPI, nessun cookie nuovo, `Referrer-Policy: no-referrer` invariato. `anteprimaOg` si chiama **solo** con `'/regali'`, mai con un percorso che contiene il codice.
- Contrasto (HANDOFF.md, «Contrasto — il bug ricorrente»): dove la superficie è fissa si usano colori fissi, non token che si invertono nel tema scuro. Vale per l'avviso in-app e per i testi sul verde della chiusura.
- Nessun test può usare una chiave vera o un DB reale. Senza `DATABASE_URL` le funzioni DB rifiutano con `Database non disponibile`.
- Deviazione di nome rispetto allo spec: `buildRegaliWhatsAppUrl` diventa `buildWhatsAppUrl(text)` (stesso comportamento), perché lo usa anche la 404 del segmento.

## Review Focus

1. **Testi che non rompono mai la pagina.** Migrazione 053 non ancora applicata, tabella vuota, DB che risponde male: la pagina pubblica usa i testi standard e **non** risponde 404 né 500. Si testa `getPageTextsOrDefault` (Task 4); il 404 resta solo per codice errato.
2. **Salvare i testi non spegne l'app.** Il PUT della PR 1 non manda `showUgc`: l'upsert deve lasciare invariata la colonna (`COALESCE`), così la PR 2 non trova un interruttore azzerato. Controllo sul SQL nel Task 4.
3. **La frase marcatore c'è sempre.** Il messaggio standard la contiene; il pannello avvisa se un messaggio personalizzato non ce l'ha (Task 10).
4. **Il codice non esce.** L'immagine di anteprima è fissa (`/regali`), «Copia il link» e «Apri in Chrome» tolgono query e hash (`fbclid`), nessun pixel. Test sul percorso nel Task 7 e sul link nel Task 3.
5. **Browser in-app.** Android: intent verso Chrome con ripiego https. iPhone: PDF, immagini e video nel visore, ZIP e documenti con l'avviso. Un user-agent sconosciuto non mostra niente (Task 3).
6. **Banner e Odino spariscono solo su `/download/*`.** Altrove restano. Il layout non importa più i due componenti (test di guardia, Task 6).
7. **`describeItem` in due posti.** Il pannello (`ItemCard.tsx`) lo usa solo per `meta` e `href`: la nuova firma (secondo parametro opzionale, campo `hint`) non deve cambiargli il comportamento.

---

### Task 1: `lib/prove.ts` (spostamento di `CASES`)

**Files:**
- Create: `lib/prove.ts`, `lib/prove.test.ts`
- Modify: `app/(it)/page.tsx` (righe 173-195: via l'array; aggiungere l'import)

**Interfaces:**
- Produces: `CASES: ReadonlyArray<{ metric: string; unit: string; title: string; text: string; href: string }>` — i tre valori attuali della home, identici.

- [ ] **Step 0: Baseline.** Sul branch pulito registra lo stato di partenza, serve per distinguere i fallimenti preesistenti:
  - `npx tsc --noEmit` (numero di errori, se ce ne sono)
  - `npm run lint`
  - `npx playwright test lib/*.test.ts --workers=1`
  Annota i risultati nel messaggio del primo commit solo se ci sono fallimenti.

- [ ] **Step 1: Test** in `lib/prove.test.ts`:

```ts
import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { CASES } from './prove'

test('CASES: i tre numeri della home, una sola fonte', () => {
  assert.deepEqual(CASES.map(c => [c.metric, c.unit]), [['24', 'contenuti'], ['3', 'progetti'], ['30', 'aziende']])
  assert.equal(new Set(CASES.map(c => c.title)).size, CASES.length)
  for (const c of CASES) assert.ok(c.href.startsWith('/'), c.href)
})
```

- [ ] **Step 2: Spostare l'array.** Crea `lib/prove.ts` con `export const CASES = [...]` copiando **tale e quale** il contenuto di `app/(it)/page.tsx:173-195` (commento breve in italiano: «Le prove verificabili: la home e la pagina regali leggono gli stessi numeri»). In `page.tsx` togli la costante e aggiungi `import { CASES } from '@/lib/prove'`. Nessun'altra modifica alla home.

- [ ] **Step 3:** `npx playwright test lib/prove.test.ts --workers=1`, poi `npx tsc --noEmit` (nessun errore nuovo).

- [ ] **Step 4: Commit** `Move the home evidence cases to lib/prove.ts`.

---

### Task 2: Logica pura dei testi, link WhatsApp ed etichette dei pulsanti

**Files:**
- Modify: `lib/download-area.ts`, `lib/download-area.test.ts`

**Interfaces:**
- Consumes: `TITOLARE.telefono` da `./legal-config` (import relativo: il file resta senza dipendenze da Next).
- Produces (tutti esportati da `lib/download-area.ts`):
  - `MARKER_PHRASE = 'Ho preso i regali SWA'`
  - `PAGE_TEXT_LIMITS = { eyebrow: 60, title: 90, lead: 240, whatsappText: 300 } as const`
  - tipi `PageTextKey`, `PageTexts` (`Record<PageTextKey, string>`), `PageTextOverrides` (`Record<PageTextKey, string | null>`), `PageSettings` (`PageTextOverrides & { showUgc: boolean }`)
  - `DEFAULT_PAGE_TEXTS: PageTexts` — i testi standard dello spec §1.3 e §1.5 (messaggio WhatsApp con lo spazio finale dopo «Mi occupo di:»)
  - `validatePageSettings(input: unknown): { ok: true; value: PageTextOverrides & { showUgc?: boolean } } | { ok: false; error: string }`
  - `resolvePageTexts(stored: Partial<PageTextOverrides> | null | undefined): PageTexts`
  - `buildWhatsAppUrl(text: string): string`
  - `hasMarkerPhrase(text: string): boolean`
  - `IN_APP_DOWNLOAD_HINT = 'Da Instagram o Facebook potrebbe non scaricarsi: apri la pagina nel browser (istruzioni in alto).'`
  - `describeItem(item, options?: { inApp?: boolean })` → `{ actionLabel: string; href: string; meta: string; external: boolean; hint: string | null }`. `DescribableItem` guadagna `contentType: string | null`.

Regole di `describeItem` (spec §1.4):

| Caso | `actionLabel` | `href` | `hint` |
|---|---|---|---|
| file, tipo pdf / zip / `image/*` / `video/*` / altro | «Scarica il PDF» / «Scarica lo ZIP» / «Scarica l’immagine» / «Scarica il video» / «Scarica il file» | `downloadUrl ?? url` | `null` |
| file in-app: pdf / immagine / video | «Apri il PDF» / «Apri l’immagine» / «Guarda il video» | `url` (visore) | `null` |
| file in-app: zip e altro | come sopra («Scarica lo ZIP», «Scarica il file») | `downloadUrl ?? url` | `IN_APP_DOWNLOAD_HINT` |
| link esterno | «Apri il link» | `url` | `null` |
| link con host esattamente `wa.me` | «Scrivici su WhatsApp» | `url` | `null` |

Il tipo si ricava da `contentType` (canonico, già salvato); se manca, dall'estensione di `fileName` tramite `ALLOWED_FILE_TYPES` (con `Object.hasOwn`, come `validateFileMeta`). `meta` e `external` restano come oggi.

Normalizzazione di `validatePageSettings`: per ogni campo di testo `undefined`/`null` → `null`; un non-stringa → errore; la stringa si normalizza con `replace(/\s+/g, ' ').trim()`, poi si controlla il limite, e il vuoto diventa `null`. La chiave `showUgc` compare nel risultato **solo** se presente nell'input (booleano, altrimenti errore). Messaggi: «L’occhiello non è valido.» / «Il titolo…» / «Il sottotitolo…» / «Il messaggio WhatsApp…», e «`<Campo>` può avere al massimo N caratteri.».

- [ ] **Step 1: Aggiornare i test esistenti di `describeItem`** (`lib/download-area.test.ts:159-167`): aggiungere `contentType` alle fixture e adeguare le attese alle nuove etichette e al campo `hint: null`. Il file `a.ZIP` senza `contentType` deve dare «Scarica lo ZIP» (ripiego sull'estensione).

- [ ] **Step 2: Scrivere i test nuovi** (aggiungere a `lib/download-area.test.ts`, con gli import):

```ts
test('describeItem: etichetta per tipo di file', () => {
  const file = (fileName: string, contentType: string | null) => ({ kind: 'file' as const, url: `https://s/${fileName}`, downloadUrl: `https://s/${fileName}?download=1`, fileName, contentType, sizeBytes: 1536 })
  const cases: Array<[string, string, string]> = [
    ['guida.pdf', 'application/pdf', 'Scarica il PDF'],
    ['kit.zip', 'application/zip', 'Scarica lo ZIP'],
    ['foto.png', 'image/png', 'Scarica l’immagine'],
    ['clip.mp4', 'video/mp4', 'Scarica il video'],
    ['dati.csv', 'text/csv', 'Scarica il file'],
  ]
  for (const [name, type, label] of cases) {
    const d = describeItem(file(name, type))
    assert.equal(d.actionLabel, label)
    assert.equal(d.href, `https://s/${name}?download=1`)
    assert.equal(d.hint, null)
    assert.equal(d.external, false)
  }
})

test('describeItem: nel browser in-app PDF, immagini e video si aprono nel visore', () => {
  const file = (fileName: string, contentType: string) => ({ kind: 'file' as const, url: `https://s/${fileName}`, downloadUrl: `https://s/${fileName}?download=1`, fileName, contentType, sizeBytes: 10 })
  assert.deepEqual(describeItem(file('g.pdf', 'application/pdf'), { inApp: true }), { actionLabel: 'Apri il PDF', href: 'https://s/g.pdf', meta: 'PDF · 10 B', external: false, hint: null })
  assert.equal(describeItem(file('f.jpg', 'image/jpeg'), { inApp: true }).actionLabel, 'Apri l’immagine')
  assert.equal(describeItem(file('v.mp4', 'video/mp4'), { inApp: true }).actionLabel, 'Guarda il video')
  assert.equal(describeItem(file('v.mp4', 'video/mp4'), { inApp: true }).href, 'https://s/v.mp4')
})

test('describeItem: nel browser in-app ZIP e documenti restano da scaricare, con l’avviso', () => {
  const zip = describeItem({ kind: 'file', url: 'https://s/k.zip', downloadUrl: 'https://s/k.zip?download=1', fileName: 'k.zip', contentType: 'application/zip', sizeBytes: 10 }, { inApp: true })
  assert.equal(zip.actionLabel, 'Scarica lo ZIP')
  assert.equal(zip.href, 'https://s/k.zip?download=1')
  assert.equal(zip.hint, IN_APP_DOWNLOAD_HINT)
  const doc = describeItem({ kind: 'file', url: 'https://s/d.docx', downloadUrl: null, fileName: 'd.docx', contentType: null, sizeBytes: null }, { inApp: true })
  assert.equal(doc.actionLabel, 'Scarica il file')
  assert.equal(doc.href, 'https://s/d.docx')
  assert.equal(doc.hint, IN_APP_DOWNLOAD_HINT)
})

test('describeItem: link esterno e link WhatsApp (host esatto)', () => {
  const link = (url: string) => ({ kind: 'link' as const, url, downloadUrl: null, fileName: null, contentType: null, sizeBytes: null })
  assert.equal(describeItem(link('https://github.com/marco/repo')).actionLabel, 'Apri il link')
  assert.deepEqual(describeItem(link('https://wa.me/393477196603?text=ciao')), { actionLabel: 'Scrivici su WhatsApp', href: 'https://wa.me/393477196603?text=ciao', meta: 'wa.me', external: true, hint: null })
  assert.equal(describeItem(link('https://wa.me.evil.example/x')).actionLabel, 'Apri il link')
})

test('DEFAULT_PAGE_TEXTS: dentro i limiti e con la frase marcatore', () => {
  for (const key of ['eyebrow', 'title', 'lead', 'whatsappText'] as const) {
    assert.ok(DEFAULT_PAGE_TEXTS[key].length <= PAGE_TEXT_LIMITS[key], key)
  }
  assert.ok(hasMarkerPhrase(DEFAULT_PAGE_TEXTS.whatsappText))
  assert.equal(DEFAULT_PAGE_TEXTS.title, 'Ecco i tuoi regali.')
})

test('validatePageSettings: spazi tolti, vuoto diventa null, showUgc solo se presente', () => {
  assert.deepEqual(
    validatePageSettings({ eyebrow: '  Nuovo   occhiello ', title: '', lead: '   ', whatsappText: 'Ciao! Ho preso i regali SWA.' }),
    { ok: true, value: { eyebrow: 'Nuovo occhiello', title: null, lead: null, whatsappText: 'Ciao! Ho preso i regali SWA.' } },
  )
  assert.deepEqual(validatePageSettings({ showUgc: true }), { ok: true, value: { eyebrow: null, title: null, lead: null, whatsappText: null, showUgc: true } })
  assert.deepEqual(validatePageSettings({}), { ok: true, value: { eyebrow: null, title: null, lead: null, whatsappText: null } })
})

test('validatePageSettings: limiti esatti e tipi sbagliati', () => {
  assert.equal(validatePageSettings({ eyebrow: 'x'.repeat(60) }).ok, true)
  assert.equal(validatePageSettings({ eyebrow: 'x'.repeat(61) }).ok, false)
  assert.equal(validatePageSettings({ title: 'x'.repeat(91) }).ok, false)
  assert.equal(validatePageSettings({ lead: 'x'.repeat(241) }).ok, false)
  assert.equal(validatePageSettings({ whatsappText: 'x'.repeat(301) }).ok, false)
  assert.equal(validatePageSettings({ title: 5 }).ok, false)
  assert.equal(validatePageSettings({ showUgc: 'si' }).ok, false)
  for (const bad of [null, [], 'testo', 42]) assert.equal(validatePageSettings(bad).ok, false)
})

test('resolvePageTexts: il campo vuoto usa il testo standard', () => {
  assert.deepEqual(resolvePageTexts(null), DEFAULT_PAGE_TEXTS)
  assert.deepEqual(resolvePageTexts({ title: 'Titolo nuovo', lead: '', eyebrow: null }), { ...DEFAULT_PAGE_TEXTS, title: 'Titolo nuovo' })
})

test('buildWhatsAppUrl: numero dal titolare e testo codificato', () => {
  assert.equal(
    buildWhatsAppUrl('Ciao! Ho preso i regali SWA. Mi occupo di: '),
    'https://wa.me/393477196603?text=Ciao!%20Ho%20preso%20i%20regali%20SWA.%20Mi%20occupo%20di%3A%20',
  )
  assert.equal(buildWhatsAppUrl('attività'), 'https://wa.me/393477196603?text=attivit%C3%A0')
})

test('hasMarkerPhrase: senza distinguere maiuscole e spazi', () => {
  assert.equal(hasMarkerPhrase('Ciao! Ho preso i regali SWA.'), true)
  assert.equal(hasMarkerPhrase('ciao, ho  PRESO i regali swa'), true)
  assert.equal(hasMarkerPhrase('Ciao! Vorrei una prova.'), false)
})
```

- [ ] **Step 3: Verificare che falliscano** (`npx playwright test lib/download-area.test.ts --workers=1`: mancano le esportazioni).

- [ ] **Step 4: Implementare** in `lib/download-area.ts`. Punti da rispettare:
  - `isPlainObject` esiste già più in basso (dichiarazione di funzione, si può usare prima);
  - `DescribableItem` aggiunge `contentType: string | null`; `ItemCard.tsx` continua a chiamare `describeItem(item)` senza secondo parametro;
  - `hasMarkerPhrase` normalizza `text.replace(/\s+/g, ' ').toLowerCase()` e cerca `MARKER_PHRASE.toLowerCase()`;
  - `WHATSAPP_NUMBER = TITOLARE.telefono.replace(/\D/g, '')` calcolato una volta;
  - commenti in italiano, dove serve il perché (es. «il tipo salvato è quello canonico: l'estensione serve solo se manca»).

- [ ] **Step 5:** test del file e `npx tsc --noEmit` verdi. Controlla che `app/(it)/admin/download/ItemCard.tsx` compili senza modifiche.

- [ ] **Step 6: Commit** `Add campaign texts, WhatsApp link and per-type labels to the download logic`.

---

### Task 3: `lib/in-app-browser.ts`

**Files:**
- Create: `lib/in-app-browser.ts`, `lib/in-app-browser.test.ts`

**Interfaces:**
- Produces:
  - `detectInAppBrowser(userAgent: string | null | undefined): { app: 'instagram' | 'facebook' | null; os: 'ios' | 'android' | 'other' }`
    - Instagram: `/Instagram/i` (controllato per primo); Facebook: `/FBAN|FBAV|FB_IAB/`; sistema: `/iPhone|iPad|iPod/` → `ios`, `/Android/` → `android`, altrimenti `other`. Input assente → `{ app: null, os: 'other' }`.
  - `cleanPageUrl(url: string): string | null` — `origin + pathname` (niente query né hash, tipicamente `fbclid`); `null` se non è un URL https valido.
  - `buildChromeIntentUrl(pageUrl: string): string | null` — `intent://<host><path>#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=<url pulito codificato>;end`; `null` se non è https.

- [ ] **Step 1: Test** (gli user-agent sono ricostruiti dalla forma pubblica degli UA di Instagram e Facebook, non catturati da un dispositivo: scrivilo in un commento nel file. Dopo il lancio vanno confrontati con un UA reale del titolare):

```ts
import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { buildChromeIntentUrl, cleanPageUrl, detectInAppBrowser } from './in-app-browser'

const UA = {
  instagramIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21F90 Instagram 340.0.0.18.109 (iPhone14,5; iOS 17_5; it_IT; it-IT; scale=3.00; 1170x2532; 604214221)',
  instagramAndroid: 'Mozilla/5.0 (Linux; Android 14; SM-S911B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.6422.165 Mobile Safari/537.36 Instagram 340.0.0.36.109 Android (34/14; 420dpi; 1080x2340; samsung; SM-S911B; dm1q; qcom; it_IT; 618421339)',
  facebookIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21F90 [FBAN/FBIOS;FBAV/470.0.0.37.109;FBBV/615423890;FBDV/iPhone14,5;FBMD/iPhone;FBSN/iOS;FBSV/17.5;FBSS/3;FBID/phone;FBLC/it_IT;FBOP/5]',
  facebookAndroid: 'Mozilla/5.0 (Linux; Android 14; SM-S911B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.6422.165 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/470.0.0.46.109;]',
  messengerIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21F90 [FBAN/MessengerForiOS;FBAV/468.0.0.34.113]',
  safariIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  chromeAndroid: 'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.165 Mobile Safari/537.36',
  chromeDesktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
}

test('detectInAppBrowser: Instagram e Facebook, iOS e Android', () => {
  assert.deepEqual(detectInAppBrowser(UA.instagramIos), { app: 'instagram', os: 'ios' })
  assert.deepEqual(detectInAppBrowser(UA.instagramAndroid), { app: 'instagram', os: 'android' })
  assert.deepEqual(detectInAppBrowser(UA.facebookIos), { app: 'facebook', os: 'ios' })
  assert.deepEqual(detectInAppBrowser(UA.facebookAndroid), { app: 'facebook', os: 'android' })
  assert.deepEqual(detectInAppBrowser(UA.messengerIos), { app: 'facebook', os: 'ios' })
})

test('detectInAppBrowser: i browser veri non scattano', () => {
  assert.deepEqual(detectInAppBrowser(UA.safariIos), { app: null, os: 'ios' })
  assert.deepEqual(detectInAppBrowser(UA.chromeAndroid), { app: null, os: 'android' })
  assert.deepEqual(detectInAppBrowser(UA.chromeDesktop), { app: null, os: 'other' })
  for (const none of [null, undefined, '']) assert.deepEqual(detectInAppBrowser(none), { app: null, os: 'other' })
})

test('cleanPageUrl toglie query e hash', () => {
  assert.equal(cleanPageUrl('https://www.socialautomation.app/download/k7f3q9xzm2p4v8wn?fbclid=abc#x'), 'https://www.socialautomation.app/download/k7f3q9xzm2p4v8wn')
  assert.equal(cleanPageUrl('http://x.it/a'), null)
  assert.equal(cleanPageUrl('non un url'), null)
})

test('buildChromeIntentUrl: intent verso Chrome con ripiego https, senza query', () => {
  assert.equal(
    buildChromeIntentUrl('https://www.socialautomation.app/download/k7f3q9xzm2p4v8wn?fbclid=abc'),
    'intent://www.socialautomation.app/download/k7f3q9xzm2p4v8wn#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=https%3A%2F%2Fwww.socialautomation.app%2Fdownload%2Fk7f3q9xzm2p4v8wn;end',
  )
  assert.equal(buildChromeIntentUrl('http://x.it/a'), null)
  assert.equal(buildChromeIntentUrl('non un url'), null)
})
```

- [ ] **Step 2:** i test falliscono, poi implementa il modulo (puro, senza import).
- [ ] **Step 3:** test verdi. **Commit** `Add in-app browser detection and Chrome intent link`.

---

### Task 4: Migrazione 053, accesso al DB e testi con ripiego

**Files:**
- Create: `db/migrations/053_download_page_settings.sql`
- Modify: `lib/download-area-db.ts`, `lib/download-area-db.test.ts`

**Interfaces:**
- Consumes: `PageSettings`, `PageTextOverrides`, `PageTexts`, `resolvePageTexts` (Task 2); `q`, `q1`, `dbReady` da `lib/db`.
- Produces (da `lib/download-area-db.ts`):
  - `EMPTY_PAGE_SETTINGS: PageSettings` (quattro `null`, `showUgc: false`)
  - `rowToPageSettings(row): PageSettings`
  - `getPageSettings(): Promise<PageSettings>` — se la riga non c'è restituisce `EMPTY_PAGE_SETTINGS`
  - `savePageSettings(value: PageTextOverrides & { showUgc?: boolean }): Promise<PageSettings>` — upsert sulla riga 1
  - `getPageTextsOrDefault(): Promise<PageTexts>` — **non lancia mai**: se la lettura fallisce o la tabella manca restituisce `resolvePageTexts(null)`; logga con `console.error('[download-area] ...')` solo se l'errore non è `isMissingDownloadSchema`
  - `isMissingDownloadSchema` riconosce anche `download_page_settings` (regex `download_(items|access|page_settings)`)

SQL della migrazione (stessa forma della 052; **nessun `INSERT INTO`**, e nei commenti non scrivere quella sequenza):

```sql
-- Testi della pagina regali (/download/<codice>) modificabili dal pannello.
-- Riga unica, come download_access. Tabella separata dal codice: i testi si
-- salvano anche prima di generare il link e la rotazione non li tocca.
-- Un campo nullo vuol dire "usa il testo standard" (DEFAULT_PAGE_TEXTS).
CREATE TABLE IF NOT EXISTS download_page_settings (
  id            smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  eyebrow       text,
  title         text,
  lead          text,
  whatsapp_text text,
  show_ugc      boolean NOT NULL DEFAULT false,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE download_page_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON download_page_settings FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON download_page_settings FROM authenticated;
  END IF;
END
$$;
```

Upsert (parametri `[eyebrow, title, lead, whatsappText, showUgc ?? null]`):

```sql
INSERT INTO download_page_settings (id, eyebrow, title, lead, whatsapp_text, show_ugc)
VALUES (1, $1, $2, $3, $4, COALESCE($5::boolean, false))
ON CONFLICT (id) DO UPDATE SET
  eyebrow = EXCLUDED.eyebrow, title = EXCLUDED.title, lead = EXCLUDED.lead,
  whatsapp_text = EXCLUDED.whatsapp_text,
  show_ugc = COALESCE($5::boolean, download_page_settings.show_ugc),
  updated_at = now()
RETURNING eyebrow, title, lead, whatsapp_text, show_ugc
```

- [ ] **Step 1: Test** (aggiungere a `lib/download-area-db.test.ts`; aggiornare l'elenco delle chiamate dell'esistente test «rifiutano con Database non disponibile» con `getPageSettings()` e `savePageSettings({ eyebrow: null, title: null, lead: null, whatsappText: null })`):

```ts
test('isMissingDownloadSchema riconosce anche la tabella dei testi (053)', () => {
  assert.equal(isMissingDownloadSchema(new Error('relation "download_page_settings" does not exist')), true)
})

test('rowToPageSettings: campi nulli e interruttore', () => {
  assert.deepEqual(rowToPageSettings({ eyebrow: null, title: 'T', lead: null, whatsapp_text: null, show_ugc: true }), { eyebrow: null, title: 'T', lead: null, whatsappText: null, showUgc: true })
})

test('getPageTextsOrDefault: senza database o con tabella mancante usa i testi standard', async () => {
  const previous = process.env.DATABASE_URL
  delete process.env.DATABASE_URL
  try {
    assert.deepEqual(await getPageTextsOrDefault(), DEFAULT_PAGE_TEXTS)
  } finally {
    if (previous !== undefined) process.env.DATABASE_URL = previous
  }
})

// Senza Postgres non si esegue l'SQL: questi controlli tengono la migrazione 053
// allineata al codice e a ciò che la 052 garantisce.
test('053: RLS attiva, privilegi revocati, nessun inserimento del codice o dei testi', () => {
  const migration = readFileSync(join(process.cwd(), 'db', 'migrations', '053_download_page_settings.sql'), 'utf8')
  assert.match(migration, /ALTER TABLE download_page_settings ENABLE ROW LEVEL SECURITY;/)
  assert.match(migration, /REVOKE ALL ON download_page_settings FROM anon;/)
  assert.match(migration, /REVOKE ALL ON download_page_settings FROM authenticated;/)
  assert.match(migration, /CHECK \(id = 1\)/)
  assert.doesNotMatch(migration, /INSERT\s+INTO/i)
})

// Il PUT della PR 1 non manda showUgc: l'upsert non deve azzerarlo.
test('savePageSettings: lascia invariato show_ugc quando non viene passato', () => {
  const source = readFileSync(join(process.cwd(), 'lib', 'download-area-db.ts'), 'utf8')
  assert.match(source, /show_ugc = COALESCE\(\$5::boolean, download_page_settings\.show_ugc\)/)
})
```

- [ ] **Step 2:** i test falliscono. **Step 3:** scrivere la migrazione e le funzioni (con commenti in italiano). **Step 4:** test verdi.
- [ ] **Step 5:** `npm run migrate:dry` (se richiede `DATABASE_URL` e non si può, annotalo: non è un blocco). **Non** applicare la migrazione.
- [ ] **Step 6: Commit** `Add the page settings table and a never-failing read for the public page`.

---

### Task 5: API `/api/admin/downloads/settings`

**Files:**
- Create: `app/api/admin/downloads/settings/route.ts`, `lib/download-area-settings-route.test.ts`

**Interfaces:**
- Consumes: `requireDownloadAdmin`, `apiError`, `validatePageSettings`, `DEFAULT_PAGE_TEXTS`, `getPageSettings`, `savePageSettings`, `EMPTY_PAGE_SETTINGS`, `isMissingDownloadSchema`.
- Produces:
  - `GET` → `200 { settings: PageSettings; defaults: PageTexts; needs_migration: boolean }`. Se la tabella manca: `settings = EMPTY_PAGE_SETTINGS`, `needs_migration: true` (come la route principale).
  - `PUT` → `200 { settings: PageSettings }`; JSON non valido → `400 { error: 'Richiesta non valida.' }`; validazione fallita → `400 { error }`; tabella mancante → `503 { error: 'Applica la migrazione 053 (npm run migrate) per salvare i testi.' }`.

Struttura (stessa delle altre route del gruppo): `export const dynamic = 'force-dynamic'`; il guard `requireDownloadAdmin()` è **la prima cosa** in ogni handler, prima di leggere il body; gli errori non gestiti passano da `apiError(e)`. Per leggere il body: `try { body = await request.json() } catch { return 400 }`.

- [ ] **Step 1: Test** (stesso stile di `lib/download-area-upload-route.test.ts`: la demo fa rispondere 403 prima di ogni altra cosa):

```ts
import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { GET, PUT } from '../app/api/admin/downloads/settings/route'

async function withDemo<T>(run: () => Promise<T>): Promise<T> {
  const previous = process.env.NEXT_PUBLIC_DEMO_MODE
  process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
  try {
    return await run()
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_DEMO_MODE
    else process.env.NEXT_PUBLIC_DEMO_MODE = previous
  }
}

test('settings: GET in demo risponde 403', async () => {
  assert.equal((await withDemo(() => GET())).status, 403)
})

test('settings: PUT in demo risponde 403 prima di leggere il corpo', async () => {
  const res = await withDemo(() => PUT(new Request('http://localhost/api/admin/downloads/settings', { method: 'PUT', body: 'non e json' })))
  assert.equal(res.status, 403)
})
```

- [ ] **Step 2:** falliscono. **Step 3:** implementare la route. **Step 4:** verdi. **Step 5: Commit** `Add the admin API for the gift page texts`.

---

### Task 6: `SiteOverlays` (niente banner e Odino su `/download/*`)

**Files:**
- Create: `components/SiteOverlays.tsx`, `lib/site-overlays.test.ts`
- Modify: `lib/download-path.ts`, `lib/download-path.test.ts`, `app/(it)/layout.tsx`

**Interfaces:**
- Produces:
  - `siteOverlaysEnabled(pathname: string | null | undefined): boolean` in `lib/download-path.ts` = `!isDownloadPath(pathname)`; commento: su `/download` non parte nessuna misura che chieda consenso e il primo schermo è dei regali.
  - `components/SiteOverlays.tsx`: `'use client'`, `usePathname()`, restituisce `null` se `!siteOverlaysEnabled(pathname)`, altrimenti `<><Odino /><CookieBanner /></>` (stesso ordine di oggi).

**Layout:** togli `import CookieBanner` e `import Odino`, aggiungi `import SiteOverlays from '@/components/SiteOverlays'`, e nel `<body>` sostituisci `<Odino />` + `<CookieBanner />` con `<SiteOverlays />` (stessa posizione, dopo `{children}`). `MetaPixel` resta com'è: esclude già `/download`.

- [ ] **Step 1: Test**

Aggiungi a `lib/download-path.test.ts`:

```ts
test('siteOverlaysEnabled: spento su /download/*, acceso altrove', () => {
  assert.equal(siteOverlaysEnabled('/download/k7f3q9xzm2p4v8wn'), false)
  assert.equal(siteOverlaysEnabled('/download/k7f3q9xzm2p4v8wn/altro'), false)
  for (const open of ['/', '/en', '/servizi/seo-geo', '/download', '/blog/download/x', null, undefined]) {
    assert.equal(siteOverlaysEnabled(open), true, String(open))
  }
})
```

`lib/site-overlays.test.ts` (guardia strutturale: se qualcuno rimette i componenti nel layout o fa entrare il tracciamento nella pagina, fallisce):

```ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'playwright/test'

const read = (...parts: string[]) => readFileSync(join(process.cwd(), ...parts), 'utf8')

test('il layout monta SiteOverlays e non importa più banner e Odino direttamente', () => {
  const layout = read('app', '(it)', 'layout.tsx')
  assert.match(layout, /<SiteOverlays \/>/)
  assert.doesNotMatch(layout, /import CookieBanner/)
  assert.doesNotMatch(layout, /import Odino/)
  assert.match(layout, /<MetaPixel \/>/)
})

test('SiteOverlays decide con siteOverlaysEnabled', () => {
  const source = read('components', 'SiteOverlays.tsx')
  assert.match(source, /siteOverlaysEnabled\(/)
  assert.match(source, /<Odino \/>/)
  assert.match(source, /<CookieBanner \/>/)
})

test('MetaPixel resta escluso su /download', () => {
  assert.match(read('components', 'MetaPixel.tsx'), /isDownloadPath\(pathname\)/)
})

test('la pagina dei regali non porta pixel, CAPI né consenso', () => {
  for (const file of ['page.tsx', 'GiftPage.tsx', 'not-found.tsx']) {
    let source = ''
    try { source = read('app', '(it)', 'download', '[codice]', file) } catch { continue }
    assert.doesNotMatch(source, /MetaPixel|meta-conversions-api|CookieBanner|cookie-consent/, file)
  }
})
```

(L'ultimo test salta i file non ancora creati: diventa efficace man mano che arrivano i Task 8 e 9. Alla fine del Task 9 verifica che `page.tsx` e `GiftPage.tsx` esistano e vengano letti.)

- [ ] **Step 2:** falliscono. **Step 3:** implementare. **Step 4:** verdi + `npx tsc --noEmit`.
- [ ] **Step 5: Commit** `Keep the cookie banner and Odino off the download pages`.

---

### Task 7: Anteprima `/regali` e link social condivisi

**Files:**
- Create: `lib/social-links.ts`, `lib/social-links.test.ts`, `lib/anteprima.test.ts`
- Modify: `lib/anteprima.ts`, `components/PublicFooter.tsx`

**Interfaces:**
- Produces:
  - `INSTAGRAM_HANDLE = '@socialwebautomation'`
  - `instagramUrl(): string` = `process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || 'https://www.instagram.com/socialwebautomation/'`, letto **a ogni chiamata** (non in una costante di modulo)
  - voce `'/regali'` nel dizionario `IT` di `lib/anteprima.ts` (vicino alle altre voci fisse, ad esempio dopo `/pacchetti`): occhiello «Regali», titolo «I regali di Social Web Automation.», sottotitolo «Materiali gratuiti per chi ci segue: si aprono subito, senza registrazione.», tinta `verde`.

`PublicFooter.tsx`: al posto dell'espressione inline per l'URL di Instagram usa `instagramUrl()` (stesso risultato, una sola fonte).

- [ ] **Step 1: Test**

```ts
// lib/social-links.test.ts
import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { INSTAGRAM_HANDLE, instagramUrl } from './social-links'

test('instagramUrl: variabile d’ambiente con ripiego, letta a ogni chiamata', () => {
  const previous = process.env.NEXT_PUBLIC_INSTAGRAM_URL
  try {
    delete process.env.NEXT_PUBLIC_INSTAGRAM_URL
    assert.equal(instagramUrl(), 'https://www.instagram.com/socialwebautomation/')
    process.env.NEXT_PUBLIC_INSTAGRAM_URL = '  https://www.instagram.com/altro/  '
    assert.equal(instagramUrl(), 'https://www.instagram.com/altro/')
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_INSTAGRAM_URL
    else process.env.NEXT_PUBLIC_INSTAGRAM_URL = previous
  }
  assert.equal(INSTAGRAM_HANDLE, '@socialwebautomation')
})
```

```ts
// lib/anteprima.test.ts
import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { anteprimaNota, anteprimaOg, contenutoAnteprima } from './anteprima'

test('/regali: voce fissa con il testo dello spec', () => {
  assert.equal(anteprimaNota('/regali'), true)
  assert.deepEqual(contenutoAnteprima('/regali'), {
    occhiello: 'Regali',
    titolo: 'I regali di Social Web Automation.',
    sottotitolo: 'Materiali gratuiti per chi ci segue: si aprono subito, senza registrazione.',
    tinta: 'verde',
  })
  assert.match(anteprimaOg('/regali')[0].url, /p=%2Fregali$/)
})

test('un percorso con il codice non è un’anteprima nota', () => {
  assert.equal(anteprimaNota('/download/k7f3q9xzm2p4v8wn'), false)
})
```

(Il test sulle chiamate a `anteprimaOg` della pagina sta nel Task 9, quando `page.tsx` viene riscritta. Qui `readFileSync` e `join` non servono: togli i due import.)

- [ ] **Step 2:** falliscono. **Step 3:** implementare (`lib/social-links.ts`, voce in `anteprima.ts`, footer). **Step 4:** verdi. **Step 5: Commit** `Add the /regali preview entry and share the Instagram link`.

---

### Task 8: 404 pubblica del segmento

**Files:**
- Create: `app/(it)/download/[codice]/not-found.tsx`, `lib/download-not-found.test.ts`

**Interfaces:**
- Consumes: `PublicHeader`, `PublicFooter`, `FloatingNavigation` non serve; `buildWhatsAppUrl`, `instagramUrl`, `styles/content-page.module.css` (`page`, `skipLink`, `hero`, `eyebrow`, `lead`, `heroActions`, `primary`, `secondary`).
- Produces: pagina server con `<main id="main-content" className={pageStyles.page}>`, skip link, `PublicHeader` (`ctaHref` = WhatsApp con testo generico «Ciao! Vorrei conoscere meglio Social Web Automation e valutare un progetto.», `ctaLabel` «Scrivici su WhatsApp»), H1 «Questa pagina non esiste o non è più disponibile.», tre azioni («Vai alla home» → `/`, «Seguici su Instagram» → `instagramUrl()` con `target="_blank" rel="noopener noreferrer"`, «Scrivici su WhatsApp»), `PublicFooter`. Occhiello neutro («Pagina non trovata»). **Non nomina regali, campagne, codici né materiali.**

Vale solo per `/download/*`; la `app/(it)/not-found.tsx` del resto del sito (dashboard) non si tocca.

- [ ] **Step 1: Test** (guardia sul testo: la 404 non deve tradire che esiste un'area riservata):

```ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'playwright/test'

test('la 404 del segmento non nomina regali, materiali, campagne o codici', () => {
  const source = readFileSync(join(process.cwd(), 'app', '(it)', 'download', '[codice]', 'not-found.tsx'), 'utf8')
  assert.doesNotMatch(source, /regal|materiali|campagn|codice|riservat/i)
  assert.match(source, /Questa pagina non esiste o non è più disponibile\./)
})
```

- [ ] **Step 2:** fallisce (file assente). **Step 3:** creare la pagina. **Step 4:** verde.
- [ ] **Step 5: Prova locale della 404** (senza DB la pagina risponde 404 comunque): avvia `npx next dev -p 3100` in background, poi `curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/download/k7f3q9xzm2p4v8wn` e `.../download/sbagliato` → entrambi `404`; nel corpo di `curl -s` compare «Questa pagina non esiste o non è più disponibile.» e **non** compare «regali». Verifica anche che `http://localhost:3100/pagina-che-non-esiste` mostri ancora la vecchia 404 (la dashboard). Ferma il server.
- [ ] **Step 6: Commit** `Add the public not-found page for the download segment`.

---

### Task 9: Pagina regali (`/download/[codice]`)

**Files:**
- Modify: `app/(it)/download/[codice]/page.tsx`, `app/(it)/download/[codice]/download.module.css`
- Create: `app/(it)/download/[codice]/GiftPage.tsx`, `InAppNotice.tsx`, `CopyLinkButton.tsx`, `download-copy.ts`

**Interfaces:**
- Consumes: Task 1 (`CASES`), 2 (`describeItem`, `buildWhatsAppUrl`, `PageTexts`), 3 (`detectInAppBrowser`, `buildChromeIntentUrl`, `cleanPageUrl`), 4 (`getPageTextsOrDefault`), 7 (`instagramUrl`, `INSTAGRAM_HANDLE`, `anteprimaOg`), `PREZZI` da `lib/prezzi-ingresso`, `TITOLARE.telefono`, `SITE_URL`.
- Produces:
  - `GiftPage` (server component, nessun `'use client'`): props `{ code: string; items: DownloadItem[]; texts: PageTexts; inApp: ReturnType<typeof detectInAppBrowser> }`. Rende l'intera pagina (testata, avviso, apertura, regali, ponte, chi siamo, FAQ, chiusura, footer).
  - `page.tsx`: metadata, controllo del codice, caricamento dati, `notFound()`, `GiftPage`.
  - `InAppNotice` (server): props `{ app: 'instagram' | 'facebook'; os: 'ios' | 'android' | 'other'; pageUrl: string }`.
  - `CopyLinkButton` (`'use client'`): props `{ url: string }`.
  - `download-copy.ts`: testi fissi non modificabili dal pannello (passi del ponte, FAQ, costanti), così `GiftPage.tsx` resta leggibile.

**`page.tsx`:**
- `export const dynamic = 'force-dynamic'`.
- `metadata`: `title` «I tuoi regali | Social Web Automation»; `robots` come oggi (noindex, nofollow, noarchive, nocache, googleBot); `openGraph` e `twitter` propri: `title` uguale, `description` «Materiali gratuiti per chi ci segue: si aprono subito, senza registrazione.», `images: anteprimaOg('/regali')`, `twitter.card: 'summary_large_image'`, `openGraph.type: 'website'`, `siteName`, `locale: 'it_IT'`. **Nessun `openGraph.url`** (conterrebbe il codice).
- Flusso: `normalizeAccessCode(codice)` → se `null`, `notFound()` **senza toccare il DB**; poi `Promise.all([loadItems(code), getPageTextsOrDefault()])`; `loadItems` resta com'è oggi (qualsiasi errore → `null` → 404); testi mai fatali; `inApp = detectInAppBrowser((await headers()).get('user-agent'))`; rendi `<GiftPage … />`.

**`GiftPage` — sezioni, nell'ordine dello spec §1** (testi esatti dallo spec; qui solo la struttura):
1. `PublicHeader` con `ctaHref = waUrl`, `ctaLabel «Richiedi una prova»`, dove `waUrl = buildWhatsAppUrl(texts.whatsappText)`.
2. `InAppNotice` solo se `inApp.app !== null`.
3. Apertura compatta: `<section className={`${pageStyles.hero} ${styles.compactHero}`}>` con occhiello, `<h1>` (testi da `texts`), sottotitolo `pageStyles.lead`. Niente sezione «Materiali disponibili».
4. Regali: intestazione piccola «I tuoi regali» + « · {n}» solo se `n > 0`; griglia di schede come oggi con `describeItem(item, { inApp: inApp.app !== null })`, il `hint` sotto il pulsante quando non è `null`, `aria-label` = `${actionLabel}: ${item.title}` (+ « (si apre in una nuova scheda)» per i link). Lista vuota: «Il regalo sta arrivando. Intanto, se vuoi vedere cosa possiamo fare per te, scrivici.» con link WhatsApp. **Niente scheda «App UGC»**: arriva con la PR 2.
5. Ponte `<section id="prova">`: occhiello, H2, testo, tre passi in `pageStyles.stepGrid` (markup `<article><span>01</span><h3>…</h3><p>…</p></article>`, come in `app/(it)/contatti/page.tsx`), pulsante primario `pageStyles.primary` «Chiedi il contenuto di prova gratuito» (`target="_blank" rel="noopener noreferrer"`), riga con `TITOLARE.telefono`.
6. «Chi ti fa questi regali»: testo, le tre prove da `CASES` (schede proprie in `download.module.css`, link con `next/link`), riga prezzi con `PREZZI.presenza` e `PREZZI.web` (**senza** «da» davanti a `PREZZI.web`) e link `/pacchetti`.
7. FAQ: sei domande dello spec (la settima, sull'app, è della PR 2), `details`/`summary` con `<span>+</span>` come in `app/(it)/faq/page.tsx`, dentro `.section .faqLayout`; nessun JavaScript. Le risposte con prezzi usano `PREZZI`.
8. `pageStyles.finalCta`: occhiello, H2, testo, pulsante «Scrivici su WhatsApp» (stesso `waUrl`), riga Instagram «I prossimi regali li annunciamo su Instagram: segui {INSTAGRAM_HANDLE}.» con link a `instagramUrl()`.
9. `PublicFooter` e `FloatingNavigation`.

**Avviso in-app (spec §2)** — tutti i testi dallo spec:
- Android: testo + pulsante «Apri in Chrome» = `<a href={buildChromeIntentUrl(pageUrl)}>`.
- iPhone (`ios`): testo + `<CopyLinkButton url={cleanPageUrl(pageUrl)} />`.
- Per `os: 'other'` (un user-agent Instagram o Facebook fuori da iOS e Android: in pratica non esiste) l'avviso **non** compare: `GiftPage` lo monta solo per `ios` e `android`.
- `pageUrl = `${SITE_URL}/download/${code}``. Se `buildChromeIntentUrl` restituisce `null`, niente pulsante (mai un `href` vuoto).
- Colori **fissi** (spec §2): fondo `#fff4d6`, bordo `#e3bd54`, testo `#3a2c00`, pulsante `#0f6b4f` con testo `#ffffff`. Non usare `var(--paper)`, `var(--ink)` ecc.: si invertono nel tema scuro.

**`CopyLinkButton`:** `navigator.clipboard.writeText(url)` in `try/catch`; successo → «Link copiato: incollalo in Safari.» in un `role="status"`; se l'API manca o rifiuta → mostra un `<input readOnly value={url}>` con `onFocus={e => e.currentTarget.select()}` e «Tieni premuto sul link per copiarlo.». Mai `alert`.

**CSS (`download.module.css`):** aggiungi, senza toccare le regole esistenti delle schede:
- `.compactHero` con regole **solo sotto i 700px** e specificità più alta di `.hero` di `content-page.module.css` (es. `.page .compactHero`, con `className={`${pageStyles.page} ${styles.page}`}` su `<main>`): padding verticale ridotto, `h1` a circa 38px, barretta `::after` più vicina, `lead` più corto di margine. Obiettivo: a 390px di larghezza, **senza** avviso in-app, titolo e primo regalo (titolo scheda **e** pulsante) stanno nei primi 844px;
- schede sotto i 700px: icona 38px, titolo scheda circa 19px con margine superiore ridotto, pulsante a tutta larghezza (già presente);
- `.hint` (nota sotto il pulsante), `.notice*` (avviso in-app, colori fissi sopra), `.proofGrid`/`.proofCard`/`.proofMetric`, `.priceLine`, `.phoneLine`, `.finalNote` (testo chiaro fisso `#d5eee5`, link sottolineato, perché sta sul verde);
- tutto leggibile in tema notte (`html[data-theme='dark']`): dove la superficie non si inverte, colori fissi.

- [ ] **Step 1: Test di guardia** (scrivili prima di riscrivere la pagina). Aggiungi a `lib/anteprima.test.ts` (con gli import `readFileSync` e `join`, che lì mancano):

```ts
// anteprimaOg mette il percorso nell'URL dell'immagine: con il codice nel percorso il codice uscirebbe.
test('la pagina regali chiama anteprimaOg solo con /regali', () => {
  const page = readFileSync(join(process.cwd(), 'app', '(it)', 'download', '[codice]', 'page.tsx'), 'utf8')
  const calls = page.match(/anteprimaOg\(/g) ?? []
  const safe = page.match(/anteprimaOg\('\/regali'\)/g) ?? []
  assert.ok(calls.length > 0)
  assert.equal(calls.length, safe.length)
})
```

  Deve fallire (oggi `page.tsx` non chiama `anteprimaOg`). Dopo la riscrittura, `lib/anteprima.test.ts` e `lib/site-overlays.test.ts` devono passare leggendo davvero `page.tsx`, `GiftPage.tsx` e `not-found.tsx` (l'ultimo test di `site-overlays` salta i file assenti: controlla che qui non ne salti nessuno).

- [ ] **Step 2: Implementare** `download-copy.ts`, `CopyLinkButton.tsx`, `InAppNotice.tsx`, `GiftPage.tsx`, `page.tsx`, CSS.

- [ ] **Step 3: Controlli statici:** `npx tsc --noEmit`, `npm run lint`, test della suite.

- [ ] **Step 4: Prova visiva locale con dati finti** (la pagina vera risponde 404 senza DB, quindi si prova `GiftPage` a parte):
  1. Crea **temporaneamente** `app/(it)/regali-prova/page.tsx` che importa `GiftPage` e lo rende con tre schede finte (un PDF da 2,4 MB, uno ZIP da 18 MB con tipo `application/zip`, un link) e codice `k7f3q9xzm2p4v8wn`; legge `?app=instagram|facebook` e `?os=ios|android` da `searchParams` per simulare il browser in-app.
  2. `npx next dev -p 3100`; con il browser integrato guarda a 390×844, 768 e desktop: senza avviso, con avviso iOS, con avviso Android, con schede in-app (etichette «Apri il PDF», nota sotto lo ZIP), e con `localStorage.setItem('swa-theme','dark')` per il tema notte. Nessun overflow orizzontale; contrasto dell'avviso e del testo sul verde leggibile; il primo regalo entro 844px come da obiettivo.
  3. **Elimina `app/(it)/regali-prova/` e verifica con `git status` che non resti nulla di untracked prima di ogni commit.**
  Se il browser integrato non è disponibile, scrivilo nel report: la prova visiva passa all'anteprima Vercel (Task 11).

- [ ] **Step 5: Commit** `Rebuild the download page as a converting gift page`.

---

### Task 10: Pannello — «Testi della pagina»

**Files:**
- Create: `app/(it)/admin/download/PageTextsSection.tsx`
- Modify: `app/(it)/admin/download/DownloadAdmin.tsx`

**Interfaces:**
- Consumes: `callApi` (`./api`), `DEFAULT_PAGE_TEXTS`, `PAGE_TEXT_LIMITS`, `hasMarkerPhrase`, `MARKER_PHRASE`, `SITE_URL`, route del Task 5.
- Produces: `PageTextsSection` con props `{ code: string | null }`, montata in `DownloadAdmin` **tra** `SecretLinkSection` e `AddItemSection` (nel ramo che si mostra quando la migrazione 052 c'è).

Comportamento:
- Al montaggio carica `GET /api/admin/downloads/settings`; durante il caricamento «Caricamento»; errore → messaggio e «Riprova».
- `needs_migration: true` → riquadro ambra come quello esistente: «Per salvare i testi applica la migrazione 053 (npm run migrate) e ricarica.»; i campi non si mostrano.
- Quattro campi con etichetta (Occhiello, Titolo, Sottotitolo, Messaggio WhatsApp), `maxLength` dal limite, contatore `{n}/{limite}`, il testo standard come `placeholder`; sottotitolo e messaggio come `textarea` (`className="input"`, `rows={3}`), come in `AddItemSection`.
- «Salva i testi» → `PUT` con **solo** `{ eyebrow, title, lead, whatsappText }` (nessun `showUgc`: l'interruttore dell'app arriva con la PR 2 e il server non deve azzerarlo); in corso: pulsante disattivato con spinner; esito in un `role="status"`, errore in un `role="alert"`; dopo il salvataggio riallinea i campi al testo normalizzato restituito dal server.
- Avviso sotto il messaggio WhatsApp se il testo **effettivo** (campo vuoto → standard) non passa `hasMarkerPhrase`: «Senza "Ho preso i regali SWA" non riconosci le chat che arrivano dalla campagna».
- Link «Apri la pagina» a `${SITE_URL}/download/${code}` (`target="_blank" rel="noopener noreferrer"`) solo se `code` esiste; se non c'è: «Genera prima il link segreto per vedere la pagina.»
- Stile Tailwind del pannello (`card p-5`, `label`, `input`, `btn-primary`, `btn-secondary`, `text-xs text-gray-500`), icona `lucide-react` come le altre sezioni, id con `useId()`.
- Nessun testo del pannello cita l'app UGC in questa PR.

- [ ] **Step 1:** implementare e montare. **Step 2:** `npx tsc --noEmit` e `npm run lint`. **Step 3:** rileggere il flusso salvataggio ↔ server (il body non contiene `showUgc`; il `PUT` risponde con le stringhe normalizzate). Il pannello non è provabile in locale (serve il DB reale): la prova passa all'anteprima/produzione (Task 11).
- [ ] **Step 4: Commit** `Add the campaign texts section to the download panel`.

---

### Task 11: Verifica finale e consegna

**Files:** nessuno nuovo.

- [ ] **Step 1: Suite e controlli** (dal worktree, in Git Bash):
  - `npx playwright test lib/*.test.ts --workers=1`
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npx next build` (mai `npm run build`)
  Confronta con la baseline del Task 1: gli eventuali fallimenti devono essere gli stessi già presenti su `main`.

- [ ] **Step 2: Pulizia:** `git status` pulito, nessuna cartella `regali-prova`, nessun file temporaneo; `git log --oneline origin/main..HEAD` mostra i commit della PR (spec incluso); nessun codice, chiave o URL di store nei file (`git diff origin/main..HEAD` riletto).

- [ ] **Step 3: Controllo locale della 404 del segmento** già fatto nel Task 8: ripeti con `npx next start` dopo la build (`curl` su `/download/k7f3q9xzm2p4v8wn` → 404).

- [ ] **Step 4: Report al titolare**, in italiano: cosa è fatto, cosa è verificato e come, cosa **non** è verificato (pannello e pagina con dati veri; telefono reale dentro Instagram e Facebook; UA reali), e le tre autorizzazioni da chiedere una alla volta:
  1. push del branch e apertura della PR 1 (account `gh` Marco26-hub: `git -c credential.helper= -c "credential.helper=!gh auth git-credential" push`);
  2. migrazione 053 in produzione (`npm run migrate`, checksum sul file LF da `git show <ref>:db/migrations/053_download_page_settings.sql` con `MSYS_NO_PATHCONV=1`);
  3. merge e promozione.
  Dopo il merge: controllo in produzione con il codice di prova (pagina, 404, pannello, salvataggio dei testi, «Apri la pagina»).

- [ ] **Step 5: Ricordare al titolare i prerequisiti di lancio** (non di codice): password `admin`/`cliente` da cambiare; `corso_iscrizioni` forse senza RLS (`lib/runtime-migrations.ts`); regali veri da caricare e testi della campagna da salvare; Marco informato che le richieste di prova arrivano sul suo WhatsApp; frasi su costi e «gratis» da far vedere allo Studio BCS.
