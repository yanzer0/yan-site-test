# Arquitetura: fachada Next e autoridade MCP

```text
Browser -> useinfuser.com/instalar
  -> Next chama MCP /second-brain/session com o cookie
     -> 204: lê private/instalar/index.html
     -> 401: renderiza tela de acesso
     -> 5xx/timeout: renderiza indisponibilidade

Browser -> /instalar/activate|resend|download
  -> Next proxy server-side -> MCP equivalente
  -> Set-Cookie e redirects voltam no domínio useinfuser.com
```

## Responsabilidades

| Componente | Faz | Não faz |
|---|---|---|
| Site | UX, proxy, arquivo privado do wizard | decidir se a compra está ativa |
| MCP | entitlement, sessão, reenvio e ZIP | renderizar o wizard principal |
| Hubla/n8n | fatos comerciais e comandos | servir conteúdo |

## Falha segura

- MCP não responde: 503 amigável, sem wizard;
- cookie inválido/revogado: tela neutra de acesso;
- download negado: 401/404 sem revelar compra;
- resposta inesperada: site descarta corpo e mostra erro próprio.

## Fitness functions

- `rg` não encontra ZIP, index ou JS sensível sob `public`;
- todos os handlers usam o helper único de proxy;
- `Set-Cookie`, `Location`, tipo e corpo binário são preservados de forma allowlisted;
- smoke prova 200 da tela pública e 404 dos caminhos antigos.
