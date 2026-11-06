---
work_order: WO-GUIA-INSTACLAUDE-001
created: 2026-11-06
updated: 2026-11-06
status: active
classe: conteudo
risco: baixo
central_branch: claude/guia-instaclaude-20261106
owner: Claude
authorized_by: Yan
authorized_at: 2026-11-06
definition_source: pedido do Yan em 06/11/2026 ("sobe esse como /guia- instaclaude", guia-setup-previa.html)
scope_lock:
  version: 1
  base_commit: ea4b181
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-INSTACLAUDE-001.md
    - public/guia-instaclaude.html
    - src/app/guia-instaclaude/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-instaclaude.html, src/app/guia-instaclaude/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-instaclaude, GET /guias/instaclaude]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GIC-01, GIC-02, GIC-03]
  stop_when: [GIC-01, GIC-02, GIC-03]
  passed_acceptance_ids: []
---
# Guia de Claude no Instagram na Central

Objetivo: publicar o guia "Ligue o Claude ao seu Instagram" em `/guia-instaclaude`, protegido pelo cadastro como os demais e listado na Central em Guias. Ajustes no HTML: loader `/guias/marketing.js` no bloco do GTM, que vinha vazio, e `og:url` apontando para o caminho pedido.

- GIC-01: `GUIAS` tem 54 itens e o caminho resolve para o guia; testes de `tests/guias` verdes com as contagens novas.
- GIC-02: build de produção sem erro e smoke da VPS cobrindo `/guia-instaclaude`.
- GIC-03: em produção, sem sessão o guia redireciona ao cadastro e a Central mostra 67 itens.
