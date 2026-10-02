# SWA Download — attivazione su Vercel

Il link da condividere è `/download`; il pannello per il team è `/admin/download`.

## 1. Crea e collega il Blob Store

Nel progetto Vercel del sito SWA vai in **Storage** → **Create** → **Blob**.

Scegli **Public**: i materiali pubblicati sono scaricabili da chi riceve il link. Dai allo store un nome chiaro, per esempio `swa-downloads`, quindi collegalo agli ambienti Production, Preview e Development.

Vercel aggiunge automaticamente le variabili del Blob Store (`BLOB_STORE_ID`, `VERCEL_OIDC_TOKEN` e `BLOB_READ_WRITE_TOKEN`). Non copiare mai il valore di `BLOB_READ_WRITE_TOKEN` nel repository o nel browser.

## 2. Distribuisci il sito

Esegui il deploy dal normale flusso del repository/integrazione GitHub o da Vercel. Dopo il deploy, apri `/admin/download` con un account SWA che abbia ruolo `admin` o `super_admin`.

Il pannello permette di:

- caricare PDF, immagini e altri file fino a 250 MB;
- modificare titolo e descrizione;
- nascondere temporaneamente un materiale;
- sostituire il file mantenendo la scheda pubblica;
- eliminare materiale e file archiviato.

Gli upload passano direttamente dal browser a Vercel Blob: il file non attraversa la funzione web, quindi non subisce il limite standard di 4,5 MB delle funzioni Vercel.

## Nota sulla riservatezza

Questa versione non richiede registrazione: chiunque abbia il link della pagina, o il link diretto di un file, può scaricare il materiale. Non usare questo spazio per dati riservati o documenti destinati a una sola persona.
