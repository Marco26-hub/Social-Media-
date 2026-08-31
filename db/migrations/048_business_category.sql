-- Categoria lavorativa generica usata per guidare strategia e produzione.
ALTER TABLE calendario
  ADD COLUMN IF NOT EXISTS business_category text;

COMMENT ON COLUMN calendario.business_category IS 'Categoria lavorativa del cliente che guida il motore editoriale e visuale';
