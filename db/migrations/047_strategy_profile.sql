-- Profilo di settore che guida strategia, copy e produzione visuale.
-- La route usa introspezione dinamica, quindi resta compatibile anche prima
-- dell esecuzione di questa migrazione.
ALTER TABLE calendario
  ADD COLUMN IF NOT EXISTS strategy_profile text;

COMMENT ON COLUMN calendario.strategy_profile IS 'Profilo di realizzazione applicato alla strategia: swa-services|silkincom-ecommerce|restaurant|bowling-case-study';
