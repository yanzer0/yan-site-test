---
work_order: WO-GUIA-PROMPT-001
created: 2026-11-08
updated: 2026-11-08
status: active
classe: conteudo
risco: baixo
central_branch: main
owner: Claude
authorized_by: Pedro
authorized_at: 2026-11-08
definition_source: pedido do Pedro em 08/11/2026 (guia do reels 10, "Transforme uma foto simples em uma propaganda profissional", palavra PROMPT; doc ROTEIROS E PROMPTS · SEMANA 1)
scope_lock:
  version: 1
  base_commit: 63f9f78
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-PROMPT-001.md
    - public/guia-foto-anuncio.html
    - src/app/guia-foto-anuncio/**
    - src/app/prompt/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-foto-anuncio.html, src/app/guia-foto-anuncio/route.ts, src/app/prompt/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-foto-anuncio, GET /prompt, GET /guias/foto-anuncio]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GFA-01, GFA-02, GFA-03]
  stop_when: [GFA-01, GFA-02, GFA-03]
  passed_acceptance_ids: []
---
# Guia PROMPT do Reel 10 (foto de produto vira anúncio) na Central

Objetivo: publicar "Uma foto do celular vira três versões de campanha" em `/guia-foto-anuncio`, com atalho `/prompt`, protegido pelo cadastro e listado na Central em Guias (categoria ChatGPT). Entrega o prompt mestre e as três variações do Reel 10 (estúdio, cinematográfica, base para anúncio), mais pedidos de correção e checklist.

- GFA-01: `GUIAS` tem 56 itens e os dois caminhos resolvem para o guia; testes de `tests/guias` com as contagens novas (69 itens, 61 gratuitos).
- GFA-02: build de produção sem erro e smoke da VPS cobrindo `/guia-foto-anuncio` e `/prompt`.
- GFA-03: em produção, sem sessão o guia redireciona ao cadastro.
