---
work_order: WO-GUIA-MODELO-001
created: 2026-11-24
updated: 2026-11-24
status: active
classe: conteudo
risco: baixo
central_branch: main
owner: Claude
authorized_by: Pedro
authorized_at: 2026-11-24
definition_source: pedido do Pedro em 24/11/2026 (guia do reels 28), palavra MODELO; roteiro do Reel 28 e prompt do guia 28 no doc ROTEIROS E PROMPTS · SEMANA 3; fatos conferidos em code.claude.com (sub-agents, model-config, costs), claude.com/blog e anthropic.com/engineering
scope_lock:
  version: 1
  base_commit: 4ee2b30
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-MODELO-001.md
    - public/guia-modelo-por-agente.html
    - src/app/guia-modelo-por-agente/**
    - src/app/modelo/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-modelo-por-agente.html, src/app/guia-modelo-por-agente/route.ts, src/app/modelo/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-modelo-por-agente, GET /modelo]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GMO-01, GMO-02, GMO-03]
  stop_when: [GMO-01, GMO-02, GMO-03]
  passed_acceptance_ids: []
---
# Guia MODELO do Reel 28 (quem pensa e quem executa no Claude Code) na Central

Objetivo: publicar "Quem pensa e quem executa no seu Claude Code" em `/guia-modelo-por-agente`, com atalho `/modelo`, protegido pelo cadastro e listado na Central em Guias (categoria Claude e agentes). Conteúdo: a ideia e o texto da Anthropic com o porém dos tokens, os dois arquivos de agente, o pedido de plano e o de execução, os cinco níveis de esforço, três tarefas repetidas, a medição antes e depois, erros comuns, cuidados, checklist, perguntas rápidas e CTA para o diagnóstico. Sem preço e sem promessa de porcentagem de economia.

- GMO-01: `GUIAS` tem 66 itens e os dois caminhos resolvem para o guia; testes de `tests/guias` com as contagens novas (79 itens, 71 gratuitos).
- GMO-02: build de produção sem erro e smoke da VPS cobrindo `/guia-modelo-por-agente` e `/modelo`.
- GMO-03: em produção, sem sessão o guia redireciona ao cadastro.
