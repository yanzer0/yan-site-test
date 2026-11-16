---
work_order: WO-GUIA-REFORMA-002
created: 2026-11-16
updated: 2026-11-16
status: active
classe: conteudo
risco: baixo
central_branch: main
owner: Claude
authorized_by: Pedro
authorized_at: 2026-11-16
definition_source: pedido do Pedro em 16/11/2026 ("gere o guia gratuito do reels 18"), palavra REFORMA; roteiro do Reel 18 (split payment) e prompt do guia 18 no doc ROTEIROS E PROMPTS · SEMANA 2
scope_lock:
  version: 1
  base_commit: b7056d3
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-REFORMA-002.md
    - public/guia-reforma-com-ia.html
    - src/app/guia-reforma-com-ia/**
    - src/app/reforma/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-reforma-com-ia.html, src/app/guia-reforma-com-ia/route.ts, src/app/reforma/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-reforma-com-ia, GET /reforma]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GRF-01, GRF-02, GRF-03]
  stop_when: [GRF-01, GRF-02, GRF-03]
  passed_acceptance_ids: []
---
# Guia REFORMA do Reel 18 (4 prompts da reforma tributária) na Central

Objetivo: publicar "Reforma tributária: 4 prompts para preparar sua empresa" em `/guia-reforma-com-ia`, com atalho `/reforma`, protegido pelo cadastro e listado na Central em Guias (categoria Operação e processos, ao lado do guia antigo `/reforma-tributaria`, que fica intocado). Entrega o resumo do que muda com fontes oficiais e data de consulta, o aviso de que não é orientação tributária, os quatro prompts prometidos no Reel 18 (revisar catálogo, simular margem, conferir notas, simular caixa com split payment), erros comuns, cuidados, checklist de 10 perguntas para o contador, perguntas rápidas e CTA para o diagnóstico.

- GRF-01: `GUIAS` tem 62 itens e os dois caminhos resolvem para o guia; testes de `tests/guias` com as contagens novas (75 itens, 67 gratuitos).
- GRF-02: build de produção sem erro e smoke da VPS cobrindo `/guia-reforma-com-ia` e `/reforma`.
- GRF-03: em produção, sem sessão o guia redireciona ao cadastro.