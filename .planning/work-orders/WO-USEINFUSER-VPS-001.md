---
work_order: WO-USEINFUSER-VPS-001
status: active
central_branch: codex/migrar-useinfuser-vps
owner: Codex
authorized_by: Yan
authorized_at: 2026-09-09
scope_lock:
  version: 1
  base_commit: 435d4508fc429efef3d30e1b9327b76b6dfc85af
  allowed_write_globs:
    - .planning/work-orders/WO-USEINFUSER-VPS-001.md
    - specs/006-migracao-useinfuser-vps/**
    - deploy/vps/**
    - .githooks/pre-commit
    - .dockerignore
    - eslint.config.mjs
    - next.config.ts
    - src/app/api/health/**
    - src/app/api/diagnostico/roteiro/fila/route.ts
    - scripts/diagnostico/servico-roteiro.mjs
    - tests/diagnostico/fila-worker.test.ts
    - package.json
    - package-lock.json
    - scripts/check-scope-lock.js
  architecture_delta:
    production_files:
      - deploy/vps/Dockerfile
      - deploy/vps/compose.prod.yml
      - deploy/vps/Caddyfile.block
      - deploy/vps/deploy.sh
      - deploy/vps/smoke.mjs
      - .dockerignore
      - eslint.config.mjs
      - next.config.ts
      - src/app/api/health/route.ts
      - src/app/api/diagnostico/roteiro/fila/route.ts
      - scripts/diagnostico/servico-roteiro.mjs
      - .githooks/pre-commit
      - scripts/check-scope-lock.js
    runtime_dependencies:
      - package.json
      - package-lock.json
    public_contracts:
      - GET /api/health
      - GET /api/diagnostico/roteiro/fila responde sem long-poll
    persistence_surfaces: []
    background_jobs:
      - scripts/diagnostico/servico-roteiro.mjs
  acceptance_ids:
    - AC-01
    - AC-02
    - AC-03
    - AC-04
    - AC-05
    - AC-06
    - AC-07
    - AC-08
    - AC-09
    - AC-10
  stop_when:
    - AC-01
    - AC-02
    - AC-03
    - AC-04
    - AC-05
    - AC-06
    - AC-07
    - AC-08
    - AC-09
    - AC-10
  passed_acceptance_ids: []
---

# Work order: migrar useinfuser.com para a VPS

## Objetivo

Executar o pacote [specs/006-migracao-useinfuser-vps/INDEX.md](../../specs/006-migracao-useinfuser-vps/INDEX.md) sem mudar produto, conteúdo ou dados.

## Aceites

| ID | Critério | Evidência esperada |
|---|---|---|
| AC-01 | Baseline e definição prontos | Build base, teste base e Scope Lock PASS. |
| AC-02 | Código de deploy reproduzível | Compose/Dockerfile validados. |
| AC-03 | Todas as rotas públicas respondem | Relatório do smoke interno e público. |
| AC-04 | Proteções e webhooks falham fechados | Status e headers negativos. |
| AC-05 | Container está healthy e isolado | Docker inspect e rede. |
| AC-06 | Long-poll não existe mais | Teste de regressão e duração da fila. |
| AC-07 | Apex e `www` servem a VPS com TLS | DNS, certificado e release. |
| AC-08 | Rollback foi preparado e validado | Backups, tags e comandos de rollback. |
| AC-09 | Runtime não tem vulnerabilidade crítica conhecida | Audit focado e versões. |
| AC-10 | Produção observada sem regressão | Health, logs, recursos e 5xx após corte. |

## Evidências

Preencher somente depois de cada prova. Não marcar aceite por intenção.
