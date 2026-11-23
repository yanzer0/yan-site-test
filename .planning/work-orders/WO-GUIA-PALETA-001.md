---
work_order: WO-GUIA-PALETA-001
created: 2026-11-23
updated: 2026-11-23
status: active
classe: conteudo
risco: baixo
central_branch: main
owner: Claude
authorized_by: Pedro
authorized_at: 2026-11-23
definition_source: pedido do Pedro em 23/11/2026 ("crie e publique o guia do dia 9 das 30 skills 30 dias"), palavra PALETA do CTA do reel do Dia 9 (projeto.json em reels-30-skills/dia-09); fatos conferidos em github.com/nextlevelbuilder/ui-ux-pro-max-skill
scope_lock:
  version: 1
  base_commit: ae2e17a
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-PALETA-001.md
    - public/guia-ui-ux-pro-max.html
    - public/guias/ui-ux-pro-max/**
    - src/app/paleta/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-ui-ux-pro-max.html, public/guias/ui-ux-pro-max/tela-clinica.jpg, src/app/paleta/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /paleta]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GPA-01, GPA-02, GPA-03]
  stop_when: [GPA-01, GPA-02, GPA-03]
  passed_acceptance_ids: []
---
# Guia do Dia 09 (ui-ux-pro-max): prompt do vídeo e atalho PALETA

Objetivo: o guia "Dia 09: ui-ux-pro-max" já existe em `/guia-ui-ux-pro-max` (commit 02b4bc4). O reel do Dia 9 pede para comentar PALETA e promete o passo a passo e o prompt que gerou a tela. O guia ganha o prompt do vídeo, o comando e a paleta da base, atualiza os números do repositório e recebe o atalho `/paleta`. Contagens da Central não mudam.

- GPA-01: `/paleta` está em `aliases` do guia ui-ux-pro-max no catálogo e tem route handler.
- GPA-02: build de produção sem erro e smoke da VPS cobrindo `/guia-ui-ux-pro-max` e `/paleta`.
- GPA-03: em produção, sem sessão `/paleta` redireciona ao cadastro.
