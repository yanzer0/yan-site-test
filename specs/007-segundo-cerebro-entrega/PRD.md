# PRD: fachada protegida de instalação

## Usuário

Comprador não técnico no Windows, macOS ou Linux, usando Claude, Codex ou ambos.

## Requisitos

| ID | Requisito | Aceite |
|---|---|---|
| RF-01 | Porta pública neutra | sem cookie, `/instalar` não contém o wizard |
| RF-02 | Reenvio passwordless | formulário envia e-mail ao MCP e responde sem enumerar |
| RF-03 | Ativação segura | GET confirma; POST cria cookie e volta para `/instalar` |
| RF-04 | Guia privado | HTML e JS só são servidos após sessão ativa |
| RF-05 | Download privado | botão chama `/instalar/download`, nunca arquivo estático |
| RF-06 | Falha fechada | timeout/5xx do MCP mostra indisponibilidade sem conteúdo |
| RF-07 | Preservar wizard | rotas, progresso, prints, zoom e copy existentes não mudam |
| RF-08 | Remover atalhos públicos | index, JS e ZIP antigos retornam 404 |

## NFRs

- respostas protegidas usam `no-store` e `noindex`;
- proxy tem timeout e não vaza corpo de erro interno;
- zero segredo no bundle do navegador;
- formulário acessível em 375 e 1440 px;
- assets não sensíveis continuam cacheáveis;
- rollback restaura uma imagem anterior.

## Métricas

Ativação, reenvio, acesso negado e download ficam no MCP sem PII. O site mantém GTM somente no guia
autorizado; a tela de acesso não registra e-mail em tracking.
