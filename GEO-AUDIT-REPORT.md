# Audit GEO + SEO — socialautomation.app

**Data:** 7 settembre 2026
**Tipo di attività:** agenzia/servizi digitali per PMI italiane
**Pagine analizzate:** 55 (tutte quelle in sitemap, tutte HTTP 200)
**Metodo:** crawl reale della produzione, cinque analisi specialistiche in parallelo, verifiche esterne su Wikipedia, Wikidata, LinkedIn, YouTube, Reddit e registri imprese.

---

## Sintesi

**Punteggio GEO complessivo: 50/100 (Insufficiente)**

Il sito è **tecnicamente eccellente e pubblicamente inesistente**. Ogni cosa che dipende dal codice funziona: 89/100 sul tecnico, Core Web Vitals tutti in fascia verde, contenuto interamente server-side (98,8% delle frasi presenti nell'HTML grezzo, senza JavaScript), crawler AI ammessi esplicitamente, `llms.txt` scritto bene, 281 blocchi domanda-risposta.

Ogni cosa che dipende da terzi è a zero: **6/100 di autorità di marca**. Nove ricerche indipendenti non restituiscono mai il sito. Niente Wikipedia, niente Wikidata, LinkedIn 404, YouTube 404, zero recensioni, zero menzioni.

Peggio: **la stringa con cui l'azienda si presenta appartiene già ad altri tre soggetti**, uno dei quali fa lo stesso identico mestiere in Italia. Cercando `"socialautomation.app"` fra virgolette, l'unico risultato italiano pertinente è **socialautomation.it di Frosinone**. Il dominio non contiene la parola *Web*, che è proprio quella che distinguerebbe il brand.

Il collo di bottiglia non è la qualità del sito. È che nessuna fonte esterna conferma che questa azienda esista.

### Punteggi

| Categoria | Punteggio | Peso | Pesato | Osservazione |
|---|---|---|---|---|
| Citabilità AI | 58/100 | 25% | 14,5 | 281 Q&A ottime, ma 1 sola tabella su 55 pagine e zero dati sul mondo |
| Autorità di marca | 6/100 | 20% | 1,2 | Nessuna fonte terza. Tre omonimi occupano il nome |
| Contenuti E-E-A-T | 53/100 | 20% | 10,6 | Trasparenza forte, autorevolezza a 8/25 |
| Tecnico | 89/100 | 15% | 13,35 | La parte migliore del sito |
| Dati strutturati | 51/100 | 10% | 5,1 | Impianto solido, prezzi contraddittori (corretti oggi) |
| Piattaforme AI | 51/100 | 10% | 5,1 | Copilot 63, Gemini 39 |
| **Totale** | | **100%** | **49,9/100** | |

---

## Corretto durante l'audit

Tre difetti trovati e già risolti, in produzione:

1. **I dati strutturati dichiaravano prezzi di due listini fa.** `components/JsonLd.tsx` diceva Presenza 390 € e Crescita 790 €, contro i 490 € e 990 € pubblicati ovunque. Il componente sta nel layout: **tutte e 55 le pagine** trasmettevano il listino sbagliato a ogni motore di ricerca e a ogni sistema di risposta AI. Su `/pacchetti` convivevano entrambe le versioni. I prezzi ora derivano da `lib/pacchetti.ts`.

2. **Due affermazioni false nella stessa descrizione**: «gestione di tre social» (sono due, a scelta del cliente) e «gestione di una campagna ADS», mentre il sito dichiara ovunque che le campagne a pagamento sono escluse dai piani.

3. **La tabella di confronto di `/pacchetti` non aveva la riga del prezzo** e diceva ancora che Crescita include 1 campagna ADS. Ora ha il prezzo — il dato più estraibile del sito — e distingue la campagna promozionale organica, compresa, dalle campagne a pagamento, su richiesta.

Il commento in `lib/prezzi-ingresso.ts` documentava già questo identico errore, commesso e corretto una volta su `llms.txt`. La centralizzazione era stata fatta per le pagine, non per lo schema.

---

## Critico

### 1. Collisione di identità con tre omonimi

Esistono almeno quattro soggetti sulla stringa «Social Automation»:

| Soggetto | Attività | Gravità |
|---|---|---|
| **socialautomation.it** | Gestione social a Frosinone. Stesso mestiere, stesso paese, stessa promessa | **Critica** |
| swautomation.io | Si presenta come «SWA» | Alta |
| socialautomation.es | Infoprodotto spagnolo | Alta |
| facebook.com/SocialAutomation | Pagina omonima | Media |

Il dominio è la chiave di entità più forte dopo il nome, e `socialautomation.app` è esattamente la stringa dei concorrenti senza la parola che dovrebbe distinguerla. Alla domanda «cos'è Social Automation?» in italiano, oggi, la risposta più probabile è Frosinone.

**Difesa già in campo, da sfruttare:** lo schema espone `vatID: IT03786790133` e la sede a Cermenate. La partita IVA è l'identificatore che nessun omonimo può replicare.

**Da fare:** usare sempre «Social Web Automation» per esteso, mai «Social Automation» da solo; aggiungere `disambiguatingDescription` e `identifier` allo schema; aprire una voce Wikidata con P.IVA, sede e sito ufficiale.

### 2. Zero menzioni di terzi

| Piattaforma | Stato |
|---|---|
| Wikipedia IT/EN | Assente (API interrogata) |
| Wikidata | Assente (zero entità) |
| LinkedIn azienda | **404** su entrambe le varianti di URL |
| YouTube | **404** |
| Reddit, forum | Zero menzioni |
| Trustpilot, G2, Capterra | Zero |
| Google Business Profile | Assente. A Cermenate presidia il Knowledge Panel un concorrente con 5,0 su 14 recensioni |
| `sameAs` nello schema | 2 sole voci: Instagram e un Facebook con URL numerico |

Un modello non cita un'entità che nessuno oltre a lei stessa conferma.

### 3. Zero citazioni in uscita su 49 pagine su 55

I 184 link esterni del sito sono **solo** `wa.me`, Instagram e Facebook. Le uniche citazioni reali stanno sulle pagine legali.

Il caso peggiore: `/blog/ai-act-obblighi-pmi-cosa-fare` nomina il «Regolamento (UE) 2024/1689», elenca cinque scadenze corrette, descrive bene la distinzione fornitore/utilizzatore — **senza un link a EUR-Lex e senza citare un numero di articolo**. Il contenuto è già giusto: manca solo la prova.

---

## Alto

### 4. Il 62% degli H1 non nomina il soggetto della pagina

34 H1 su 55. `/settori/ristoranti-e-bar` → «Il conto arriva prima che tu lo porti.» Nessuna occorrenza di «ristoranti» né «bar».

Il copy è ottimo per un lettore. Ma quando un motore estrae un passaggio si porta dietro il titolo come ancora: un H1 senza l'entità rende il blocco orfano — la risposta resta, il referente si perde. I `<title>` sono già corretti; basta allineare gli H1, tenendo la metafora come sottotitolo.

### 5. Una sola tabella su 55 pagine

Le AI Overview estraggono tabelle più di qualsiasi altra struttura. Pagine dove la tabella manca e servirebbe: `/servizi` (2.316 parole, 12 liste, zero tabelle), `/blog/seo-geo-differenze` (pagina comparativa senza confronto), `/servizi/segretaria-telefonica-ai` (i concorrenti che rankano sono tutti pagine «a confronto»), le 11 pagine settore — `/settori/studi-dentistici` ha 36 numeri, tutti in prosa.

### 6. Il blog è la parte più debole, e contraddice ciò che vendiamo

0,23 dati per 100 parole contro 1,50 delle pagine settore: **6,5 volte peggio**. Cinque articoli su sette a zero assoluto.

`/servizi/seo-geo` vende la misurazione della citabilità con «densità di dati 15%». Il blog fallisce il criterio che l'agenzia vende.

Inoltre: **zero link contestuali dagli articoli ai servizi**. Il tipo `BlogArticleData` non ha nemmeno un campo per contenerli. Il blog è un vicolo cieco.

### 7. `/blog` e gli articoli non vengono mai messi in cache

`export const dynamic = 'force-dynamic'` su `app/blog/page.tsx:14` e `app/blog/[slug]/page.tsx:16`, causato da `resolveBlogClienteId()` che legge gli header per il multi-tenant. Risposta con `no-store`, `x-vercel-cache: MISS` sempre, TTFB ~300 ms contro ~105 ms delle pagine statiche.

Aggravante: il prefetch dalla home innesca un render dinamico di `/blog` con query al database **a ogni visita**, anche senza clic.

I crawler AI fanno fetch sincroni con timeout stretti. Il contenuto più citabile del sito è l'unico che non gode della protezione della CDN.

### 8. L'entità autore non esiste

`founder: { "@type": "Person", "name": "Marco Dibenedetto" }` — nessun `@id`, `url`, `sameAs`, `knowsAbout`. Non esiste una pagina autore. `/chi-siamo` non contiene una biografia: zero occorrenze di «esperienza», «anni», «formazione», «certificazione».

Sette articoli firmati puntano a un autore che, per un motore, è una stringa.

### 9. L'esperienza è rivendicata cinque volte e dimostrata due

| Segnale | Occorrenze |
|---|---|
| «Nella nostra esperienza» | 5 |
| Casi studio | 0 |
| Clienti contati | 0 |
| Anni di attività | 0 |
| Metriche prima/dopo | 0 |
| Testimonianze | 0 |

L'unica prova concreta sono i tre progetti su `/servizi/siti-e-commerce` — SILKinCOM, Studio Legale BCS, Borsieri Car Service — più la demo ristoranti. Due pagine su 55, senza una metrica né una data.

Il paradosso è che la competenza nel testo è genuina: «Il conteggio è sulla durata delle conversazioni gestite, non sul numero di chiamate: 300 minuti valgono circa 100 conversazioni da tre minuti». Questo lo scrive chi ha configurato davvero un assistente. Ma resta affermazione.

---

## Medio

### 10. Il Meta Pixel è installato e muto

Verificato con consenso marketing attivo: la CSP rifiuta `connect.facebook.net/en_US/fbevents.js`. `window.fbq` esiste come stub e accoda gli eventi, che non partono mai. Anche il fallback `<noscript>` è bloccato da `img-src`.

Decisione da prendere, non entrambe: aprire la CSP a Meta, oppure rimuovere il pixel e affidarsi alla Conversions API server-side che è già scritta in `lib/meta-conversions-api.ts` — verificando prima che copra tutti gli eventi.

### 11. `<html lang="it">` sulle pagine inglesi

Nell'HTML grezzo tutte le `/en` dichiarano `lang="it"`; la correzione avviene via script client, che i crawler AI non eseguono. Attenuante verificata: il `<div lang="en">` del layout inglese **è** server-side, quindi il contenuto risulta marcato inglese sul contenitore. L'impatto è minore di quanto sembri, ma va sistemato.

### 12. Nessun Offer dichiara la periodicità

Gli Offer usano `unitText: "MONTH"`, che è testo libero e non il periodo di fatturazione. Un modello legge «199 €» come una tantum. Serve `billingDuration` con `unitCode: "MON"`.

### 13. Prezzi visibili mai dichiarati nello schema

Segretaria da 199 €/mese e agenda da 390 €/mese compaiono su home e pagine settore e non esistono in JSON-LD. Causa: `components/SettorePage.tsx:64` passa `priceNote` ma mai `startingPrice`, e `MarketingDetailPage.tsx:94` condiziona il blocco `offers` proprio a quello. Effetto collaterale: il riquadro prezzo non viene mai mostrato nemmeno graficamente. Il corso AI Act a 2.000 € non è marcato affatto.

### 14. Date invisibili

Zero elementi `<time>` su 55 pagine. La data esiste solo nel JSON-LD, e `dateModified` è una copia di `datePublished` su tutti e 7 gli articoli: al motore risultano mai aggiornati. I contenuti sono freschissimi — agosto e settembre 2026 — ed è un vantaggio oggi invisibile.

### 15. Gli H2 sono slogan, non ancore

Solo 4 H2 su 323 (1,2%) sono in forma di domanda. «Seguici sui social.» compare come H2 **37 volte**.

### 16. Il codice fiscale personale è pubblicato su 55 pagine

`taxID: "DBNMRC80E04C933Q"` accanto alla P.IVA. Il codice fiscale codifica data e luogo di nascita. Per una ditta individuale la P.IVA basta a identificare l'impresa; il `taxID` non aggiunge fiducia e viene replicato in formato macchina, facilmente aggregabile. Su un sito che vende consulenza GDPR, il dettaglio si nota.

### 17. `lastmod` identico su 42 URL

Una data costante scritta a mano per l'intero blocco marketing. È il pattern che porta Google a ignorare il campo per tutto il sito, perdendo il segnale anche quando una pagina cambia davvero.

### 18. IndexNow: chiave servita, invio mai automatico

Lo script è scritto bene e legge dalla sitemap, ma è agganciato solo a due npm script manuali. Nessun `postbuild`, nessun cron. Bing alimenta ChatGPT search e Copilot: un articolo nuovo entra con giorni di ritardo invece che minuti.

---

## Basso

- Cover del blog fuori da `next/image`: 359 KB scaricati per mostrarne ~30 (immagini 2400×1500 rese a 352px).
- 35 tap target sotto 44px sulla home mobile; i due bottoni del banner cookie sono i peggiori, con 7px di distanza dal link.
- Sei pagine con un solo link in entrata; le quattro `/en/settori/*` sono anche a 3 click dalla home.
- La home prefetcha 22 rotte, comprese privacy e termini: 189 KB, e innesca la query DB di `/blog`.
- `Organization` e `ProfessionalService` legati da `parentOrganization`: due imprese dove ce n'è una.
- `foundingDate`, `geo`, `openingHoursSpecification`, `speakable` assenti.
- `http://socialautomation.app` fa due salti invece di uno.

---

## Punteggi per piattaforma AI

| Piattaforma | Punteggio | Perché |
|---|---|---|
| **Bing Copilot** | 63/100 | Il più forte: IndexNow attivo, contenuto strutturato, pagine di compliance. Perde 17 punti su una sola assenza, LinkedIn |
| **ChatGPT** | 58/100 | Crawler ammessi, `llms.txt` ottimo, 281 Q&A. Ma zero corroborazione esterna |
| **Google AI Overviews** | 53/100 | Buon tessuto Q&A, ma una sola tabella e 12% di H2 interrogativi |
| **Perplexity** | 43/100 | Pesa Reddit più di ogni altro motore, e lì il brand non esiste |
| **Google Gemini** | 39/100 | Nessun canale YouTube, nessun Google Business Profile. `/servizi/video-produzione` vende video con 1.385 parole e l'azienda non ha un canale |

---

## Cosa funziona, e va detto

- **Rendering**: 556 frasi su 563 nell'HTML grezzo. Un motore che non esegue JavaScript vede tutto. È il singolo fattore che più conta.
- **Core Web Vitals**: LCP massimo 1.592 ms su mobile a rete lenta, **CLS esattamente zero** su tutte e otto le combinazioni testate, TBT massimo 16 ms.
- **Header di sicurezza**: tutti e sei presenti, HSTS a due anni con preload, CSP senza `unsafe-eval`.
- **`robots.txt`**: ammette esplicitamente OAI-SearchBot, GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended.
- **Zero pagine orfane**, zero link rotti, zero soft-404, zero violazioni FAQPage.
- **Testi realmente distinti**: sovrapposizione media dell'1,9% fra le 11 pagine settore e dell'1,5% fra le 10 pagine servizio. Non sono template clonati. È raro.
- **Trasparenza**: prezzi pubblici, esclusioni dichiarate, rifiuto esplicito di garantire risultati. È un differenziale reale.

---

## Piano a 30 giorni

### Settimana 1 — Esistere fuori dal proprio dominio
- [ ] Aprire la pagina aziendale LinkedIn (chiude un 404 diagnosticato, vale 17 punti su Copilot)
- [ ] Aprire il Google Business Profile su Cermenate, NAP identica allo schema (leva più forte per Gemini)
- [ ] Creare la voce Wikidata con P.IVA, sede e sito ufficiale
- [ ] Estendere `sameAs` con tutti gli URL sopra
- [ ] Rimuovere `taxID` dallo schema

### Settimana 2 — Rendere estraibile ciò che c'è già
- [ ] Cache header su `/blog` e `/blog/:slug` in `next.config.mjs`
- [ ] `postbuild` per IndexNow in `package.json`
- [ ] Data visibile con `<time>` su tutte le pagine; `dateModified` reale
- [ ] Tabella di confronto in `/servizi`, `/blog/seo-geo-differenze`, `/servizi/segretaria-telefonica-ai`
- [ ] `startingPrice` alle pagine settore, per far scattare gli Offer

### Settimana 3 — Ancorare e firmare
- [ ] Link a EUR-Lex con numeri di articolo su `/blog/ai-act-obblighi-pmi-cosa-fare` e `/trasparenza-ai`
- [ ] Pagina autore `/autore/marco-dibenedetto` con `Person` completo e `sameAs`
- [ ] Tre schede caso sui progetti già online, con perimetro e cosa non è stato fatto
- [ ] H1 delle pagine settore: entità nel titolo, metafora nel sottotitolo

### Settimana 4 — Contenuti che mancano
- [ ] «Quanto costa un sito per una PMI: canone, proprietà, cambio fornitore» → `/servizi/siti-e-commerce`
- [ ] «Messaggi WhatsApp ai clienti fermi da mesi: quando serve il consenso» → copre 5 settori, scioglie l'obiezione principale sul servizio da 390 €
- [ ] «I cinque criteri con cui misuriamo la citabilità» — la rubrica 30/25/20/15/10 esiste già, sepolta in un accordion
- [ ] Link contestuali dagli articoli ai servizi (serve un campo nuovo in `BlogArticleData`)
- [ ] Decidere sul Meta Pixel

---

## Nota di metodo

Due numeri raccolti dal mio crawler iniziale erano gonfiati e sono stati corretti dalle analisi successive: le parole totali (64.921 dichiarate, **46.119 reali** — l'estrattore contava anche il JSON-LD) e i link esterni (184 dichiarati, **12 citazioni reali** — gli altri 172 sono CTA WhatsApp e profili propri). I punteggi in questo report usano i valori corretti.
