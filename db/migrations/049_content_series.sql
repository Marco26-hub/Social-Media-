-- Collegamento esplicito dei contenuti generati come serie manuale.
-- Non usa campaign_content_key: quel campo identifica campagne con asset finali
-- importati e modifica i gate di revisione visuale/pubblicazione.
ALTER TABLE calendario
  ADD COLUMN IF NOT EXISTS content_series_id text,
  ADD COLUMN IF NOT EXISTS content_series_position smallint,
  ADD COLUMN IF NOT EXISTS content_series_total smallint,
  ADD COLUMN IF NOT EXISTS content_series_theme text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'calendario_content_series_check'
  ) THEN
    ALTER TABLE calendario
      ADD CONSTRAINT calendario_content_series_check
      CHECK (
        (content_series_id IS NULL AND content_series_position IS NULL AND content_series_total IS NULL)
        OR (
          NULLIF(BTRIM(content_series_id), '') IS NOT NULL
          AND content_series_position IS NOT NULL
          AND content_series_total IS NOT NULL
          AND content_series_total BETWEEN 2 AND 12
          AND content_series_position BETWEEN 1 AND content_series_total
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_calendario_content_series
  ON calendario (cliente_id, content_series_id, content_series_position)
  WHERE content_series_id IS NOT NULL;

COMMENT ON COLUMN calendario.content_series_id IS 'ID condiviso dai contenuti di una serie editoriale generata manualmente';
COMMENT ON COLUMN calendario.content_series_position IS 'Posizione del contenuto nella serie editoriale';
COMMENT ON COLUMN calendario.content_series_total IS 'Numero totale di contenuti previsti nella serie editoriale';
COMMENT ON COLUMN calendario.content_series_theme IS 'Tema o promessa comune della serie editoriale';
