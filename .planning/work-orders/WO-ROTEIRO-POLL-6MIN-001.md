---
work_order: WO-ROTEIRO-POLL-6MIN-001
status: active
central_branch: claude/roteiro-poll-6min
owner: Claude
authorized_by: Yan
authorized_at: 2026-09-18
definition_source: conversa 2026-09-18 (Neon formulario-b2b em 101 CU-hora, limite atingido)
scope_lock:
  version: 1
  base_commit: 79adeef1b3a3ca521f7d2f64cf4731a223b15121
  allowed_write_globs:
    - .planning/work-orders/WO-ROTEIRO-POLL-6MIN-001.md
    - scripts/diagnostico/servico-roteiro.mjs
    - tests/diagnostico/fila-worker.test.ts
  architecture_delta:
    production_files:
      - scripts/diagnostico/servico-roteiro.mjs
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs:
      - servico-roteiro (VPS, supervisor por cron): intervalo entre rodadas vazias sobe de 60s para 360s
  acceptance_ids: [RPL-S01]
  stop_when: [RPL-S01]
  passed_acceptance_ids: [RPL-S01]
---

# Poll do roteiro acima do scale-to-zero do Neon

## Resultado autorizado

O worker do roteiro espera 6 minutos entre rodadas vazias, em vez de 60 segundos. O Neon
suspende o compute depois de 5 minutos sem query; com poll de 60s ele nunca dorme e o
projeto `formulario-b2b` gastou 101 CU-hora em 18 dias sem lead nenhum (limite Free de 100,
e-mail de 18/09). Custo: um roteiro pode levar até 6 minutos a mais para começar a ser
gerado. Aceito: o gerador em si leva minutos, e a call mais rápida já registrada foi
marcada com 2 horas de antecedência.

## Critérios

- RPL-S01: `PAUSA_ENTRE_CONSULTAS_MS` é maior que 300 000 ms, o teste
  `tests/diagnostico/fila-worker.test.ts` prova isso pelo valor (não pela string literal),
  e o serviço na VPS sobe registrando `intervalo=360s` no log.

## Rollback

Reverter o commit e reiniciar o serviço. Volta a 60s e volta a queimar compute.
