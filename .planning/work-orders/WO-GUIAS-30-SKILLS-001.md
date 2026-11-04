---
work_order: WO-GUIAS-30-SKILLS-001
created: 2026-11-03
updated: 2026-11-03
status: active
classe: conteudo
risco: baixo
central_branch: feat/guias-30-skills-20261103
owner: Claude
authorized_by: Yan
authorized_at: 2026-11-03
definition_source: pedido do Yan em 03/11/2026 ("crie os guias em html seguindo o padrão dos últimos guias, inclua os links dos repositórios ou o arquivo zipado das skills, suba cada um com seu slug e inclua na Central")
scope_lock:
  version: 1
  base_commit: c331247
  allowed_write_globs:
    - .planning/work-orders/WO-GUIAS-30-SKILLS-001.md
    - public/guia-*.html
    - src/app/guia-*/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - private/central/reel-dinamico.zip
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-<30 slugs>.html, src/app/guia-<30 slugs>/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, private/central/reel-dinamico.zip, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-<30 slugs>, GET /guias/<30 slugs>, GET /central/recursos/reel-dinamico, GET /central/baixar/reel-dinamico]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [G30-01, G30-02, G30-03]
  stop_when: [G30-01, G30-02, G30-03]
  passed_acceptance_ids: []
---
# Guias da série "30 dias, 30 skills do Claude" na Central

Objetivo: publicar 30 guias gratuitos (um por dia da série) em `/guia-<slug>`, no padrão visual dos últimos guias (identidade v2 clara), protegidos pelo cadastro e listados na Central em Guias, categoria "30 skills do Claude". Os dias 1 a 28 apontam para o repositório de cada skill, com comandos conferidos no README em 03/11; o dia 29 entrega a skill própria `reel-dinamico` como pacote da Central; o dia 30 reúne as cinco do fecho. HTML gerado por `montar-guias.mjs` no brain (`_knowledge/conteudo/serie-30-skills-claude/guias/`).

- G30-01: `GUIAS` com 50 itens e `RECURSOS_CENTRAL` com 4; cada caminho resolve para o guia; testes de `tests/guias` verdes com as contagens novas.
- G30-02: build de produção sem erro e smoke da VPS cobrindo os 30 caminhos e o pacote.
- G30-03: em produção, sem sessão os guias redirecionam ao cadastro e a Central mostra os itens novos.