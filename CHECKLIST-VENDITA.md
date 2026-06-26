# Checklist Vendita — Social Automation

## Accesso Admin

- URL login: `/login`
- URL admin dopo login: `/dashboard/clienti`
- Demo/setup senza DB: il sito mostra il box **Accesso Admin** con `admin` / `1234567`.
- Produzione con DB: esegui `db/migrations/011_admin_user.sql`, entra con `admin` / `1234567`, poi cambia password o crea un nuovo admin.
- Sicurezza: non attivare `SHOW_LOGIN_HINT=true` su un sito pubblico già venduto, salvo demo controllata.

## Cosa Vendere Ora

1. **Servizio gestito**, non software: strategia, calendario, contenuti, approvazione, report.
2. **Pacchetti**: parti da `Presenza Social` (€590/mese) o `Crescita Business` (€1.090/mese).
3. **Setup iniziale**: vendi audit + onboarding brand + piano 30 giorni.
4. **Demo live**: mostra `/servizi`, `/dashboard/brand`, `/dashboard/piano`, `/dashboard/calendario`, `/approve/demo`.
5. **Prova commerciale**: offri “Primi 7 giorni di contenuti + piano editoriale” come mini-progetto pagato.

## Demo Call 15 Minuti

1. Apri `/servizi`: presenta pacchetti e risultato atteso.
2. Apri `/dashboard/brand`: inserisci sito cliente e mostra Brand Discovery.
3. Apri `/dashboard/piano`: genera piano settimanale.
4. Apri `/dashboard/calendario`: mostra approvazione, preview e score AI.
5. Chiudi con offerta: “Setup + primo mese operativo”.

## Prima Di Vendere A Un Cliente Reale

### Obbligatorio

- Configurare dominio o URL Render stabile.
- Configurare `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`.
- Eseguire migrations `001` → `012` su Neon.
- Eseguire seed admin `db/migrations/011_admin_user.sql`.
- Cambiare password admin dopo il primo accesso.
- Configurare almeno una chiave AI: `OPENROUTER_API_KEY` o `ANTHROPIC_API_KEY`.
- Preparare privacy/cookie/contratto servizio per l’agenzia.

### Consigliato

- Configurare `BLOTATO_API_KEY` e `BLOTATO_WEBHOOK_SECRET` se vendi pubblicazione automatica.
- Preparare template proposta commerciale.
- Preparare modulo onboarding cliente: brand, accessi social, prodotti, target, tono, offerte.
- Preparare WhatsApp/Calendly per CTA vendita.
- Preparare 3 demo verticali: ristorante, e-commerce moda, professionista locale.

## Manca Nulla?

Puoi vendere **subito come beta/servizio gestito** se prometti generazione + calendario + approvazione + report.

Non promettere ancora come “autopubblicazione completa” finché non sono verificati:

- Blotato end-to-end in produzione.
- Account social reali collegati.
- Webhook pubblicazione testato.
- Policy legali e trattamento dati approvati.
- Backup/restore DB e monitoraggio errori.

## Pitch Corto

“Ti preparo ogni mese piano editoriale, contenuti, caption, hashtag, creatività e approvazione semplice. Tu approvi, noi gestiamo. L’obiettivo è rendere costante la presenza online senza assumere un social media manager interno.”

## Offerta Di Partenza Consigliata

- Setup: `€390–€1.490` secondo complessità.
- Canone: `€590/mese` per 12 contenuti su 2 canali.
- Upsell: Ads, blog SEO/GEO, reel extra, compliance, e-commerce.
