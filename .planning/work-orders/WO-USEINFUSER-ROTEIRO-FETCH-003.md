---
work_order: WO-USEINFUSER-ROTEIRO-FETCH-003
status: active
central_branch: codex/fix-roteiro-fetch-retry
owner: Codex
authorized_by: Yan
authorized_at: 2026-09-09
scope_lock:
  version: 1
  base_commit: 3d721d185ca874d0d8b7386f7ac49966d5aa3578
  allowed_write_globs:
    - .planning/work-orders/WO-USEINFUSER-ROTEIRO-FETCH-003.md
    - specs/006-migracao-useinfuser-vps/INDEX.md
    - specs/006-migracao-useinfuser-vps/README.md
    - specs/006-migracao-useinfuser-vps/CONTRATOS-E-EVENTOS.md
    - specs/006-migracao-useinfuser-vps/PLANO-DE-IMPLEMENTACAO.md
    - specs/006-migracao-useinfuser-vps/VERIFICACAO-E-OPERACAO.md
    - scripts/diagnostico/servico-roteiro.mjs
    - scripts/diagnostico/roteiro-http.mjs
    - tests/diagnostico/fila-worker.test.ts
  architecture_delta:
    production_files:
      - scripts/diagnostico/servico-roteiro.mjs
      - scripts/diagnostico/roteiro-http.mjs
    runtime_dependencies: []
    public_contracts:
      - POST /api/diagnostico/roteiro/concluir keeps the same payload and becomes resilient to one transient transport failure
    persistence_surfaces: []
    background_jobs:
      - scripts/diagnostico/servico-roteiro.mjs
  acceptance_ids:
    - RF-01
    - RF-02
    - RF-03
    - RF-04
    - RF-05
    - RF-06
  stop_when:
    - RF-01
    - RF-02
    - RF-03
    - RF-04
    - RF-05
    - RF-06
  passed_acceptance_ids:
    - RF-01
    - RF-02
    - RF-03
    - RF-04
---

# Hotfix: transporte da conclusão do roteiro

## Incidente verificado

O booking `vQCWoy1oYgGCkFQBb8BjmJ` gerou e validou três documentos de 25 a 27 kB, mas o worker falhou ao enviar cada documento para `POST /api/diagnostico/roteiro/concluir`. O Caddy não registrou os três POSTs com documento; registrou somente os POSTs pequenos que notificaram a falha. A fila consumiu as três tentativas e a call de 11/09/2026 às 16h ficou sem anexo.

No runtime vivo, Node `24.15.0` com Undici `7.24.4`, o fechamento de uma conexão ociosa reproduziu `TypeError: fetch failed` com causa `UND_ERR_SOCKET: other side closed`. O mesmo padrão já havia ocorrido contra a Vercel em 06/09, então a migração não é a causa.

## Decisão

O worker não reutilizará conexões HTTP entre a consulta da fila e a conclusão que acontece minutos depois. A conclusão, que é idempotente pela chave de negócio `cal_booking_id`, terá uma única repetição local apenas para falhas transitórias de transporte. Falhas HTTP, autenticação e validação não serão repetidas. O erro persistente preservará o código e a mensagem da causa sem registrar segredo ou dados pessoais.

## DAG e rollout

`RF-01 teste vermelho -> RF-02/RF-03 código -> RF-04 suíte -> RF-05 deploy -> RF-06 booking real e rollback`.

Tudo é sequencial porque o deploy depende do teste e o reprocessamento real depende do release vivo. O rollback é restaurar o script anterior e reiniciar somente o supervisor do roteiro; nenhuma migration ou alteração de payload existe.

## Aceites

| ID | Critério |
|---|---|
| RF-01 | Teste comportamental prova que uma falha transitória no primeiro POST é repetida uma vez e não vira falha da fila. |
| RF-02 | Toda chamada do worker usa conexão descartável; a consulta reservante não é repetida. |
| RF-03 | Somente a conclusão idempotente repete falha transitória, com backoff curto e causa útil sem PII/segredo. |
| RF-04 | Testes focados, suíte, lint e build passam, com qualquer baseline pré-existente separado. |
| RF-05 | Script publicado e processo vivo usam o commit novo; health e fila autenticada permanecem verdes. |
| RF-06 | Booking da KSG volta à fila, conclui uma vez, recebe anexo real e sai da fila morta; rollback fica registrado. |

## Evidências

- RF-01: o teste falhou primeiro porque `roteiro-http.mjs` ainda não existia; depois do código, o caso `UND_ERR_SOCKET` fez duas chamadas e devolveu a resposta da segunda.
- RF-02: o teste inspeciona `Connection: close`; o caso da fila recebe uma falha de socket e confirma uma única chamada.
- RF-03: `UND_ERR_SOCKET` repete; HTTP 401 e `CERT_HAS_EXPIRED` não repetem. A mensagem expõe somente path interno, código e mensagem limitada da causa.
- RF-04: 25 testes focados passaram; ESLint dos três arquivos tocados passou; `next build` passou com 40 rotas. A suíte completa teve 401 testes verdes e dois baselines alheios: `contrato-brain` já divergia em `perdido-stand-by`, e o checkout CRLF falha ao importar `validate-env.mjs`, enquanto o mesmo teste passa no worktree-base LF. O lint completo preserva dois erros antigos de `require()` em `scripts/club/build-club-html.js`. `npm audit --omit=dev` aponta advisory novo do PostCSS transitivo do Next e só oferece upgrade quebrador ao Next 16; nenhuma dependência mudou nesta fatia.
- RF-05: o processo `2186628` subiu às 20:34 no checkout `2c4ddcf`; a primeira consulta autenticada retornou 200 e o Caddy registrou `Connection: close`. O container do site permaneceu no release `671add23864a`, healthy e sem restart.
- RF-06: o booking da KSG foi resetado isoladamente. A primeira nova tentativa gerou 27.487 bytes, recebeu HTTP 200 em 3,07 s e concluiu sem retry ou alerta. Postgres confirmou `estado=concluido`, `tentativas=1`, token, evento e caminho; Google confirmou um anexo `text/html` em `www.useinfuser.com/roteiro/<token>` e `leadPresent=false`. Rollback: checkout `3d721d1`, reinício do supervisor e novo reprocessamento somente se necessário.
