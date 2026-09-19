#!/usr/bin/env bash
# Proves a formulario-db dump still restores: throwaway postgres container, same role, database
# and extension the F1 init creates, then the row counts of the restored copy against the
# .resumo written next to the dump. Container and volume go away on any exit.
#
#   restore-drill.sh /home/infuser/backups/formulario/formulario-<utc>-<release>.dump
#   AGE_IDENTITY=/caminho/chave.txt restore-drill.sh .../formulario-<utc>-<release>.dump.age
#
# The age private key is NOT on this host (only the public recipient is: see deploy/vps/README.md),
# so backup.sh runs this on the plaintext dump before encrypting it. The .dump.age path is for a
# human who brought the key back from the password manager.
set -euo pipefail
umask 077

falhar() {
  printf 'restore-drill: FALHA: %s\n' "$1" >&2
  exit 2
}

[[ $# -eq 1 ]] || falhar "informe exatamente um arquivo .dump ou .dump.age"

arquivo="$1"
[[ -f "$arquivo" ]] || falhar "arquivo não encontrado: $arquivo"

case "$arquivo" in
  *.dump.age) prefixo="${arquivo%.dump.age}"; cifrado=1 ;;
  *.dump)     prefixo="${arquivo%.dump}";     cifrado=0 ;;
  *) falhar "esperado um .dump ou um .dump.age" ;;
esac

command -v docker >/dev/null 2>&1 || falhar "docker não encontrado"

# Keeps Git Bash on Windows from rewriting container paths.
export MSYS_NO_PATHCONV=1

aqui="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
base="$(basename "$prefixo")"
resumo_origem="${prefixo}.resumo"
# Exists, not non-empty: a dump of a database with no tables has an empty resumo, and that is
# what formulario-db legitimately looks like until the F5 cut loads it.
[[ -f "$resumo_origem" ]] || falhar "resumo de contagens ausente: $resumo_origem"

# Restores on the same image the live database runs, so a minor bump never drifts the drill.
imagem="$(docker inspect --format '{{.Config.Image}}' formulario-db 2>/dev/null || true)"
imagem="${imagem:-postgres:17.11}"

nome="formulario-drill-$$"
trabalho="$(mktemp -d "${TMPDIR:-/tmp}/formulario-drill-XXXXXX")"

limpar() {
  docker rm -f "$nome" >/dev/null 2>&1 || true
  docker volume rm "$nome" >/dev/null 2>&1 || true
  rm -rf "$trabalho"
}
trap limpar EXIT
trap 'falhar "o drill não foi concluído"' ERR

if [[ $cifrado -eq 1 ]]; then
  identidade="${AGE_IDENTITY:-}"
  [[ -n "$identidade" && -f "$identidade" ]] ||
    falhar "AGE_IDENTITY precisa apontar para a chave privada age; ela não fica nesta VPS (ver deploy/vps/README.md)"
  claro="${trabalho}/${base}.dump"
  age -d -i "$identidade" -o "$claro" "$arquivo"
  cp "${prefixo}.sha256" "$trabalho/" 2>/dev/null || true
else
  claro="$arquivo"
fi

# The sha256 is of the plaintext dump, so it is only checkable here, with the plaintext in hand.
if [[ -s "$(dirname "$claro")/${base}.sha256" ]]; then
  ( cd "$(dirname "$claro")" && sha256sum -c "${base}.sha256" )
else
  printf 'restore-drill: aviso: %s.sha256 ausente, seguindo sem conferir o hash\n' "$base" >&2
fi

docker volume create "$nome" >/dev/null
docker run -d --name "$nome" --network none \
  -e POSTGRES_PASSWORD=descartavel -e TZ=UTC -e PGTZ=UTC \
  -v "${nome}:/var/lib/postgresql/data" "$imagem" >/dev/null

pronto=0
for _ in $(seq 1 60); do
  if docker exec "$nome" pg_isready -U postgres -q >/dev/null 2>&1; then pronto=1; break; fi
  sleep 1
done
[[ $pronto -eq 1 ]] || falhar "o contêiner descartável não ficou pronto em 60 s"

# Same role, database and extension as deploy/vps/formulario-db/init/01-formulario.sh. No password:
# nothing connects as formulario here, the container has no network.
docker exec "$nome" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q \
  -c "CREATE ROLE formulario LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE" \
  -c "CREATE DATABASE formulario OWNER formulario ENCODING 'UTF8'"
docker exec "$nome" psql -U postgres -d formulario -v ON_ERROR_STOP=1 -q \
  -c "CREATE EXTENSION IF NOT EXISTS pgcrypto" \
  -c "REVOKE ALL ON DATABASE formulario FROM PUBLIC"

# --no-comments: COMMENT ON EXTENSION pgcrypto fails under --role=formulario, which does not own
# the extension. --no-acl: a dump taken from Neon carries GRANTs to cloud_admin and
# neon_superuser, roles that do not exist here; ownership from --role is the whole access model.
# Both measured in the F3 drill.
docker exec -i "$nome" pg_restore -U postgres -d formulario \
  --no-owner --role=formulario --no-comments --no-acl --exit-on-error <"$claro"

"$aqui/contar-tabelas.sh" docker exec "$nome" psql -U postgres -d formulario >"${trabalho}/destino.resumo"
diff "$resumo_origem" "${trabalho}/destino.resumo" || falhar "as contagens do restore não batem com o resumo do dump"

trap - ERR
printf 'restore-drill: OK: %s restaurou com %s linhas de contagem iguais ao resumo\n' \
  "$(basename "$arquivo")" "$(wc -l <"$resumo_origem" | tr -d ' ')"
