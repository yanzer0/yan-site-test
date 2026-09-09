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
