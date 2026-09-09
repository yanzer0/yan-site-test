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
  passed_acceptance_ids:
    - AC-01
    - AC-02
    - AC-03
    - AC-04
    - AC-05
    - AC-06
    - AC-07
    - AC-08
    - AC-09
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

| ID | Evidência |
|---|---|
| AC-01 | EDP 1.0 ready, Scope Lock PASS, baseline documentado. |
| AC-02 | Dockerfile/Compose validados e três builds limpos na VPS. |
| AC-03 | 59 probes aprovados no apex e 59 no `www`. |
| AC-04 | Basic auth, CSP, redirects privados, 401/404/405 e APIs do SkillTree falharam fechados. |
| AC-05 | Container healthy, não-root, read-only, sem porta publicada e rede dedicada. |
| AC-06 | Teste de regressão verde; worker 200 em 0,95 s e intervalo local de 60 s. |
| AC-07 | Dois autoritativos e três resolvedores públicos no novo IP; TLS Let's Encrypt válido nos dois hosts. |
| AC-08 | Imagens anteriores e backups timestampados de Caddy, Compose e supervisor preservados. |
| AC-09 | Next 15.5.25 e Sharp 0.35.4; audit sem vulnerabilidade crítica. |
| AC-10 | Aguardando o commit final de closeout após a janela de observação, já sem incremento de 5xx. |
