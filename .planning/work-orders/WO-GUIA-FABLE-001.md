---
work_order: WO-GUIA-FABLE-001
created: 2026-11-10
updated: 2026-11-10
status: active
classe: conteudo
risco: baixo
central_branch: main
owner: Claude
authorized_by: Pedro
authorized_at: 2026-11-10
definition_source: pedido do Pedro em 10/11/2026 ("Gere o guia de entregavel desse carrossel com a skill de guia da infuser"), carrossel do lançamento do Fable 5.2, palavra FABLE
scope_lock:
  version: 1
  base_commit: d8e7959
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-FABLE-001.md
    - public/guia-fable-52.html
    - src/app/guia-fable-52/**
    - src/app/fable/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-fable-52.html, src/app/guia-fable-52/route.ts, src/app/fable/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-fable-52, GET /fable, GET /guias/fable-52]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GFB-01, GFB-02, GFB-03]
  stop_when: [GFB-01, GFB-02, GFB-03]
  passed_acceptance_ids: []
---
# Guia FABLE do carrossel do Fable 5.2 na Central

Objetivo: publicar "O que já vale trocar pro Fable 5.2" em `/guia-fable-52`, com atalho `/fable`, protegido pelo cadastro e listado na Central em Guias (categoria Claude e agentes). Cumpre a promessa do carrossel ("quais tarefas da sua operação já valem trocar pro 5.2, e quais ainda não"): números oficiais do 5.1 contra o 5.2, o semáforo de troca, quatro pedidos (inventário, semáforo, teste lado a lado e plano de troca), erros comuns, cuidados com dados, checklist e perguntas.

- GFB-01: `GUIAS` tem 58 itens e os dois caminhos resolvem para o guia; testes de `tests/guias` com as contagens novas (71 itens, 63 gratuitos).
- GFB-02: build de produção sem erro e smoke da VPS cobrindo `/guia-fable-52` e `/fable`.
- GFB-03: em produção, sem sessão o guia redireciona ao cadastro.
