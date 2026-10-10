---
work_order: WO-LEGIAO-PREDIO-VENDAS-001
status: complete
central_branch: claude/legiao-vendas-predio
owner: Claude
authorized_by: Yan
authorized_at: 2026-10-10
definition_source: pedido do Yan em 10/10/2026 ("vamos atualizar a página de vendas, com prints do prédio"), depois do prédio da Legião ir ao ar em mcp.useinfuser.com/legiao (infuser-mcp 1.297.0)
scope_lock:
  version: 1
  base_commit: 55f43d3
  allowed_write_globs:
    - .planning/work-orders/WO-LEGIAO-PREDIO-VENDAS-001.md
    - public/legiao.html
    - public/legiao/predio-*.webp
  architecture_delta:
    production_files:
      - public/legiao.html
      - public/legiao/predio-*.webp
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [LPV-01, LPV-02, LPV-03]
  stop_when: [LPV-01, LPV-02, LPV-03]
  passed_acceptance_ids: [LPV-01, LPV-02, LPV-03]
---

# Página de vendas da Legião mostra o prédio

## Resultado autorizado

A página `useinfuser.com/legiao` ganha a seção `#predio`, logo depois de "Como funciona", com três prints
reais do prédio (mapa dos sete andares, um andar aberto e o painel "Como chamar" de um agente). O item 05
de "O que você recebe" deixa de ser "Dashboard da Legião" e passa a ser o prédio.

## Critérios de aceite

- `LPV-01`: a seção e o item 05 só afirmam o que o prédio entrega de fato (sete andares, 80 agentes e 11
  Salas de Guerra, frase pronta para chamar cada agente), sem travessão e sem número novo.
- `LPV-02`: em 1440 px e 375 px a página não rola na horizontal, os prints carregam e o console fica sem
  erro.
- `LPV-03`: publicado na VPS pelo `deploy/vps/deploy.sh`, `/legiao` responde 200 no apex e no `www` com a
  seção nova, e os três prints respondem 200.

## Evidência

- `LPV-01`: a seção só cita o que o prédio entrega (sete andares, 80 agentes e 11 Salas de Guerra,
  frase pronta pra chamar cada agente), conferido contra `mcp.useinfuser.com/legiao` em produção;
  `git diff` sem travessão nas linhas novas. Prints reais do Yan (10/10), redimensionados para 1600 px.
- `LPV-02`: Chromium headless contra `public/` servida localmente, 1440 px e 375 px: rolagem lateral 0,
  nenhum erro de página, os três prints com status 200 e carregados.
- `LPV-03`: commit `6180f4c` em `main`; na VPS, `deploy/vps/deploy.sh` terminou com
  `useinfuser-site release 6180f4c95f9e is healthy` e o smoke verde. `/legiao` 200 no apex e no `www`
  com `id="predio"` e o item 05 "Prédio da Legião"; `predio-mapa.webp`, `predio-andar.webp` e
  `predio-agente.webp` 200 nos dois hosts.
