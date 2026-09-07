# Audit GEO + SEO — socialautomation.app

**Data:** 7 settembre 2026
**Tipo di attività:** agenzia/servizi digitali per PMI italiane
**Pagine analizzate:** 56 (tutte quelle in sitemap, tutte HTTP 200)
**Metodo:** crawl reale della produzione, cinque analisi specialistiche in parallelo, verifiche esterne su Wikipedia, Wikidata, LinkedIn, YouTube, Reddit e registri imprese.

> **Aggiornato dopo gli interventi.** Questo report contiene sia la diagnosi
> iniziale sia il risultato delle correzioni fatte subito dopo. Tutto ciò che è
> marcato **[fatto]** è già in produzione e verificato sul sito live.

---

## Sintesi

**Punteggio GEO: 50/100 → 61/100**

Il sito era **tecnicamente eccellente e pubblicamente inesistente**. La parte
tecnica è stata portata da 89 a 95 e i dati strutturati da 51 a 82, ma il tetto
resta **l'autorità di marca a 8/100**, che pesa il 20% e non si sposta scrivendo
codice: dipende da azioni fuori dal sito.

Nove ricerche indipendenti non restituiscono mai il sito. Niente Wikipedia,
niente Wikidata, LinkedIn 404, YouTube 404, zero recensioni, zero menzioni. E la
stringa con cui l'azienda si presenta appartiene già ad altri tre soggetti, uno
dei quali fa lo stesso mestiere in Italia: cercando `"socialautomation.app"` fra
virgolette, l'unico risultato italiano pertinente è **socialautomation.it di
Frosinone**. Il dominio non contiene la parola *Web*, che è proprio quella che
distinguerebbe il marchio.

**Il collo di bottiglia non è più la qualità del sito. È che nessuna fonte
esterna conferma che questa azienda esista.**

### Punteggi

| Categoria | Prima | Dopo | Peso | Che cosa è cambiato |
|---|---|---|---|---|
| Citabilità AI | 58 | **72** | 25% | Da 1 a 5 tabelle, H2 in forma di domanda dall'1,4% al 9,2%, 23 fonti citate |
| Autorità di marca | 6 | **8** | 20% | Solo disambiguazione nello schema. Il resto è fuori dal sito |
| Contenuti E-E-A-T | 53 | **65** | 20% | Pagina autore, entità Person, fonti primarie, date reali |
| Tecnico | 89 | **95** | 15% | Blog in cache, IndexNow automatico, immagini, bersagli tattili |
| Dati strutturati | 51 | **82** | 10% | Prezzi corretti, entità unificata, Offer ovunque, Course, speakable |
| Piattaforme AI | 51 | **58** | 10% | Migliora ciò che dipende dal sito; il resto richiede presenza esterna |
| **Totale** | **50** | **61** | | |

### Punteggio SEO classico: 67/100

La SEO tradizionale e la GEO condividono la base tecnica ma vengono valutate su
criteri diversi, quindi vale la pena tenere i due punteggi separati.

| Categoria | Punteggio | Peso | Che cosa dice la misura |
|---|---|---|---|
| SEO tecnica | **95**/100 | 30% | 56 URL tutte 200, zero link rotti, zero pagine orfane, zero soft-404. Redirect corretti e permanenti. Core Web Vitals tutti in fascia verde: LCP massimo 1.592 ms su mobile a rete lenta, **CLS esattamente zero** su tutte le combinazioni testate, TBT massimo 16 ms. Contenuto interamente server-side: 556 frasi su 563 nell'HTML grezzo. Sei header di sicurezza, HSTS a due anni con preload |
| On-page | **88**/100 | 25% | Tutti i title fra 30 e 60 caratteri, tutte le description fra 140 e 168, tutte uniche. Un solo H1 per pagina, gerarchia dei titoli pulita, nessuna cannibalizzazione fra pagine. 95 immagini su 98 con alt. 21,7 link interni per pagina, profondità massima 3 click |
| Contenuti e copertura | **68**/100 | 20% | 46.119 parole di prosa reale su 56 pagine, 269 blocchi domanda-risposta, testi davvero distinti (sovrapposizione 1,9% fra le pagine settore). Ma quattro servizi su dieci non hanno un solo articolo, gli undici settori ne hanno zero, e mancano schede caso con numeri |
| Autorevolezza fuori dal sito | **10**/100 | 25% | È il buco. Nessun backlink autorevole rilevato, nessuna scheda Google Business, nessuna citazione di terzi, nessuna recensione. E tre omonimi occupano la query di marca |
| **Totale SEO** | **67**/100 | | |

**Il punteggio SEO è più alto di quello GEO (61) per un motivo solo:** la SEO
premia la base tecnica, che qui è ottima, mentre la GEO pesa di più la
riconoscibilità dell'entità e la citabilità dei singoli blocchi. I due punteggi
sono limitati dallo stesso fattore — l'assenza di conferme esterne — che vale il
25% della SEO e il 20% della GEO.

---

### Misurato in produzione, prima e dopo

| Indicatore | Prima | Dopo |
|---|---|---|
| Tabelle sul sito | 1 | **5** |
| H2 in forma di domanda | 1,4% | **9,2%** |
| H2 identici ripetuti fra pagine | 19 volte | **7** (e sono «Domande frequenti» e «Fonti» sui 7 articoli) |
| Link a fonti esterne | 0 | **23** |
| Elementi `<time>` | 0 | **7** |
| Pagine con `speakable` | 0 | **30** |
| Tipi di schema distinti | 26 | **33** |
| Contrasto insufficiente, pagine inglesi | 6 | **0** |
| Bersagli tattili sotto 24px (home) | 21 | **2** |
| Prezzi sbagliati nei dati strutturati | su tutte le 55 pagine | **0** |
| `/llms-full.txt` | 404 | **104 KB, 16.578 parole** |

---

## Corretto — [fatto], tutto in produzione

### Critico

1. **I dati strutturati dichiaravano prezzi di due listini fa.** `JsonLd.tsx`
   diceva Presenza 390 € e Crescita 790 €, contro i 490 € e 990 € pubblicati
   ovunque. Il componente sta nel layout: **tutte le pagine** trasmettevano il
   listino sbagliato a ogni motore di ricerca e a ogni sistema di risposta. Su
   `/pacchetti` convivevano le due versioni. Ora i prezzi derivano da
   `lib/pacchetti.ts` e non possono più divergere.

2. **Due affermazioni false nella stessa descrizione**: «gestione di tre social»
   (sono due, a scelta del cliente) e «gestione di una campagna ADS», mentre il
   sito dichiara ovunque che le campagne a pagamento sono escluse. La tabella di
   `/pacchetti` diceva ancora che Crescita include 1 campagna ADS.

3. **Zero citazioni in uscita su 49 pagine.** I 184 link esterni erano tutti
   WhatsApp, Instagram e Facebook. Ora i sette articoli hanno da 2 a 4 fonti
   primarie ciascuno — EUR-Lex per AI Act e GDPR, la Commissione europea, il
   Garante, il Registro Pubblico delle Opposizioni, la WhatsApp Business
   Messaging Policy, Google Search Central, schema.org, llmstxt.org, i bot di
   OpenAI — tutte verificate una per una.

4. **`<html lang="it">` sulle pagine inglesi.** Attenuante verificata: il
   `<div lang="en">` del layout è server-side, quindi il contenuto risulta
   marcato inglese sul contenitore. Resta da sistemare la radice.

### Alto

5. **L'entità autore non esisteva.** `founder` e `author` erano due stringhe
   scollegate. Creata `/autore/marco-dibenedetto` e il nodo `Person` con `@id`,
   competenze e lingue; impresa e articoli lo referenziano.

6. **Organization e ProfessionalService erano due nodi** legati da
   `parentOrganization`, cioè due soggetti giuridici distinti, per una ditta
   individuale. Ora un solo nodo con due tipi.

7. **Il 62% degli H1 non nominava il soggetto della pagina.** L'occhiello è
   passato dentro l'H1: il nome del settore entra nel titolo senza cambiare una
   virgola del testo né l'aspetto della pagina.

8. **Le 15 pagine settore citavano i prezzi nel testo e non ne dichiaravano
   nessuno**, perché `SettorePage` non passava `startingPrice`. Di conseguenza
   anche il riquadro del prezzo era codice morto. Il valore si ricava dal minimo
   già scritto nella nota prezzi, quindi non è un numero nuovo.

9. **hreflang unidirezionale**: la pagina inglese dichiarava l'italiana, non il
   contrario. Senza reciprocità il gruppo linguistico non viene consolidato.

10. **`/blog` e gli articoli non andavano mai in cache** (`no-store`, TTFB tre
    volte le pagine statiche) proprio sul contenuto che i motori di risposta
    leggono di più. Ora la CDN li tiene, con `stale-while-revalidate`.

11. **IndexNow**: la chiave era servita ma l'invio andava lanciato a mano. Ora
    parte al termine della build, con guardia sull'ambiente.

12. **`/llms-full.txt` era 404.** Generato dalle stesse sorgenti uniche che
    alimentano le pagine, quindi non può divergere dal sito.

13. **Il corso AI Act a 2.000 € non era marcato.** `Course` con disponibilità in
    preordine, che descrive lo stato reale — si prenota, non si paga adesso.
    `Event` non è applicabile: non esistono data né luogo, e inventarli sarebbe
    un dato falso.

14. **Il codice fiscale personale era pubblicato su tutte le pagine** accanto
    alla P.IVA. Rimosso: codifica data e luogo di nascita, non serve a nessun
    motore e la P.IVA identifica già l'impresa.

### Medio

15. **Tre H2 identici su 19 pagine** e uno nel footer di 37. Ora nominano il
    soggetto della pagina, con costrutti diversi per settori e servizi.
16. **`lastmod` identico su 42 URL**: il pattern che porta a ignorare il campo
    per tutto il sito. Ora per gruppo.
17. **Nessun Offer dichiarava la periodicità** (`unitText: "MONTH"` è testo
    libero): i canoni venivano letti come una tantum. Ora `billingDuration`.
18. **Copertine del blog fuori da `next/image`**: 359 KB per mostrarne ~30.
19. **Bersagli tattili sotto i 24px**, i peggiori sul banner cookie.
20. **`speakable` assente** su tutto il sito.
21. **Valuta incoerente**: `€490` accanto a `da 199 €`. Uniformata alla
    convenzione italiana in un punto solo.
22. **`/en`, `/en/services`, `/en/pricing` senza schema di pagina**, e la pagina
    prezzi inglese senza un solo Offer.
23. **Contrasto**: testo che prendeva il colore da un token che si inverte in
    tema scuro, su superfici fisse. Il CTA primario faceva 1,51:1, il bottone
    finale di ogni pagina settore 2,6:1. Pagine inglesi da 6 fallimenti a 0.

---

## Resta da fare — e non dipende dal codice

Queste sono le azioni che valgono i punti mancanti, e sono tutte fuori dal sito.
Insieme spostano l'autorità di marca da 8 a circa 45, cioè il punteggio
complessivo da 61 a circa 68.

| # | Azione | Vale su | Sforzo |
|---|---|---|---|
| 1 | **Pagina aziendale LinkedIn** — oggi l'URL restituisce 404 | Copilot (+17), ChatGPT | 2 ore |
| 2 | **Google Business Profile su Cermenate**, NAP identica allo schema. A Cermenate un concorrente presidia il Knowledge Panel con 5,0 su 14 recensioni | Gemini (+15), AI Overviews | mezza giornata |
| 3 | **Voce Wikidata** con P.IVA, sede e sito ufficiale — è l'intervento che separa l'entità dagli omonimi in modo strutturale | ChatGPT, Gemini | 1 ora |
| 4 | **Canale YouTube** con 3-5 estratti dai video già prodotti. `/servizi/video-produzione` vende produzione video e l'azienda non ha un canale | Gemini, Perplexity | 1 giorno |
| 5 | **Recensioni Google** sulla scheda, poi collegarla in `sameAs`. Non inventare `AggregateRating`: il rating di Google si mostra dal Knowledge Panel senza markup | tutte | continuo |
| 6 | **Tre schede caso** sui progetti già online — SILKinCOM, Studio Legale BCS, Borsieri Car Service — con perimetro e cosa non è stato fatto | E-E-A-T | 1 giorno |
| 7 | **Decidere sul Meta Pixel**: aprire la CSP a Meta, oppure rimuoverlo e tenere la sola Conversions API server-side, che è già scritta | prodotto | 1 ora |
| 8 | **Presidio su Reddit e forum italiani** su AI Act e costi social per PMI. Perplexity pesa Reddit più di ogni altro motore | Perplexity (+20) | continuo |
| 9 | **Anno di inizio attività**, da mettere in `foundingDate` e nella biografia | E-E-A-T | 5 minuti |
| 10 | **Dati sul mondo, non solo sui propri prezzi.** Tutti i dati quantificati del sito sono auto-referenziali: nessuna statistica di settore, nessun benchmark, nessun risultato cliente misurato | Citabilità | continuo |

---

## Punteggi per piattaforma AI

| Piattaforma | Prima | Dopo | Perché non sale di più |
|---|---|---|---|
| **Bing Copilot** | 63 | **70** | IndexNow ora automatico. Manca LinkedIn |
| **ChatGPT** | 58 | **63** | Crawler ammessi, llms.txt e corpus ottimi. Manca la corroborazione esterna |
| **Google AI Overviews** | 53 | **63** | Tabelle, H2 interrogativi e date. Serve ancora ranking organico |
| **Perplexity** | 43 | **48** | Fonti citate e date. Pesa Reddit, e lì il brand non esiste |
| **Google Gemini** | 39 | **45** | Schema molto migliorato. Mancano YouTube e Google Business Profile |

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
