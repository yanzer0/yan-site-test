---
work_order: WO-ROTEIRO-POLL-30MIN-002
status: active
central_branch: claude/roteiro-poll-30min
owner: Claude
authorized_by: Yan
authorized_at: 2026-09-18
definition_source: conversa 2026-09-18 (correcao da conta da WO-ROTEIRO-POLL-6MIN-001)
scope_lock:
  version: 1
  base_commit: 4765afb26f51f546e03cd2d98725ae1ac210c581
  allowed_write_globs:
    - .planning/work-orders/WO-ROTEIRO-POLL-30MIN-002.md
    - scripts/diagnostico/servico-roteiro.mjs
    - tests/diagnostico/fila-worker.test.ts
  architecture_delta:
    production_files:
      - scripts/diagnostico/servico-roteiro.mjs
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs:
      - servico-roteiro (VPS, supervisor por cron): intervalo entre rodadas vazias sobe de 6 para 30 minutos
  acceptance_ids: [RPL-S02]
  stop_when: [RPL-S02]
  passed_acceptance_ids: [RPL-S02]
---

# Poll do roteiro a 30 minutos: fração ativa do Neon, não só o limiar

## Resultado autorizado

A ordem 001 subiu o poll para 6 min, "acima dos 5 min de scale-to-zero". A conta estava
errada: cada poll acorda o compute e reabre a janela de 5 min, então com 6 min o banco fica
ativo 5 de cada 6 minutos (83%, ~150 CU-hora/mês, ainda acima do teto Free de 100). O que
importa é a FRAÇÃO ativa `scale_to_zero / intervalo`, não o limiar. Com 30 min: 17%, ~30
CU-hora/mês. Decisão do Yan em 18/09: 30 minutos. Custo aceito: roteiro pode começar até 30
min depois do agendamento (call mais rápida já registrada foi marcada com 2 horas).

## Critérios

- RPL-S02: o teste prova que `scale_to_zero (5 min) / PAUSA_ENTRE_CONSULTAS_MS <= 0,2`
  (banco ativo no máximo 20% do tempo por causa do worker), o valor 360 000 reprova, e o
  serviço na VPS sobe registrando `intervalo=1800s`.

## Rollback

Reverter o commit e reiniciar o serviço.
