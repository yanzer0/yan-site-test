---
work_order: WO-LEGIAO-ANDARES-001
status: active
central_branch: claude/legiao-andares
owner: Claude
authorized_by: Yan
authorized_at: 2026-10-10
definition_source: pedido do Yan em 10/10/2026 ("quando eu selecionar um andar, quero uma seção com subabas que mostram quais agentes existem em cada andar, com um breve resumo que convença" e "na versão mobile quero tudo centralizado; os botões da Hero embaixo do prédio")
scope_lock:
  version: 1
  base_commit: b96f123
  allowed_write_globs:
    - .planning/work-orders/WO-LEGIAO-ANDARES-001.md
    - public/legiao.html
  architecture_delta:
    production_files:
      - public/legiao.html
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [LA-01, LA-02, LA-03]
  stop_when: [LA-01, LA-02, LA-03]
  passed_acceptance_ids: []
---

# Quem trabalha em cada andar, e o celular centralizado

## Resultado autorizado

- Seção nova `#andares` em `useinfuser.com/legiao`: uma aba por andar (Comando, Copy, Aquisição, Vendas,
  Oferta, Estratégia e Operação). Cada aba mostra os agentes daquele andar, agrupados como no prédio,
  com retrato ou iniciais, selo do método, um resumo de venda e a frase real de como chamar.
- Os rótulos de andar do hero abrem a aba do andar e rolam até a seção.
- No celular, o texto fica centralizado e os botões do hero ficam embaixo do prédio.

Os resumos partem do campo `resumo` do catálogo da Legião, sem número ou resultado que o catálogo não
tenha, e sem travessão.

## Critérios de aceite

- `LA-01`: as 7 abas cobrem os 91 agentes do catálogo, sem repetir nem faltar (o build recusa o contrário);
  zero travessão no texto visível.
- `LA-02`: em 1440 e 375 px, clicar no rótulo de um andar no hero abre a aba certa e leva até a seção;
  as abas trocam por clique e por seta; sem JavaScript, os 7 andares aparecem empilhados. No celular,
  os botões do hero ficam abaixo do prédio e os títulos centralizados. Rolagem lateral 0 e nenhum erro.
- `LA-03`: publicado pela VPS, `/legiao` responde 200 no apex e no `www` com a seção nova, e o QA
  headless contra produção repete LA-02.

## Evidência

(preenchida no fechamento)
