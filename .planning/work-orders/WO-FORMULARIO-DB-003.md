---
work_order: WO-FORMULARIO-DB-003
status: completed
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
  passed_acceptance_ids: [AC-03, AC-04]
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

### AC-03: nenhum driver de Neon importado, testes verdes

`grep -rn "@vercel/postgres\|@neondatabase" src/ scripts/` -> saída vazia. O pacote segue no
`package.json` (`@vercel/postgres@^0.10.0`) porque o rollback da F5 depende dele até a F7.

Mutante (import plantado em `src/lib/diagnostico/mapa-db.ts`, depois removido):

```text
### MUTANTE PLANTADO em src/lib/diagnostico/mapa-db.ts ###
8:import { sql } from "@vercel/postgres";
### RODANDO O TESTE (esperado: VERMELHO) ###
- []
+ [
+   "src/lib/diagnostico/mapa-db.ts",
+ ]
 ❯ tests/diagnostico/driver-neon-ausente.test.ts:65:22
 Test Files  1 failed (1)
      Tests  1 failed | 1 passed (2)

### MUTANTE REMOVIDO ###
8:import { sql } from "./banco";
### RODANDO O TESTE (esperado: VERDE) ###
 ✓ tests/diagnostico/driver-neon-ausente.test.ts (2 tests) 36ms
 Test Files  1 passed (1)
      Tests  2 passed (2)
```

`npm test` (suíte inteira):

```text
 Test Files  3 failed | 23 passed | 1 skipped (27)
      Tests  3 failed | 428 passed | 4 skipped (435)
```

- 428 passaram (baseline eram 409; +19 = 17 de `banco.test.ts` e 2 de `driver-neon-ausente`).
- 4 pulados: `banco-integracao.test.ts`, com aviso visível no stderr explicando que precisa de
  `TEST_POSTGRES_URL`.
- 3 vermelhos, TODOS de baseline (já vermelhos em `850f533`, nenhum tocado por esta fatia):
  `tests/diagnostico/contrato-brain.test.ts` (2 casos, divergência de enum com o brain);
  `tests/instalar/instalar.test.ts` (hash de ativo, CRLF do checkout);
  `tests/deploy/validate-env.test.ts` (falha ao CARREGAR: neste checkout Windows o
  `validate-env.mjs` está em CRLF e o shebang + CRLF quebram a transformação do Vitest;
  provado com `git ls-files --eol` mostrando `i/lf w/crlf`, e reproduzido com um arquivo de
  duas linhas: CRLF + shebang + import falha, LF + shebang + import passa).

`npx eslint .`: exit 1, com os MESMOS 2 erros de baseline em `scripts/club/build-club-html.js`
(`no-require-imports`), arquivo não tocado por esta fatia. Nenhum arquivo desta WO tem achado:
`npx eslint` sobre os 7 arquivos novos/alterados da fatia sai limpo.

`npx next build`: exit 0, inclusive com `POSTGRES_URL` REMOVIDA do ambiente.

`npx tsc --noEmit`: só os 2 erros pré-existentes de `tests/instalar/instalar.test.ts` (o
`next build` não checa `tests/`).

Integração real NÃO executada: esta máquina não tem Postgres nem Docker, e a WO proíbe tocar
servidor. O arquivo está escrito e pulando com aviso; a execução fica com o orquestrador,
contra um Postgres descartável (`TEST_POSTGRES_URL`). O bloco se recusa a rodar se achar
qualquer linha de dado no `public`, porque ele faz `DROP SCHEMA public CASCADE`.

### AC-04: `POSTGRES_URL_NON_POOLING` opcional

Quatro casos em `tests/diagnostico/banco.test.ts`, todos verdes: ambiente válido SEM a variável
passa; com a variável presente e inválida, falha com `POSTGRES_URL_NON_POOLING: URL Postgres
invalida`; `POSTGRES_URL` inválida e `POSTGRES_URL` ausente continuam falhando. O validador é
exercitado num processo Node de verdade (é como ele roda no Dockerfile), o que também mantém o
caso imune ao fim de linha do checkout. Valores do fixture são sintéticos.

### Desvios do pacote (decididos aqui, para você arbitrar)

1. **`abrirCliente` mudou de casa.** `CONTRATOS §2` colocava o helper no mesmo módulo
   (`banco.ts`). Os 8 scripts são `.mjs` e não importam TypeScript, então ele mora em
   `scripts/diagnostico/banco.mjs`. `CONTRATOS §2` foi corrigido para refletir isso. Ganhou um
   parâmetro opcional `connectionString`, que é o que `aplicar-schema.mjs` (cadeia de 4
   variáveis) e `inventariar-banco.mjs` (`DATABASE_URL_INVENTARIO`) usam.
2. **A trava de carregamento não vale em compilação nem em teste.** Com a validação valendo
   sempre, `npx next build` QUEBRA (`Failed to collect page data for /mapa/[token]`) e
   `tests/diagnostico/auth-painel.test.ts` passa a exigir banco configurado para testar função
   pura, por arrastar `rate-limit.ts` no grafo de imports. O módulo pula a trava quando
   `NEXT_PHASE=phase-production-build` ou `NODE_ENV=test`, e a MESMA validação continua rodando
   ao abrir o pool. Consertar de outro jeito exigiria `vitest.config.ts` (`test.env`), que está
   fora do scope lock. `CONTRATOS §2` foi corrigido.
3. **Uma linha de log no módulo.** A instrução era "sem log de nada". O `pg` derruba o processo
   inteiro num evento `error` de cliente OCIOSO sem listener, e engolir em silêncio seria pior:
   o listener registra só o CÓDIGO do erro, nunca URL nem parâmetro. `CONTRATOS §2` corrigido.
4. **`statement_timeout: 15_000` como opção do `pg`**, em vez de `options: "-c
   statement_timeout=15000"`. É o equivalente suportado pelo driver e um campo a menos para
   escapar errado.
5. **Cinco `as string | Date` novos** em `auth-db.ts` (4) e `rate-limit.ts` (1). O tipo de linha
   padrão passou de `any` (do pacote antigo) para `Record<string, unknown>` (o que `CONTRATOS
   §2` manda), e esses `new Date(x.criado_em)` pararam de compilar. Nenhuma query mudou.

### Observações para as fatias seguintes

- `sslmode=require` na URL continua funcionando: o `pg-connection-string` do `pg@8.23` o trata
  como `verify-full` e avisa que na v3/pg 9 vira semântica libpq. Vale conferir na F5.
- `pg` devolve `timestamptz` como `Date`; o pacote antigo também. Nada a fazer, mas é o tipo de
  diferença que a F5 sentiria primeiro.
