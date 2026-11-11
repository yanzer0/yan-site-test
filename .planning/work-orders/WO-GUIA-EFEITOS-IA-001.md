---
work_order: WO-GUIA-EFEITOS-IA-001
created: 2026-11-11
updated: 2026-11-11
status: active
classe: conteudo
risco: baixo
central_branch: claude/guia-efeitos-ia-20261111
owner: Claude
authorized_by: Yan
authorized_at: 2026-11-11
definition_source: pedido do Yan em 11/11/2026 ("sobe no /guia-efeitos-ia", guia-efeitos-ia-previa.html)
scope_lock:
  version: 1
  base_commit: 3089613
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-EFEITOS-IA-001.md
    - public/guia-efeitos-ia.html
    - src/app/guia-efeitos-ia/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-efeitos-ia.html, src/app/guia-efeitos-ia/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-efeitos-ia, GET /guias/efeitos-ia]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GEI-01, GEI-02, GEI-03]
  stop_when: [GEI-01, GEI-02, GEI-03]
  passed_acceptance_ids: []
---
# Guia de efeitos de edição com IA na Central

Objetivo: publicar o guia "Quatro efeitos de edição com IA" em `/guia-efeitos-ia`, protegido pelo cadastro como os demais e listado na Central em Guias. Ajuste no HTML: loader `/guias/marketing.js` no bloco do GTM, que vinha vazio.

- GEI-01: `GUIAS` tem 60 itens e o caminho resolve para o guia; testes de `tests/guias` verdes com as contagens novas.
- GEI-02: build de produção sem erro e smoke da VPS cobrindo `/guia-efeitos-ia`.
- GEI-03: em produção, sem sessão o guia redireciona ao cadastro e a Central mostra 73 itens.
