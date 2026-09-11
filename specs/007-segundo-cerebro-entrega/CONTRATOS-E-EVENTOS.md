# Contratos consumidos pelo site

O contrato canônico está no pacote `second-brain-access/v1` do MCP.

| Rota pública | Upstream MCP | Regras |
|---|---|---|
| `GET /instalar` | `GET /second-brain/session` | guia só após 204 |
| `GET|POST /instalar/ativar` | `GET|POST /second-brain/activate` | query/body allowlisted, redirect reescrito |
| `POST /instalar/reenviar` | `POST /second-brain/resend` | corpo limitado, resposta HTML neutra |
| `GET /instalar/guide.js` | `GET /second-brain/session` | JS privado só após 204 |
| `GET /instalar/download` | `GET /second-brain/download` | stream binário, sem cache |

O site nunca recebe o evento Hubla. Ele consome somente o estado resultante. Comando e evento não são
misturados na fachada.

## Headers permitidos do upstream

`content-type`, `content-disposition`, `content-length`, `cache-control`, `set-cookie`, `location` e
`retry-after`. Outros headers não atravessam por padrão. `Location` interno é convertido para o path
equivalente sob `/instalar`.
