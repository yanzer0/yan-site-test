---
work_order: WO-LEGIAO-HEADLINE-PREDIO-001
status: complete
central_branch: claude/legiao-headline-predio
owner: Claude
authorized_by: Yan
authorized_at: 2026-10-11
definition_source: pedido do Yan em 11/10/2026 ("só falta colocar a headline que o iago mandou lá"), headline do print que o Iago mandou em 10/10
scope_lock:
  version: 1
  base_commit: 30aa0d0
  allowed_write_globs:
    - .planning/work-orders/WO-LEGIAO-HEADLINE-PREDIO-001.md
    - public/legiao.html
  architecture_delta:
    production_files:
      - public/legiao.html
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [LHP-01, LHP-02]
  stop_when: [LHP-01, LHP-02]
  passed_acceptance_ids: [LHP-01, LHP-02]
---

# Headline do prédio no hero

## Resultado autorizado

O título do hero passa de "Você pede, o andar certo responde." para "Um prédio inteiro trabalhando pra
você. Sem um único funcionário.", com a segunda frase em lima numa linha própria. A linha "80
especialistas dentro do seu Claude/Codex" e o botão seguem. No celular o título fica em 36 px e o prédio
em 390 px (350 px abaixo de 380 px de largura), pra o botão continuar na primeira tela.

## Critérios de aceite

- `LHP-01`: em 375x812 e 390x844 o botão do hero termina acima da dobra; em 1440 px o título tem a frase
  lima em linha própria; rolagem lateral 0, 0 travessão e nenhum erro; o QA anterior (preço R$97, CTAs
  rolando até a oferta, grafo girando no celular) continua passando.
- `LHP-02`: publicado pela VPS com a linha `is healthy` do SHA novo e o QA contra produção repete LHP-01.

## Evidência

- `LHP-01`: Chromium headless, local e em produção: título "Um prédio inteiro trabalhando pra você. /
  Sem um único funcionário." com o `.hl` em `display:block`; o botão do hero termina em 781 px (dobra
  812) em 375x812, em 821 px (dobra 844) em 390x844 e em 724 px em 1440x900; rolagem lateral 0, 0
  travessão e nenhum erro. O QA anterior repetiu: R$97, sem R$47, CTAs do hero e do fechamento chegando à
  `#oferta` (0 px) e o grafo do celular girando (6,1° a 31,5° em 3 s), sem o prédio.
- `LHP-02`: commit `3e717ca`; `deploy.sh` com `useinfuser-site release 3e717ca30a9c is healthy`;
  `/legiao` e `www` responderam 200 e o HTML servido traz o `<h1>` novo.
