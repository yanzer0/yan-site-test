---
work_order: WO-GUIA-PLANILHA-001
created: 2026-11-23
updated: 2026-11-23
status: active
classe: conteudo
risco: baixo
central_branch: main
owner: Claude
authorized_by: Pedro
authorized_at: 2026-11-23
definition_source: pedido do Pedro em 23/11/2026 (guia do reels 27), palavra PLANILHA; roteiro do Reel 27 (Claude Sheets) e prompt do guia 27 no doc ROTEIROS E PROMPTS · SEMANA 3; fatos conferidos em claude.com/resources/articles/sheets-whiteboards-data (10/11/2026) e support.claude.com (artigo 18324300)
scope_lock:
  version: 1
  base_commit: 27ff827
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-PLANILHA-001.md
    - public/guia-planilhas-com-claude.html
    - src/app/guia-planilhas-com-claude/**
    - src/app/planilha/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-planilhas-com-claude.html, src/app/guia-planilhas-com-claude/route.ts, src/app/planilha/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-planilhas-com-claude, GET /planilha]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GPL-01, GPL-02, GPL-03]
  stop_when: [GPL-01, GPL-02, GPL-03]
  passed_acceptance_ids: []
---
# Guia PLANILHA do Reel 27 (5 planilhas montadas pelo Claude) na Central

Objetivo: publicar "5 planilhas que toda empresa usa, montadas pelo Claude" em `/guia-planilhas-com-claude`, com atalho `/planilha`, protegido pelo cadastro e listado na Central em Guias (categoria Claude e agentes). Conteúdo: o que é o Claude Sheets conforme o anúncio e a ajuda oficial, cinco pedidos prontos (fluxo de caixa, contas a receber, margem por produto, comissão e estoque), cada um com duas células para conferir e um teste, mais um bônus de auditoria, o jeito sem plano pago, erros comuns, cuidados com dado sensível, checklist, perguntas rápidas e CTA para o diagnóstico.

- GPL-01: `GUIAS` tem 64 itens e os dois caminhos resolvem para o guia; testes de `tests/guias` com as contagens novas (77 itens, 69 gratuitos).
- GPL-02: build de produção sem erro e smoke da VPS cobrindo `/guia-planilhas-com-claude` e `/planilha`.
- GPL-03: em produção, sem sessão o guia redireciona ao cadastro.
