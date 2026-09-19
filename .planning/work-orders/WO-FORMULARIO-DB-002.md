---
work_order: WO-FORMULARIO-DB-002
status: active
central_branch: claude/formulario-db-f1
owner: Opus 5 (executor) / Claude (validador)
authorized_by: Yan
authorized_at: 2026-09-19
scope_lock:
  version: 1
  base_commit: 850f53351f7a34f5846524ec060defe380f869d3
  allowed_write_globs:
    - .planning/work-orders/WO-FORMULARIO-DB-002.md
    - deploy/vps/compose.prod.yml
    - deploy/vps/deploy.sh
    - deploy/vps/README.md
    - deploy/vps/formulario-db/**
    - specs/008-formulario-db-postgres-vps/**
  architecture_delta:
    production_files:
      - deploy/vps/compose.prod.yml
      - deploy/vps/deploy.sh
      - deploy/vps/formulario-db/init/01-formulario.sh
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces:
      - volume formulario-db-data
      - rede docker formulario-net (internal)
    background_jobs: []
  acceptance_ids:
    - AC-02
  stop_when:
    - AC-02
  passed_acceptance_ids: []
---

# WO-FORMULARIO-DB-002: F1, o banco `formulario-db` no Compose e vivo na VPS

## Autorização

Yan, 19/09/2026: "go pra todas, vá até o fim". Pacote: `specs/008-formulario-db-postgres-vps/`
(`README.md` decisões congeladas 1 a 3, `ARQUITETURA.md` §4.1, §4.2, §6, `DADOS-E-APIS.md` §3,
`PLANO-DE-IMPLEMENTACAO.md` §4 F1, `VERIFICACAO-E-OPERACAO.md` §2, §4, §8).

## Escopo

Serviço `formulario-db` (`postgres:17.<minor>` pinado após `docker pull` na VPS, digest
registrado), rede `formulario-net` `internal: true`, volume `formulario-db-data`, secrets de senha
admin e app em arquivos 600 em `/home/infuser/.config/useinfuser/`, init de role `formulario`
(LOGIN, sem SUPERUSER/CREATEDB/CREATEROLE), banco `formulario` e extensão `pgcrypto`, healthcheck
`pg_isready`, limites, `TZ`/`PGTZ` UTC, `depends_on` no site com `condition: service_healthy`,
`deploy.sh` subindo o banco e esperando health antes do site. O site continua apontando para o
Neon; nenhum env do site muda nesta ordem.

## Fora do escopo

Driver, env do site, dump, restore, backup, Caddy, worker, Neon. Nunca `docker compose down`,
nunca `-v`, nunca tocar em `useinfuser.env`.

## Critérios de aceite

| ID | Critério | Prova exigida |
|---|---|---|
| AC-02 | `formulario-db` healthy na VPS, isolado, role sem privilégio de cluster, site healthy no Neon, disco medido | `docker inspect formulario-db` sem `PortBindings` e com `cap_drop`; `docker network inspect formulario-net` só com `formulario-db` e `useinfuser-site` e `Internal: true`; `select rolname, rolsuper, rolcreatedb, rolcreaterole from pg_roles where rolname='formulario'` = `f f f`; `select extname from pg_extension` no banco `formulario` contém `pgcrypto`; `docker compose config --quiet` limpo; `df -h /` antes e depois; `GET /api/health` 200 e `docker ps` do site `healthy`; tag e digest da imagem registrados |

## Evidência

(preenchida pelo executor; nunca colar senha, URL de conexão ou conteúdo de env)
