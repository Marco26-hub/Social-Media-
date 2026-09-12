#!/usr/bin/env bash
# Fallback silenziosi della sezione corsi.
#
# Verifica cosa succede quando manca un pezzo: la sessione, il database, il
# pagamento, l'archivio dei video. Il criterio non e «non deve rompersi», e
# «deve rompersi nel modo giusto»:
#
#   - una pagina pubblica senza database mostra un catalogo vuoto, non un 500
#   - una risorsa non tua e indistinguibile da una che non esiste
#   - lo stato della configurazione (Stripe, archivio) non si rivela a chi non
#     ha titolo per chiederlo: prima si stabilisce chi sei, poi se il servizio c'e
#
# Uso:  scripts/test-corsi-fallback.sh [base-url]
# Serve un server in ascolto; per la parte senza database, avviarne uno con
# DATABASE_URL non impostata e passarne l'indirizzo.

set -uo pipefail
BASE="${1:-http://localhost:3000}"
superati=0
falliti=0

prova() {
  local nome="$1" atteso="$2" ottenuto="$3"
  if [ "$atteso" = "$ottenuto" ]; then
    printf '  ok   %-56s %s\n' "$nome" "$ottenuto"
    superati=$((superati + 1))
  else
    printf '  KO   %-56s atteso %s, ottenuto %s\n' "$nome" "$atteso" "$ottenuto"
    falliti=$((falliti + 1))
  fi
}

codice() { curl -s -o /dev/null -w '%{http_code}' "$@"; }

conDatabase=$(curl -s "$BASE/api/system/health" | grep -c '"databaseUrl":true' || true)

echo "Fallback corsi — $BASE"
echo
echo "Pagine pubbliche"
prova 'catalogo /corsi (anche senza database)' 200 "$(codice "$BASE/corsi")"
prova 'corso inesistente' 404 "$(codice "$BASE/corsi/questo-non-esiste")"

if [ "$conDatabase" != "0" ]; then
  prova 'corso non pubblicato' 404 "$(codice "$BASE/corsi/ia-operativa-pmi")"
fi

echo
echo 'Senza sessione'
prova 'checkout corso' 401 "$(codice -X POST -H 'Content-Type: application/json' -d '{}' "$BASE/api/checkout/corso")"
prova 'progresso lezione' 401 "$(codice -X POST -H 'Content-Type: application/json' -d '{"lezione_id":"x"}' "$BASE/api/data/corsi/progresso")"
prova 'i miei corsi' 401 "$(codice "$BASE/api/data/corsi/miei")"
prova 'video di una lezione' 403 "$(codice "$BASE/api/corsi/video/00000000-0000-0000-0000-000000000000")"
prova 'area studente' 307 "$(codice "$BASE/portale/corsi")"

if [ "$conDatabase" != "0" ]; then
  prova 'catalogo amministrazione' 401 "$(codice "$BASE/api/data/corsi")"
  prova 'vendite' 401 "$(codice "$BASE/api/data/corsi/vendite")"
fi

echo
echo 'Stato di un ordine'
prova 'senza session_id' 400 "$(codice "$BASE/api/checkout/corso")"
prova 'session_id inventato' 404 "$(codice "$BASE/api/checkout/corso?session_id=cs_test_inventato")"

if [ "$conDatabase" != "0" ]; then
  echo
  echo 'Contenuto riservato fuori dalle pagine pubbliche'
  pagina=$(curl -s "$BASE/corsi/aula-obblighi-ia")
  if echo "$pagina" | grep -qiE 'zoom\.us|video_storage_key'; then
    printf '  KO   %-56s trovato nel sorgente\n' 'link stanza e chiavi video'
    falliti=$((falliti + 1))
  else
    printf '  ok   %-56s assenti\n' 'link stanza e chiavi video'
    superati=$((superati + 1))
  fi
fi

echo
echo "$superati superati, $falliti falliti"
[ "$falliti" -eq 0 ]
