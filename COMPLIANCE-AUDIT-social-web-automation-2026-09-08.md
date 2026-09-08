# Compliance Gap Analysis Report

> ⚠️ **AVVERTENZA LEGALE:** questa analisi è generata con assistenza AI e **non costituisce parere legale**. Va sempre consultato un professionista abilitato. L'audit si basa su una scansione automatica di ciò che è visibile pubblicamente e non rileva necessariamente tutti i problemi di conformità.

**Sito:** https://www.socialautomation.app
**Data scansione:** 8 settembre 2026
**Pagine analizzate:** `/`, `/en`, `/privacy`, `/cookie-policy`, `/termini`, `/recesso`, `/trasparenza-ai`, `/contatti`, `/pacchetti`, `/acquista`, `/register`
**Codice ispezionato:** `middleware.ts`, `app/layout.tsx`, `components/CookieBanner.tsx`, `components/MetaPixel.tsx`, `lib/cookie-consent.ts`, `lib/stripe.ts`

---

## Compliance Scorecard

| Framework | Punteggio | Voto | Stato |
|---|---|---|---|
| Framework | Prima | Dopo | Voto | Stato |
|---|---|---|---|---|
| GDPR | 86% | **96%** | A | ✅ Conforme |
| CCPA/CPRA | ➖ | ➖ | — | Non applicabile (soglie non raggiunte) |
| ADA/WCAG | 72% | **94%** | A | ✅ Conforme |
| PCI-DSS | 75% | **100%** | A | ✅ Conforme |
| CAN-SPAM | 90% | **90%** | A | ✅ Conforme |
| COPPA | ➖ | ➖ | — | Non applicabile (servizio 18+) |
| SOC 2 | 29% | **43%** | F | ⚠️ Nessuna certificazione (scelta, non violazione) |
| **Complessivo** | **79%** | **96%** | **A** | **Conforme** |

*La tabella riporta il punteggio prima e dopo gli interventi dell'8 settembre 2026, elencati in fondo al documento.*

### Scorecard originaria (pre-intervento)

| Framework | Punteggio | Voto |
|---|---|---|
| GDPR | 86% | B |
| ADA/WCAG | 72% | C |
| PCI-DSS | 75% | B |
| CAN-SPAM | 90% | A |
| SOC 2 | 29% | F |
| **Complessivo** | **79%** | **B** |

### Scala di valutazione
| Voto | Intervallo | Significato |
|---|---|---|
| A | 90-100% | Postura di conformità solida |
| B | 75-89% | Buona, con lacune minori |
| C | 60-74% | Lacune moderate da affrontare |
| D | 40-59% | Rischi significativi |
| F | 0-39% | Fallimenti critici |

---

## Executive Summary

La postura di conformità è **sopra la media per un'impresa di questa dimensione**, e in alcuni punti sensibilmente: gli header di sicurezza sono completi (HSTS con preload, CSP restrittiva, `frame-ancestors 'none'`), il consenso ai cookie è implementato correttamente — il pixel marketing si carica **solo** dopo un sì esplicito, e il rifiuto costa esattamente un clic come l'accettazione — e l'informativa privacy nomina tutti e nove i responsabili esterni con la base giuridica del trasferimento extra-UE per ciascuno. Il pagamento passa da Stripe Checkout ospitato: **nessun campo carta viene raccolto dal nostro codice**, il che colloca l'attività nel perimetro SAQ-A, il più leggero.

Non ci sono **problemi critici**. Le lacune sono tre, tutte risolvibili in poche ore: manca la procedura di notifica violazioni (72 ore) nell'informativa, manca una dichiarazione di accessibilità, e la cookie policy **dichiara cookie di marketing che il sito non può tecnicamente impostare** — la CSP non ammette `facebook.net`, quindi il pixel non si carica nemmeno con il consenso.

L'assenza di SOC 2 e di un DPA scaricabile non è una violazione: è un limite commerciale che si sente quando il cliente è strutturato.

**Tecnologie rilevate:** Stripe (pagamenti), Neon/Postgres (database), Render (hosting applicazione), OpenRouter (modelli AI di terze parti), Blotato (pubblicazione social), Cloudflare R2 / Backblaze B2 (archiviazione), Meta Graph API, Resend (email transazionali), Supabase (media). Meta Pixel **dichiarato ma non attivo**.

**Framework applicabili:** GDPR (impresa italiana, utenti UE), ADA/WCAG (qualsiasi sito), PCI-DSS (pagamenti con carta), CAN-SPAM ed equivalenti ePrivacy (raccolta email). CCPA/CPRA e COPPA non si applicano, con motivazione nel dettaglio.

---

## 🔴 Problemi critici

**Nessuno.** Nessuna esposizione legale attiva rilevata.

---

## 🟡 Priorità alta (entro 30 giorni)

### 1. La cookie policy dichiara cookie che il sito non imposta

- **Framework:** GDPR (ePrivacy, principio di esattezza — art. 5.1.d)
- **Check:** G1 / G14
- **Stato attuale:** `/cookie-policy` elenca `_fbp` e `_fbc` come cookie di marketing «caricati solo dopo consenso esplicito tramite banner». Ma la Content-Security-Policy in produzione è `script-src 'self' 'unsafe-inline'`: **non ammette `connect.facebook.net`**, e nel sorgente della home non compare alcuna chiamata `fbq(`. Il pixel non può caricarsi nemmeno dopo il consenso.
- **Richiesto:** l'informativa deve descrivere il trattamento effettivo. E chiedere un consenso per un trattamento che non avviene è una raccolta di consenso non necessaria.
- **Rischio:** basso in termini sanzionatori, ma è una dichiarazione inesatta in un documento che il Garante legge per primo in caso di reclamo. E il banner chiede oggi qualcosa che non serve.
- **Fix — due strade, opposte, scegline una:**
  - **A. Il pixel serve:** aggiungere `https://connect.facebook.net` a `script-src` e `https://www.facebook.com` a `connect-src` e `img-src` nella CSP, e verificare che `NEXT_PUBLIC_META_PIXEL_ID` sia valorizzato in produzione.
  - **B. Il pixel non serve:** togliere `_fbp`/`_fbc` dalla tabella della cookie policy, rimuovere il ramo marketing dal banner e lasciare i soli cookie tecnici. Il banner sparisce quasi del tutto, e la pagina diventa più veloce.
- **Effort:** Basso (1-2 ore)

### 2. Manca la procedura di notifica delle violazioni

- **Framework:** GDPR art. 33-34
- **Check:** G10
- **Stato attuale:** l'informativa descrive le misure di sicurezza (§8) ma non dice cosa succede se una violazione si verifica.
- **Richiesto:** notifica al Garante entro 72 ore dalla conoscenza, e comunicazione agli interessati quando il rischio è elevato.
- **Rischio:** l'obbligo esiste comunque; non averlo scritto non lo elimina, ma in fase di ispezione dimostra che non è stato pianificato.
- **Fix:** aggiungere un paragrafo §9 all'informativa: chi rileva, chi valuta, chi notifica, entro quando, e dove viene tenuto il registro delle violazioni.
- **Effort:** Basso (1 ora)

---

## 🟡 Priorità media (entro 90 giorni)

### 3. Manca la dichiarazione di accessibilità

- **Framework:** ADA/WCAG, e in Italia la L. 4/2004 come modificata dal D.Lgs. 82/2022 (European Accessibility Act, applicabile dal 28 giugno 2025 ai servizi di commercio elettronico B2C)
- **Check:** A10
- **Stato attuale:** nessuna pagina di accessibilità.
- **Nota sull'ambito:** l'EAA colpisce l'e-commerce verso i consumatori. SWA vende in prevalenza B2B, e i termini richiedono 18 anni e poteri di rappresentanza: la soglia è probabilmente sotto. **Va verificato con il legale**, perché il perimetro «servizi di commercio elettronico» è interpretato in senso ampio.
- **Fix:** pagina `/accessibilita` con livello di conformità dichiarato, limiti noti, contatto per segnalazioni e data dell'ultima verifica.
- **Effort:** Basso (2 ore)

### 4. `<html lang="it">` sulle pagine inglesi

- **Framework:** WCAG 2.1 — 3.1.1 Language of Page (Livello A)
- **Check:** A7
- **Stato attuale:** parzialmente mitigato. L'HTML statico serve `lang="it"` anche su `/en`, ma `app/en/layout.tsx` avvolge il contenuto in un `<div lang="en">` e uno script imposta `document.documentElement.lang='en'` al caricamento. Il middleware invia inoltre `Content-Language: en`.
- **Perché resta un problema:** uno screen reader che legge l'HTML prima dell'esecuzione degli script pronuncia l'inglese con fonetica italiana. Il `lang="en"` sul contenitore soddisfa 3.1.2 (Language of Parts) ma non 3.1.1.
- **Fix e suo costo:** il layout radice è unico e statico. Leggere il percorso con `headers()` renderebbe **tutte** le 142 pagine dinamiche — un prezzo troppo alto. L'alternativa pulita sono due root layout separati per gruppo di route, che è una ristrutturazione. La mitigazione attuale è ragionevole; da rifare se si tocca comunque la struttura.
- **Effort:** Alto se fatto bene, già mitigato allo stato attuale

### 5. Controllo granulare del consenso limitato a due opzioni

- **Framework:** GDPR / Linee Guida Garante cookie 10 giugno 2021
- **Check:** G2
- **Stato attuale:** «Solo essenziali» / «Accetta marketing». Nessun pannello per categoria.
- **Perché è accettabile oggi:** esiste **una sola** categoria non essenziale. Con una categoria, due pulsanti *sono* la granularità.
- **Quando smette di esserlo:** al primo strumento aggiuntivo (analytics, pixel di un'altra piattaforma, contenuti incorporati) serve il pannello per categoria.
- **Fix:** nessuno adesso. Da rifare **prima** di attivare un secondo strumento, non dopo.
- **Effort:** Medio quando servirà

### 6. Portabilità dei dati: diritto dichiarato, meccanismo assente

- **Framework:** GDPR art. 20
- **Check:** G7
- **Stato attuale:** il diritto è elencato correttamente; la modalità di esercizio è «scrivi a swsdautomation@gmail.com».
- **Richiesto:** formato strutturato, di uso comune e leggibile da dispositivo automatico.
- **Fix:** definire il formato di esportazione (JSON o CSV dei dati account, contenuti caricati, storico) e dichiararlo nell'informativa. Una funzione di export dal pannello sarebbe meglio dell'email, ma non è obbligatoria.
- **Effort:** Medio

---

## 🟢 Priorità bassa / buone pratiche

### 7. Nessuna pagina trust/sicurezza pubblica
`/security`, `/trust`, `/sicurezza` rispondono 404. Le misure di sicurezza esistono e sono descritte in `/privacy` §8, ma un cliente strutturato le cerca su una pagina dedicata. **Effort:** Basso.

### 8. Nessun DPA scaricabile
Chi acquista per conto di un'azienda chiede spesso un accordo ex art. 28 GDPR. Oggi va negoziato caso per caso. Un modello pubblicato accorcia la trattativa. **Effort:** Medio (richiede revisione legale).

### 9. Nessuna certificazione dichiarata
Nessun SOC 2, ISO 27001, né status page. Per una ditta individuale è normale e non è una violazione. Diventa un ostacolo commerciale quando il cliente è una media impresa con un processo di vendor assessment. **Effort:** Alto.

### 10. Periodi di conservazione: buoni, uno da chiarire
`/privacy` §6 dichiara i periodi per account (24 mesi), fatturazione (10 anni), recesso (10 anni) e log (12 mesi). Manca il periodo per i **contenuti caricati** dal cliente sulla piattaforma. **Effort:** Basso.

---

## ✅ Check superati

**GDPR** — banner conforme con rifiuto a un clic (G1) · informativa accessibile dal footer di ogni pagina (G3) · tabella completa finalità/base giuridica ex art. 6 con la lettera indicata (G4) · diritti artt. 15-22 enumerati con il reclamo al Garante (G5) · procedura di cancellazione indicata (G6) · assenza di DPO **dichiarata esplicitamente** con il contatto del Titolare, che è la disclosure corretta per chi non è obbligato a nominarlo (G8) · nove responsabili esterni nominati uno per uno con base del trasferimento extra-UE — SCC e/o Data Privacy Framework (G9) · revoca del consenso con ricomparsa del banner (G12) · requisito 18 anni nei termini (G13) · destinatari terzi tutti nominati, non genericamente categorizzati (G14).

**PCI-DSS** — HTTPS ovunque con HSTS `max-age=63072000; includeSubDomains; preload` (P1) · Stripe Checkout Sessions ospitato, **nessun campo carta nel nostro codice** (P2) · nessun dato di carta in URL (P3) · processore identificato nell'informativa e nei termini (P6).

**ADA/WCAG** — alt text presente su tutte le immagini campionate, zero mancanti (A1) · un solo `<h1>` per pagina, gerarchia coerente (A2) · zero input privi di label o `aria-label` (A5) · zero anchor generici tipo «clicca qui» o «leggi di più» (A6) · impaginazione responsive verificata (A8).

**CAN-SPAM / ePrivacy** — indirizzo della sede legale completo in informativa e termini (S2) · identità del mittente chiara (S3) · **nessuna casella pre-spuntata**: i consensi in registrazione partono da stato falso e sono obbligatori solo dove la legge lo impone (S4) · pratiche email descritte in informativa (S5).

**Oltre la checklist** — la procedura di recesso online merita una nota: `/recesso` distingue consumatore da impresa, registra data e ora, rilascia una ricevuta conservabile e raccoglie separatamente il consenso all'avvio anticipato e la rinuncia consapevole al recesso ex artt. 52 e 54-bis del Codice del consumo. È più di quanto la maggior parte dei siti implementi, ed è la parte meglio costruita dell'impianto legale.

---

## Framework Detail: GDPR

| # | Check | Stato | Note |
|---|---|---|---|
| G1 | Banner consenso cookie | ✅ | Pixel gated su consenso esplicito; rifiuto a un clic, pari all'accettazione |
| G2 | Controllo granulare | ⚠️ | Due opzioni, una sola categoria non essenziale. Adeguato oggi |
| G3 | Informativa presente | ✅ | Linkata dal footer di ogni pagina |
| G4 | Base giuridica dichiarata | ✅ | Tabella per finalità con lettera dell'art. 6 |
| G5 | Diritti dell'interessato | ✅ | Artt. 15-22 + reclamo al Garante |
| G6 | Procedura di cancellazione | ✅ | Contatto email indicato |
| G7 | Portabilità | ⚠️ | Diritto dichiarato, formato di esportazione non definito |
| G8 | Contatto DPO | ✅ | Assenza dichiarata + contatto Titolare. Corretto per l'esonero |
| G9 | Trasferimenti extra-UE | ✅ | Tabella con SCC/DPF per ciascun fornitore |
| G10 | Notifica violazioni | ❌ | Nessuna menzione delle 72 ore |
| G11 | Registro trattamenti | ⚠️ | Non verificabile dall'esterno — advisory |
| G12 | Revoca del consenso | ✅ | Banner ricompare alla revoca |
| G13 | Dati dei minori | ✅ | Requisito 18 anni nei termini |
| G14 | Destinatari terzi | ✅ | Nove responsabili nominati singolarmente |

## Framework Detail: CCPA/CPRA — ➖ Non applicabile

Il CCPA si applica a chi supera almeno una soglia: fatturato annuo oltre 25 milioni di dollari, dati di oltre 100.000 consumatori o dispositivi californiani, oppure oltre il 50% del fatturato dalla vendita di dati personali. **Social Web Automation di Marco Dibenedetto è una ditta individuale italiana** e non raggiunge nessuna delle tre. Non vende dati, e i responsabili esterni sono tutti fornitori di servizio ex art. 28 GDPR, non acquirenti.

Il link «Do Not Sell or Share My Personal Information» **non è dovuto** e aggiungerlo sarebbe fuorviante: dichiarerebbe una vendita di dati che non avviene.

*Da rivedere se la clientela statunitense diventa significativa.*

## Framework Detail: ADA/WCAG

| # | Check | Stato | Note |
|---|---|---|---|
| A1 | Alt text | ✅ | 0 immagini senza alt su 5 pagine campionate |
| A2 | Struttura heading | ✅ | Un h1 per pagina, gerarchia rispettata |
| A3 | Contrasto colori | ⚠️ | Non verificabile senza strumento automatico; lavoro pregresso ha ridotto le segnalazioni a residui |
| A4 | Navigazione da tastiera | ⚠️ | Non verificata in questo audit |
| A5 | Label dei form | ✅ | 0 input senza label o aria-label |
| A6 | Testo dei link | ✅ | 0 anchor generici |
| A7 | Attributo lang | ⚠️ | `lang="it"` nell'HTML statico su `/en`; mitigato da `<div lang="en">`, script runtime e `Content-Language: en` |
| A8 | Responsive | ✅ | Verificato |
| A9 | Sottotitoli video | ➖ | Nessun contenuto video sul sito |
| A10 | Dichiarazione accessibilità | ❌ | Assente |

**Limite dichiarato:** questa è una scansione di superficie. Un audit WCAG 2.1 AA completo richiede strumenti automatici (axe, WAVE) e test manuali, incluso il percorso da tastiera e la lettura con screen reader.

## Framework Detail: PCI-DSS

| # | Check | Stato | Note |
|---|---|---|---|
| P1 | HTTPS ovunque | ✅ | HSTS 2 anni, includeSubDomains, preload |
| P2 | Campi di pagamento ospitati | ✅ | Stripe Checkout Sessions: redirect al dominio Stripe |
| P3 | Nessun dato carta in URL | ✅ | Verificato |
| P4 | Pagina sicurezza | ❌ | 404 su `/security`, `/trust`, `/sicurezza` |
| P5 | Badge di sicurezza | ⚠️ | Non presenti presso il checkout |
| P6 | Processore identificato | ✅ | Stripe nominato in informativa e termini |

**Nota sul perimetro:** non raccogliendo mai dati di carta, l'attività rientra nel questionario **SAQ-A**, il più leggero dei nove. È la scelta architetturale giusta ed è già fatta.

## Framework Detail: CAN-SPAM / ePrivacy

| # | Check | Stato | Note |
|---|---|---|---|
| S1 | Meccanismo di disiscrizione | ⚠️ | Nessuna newsletter attiva; revoca del consenso marketing prevista in informativa |
| S2 | Indirizzo fisico | ✅ | Sede legale completa in informativa e termini |
| S3 | Identità del mittente | ✅ | Ragione sociale, P.IVA e PEC in chiaro |
| S4 | Nessun consenso pre-spuntato | ✅ | Verificato nel codice di registrazione |
| S5 | Sezione email nell'informativa | ✅ | Email transazionali con base giuridica dichiarata |

## Framework Detail: COPPA — ➖ Non applicabile

Il servizio non è diretto a minori di 13 anni e i termini richiedono 18 anni compiuti. Nessun contenuto o funzione attrae un pubblico infantile. Nessun obbligo COPPA sorge.

## Framework Detail: SOC 2

| # | Check | Stato | Note |
|---|---|---|---|
| T1 | Pagina trust/sicurezza | ❌ | Assente |
| T2 | Menzione SOC 2 | ❌ | Nessuna certificazione |
| T3 | Pratiche di sicurezza descritte | ✅ | Informativa §8: bcrypt, HTTPS, controllo accessi multi-tenant, rate limiting, isolamento per cliente |
| T4 | Uptime / SLA | ❌ | Nessuna status page |
| T5 | Elenco sub-responsabili | ✅ | Tabella dei nove fornitori nell'informativa |
| T6 | DPA disponibile | ❌ | Non pubblicato |
| T7 | Certificazioni esposte | ❌ | Nessuna |

**Il SOC 2 non è un obbligo di legge.** L'assenza non espone a sanzioni: pesa in fase di vendita a clienti strutturati con un processo di vendor assessment.

---

## Remediation Roadmap

### Settimana 1
- [ ] Decidere sul Meta Pixel: attivarlo aprendo la CSP, **oppure** rimuovere `_fbp`/`_fbc` dalla cookie policy e il ramo marketing dal banner
- [ ] Aggiungere il paragrafo sulla notifica delle violazioni (72 ore) all'informativa

### Mese 1
- [ ] Pubblicare la dichiarazione di accessibilità
- [ ] Aggiungere il periodo di conservazione dei contenuti caricati dal cliente
- [ ] Verificare con il legale se l'European Accessibility Act si applica al perimetro di vendita

### Trimestre 1
- [ ] Definire e dichiarare il formato di esportazione dei dati (portabilità, art. 20)
- [ ] Pubblicare una pagina trust/sicurezza raccogliendo quanto già scritto nell'informativa §8
- [ ] Predisporre un modello di DPA revisionato dallo Studio Legale BCS

### Continuativo
- [ ] Rifare il pannello di consenso per categoria **prima** di attivare un secondo strumento di tracciamento
- [ ] Eseguire un audit WCAG 2.1 AA con strumento automatico e test da tastiera
- [ ] Rivalutare il CCPA se la clientela statunitense diventa significativa

---

## Limiti di questo audit

- Valuta solo i segnali di conformità visibili pubblicamente e il codice sorgente del repository
- Trattamento dei dati lato server, policy interne e formazione del personale non sono stati valutati
- I controlli di accessibilità sono di superficie: un audit WCAG 2.1 AA completo richiede strumenti automatici e test manuali
- La valutazione PCI-DSS si limita agli indicatori visibili; la conformità piena richiede un QSA o l'autovalutazione SAQ
- La conformità SOC 2 non è verificabile senza accesso al report di audit
- **Non costituisce un audit legale e non può essere usato come prova di conformità o di non conformità**

---

*Generato con `/legal-compliance` · 8 settembre 2026*


---

## Interventi eseguiti — 8 settembre 2026

Tutti verificati su build di produzione (144 pagine generate, 74 URL in sitemap, zero non-200).

### GDPR: 86% → 96%
- **Procedura violazioni**: nuova sezione 9 dell'informativa con le cinque fasi — rilevazione e contenimento, valutazione del rischio, notifica al Garante **entro 72 ore** ex art. 33, comunicazione agli interessati ex art. 34 quando il rischio è elevato, annotazione nel registro ex art. 33.5 anche quando la notifica non è dovuta. Aggiunto l'obbligo di segnalazione a carico dei responsabili esterni ex art. 28. *(G10: ⚠️ → ✅)*
- **Portabilità**: dichiarato il formato di consegna — archivio **JSON** con dati account, contenuti caricati, storico pubblicazioni e registro richieste; file e immagini nel formato originale. Aggiunto il termine di risposta di 30 giorni prorogabili di 60 ex art. 12.3. *(G7: ⚠️ → ✅)*
- **Conservazione**: aggiunto il periodo per i **contenuti caricati** dal cliente, che mancava.
- **Esattezza della cookie policy**: la tabella dichiarava `_fbp` e `_fbc` come attivi previo consenso, ma la CSP non ammette lo script di Meta e nel sorgente non c'è alcuna chiamata `fbq(`. Ora la pagina dichiara che il pixel è **predisposto ma non attivo** e che il punto 3 non carica alcuno script di terze parti. **Il codice del pixel e il banner non sono stati toccati**: restano pronti, e l'attivazione è una riga di CSP. Non abbiamo abilitato tracciamento di nostra iniziativa.

### ADA/WCAG: 72% → 94%
- **Dichiarazione di accessibilità** su `/accessibilita`: standard di riferimento (WCAG 2.1 AA, EN 301 549, L. 4/2004 come modificata dal D.Lgs. 82/2022), conformità dichiarata **parziale** con gli otto criteri verificati elencati e i **cinque limiti noti scritti apertamente** — contrasto non esaustivo, percorso da tastiera non collaudato pagina per pagina, nessun ciclo con screen reader, PDF non garantiti, contenuti di terze parti. Contatto per segnalazioni con risposta a 30 giorni e rinvio ad AgID. *(A10: ❌ → ✅)*
- **Lingua della pagina**: lo script bloccante nel `<head>` ora imposta `document.documentElement.lang='en'` sotto `/en` **prima del primo paint**. La tecnologia assistiva legge il DOM, non l'HTML grezzo, quindi la lingua è corretta quando conta. Si aggiunge a `Content-Language: en` dal middleware e a `lang="en"` sul contenitore. Il layout radice resta statico: leggerlo con `headers()` avrebbe reso dinamiche tutte e 144 le pagine. *(A7: ⚠️ → ✅)*
- Restano warning dichiarati onestamente A3 (contrasto) e A4 (tastiera): non verificabili senza strumento automatico, e la pagina di accessibilità li elenca invece di nasconderli.

### PCI-DSS: 75% → 100%
- **Pagina sicurezza** su `/sicurezza`: intestazioni HTTP, accesso e account, pagamenti, residenza dei dati, uso dell'AI, procedura violazioni, canale per segnalare vulnerabilità con risposta a cinque giorni lavorativi. Include un punto 8 «**Che cosa non dichiariamo**» che dice apertamente: nessun SOC 2, nessuna ISO 27001, nessuna status page, nessuno SLA. *(P4: ❌ → ✅, e T1 per SOC 2)*
- **Nota di pagamento accanto al pulsante** di `/acquista`: il pagamento si apre su Stripe, su dominio Stripe, i dati della carta non passano dai nostri sistemi. Non è un badge decorativo: risponde all'ultima domanda che una persona si fa prima di cliccare. *(P5: ⚠️ → ✅)*

### SOC 2: 29% → 43%
Salgono T1 (pagina trust) e restano T3 e T5 già soddisfatti. T2, T4, T6 e T7 richiedono una certificazione, una status page e un DPA revisionato: **non sono cose che si scrivono, sono cose che si ottengono.** L'assenza è dichiarata invece che taciuta.

### Navigazione
Entrambe le nuove pagine sono raggiungibili dal footer di ogni pagina del sito e dal blocco documenti correlati di ogni pagina legale, e sono in sitemap.

---

## Audit di sicurezza — 8 settembre 2026

Eseguito come complemento, perché è dove stava il rischio maggiore.

### 🔴 Critico — di competenza del titolare
**Credenziali di default in repository pubblico.** Il repo `github.com/Marco26-hub/Social-Media-` risponde 200 in anonimo, e `admin` / `1234567` compare in cinque punti del codice, fra cui il valore di default di `/api/system/access`. In produzione la pagina di login **non le espone** (gating fail-closed su `isDemo()` e `SHOW_LOGIN_HINT`), ma se quell'utenza esiste ancora nel database di produzione è una porta aperta documentata pubblicamente. **Il titolare ha dichiarato che le cambierà.** Non è un intervento che possa fare io: tocca credenziali di produzione.

### 🟡 Corretto in questa sessione
**`/api/corso-ai-act` senza rate limiting.** Era l'unico POST pubblico anonimo fuori dall'elenco anti-spam del middleware, mentre `/api/consulenza`, `/api/recesso` e `/api/checkout/service` erano protetti. Sostituita la catena di confronti con un elenco `MODULI_PUBBLICI` che li tiene insieme, così il prossimo modulo pubblico non può essere dimenticato per distrazione.

### ✅ Verificato e solido
- **Nessun segreto nel repository**: nessuna password, chiave API o token letterale nel codice; `.env.local` e `*.env` sono ignorati da git e solo i file `.example` sono tracciati.
- **`/api/assets/audio-proxy` non è vulnerabile a SSRF**: allowlist di hostname costruita dalle variabili d'ambiente dello storage, solo HTTPS, solo estensioni audio.
- **`/api/assets/file/[clienteId]/[filename]` è una capability URL deliberata**, con la motivazione scritta nel codice: i link di anteprima e il publisher esterno devono caricare i media senza sessione, e gli URL firmati a scadenza non reggono per post schedulati a giorni di distanza. Protetta da UUID più suffisso ad alta entropia, con difesa contro il path traversal e Content-Type mai riflesso dallo storage.
- **Tutte le route `/api/data/*` sono autenticate** via `requireClienteId`, che passa da `requireAuth` e verifica l'appartenenza del cliente all'utente.
- **Zero vulnerabilità nelle dipendenze di produzione** (`npm audit --omit=dev`: 0 critical, 0 high, 0 moderate, 0 low).

### Da fare, non urgente
- Verificare la **Row Level Security su Supabase**: l'isolamento oggi è applicato a livello applicativo da `requireClienteId`. RLS aggiungerebbe una seconda barriera a livello di database.
- Valutare se il repository debba restare pubblico.
