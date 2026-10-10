-- Area download segreta (/download/<codice>).
--
-- Una pagina non indicizzata, raggiungibile solo da chi conosce il link: il
-- codice nel link e l'unica "password". Due tabelle: le schede (file caricati su
-- Blob oppure link esterni) e il codice attivo. Il codice sta nel DB e non in una
-- variabile d'ambiente per poterlo ruotare dal pannello admin senza un deploy.

CREATE TABLE IF NOT EXISTS download_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind          text NOT NULL CHECK (kind IN ('file','link')),
  title         text NOT NULL,
  description   text,
  url           text NOT NULL,          -- link esterno, oppure URL pubblico del blob
  download_url  text,                   -- solo file: URL che forza il download
  blob_pathname text,                   -- solo file: per eliminarlo da Blob
  file_name     text,
  content_type  text,
  size_bytes    bigint,
  position      integer NOT NULL DEFAULT 0,
  visible       boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (kind = 'link' OR (blob_pathname IS NOT NULL AND download_url IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS download_items_position_idx ON download_items (position, created_at);
-- Un blob puo' reggere una sola scheda: eliminandone una si cancellerebbe il file
-- dell'altra. Parziale perche' le schede di tipo link hanno blob_pathname nullo.
-- createItem (lib/download-area-db.ts) si appoggia a questo indice con ON CONFLICT
-- e ne ripete il predicato: se cambia uno, va cambiato anche l'altro.
CREATE UNIQUE INDEX IF NOT EXISTS download_items_blob_pathname_key ON download_items (blob_pathname) WHERE blob_pathname IS NOT NULL;

-- Una sola riga: il codice del link segreto attivo.
-- Nessun INSERT qui: il repository e pubblico e un codice scritto in questo file
-- sarebbe noto a tutti. Il primo codice nasce dal pannello admin.
CREATE TABLE IF NOT EXISTS download_access (
  id          smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  code        text NOT NULL,
  rotated_at  timestamptz NOT NULL DEFAULT now()
);

-- Le due tabelle non devono essere leggibili dall'API REST pubblica di Supabase.
-- Su Supabase i nuovi oggetti di public vengono concessi di default ai ruoli
-- anon/authenticated e altrove nel repo la RLS e spenta: senza questo blocco il
-- codice segreto e le schede nascoste si leggerebbero con la sola chiave anon.
-- RLS attiva e nessuna policy = nessuna riga visibile ai ruoli soggetti a RLS
-- (anon, authenticated). Il proprietario e i ruoli con BYPASSRLS (es. service_role,
-- postgres) vedono comunque tutte le righe.
-- Niente FORCE: l'app e il runner delle migrazioni si collegano come proprietario
-- delle tabelle e devono continuare a leggere e scrivere.
ALTER TABLE download_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_access ENABLE ROW LEVEL SECURITY;

-- Revoca esplicita dei privilegi, solo se i ruoli esistono: su un Postgres
-- normale anon/authenticated non ci sono e la migrazione deve girare lo stesso.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON download_items, download_access FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON download_items, download_access FROM authenticated;
  END IF;
END
$$;
