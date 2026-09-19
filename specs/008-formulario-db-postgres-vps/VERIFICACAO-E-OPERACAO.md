---
tags: [engenharia, testes, operacao, runbook, migracao, postgres]
status: ready
version: 1.0
updated: 2026-09-19
---

# Verificação e operação: `formulario-db`

## 1. Estratégia baseada em risco

As falhas que doem: restaurar pela metade e declarar verde; perder um booking ou um pagamento na
janela; deixar o banco alcançável de fora; a aplicação virar superuser; um dump com e-mail e
WhatsApp parar em log, chat ou git; cortar sem backup do banco novo; apagar o Neon sem cópia
externa. Cada uma tem prova positiva e contraexemplo abaixo; happy path sozinho não fecha fatia.

## 2. Matriz de invariantes

| Invariante | Prova positiva | Contraexemplo | Nível | Fatia |
|---|---|---|---|---|
| Contagem por tabela origem = destino | diff zero das 14 linhas | inserir 1 linha de teste no destino descartável e ver o diff acusar | Integração | F3, F5 |
| Banco sem porta e só duas pontas na rede | `docker inspect`, `docker network inspect` | `nc -z 127.0.0.1 5432` na VPS falha; `psql` de outro container falha | Produção | F1, F5 |
| App sem superuser | `pg_roles` da role `formulario` | `CREATE DATABASE x` como `formulario` falha | Produção | F1 |
| Banco pronto para a app, não só de pé | healthcheck com `select 1` como `formulario` | `pg_isready` sozinho dá exit 0 com a role ausente (medido na F1) | Produção | F1 |
| Nenhum `@vercel/postgres` no caminho vivo | teste estático verde | reintroduzir o import num arquivo de `src/` e o teste reprova | Regressão | F2 |
| Tagged template parametriza | unidade: `$1..$n` na ordem | `undefined` lança `TypeError` | Unidade | F2 |
| Reserva concorrente da fila | dois clientes recebem itens distintos | sem `SKIP LOCKED` um deles bloqueia (teste documenta, não muda o SQL) | Integração | F2 |
| Escrita recusada na janela | access log do Caddy com 503 nas rotas | `GET /api/health` continua 200 | Produção | F5 |
| Backup restaura | drill em container descartável | corromper 1 byte do `.age` e o drill falha alto | Operação | F4, mensal |
| Sem PII fora do dump | grep de `@` e de padrão de telefone nos logs de deploy, no closeout e no diff | um e-mail plantado num log de teste é pego | Segurança | todas |
| Worker a 60 s sem long-poll | constante + processo vivo | guard de long-poll continua reprovando `esperar=` | Regressão | F5 |

## 3. Testes

- estático: mutante de import (`src/`, `scripts/`); cadência do worker (parte mantida do
  `fila-worker.test.ts`);
- unidade: `banco.ts` (template, `query`, `undefined`, env inválido no boot);
- integração (só com `TEST_POSTGRES_URL`; sem ele o caso é pulado com aviso visível na saída do
  Vitest, nunca silencioso): `aplicar-schema.mjs` em banco vazio cria 14 tabelas e é no-op no
  segundo run; reserva concorrente; `inventariar-banco.mjs` devolve o mesmo formato nos dois lados;
- restore: F3 (dump F0) e F4 (dump do banco novo), sempre com diff de contagem;
- produção: smoke da 006 (`deploy/vps/smoke.mjs`) + fila autenticada + webhooks negativos (401)
  + submit de teste com e-mail de domínio de teste, removido em seguida pelo caminho de exclusão
  e confirmado ausente por contagem;
- soak: relatório diário por 7 dias.

Baseline conhecido: `contrato-brain.test.ts` continua vermelho pela divergência de
`perdido-stand-by` (registrado na 006). Não é desta migração e não pode ser escondido.

## 4. Segurança adversarial

- `docker inspect`: sem `PortBindings`, `cap_drop ALL` mais o mínimo do entrypoint,
  `no-new-privileges`, rede `internal`;
- de outro container fora de `formulario-net`: conexão TCP a `formulario-db:5432` falha por DNS
  ou rede;
- `formulario` não consegue `CREATE DATABASE`, `CREATE ROLE`, `COPY ... TO PROGRAM`;
- `docker history` da imagem do site sem env; `git log -p` da fatia sem string de conexão;
- `.env.local` do Yan e env da VPS: nenhuma URL do Neon depois da F7;
- dumps: permissão 600 dentro de diretório 700; `.dump` em claro nunca sobrevive ao `backup.sh`.

## 5. Performance, capacidade e custo

| Cenário | Orçamento | Ação se falhar |
|---|---:|---|
| Fila autenticada interna | < 300 ms | investigar pool e DNS do Compose; nunca subir `max` do pool sem medir |
| Submit no smoke | < 500 ms | idem |
| Dump / restore | < 10 s / < 30 s | investigar disco |
| RSS de `formulario-db` | < 256 MiB em 24 h | rever `shared_buffers` |
| Disco `/` | < 85% em todos os gates | parar e limpar antes de continuar |
| CU-hora Neon | 0 depois da F7 | n/a |

## 6. Logs e alertas

- Postgres: stdout em `json-file` 10 MB x 3, `log_min_messages = warning`, sem `log_statement`.
- Site: como hoje; `ErroPersistencia` loga operação e código, nunca parâmetro.
- Caddy: access log JSON existente registra os 503 da janela.
- Backup: `ops-alert.sh formulario-backup critico` em falha (mesmo canal dos outros crons).
- Disco: `disk-check.sh` já alerta acima de 85%.
- Worker: `SyslogIdentifier=infuser-roteiro`; alerta `funil-diagnostico/roteiro` existente.

## 7. Runbook da janela (F5)

Pré-condições: F2 mergeada e imagem do site construída com o driver novo mas ainda apontando
para o Neon por env; F3 e F4 provadas; `df -h /` < 85%; nenhum agendamento no Cal nas próximas
2 h; aviso no grupo do time; go do Yan com hora.

1. Registrar `T0` (UTC). Backup timestampado do env da VPS e do Caddyfile.
2. Caddy: inserir o bloco de janela (`ARQUITETURA` §4.4), `caddy validate`, reload. Confirmar 503
   em `POST /api/diagnostico/parcial` e em `/leads`, 200 em `/api/health`. Registrar `T1`.
3. `systemctl --user stop roteiro` (evita log de erro a cada 30 s; a reserva já é impossível).
4. Dump final do Neon com `pg_dump` 17 (URL por variável de ambiente, nunca em argumento visível
   no `ps`; apagar do histórico). `pg_restore --exit-on-error` no `formulario-db`. Registrar
   tamanho e duração, nunca conteúdo.
5. `inventariar-banco.mjs` contra Neon e `formulario-db`; diff das 14 contagens e da sequência
   igual a zero. Diferença aborta: pular para o rollback.
6. Neon: `ALTER DATABASE neondb SET default_transaction_read_only = on;`.
7. Env da VPS: `POSTGRES_URL` (e `POSTGRES_URL_NON_POOLING`, se o validador ainda exigir) para a
   URL TCP interna. `validate-env` verde.
8. `deploy.sh` com o commit da F5 (worker a 60 s). Aguardar healthy. `GET /api/health` 200.
9. Smoke interno: fila autenticada, `/leads/entrar`, webhooks negativos 401, submit de teste
   e exclusão, mapa. Latência da fila registrada.
10. Caddy: remover o bloco, validate, reload. Registrar `T2`. Meta `T2 - T1` ≤ 15 min.
11. `systemctl --user start roteiro`; confirmar processo, commit e primeira fila 200.
12. Reconciliação: bookings do Cal com `createdAt`/`updatedAt` em `[T1, T2]` versus
    `agendamentos`; eventos do Stripe com falha em `[T1, T2]` versus `pedidos_mapa`; disparar um
    evento de teste do Stripe e confirmar 200. Registrar contagens.
13. Observar 30 min: 5xx no Caddy, health, RSS, alertas. Fechar a janela no closeout da WO-005.

### Rollback (a qualquer passo até a F7)

1. Restaurar o env do backup timestampado; `docker compose up -d --no-deps site` com a imagem
   anterior se a nova já tiver subido.
2. Remover o bloco de janela do Caddy com backup, validate e reload.
3. `ALTER DATABASE neondb SET default_transaction_read_only = off;` no Neon.
4. `systemctl --user start roteiro` se estiver parado.
5. Smoke. Registrar causa e hora. Sem dual-write, nada foi escrito fora do Neon.

## 8. Critérios de prontidão

- [ ] F1: banco healthy, isolado, role sem privilégio, `df` registrado (AC-02).
- [ ] F2: mutante estático reprova; suíte, lint e build verdes; integração com Postgres local (AC-03, AC-04).
- [ ] F3: restore do dump F0 com diff zero; volume de teste apagado (AC-05).
- [ ] F4: dump cifrado + sha256 no cron; alerta provado; drill provado (AC-06).
- [ ] F5: janela ≤ 15 min registrada; diff zero; smoke; worker 60 s; reconciliação zero ausente (AC-07, AC-08, AC-09).
- [ ] F6: 7 dias sem 5xx novo, sem alerta, backup 7/7, leads consistentes (AC-10).
- [ ] F7: Neon revogado e destruído; envs e `.env.local` limpos; pacote sem `@vercel/postgres`; runbook e mapa atualizados (AC-11).
- [ ] transversal: nenhum segredo ou PII em diff, log, smoke ou closeout (AC-12).

## 9. Evidência executada

### 2026-09-19, F0 (WO-FORMULARIO-DB-001)

- inventário só leitura do Neon às 09:19 UTC: PostgreSQL 17.11, 14 tabelas, 806 linhas, 9,20 MB,
  `pgcrypto` 1.3, 1 sequência, 0 views/triggers/funções próprias, role `neondb_owner` sem
  superuser; nenhuma coluna de dado lida. Detalhe em `INVENTARIO-F0.md`.
- consequência registrada: alvo passa de `postgres:16` para a série 17.
