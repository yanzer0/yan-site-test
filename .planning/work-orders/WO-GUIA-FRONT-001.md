---
work_order: WO-GUIA-FRONT-001
created: 2026-11-17
updated: 2026-11-17
status: active
classe: conteudo
risco: baixo
central_branch: main
owner: Claude
authorized_by: Pedro
authorized_at: 2026-11-17
definition_source: pedido do Pedro em 17/11/2026 ("faça o guia do dia 8 das skills"), palavra FRONT do CTA do reel do Dia 8 (projeto.json em reels-30-skills/dia-08)
scope_lock:
  version: 1
  base_commit: 2b0eb57
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-FRONT-001.md
    - src/app/front/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [src/app/front/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /front]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GFR-01, GFR-02, GFR-03]
  stop_when: [GFR-01, GFR-02, GFR-03]
  passed_acceptance_ids: []
---
# Atalho FRONT do guia do Dia 08 (frontend-design)

Objetivo: o guia "Dia 08: frontend-design" já existe em `/guia-frontend-design` (v2 clara, commit 02b4bc4). O reel do Dia 8 pede para comentar FRONT, então o ManyChat precisa de um atalho curto: `/front` serve o mesmo HTML, protegido pelo cadastro. Nenhum guia novo; contagens da Central não mudam.

- GFR-01: `/front` está em `aliases` do guia frontend-design no catálogo e tem route handler.
- GFR-02: build de produção sem erro e smoke da VPS cobrindo `/guia-frontend-design` e `/front`.
- GFR-03: em produção, sem sessão `/front` redireciona ao cadastro.