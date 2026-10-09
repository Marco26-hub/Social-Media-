# Ciclo di pubblicazione — verifica 10 ottobre 2026

## Correzioni

- Editor data/ora a due passi: anteprima, conferma e verifica dello stesso schedule Blotato; mai un nuovo invio per spostare un post.
- Transazioni e lock PostgreSQL impediscono due salvataggi concorrenti sullo stesso slot/canale. Controllo aggiuntivo della coda e delle prenotazioni sullo stesso account remoto.
- Invio originale registrato prima della richiesta remota. Timeout/5xx non autorizzano un reinvio automatico, neppure dopo riapprovazione o scadenza del lock.
- Recupero dal ledger degli identificativi originali già accettati ma non salvati nel calendario.
- Riconciliazione di soli stati: browser, verifica manuale e cron autenticato. Nessuna generazione, approvazione o pubblicazione nel cron.
- Se il submission status rimane in-progress dopo l'orario, ricerca della pubblicazione con prova di account/piattaforma/pagina/payload/media originali. Una somiglianza di testo non basta.
- Callback autenticati idempotenti: un callback tardivo non fa regredire un pubblicato.
- Card del calendario cliccabili con filtri coerenti; risposte obsolete di caricamento scartate. Isolamento cliente mantenuto.
- Invii falliti non descritti come programmati dalla sincronizzazione singola.

## Test prima del deploy

- Suite automatica: 194 test passati dopo l'integrazione del nuovo commit remoto (191 prima del merge).
- Build Next di produzione riuscita; IndexNow disattivato nell'ambiente preview di verifica.
- 11 scenari end-to-end passati con Next reale, PostgreSQL isolato e simulatore Blotato locale: anteprima, conferma verificata, collisioni, concorrenza, esito incerto, ledger, riconciliazione, callback, cron, card/editor, isolamento/admin e blocco del reinvio.
- Gli end-to-end non hanno utilizzato dati clienti, chiavi reali o API di pubblicazione reali.
- Script riproducibile: `scripts/e2e-publication-cycle.py`. Richiede migrazioni su un DB locale isolato, variabili esplicitamente di test e server gestito dal helper webapp-testing.

## Caso storico verificato

Il Reel `CRMUMNDKPQ_4_IG`, rimasto nella coda locale con data 6 ottobre, risulta pubblicato su Instagram in Blotato il 5 ottobre alle 22:00: https://www.instagram.com/reel/DeIBHUuiO1c/ . Il riallineamento deve conservare il submission ID originale: il published-post ID non lo sostituisce. Nessun reinvio è necessario.

La conferma del deploy e del riallineamento live viene registrata separatamente: i test locali non certificano da soli l'esito in produzione né l'intero Marketplace/Academy.
