import { q, q1 } from '@/lib/db'

type RuntimeMigration = {
  filename: string
  checksum: string
  sql: string
}

const RUNTIME_MIGRATIONS: RuntimeMigration[] = [
  {
    filename: '049_content_series.sql',
    checksum: '6e100e4f2c2757ad0cfb7359a82b27c4cb794312e48a91be6fe0cb16ab85ee83',
    sql: `
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
    `,
  },
  {
    filename: '050_corso_ai_act.sql',
    checksum: 'dd14d41a3078f180a7b7013f35dc14616e4af08005c6e6bab43187bcb0940602',
    sql: `
      CREATE TABLE IF NOT EXISTS corso_iscrizioni (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        corso text NOT NULL DEFAULT 'ai-act',
        nome text NOT NULL,
        email text NOT NULL,
        azienda text,
        ruolo text,
        note text,
        consenso boolean NOT NULL DEFAULT false,
        status text NOT NULL DEFAULT 'ISCRITTO',
        origine text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE UNIQUE INDEX IF NOT EXISTS corso_iscrizioni_corso_email_key
        ON corso_iscrizioni (corso, lower(email));
      CREATE INDEX IF NOT EXISTS corso_iscrizioni_created_idx
        ON corso_iscrizioni (created_at DESC);
    `,
  },
  {
    filename: '051_odino_domande.sql',
    checksum: '0ff42ea0b9a306b2b657e9f0721e38cb8d4f663b7fff155ac97bad90551434dc',
    sql: `
      CREATE TABLE IF NOT EXISTS odino_domande (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        domanda text NOT NULL,
        risposta_trovata boolean NOT NULL,
        percorso text,
        fonte text,
        pagina text,
        lingua text NOT NULL DEFAULT 'it',
        created_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS odino_domande_senza_risposta_idx
        ON odino_domande (created_at DESC) WHERE risposta_trovata = false;
      CREATE INDEX IF NOT EXISTS odino_domande_created_idx
        ON odino_domande (created_at DESC);
    `,
  },
]

let migrationPromise: Promise<void> | null = null

async function applyRuntimeMigrations() {
  await q(`CREATE TABLE IF NOT EXISTS schema_migrations (
    filename text PRIMARY KEY,
    checksum text NOT NULL,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`)

  for (const migration of RUNTIME_MIGRATIONS) {
    const applied = await q1(
      'SELECT checksum FROM schema_migrations WHERE filename = $1 LIMIT 1',
      [migration.filename],
    )
    if (applied?.checksum) {
      if (String(applied.checksum) !== migration.checksum) {
        throw new Error(`Checksum diversa per ${migration.filename}`)
      }
      continue
    }

    await q(migration.sql)
    await q(
      `INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)
       ON CONFLICT (filename) DO NOTHING`,
      [migration.filename, migration.checksum],
    )
  }
}

export function ensureRuntimeMigrations() {
  if (!migrationPromise) {
    migrationPromise = applyRuntimeMigrations().catch(error => {
      migrationPromise = null
      throw error
    })
  }
  return migrationPromise
}
