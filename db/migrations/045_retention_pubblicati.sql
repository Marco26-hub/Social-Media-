-- Retention dei contenuti pubblicati.
--
-- I contenuti pubblicati non vanno tenuti a database: l'originale resta sul social
-- e in locale. Vengono quindi eliminati dopo un periodo di grazia (default 30
-- giorni dalla data di pubblicazione).
--
-- Problema che questa migrazione risolve: la generazione legge la "memoria
-- creativa" dalle ultime 96 righe di `calendario`
-- (app/api/generate/plan/route.ts) per non riproporre hook e temi gia usati.
-- Cancellando le righe quella memoria sparirebbe e l'AI ricomincerebbe a proporre
-- creativita gia pubblicate poche settimane prima.
--
-- Teniamo percio una IMPRONTA compatta: solo i campi che il novelty gate
-- confronta (lib/editorial-variation.ts, HISTORY_FIELDS), senza caption, media,
-- brief, scene o JSON. Poche centinaia di byte per contenuto invece di ~10 kB.

CREATE TABLE IF NOT EXISTS contenuti_storico (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id          uuid NOT NULL REFERENCES clienti(id) ON DELETE CASCADE,
  id_contenuto        text,
  -- Campi confrontati dal novelty gate.
  hook                text,
  tema                text,
  angle               text,
  primary_message     text,
  idea_visual         text,
  template_style      text,
  production_notes    text,
  formato             text,
  canale              text,
  data_pubblicazione  date,
  -- Tracciabilita del post reale, per ritrovarlo sul social senza tenere la riga.
  post_url            text,
  blotato_post_id     text,
  archiviato_il       timestamptz NOT NULL DEFAULT now()
);

-- La memoria creativa si legge per cliente, dal piu recente.
CREATE INDEX IF NOT EXISTS idx_contenuti_storico_cliente
  ON contenuti_storico (cliente_id, archiviato_il DESC);

-- Evita doppioni se la pulizia viene rieseguita sullo stesso contenuto.
CREATE UNIQUE INDEX IF NOT EXISTS idx_contenuti_storico_unico
  ON contenuti_storico (cliente_id, id_contenuto)
  WHERE id_contenuto IS NOT NULL;

COMMENT ON TABLE contenuti_storico IS
  'Impronta compatta dei contenuti pubblicati ed eliminati dal calendario: serve solo al controllo anti-duplicati della generazione. Non contiene caption, media ne brief.';
