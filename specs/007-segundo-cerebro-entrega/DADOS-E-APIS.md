# Dados e APIs da fachada

O site não persiste comprador nem entitlement. Ele encaminha apenas:

- cookie HttpOnly recebido do navegador;
- query `code` na ativação;
- corpo `application/x-www-form-urlencoded` limitado no POST;
- IP encaminhado pelo proxy confiável para rate limit.

## Conteúdo

| Ativo | Local | Proteção |
|---|---|---|
| HTML do wizard | `private/instalar/index.html` | lido só após sessão 204 |
| JavaScript do wizard | `private/instalar/guide.js` | handler protegido |
| ZIP | somente no MCP | download autenticado |
| CSS, fontes, logos e prints sanitizados | `public/instalar` | públicos, sem produto executável |

## Configuração

`SECOND_BRAIN_ACCESS_ORIGIN` é server-only e aceita apenas origem HTTP(S) sem path. Default de produção:
`https://mcp.useinfuser.com`. Testes injetam servidor local.

Nenhum segredo novo no site.
