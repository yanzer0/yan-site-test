---
work_order: WO-SEGUNDO-CEREBRO-ENTREGA-004
status: active
central_branch: codex/segundo-cerebro-entrega
owner: Codex
authorized_by: Yan
authorized_at: 2026-09-11
scope_lock:
  version: 1
  base_commit: 652b33b94166d62b5325fc4ca053cde83e8af58b
  allowed_write_globs:
    - .planning/work-orders/WO-SEGUNDO-CEREBRO-ENTREGA-004.md
    - specs/007-segundo-cerebro-entrega/**
    - public/instalar/**
    - src/app/instalar/route.ts
    - tests/instalar/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files:
      - public/instalar/index.html
      - public/instalar/guide.css
      - public/instalar/guide.js
      - public/instalar/assets/**
      - src/app/instalar/route.ts
      - deploy/vps/smoke.mjs
    runtime_dependencies: []
    public_contracts:
      - GET https://useinfuser.com/instalar
      - GET https://useinfuser.com/instalar/assets/downloads/segundo-cerebro-autonomo.zip
      - Hubla product Segundo Cérebro Autônomo with R$147 and R$97 offers
    persistence_surfaces:
      - Hubla product, offers and member-area module
    background_jobs: []
  acceptance_ids: [SC-01, SC-02, SC-03, SC-04, SC-05, SC-06, SC-07]
  stop_when: [SC-01, SC-02, SC-03, SC-04, SC-05, SC-06, SC-07]
  passed_acceptance_ids: [SC-01, SC-02, SC-03]
---

# Entrega comercial do Segundo Cérebro Autônomo

## Critérios

- SC-01: rota `/instalar` compila e responde 200.
- SC-02: todos os ativos e o ZIP respondem 200.
- SC-03: desktop e mobile passam sem overflow ou erro de console.
- SC-04: produto Hubla existe com oferta padrão de R$147.
- SC-05: oferta promocional direta cobra R$97 sem cupom.
- SC-06: módulo “Comece aqui” aponta para a rota correta.
- SC-07: produção, checkout e compra de teste passam com rollback conhecido.

## Evidências

- SC-01: `npm run build` em 2026-09-11, rota `/instalar` prerenderizada; teste de rota 200.
- SC-02: CSS, JS, logos e ZIP responderam 200 localmente; ZIP SHA256 `6A3DF35F6D913F84EB33DAAE331F8F9A83BAA72DAAD472206B1816A570724592`.
- SC-03: fluxo Windows + Claude validado no navegador; viewport 390 × 844 sem overflow; retorno de etapa removeu conclusões posteriores; nenhum erro de console da aplicação.
- Gate conhecido do repositório: `npm run lint` acusa dois erros preexistentes em `scripts/club/build-club-html.js`, fora do escopo desta work order. O build completo passou.
- Suíte completa: 401 testes passaram; 5 testes e 1 suíte preexistentes falharam fora do escopo, em autenticação do painel, contrato com o brain e parser de ambiente. Os 4 testes de `/instalar` passaram.
- Dependências: nenhuma dependência foi adicionada. `npm audit --omit=dev` aponta vulnerabilidades herdadas do PostCSS interno ao Next 15.5.25; a correção automática exige migração incompatível para Next 16. A rota nova não processa CSS ou entrada enviada pelo usuário.
