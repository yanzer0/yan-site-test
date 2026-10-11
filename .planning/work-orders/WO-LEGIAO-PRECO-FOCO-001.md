---
work_order: WO-LEGIAO-PRECO-FOCO-001
status: complete
central_branch: claude/legiao-preco-foco
owner: Claude
authorized_by: Yan
authorized_at: 2026-10-10
definition_source: pedidos do Yan, do Iago e do Pedro em 10/10/2026 (preço é R$97; nenhum botão acompanhando o usuário; todo CTA leva à compra rolando a página; tirar a ancoragem e pôr a garantia embaixo da oferta; tirar o CTA de diagnóstico; tirar a seção de lançamento, que afunila a leitura; dois CTAs baixam a conversão; no celular, tirar o prédio da seção do mapa e deixar só o grafo, maior, centralizado e com o centro girando como no GIF que o Yan mandou)
scope_lock:
  version: 1
  base_commit: 0784d0c
  allowed_write_globs:
    - .planning/work-orders/WO-LEGIAO-PRECO-FOCO-001.md
    - public/legiao.html
    - public/legiao/mapa-vivo.svg
  architecture_delta:
    production_files:
      - public/legiao.html
      - public/legiao/mapa-vivo.svg
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [LPF-01, LPF-02, LPF-03, LPF-04]
  stop_when: [LPF-01, LPF-02, LPF-03, LPF-04]
  passed_acceptance_ids: [LPF-01, LPF-02, LPF-03, LPF-04]
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
- No celular, a seção do mapa mostra só o grafo, na largura da tela: é o SVG real do SkillTree do app
  (`mapa-vivo.svg`, na pose do GIF), com o núcleo girando; baixa perto da tela e pausa fora dela.
- No celular, os prints reservam a altura antes de carregar (sem a página crescer no meio da rolagem).

## Critérios de aceite

- `LPF-01`: nenhum "R$47" no texto; o card mostra R$97 e "ou 12x de R$9,86"; a garantia fica abaixo do
  card; sem `#salas`, sem `#implementacao`, sem link de diagnóstico e com um botão só no hero.
- `LPF-02`: em 375 e 1440 px o botão do hero rola (posição intermediária medida) e termina com a oferta no
  topo; o botão do fechamento também; a barra não é fixa; rolagem lateral 0 e nenhum erro.
- `LPF-04`: em 375 px a seção `#predio-vivo` não tem o prédio, o grafo ocupa a largura toda com o núcleo
  no centro da tela, o ângulo do núcleo muda entre duas leituras, a animação pausa fora da tela e o
  desktop não baixa o SVG.
- `LPF-03`: publicado pela VPS com a linha `is healthy` do SHA novo e o QA contra produção repete LPF-01 e
  LPF-02.

## Evidência

- `LPF-01`: Chromium headless em 375 e 1440 px, local e em produção: nenhum "R$47" no texto; o card mostra
  `R$97` e "ou 12x de R$9,86. Pagamento único, acesso vitalício."; a garantia começa 20 px abaixo do card;
  sem `#salas`, sem `#implementacao`, 0 link de diagnóstico e 1 botão no hero.
- `LPF-02`: o botão do hero passou por posição intermediária (scrollY 728 no celular e 186 no desktop aos
  250 ms) e terminou com `#oferta` no topo (0 px); o botão do fechamento também (0 px); `.nav` com
  `position:relative`; rolagem lateral 0, 0 travessão e nenhum erro.
- `LPF-04`: em 375 px sem `.mvis-tower`; o grafo mede 375x336 px com o núcleo em x=188 (meio da tela
  187,5); o ângulo do núcleo foi de 6,5° a 31,9° em 3 s; com a seção fora da tela o SVG fica
  `is-paused`; no desktop `.mvis` é `display:none` e `mapa-vivo.svg` não é baixado. O SVG sai com gzip
  (13.136 bytes).
- `LPF-03`: commits `243419f` e `f4447cc`; `deploy.sh` com `useinfuser-site release 243419fc4e4e is
  healthy` e depois `useinfuser-site release f4447cc84e2c is healthy`. `/legiao` respondeu 200, `www`
  200 e `mapa-vivo.svg` 200; o QA contra produção repetiu LPF-01, LPF-02 e LPF-04.
