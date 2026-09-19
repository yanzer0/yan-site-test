#!/usr/bin/env bash
# Prints one "table,rows" line per BASE table of schema public, then one
# "seq:<name>,<last_value>" line per sequence, sorted. This is the row-count proof used on both
# sides of a dump (origin and restored copy): only count(*) and catalogs are read, never a data
# column.
#
# The psql invocation is passed in as arguments so that a connection URL can stay in the
# environment and never show up in argv or in the shell history:
#   contar-tabelas.sh docker exec formulario-db psql -U postgres -d formulario
#   contar-tabelas.sh docker run --rm -e NEON_URL postgres:17.11 sh -c 'exec psql "$NEON_URL" "$@"' sh
set -euo pipefail

if [[ $# -eq 0 ]]; then
  printf 'contar-tabelas: informe o comando psql como argumentos\n' >&2
  exit 2
fi

# Keeps Git Bash on Windows from rewriting the xpath expression below as a path.
export MSYS_NO_PATHCONV=1

# query_to_xml counts every table inside a single statement, so a remote connection is opened
# once instead of once per table.
sql="
select linha from (
  select 1 as ordem,
         table_name as nome,
         table_name || ',' ||
           (xpath('/row/c/text()',
                  query_to_xml(format('select count(*) as c from %I.%I', table_schema, table_name),
                               false, true, '')))[1]::text as linha
    from information_schema.tables
   where table_schema = 'public' and table_type = 'BASE TABLE'
  union all
  select 2,
         sequencename,
         'seq:' || sequencename || ',' || coalesce(last_value::text, 'sem valor')
    from pg_sequences
   where schemaname = 'public'
) t
order by ordem, nome
"

"$@" -Atc "$sql"
