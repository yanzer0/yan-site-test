---
work_order: WO-SEGUNDO-CEREBRO-PREMIUM-COPY-006
status: active
central_branch: feat/segundo-cerebro-premium-copy
owner: Claude
authorized_by: Yan
authorized_at: 2026-09-14
definition_source: _infoprodutos/segundo-cerebro-autonomo/segundo-cerebro-autonomo.md (brain)
scope_lock:
  version: 1
  base_commit: b4afd71de3e417f624e887d88669f36cbfe54b0c
  allowed_write_globs:
    - .planning/work-orders/WO-SEGUNDO-CEREBRO-PREMIUM-COPY-006.md
    - src/components/segundo-cerebro.tsx
  architecture_delta:
    production_files:
      - src/components/segundo-cerebro.tsx
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [SCP-S01, SCP-S02, SCP-S03]
  stop_when: [SCP-S01, SCP-S02, SCP-S03]
  passed_acceptance_ids: [SCP-S01, SCP-S02, SCP-S03]
---

# Premium a R$147 e copy de valor no card e no pop-up

## Resultado autorizado

Na página `/kit-segundo-cerebro`: preço do Premium passa a R$147 no card; o pop-up de upgrade
oferece o Premium a R$97 dizendo que são só R$30 a mais que o Básico (R$67); card e pop-up
listam tudo que o Premium faz a mais que o Básico, sem número inventado (fonte: o pacote real).

## Critérios

- SCP-S01: card Premium mostra R$147; pop-up mostra R$147 riscado, R$97 e "R$30 a mais que o Básico".
- SCP-S02: build e testes passam; desktop 1440 e mobile 375 sem overflow nem erro de console.
- SCP-S03: cada item de valor corresponde a um comportamento real do pacote (hooks, comandos, instalador).

## Rollback

Restaurar o release anterior do site (`useinfuser-site:b4afd71de3e4`).

## Evidência (2026-09-14, dev server local + Chromium headless)

- SCP-S01: DOM do card lê `R$147`, badge "Se mantém sozinho"; pop-up lê `R$147` riscado, `R$97`,
  "R$50 de desconto · só R$30 a mais que o Básico"; CTA aponta pro checkout do pop-up.
- SCP-S02: `tsc --noEmit` só acusa erros pré-existentes em `tests/instalar` (mesmos na base);
  eslint 0 erros; `npm test` 410 passed / 2 failed, idênticos à base b4afd71 (dependem de ambiente).
  1440x1000: dois cards sem overflow, pop-up 698px cabe sem scroll. 375x812: sem overflow horizontal,
  CTA do pop-up visível sem rolar (bottom 749 < 780). Console: 0 erros, só warnings pré-existentes.
- SCP-S03: cada item bate com o pacote em `_infoprodutos/segundo-cerebro-autonomo/pacote/cerebro/`
  (session-start.js, inject-pendencias.js, inject-learnings.js, guard-pretool.js, check.js,
  codex-shim.mjs, commands/comecar.md com 7 perguntas, instalar.mjs que prova a instalação).
