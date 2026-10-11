---
work_order: WO-LEGIAO-PRECO-FOCO-001
status: active
central_branch: claude/legiao-preco-foco
owner: Claude
authorized_by: Yan
authorized_at: 2026-10-10
definition_source: pedidos do Yan, do Iago e do Pedro em 10/10/2026 (preço é R$97; nenhum botão acompanhando o usuário; todo CTA leva à compra rolando a página; tirar a ancoragem e pôr a garantia embaixo da oferta; tirar o CTA de diagnóstico; tirar a seção de lançamento, que afunila a leitura; dois CTAs baixam a conversão)
scope_lock:
  version: 1
  base_commit: 0784d0c
  allowed_write_globs:
    - .planning/work-orders/WO-LEGIAO-PRECO-FOCO-001.md
    - public/legiao.html
  architecture_delta:
    production_files:
      - public/legiao.html
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [LPF-01, LPF-02, LPF-03]
  stop_when: [LPF-01, LPF-02, LPF-03]
  passed_acceptance_ids: []
---

# Preço real e página só com o caminho da compra

## Causa verificada

O checkout da Hubla (`pay.hub.la/2fldN9TfkxumT7OlbUcn`), lido em 10/10/2026, cobra R$ 97,00 ou 12x de
R$ 9,86, e a página anunciava "De R$97 por R$47". Página e checkout divergiam.

## Resultado autorizado

- Preço R$97 (ou 12x de R$9,86) na oferta, na garantia, no FAQ e na descrição; sem preço riscado.
- Oferta numa coluna: o card de compra e, embaixo, a garantia de 7 dias; sai o texto de ancoragem.
- Saem o bloco de diagnóstico de implementação, a seção da sala de lançamento e o segundo botão do hero.
- Todo botão "Quero a Legião" rola a página até a oferta (rolagem própria, que funciona em navegador de
  app), e a barra do topo deixa de acompanhar a rolagem no desktop.
- No celular, os prints reservam a altura antes de carregar (sem a página crescer no meio da rolagem).

## Critérios de aceite

- `LPF-01`: nenhum "R$47" no texto; o card mostra R$97 e "ou 12x de R$9,86"; a garantia fica abaixo do
  card; sem `#salas`, sem `#implementacao`, sem link de diagnóstico e com um botão só no hero.
- `LPF-02`: em 375 e 1440 px o botão do hero rola (posição intermediária medida) e termina com a oferta no
  topo; o botão do fechamento também; a barra não é fixa; rolagem lateral 0 e nenhum erro.
- `LPF-03`: publicado pela VPS com a linha `is healthy` do SHA novo e o QA contra produção repete LPF-01 e
  LPF-02.

## Evidência

(preenchida no fechamento)
