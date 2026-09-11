# ADR: substituir guia público por ativação passwordless

## Status

accepted

## Decisão anterior revisada

A versão 1 aceitou o compartilhamento por URL para reduzir tempo. Depois da publicação, Yan rejeitou
essa premissa: o link permite baixar o produto sem compra. Este arquivo passa a conter a decisão vigente.

## Decisão

`useinfuser.com/instalar` permanece como URL, mas vira fachada same-origin do entitlement no MCP.
Magic link de uso único cria cookie HttpOnly. O site consulta a sessão antes de servir HTML ou JS e
o ZIP sai apenas por rota autenticada do MCP.

## Por que

Reaproveita o fluxo provado da A Legião, não cria senha e permite revogação. Proxy mantém o domínio e
evita compartilhar segredo ou banco entre containers.

## Consequências

- a instalação depende de e-mail e MCP antes do primeiro download;
- CSS e imagens sanitizadas continuam públicos;
- o ZIP baixado ainda pode ser copiado;
- falha do MCP bloqueia conteúdo em vez de abrir fallback.

## Reversibilidade

Site e MCP têm releases independentes. Desligar o workflow evita novas concessões; restaurar o site
anterior reabre o conteúdo e só deve ser usado em rollback de emergência conscientemente inseguro.
