# Produzione Render — Social Automation

Questa è la checklist pratica per portare il progetto da demo a produzione su Render con Neon/Postgres.

## 1. Blueprint Render

1. Vai su Render → **New** → **Blueprint**.
2. Collega il repository GitHub.
3. Render legge `render.yaml` e crea il web service `social-automation-v2`.
4. Prima del deploy compila le variabili segnate come `sync: false`.

Nota Render: le env `sync: false` vengono richieste nel flusso iniziale del Blueprint. Se il servizio esiste già, aggiungi eventuali nuove env manualmente dalla dashboard.

Il build usa:

```bash
npm ci && npm run build
```

Prima dello start Render esegue automaticamente:

```bash
npm run migrate
```

Lo start usa:

```bash
npm run start
```

Health check:

```text
/api/system/health
```

## 2. Variabili ambiente Render

### Obbligatorie

| Variabile | Valore |
| --- | --- |
| `DATABASE_URL` | Connection string Neon/Postgres con `sslmode=require` |
| `AUTH_SECRET` | Generata da Render o `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL pubblico Render o dominio custom |
| `NEXT_PUBLIC_SITE_URL` | Stesso URL pubblico del sito |
| `OPENROUTER_API_KEY` o `ANTHROPIC_API_KEY` | Almeno una chiave AI reale |

### Pubblicazione automatica

| Variabile | Valore |
| --- | --- |
| `BLOTATO_API_KEY` | API key Blotato |
| `BLOTATO_API_URL` | `https://api.blotato.com` |
| `BLOTATO_WEBHOOK_SECRET` | Segreto webhook generato |

### Da non attivare su produzione venduta

| Variabile | Motivo |
| --- | --- |
| `NEXT_PUBLIC_DEMO_MODE=true` | Forza dati demo |
| `SHOW_LOGIN_HINT=true` | Mostra hint credenziali admin |

## 3. Database Neon

Il deploy Render esegue `npm run migrate` come `preDeployCommand`.

Se vuoi applicarle manualmente dal tuo computer o da una shell sicura con `DATABASE_URL` impostato:

```bash
DATABASE_URL="postgresql://..." npm run migrate
```

Per vedere cosa verrà applicato senza toccare il DB:

```bash
npm run migrate:dry
```

Per applicare una singola migration:

```bash
DATABASE_URL="postgresql://..." npm run migrate -- --file 011_admin_user.sql
```

Il runner crea `schema_migrations`, registra checksum e blocca modifiche a migration già applicate.

## 4. Accesso admin

La migration `011_admin_user.sql` crea:

```text
utente: admin
password: 1234567
```

Dopo il primo login cambia password o crea un admin reale. Per generare un hash bcrypt:

```bash
node -e "require('bcryptjs').hash('NUOVA_PASSWORD_FORTE', 10).then(console.log)"
```

Poi aggiorna il record `profiles.password_hash` su Neon.

## 5. Verifiche prima di vendere

```bash
npm run prod:check
npm run build
npm audit --audit-level=moderate
```

Dopo deploy apri:

```text
https://TUO-SITO.onrender.com/api/system/health
```

Stato atteso:

```json
{ "status": "ready", "mode": "production" }
```

## 6. Go-live minimo

- Login funzionante su `/login`.
- Dashboard accessibile su `/dashboard/clienti`.
- Brand profile salvabile.
- Generazione AI funzionante.
- Calendario contenuti popolato.
- Approvazione contenuti funzionante.
- Blotato testato end-to-end prima di promettere autopubblicazione.
