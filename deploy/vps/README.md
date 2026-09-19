# Deploy do useinfuser.com na VPS

## Premissas

- checkout limpo do commit a publicar;
- Docker/Compose e Caddy já ativos;
- env de produção em `/home/infuser/.config/useinfuser/useinfuser.env`, modo 600;
- Caddy conectado às redes externas `useinfuser-net` e `skilltree-net`;
- DNS só muda depois do smoke interno.

## Deploy da aplicação

```bash
git fetch origin
git checkout <commit-ou-branch-autorizado>
USEINFUSER_ENV_FILE=/home/infuser/.config/useinfuser/useinfuser.env ./deploy/vps/deploy.sh
```

O script valida o Compose, constrói a imagem com o env como BuildKit secret, sobe apenas o container do site, espera o healthcheck e executa o inventário de rotas internamente.

## Banco `formulario-db`

Postgres 17.11 dedicado ao funil de diagnóstico (`specs/008-formulario-db-postgres-vps/`). Sem
porta publicada: a única entrada é a rede interna `formulario-net`, onde só o `useinfuser-site`
também está. Superuser `postgres` só por `docker exec`; a aplicação conecta como `formulario`,
dona do banco e sem privilégio de cluster.

Dois segredos, fora do git, modo 600, criados uma vez:

```bash
umask 077
openssl rand -base64 32 | tr -d '
' > /home/infuser/.config/useinfuser/formulario-db-admin.password
openssl rand -base64 32 | tr -d '
' > /home/infuser/.config/useinfuser/formulario-db-app.password
```

Os caminhos podem ser sobrescritos por `FORMULARIO_DB_ADMIN_PASSWORD_FILE` e
`FORMULARIO_DB_APP_PASSWORD_FILE`. Nunca imprima, copie nem versione o conteúdo.

O `entrypoint` do serviço copia o secret da app como root para `/tmp/db_app_password` antes de
chamar o `docker-entrypoint.sh`: o init roda como `postgres` (uid 999) e o arquivo do host é 600
do uid 1000. Compose fora do Swarm ignora `uid`/`gid`/`mode` em `secrets`, então a cópia é o
caminho; não afrouxe o arquivo no host.

`deploy/vps/formulario-db/init/01-formulario.sh` roda **só no primeiro boot do volume**
`formulario-db-data`: cria a role `formulario`, o banco `formulario` e a extensão `pgcrypto`, e
revoga `PUBLIC` no banco. Com o volume já existente ele não roda de novo; mudança de schema é
migration, não init.

O healthcheck é `pg_isready` **mais** um `select 1` como `formulario`: sozinho, o `pg_isready`
responde `accepting connections` mesmo com a role ausente, e esse falso verde já deixou um deploy
passar com o banco vazio de role.

O `deploy.sh` sobe o banco e espera `healthy` (teto de 120 s) antes de construir e recriar o site.
Para subir só o banco:

```bash
APP_RELEASE=$(git rev-parse --short=12 HEAD) USEINFUSER_ENV_FILE=/home/infuser/.config/useinfuser/useinfuser.env docker compose -f deploy/vps/compose.prod.yml up -d formulario-db
```

O que **não** fazer: `docker compose down` (derruba o site junto), qualquer `-v` (apaga o volume
de dados), publicar porta, ligar o banco em `useinfuser-net` ou em qualquer rede com egress, e
rodar `psql` com senha em linha de comando. Dump e restore são por `docker exec` como `postgres`,
e o artefato vai para `~/backups/formulario/` (700), nunca para log, chat ou git.

## Backup e drill do `formulario-db`

Todo dia às 03:15 (entre o backup principal das 03:00 e o do MCP das 03:30) o cron roda
`deploy/vps/formulario-db/backup.sh /home/infuser/backups/formulario`. Falha alta dispara
`ops-alert.sh "backup-formulario" "critico"`, e a saída vai para
`~/logs/backup-formulario.log`.

Cada execução deixa três arquivos com o mesmo prefixo `formulario-<utc>-<release>` em
`~/backups/formulario/` (diretório 700, arquivos 600): o dump `-Fc` cifrado (`.dump.age`), o
`sha256` do dump em claro (`.sha256`) e o resumo de contagens `tabela,linhas` mais o `last_value`
de cada sequência (`.resumo`). O dump em claro nunca sobrevive ao script, nem em falha: ele tem
e-mail e WhatsApp. Retenção de 14 dias.

O drill roda dentro do backup, antes de cifrar, e é o que impede backup verde que não restaura:
`restore-drill.sh` sobe um `postgres` descartável sem rede, cria a mesma role, banco e extensão
que o init cria, restaura com `--exit-on-error` e compara as contagens com o `.resumo`. Container
e volume somem em qualquer saída. Um byte trocado no dump derruba o drill no `sha256sum -c`.

Dois detalhes do `pg_restore` que são obrigatórios e foram medidos: `--no-comments`, porque
`COMMENT ON EXTENSION pgcrypto` falha sob `--role=formulario` (a role não é dona da extensão), e
`--no-acl`, porque o dump vindo do Neon carrega `GRANT` para `cloud_admin` e `neon_superuser`,
roles que não existem fora de lá. Com `--no-owner --role=formulario`, quem manda no acesso é a
propriedade, não a ACL de origem.

**A chave privada `age` não está nesta VPS.** Só a recipient pública está, em
`~/.config/age/recipients.txt`. A privada mora no gerenciador de senhas, protegida por
passphrase, do mesmo jeito que o backup principal (ver o runbook em `/opt/infuser-brew/kb/`).
Consequência honesta: enquanto o `.age` continuar sem par de chave aqui, perder a VPS inteira
significa depender do gerenciador de senhas, e é por isso que o drill diário roda no dump em
claro em vez de no cifrado. Para restaurar de verdade a partir de um `.age`, traga a chave e
rode:

```bash
AGE_IDENTITY=/caminho/da/chave.txt deploy/vps/formulario-db/restore-drill.sh   ~/backups/formulario/formulario-<utc>-<release>.dump.age
```

`contar-tabelas.sh` recebe o comando `psql` como argumentos justamente para que uma URL de
conexão fique na variável de ambiente e nunca apareça em `ps` nem no histórico:

```bash
deploy/vps/formulario-db/contar-tabelas.sh docker exec formulario-db psql -U postgres -d formulario
```

O que **não** fazer: restaurar qualquer drill dentro do `formulario-db` de produção, apagar
`.dump.age` à mão (a retenção é do script), guardar dump em claro fora do script, e colar
contagem junto com qualquer coluna de dado.

## Instalação da borda

1. Criar `useinfuser-net` pelo Compose do site.
2. Declarar essa rede como externa no Compose canônico do Caddy e conectá-la ao serviço `caddy`.
3. Confirmar que `skilltree-net` também está declarada e conectada ao Caddy; `/time` depende dela.
4. Fazer backup timestampado do Compose e do Caddyfile.
5. Acrescentar `Caddyfile.block` uma única vez.
6. Rodar `docker compose config --quiet` e `docker exec caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile`.
7. Conectar o Caddy vivo às redes sem reiniciar e recarregar a configuração.

## Corte

Registrar os valores DNS anteriores. Alterar apenas `useinfuser.com` e `www`. Depois da propagação:

```bash
node deploy/vps/smoke.mjs https://useinfuser.com <release>
node deploy/vps/smoke.mjs https://www.useinfuser.com <release>
```

Confirmar certificado, `/api/health`, logs do Caddy, logs do container, RSS, CPU e ausência de 5xx.

## Rollback

- app: definir `APP_RELEASE=<tag-anterior>` e executar `docker compose up -d --no-deps site`;
- Caddy: restaurar o backup, validar e recarregar;
- DNS: restaurar exatamente os registros anteriores;
- dados: não há migration nesta entrega.
