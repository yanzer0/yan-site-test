#!/usr/bin/env bash
# Daily encrypted backup of formulario-db, with the restore drill built in.
# Writes <dir>/formulario-<utc>-<release>.{dump.age,sha256,resumo} and keeps 14 days.
# The plaintext dump carries PII (e-mail, WhatsApp): it never survives this script.
#
#   backup.sh /home/infuser/backups/formulario
set -euo pipefail
umask 077

falhar() {
  printf 'backup-formulario: FALHA: %s\n' "$1" >&2
  exit 2
}
trap 'falhar "o backup não foi concluído"' ERR

[[ $# -eq 1 ]] || falhar "informe exatamente um diretório de saída"

command -v docker >/dev/null 2>&1 || falhar "docker não encontrado"
command -v age >/dev/null 2>&1 || falhar "age não encontrado"
docker inspect formulario-db >/dev/null 2>&1 || falhar "contêiner formulario-db não encontrado"

# Keeps Git Bash on Windows from rewriting container paths.
export MSYS_NO_PATHCONV=1

aqui="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
recipients="${AGE_RECIPIENTS:-$HOME/.config/age/recipients.txt}"
[[ -s "$recipients" ]] || falhar "recipients age ausente em $recipients"

diretorio_saida="${1%/}"
mkdir -p "$diretorio_saida" || falhar "não consegui criar $diretorio_saida"
[[ -w "$diretorio_saida" ]] || falhar "sem permissão de escrita em $diretorio_saida"

# Ties the backup to the running release, the way deploy/crm/backup.sh ties it to the Twenty tag.
release="$(docker inspect --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' useinfuser-site 2>/dev/null || true)"
if [[ -z "$release" ]]; then
  imagem_viva="$(docker inspect --format '{{.Config.Image}}' useinfuser-site 2>/dev/null || true)"
  release="${imagem_viva##*:}"
  release="${release%@*}"
fi
release="$(printf '%s' "${release:-unknown}" | tr -c 'A-Za-z0-9._-' '_')"
[[ -n "$release" ]] || release=unknown

data_utc="$(date -u '+%Y%m%dT%H%M%SZ')"
prefixo="${diretorio_saida}/formulario-${data_utc}-${release}"
dump="${prefixo}.dump"

trap 'rm -f "$dump"' EXIT

docker exec formulario-db pg_dump -U postgres -d formulario -Fc >"$dump"
[[ -s "$dump" ]] || falhar "o dump ficou vazio"

"$aqui/contar-tabelas.sh" docker exec formulario-db psql -U postgres -d formulario >"${prefixo}.resumo"
( cd "$diretorio_saida" && sha256sum "$(basename "$dump")" >"$(basename "$prefixo").sha256" )

age -R "$recipients" -o "${prefixo}.dump.age" "$dump"
[[ -s "${prefixo}.dump.age" ]] || falhar "o arquivo cifrado ficou vazio"

# Drill after the encrypted copy is already on disk: a drill that fails alerts without throwing
# away the day's backup. It runs on the plaintext because the age private key lives in the
# password manager, not here.
"$aqui/restore-drill.sh" "$dump"

find "$diretorio_saida" -maxdepth 1 -type f \
  \( -name 'formulario-*.dump.age' -o -name 'formulario-*.sha256' -o -name 'formulario-*.resumo' \) \
  -mtime +14 -delete

trap - ERR
printf 'backup-formulario: OK: %s.dump.age cifrado, drill verde, %s tabelas (release %s)\n' \
  "$(basename "$prefixo")" "$(grep -vc '^seq:' "${prefixo}.resumo" || true)" "$release"
