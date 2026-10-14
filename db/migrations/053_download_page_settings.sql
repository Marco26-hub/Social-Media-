-- Testi della pagina regali (/download/<codice>) modificabili dal pannello.
-- Riga unica, come download_access. Tabella separata dal codice: i testi si
-- salvano anche prima di generare il link e la rotazione non li tocca.
-- Un campo nullo vuol dire "usa il testo standard" (DEFAULT_PAGE_TEXTS).
-- La riga nasce al primo salvataggio dal pannello, non qui: la tabella vuota e'
-- uno stato valido e la pagina pubblica usa i testi standard.
CREATE TABLE IF NOT EXISTS download_page_settings (
  id            smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  eyebrow       text,
  title         text,
  lead          text,
  whatsapp_text text,
  show_ugc      boolean NOT NULL DEFAULT false,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Stessa protezione della 052. I testi non sono segreti, ma devono restare
-- modificabili solo dal pannello: su Supabase i nuovi oggetti di public vengono
-- concessi di default ad anon/authenticated e, senza RLS, la sola chiave anon
-- basterebbe per riscriverli dall'API REST pubblica. RLS attiva e nessuna policy
-- = nessuna riga visibile ne' modificabile da quei ruoli. Niente FORCE: l'app e il
-- runner delle migrazioni si collegano come proprietario della tabella.
ALTER TABLE download_page_settings ENABLE ROW LEVEL SECURITY;

-- Revoca esplicita dei privilegi, solo se i ruoli esistono: su un Postgres
-- normale anon/authenticated non ci sono e la migrazione deve girare lo stesso.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON download_page_settings FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON download_page_settings FROM authenticated;
  END IF;
END
$$;
