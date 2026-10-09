# SWA — correzioni dell’audit SEO/GEO/AEO
Data: 9 ottobre 2026.

## Esito

Implementate e collaudate le correzioni verificabili nel codice del worktree `/private/tmp/swa-marketplace-academy-live`, ramo `codex/marketplace-academy-live`.

**Modifiche locali, non committate, non pushate e non pubblicate.** Non è una certificazione del go-live dell’intero ecosistema. Le modifiche preesistenti nel worktree sono state preservate. Nessuna chiave reale è stata copiata o resa pubblica.

## Correzioni applicate

| Area | Risultato |
|---|---|
| Tavolo | Catalogo italiano derivato da `SALA_DA`: da 89 €/mese, come la pagina dedicata. Nessun nuovo prezzo: piani, avvio e annuale restano invariati. Aggiunta la voce Tavolo al catalogo inglese e a llms.txt dalla stessa fonte. Checkout del software esterno non modificato né collaudato in questo intervento. |
| Due social | Preservati 2 social nei piani. Corretta anche una FAQ condivisa obsoleta che parlava ancora di 3 social e ADS incluse. Tabella comparativa: quota per canale distinta da 32/48 pubblicazioni totali. Nessuna modifica alle quote del generatore o alle logiche commerciali. |
| Pacchetti | Eliminato “cinque soluzioni” da titolo e configurazione personalizzata. FAQ IVA distingue canoni, una tantum, avvio e costi esterni. |
| Video | Pagina IT, pagina EN e FAQ condivisa allineate al listino: montaggio, sottotitoli e grafiche inclusi nella produzione; calendario/pubblicazione social sono distinti. Canoni invariati. |
| Hreflang | Corrette le 10 pagine IT prive di ritorno EN. Helper condiviso basato sulle traduzioni reali, usato da HTML e sitemap; verificata anche la coppia Tavolo già presente. |
| Home e identità | Lead più esplicito su servizi e destinatari; CTA “Esplora i servizi SWA” coerente con la destinazione. Rimossi conteggi fragili da description Azienda, catalogo e anteprime social interessate. |
| SEO/GEO/AEO | FAQ condivise IT/EN: stessa base SEO, nessun codice speciale o garanzia di citazione; llms.txt facoltativo. Rubrica 30/25/20/15/10 dichiarata metodo editoriale interno, non metrica dei motori. Esempio sul listino SWA esplicitamente distinto da un caso cliente o risultato misurato. |
| Journal | Collegamenti dei 7 articoli EN alle schede specifiche, con ritorno servizio → guida. Articolo SEO/GEO IT/EN aggiornato con guida Google e limiti della misurazione. Date di revisione distinte dalla pubblicazione e sitemap coerente per gli articoli revisionati. |
| Corsi | Radice italiana completa, lang it, metadataBase, tema e anteprima OG dedicata. Stato catalogo non consultabile dichiarato già nel hero; CTA informazioni quando non ci sono corsi. Rimosso link 404 /download, sostituito con Journal. Dettaglio corso non verificabile: messaggio esplicito, noindex e nessuna Course/Offer inventata, invece di errore non gestito. |
| Marketplace | Radice italiana e metadataBase ripristinati. Catalogo resta noindex; tool, API e funzioni admin restano protetti. Nessuna scheda resa pubblica. |
| Night/Day | Corretto contrasto dei pannelli Academy e dei testi/link finali in modalità scura; adeguati hover e controlli selezionati del layer Marketplace. Struttura e comportamento applicativo invariati. |
| Metadati legali | Distinti i title delle traduzioni inglesi di Privacy e Cookie. Nessuna modifica alle condizioni legali. |

## Verifiche finali

- **181/181 test unitari passati**, inclusi 19 nuovi test dedicati all’audit. Dopo l’ultimo affinamento del copy, rieseguiti anche i 19 test dedicati: tutti passati.
- **Build di produzione riuscita**, controllo TypeScript riuscito, lint mirato riuscito, `git diff --check` pulito.
- Crawl locale di **97/97 pagine sitemap**: 200, un solo html e H1, lingua corretta, canonical, description e OG presenti, nessun noindex nel catalogo pubblico, JSON-LD parsabile e hreflang reciproci coerenti con sitemap.
- Blog multi-tenant verificato simulando l’host pubblico SWA: il dominio locale non deve essere scambiato per un errore di canonical.
- **20 controlli browser** su 10 pagine a 390 e 1440 px: nessun pageerror o overflow, CTA e collegamenti corretti, cambio tema operativo. Persistenza del tema su Corsi verificata al reload.
- **20 campioni di contrasto** sui pannelli e titoli/link Academy, chiaro/scuro e mobile/desktop: soglie del test rispettate. Minimo osservato 6,38:1; controllo mirato, non certificazione WCAG dell’intero sito.
- Anonimi: redirect login su Marketplace/UGC/tools/dashboard; API UGC 401.
- Identità **sintetiche locali**: admin sul catalogo Marketplace 200 e noindex; cliente escluso da API admin (403) e pannello admin (redirect al portale).
- Configurazione SSO assente: osservato blocco esplicito 503. Il test autenticato usa secret locali sintetici, non credenziali o dati reali.
- Catalogo Academy non collegato: dettaglio non verificabile mostra indisponibilità e noindex, senza corso/acquisto fittizio.
- Server temporaneo di test fermato. Nessun invio IndexNow: build eseguita in modalità preview.

La build conserva warning preesistenti su immagini, variabili inutilizzate e metadataBase in altre rotte; non sono errori di compilazione. Il controllo non certifica Rich Results, indicizzazione Google, Core Web Vitals sul campo, login/password contro DB reale, acquisti Stripe o generazione UGC a pagamento.

Evidenze: `test-implementazione.json`, script `test-implementazione.py`, schermate `corsi-dark-390.png`, `corsi-dark-1440.png` e `corsi-hero-dark-390.png` nella cartella `/Users/md/Documents/SWA/SEO-GEO-AEO-2026-10-09`.

## Skill e fonti

`market-seo` e `market-copy` hanno guidato coerenza, risposte e metadati; `webapp-testing` i controlli su build di produzione e ruoli sintetici; `web-design-guidelines` ha guidato il controllo mirato della leggibilità e degli stati del tema, non un redesign completo.

Rilievi UI risolti:
- `app/marketplace/ecosystem.css:8` — testo finale ereditava un colore scuro nel tema scuro; ora contrasto esplicito.
- `app/corsi/courses.module.css:6` — pannello con testo chiaro ereditava verde chiaro; ora fondo scuro dedicato.
- `app/corsi/courses.module.css:4` — accento del titolo con colore unico anche di notte; ora variante leggibile.

Fonti primarie verificate: [guida Google per le funzioni AI](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [versioni linguistiche Google](https://developers.google.com/search/docs/specialty/international/localized-versions), [linee guida UI Vercel](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md). Nessuna promessa di ranking, citazioni o FAQ rich result.

## Cosa resta, fuori da queste correzioni

1. **Academy operativa**: deployment/catalogo e SWA_ACADEMY_ORIGIN; accessi admin/clienti, database, lezioni e pagamenti reali. Corretto il percorso informativo, non completato il software Academy.
2. **Trasferimento BCS e go-live applicativo**: integrazioni native ancora mancanti, schema DB reale, migrazioni, isolamento clienti, Stripe e UGC reali. Resta valido `/Users/md/Documents/SWA/PROGRESSO-PRODOTTO-2026-10-09.md`: non basta inserire chiavi.
3. **Schede informative Marketplace pubbliche**: serve scelta esplicita del titolare; per ora conservato il requisito di accesso riservato.
4. **Casi e competenze documentate**: materiali reali, misure, consenso dei clienti e revisori qualificati per fiscale/legale. Non inventati risultati o testimonianze.
5. **Identità esterne**: verificare Trustpilot, Google Business Profile e directory dal titolare; nessuna modifica esterna effettuata.
6. **Misurazione**: accessi Search Console/analytics consentite, dati CWV sul campo e baseline ripetibile delle citazioni AI.
7. **Pubblicazione**: separare/revisionare anche le modifiche preesistenti, quindi commit/push/deploy autorizzato e smoke test live. Il sito live non contiene automaticamente queste correzioni locali.
