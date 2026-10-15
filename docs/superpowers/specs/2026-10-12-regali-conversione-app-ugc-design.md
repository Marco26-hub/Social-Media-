# Pagina regali che converte e app UGC nel link segreto — design

Data: 2026-10-12 · Stato: approvato il 2026-10-14, con la correzione sulla consegna della PR 1 (§8) · Branch: `feat/regali-page` (PR 1), `feat/regali-app-ugc` (PR 2)
Parte da: [2026-10-10-download-area-design.md](2026-10-10-download-area-design.md) (area download segreta, già online)

## Scopo

Chi segue la campagna social riceve il link segreto `/download/<codice>` e arriva quasi sempre dal telefono, dentro il browser di Instagram o Facebook. Oggi la pagina consegna i materiali e finisce lì. Deve diventare uno strumento che converte: prima il regalo, poi una sola richiesta.

Successo vuol dire:

- su telefono i regali sono nel primo schermo e si aprono anche dal browser interno di Instagram e Facebook, con un aiuto quando serve;
- dopo il regalo la pagina chiede una cosa sola: il **contenuto di prova gratuito**, su WhatsApp SWA, con un messaggio già scritto che contiene la frase marcatore «Ho preso i regali SWA»;
- chi ha il link usa l'**app UGC** senza account, con la propria chiave Gemini, e la chiave non passa dai server SWA;
- il team cambia i testi della campagna e mostra o nasconde l'app dal pannello, senza deploy;
- chi apre un link sbagliato o vecchio trova una 404 pubblica con testata e footer SWA, che non nomina i regali.

Fuori scopo:
- contatori e statistiche;
- bonus e limite settimanale delle prove;
- liste email;
- pixel o eventi Meta su `/download`;
- pagina «regalo chiuso» per i codici vecchi;
- versione inglese;
- la 404 del resto del sito: va rifatta, ma come lavoro a parte;
- l'app UGC del marketplace (repo BCS_app_store): passaggio del video a Omni, lavoro a parte già deciso.

**Prerequisito di lancio, non di codice.** Le password degli account `admin` e `cliente` vanno cambiate prima di pubblicare il link. Il seed `db/migrations/011_admin_user.sql` è nel repo pubblico e HANDOFF.md:449 dice che `admin`/`1234567` resta valido. Chi entra in `/admin/download` può sostituire i regali con file malevoli, e la campagna li distribuirebbe con il marchio SWA.

## Decisioni prese

| Tema | Decisione | Motivo |
|---|---|---|
| Conversione | Contenuto di prova gratuito via WhatsApp SWA (`393477196603`), messaggio precompilato con la frase marcatore | Scelta del titolare. È l'offerta che la home usa già (`app/(it)/page.tsx:53,203`) |
| Chi risponde | Il WhatsApp SWA già usato in tutto il sito | Scelta del titolare. Marco va informato della campagna |
| Misura | Solo frase marcatore ed etichetta «Regali» su WhatsApp Business; nessun dato nuovo raccolto | Lo spec del 10/10 esclude statistiche e trattamenti nuovi. I contatori anonimi restano una decisione futura |
| Testi | Occhiello, titolo, sottotitolo e messaggio WhatsApp modificabili dal pannello; un campo vuoto usa il testo standard | Scelta del titolare: la pagina segue i post senza deploy |
| App UGC | Porting dell'app del marketplace su `/download/<codice>/app-ugc`, eseguita tutta nel browser con la chiave del visitatore | Scelta del titolare (strada A): niente login, niente `/tools`, nessun costo server |
| Modelli | Testo `gemini-3.8-flash`, immagine `gemini-3.1-flash-image`, video `gemini-omni-1.1-flash` (Interactions API) | Google spegne `veo-3.1-*-preview` il 22/10/2026 e indica Omni come sostituto. I modelli 2.5 sono limitati per le chiavi nuove |
| Banner cookie e Odino | Non montati su `/download/*` | Lì non parte nessuna misura che richieda consenso. Il primo schermo resta ai regali |
| Rotazione | Lo stesso link vale per più campagne. Si rigenera solo se trapela. Per ritirare un file si elimina la scheda | Rigenerare cambia solo il codice: gli URL dei file su Blob restano validi (spec del 10/10, §5) |

## 1. Pagina regali `/download/[codice]`

File: `app/(it)/download/[codice]/page.tsx` e `download.module.css`. Il controllo del codice non cambia: formato errato, codice diverso o nessun codice danno `notFound()`.

Ordine delle sezioni, pensato per un telefono largo 390px:

1. **`PublicHeader`**: CTA «Richiedi una prova», con lo stesso link WhatsApp della sezione 4. Sotto i 1180px la testata nasconde le azioni (`components/public-header.module.css:94-97`), quindi la conversione la fanno le CTA dentro la pagina.

2. **Avviso browser in-app**: solo se lo user-agent è di Instagram o Facebook (§2).

3. **Apertura compatta**.
   - Testi standard (il pannello li sostituisce):
     - occhiello: «Riservato a chi ha il link»;
     - titolo: «Ecco i tuoi regali.»;
     - sottotitolo: «Si aprono subito: niente email, niente registrazione. Sono tuoi.»
   - Si riusano `pageStyles.hero`, `.eyebrow` e `.lead`. In `download.module.css` una regola valida solo sotto i 700px riduce padding e corpo del titolo, perché i regali entrino nel primo schermo.
   - La sezione separata «Materiali disponibili» sparisce: al suo posto c'è un'intestazione piccola «I tuoi regali · {n}».

4. **Regali**.
   - **Dalla PR 2: prima scheda, se l'interruttore è attivo: l'app UGC**, fissa nel codice:
     - titolo: «App UGC: dalla foto del prodotto al video»;
     - descrizione: «Carichi la foto del tuo prodotto e l'app prepara un'immagine e un video in stile UGC per Reels e TikTok. Funziona con la tua chiave Gemini: l'app è gratuita, immagini e video li paghi a Google.»;
     - pulsante: «Apri l'app». È un link interno a `/download/<codice>/app-ugc`, costruito con il codice della pagina: quando il codice cambia, il link cambia da solo.
   - **Poi le schede del pannello**, come oggi.
   - `describeItem` dà al pulsante un'etichetta per tipo, ricavata dal tipo canonico già salvato:
     - «Scarica il PDF», «Scarica lo ZIP», «Scarica l'immagine», «Scarica il video», «Scarica il file» per gli altri tipi;
     - «Apri il link» per i link esterni;
     - «Scrivici su WhatsApp» quando il link punta a `wa.me`.
   - Il peso resta nella riga dei metadati.
   - **Nel browser in-app** (opzione `{ inApp: true }`):
     - PDF, immagini e video si aprono con `url`, cioè nel visore, invece di `downloadUrl`, che forza lo scaricamento; le etichette diventano «Apri il PDF», «Apri l'immagine», «Guarda il video»;
     - gli ZIP e i file Office o di testo mostrano sotto il pulsante «Da Instagram o Facebook potrebbe non scaricarsi: apri la pagina nel browser (istruzioni in alto).»
   - Sotto i 700px la scheda diventa più compatta: icona più piccola e titolo più corto in altezza. Il pulsante resta a tutta larghezza.
   - Lista vuota e app spenta: «Il regalo sta arrivando. Intanto, se vuoi vedere cosa possiamo fare per te, scrivici.», con il link WhatsApp.

5. **Ponte `#prova`**: è la conversione primaria.
   - Occhiello «Il passo dopo, solo se ti serve». H2 «Preferisci che lo facciamo noi?».
   - Testo: «I regali servono a farti risparmiare tempo. Se il tempo proprio non c'è, scrivici su WhatsApp di cosa ti occupi: prepariamo un contenuto di prova gratuito sul tuo caso. Lo guardi, lo giudichi, poi decidi tu.»
   - Tre passi:
     1. «Scrivi»: «Il messaggio è già pronto: aggiungi solo di cosa ti occupi.»
     2. «Ti risponde una persona»: «Raccontaci la tua attività, anche con una foto del prodotto.»
     3. «Ricevi la prova»: «Se ti convince ne parliamo, con prezzi già pubblici. Se no finisce lì, e i regali restano tuoi.»
   - Pulsante primario «Chiedi il contenuto di prova gratuito».
   - Riga sotto: «Si apre WhatsApp con il messaggio già scritto. Non si apre? Scrivi al +39 347 719 6603.» Il numero viene da `TITOLARE.telefono` in `lib/legal-config.ts`.
   - Messaggio precompilato standard, che il pannello può sostituire: «Ciao! Ho preso i regali SWA. Vorrei un contenuto di prova gratuito per la mia attività. Mi occupo di: »
   - Si riusano `.section`, `.sectionHeading`, `.stepGrid` e `.primary` di `styles/content-page.module.css`.

6. **Chi ti fa questi regali**.
   - Testo: «Social Web Automation è la ditta di Marco Dibenedetto, a Cermenate (CO): siti, social e automazioni per PMI e professionisti. Il lavoro lo coordina una persona sola, con specialisti area per area, e nulla esce senza il tuo via libera.»
   - Le tre prove sono l'array `CASES` della home, spostato in `lib/prove.ts` e importato sia dalla home sia da qui: una sola fonte per i numeri.
   - Riga prezzi: «Prezzi pubblici: gestione social {PREZZI.presenza}, sito {PREZZI.web}, IVA esclusa.» con un link a `/pacchetti`. `PREZZI.web` contiene già «a partire da»: non va preceduto da «da».

7. **Domande frequenti**, con `details`/`summary` e `.faqLayout`/`.faqList`, senza JavaScript.
   - «Devo lasciare email o registrarmi?» → «No. Chi ha il link apre e scarica, senza registrazione. Non ti chiediamo nessun dato: il server registra solo i log tecnici descritti nell'informativa privacy.»
   - «Da Instagram il file non si scarica: che faccio?» → «Instagram e Facebook aprono i link in un browser interno che a volte blocca i download. Apri la pagina nel browser del telefono: tocca il menu in alto a destra e scegli di aprirla nel browser. Da lì il file si salva.»
   - «Il contenuto di prova è davvero gratis?» → «Sì: un contenuto sul tuo caso reale, senza carta e senza contratto. Serve a farti giudicare tono, qualità e metodo prima di decidere qualsiasi cosa.»
   - «Cosa succede se vi scrivo su WhatsApp?» → «Ti risponde una persona. Ci dici di cosa ti occupi, prepariamo la prova e te la mandiamo. Nessun messaggio promozionale senza il tuo sì.»
   - «Quanto costa se poi volete farlo voi?» → «I prezzi sono pubblici: gestione social {PREZZI.presenza}, sito {PREZZI.web}, IVA esclusa. I dettagli sono nella pagina Pacchetti.»
   - «Posso girare il link a un collega?» → «Sì, puoi girarlo a chi vuoi.»
   - Dalla PR 2, solo con l'app attiva: «L'app UGC è gratis davvero?» → «L'app sì. La generazione la fa Google con la tua chiave: l'analisi del prodotto rientra nel livello gratuito, mentre immagini e video richiedono la fatturazione attiva sul tuo progetto Google e li paghi a Google, non a noi.»

8. **Chiusura** (`.finalCta`).
   - Occhiello «Nessuna fretta». H2 «I regali sono tuoi comunque.»
   - Testo: «Se ti serve una mano a usarli, o preferisci che il lavoro lo facciamo noi, scrivici: il primo contenuto di prova è gratis.»
   - Pulsante «Scrivici su WhatsApp», con lo stesso link del ponte.
   - Riga: «I prossimi regali li annunciamo su Instagram: segui @socialwebautomation.» Il link è quello del footer (`NEXT_PUBLIC_INSTAGRAM_URL` con ripiego).

9. **`PublicFooter` e `FloatingNavigation`**: invariati.

**Metadata**
- `title`: «I tuoi regali | Social Web Automation». `robots` non cambia.
- `openGraph` e `twitter` sono propri, con immagine `anteprimaOg('/regali')`. In `lib/anteprima.ts` si aggiunge la voce fissa `'/regali'`:
  - occhiello «Regali»;
  - titolo «I regali di Social Web Automation.»;
  - sottotitolo «Materiali gratuiti per chi ci segue: si aprono subito, senza registrazione.»;
  - tinta `verde`.
- **Mai** `anteprimaOg` con il percorso che contiene il codice: finirebbe nell'URL dell'immagine.

**404 del segmento**
- `app/(it)/download/[codice]/not-found.tsx` è pubblica: `PublicHeader`, `PublicFooter`, H1 «Questa pagina non esiste o non è più disponibile.», pulsanti «Vai alla home», «Seguici su Instagram» e «Scrivici su WhatsApp».
- Non nomina regali né campagne.
- Vale solo per `/download/*`: la 404 del resto del sito non cambia.

**Banner cookie e Odino**
- Un nuovo componente client `components/SiteOverlays.tsx` monta `Odino` e `CookieBanner`, tranne quando `isDownloadPath(pathname)` è vero. Sostituisce i due componenti in `app/(it)/layout.tsx`.
- Su `/download` Odino non viene montato affatto: niente precaricamento delle sue immagini.
- Un test di guardia fallisce se su `/download` compare qualcosa che chiede consenso, cioè `MetaPixel` acceso o una chiamata CAPI, senza che il banner torni.

## 2. Aiuto per il browser in-app

- `lib/in-app-browser.ts` è puro, con test. La funzione `detectInAppBrowser(userAgent)` restituisce `{ app: 'instagram' | 'facebook' | null, os: 'ios' | 'android' | 'other' }`.
  - Instagram: `Instagram`.
  - Facebook: `FBAN`, `FBAV`, `FB_IAB`.
  - Sistema: iPhone/iPad/iPod contro Android.
- La pagina legge lo user-agent lato server con `headers()`: è già `force-dynamic`.
- **Avviso Android**: «Sei nel browser di Instagram. Per salvare i file sul telefono apri la pagina in Chrome.» (o Facebook). Il pulsante «Apri in Chrome» è un link `intent://` verso Chrome costruito da `SITE_URL` e dal percorso, con `S.browser_fallback_url` uguale all'indirizzo https della pagina.
- **Avviso iPhone**: «Sei nel browser di Instagram. I PDF si aprono qui; se un file non si scarica, apri la pagina in Safari dal menu in alto.» Il pulsante «Copia il link» è una piccola isola client con `navigator.clipboard` e un ripiego sulla selezione del testo. Copia l'indirizzo senza parametri di query (`fbclid` compreso). Conferma: «Link copiato: incollalo in Safari.»
- I nomi esatti delle voci di menu cambiano con versione e lingua dell'app, quindi i testi non li citano.
- Testi e superfici dell'avviso usano token fissi, non quelli che si invertono nel tema scuro (regola sul contrasto in HANDOFF.md).

## 3. App UGC `/download/[codice]/app-ugc`

**Pagina server.** `app/(it)/download/[codice]/app-ugc/page.tsx`:
- stesso controllo del codice della pagina regali; in più, con l'interruttore «Mostra l'app UGC» spento risponde `notFound()`;
- metadata noindex e titolo «App UGC | Social Web Automation»;
- link «← I tuoi regali» verso la pagina del codice;
- monta il componente client dell'app.

**Porting.** Si parte dall'app del marketplace BCS_app_store:
- `src/components/apps/UgcWorkspace.tsx` e `src/components/apps/ugc/ConfigurationScreen.tsx`;
- `src/apps/ugc/{constants,types,image-data}.ts`;
- i prompt delle rotte `app/api/ugc/{prompt,image,video-prompt,video}`.

Il flusso resta lo stesso:
1. chiave;
2. fino a 3 foto PNG, JPEG o WEBP;
3. opzioni (stile, pubblico, piattaforma, stile UGC, lingua, caos, dimensioni);
4. prompt immagine modificabile;
5. immagine;
6. prompt video modificabile;
7. video;
8. download e condivisione.

Cosa cambia rispetto all'originale:

- **Dove sta il codice.** I componenti in `components/regali-ugc/` e la logica in `lib/regali-ugc/`.
- **Logica pura, con test.** `prompts.ts` (i testi dei prompt copiati parola per parola dalle rotte BCS), `models.ts`, `errors.ts`, `image-resize.ts`.
- **Chiamate a Google.** `gemini.ts` le fa dal browser con `@google/genai` (versione ≥ 2.3, necessaria per l'Interactions API), caricato con `import()` dinamico solo nella pagina dell'app.
- **Cosa si toglie.** Crediti, Stripe, modale crediti, `claim-free`, Clerk/SSO, il percorso base `/tools`, testi «BCS AI».
- **Lingua.** Tutta l'interfaccia è in italiano. Le opzioni si mostrano tradotte, ma ai prompt arrivano i valori inglesi originali.
- **Stile.** Il CSS `.ugc-workspace` (`app/globals.css:130-1108` di BCS, senza le regole `.ugc-modal-*`) diventa un foglio dedicato, importato solo dalla pagina dell'app, con tutte le regole sotto `.ugc-workspace`. Il tema scuro segue `html[data-theme='dark']` come nel resto del sito.
- **Modelli.** Sono costanti in `lib/regali-ugc/models.ts`:
  - testo `gemini-3.8-flash`;
  - immagine `gemini-3.1-flash-image`;
  - video `gemini-omni-1.1-flash`.
- **Video.** Si genera con `interactions.create`:
  - `input` = immagine generata + prompt video;
  - `response_format` = video, `720p`, formato **9:16 di default** con scelta 16:9;
  - esecuzione in background e polling.

  Il meccanismo esatto (background, `delivery: 'uri'`, download del file) lo fissa la verifica tecnica del §5. Il prompt video continua a chiedere circa 8 secondi, con audio nella lingua scelta.
- **Foto.** Prima dell'invio si riducono nel browser a lato lungo massimo 1536px, JPEG qualità 0,85. Il limite di 10 MB vale per il file scelto.
- **Errori.** Restano sul passo corrente con «Riprova»: un errore sul video non cancella l'immagine già pagata. Le risposte vuote o bloccate dai filtri di sicurezza mostrano il motivo invece di un prompt di ripiego inventato. Mappa minima in `errors.ts`:

  | Errore | Messaggio |
  |---|---|
  | 400 `API_KEY_INVALID` | «La chiave non è valida: copiala di nuovo da Google AI Studio.» |
  | 400 `FAILED_PRECONDITION` | «Per immagini e video serve la fatturazione attiva sul tuo progetto Google.» |
  | 403 | «La chiave non ha accesso a questo modello o all'API Gemini.» |
  | 404 | «Questo modello non è disponibile per la tua chiave.» |
  | 429 | «Limite di utilizzo raggiunto: attiva la fatturazione o riprova più tardi.» |
  | 5xx | «Google è momentaneamente sovraccarico: riprova tra poco.» |

- **Ripresa del video.** L'identificativo della generazione in corso si salva in `sessionStorage`. Al ritorno sulla pagina (`visibilitychange`) il polling riprende. Il limite massimo di attesa è 10 minuti, dopo «Il video ci sta mettendo troppo: riprova».
- **Download e condivisione.** Il video resta come `Blob` in memoria. Gli URL oggetto vengono revocati quando l'utente rigenera o ricomincia. `navigator.canShare` va controllato prima dell'uso. Dopo il download su iPhone: «Lo trovi in File › Download».

**Chiave del visitatore.**
- Campo password. Per default la chiave resta solo in memoria.
- La casella «Ricorda la chiave in questa scheda» la salva in `sessionStorage` (`swa-regali-gemini-key`).
- Va solo verso `generativelanguage.googleapis.com`: mai ai server SWA, mai nei log.

**Testi fissi nell'app.**
- **Costi:** «L'app è gratuita. La generazione la fa Google con la tua chiave: l'analisi del prodotto rientra nel livello gratuito; immagini e video richiedono la fatturazione attiva e costano circa 0,07 $ per immagine e 0,10 $ per secondo di video (listino Google, ottobre 2026). Li paghi a Google, non a noi.»
- **Guida «Come ottenere la chiave»**, aperta e chiusa con `details`:
  1. «Apri aistudio.google.com in Chrome o Safari, non dal browser di Instagram: meglio ancora da computer.»
  2. «Entra con il tuo account Google e crea una chiave API.»
  3. «Per immagini e video attiva la fatturazione sul progetto e imposta un avviso di budget.»
  4. «Incolla qui la chiave. Quando hai finito puoi revocarla. Non mandarla a nessuno, nemmeno a noi.»
- **Trasparenza AI:** «Immagini e video sono generati con l'intelligenza artificiale: dichiaralo quando li pubblichi e non usarli come recensioni di clienti reali.», con il link a `/trasparenza-ai`.

**CSP.** In `next.config.mjs` la voce `/download/:path*` (già dopo `/:path*`) riceve una CSP propria: quella globale con `https://generativelanguage.googleapis.com` in `connect-src`, più l'host di download del video se la verifica del §5 ne trova uno diverso. Le altre direttive restano uguali, perché `img-src` e `media-src` ammettono già `data:` e `blob:`. Il resto del sito non cambia.

**Dipendenza.** `@google/genai`, con la versione esatta fissata dopo la verifica del §5, e almeno la 2.3.0.

## 4. Pannello `/admin/download`: testi della campagna

**Migrazione `053_download_page_settings.sql`**
- Tabella `download_page_settings`, una sola riga, come `download_access`:
  - `id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1)`;
  - `eyebrow text`, `title text`, `lead text`, `whatsapp_text text`, tutte nulle ammesse;
  - `show_ugc boolean NOT NULL DEFAULT false`;
  - `updated_at timestamptz NOT NULL DEFAULT now()`.
- RLS attiva e REVOKE per `anon`/`authenticated`, con lo stesso blocco della 052. Nessun INSERT nel file.
- È una tabella separata dal codice, così i testi si salvano anche prima di generare il link e la rotazione non li tocca.

**Logica pura** (`lib/download-area.ts`, con test)
- Costanti `DEFAULT_PAGE_TEXTS` con i testi standard del §1.
- `validatePageSettings(input)`: toglie gli spazi in eccesso; una stringa vuota diventa `null`, cioè testo standard. Limiti:
  - occhiello ≤ 60;
  - titolo ≤ 90;
  - sottotitolo ≤ 240;
  - messaggio WhatsApp ≤ 300;
  - `show_ugc` booleano.
- `resolvePageTexts(settings)` unisce i valori salvati ai testi standard.
- `buildRegaliWhatsAppUrl(text)` costruisce il link `wa.me` codificato.
- `hasMarkerPhrase(text)` controlla la frase marcatore, senza distinguere maiuscole e minuscole.

**Database** (`lib/download-area-db.ts`)
- `getPageSettings()`: se la riga non c'è restituisce i valori nulli.
- `savePageSettings()`: upsert sulla riga 1.
- La pagina pubblica, se la lettura fallisce o la tabella manca (migrazione non ancora applicata), usa i testi standard e l'app spenta. La pagina non va mai in errore per i testi.

**API.** `app/api/admin/downloads/settings/route.ts`:
- GET restituisce i valori salvati e quelli standard;
- PUT valida e salva;
- entrambe passano da `requireDownloadAdmin()`.

**Interfaccia.** `PageTextsSection.tsx`, tra «Link segreto» e «Aggiungi»:
- quattro campi con contatore di caratteri e il testo standard come segnaposto;
- dalla PR 2, l'interruttore «Mostra l'app UGC tra i regali». Nella PR 1 la colonna `show_ugc` esiste e l'API la valida, ma il pannello non la mostra e la pagina pubblica la ignora;
- «Salva i testi»;
- l'avviso, se il messaggio WhatsApp non contiene la frase: «Senza "Ho preso i regali SWA" non riconosci le chat che arrivano dalla campagna»;
- il link «Apri la pagina» per controllare il risultato.

## 5. Verifica tecnica preliminare (prima della PR 2)

Nessuna documentazione Google dice se l'Interactions API e il download del video funzionano dal browser (CORS). Prima di scrivere l'app:

1. **Pagina di prova locale.** Una pagina provvisoria, non pubblicata, su `localhost` con la CSP prevista. Il **titolare** incolla la propria chiave: io non inserisco chiavi vere. La pagina esegue:
   - una chiamata testo;
   - una chiamata immagine;
   - un video Omni da un'immagine;
   - il polling;
   - il download del file.
2. **Cosa si registra:**
   - se ogni chiamata passa;
   - gli host coinvolti, compresi eventuali redirect del download;
   - la forma delle risposte;
   - i tempi;
   - la dimensione del video.
3. **Esito:**
   - se tutto passa dal browser: strada A pura;
   - se si blocca solo il download del file: ripiego con una rotta same-origin `/download/[codice]/app-ugc/video`. Riceve il riferimento al file e la chiave in un header, scarica da Google e restituisce lo stream. Non salva né registra la chiave, controlla il codice e ha un rate limit dedicato. Va scritto in un'aggiunta a questo spec prima di procedere.

## 6. Sicurezza, privacy, testi legali

- Su `/download` nessun pixel, nessuna CAPI, nessun cookie nuovo. `pathForTelemetry` e l'esclusione di `MetaPixel` restano.
- Il codice non esce: `no-referrer` resta, l'immagine di anteprima è fissa, il link «Copia» toglie i parametri di query.
- La chiave Gemini va solo dal browser a Google, salvo il ripiego del §5, che va approvato a parte.
- La CSP più larga vale solo su `/download/*`.
- I prompt dell'app finiscono nel codice del sito, che è pubblico. È accettato: anche il repo BCS è pubblico.
- Da far validare allo Studio BCS prima del lancio:
  - le frasi su costi e «gratis» (Codice del Consumo);
  - la nota di trasparenza AI (art. 50 dell'AI Act);
  - la FAQ privacy.
- Fuori da questo lavoro, ma da segnalare: l'informativa privacy non elenca Vercel e Supabase tra i sub-responsabili (`lib/legal-config.ts:39-52`), e manca un tempo di conservazione per i contatti WhatsApp.

## 7. Test

Runner esistente: `playwright/test` con `node:assert`. Su Windows si lancia con `npx playwright test <file> --workers=1`.

- **`lib/download-area.test.ts`:**
  - etichette per tipo, modalità in-app e regola `wa.me` di `describeItem` (si aggiornano i test esistenti delle etichette);
  - `validatePageSettings` (limiti, vuoto → `null`, tipi sbagliati rifiutati);
  - `resolvePageTexts`;
  - `buildRegaliWhatsAppUrl` (codifica, numero);
  - `hasMarkerPhrase`.
- **`lib/in-app-browser.test.ts`:** user-agent reali di Instagram su iOS e Android, Facebook su iOS e Android, Safari, Chrome e desktop.
- **`lib/regali-ugc/*.test.ts`:**
  - i prompt generati sono identici a quelli delle rotte BCS a parità di input;
  - la mappa degli errori;
  - il calcolo delle dimensioni di riduzione delle foto;
  - le costanti dei modelli.
- **Test di guardia:** `SiteOverlays` non monta banner e Odino su `/download/*` e li monta altrove; `MetaPixel` resta escluso.
- `npm run lint`, controllo dei tipi e `npx next build`. Mai `npm run build`, che scarica Chromium e notifica IndexNow.
- **Prova dell'interfaccia:** in modalità demo il pannello non è disponibile (serve il database reale) e la pagina pubblica risponde 404. Pannello e pagina si provano quindi sull'anteprima Vercel della PR, se è collegata al database, altrimenti in produzione dopo il merge, con il codice di prova.
- **Prova finale del titolare sul telefono:** iPhone e Android, dentro Instagram e Facebook, poi Safari e Chrome:
  - PDF, ZIP e immagine;
  - «Apri in Chrome» e «Copia il link»;
  - passaggio a WhatsApp;
  - l'app UGC dall'inizio al video scaricato;
  - tema scuro.

## 8. Consegna

1. **PR 1 (`feat/regali-page`):** sezioni 1, 2 e 4, più `SiteOverlays`, 404 del segmento e voce di anteprima. **Senza** scheda app, FAQ sull'app e interruttore nel pannello: senza la rotta `app-ugc` il pulsante «Apri l'app» porterebbe a una 404. La migrazione 053 si applica in produzione con il runner (`npm run migrate`, checksum sul file LF) prima o dopo il merge: la pagina usa i testi standard finché la tabella manca.
2. **Verifica tecnica del §5**, con il titolare.
3. **PR 2 (`feat/regali-app-ugc`):** sezione 3, CSP e dipendenza, più scheda app, FAQ sull'app e interruttore nel pannello.
4. **Dopo ogni deploy:** controllo in produzione con il codice di prova. Prima del lancio:
   - password `admin`/`cliente` cambiate;
   - regali veri caricati;
   - testi della campagna salvati;
   - interruttore dell'app acceso;
   - Marco informato che le richieste di prova arrivano sul suo WhatsApp.
5. **A parte, in BCS_app_store:** il video dell'app del marketplace passa da `veo-3.1-generate-preview` a `gemini-omni-1.1-flash` prima del 22/10/2026, su un branch separato.
