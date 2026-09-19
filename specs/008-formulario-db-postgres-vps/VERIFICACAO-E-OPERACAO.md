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
- [x] F3: restore do dump F0 com diff zero; volume de teste apagado (AC-05).
- [x] F4: dump cifrado + sha256 no cron; alerta provado; drill provado (AC-06).
- [x] F5: janela ≤ 15 min registrada; diff zero; smoke; worker 60 s; reconciliação zero ausente (AC-07, AC-08, AC-09).
- [ ] F6: 7 dias sem 5xx novo, sem alerta, backup 7/7, leads consistentes (AC-10).
- [ ] F7: Neon revogado e destruído; envs e `.env.local` limpos; pacote sem `@vercel/postgres`; runbook e mapa atualizados (AC-11).
- [ ] transversal: nenhum segredo ou PII em diff, log, smoke ou closeout (AC-12).

## 9. Evidência executada

### 2026-09-19, F0 (WO-FORMULARIO-DB-001)

- inventário só leitura do Neon às 09:19 UTC: PostgreSQL 17.11, 14 tabelas, 806 linhas, 9,20 MB,
  `pgcrypto` 1.3, 1 sequência, 0 views/triggers/funções próprias, role `neondb_owner` sem
  superuser; nenhuma coluna de dado lida. Detalhe em `INVENTARIO-F0.md`.
- consequência registrada: alvo passa de `postgres:16` para a série 17.

### 2026-09-19, F2 (WO-FORMULARIO-DB-003)

- driver `pg@8.23.0` (`@types/pg@8.23.1`) pinado; `@vercel/postgres` segue no `package.json`
  para o rollback da F5 e não é mais importado por ninguém.
- `src/lib/diagnostico/banco.ts` no ar: pool único por processo, `max: 5`,
  `idleTimeoutMillis: 30_000`, `connectionTimeoutMillis: 5_000`, `statement_timeout: 15_000`.
  Os 8 arquivos de `src/` passaram a importar `sql` dele; nenhuma query mudou.
- `scripts/diagnostico/banco.mjs` (`abrirCliente`) atende os 8 scripts; `aplicar-schema.mjs`
  passou a listar os 9 `.sql` (entraram `reembolso`, `documento-html` e `fila-trava`);
  `inventariar-banco.mjs` entrou, só leitura, com `--resumo` para diff origem/destino.
- `deploy/vps/validate-env.mjs`: `POSTGRES_URL_NON_POOLING` opcional, ainda conferida quando
  presente.
- mutante provado: import de `@vercel/postgres` plantado em `src/lib/diagnostico/mapa-db.ts`
  reprovou `driver-neon-ausente.test.ts` (`culpados` = `[src/lib/diagnostico/mapa-db.ts]`);
  removido, o teste voltou a passar.
- `npm test`: 428 passaram, 4 pulados (integração sem `TEST_POSTGRES_URL`), 3 vermelhos de
  baseline herdados (`contrato-brain` por divergência de enum com o brain; `instalar` e
  `tests/deploy/validate-env` por CRLF do checkout Windows). `npx eslint .` sem achado novo
  (os 2 erros em `scripts/club/build-club-html.js` são de baseline). `npx next build` verde,
  inclusive sem `POSTGRES_URL` no ambiente.
- integração executada pelo orquestrador em 19/09 contra um `postgres:17.11` descartável na VPS
  (túnel ssh em loopback): 4 casos verdes (schema em banco vazio cria as 14 tabelas, segundo run
  no-op, reserva concorrente, `--resumo` com uma linha por tabela); container removido depois.

### 2026-09-19, F3 e F4 (WO-FORMULARIO-DB-004)

- **AC-05.** Dump `-Fc` do Neon vivo às 07:20:30 UTC (240.549 bytes, 13,1 s, URL só em variável
  de ambiente), `pg_restore --list` com as 14 tabelas, restore em container descartável
  `postgres:17.11` sem rede, `--exit-on-error` com exit 0 e diff vazio das 15 linhas de contagem
  (14 tabelas somando 806 linhas + `seq:tentativas_acesso_id_seq,118`), idênticas à origem no
  instante do dump. Contraexemplo: uma linha plantada em `painel_config` e o diff acusa. Container
  e volume removidos; `formulario-db` de produção seguiu vazio e healthy. `df -h /` 81% antes e
  depois.
- **o restore exige duas flags, e uma não estava prevista:** `--no-comments` (o
  `COMMENT ON EXTENSION pgcrypto` falha sob `--role=formulario`) e `--no-acl` (o dump do Neon
  carrega ACL para `cloud_admin` e `neon_superuser`, roles inexistentes fora de lá). O remédio
  previsto de filtrar por `pg_restore -l` e `-L` não serviria: `--list` não mostra entradas de
  ACL. `DADOS-E-APIS.md` §4 reescrito.
- **AC-06.** `backup.sh`, `restore-drill.sh` e `contar-tabelas.sh` em
  `deploy/vps/formulario-db/`; cron diário 03:15 com `ops-alert.sh` em falha (crontab salvo antes
  em `~/backups/crontab.bak.20260919T072922Z`); primeira execução real exit 0 no ambiente enxuto
  do cron, deixando `.dump.age`, `.sha256` e `.resumo` em 600 dentro de um diretório 700, sem
  `.dump` em claro; drill real com 806 linhas e diff vazio (2,2 s); byte trocado no dump derruba
  o drill no `sha256sum -c` com exit 2; alerta provado na ponta, execução `193163` do workflow
  `OPS - alert (email Yan)` com `status=success` no instante da falha forçada. `df -h /` 81%.
- **lacuna de chave confirmada:** a privada `age` não está na VPS, só a recipient pública. Por
  isso o drill diário roda dentro do `backup.sh`, sobre o dump em claro, antes de cifrar, e o
  caminho do `.dump.age` exige `AGE_IDENTITY`. R1 (offsite) segue aberto. `DADOS-E-APIS.md` §6
  reescrito; runbook em `deploy/vps/README.md`.
- **invariante nova para a F6:** depois da F5, um backup com `0 tabelas` passaria verde, porque o
  drill compara o dump com o resumo do próprio dump. Gate não construído (fora do AC-06);
  registrado na WO-004 como lacuna nomeada.

### 2026-09-19, F5 (WO-FORMULARIO-DB-005)

- **janela.** `T0` 07:51:32Z, `T1` 07:52:22Z, `T2` 07:56:34Z: 4 min e 12 s fechada, contra o alvo
  de 15 min. Durante a janela, 503 com `Retry-After: 600` em `POST /api/diagnostico/parcial`,
  `POST /api/diagnostico/cal-webhook`, `/leads` e `/leads/entrar`; `/api/health` 200 e as páginas
  públicas 200, então o health check do Caddy não derrubou o upstream. Bloco removido restaurando
  o backup do Caddyfile, com `diff` provando que o arquivo voltou byte a byte ao estado anterior.
- **dados.** `pg_dump -Fc` do Neon vivo às 07:52:51Z: 240.549 bytes em 14 s, idêntico em tamanho
  ao da F3. `pg_restore --no-owner --role=formulario --no-comments --no-acl --exit-on-error` no
  `formulario-db` de produção: exit 0 em 1 s. Diff das 15 linhas de contagem entre origem e
  destino **vazio** (14 tabelas somando 806 linhas mais `seq:tentativas_acesso_id_seq,118`).
  Dono das tabelas no destino: `formulario`, uma única linha. Extensões: `pgcrypto`, `plpgsql`.
- **origem congelada.** `ALTER DATABASE neondb SET default_transaction_read_only = on`, provado em
  sessão nova: `cannot execute CREATE TABLE in a read-only transaction`.
- **env e release.** Env trocado com backup timestampado em 600; só os valores de `POSTGRES_URL` e
  `POSTGRES_URL_NON_POOLING` mudaram (diff por chave vazio); `validate-env.mjs` verde. `deploy.sh`
  em 89 s, health 200 com `release` `79f7f26264e7`.
- **a senha da app precisa ir percent-encoded, e isso não estava no pacote.** A senha é base64 de
  44 bytes e contém `/`: numa URL crua, tanto o parser do libpq quanto o do `pg` encerram a
  autoridade no primeiro `/` e leem o pedaço anterior como host e porta, falhando com
  `invalid integer value ... for connection option "port"`. Com `+`, `/` e `=` escritos como
  `%2B`, `%2F` e `%3D`, a conexão abre normal. Medido antes da janela contra o banco vazio.
- **smoke pós-corte.** Interno, pelo container, antes de reabrir: fila autenticada 200 em 102 ms
  (era ~0,9 s pelo Neon), fila sem segredo 401, `/leads/entrar` 200, `cal-webhook` sem assinatura
  401, `mapa-pago/webhook` sem assinatura 401, `POST /api/diagnostico/parcial` 204 com
  `sessao_id` sintético, `count` igual a 1 no `formulario-db` e igual a 0 depois do `delete`,
  com o total de `parciais` voltando a 44. Público depois de reabrir: `smoke.mjs` verde nos dois
  hosts, 69 checagens cada, pior latência 63 ms.
- **o 204 do `parcial` não prova escrita.** A rota engole erro de persistência de propósito (é
  telemetria, não caminho crítico) e devolve 204 do mesmo jeito. A prova é a contagem no banco,
  não o código HTTP.
- **worker.** `/home/infuser/yan-site-funil` movido de `cfb0e9c0cad6` para `79f7f26264e7`,
  `PAUSA_ENTRE_CONSULTAS_MS = 60_000` conferido no arquivo, unit reiniciada, log com
  `intervalo=60s` e primeira chamada da fila 200 em 13 ms, 11 s depois de `T2`.
- **reconciliação.** Nenhum agendamento nas 3 h seguintes no instante do `T0`, nenhum roteiro em
  voo (21 `concluido`, 1 `falhou`). Na janela, o access log do Caddy tem 31 requisições, e todas
  as 6 que bateram nas rotas fechadas foram as próprias provas desta ordem; zero POST de Cal ou
  Stripe de verdade, zero 5xx fora do 503 desenhado. `agendamentos` criados depois de `T1`: 0.
  **Não verificado:** a API do Cal não foi consultada porque não existe chave `CAL_API*` no env
  da VPS, então a lista de bookings criados ou alterados na janela fica sem contraprova
  independente; e o evento de teste do Stripe depende do painel, que é do Yan.
- **`X-Roteiro-Secret` vai em claro para o access log do Caddy.** O `format json` registra os
  headers da requisição, e o segredo do worker aparece em texto em
  `/var/log/caddy/useinfuser.access.log`, que fica em disco com retenção própria. Achado desta
  janela, anterior a ela e fora do escopo desta fatia; o remédio barato é um `log { ... }` com
  os headers sensíveis redigidos.
