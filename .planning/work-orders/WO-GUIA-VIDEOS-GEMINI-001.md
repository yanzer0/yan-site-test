---
work_order: WO-GUIA-VIDEOS-GEMINI-001
created: 2026-11-03
updated: 2026-11-03
status: active
classe: conteudo
risco: baixo
central_branch: claude/guia-videos-gemini-20261103
owner: Claude
authorized_by: Yan
authorized_at: 2026-11-03
definition_source: pedido do Yan em 03/11/2026 ("sobe esse também e o inclua na central", guia-videos-gemini-previa.html)
scope_lock:
  version: 1
  base_commit: 49fa7ef
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-VIDEOS-GEMINI-001.md
    - public/guia-videos-gemini.html
    - src/app/guia-videos-gemini/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-videos-gemini.html, src/app/guia-videos-gemini/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-videos-gemini, GET /guias/videos-gemini]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GVG-01, GVG-02, GVG-03]
  stop_when: [GVG-01, GVG-02, GVG-03]
  passed_acceptance_ids: []
---
# Guia de vídeos no Gemini na Central

Objetivo: publicar o guia "4 prompts de vídeo no Gemini" em `/guia-videos-gemini` (caminho do og:url do próprio HTML), protegido pelo cadastro como os demais e listado na Central em Guias. Ajuste no HTML: loader `/guias/marketing.js` no bloco do GTM, que vinha vazio.

- GVG-01: `GUIAS` tem 20 itens e o caminho resolve para o guia; testes de `tests/guias` verdes com as contagens novas.
- GVG-02: build de produção sem erro e smoke da VPS cobrindo `/guia-videos-gemini`.
- GVG-03: em produção, sem sessão o guia redireciona ao cadastro e a Central mostra 32 itens.
