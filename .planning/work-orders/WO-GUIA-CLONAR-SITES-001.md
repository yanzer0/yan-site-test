---
work_order: WO-GUIA-CLONAR-SITES-001
created: 2026-11-04
updated: 2026-11-04
status: active
classe: conteudo
risco: baixo
central_branch: claude/guia-clonar-sites-20261104
owner: Claude
authorized_by: Yan
authorized_at: 2026-11-04
definition_source: pedido do Yan em 04/11/2026 ("sobe esse como /guia-clonar-sites e inclua na central", guia-clonar-sites-previa.html)
scope_lock:
  version: 1
  base_commit: eb7b662
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-CLONAR-SITES-001.md
    - public/guia-clonar-sites.html
    - src/app/guia-clonar-sites/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-clonar-sites.html, src/app/guia-clonar-sites/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-clonar-sites, GET /guias/clonar-sites]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GCS-01, GCS-02, GCS-03]
  stop_when: [GCS-01, GCS-02, GCS-03]
  passed_acceptance_ids: []
---
# Guia de clonar sites na Central

Objetivo: publicar o guia "Clone o design de qualquer site com o Claude" em `/guia-clonar-sites`, protegido pelo cadastro como os demais e listado na Central em Guias. Ajuste no HTML: loader `/guias/marketing.js` no bloco do GTM, que vinha vazio.

- GCS-01: `GUIAS` tem 51 itens e o caminho resolve para o guia; testes de `tests/guias` verdes com as contagens novas.
- GCS-02: build de produção sem erro e smoke da VPS cobrindo `/guia-clonar-sites`.
- GCS-03: em produção, sem sessão o guia redireciona ao cadastro e a Central mostra 64 itens.
