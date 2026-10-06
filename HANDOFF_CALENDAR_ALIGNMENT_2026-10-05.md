# Allineamento calendario SWA — 5 ottobre 2026

## Live verificato, non modificato in questo intervento

- Cliente SWA, campagna ottobre. Nessun reinvio, cancellazione o cambio orario remoto.
- Blotato mostra Instagram `socialwebautomation`, Reel «Un mese. Sei mosse. Una regia.», **Published il 5 ottobre alle 22:00 Europe/Rome**.
- SWA mostra ancora `CRMUMNDKPQ_4_IG` in-progress/In coda al 6 ottobre alle 21:00. È una lettura obsoleta della submission: non ripubblicare.
- POST05: `CRMUMNDKTQ_5_IG` programmato al 6 ottobre 19:00; `CRMUMNDKVQ_5_FB` al 6 ottobre 20:00. Il remoto ripete la CTA Instagram e l'apertura Facebook. Non cambiare media/date per correggere il testo.
- Vista live: 38 da approvare, 5 pubblicati, 3 in coda, 46 record. Non usare lo stato locale PUBBLICATO (assegnato all'invio) come prova di uscita.

## Modifiche locali in attesa di autorizzazione push/deploy

- Stato effettivo condiviso per badge, intestazioni del giorno, bordi e griglia.
- Verifica della data remota con conversione Europe/Rome, senza reinvio.
- Per submission Instagram obsoleta: verifica alternativa pubblicazione con mese, account originale, hook e asset esatto; solo prova univoca. Nessuna deduzione dal tempo trascorso. Pubblicazioni già confermate protette da regressione.
- Correzione conservativa del copy prima degli invii futuri.
- Endpoint amministrativo di simulazione/correzione testo dei soli post ancora programmati: unico abbinamento account/pagina + hook + media, aggiornamento dello stesso schedule con PATCH e verifica finale. Nessuna creazione di post. UI chiede conferma prima di applicare.
- Recupero ritardi: selezione esplicita di soli approvati scaduti mai inviati; futuro, riferimenti remoti e storico pubblicazioni protetti.

## Verifica

- 9 test Playwright delle funzioni superati; ESLint dei file modificati superato.
- Typecheck dei file modificati privo di errori dopo correzione del guard content.
- Typecheck generale ancora bloccato da problemi già presenti: moduli botid e @sparticuz/chromium mancanti, tipo Promise nel renderer Remotion. Non dichiarare build generale riuscita.
- Prima del push ricontrollare diff e test. `node_modules` è un link locale preesistente: non includerlo nel commit.
- Autorizzazione push/deploy richiesta da AGENTS.md, non ricevuta per queste modifiche.

## Passaggio successivo dopo autorizzazione e deploy verificato

1. Verifica Blotato in SWA: il Reel deve diventare pubblicato sul 5 ottobre 22:00; due POST05 restano in coda sul 6 ottobre 19:00/20:00.
2. Se la prova API non identifica il Reel univocamente, fermarsi e comunicare l'errore; non rimandare né cancellare il post.
3. Simulare e confermare singolarmente la correzione ripetizioni dei due POST05; verificare testo remoto, media e orari invariati.
4. Controllare visibilità dei 38 da approvare e griglia senza filtri residuali; nessuna rigenerazione AI.
