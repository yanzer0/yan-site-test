---
tags: [engenharia, arquitetura, postgres, docker, vps, funil]
status: ready
version: 1.0
updated: 2026-09-19
---

# Arquitetura: `formulario-db` na VPS

## 1. Princípios e restrições

- Um banco por produto, mesma lei do CRM: falha, migration errada ou `DROP` num banco não alcança
  outro.
- O banco nunca tem porta publicada; a única rota de entrada é a rede Docker `formulario-net`.
- A aplicação nunca é superuser. Init, dump e restore usam `docker exec` no container como
  `postgres`, sem senha trafegando.
- Sem dual-write: a janela é curta e as escritas são recusadas na borda, nunca enfileiradas.
- O contrato do código com o banco fica atrás de um único módulo; o resto de `src/` não sabe qual
  driver está por baixo.
- Nada de PII em log, smoke, chat ou git. O dump é o único artefato com dado pessoal e mora em
  diretório 700 e destino cifrado.

## 2. Contexto e fronteiras

```mermaid
flowchart LR
  lead[Lead / navegador] --> caddy[Caddy]
  cal[Cal.com webhook] --> caddy
  stripe[Stripe webhook] --> caddy
  worker[servico-roteiro (unit roteiro)] --> caddy
  caddy --> site[useinfuser-site :3000]
  site -- formulario-net --> db[(formulario-db postgres:17)]
  db --> vol[(volume formulario-db-data)]
  cron[cron infuser] -- docker exec pg_dump --> db
  cron --> dump[~/backups/formulario/*.dump.age]
  neon[(Neon formulario-b2b, read-only 7d)] -. rollback ate F7 .-> site
```

| Fronteira | Hoje | Alvo | Muda? |
|---|---|---|---|
| Navegador, Cal, Stripe, worker -> Caddy -> site | HTTPS | HTTPS | Não. |
| site -> banco | HTTP/WebSocket para `us-east-1` via `@vercel/postgres` | TCP em `formulario-net` via `pg` | Sim. |
| Caddy -> banco | inexistente | inexistente | Não; Caddy não entra em `formulario-net`. |
| n8n, painel interno, outros containers -> banco | inexistente | inexistente | Não. |
| cron -> banco | inexistente | `docker exec formulario-db pg_dump` | Sim (novo). |

## 3. Estado atual verificado

Ver `README.md` §Fatos e `INVENTARIO-F0.md`. Em resumo: um serviço `site` no Compose
`useinfuser-site`, rede `useinfuser-net`, env em arquivo 600 injetado por `env_file` e BuildKit
secret, deploy por `deploy.sh` (`up -d --no-deps site`), 14 tabelas e 9,2 MB no Neon 17.11.

## 4. Arquitetura alvo

### 4.1 Compose (`deploy/vps/compose.prod.yml`)

| Serviço | Imagem | Rede | Volume | Limites | Health |
|---|---|---|---|---|---|
| `formulario-db` | `postgres:17.<minor>` pinado na F1 | `formulario-net` | `formulario-db-data:/var/lib/postgresql/data` | `mem_limit: 512m`, `shm_size: 128m`, `pids_limit: 128`, `restart: unless-stopped` | `pg_isready -U formulario -d formulario`, 10 s |
| `site` (existente) | `useinfuser-site:${APP_RELEASE}` | `useinfuser-net` + `formulario-net` | nenhum | como hoje | como hoje + `depends_on: formulario-db: condition: service_healthy` |

- `formulario-net`: `driver: bridge`, `internal: true` (sem saída para a internet; o banco não
  precisa de egress). O site continua com egress por `useinfuser-net`.
- Senha do superuser `postgres` via `POSTGRES_PASSWORD_FILE=/run/secrets/db_admin_password`
  (secret do Compose apontando para arquivo 600 em `/home/infuser/.config/useinfuser/`). O
  superuser só é usado por `docker exec` (trust no socket Unix interno); a senha existe para o
  caso de precisar de TCP admin um dia.
- `TZ=UTC` e `PGTZ=UTC` explícitos; o Neon serve em GMT.
- `deploy.sh`: `docker compose up -d formulario-db` antes de `up -d --no-deps site`; espera o
  health do banco antes de subir o site. Nunca `down`, nunca `-v`.

### 4.2 Init (`deploy/vps/formulario-db/init/01-formulario.sql`, roda só no primeiro boot do volume)

```sql
CREATE ROLE formulario LOGIN PASSWORD :'app_password' NOSUPERUSER NOCREATEDB NOCREATEROLE;
CREATE DATABASE formulario OWNER formulario ENCODING 'UTF8';
\connect formulario
CREATE EXTENSION IF NOT EXISTS pgcrypto;
REVOKE ALL ON DATABASE formulario FROM PUBLIC;
```

A senha da aplicação vem de `/run/secrets/db_app_password` lida pelo script de init do
`docker-entrypoint-initdb.d` (shell que injeta a variável no `psql -v`). O mesmo valor entra em
`POSTGRES_URL` do env do site. Dois arquivos 600, nenhum no git.

### 4.3 Driver (`src/lib/diagnostico/banco.ts`, novo)

Um `Pool` do `pg` (`max: 5`, `idleTimeoutMillis: 30_000`, `connectionTimeoutMillis: 5_000`,
`statement_timeout` de 15 s via `options`), criado uma vez por processo, lendo `POSTGRES_URL`.
Exporta `sql` como tagged template que converte interpolações em `$1..$n` e `sql.query(text,
params)`, ambos devolvendo `{ rows, rowCount }` como o pacote atual. Erros sobem como
`ErroPersistencia` já existente, com `operacao` e causa, sem PII. Scripts em
`scripts/diagnostico/` usam `new Client({ connectionString })` do mesmo `pg`, atrás de um helper
`abrirCliente()` no mesmo módulo, para não repetir a leitura de env oito vezes.

### 4.4 Janela de corte (Caddy)

Bloco temporário no `Caddyfile.block`, aplicado com backup, `caddy validate` e reload:

```caddyfile
@janela path /api/diagnostico/* /leads /leads/*
handle @janela {
    header Retry-After "600"
    respond "manutencao programada" 503
}
```

Removido com o mesmo rito ao reabrir. O restante do site continua servido; `/api/health` continua
200 (não consulta o banco), então o healthcheck do Caddy não derruba o upstream.

## 5. Fluxos críticos

| Fluxo | Hoje | Depois | Risco na janela | Como fecha |
|---|---|---|---|---|
| `POST /api/diagnostico/submit` | lead + respostas + avaliação no Neon | mesmo, em `formulario-db` | 503 ao lead | Janela em horário morto; formulário mostra o estado de erro existente. |
| `POST /api/diagnostico/parcial` | upsert por `sessao_id` | mesmo | 503 | Preenchimento parcial se perde só na janela; aceitável. |
| `POST /api/diagnostico/cal-webhook` | HMAC + upsert `agendamentos` + enfileira `roteiros` | mesmo | 503 ao Cal | Reentrega (hipótese) + reconciliação por API do Cal na reabertura. |
| `POST /api/diagnostico/mapa-pago/webhook` | assinatura Stripe + upsert `pedidos_mapa` | mesmo | 503 ao Stripe | Stripe reentrega por até 3 dias; evento de teste na reabertura. |
| `GET /api/diagnostico/roteiro/fila` (worker) | reserva com `FOR UPDATE SKIP LOCKED` | mesmo | 503 ao worker | Worker já trata erro com pausa de 30 s; nada é reservado. |
| `POST /api/diagnostico/roteiro/concluir` | grava roteiro/PDF | mesmo | 503 | Item em voo repete na próxima rodada; `ON CONFLICT` protege. |
| `/leads*` (painel) | sessão + leitura | mesmo | 503 ao time | Avisar no grupo antes; janela ≤ 15 min. |
| `GET /api/health` | sem banco | sem banco | nenhum | Caddy mantém o upstream. |

## 6. Segurança e privacidade

- Rede `internal: true`, sem `ports`, `cap_drop: [ALL]` mais `CHOWN`, `SETUID`, `SETGID`,
  `DAC_OVERRIDE` e `FOWNER` (os que o entrypoint do Postgres precisa), `no-new-privileges`.
- Role `formulario` dona do banco, sem privilégio de cluster. Superuser não sai do socket.
- Segredos em dois arquivos 600 fora do git; Compose os lê por `secrets`. `validate-env` continua
  bloqueando build com env malformado ou duplicado.
- Dump em `~/backups/formulario/` (700), cifrado com `age` antes de sair da máquina, sha256 ao
  lado. Nunca em log, chat ou git (grep no diff e nos logs de deploy é gate).
- Logs do Postgres em `json-file` com rotação (10 MB x 3), `log_min_messages = warning`, sem
  `log_statement`.

## 7. Disponibilidade, capacidade e custo

- Dado: 9,2 MB hoje, dezenas de leads por mês. `mem_limit` 512 MiB sobra; `shared_buffers` 128 MB.
- Disco: volume sem quota (Docker local). Teto operacional = alarme a 85% (`disk-check.sh`) +
  retenção de dumps 14 dias (≤ 14 x ~10 MB cifrado). `df -h /` em cada gate.
- Custo: zero adicional; some o risco de fatura Neon por CU-hora.
- Ponto único de falha: a VPS já é. Mitigação = backup cifrado diário, restore drill e Neon
  read-only durante o soak; o offsite definitivo depende de R1.

## 8. Compatibilidade, rollout e recuperação

- Nenhum contrato público muda. `POSTGRES_URL_NON_POOLING` passa a ser opcional (default =
  `POSTGRES_URL`); manter os dois iguais no env é compatível com o `validate-env` atual até a F2.
- Rollout em fatias F1 a F7 (`PLANO-DE-IMPLEMENTACAO.md`); F1 e F2 não tocam o caminho vivo.
- Rollback da F5: env de volta ao Neon (que ficou read-only e não recebeu escrita), restart do
  site, remover o bloco de janela. Menos de 5 min. Depois da F7, rollback é restore do dump.

## 9. Fitness functions

| Função | Como mede | Onde roda |
|---|---|---|
| Nenhum `@vercel/postgres` em `src/` e `scripts/` | teste estático (grep do source) | Vitest, F2 em diante |
| Banco sem porta publicada e só duas pontas na rede | `docker inspect` + `docker network inspect` | smoke da F1 e da F5 |
| Role da app sem superuser/createdb/createrole | `select rolsuper, rolcreatedb, rolcreaterole from pg_roles` | smoke da F1 |
| Contagem por tabela origem = destino | `inventariar-banco.mjs` nos dois lados + diff | F3 e F5 |
| Backup restaura | restore drill em container descartável | F4 e mensal |
| Worker a 60 s e sem long-poll | guard existente do `fila-worker.test.ts` (parte mantida) | Vitest |
| Sem PII em artefato de deploy | grep de `@` e de telefone nos logs e no diff | gate de cada WO |

## 10. Divergências e decisões pendentes

- A decisão de 19/09 no brain diz `postgres:16`; a F0 provou 17.11 no Neon. Este pacote fixa a
  série 17 e o brain é corrigido na mesma sessão.
- Destino offsite definitivo do dump: pendente de R1; não bloqueia F1 a F6.
- F1, 19/09: o init é `deploy/vps/formulario-db/init/01-formulario.sh`, não `01-formulario.sql`.
  O `.sql` do §4.2 não consegue ler `/run/secrets/db_app_password` sozinho; o próprio §4.2 já
  descrevia o shell. O SQL é o mesmo, num heredoc, com `\getenv` lendo a senha do ambiente e
  `:'app_password'` citando o literal - a senha nunca entra em argv nem em string SQL.
- F1, 19/09: minor pinado = `postgres:17.11`
  (`sha256:a6ec007920913e8d715a41e68a17b05ddf30e62d69565814988a896767594cc6`), o mesmo 17.11 da
  origem Neon, o que remove o risco de restore entre minors diferentes na F3.
