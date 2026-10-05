---
work_order: WO-GUIA-99-COMANDOS-URL-001
status: complete
central_branch: main
owner: Claude
authorized_by: Yan
authorized_at: 2026-10-05
definition_source: pedido do Yan em 05/10/2026 ("suba esse guia no useinfuser.com/99comandos")
scope_lock:
  version: 1
  base_commit: 5cb5c2ac38918a53618a5bf16f6375cf72a89ca6
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-99-COMANDOS-URL-001.md
    - src/app/99comandos/route.ts
    - public/guia-99-comandos.html
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files:
      - src/app/99comandos/route.ts
      - public/guia-99-comandos.html
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [G99-S01, G99-S02]
  stop_when: [G99-S01, G99-S02]
  passed_acceptance_ids: [G99-S01, G99-S02]
---

# Guia dos 99 comandos em /99comandos

## Resultado autorizado

Yan, 05/10/2026: "Suba esse guia no useinfuser.com/99comandos". O guia já estava commitado em
`5cb5c2a` (Pedro) em /guia-99-comandos, mas sem deploy na VPS (404). O HTML do Desktop do Yan é
idêntico ao de `public/guia-99-comandos.html` (diff ignorando CRLF). A URL curta reaproveita o
mesmo arquivo; og:url passa a apontar pra /99comandos.

## Critérios

- G99-S01: `/99comandos` e `/guia-99-comandos` respondem 200 com o guia nos dois hosts.
- G99-S02: deploy na VPS saudável (`/api/health` + smoke).

## Evidência

- G99-S01: curl em 05/10/2026, `useinfuser.com` e `www.useinfuser.com`, `/99comandos` e
  `/guia-99-comandos`: 200 com o título do guia; 99 linhas `.cmd` na página servida.
- G99-S02: `deploy/vps/deploy.sh` na VPS com EXIT=0, "useinfuser-site release 06113e46e569 is healthy".
