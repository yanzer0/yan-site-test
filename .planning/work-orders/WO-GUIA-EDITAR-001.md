---
work_order: WO-GUIA-EDITAR-001
created: 2026-11-02
updated: 2026-11-02
status: active
classe: conteudo
risco: baixo
central_branch: claude/guia-editar-20261102
scope_lock:
  version: 1
  base_commit: cc611efa7639
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-EDITAR-001.md
    - public/guia-editar-videos.html
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - src/app/guia-editar-videos/**
    - src/app/editar/**
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-editar-videos.html, src/lib/guias/catalogo.ts, src/middleware.ts, src/app/guia-editar-videos/route.ts, src/app/editar/route.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-editar-videos, GET /editar, GET /guias/editar-videos]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [AC-01, AC-02, AC-03]
  stop_when: [AC-01, AC-02, AC-03]
  passed_acceptance_ids: [AC-01]
---
# Guia EDITAR na Central

Objetivo: publicar o guia "Você grava uma vez. A IA edita o resto.", entrega do Reels "Sou advogado. A IA consegue editar meus vídeos?" (palavra-chave EDITAR), em identidade v2 clara, como 17º guia da Central, protegido pelo cadastro como os demais. Fonte do conteúdo: `_knowledge/conteudo/guias/guia-editar-videos.html` no brain. Fora: mudança de layout da Central, captura ou middleware.

- AC-01: `GUIAS` tem 17 itens e `/guia-editar-videos`, `/editar` e `/guias/editar-videos` resolvem para o guia; testes de `tests/guias` verdes com as contagens novas.
- AC-02: build de produção sem erro e smoke da VPS cobrindo `/guia-editar-videos`.
- AC-03: em produção, sem sessão o guia redireciona ao cadastro; com sessão serve o HTML, e a Central mostra 29 itens.
