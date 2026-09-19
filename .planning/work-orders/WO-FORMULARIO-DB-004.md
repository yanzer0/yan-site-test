---
work_order: WO-FORMULARIO-DB-004
status: active
central_branch: claude/formulario-db-f4
owner: Opus 5 (executor) / Claude (validador)
authorized_by: Yan
authorized_at: 2026-09-19
scope_lock:
  version: 1
  base_commit: 76ee39835752bf015e848899cf7e52d677dae1f9
  allowed_write_globs:
    - .planning/work-orders/WO-FORMULARIO-DB-004.md
    - deploy/vps/formulario-db/**
    - deploy/vps/README.md
    - specs/008-formulario-db-postgres-vps/**
  architecture_delta:
    production_files:
      - deploy/vps/formulario-db/backup.sh
      - deploy/vps/formulario-db/restore-drill.sh
      - deploy/vps/formulario-db/contar-tabelas.sh
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces:
      - diretorio ~/backups/formulario/ na VPS (700), dumps cifrados
    background_jobs:
      - cron diario backup-formulario 03:15 na VPS
  acceptance_ids:
    - AC-05
    - AC-06
  stop_when:
    - AC-05
    - AC-06
  passed_acceptance_ids: []
---

# WO-FORMULARIO-DB-004: F3 (restore drill do dump do Neon) e F4 (backup cifrado com drill)

## Autorização

Yan, 19/09/2026: "go pra todas, vá até o fim". Pacote: `specs/008-formulario-db-postgres-vps/`
(`README.md` decisões 6 e 7 e superfícies protegidas, `DADOS-E-APIS.md` §4, §6, §8,
`PLANO-DE-IMPLEMENTACAO.md` §3 e §4 F3 + F4, `VERIFICACAO-E-OPERACAO.md` §2, §4, §8,
`INVENTARIO-F0.md`). F1 está viva na VPS: `formulario-db` (`postgres:17.11`) healthy, rede
`formulario-net`, role `formulario`, extensão `pgcrypto`, secrets em
`/home/infuser/.config/useinfuser/formulario-db-{admin,app}.password`.

## Escopo

- F3: dump `-Fc` do Neon vivo com `pg_dump` 17 rodando na VPS, restore num container
  descartável `postgres:17.11` (mesma role, banco e extensão que o init da F1 cria), prova por
  contagem de linhas por tabela e `last_value` da sequência (origem = destino no instante do
  dump), depois container e volume apagados. O `formulario-db` de produção NÃO recebe o dump
  nesta ordem (isso é a F5).
- F4: `deploy/vps/formulario-db/backup.sh` (dump `-Fc` do `formulario-db` por `docker exec`,
  resumo de contagens ao lado, sha256, `age -R ~/.config/age/recipients.txt`, remove o dump em
  claro, retenção 14 dias, falha alta), `restore-drill.sh` (restaura num container descartável e
  compara contagens com o resumo), `contar-tabelas.sh` (helper `tabela,linhas` ordenado, usado
  nos dois lados), cron diário 03:15 com alerta `ops-alert.sh` em falha, alerta provado com
  falha forçada, primeiro drill real, seção no `deploy/vps/README.md`.

## Fora do escopo

Env do site, Caddy, worker, código de `src/` ou `scripts/diagnostico`, o `formulario-db` de
produção (só leitura para o backup), o Neon (só leitura). Nunca `compose down`, nunca `-v` em
volume de produção, nunca apagar `formulario-db-data`.

## Critérios de aceite

| ID | Critério | Prova exigida |
|---|---|---|
| AC-05 | Dump do Neon restaura num container descartável com `--exit-on-error` e as 14 contagens + a sequência batem com a origem no instante do dump; container e volume de teste removidos | saída do `diff` (vazia) entre `contar-tabelas` da origem e do destino, `pg_restore --list` com 14 tabelas, `docker ps -a` e `docker volume ls` sem o descartável ao fim, `df -h /` antes e depois |
| AC-06 | Backup cifrado do `formulario-db` no cron com sha256 válido, alerta em falha provado, restore drill provado | `crontab -l` com a linha; `ls -la ~/backups/formulario/` com `.dump.age`, `.sha256`, `.resumo` e sem `.dump` em claro; `sha256sum -c`; saída do drill com `diff` vazio; prova do alerta (falha forçada dispara `ops-alert.sh`, depois limpo); `df -h /` |

## Evidência

(preenchida pelo executor; nunca colar senha, URL de conexão, conteúdo de env ou linha de dado)
