---
work_order: WO-GUIA-CLAUDE-001
created: 2026-11-13
updated: 2026-11-13
status: active
classe: conteudo
risco: baixo
central_branch: main
owner: Claude
authorized_by: Pedro
authorized_at: 2026-11-13
definition_source: pedido do Pedro em 13/11/2026 ("use a skill de guia da infuser para dar deploy e gerar o guia do reels 15"), palavra CLAUDE; roteiro e LEIA-ME do Reel 15 (3 processos com Claude)
scope_lock:
  version: 1
  base_commit: e0ca675
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-CLAUDE-001.md
    - public/guia-tres-processos-claude.html
    - src/app/guia-tres-processos-claude/**
    - src/app/claude/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-tres-processos-claude.html, src/app/guia-tres-processos-claude/route.ts, src/app/claude/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-tres-processos-claude, GET /claude]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GCL-01, GCL-02, GCL-03]
  stop_when: [GCL-01, GCL-02, GCL-03]
  passed_acceptance_ids: []
---
# Guia CLAUDE do Reel 15 (3 processos com Claude) na Central

Objetivo: publicar "Três processos no Claude que quase ninguém usa" em `/guia-tres-processos-claude`, com atalho `/claude`, protegido pelo cadastro e listado na Central em Guias (categoria Claude e agentes). Entrega os três prompts prometidos no Reel 15 (especialistas empresário/financeiro/marketing com síntese; plano com etapas, prioridade e esforço sem prazo; painel A fazer/Em andamento/Concluído com responsável, prioridade e prazo, mais o prompt de atualização), o preparo de um projeto no Claude, erros comuns, cuidados, checklist e perguntas.

- GCL-01: `GUIAS` tem 61 itens e os dois caminhos resolvem para o guia; testes de `tests/guias` com as contagens novas (74 itens, 66 gratuitos).
- GCL-02: build de produção sem erro e smoke da VPS cobrindo `/guia-tres-processos-claude` e `/claude`.
- GCL-03: em produção, sem sessão o guia redireciona ao cadastro.