#!/usr/bin/env bash
# Runs once, on the first boot of the formulario-db-data volume, as the cluster
# superuser over the local socket. Creates the application role, its database and
# pgcrypto. The password never reaches argv, a log line or a SQL string: psql
# reads it from the environment with \getenv and quotes it with :'...'.
set -euo pipefail

app_password_file=/run/secrets/db_app_password

if [ ! -s "$app_password_file" ]; then
  echo "formulario-db init: missing or empty $app_password_file" >&2
  exit 1
fi

FORMULARIO_APP_PASSWORD="$(cat "$app_password_file")"
export FORMULARIO_APP_PASSWORD

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<'SQL'
\getenv app_password FORMULARIO_APP_PASSWORD
CREATE ROLE formulario LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD :'app_password';
CREATE DATABASE formulario OWNER formulario ENCODING 'UTF8';
SQL

unset FORMULARIO_APP_PASSWORD

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname formulario <<'SQL'
CREATE EXTENSION IF NOT EXISTS pgcrypto;
REVOKE ALL ON DATABASE formulario FROM PUBLIC;
SQL

echo "formulario-db init: role formulario, database formulario and pgcrypto are ready"
