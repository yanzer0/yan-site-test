---
work_order: WO-LEGIAO-HERO-CHIPS-001
status: complete
central_branch: claude/legiao-headline-ajuste
owner: Claude
authorized_by: Yan
authorized_at: 2026-10-11
definition_source: pedidos do Yan em 11/10/2026 com prints do iPhone (diminuir os textos do hero sem palavra sozinha na linha e com o botão na primeira tela; organizar as abas do chat e os chips das 13 áreas, "sem padrão nenhum")
scope_lock:
  version: 1
  base_commit: 3620abe
  allowed_write_globs:
    - .planning/work-orders/WO-LEGIAO-HERO-CHIPS-001.md
    - public/legiao.html
  architecture_delta:
    production_files:
      - public/legiao.html
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [LHC-01, LHC-02, LHC-03]
  stop_when: [LHC-01, LHC-02, LHC-03]
  passed_acceptance_ids: [LHC-01, LHC-02, LHC-03]
---

# Hero em três linhas e chips em grade

## Resultado autorizado

- Título do hero em três linhas ("Um prédio inteiro / trabalhando pra você. / Sem um único
  funcionário."), com o tamanho acompanhando a largura da coluna; a frase lima não quebra. A linha
  "80 especialistas dentro do seu Claude/Codex" fica numa linha só no celular.
- No celular o botão do hero aparece sem rolar, acima da barra flutuante do Safari.
- No celular as abas do chat e os chips das 13 áreas viram grade de 2 colunas iguais, com a mesma altura
  e o item ímpar do fim na linha toda; rótulo que quebra é balanceado.

## Critérios de aceite

- `LHC-01`: em 360, 375, 390, 430, 820, 1024, 1280, 1440 e 1920 px nenhuma linha do título nem da linha
  Claude/Codex tem palavra sozinha; o botão do hero termina até 720 px em 390x844 e acima da dobra nos
  demais; rolagem lateral 0.
- `LHC-02`: em 360 e 390 px abas e áreas em 2 colunas com altura única; em 1440 px seguem como pílulas
  em linha; clicar na 4ª aba a seleciona.
- `LHC-03`: publicado pela VPS com `is healthy` do SHA novo; o QA contra produção repete LHC-01 e
  LHC-02 e o QA anterior (R$97, CTAs rolando até a oferta, grafo girando) continua passando.

## Evidência

- `LHC-01`: Chromium headless, local e em produção, nos 9 tamanhos: título sempre em "Um prédio inteiro /
  trabalhando pra você. / Sem um único funcionário." (em 820 px, duas linhas: a primeira frase inteira e a
  lima), de 24,4 px em 360 a 52 px no desktop; a linha Claude/Codex numa linha só; nenhuma linha com uma
  palavra só. Botão do hero termina em 691/740 (360), 695/812 (375), 720/844 (390), 732/932 (430) e
  632/900 (1440). Rolagem lateral 0.
- `LHC-02`: em 360 e 390 px abas e áreas em 2 colunas, todas com 52 px de altura; em 390 px nenhuma área
  quebra e as abas quebram balanceadas ("Auditor de / Conta Meta"); em 1440 px as áreas seguem em 11
  posições de linha (36 px) e as abas em 5 (37 px); a 4ª aba fica `aria-selected=true` ao clicar.
- `LHC-03`: commit `b5004da`; `deploy.sh` com `useinfuser-site release b5004dab738d is healthy`;
  `/legiao` e `www` 200; o QA contra produção repetiu LHC-01, LHC-02, R$97, CTAs chegando à `#oferta`
  (0 px) e o grafo girando (6,8° a 32° em 3 s), sem erro.
