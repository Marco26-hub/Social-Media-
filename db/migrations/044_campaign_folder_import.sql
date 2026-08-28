-- Tracciabilita dell'import automatico delle campagne editoriali SWA.
-- Le colonne sono nullable per mantenere compatibili i piani creati a mano.

ALTER TABLE calendario
  ADD COLUMN IF NOT EXISTS campaign_content_key text,
  ADD COLUMN IF NOT EXISTS campaign_week smallint,
  ADD COLUMN IF NOT EXISTS campaign_source_paths jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'calendario_campaign_week_check'
  ) THEN
    ALTER TABLE calendario
      ADD CONSTRAINT calendario_campaign_week_check
      CHECK (campaign_week IS NULL OR campaign_week BETWEEN 1 AND 5);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_calendario_campaign_content
  ON calendario (cliente_id, campaign_week, campaign_content_key)
  WHERE campaign_content_key IS NOT NULL;
