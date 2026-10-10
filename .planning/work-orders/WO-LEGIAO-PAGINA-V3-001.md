---
work_order: WO-LEGIAO-PAGINA-V3-001
status: active
central_branch: claude/legiao-pagina-v3
owner: Claude
authorized_by: Yan
authorized_at: 2026-10-10
definition_source: pedido do Yan em 10/10/2026 ("revisa a copy inteira, o design e as seções, identidade v2, hero com o prédio animado e textos à esquerda, CTA pro formulário de implementação no final"); direção do /studio aprovada no chat (opção "Aprovado, constrói") e depoimentos inventados trocados por bastidores reais mais coleta (opção "Bastidores reais + coleta")
scope_lock:
  version: 1
  base_commit: 41dca57
  allowed_write_globs:
    - .planning/work-orders/WO-LEGIAO-PAGINA-V3-001.md
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
  acceptance_ids: [LP3-01, LP3-02, LP3-03, LP3-04, LP3-05]
  stop_when: [LP3-01, LP3-02, LP3-03, LP3-04, LP3-05]
  passed_acceptance_ids: []
---

# Página de vendas da Legião, versão 3

## Resultado autorizado

`useinfuser.com/legiao` reescrita na identidade Infuser v2 completa, seguindo a direção aprovada:

- hero dividido, texto à esquerda e o prédio da Legião à direita, que acende andar por andar ao carregar;
- copy nova da página inteira, um texto de botão só para a compra, a comparação "mesmo pedido, dois
  resultados" logo abaixo do hero e a compatibilidade real (Claude e Codex/ChatGPT desktop);
- os 3 depoimentos inventados saem; entra a seção de bastidores com prints reais de uso;
- "Pra quem é" reescrito no formato de desqualificação, com a ponte para a implementação;
- CTA final para o diagnóstico de implementação (`/diagnostico`), enquadrado como diagnóstico.

Preservado: meta/OG, Meta Pixel e UTMify, o link de checkout da Hubla, o chat animado de `#provas`,
as âncoras `#oferta`, `#predio` e `#provas`, fontes e avatares já publicados.

Fora: depoimento com pessoa gerada ou print fabricado (publicidade enganosa); qualquer número de
resultado sem fonte; urgência fabricada; citação de concorrente.

## Critérios de aceite

- `LP3-01`: copy auditada string a string: zero travessão, zero depoimento ou número inventado, zero
  concorrente, um texto único para o botão de compra, preço só na oferta e no rodapé de garantia.
- `LP3-02`: o hero cabe na primeira dobra em 1440 e 375 px, o prédio acende em sequência, o andar
  acende no hover e leva a `#predio` no clique; com `prefers-reduced-motion` a torre aparece parada e
  acesa; sem JavaScript a página continua legível e o checkout funciona.
- `LP3-03`: em 1440, 900 e 375 px não há rolagem lateral nem erro de página; o chat de `#provas` segue
  animando; checkout, pixel e UTMify continuam no HTML como antes.
- `LP3-04`: o CTA final leva a `https://useinfuser.com/diagnostico`, que responde 200.
- `LP3-05`: publicado pela VPS, `/legiao` responde 200 no apex e no `www` com a versão nova, e o QA
  headless contra produção repete LP3-02 e LP3-03.

## Evidência

(preenchida no fechamento)
