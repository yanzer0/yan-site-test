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

`deploy/vps/formulario-db/init/01-formulario.sh` roda **só no primeiro boot do volume**
`formulario-db-data`: cria a role `formulario`, o banco `formulario` e a extensão `pgcrypto`, e
revoga `PUBLIC` no banco. Com o volume já existente ele não roda de novo; mudança de schema é
migration, não init.

O `deploy.sh` sobe o banco e espera `healthy` (teto de 120 s) antes de construir e recriar o site.
Para subir só o banco:

```bash
APP_RELEASE=$(git rev-parse --short=12 HEAD) USEINFUSER_ENV_FILE=/home/infuser/.config/useinfuser/useinfuser.env docker compose -f deploy/vps/compose.prod.yml up -d formulario-db
```

O que **não** fazer: `docker compose down` (derruba o site junto), qualquer `-v` (apaga o volume
de dados), publicar porta, ligar o banco em `useinfuser-net` ou em qualquer rede com egress, e
rodar `psql` com senha em linha de comando. Dump e restore são por `docker exec` como `postgres`,
e o artefato vai para `~/backups/formulario/` (700), nunca para log, chat ou git.

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
