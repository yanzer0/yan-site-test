---
work_order: WO-GUIAS-ESTUDOS-FOTOS-001
created: 2026-11-03
updated: 2026-11-03
status: active
classe: conteudo
risco: baixo
central_branch: claude/guias-estudos-fotos-20261103
owner: Claude
authorized_by: Yan
authorized_at: 2026-11-03
definition_source: pedido do Yan em 03/11/2026 ("sobe esses dois guias em useinfuser.com/guia-estudos e /guia-fotos, depois inclua-os no useinfuser.com/central, em Guias")
scope_lock:
  version: 1
  base_commit: a773022
  allowed_write_globs:
    - .planning/work-orders/WO-GUIAS-ESTUDOS-FOTOS-001.md
    - public/guia-estudos.html
    - public/guia-fotos.html
    - src/app/guia-estudos/**
    - src/app/guia-fotos/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-estudos.html, public/guia-fotos.html, src/app/guia-estudos/route.ts, src/app/guia-fotos/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-estudos, GET /guia-fotos, GET /guias/estudar-livros, GET /guias/fotos-profissionais]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GEF-01, GEF-02, GEF-03]
  stop_when: [GEF-01, GEF-02, GEF-03]
  passed_acceptance_ids: []
---
# Guias de estudo de livros e de fotos profissionais na Central

Objetivo: publicar os guias "Estude qualquer livro com o ChatGPT" (`/guia-estudos`) e "12 prompts de foto profissional no ChatGPT" (`/guia-fotos`), HTMLs prontos vindos de `Downloads/guia-*-previa.html`, protegidos pelo cadastro como os demais e listados na Central em Guias. Ajustes no HTML: loader `/guias/marketing.js` no bloco do GTM (vinha vazio) e `og:url` apontando para o caminho novo.

- GEF-01: `GUIAS` tem 19 itens e os dois caminhos resolvem para os guias; testes de `tests/guias` verdes com as contagens novas.
- GEF-02: build de produção sem erro e smoke da VPS cobrindo `/guia-estudos` e `/guia-fotos`.
- GEF-03: em produção, sem sessão os dois guias redirecionam ao cadastro e a Central mostra 31 itens.
