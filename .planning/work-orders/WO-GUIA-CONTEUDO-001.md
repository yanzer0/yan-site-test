---
work_order: WO-GUIA-CONTEUDO-001
created: 2026-11-09
updated: 2026-11-09
status: active
classe: conteudo
risco: baixo
central_branch: main
owner: Claude
authorized_by: Pedro
authorized_at: 2026-11-09
definition_source: pedido do Pedro em 09/11/2026 ("use a skill de guia da infuser e suba o guia do reels 11", palavra CONTEÚDO; doc ROTEIROS E PROMPTS · SEMANA 1, item 11 dos guias)
scope_lock:
  version: 1
  base_commit: b117ed7
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-CONTEUDO-001.md
    - public/guia-conteudo-com-claude.html
    - src/app/guia-conteudo-com-claude/**
    - src/app/conteudo/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-conteudo-com-claude.html, src/app/guia-conteudo-com-claude/route.ts, src/app/conteudo/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-conteudo-com-claude, GET /conteudo, GET /guias/conteudo-com-claude]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GCC-01, GCC-02, GCC-03]
  stop_when: [GCC-01, GCC-02, GCC-03]
  passed_acceptance_ids: []
---
# Guia CONTEÚDO do Reel 11 (conteúdo com IA) na Central

Objetivo: publicar "Cinco pedidos para o Claude planejar o seu Instagram" em `/guia-conteudo-com-claude`, com atalho `/conteudo`, protegido pelo cadastro e listado na Central em Guias (categoria Conteúdo e criação). Entrega os 5 pedidos do Reel 11 (legenda, carrossel, calendário, análise de métricas e novos roteiros), a ficha do perfil, como mandar as métricas, a rotina da semana, ajustes e checklist.

- GCC-01: `GUIAS` tem 57 itens e os dois caminhos resolvem para o guia; testes de `tests/guias` com as contagens novas (70 itens, 62 gratuitos).
- GCC-02: build de produção sem erro e smoke da VPS cobrindo `/guia-conteudo-com-claude` e `/conteudo`.
- GCC-03: em produção, sem sessão o guia redireciona ao cadastro.
