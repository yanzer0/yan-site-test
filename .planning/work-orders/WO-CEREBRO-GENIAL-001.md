---
work_order: WO-CEREBRO-GENIAL-001
status: authorized
central_branch: claude/cerebro-genial
owner: Claude
authorized_by: Iago
authorized_at: 2026-11-24
scope_lock:
  version: 1
  base_commit: a12e22acaa616cb9d756adc1d2db3f35fbdf8808
  allowed_write_globs:
    - .planning/work-orders/WO-CEREBRO-GENIAL-001.md
    - public/cerebro-genial.html
    - src/app/cerebro-genial/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files:
      - public/cerebro-genial.html
      - src/app/cerebro-genial/route.ts
    runtime_dependencies: []
    public_contracts:
      - GET /cerebro-genial responde 200 em text/html
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids:
    - AC-01
    - AC-02
    - AC-03
  stop_when:
    - AC-01
    - AC-02
    - AC-03
  passed_acceptance_ids: []
---

# Work order: pagina de upsell do Kit Segundo Cerebro

## Objetivo

Publicar em `/cerebro-genial` a pagina de upsell exibida depois da compra do Kit (R$ 67),
que vende o Segundo Cerebro Genial por R$ 157 pelo link de checkout 1-clique da Hubla.

## Aceites

| ID | Criterio | Evidencia esperada |
|---|---|---|
| AC-01 | `/cerebro-genial` responde 200 em HTML | Smoke e resposta em producao. |
| AC-02 | Botoes de compra vao para o link 1-clique e a recusa para a area de membros do Kit | Hrefs do HTML publicado. |
| AC-03 | Tracking da casa | Loader do GTM no `<head>` e parametros/`utm_*` repassados aos botoes. |
