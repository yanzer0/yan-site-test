---
work_order: WO-LEGIAO-MOBILE-FOCO-001
status: active
central_branch: claude/legiao-mobile-foco
owner: Claude
authorized_by: Yan
authorized_at: 2026-10-10
definition_source: pedido do Yan em 10/10/2026 (CTA de empresas colado na seção anterior; telas de verdade sem a caixa de fundo; no celular sem a barra do topo e a seção interativa trocada pelo mapa do SkillTree ao lado do prédio acendendo, pra o lead de tráfego não se distrair num produto de R$47)
scope_lock:
  version: 1
  base_commit: e63fdc6
  allowed_write_globs:
    - .planning/work-orders/WO-LEGIAO-MOBILE-FOCO-001.md
    - public/legiao.html
    - public/legiao/*.webp
  architecture_delta:
    production_files:
      - public/legiao.html
      - public/legiao/*.webp
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [LM-01, LM-02, LM-03]
  stop_when: [LM-01, LM-02, LM-03]
  passed_acceptance_ids: []
---

# Celular sem distração e prints sem caixa

## Resultado autorizado

- O bloco "Para empresas" ganha espaço depois do fechamento lime.
- "Telas de verdade": a imagem perde a caixa de fundo. No desktop o print flutua centrado com a legenda
  embaixo; no celular os 5 prints viram uma lista no tamanho natural, com título e legenda.
- No celular: sem a barra do topo; a seção do prédio interativo vira uma imagem leve do mapa do SkillTree
  (`public/legiao/mapa-skilltree.webp`, print real do app) ao lado do prédio acendendo andar por andar; os
  andares do hero deixam de levar pra fora da página; sem animação de entrada nas seções. No desktop nada
  muda.

## Critérios de aceite

- `LM-01`: em 375 px a barra do topo, o app e a dica de toque não aparecem; a composição prédio + mapa
  aparece e o realce sobe pelos andares; os 5 prints ficam visíveis com opacidade 1; rolagem lateral 0 e
  nenhum erro.
- `LM-02`: em 1440 px a barra, o app interativo e as abas dos prints continuam como antes; o print ativo
  troca pela aba e não há caixa de fundo atrás dele; o bloco de empresas fica afastado do fechamento.
- `LM-03`: publicado pela VPS com a linha `is healthy` do SHA novo, `/legiao` e `mapa-skilltree.webp`
  respondem 200 e o QA contra produção repete LM-01 e LM-02.

## Evidência

(preenchida no fechamento)
