-- La sincronizzazione con Blotato è conclusa quando l'API restituisce l'id del post.
-- Non esiste più uno stato editoriale intermedio: il dettaglio tecnico della coda
-- resta in blotato_status = 'scheduled'.

-- I record legacy con un riferimento Blotato sono già stati inviati; quelli senza
-- riferimento tornano APPROVATO per poter essere sincronizzati correttamente.
UPDATE calendario
   SET status = CASE WHEN blotato_post_id IS NOT NULL THEN 'PUBBLICATO' ELSE 'APPROVATO' END,
       updated_at = now()
 WHERE status = 'IN_PUBBLICAZIONE';

ALTER TABLE calendario DROP CONSTRAINT IF EXISTS calendario_status_check;
ALTER TABLE calendario ADD CONSTRAINT calendario_status_check
  CHECK (status IN ('BOZZA','IDEA','DA_APPROVARE','APPROVATO',
                    'PUBBLICATO','ERRORE','ERRORE_MANUALE','DRY_RUN_OK',
                    'ARCHIVIATO','NON_APPROVATO'));
