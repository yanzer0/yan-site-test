---
work_order: WO-FORMULARIO-DB-003
status: active
central_branch: claude/formulario-db-f2
owner: Opus 5 (executor) / Claude (validador)
authorized_by: Yan
authorized_at: 2026-09-19
scope_lock:
  version: 1
  base_commit: 850f53351f7a34f5846524ec060defe380f869d3
  allowed_write_globs:
    - .planning/work-orders/WO-FORMULARIO-DB-003.md
    - src/lib/diagnostico/**
    - src/app/api/diagnostico/mapa/respostas/route.ts
    - scripts/diagnostico/banco.mjs
    - scripts/diagnostico/aplicar-schema.mjs
    - scripts/diagnostico/aprovar-mapa.mjs
    - scripts/diagnostico/inventariar-banco.mjs
    - scripts/diagnostico/provar-pagamento.mjs
    - scripts/diagnostico/provar-reembolso.mjs
    - scripts/diagnostico/provar-trava-da-fila.mjs
    - scripts/diagnostico/provar-webhook.mjs
    - scripts/diagnostico/refazer-roteiro.mjs
    - scripts/diagnostico/semear-teste.mjs
    - tests/diagnostico/banco.test.ts
    - tests/diagnostico/banco-integracao.test.ts
    - tests/diagnostico/driver-neon-ausente.test.ts
    - tests/diagnostico/schema-do-brain.ts
    - deploy/vps/validate-env.mjs
    - package.json
    - package-lock.json
    - specs/008-formulario-db-postgres-vps/**
  architecture_delta:
    production_files:
      - src/lib/diagnostico/banco.ts
      - src/lib/diagnostico/db.ts
      - src/lib/diagnostico/leads-db.ts
      - src/lib/diagnostico/mapa-db.ts
      - src/lib/diagnostico/pagamento-db.ts
      - src/lib/diagnostico/roteiro-db.ts
      - src/lib/diagnostico/auth-db.ts
      - src/lib/diagnostico/rate-limit.ts
      - src/app/api/diagnostico/mapa/respostas/route.ts
      - deploy/vps/validate-env.mjs
    runtime_dependencies:
      - package.json
      - package-lock.json
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids:
    - AC-03
    - AC-04
  stop_when:
    - AC-03
    - AC-04
  passed_acceptance_ids: []
---

# WO-FORMULARIO-DB-003: F2, driver `pg` atrás de um módulo único

## Autorização

Yan, 19/09/2026: "go pra todas, vá até o fim". Pacote: `specs/008-formulario-db-postgres-vps/`
(`README.md` decisão congelada 4, `ARQUITETURA.md` §4.3, `CONTRATOS-E-EVENTOS.md` §2, §3, §7,
§10, `DADOS-E-APIS.md` §2, `PLANO-DE-IMPLEMENTACAO.md` §4 F2, `VERIFICACAO-E-OPERACAO.md` §2, §3).

## Escopo

1. `pg` e `@types/pg` entram pinados (`package.json`, lockfile). `@vercel/postgres` NÃO sai
   ainda (o rollback da F5 por env depende de o pacote existir até a F7).
2. `src/lib/diagnostico/banco.ts`: pool único por processo (`globalThis` em dev), `sql` tagged
   template parametrizado + `sql.query(text, params)`, `undefined` em parâmetro lança
   `TypeError`, `POSTGRES_URL` validada no boot do módulo, `statement_timeout` 15 s,
   `connectionTimeoutMillis` 5 s, `max: 5`, `encerrarPool()`.
3. Os 8 arquivos de `src/` passam a importar `sql` de `./banco` (ou `@/lib/diagnostico/banco`),
   sem mudar nenhuma query.
4. `scripts/diagnostico/banco.mjs`: `abrirCliente()` com `pg.Client` a partir de
   `POSTGRES_URL_NON_POOLING ?? POSTGRES_URL`; os 8 scripts que usavam `createClient` passam a
   usar o helper.
5. `aplicar-schema.mjs` lista os 9 `.sql`; segundo run num banco já aplicado tem que ser no-op.
6. `scripts/diagnostico/inventariar-banco.mjs`: só leitura, saída JSON determinística (tabelas
   com contagem, colunas, índices, constraints, sequências com `last_value`, extensões, versão),
   sem nenhuma linha de dado; serve Neon e VPS; flag `--resumo` imprime `tabela,linhas` para diff.
7. `deploy/vps/validate-env.mjs`: `POSTGRES_URL_NON_POOLING` opcional (default = `POSTGRES_URL`).
8. Testes: estático (nenhum import de `@vercel/postgres`/`@neondatabase` em `src/` e `scripts/`;
   plantar o import num arquivo temporário e provar que o teste reprova, depois remover), unidade
   do template (`$1..$n`, `undefined`, env inválido), integração com `TEST_POSTGRES_URL` (pulada
   com aviso visível sem a variável): schema em banco vazio cria 14 tabelas e é no-op no segundo
   run; reserva concorrente com `SKIP LOCKED` entrega itens distintos.

## Fora do escopo

`servico-roteiro.mjs`, `fila-worker.test.ts`, compose, env da VPS, deploy, Neon, qualquer
query SQL existente.

## Critérios de aceite

| ID | Critério | Prova exigida |
|---|---|---|
| AC-03 | Nenhum `@vercel/postgres` nem `@neondatabase` importado em `src/` e `scripts/`; teste estático reprova regressão; unidade e integração verdes | saída do `grep -rn` vazia; saída do mutante (vermelho, depois verde); `npm test` com contagem e o baseline `contrato-brain` explicitado; `npx eslint .` e `npx next build` verdes |
| AC-04 | `validate-env` aceita env sem `POSTGRES_URL_NON_POOLING` e continua rejeitando URL inválida | teste unitário do validador nos dois casos |

## Evidência

(preenchida pelo executor; nunca colar URL de conexão, senha ou conteúdo de env)
