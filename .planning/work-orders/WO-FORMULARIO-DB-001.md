---
work_order: WO-FORMULARIO-DB-001
status: active
central_branch: claude/formulario-db
owner: Claude
authorized_by: Yan
authorized_at: 2026-09-19
scope_lock:
  version: 1
  base_commit: cfb0e9c0cad6ac68520d594a5e902a706fa93198
  allowed_write_globs:
    - .planning/work-orders/WO-FORMULARIO-DB-001.md
    - specs/008-formulario-db-postgres-vps/**
  architecture_delta:
    production_files: []
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids:
    - AC-00
    - AC-01
  stop_when:
    - AC-00
    - AC-01
  passed_acceptance_ids:
    - AC-00
    - AC-01
---

# WO-FORMULARIO-DB-001: pacote de definição e inventário F0

## Autorização

Yan, 19/09/2026, no brain: "grava" (decisão e escopo) e "monta o EDP specs/008 a partir da F0".
Fonte: `_decisions/2026-09-19-formulario-b2b-sai-do-neon-para-postgres-na-vps.md` e a seção
"Migração do banco" de `_projetos/funil-diagnostico-captura.md` no `yangalasso-brain`.

## Escopo desta ordem

- W0: o pacote `specs/008-formulario-db-postgres-vps/` completo, com os nove artefatos e o manifesto.
- F0: inventário só leitura do Neon vivo, registrado em `INVENTARIO-F0.md` sem dado pessoal.

Nenhum arquivo de produção, dependência, contrato público, superfície de persistência ou job muda
nesta ordem. F1 a F7 saem em ordens próprias, cada uma com branch, worktree e Scope Lock.

## Critérios de aceite

| ID | Critério | Prova |
|---|---|---|
| AC-00 | O manifesto lista os nove artefatos com dono, versão e estado; o README declara `definition_status: ready-for-build`; o checker de Scope Lock aprova a ordem e o diff staged. | Saída de `node scripts/check-scope-lock.js --repo <worktree> --mode enforce --staged` colada abaixo. |
| AC-01 | O inventário do Neon vivo registra versão do servidor, extensões, as 14 tabelas com colunas, índices, constraints, contagem de linhas e tamanho, sequências, funções e roles, sem nenhuma linha de dado. | `INVENTARIO-F0.md`, gerado em 19/09/2026 09:19 UTC por script só leitura. |

## Evidência

- AC-01: inventário executado em 19/09/2026 às 09:19 UTC contra `POSTGRES_URL_NON_POOLING` do Neon com
  queries em `information_schema`, `pg_indexes`, `pg_constraint`, `pg_roles` e `count(*)`; nenhum
  `SELECT` de coluna de dado. Resultado em `specs/008-formulario-db-postgres-vps/INVENTARIO-F0.md`.
- AC-00: checker executado em 19/09/2026 com os 12 arquivos staged, nos dois modos:

```text
$ node scripts/check-scope-lock.js --repo <worktree> --mode enforce --staged
Scope Lock PASS (enforce)
branch: claude/formulario-db
work_orders_ativas: WO-FORMULARIO-DB-001
arquivos_avaliados: 12
WARN SLW03 x4: work orders ativas de outras branches ignoradas aqui (esperado)
exit 0
```

  Mesma saída sem `--staged`. Os quatro avisos são as ordens ativas de outras frentes
  (`deploy-image-retention`, `roteiro-poll-30min`, `roteiro-poll-6min`, `segundo-cerebro-auth`);
  nenhuma reivindica `specs/008` nem esta ordem.

## Closeout

`stop_when` completo (AC-00 e AC-01). Esta ordem não autoriza mais escrita alguma. F1 e F2 nascem
em `WO-FORMULARIO-DB-002` e `-003`, com o Scope Lock pré-declarado em
`specs/008-formulario-db-postgres-vps/PLANO-DE-IMPLEMENTACAO.md` §4, quando o Yan der o go.
