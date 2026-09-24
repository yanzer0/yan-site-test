---
work_order: WO-SEGUNDO-CEREBRO-POPUP-PRECO-007
status: complete
central_branch: fix/segundo-cerebro-popup-preco
owner: Claude
authorized_by: Yan
authorized_at: 2026-09-24
definition_source: _infoprodutos/segundo-cerebro-autonomo/segundo-cerebro-autonomo.md (brain)
scope_lock:
  version: 1
  base_commit: 4bb415f4c411cb0775c2fa6777cbd08e9fb68409
  allowed_write_globs:
    - .planning/work-orders/WO-SEGUNDO-CEREBRO-POPUP-PRECO-007.md
    - src/components/segundo-cerebro.tsx
  architecture_delta:
    production_files:
      - src/components/segundo-cerebro.tsx
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [SPP-S01, SPP-S02]
  stop_when: [SPP-S01, SPP-S02]
  passed_acceptance_ids: [SPP-S01, SPP-S02]
---

# Pop-up do Premium com a conta certa do preço novo

## Resultado autorizado

Yan, 24/09/2026: "sim, corrige o pop-up e sobe". O commit `4bb415f` baixou o Premium para R$97
no card e R$84 no pop-up, mas o texto do pop-up ficou com a conta antiga: título "Por mais R$30",
R$147 riscado (preço que nenhum checkout cobra mais) e "R$50 de desconto · só R$30 a mais que o
Básico". Checkouts da Hubla conferidos em 24/09: Básico R$67, Premium R$97, pop-up R$84.

## Critérios

- SPP-S01: pop-up mostra R$97 riscado, R$84, "R$13 de desconto · só R$17 a mais que o Básico" e
  título "Por mais R$17, ele se mantém sozinho."; nenhum R$147 nem R$30 sobra no pop-up.
- SPP-S02: build passa e o site em produção mostra o pop-up corrigido depois do deploy.

## Evidência

- SPP-S01: `8a82dd8`, único R$147/R$30 restante saiu do `UpsellModal`.
- SPP-S02: `deploy/vps/deploy.sh` na VPS com EXIT=0, "useinfuser-site release 8a82dd834d43 is
  healthy". Pop-up lido ao vivo em `useinfuser.com/kit-segundo-cerebro` (24/09): "Por mais R$17,
  ele se mantém sozinho.", R$97 riscado, R$84, "R$13 de desconto · só R$17 a mais que o Básico".
  Mobile 375 sem overflow.
