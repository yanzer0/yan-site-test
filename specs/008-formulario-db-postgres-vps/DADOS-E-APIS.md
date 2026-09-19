---
tags: [engenharia, dados, postgres, dump, restore, backup, migracao]
status: ready
version: 1.0
updated: 2026-09-19
---

# Dados e APIs: `formulario-db`

## 1. Autoridade e ciclo de vida

| Dado | Autoridade até a F5 | Autoridade depois da F5 | F6 (soak) | F7 | Classificação |
|---|---|---|---|---|---|
| leads, respostas, avaliacoes, parciais, exclusoes | Neon | `formulario-db` | Neon read-only, cópia congelada | Neon destruído | Sensível (PII) |
| agendamentos, roteiros | Neon | `formulario-db` | idem | idem | Sensível (booking, token) |
| mapas, mapa_achados, pedidos_mapa | Neon | `formulario-db` | idem | idem | Sensível (e-mail, pagamento) |
| usuarios_painel, sessoes_painel, tentativas_acesso, painel_config | Neon | `formulario-db` | idem | idem | Sensível (hash de senha, token) |
| Dump diário | inexistente | `~/backups/formulario/` cifrado | idem | idem + offsite | Sensível |
| String de conexão | env da VPS + `.env.local` do Yan | env da VPS (TCP interno) | Neon ainda no `.env.local` para o rollback | removida dos dois | Secreta |

## 2. Modelo e migrations

Nenhuma tabela, coluna, constraint, índice ou sequência muda. O schema alvo é o que o dump da
F5 carrega. Referência: `INVENTARIO-F0.md` (14 tabelas, 1 sequência, extensão `pgcrypto`).

`aplicar-schema.mjs` passa a listar os 9 `.sql` (entram `documento-html-sql.sql`,
`fila-trava-sql.sql`, `reembolso-sql.sql`) para que um banco vazio de teste chegue ao mesmo
schema. Rodar o aplicador no banco restaurado tem que ser no-op; a F2 prova isso.

## 3. Roles e privilégios

| Role | Onde | Privilégios | Uso |
|---|---|---|---|
| `postgres` | container, socket Unix (trust) | superuser | init, `pg_dump`, `pg_restore`, drills; nunca pela aplicação |
| `formulario` | `formulario-db`, TCP em `formulario-net` | LOGIN, dono de `formulario`; sem SUPERUSER/CREATEDB/CREATEROLE | aplicação e `inventariar-banco.mjs` |
| `neondb_owner` | Neon | createdb (já existe) | leitura em F0/F3/F5; revogada na F7 |

`REVOKE ALL ON DATABASE formulario FROM PUBLIC` no init. Não há outro consumidor.

## 4. Dump, restore e prova

| Passo | Comando (executado na VPS como `infuser`) | Prova |
|---|---|---|
| Dump da origem | `docker run --rm -e NEON_URL -v ~/backups/formulario:/out postgres:17.<minor> sh -c 'pg_dump "$NEON_URL" -Fc -f /out/neon-<utc>.dump'` com `NEON_URL` exportada só naquele shell (URL direta, `sslmode=require`, nunca em argumento visível no `ps` nem no histórico) | arquivo > 0 bytes; `pg_restore --list` lista as 14 tabelas |
| Restore no destino | `docker exec -i formulario-db pg_restore -U postgres -d formulario --no-owner --role=formulario --exit-on-error < dump` | exit 0 |
| Contagem | `inventariar-banco.mjs` contra origem e destino; diff das 14 linhas `tabela,linhas` | zero diferença |
| Sequência | `SELECT last_value FROM tentativas_acesso_id_seq` nos dois lados | igual |
| Extensão | `SELECT extname FROM pg_extension` no destino | contém `pgcrypto` |

`--exit-on-error` faz o restore parar na primeira falha em vez de restaurar pela metade. Como
`pgcrypto` já existe pelo init, o `CREATE EXTENSION` do dump é ignorado por `IF NOT EXISTS` ou
falha de forma visível; a F3 decide entre `--no-comments` e filtrar a extensão pelo `--list` e
`-L`, e registra o que funcionou.

## 5. APIs e autorização

Nenhuma rota, método, input, output, auth ou erro muda. Referência completa em
`CONTRATOS-E-EVENTOS.md` §1. A única superfície "nova" é operacional: `docker exec` para dump e
restore, e o cron de backup.

## 6. Backup, restore drill e retenção

| Item | Valor |
|---|---|
| Script | `deploy/vps/formulario-db/backup.sh <dir>`: `docker exec formulario-db pg_dump -U postgres -d formulario -Fc` > `formulario-<utc>-<release>.dump`; `sha256sum` ao lado; `age -r <recipient do backup principal>` gerando `.dump.age`; apaga o `.dump` em claro; falha alta em qualquer passo (mesmo esqueleto do `deploy/crm/backup.sh` do Twenty) |
| Cron | diário 03:15 (entre o backup principal 03:00 e o do MCP 03:30), `~/backups/formulario/`, alerta por `ops-alert.sh formulario-backup critico` em falha |
| Retenção | 14 dias locais; offsite conforme R1 (lacuna nomeada) |
| Restore drill | `deploy/vps/formulario-db/restore-drill.sh <arquivo.age>`: `age -d`, sobe `postgres:17.<minor>` descartável com volume temporário, restaura, roda `inventariar-banco.mjs`, compara com o inventário salvo junto do dump, derruba o container e apaga o volume. Provado na F4 e repetido mensalmente |
| Chave `age` | a mesma do backup da VPS; conferir onde o recipient privado está guardado (pendência já aberta no mapa da operação); sem cópia fora da VPS, o backup não protege contra perda da VPS |

## 7. Concorrência

`FOR UPDATE SKIP LOCKED` em `roteiro-db.ts` continua válido em TCP. Pool `max: 5` no site (um
processo Node, tráfego baixo); scripts usam `Client` único. `max_connections` padrão 100 do
container sobra.

## 8. Retenção, exclusão e redaction

- Exclusão por titular continua pela tabela `exclusoes` e pelo caminho existente; nada muda.
- Dumps contêm PII: retenção 14 dias e destruição com `shred` ou `rm` em disco cifrado; o offsite
  só recebe `.age`.
- Smoke, logs e closeouts registram só contagens, nomes de tabela, códigos e latências.

## 9. Performance e capacidade

| Operação | Volume | Orçamento | Como medir |
|---|---|---:|---|
| Fila autenticada (`GET /roteiro/fila`) | 1/min | < 300 ms interno | `curl time_total` (hoje ~0,9 s via Neon) |
| Submit | dezenas/mês | < 500 ms | smoke com lead de teste |
| Dump completo | 9,2 MB | < 10 s | `time` no cron |
| Restore completo | 9,2 MB | < 30 s | `time` no drill |
| Disco do volume | 9,2 MB + WAL | < 200 MB no primeiro mês | `docker system df -v` |
