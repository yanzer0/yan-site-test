---
work_order: WO-GATE-INVESTIMENTO-FAIXAS-001
status: active
central_branch: feat/gate-investimento-faixas
owner: Claude
authorized_by: Yan
authorized_at: 2026-10-05
definition_source: _decisions/2026-10-05-gate-de-investimento-por-faixa.md (brain)
scope_lock:
  version: 1
  base_commit: 9fb30e9a88b21626e91986537153a201a0a483d5
  allowed_write_globs:
    - .planning/work-orders/WO-GATE-INVESTIMENTO-FAIXAS-001.md
    - src/lib/diagnostico/perguntas.ts
    - src/lib/diagnostico/score-config.json
    - src/lib/diagnostico/leads-apresentacao.ts
    - tests/diagnostico/copy.test.ts
    - tests/diagnostico/score.test.ts
    - specs/001-funil-diagnostico-captura/spec.md
    - specs/001-funil-diagnostico-captura/contracts/perguntas.md
    - .specify/memory/constitution.md
  architecture_delta:
    production_files:
      - src/lib/diagnostico/perguntas.ts
      - src/lib/diagnostico/score-config.json
    runtime_dependencies: []
    public_contracts: [respostas.investimento option ids]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GIF-S01, GIF-S02, GIF-S03]
  stop_when: [GIF-S01, GIF-S02, GIF-S03]
  passed_acceptance_ids: []
---

# Gate de investimento por faixa

## Resultado autorizado

Yan, 05/10/2026: trocar a pergunta 15 (sim/não sobre o piso de R$ 3 mil) por faixas de
investimento qualificadoras, sem ancorar no custo da dor (o formulário não tem esse número), com
enunciado que não presuma um processo só, e cortes calibrados pelo `pricing.md` v3 vigente.

## Critérios

- GIF-S01: a pergunta 15 pergunta faixa, sem citar "esse processo"; opções Menos de R$ 3 mil
  (reprova), 3 a 5, 5 a 9, 9 a 12, Mais de 12 mil; `VERSAO_PERGUNTAS` subida.
- GIF-S02: suíte do funil verde com os guards de copy reescritos para a regra nova (só a 15 cita
  valor, só os cortes da tabela, nenhuma estrutura de cobrança).
- GIF-S03: deploy em produção e a pergunta nova lida ao vivo em `useinfuser.com/diagnostico`.

## Evidência
