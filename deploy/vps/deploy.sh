#!/usr/bin/env bash
set -euo pipefail

repo_dir="${1:-/home/infuser/useinfuser-site}"
env_file="${USEINFUSER_ENV_FILE:-/home/infuser/.config/useinfuser/useinfuser.env}"
compose_file="$repo_dir/deploy/vps/compose.prod.yml"

cd "$repo_dir"

release="${APP_RELEASE:-$(git rev-parse --short=12 HEAD)}"
export APP_RELEASE="$release"
export USEINFUSER_ENV_FILE="$env_file"

if [[ ! -f "$env_file" ]]; then
  echo "Missing production environment file: $env_file" >&2
  exit 2
fi

mode="$(stat -c '%a' "$env_file")"
if [[ "$mode" != "600" ]]; then
  echo "Production environment file must use mode 600, got $mode" >&2
  exit 2
fi

docker compose -f "$compose_file" config --quiet
DOCKER_BUILDKIT=1 docker compose -f "$compose_file" build site
docker compose -f "$compose_file" up -d --no-deps site

for attempt in $(seq 1 20); do
  health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}missing{{end}}' useinfuser-site)"
  if [[ "$health" == "healthy" ]]; then
    docker exec useinfuser-site node /app/smoke.mjs http://127.0.0.1:3000 "$release"
    echo "useinfuser-site release $release is healthy"
    exit 0
  fi
  if [[ "$health" == "unhealthy" ]]; then
    docker logs --tail 100 useinfuser-site >&2
    exit 1
  fi
  sleep 3
done

docker logs --tail 100 useinfuser-site >&2
echo "useinfuser-site did not become healthy" >&2
exit 1
