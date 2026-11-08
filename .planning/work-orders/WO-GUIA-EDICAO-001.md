---
work_order: WO-GUIA-EDICAO-001
created: 2026-11-08
updated: 2026-11-08
status: active
classe: conteudo
risco: baixo
central_branch: main
owner: Claude
authorized_by: Pedro
authorized_at: 2026-11-08
definition_source: pedido do Pedro em 08/11/2026 (guia do reels 9, "O Claude editando vídeos com comandos", palavra EDITAR; doc ROTEIROS E PROMPTS · SEMANA 1)
scope_lock:
  version: 1
  base_commit: 38404d3
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-EDICAO-001.md
    - public/guia-edicao-com-ia.html
    - src/app/guia-edicao-com-ia/**
    - src/app/edicao/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-edicao-com-ia.html, src/app/guia-edicao-com-ia/route.ts, src/app/edicao/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-edicao-com-ia, GET /edicao, GET /guias/edicao-com-ia]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GED-01, GED-02, GED-03]
  stop_when: [GED-01, GED-02, GED-03]
  passed_acceptance_ids: []
---
# Guia EDITAR do Reel 9 (edição de vídeo com IA) na Central

Objetivo: publicar "Do vídeo bruto à edição com gráficos e animações" em `/guia-edicao-com-ia`, com atalho `/edicao`, protegido pelo cadastro e listado na Central em Guias. A palavra do Reel 9 é EDITAR, mas `/editar` continua no guia do Reel do advogado; o ManyChat separa a automação por post e manda o link novo.

- GED-01: `GUIAS` tem 55 itens e os dois caminhos resolvem para o guia; testes de `tests/guias` com as contagens novas (68 itens, 60 gratuitos).
- GED-02: build de produção sem erro e smoke da VPS cobrindo `/guia-edicao-com-ia` e `/edicao`.
- GED-03: em produção, sem sessão o guia redireciona ao cadastro.
