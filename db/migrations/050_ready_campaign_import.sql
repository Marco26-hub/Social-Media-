-- Import di campagne editoriali gia approvate, senza passaggio AI.
-- I metadati permettono al controllo finale di verificare il ciclo reale
-- (24 concept coordinati = 48 pubblicazioni su Instagram + Facebook).

ALTER TABLE calendario
  ADD COLUMN IF NOT EXISTS campaign_cycle_id text,
  ADD COLUMN IF NOT EXISTS campaign_mode text,
  ADD COLUMN IF NOT EXISTS campaign_order smallint,
  ADD COLUMN IF NOT EXISTS campaign_expected_contents smallint,
  ADD COLUMN IF NOT EXISTS campaign_expected_publications smallint,
  ADD COLUMN IF NOT EXISTS campaign_expected_mix jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'calendario_campaign_order_check'
  ) THEN
    ALTER TABLE calendario
      ADD CONSTRAINT calendario_campaign_order_check
      CHECK (campaign_order IS NULL OR campaign_order BETWEEN 1 AND 200);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_calendario_ready_campaign
  ON calendario (cliente_id, campaign_cycle_id, campaign_order, canale)
  WHERE campaign_cycle_id IS NOT NULL;
