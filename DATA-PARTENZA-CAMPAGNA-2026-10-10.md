# Data di partenza della strategia

- Piano editoriale / Cartella campagna SWA: campo «Data di inizio pubblicazione» inviato sia al piano libero sia al piano del pacchetto. Le settimane vengono ancorate alla data scelta; le due fasi mensili condividono la stessa partenza. Campo vuoto: comportamento precedente.
- Calendario / Ripristina strategia: scelta facoltativa di una nuova partenza per il manifesto pronto. Tutti i giorni vengono traslati dello stesso intervallo, anche attraverso mesi e cambio d’ora. Copy, media, ordine, settimane e orari non vengono rigenerati. Sempre Instagram + Facebook, Da approvare, senza invio automatico.
- Cambiare data invalida l’anteprima precedente. Il backend rifiuta date impossibili/passate nel fuso del cliente; mostra l’intervallo completo, non solo il mese iniziale.
- Importazione atomica in transazione, con gli stessi lock per canale del calendario. Invii accettati/incerti, stati remoti, lock e pubblicati sono protetti. Collisioni con altri cicli sono mostrate prima di applicare.

## Verifica

- Test unitari aggiunti: validazione date e fuso, traslazione invariata su DST, mese/anno e anno bisestile; due adattamenti social e orari invariati.
- 7 scenari E2E con Next production build, PostgreSQL isolato reale e listing S3 sintetico: anteprima senza scritture, invalidazione conferma, importazione persistita e mantenimento orario originale, blocco in-progress, collisione, rifiuto date invalide su entrambe le API e campo nella cartella.
- 11 scenari del ciclo di pubblicazione ripetuti e passati: stesso schedule ID, concorrenza, callback, isolamento clienti e nessun secondo POST dopo accettazione incerta. Solo provider locale simulato.
- Audit pagine pubbliche: 97 pagine e 20 verifiche browser, accessi protetti e separazione ruoli passati.
- Nessun invio, approvazione, upload o modifica dell’orario di un contenuto reale eseguito per questi test.

## Discrepanza live non mascherata

Blotato mostra il Reel «Un mese. Sei mosse. Una regia.» pubblicato il 5 ottobre alle 22:00 con URL Instagram DeIBHUuiO1c. SWA lo conserva ancora nella coda del 6 ottobre perché il confronto automatico delle prove non è univoco. Aggiunta diagnostica esplicita dei campi non corrispondenti e uso degli URL media originali del ledger (quando disponibili), senza sostituire il submission ID né reinviare il post. Non dichiarare risolta la discrepanza prima di verificare il nuovo deploy.
