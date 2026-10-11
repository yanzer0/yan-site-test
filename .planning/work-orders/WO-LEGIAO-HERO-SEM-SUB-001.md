---
work_order: WO-LEGIAO-HERO-SEM-SUB-001
status: complete
central_branch: claude/legiao-hero-sem-sub
owner: Claude
authorized_by: Yan
authorized_at: 2026-10-10
definition_source: pedido do Iago repassado pelo Yan em 10/10/2026 ("tira essa subheadline tbm", print do hero no celular)
scope_lock:
  version: 1
  base_commit: 6ca7ace
  allowed_write_globs:
    - .planning/work-orders/WO-LEGIAO-HERO-SEM-SUB-001.md
    - public/legiao.html
  architecture_delta:
    production_files:
      - public/legiao.html
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [LHS-01, LHS-02]
  stop_when: [LHS-01, LHS-02]
  passed_acceptance_ids: [LHS-01, LHS-02]
---

# Hero sem a subheadline

## Resultado autorizado

Sai do hero o parágrafo "Copy, tráfego, vendas e oferta, cada especialista no seu andar. Você conversa
normal e quem entende do assunto assume." e as regras de CSS dele. O hero fica com o título, a linha
"80 especialistas dentro do seu Claude/Codex" e o botão de compra, no celular e no desktop.

## Critérios de aceite

- `LHS-01`: em 375 e 1440 px o hero não tem `.sub` nem o texto da subheadline; o título, a linha
  Claude/Codex e um botão só seguem visíveis; rolagem lateral 0, 0 travessão e nenhum erro; o QA da
  rodada anterior (preço, CTAs rolando, grafo do celular) continua passando.
- `LHS-02`: publicado pela VPS com a linha `is healthy` do SHA novo e o QA contra produção repete LHS-01.

## Evidência

- `LHS-01`: Chromium headless em 375 e 1440 px, local e em produção: o hero sem `.sub` e sem o texto da
  subheadline; título e linha Claude/Codex visíveis; 1 botão (34 px abaixo da linha no desktop, embaixo do
  prédio no celular); rolagem lateral 0, 0 travessão e nenhum erro. O QA anterior repetiu: R$97, sem R$47,
  CTAs do hero e do fechamento rolando até `#oferta` (0 px), grafo do celular girando (6,8° a 32° em 3 s),
  sem o prédio e pausado fora da tela.
- `LHS-02`: commit `8a002e5`; `deploy.sh` com `useinfuser-site release 8a002e56c39f is healthy`;
  `/legiao` e `www` responderam 200 e o QA contra produção repetiu LHS-01.
