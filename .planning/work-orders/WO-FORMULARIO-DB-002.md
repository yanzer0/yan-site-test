---
work_order: WO-FORMULARIO-DB-002
status: active
central_branch: claude/formulario-db-f1
owner: Opus 5 (executor) / Claude (validador)
authorized_by: Yan
authorized_at: 2026-09-19
scope_lock:
  version: 1
  base_commit: 850f53351f7a34f5846524ec060defe380f869d3
  allowed_write_globs:
    - .planning/work-orders/WO-FORMULARIO-DB-002.md
    - deploy/vps/compose.prod.yml
    - deploy/vps/deploy.sh
    - deploy/vps/README.md
    - deploy/vps/formulario-db/**
    - specs/008-formulario-db-postgres-vps/**
  architecture_delta:
    production_files:
      - deploy/vps/compose.prod.yml
      - deploy/vps/deploy.sh
      - deploy/vps/formulario-db/init/01-formulario.sh
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces:
      - volume formulario-db-data
      - rede docker formulario-net (internal)
    background_jobs: []
  acceptance_ids:
    - AC-02
  stop_when:
    - AC-02
  passed_acceptance_ids: [AC-02]
---

# WO-FORMULARIO-DB-002: F1, o banco `formulario-db` no Compose e vivo na VPS

## Autorização

Yan, 19/09/2026: "go pra todas, vá até o fim". Pacote: `specs/008-formulario-db-postgres-vps/`
(`README.md` decisões congeladas 1 a 3, `ARQUITETURA.md` §4.1, §4.2, §6, `DADOS-E-APIS.md` §3,
`PLANO-DE-IMPLEMENTACAO.md` §4 F1, `VERIFICACAO-E-OPERACAO.md` §2, §4, §8).

## Escopo

Serviço `formulario-db` (`postgres:17.<minor>` pinado após `docker pull` na VPS, digest
registrado), rede `formulario-net` `internal: true`, volume `formulario-db-data`, secrets de senha
admin e app em arquivos 600 em `/home/infuser/.config/useinfuser/`, init de role `formulario`
(LOGIN, sem SUPERUSER/CREATEDB/CREATEROLE), banco `formulario` e extensão `pgcrypto`, healthcheck
`pg_isready`, limites, `TZ`/`PGTZ` UTC, `depends_on` no site com `condition: service_healthy`,
`deploy.sh` subindo o banco e esperando health antes do site. O site continua apontando para o
Neon; nenhum env do site muda nesta ordem.

## Fora do escopo

Driver, env do site, dump, restore, backup, Caddy, worker, Neon. Nunca `docker compose down`,
nunca `-v`, nunca tocar em `useinfuser.env`.

## Critérios de aceite

| ID | Critério | Prova exigida |
|---|---|---|
| AC-02 | `formulario-db` healthy na VPS, isolado, role sem privilégio de cluster, site healthy no Neon, disco medido | `docker inspect formulario-db` sem `PortBindings` e com `cap_drop`; `docker network inspect formulario-net` só com `formulario-db` e `useinfuser-site` e `Internal: true`; `select rolname, rolsuper, rolcreatedb, rolcreaterole from pg_roles where rolname='formulario'` = `f f f`; `select extname from pg_extension` no banco `formulario` contém `pgcrypto`; `docker compose config --quiet` limpo; `df -h /` antes e depois; `GET /api/health` 200 e `docker ps` do site `healthy`; tag e digest da imagem registrados |

## Evidência

Executada em 2026-09-19 na VPS (`vps-infuser`), checkout de produção
`/home/infuser/useinfuser-site` em `ef861b299f8825d3ecadbeddd9a835a7d7558552`. Nenhuma senha, URL
de conexão ou conteúdo de env aparece abaixo.

### Imagem pinada

`docker run --rm postgres:17 postgres --version`:

```
postgres (PostgreSQL) 17.11 (Debian 17.11-1.pgdg13+2)
```

`docker image inspect postgres:17.11`:

```
RepoTags=["postgres:17","postgres:17.11"]
RepoDigests=["postgres@sha256:a6ec007920913e8d715a41e68a17b05ddf30e62d69565814988a896767594cc6"]
```

`postgres:17` e `postgres:17.11` resolvem para o mesmo digest, e 17.11 é exatamente a versão da
origem Neon (`INVENTARIO-F0.md`), então o restore da F3 não cruza minors.

### `docker compose config --quiet`

Exit 0, sem saída, com `USEINFUSER_ENV_FILE` apontando para o env de produção.

### Init (primeiro boot do volume)

`docker logs formulario-db`:

```
2026-09-19 07:03:07.865 UTC [49] LOG:  database system is ready to accept connections
/usr/local/bin/docker-entrypoint.sh: running /docker-entrypoint-initdb.d/01-formulario.sh
formulario-db init: role formulario, database formulario and pgcrypto are ready
2026-09-19 07:03:08.308 UTC [1] LOG:  database system is ready to accept connections
```

Sem `FATAL`, sem `ERROR`, sem `Permission denied`.

### `docker inspect formulario-db`

```
PortBindings={}
Ports={"5432/tcp":null}
CapDrop=["ALL"]
CapAdd=["CAP_CHOWN","CAP_DAC_OVERRIDE","CAP_FOWNER","CAP_SETGID","CAP_SETUID"]
SecurityOpt=["no-new-privileges:true"]
Memory=536870912 ShmSize=134217728 PidsLimit=128 Restart=unless-stopped
Image=postgres:17.11
Health=healthy
Redes=formulario-net
```

`docker port formulario-db`: saída vazia (nenhum mapeamento para o host).

### `docker network inspect formulario-net`

```
Internal=true Driver=bridge Containers=useinfuser-site formulario-db
```

`docker inspect useinfuser-site` redes: `formulario-net useinfuser-net`.

### Role, extensão, versão e dono

```
$ docker exec formulario-db psql -U postgres -d formulario -Atc "select rolname, rolsuper, rolcreatedb, rolcreaterole from pg_roles where rolname='formulario'"
formulario|f|f|f

$ docker exec formulario-db psql -U postgres -d formulario -Atc "select extname from pg_extension"
pgcrypto
plpgsql

$ docker exec formulario-db psql -U postgres -d formulario -Atc "select version()"
PostgreSQL 17.11 (Debian 17.11-1.pgdg13+2) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit

$ docker exec formulario-db psql -U postgres -Atc "select datname, pg_get_userbyid(datdba), datacl from pg_database where datname='formulario'"
formulario|formulario|{formulario=CTc/formulario}

$ docker exec formulario-db psql -U postgres -d formulario -Atc "show timezone"
UTC
```

`datacl` sem entrada de `PUBLIC` prova o `REVOKE ALL ON DATABASE formulario FROM PUBLIC`.

### Contraexemplos

1. **De fora da rede o banco não é alcançável.**

   ```
   $ docker run --rm --network useinfuser-net postgres:17.11 pg_isready -h formulario-db -p 5432 -t 3
   formulario-db:5432 - no response
   exit=2

   $ docker run --rm --network useinfuser-net postgres:17.11 sh -c "getent hosts formulario-db || echo NAO_RESOLVE"
   NAO_RESOLVE
   ```

2. **Nenhuma porta publicada pelo `formulario-db`.** `nc -z 127.0.0.1 5432` **abre**, mas o
   listener não é desta fatia: é o container `postgres` pré-existente (n8n/infuser), o único com
   publicação no host.

   ```
   $ ss -ltn | grep 5432
   LISTEN 0      4096       127.0.0.1:5432       0.0.0.0:*

   $ docker ps --format "{{.Names}}\t{{.Ports}}" | grep 5432
   formulario-db        5432/tcp
   cnpj-db              5432/tcp
   twenty-db            5432/tcp
   chatwoot-postgres-1  5432/tcp
   postgres             127.0.0.1:5432->5432/tcp
   ```

   Só `postgres` tem `->`; `formulario-db` é `5432/tcp` (exposto na rede interna, não publicado).

3. **A role da app não tem privilégio de cluster.**

   ```
   $ docker exec formulario-db psql -U formulario -d formulario -Atc "CREATE DATABASE proibido"
   ERROR:  permission denied to create database

   $ docker exec formulario-db psql -U formulario -d formulario -Atc "CREATE ROLE proibido LOGIN"
   ERROR:  permission denied to create role
   DETAIL:  Only roles with the CREATEROLE attribute may create roles.
   ```

### Site e disco

```
$ docker ps
useinfuser-site | Up About a minute (healthy) | useinfuser-site:ef861b299f88
formulario-db   | Up 2 minutes (healthy)      | postgres:17.11

$ curl -s -o /dev/null -w '%{http_code}' https://www.useinfuser.com/api/health
200
```

O site continua apontando para o Neon: `/home/infuser/.config/useinfuser/useinfuser.env` segue
`mode=600` com `mtime=2026-09-09 10:37:00`, não foi lido nem escrito nesta fatia.

`df -h /`:

| Momento | Size | Used | Avail | Use% |
|---|---|---|---|---|
| antes (início da sessão) | 193G | 152G | 42G | 79% |
| depois | 193G | 156G | 38G | 81% |

Os ~4 GB são a imagem `postgres:17.11` (~450 MB), duas imagens novas do site e o volume do banco
(40 MB). Segue abaixo do alarme de 85% do `disk-check.sh`, mas com folga menor: vale registrar
como risco de acompanhamento na F3 e na F4, que trazem dumps.

### Segredos

Criados na VPS com `umask 077` e `openssl rand -base64 32`; conteúdo nunca lido, impresso ou
versionado.

```
$ stat -c "%n %a %U:%G %s bytes" /home/infuser/.config/useinfuser/formulario-db-{admin,app}.password
/home/infuser/.config/useinfuser/formulario-db-admin.password 600 infuser:infuser 44 bytes
/home/infuser/.config/useinfuser/formulario-db-app.password 600 infuser:infuser 44 bytes
```

Gate transversal: `git diff 850f5335..HEAD` sem e-mail, telefone ou string de conexão (o único
casamento do grep é o digest público da imagem).

## Desvios do pacote

Os dois primeiros só apareceram porque a primeira subida foi executada e inspecionada; ambos
estão registrados em `specs/008-formulario-db-postgres-vps/ARQUITETURA.md` §10.

1. **Secret ilegível pelo init (corrigido em `ef861b2`).** O `docker-entrypoint.sh` lê
   `POSTGRES_PASSWORD_FILE` como root, mas cai para o usuário `postgres` (999) antes de rodar
   `/docker-entrypoint-initdb.d`. O secret chega do host como 600 do uid 1000, então o init
   falhou com `cat: /run/secrets/db_app_password: Permission denied`, o container morreu, o
   `restart: unless-stopped` subiu de novo e o Postgres pulou a inicialização por já existir
   PGDATA: cluster de pé, role ausente. Medido que o Compose fora do Swarm **ignora**
   `uid`/`gid`/`mode` em `secrets` (`warning: secrets uid, gid and mode are not supported, they
   will be ignored`), então a saída foi o `entrypoint` do serviço copiar o secret como root
   (`install -o postgres -g postgres -m 0400`) para `/tmp/db_app_password` e dar
   `exec docker-entrypoint.sh postgres`. O arquivo no host continua 600.

2. **Healthcheck do pacote dava falso verde (corrigido em `ef861b2`).**
   `pg_isready -U formulario -d formulario` devolveu `accepting connections` e exit 0 com a role
   `formulario` inexistente - ele prova que o servidor responde, não que a role ou o banco
   existem. Foi esse falso verde que deixou o `deploy.sh` concluir com o banco quebrado. O
   healthcheck passou a ser `pg_isready ... && psql -U formulario -d formulario -Atc 'select 1'`.
   Invariante correspondente acrescentada em `VERIFICACAO-E-OPERACAO.md` §2.

3. **Init é `.sh`, não `.sql`.** O `.sql` do §4.2 não lê `/run/secrets/*` sozinho; o próprio §4.2
   já descrevia o shell. O SQL é o mesmo, em heredoc, com `\getenv` lendo a senha do ambiente e
   `:'app_password'` citando o literal: a senha nunca entra em argv nem em string SQL.

4. **Capabilities do §6 bastaram**, sem acréscimo: `cap_drop: [ALL]` mais `CHOWN`,
   `DAC_OVERRIDE`, `FOWNER`, `SETGID` e `SETUID` subiram o cluster e rodaram o init.

## Ação destrutiva executada (reportada)

Para o init rodar de verdade foi preciso recriar o volume: o Postgres só executa
`/docker-entrypoint-initdb.d` no primeiro boot do PGDATA. Removido com alvo nomeado
(`docker stop formulario-db && docker rm formulario-db && docker volume rm formulario-db-data`),
**nunca** `docker compose down` e **nunca** `-v`. O volume tinha 8 minutos de vida e nenhum dado:
antes de apagar, `select datname from pg_database` devolvia só `postgres`, `template0` e
`template1`, e `docker ps -a --filter volume=formulario-db-data` listava só o `formulario-db`. Os
dados do funil seguem no Neon, intocados.

## Gotcha operacional

O remote do checkout de produção tem refspec restrita a `main`
(`+refs/heads/main:refs/remotes/origin/main`), então `git fetch origin` **não** traz branch de
fatia. Para conferir em produção é preciso a refspec explícita:

```bash
git fetch origin "+refs/heads/<branch>:refs/remotes/origin/<branch>"
```

Produção está em HEAD destacado no commit da fatia, não em `main`. O merge para `main` é do
orquestrador.
