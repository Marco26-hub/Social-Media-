-- Nuovo stato NON_APPROVATO: il tasto rosso "Rifiuta" nel calendario mandava il
-- contenuto in BOZZA, mischiandolo con le bozze mai riviste. Ora un contenuto
-- rifiutato finisce in un bucket dedicato "Non approvati", distinto e filtrabile,
-- e resta recuperabile (Ripristina → DA_APPROVARE) dal calendario.
--
-- Il CHECK sullo status era inline in 001_full_schema.sql → Postgres lo nomina
-- calendario_status_check. Lo ricreiamo aggiungendo il nuovo valore. Additivo e
-- idempotente: nessun contenuto esistente cambia.
alter table calendario drop constraint if exists calendario_status_check;
alter table calendario add constraint calendario_status_check
  check (status in ('BOZZA','IDEA','DA_APPROVARE','APPROVATO',
                    'IN_PUBBLICAZIONE','PUBBLICATO','ERRORE',
                    'ERRORE_MANUALE','DRY_RUN_OK','ARCHIVIATO','NON_APPROVATO'));
