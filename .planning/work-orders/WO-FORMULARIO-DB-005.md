---
work_order: WO-FORMULARIO-DB-005
status: active
central_branch: claude/formulario-db-f5
owner: Opus 5 (executor) / Claude (validador)
authorized_by: Yan
authorized_at: 2026-09-19
scope_lock:
  version: 1
  base_commit: 67919c55ce2db33367ad10bb9341730e3e0f9466
  allowed_write_globs:
    - .planning/work-orders/WO-FORMULARIO-DB-005.md
    - scripts/diagnostico/servico-roteiro.mjs
    - tests/diagnostico/fila-worker.test.ts
    - deploy/vps/README.md
    - specs/008-formulario-db-postgres-vps/**
  architecture_delta:
    production_files:
      - scripts/diagnostico/servico-roteiro.mjs
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces:
      - formulario-db recebe os dados do funil (restore do dump final do Neon)
      - env de producao do site passa a apontar para formulario-db
    background_jobs:
      - unit roteiro (cadencia 30 min para 60 s)
  acceptance_ids:
    - AC-07
    - AC-08
    - AC-09
  stop_when:
    - AC-07
    - AC-08
    - AC-09
  passed_acceptance_ids: []
---

# WO-FORMULARIO-DB-005: F5, a janela de corte (Neon para `formulario-db`)

## Autorização

Yan, 19/09/2026: "go pra todas, vá até o fim". Pacote: `specs/008-formulario-db-postgres-vps/`
(`README.md` decisões 5, 6 e 8, superfícies protegidas; `ARQUITETURA.md` §4.4, §5, §8;
`CONTRATOS-E-EVENTOS.md` §3, §4, §5, §6; `DADOS-E-APIS.md` §4 (rito de restore com
`--no-comments --no-acl`); `PLANO-DE-IMPLEMENTACAO.md` §4 F5, §6, §7; `VERIFICACAO-E-OPERACAO.md`
§7 (runbook da janela e rollback) e §8). F1, F2, F3 e F4 estão em `main` (`67919c5`) e provadas:
`formulario-db` healthy e vazio, driver `pg` no código, backup diário com drill.

## Escopo

1. Código: `PAUSA_ENTRE_CONSULTAS_MS` de `1_800_000` para `60_000` em `servico-roteiro.mjs`; o
   caso "keeps the Neon compute awake at most 20% of the time" sai de
   `tests/diagnostico/fila-worker.test.ts` (a premissa morre com o Neon); os outros guards ficam.
   `deploy/vps/README.md`: seção "Corte e rollback do banco" com os instantes reais.
2. VPS, na ordem do runbook §7: `T0`; backup do env e do Caddyfile; bloco de janela no Caddy
   (503 + `Retry-After` em `/api/diagnostico/*` e `/leads*`) com validate + reload (`T1`); dump
   final do Neon; restore no `formulario-db` de produção; diff de contagem zero; Neon
   `default_transaction_read_only = on`; env do site apontando para `formulario-db`;
   `validate-env` verde; `deploy.sh` no commit desta ordem; health; smoke; bloco removido (`T2`);
   worker no commit novo a 60 s; reconciliação; 30 min de observação.

## Fora do escopo

Schema, rotas, payloads, Caddy além do bloco temporário, destruir o Neon, remover
`@vercel/postgres`, `.env.local` do Yan (F7). Nunca `compose down`, nunca `-v`, nunca apagar
`formulario-db-data`, nunca reiniciar o Caddy (só `reload` validado).

## Critérios de aceite

| ID | Critério | Prova exigida |
|---|---|---|
| AC-07 | Janela registrada (`T0`, `T1`, `T2` em UTC, `T2 - T1` ≤ 15 min, abortar acima de 30); 503 provado nas rotas de escrita e 200 no health durante a janela; dump final restaurado com `--exit-on-error` exit 0; diff de contagem por tabela e sequência entre Neon e `formulario-db` vazio; Neon em read-only provado por escrita recusada; env trocado com backup timestampado e `validate-env` verde; site healthy no commit desta ordem | saídas reais coladas na WO, sem segredo |
| AC-08 | Smoke pós-corte verde: `smoke.mjs` nos dois hosts, fila autenticada 200 com latência registrada (< 300 ms interno), `/leads/entrar` 200, webhooks Cal e Stripe com 401/400 sem assinatura, escrita real de teste em `parciais` por `POST /api/diagnostico/parcial` com `sessao_id` sintético visível no banco novo e removida em seguida; reconciliação (bookings do Cal e eventos do Stripe na janela) registrada, com o que não pôde ser verificado nomeado | saídas reais |
| AC-09 | Worker no commit desta ordem com `PAUSA_ENTRE_CONSULTAS_MS = 60_000`, unit `roteiro` reiniciada, primeira fila 200 no log, `fila-worker.test.ts` verde sem o caso do Neon; 30 min sem 5xx novo no access log do Caddy em `/api/diagnostico/*` e sem alerta | saídas reais |

## Evidência

(preenchida pelo executor; nunca colar senha, URL de conexão, conteúdo de env, token, e-mail ou
linha de dado)
