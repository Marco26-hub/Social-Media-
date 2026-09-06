-- Preiscrizioni ai video corsi AI Act.
--
-- Tabella separata dalle consulenze: la consulenza e una prestazione pagata e
-- passa da Stripe, questa e solo una manifestazione di interesse, senza
-- pagamento e senza impegno. Tenerle insieme avrebbe mescolato due imbuti con
-- stati e obblighi diversi.

CREATE TABLE IF NOT EXISTS corso_iscrizioni (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corso         text NOT NULL DEFAULT 'ai-act',
  nome          text NOT NULL,
  email         text NOT NULL,
  azienda       text,
  ruolo         text,
  note          text,
  -- Consenso raccolto esplicitamente nel form: senza, l'email non e
  -- utilizzabile per avvisare della partenza del corso.
  consenso      boolean NOT NULL DEFAULT false,
  status        text NOT NULL DEFAULT 'ISCRITTO',
  origine       text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Una persona si preiscrive una volta sola per corso: un secondo invio dallo
-- stesso indirizzo aggiorna la riga invece di crearne una copia.
CREATE UNIQUE INDEX IF NOT EXISTS corso_iscrizioni_corso_email_key
  ON corso_iscrizioni (corso, lower(email));

CREATE INDEX IF NOT EXISTS corso_iscrizioni_created_idx
  ON corso_iscrizioni (created_at DESC);
