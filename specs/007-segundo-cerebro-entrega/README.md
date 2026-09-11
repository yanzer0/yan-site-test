---
tags: [projeto, segundo-cerebro, hubla, acesso]
status: active
definition_status: ready-for-build
updated: 2026-09-11
---

# Entrega protegida do Segundo Cérebro Autônomo

## Mudança verificada

A versão 1 publicou guia e ZIP por URL. Isso não protege a compra: qualquer pessoa com o link baixa
o produto. A versão 2 substitui o acesso público por ativação passwordless vinculada à compra.

## Resultado

`useinfuser.com/instalar` é a porta única. Sem sessão, mostra acesso por e-mail. Com sessão ativa,
serve o wizard. O JavaScript e o ZIP ficam fora de `public`; o ZIP só sai por download autenticado.

## Decisões

- sem senha e sem token permanente;
- site é fachada same-origin e MCP é autoridade de acesso;
- GET do magic link não consome, POST consome uma vez;
- cookie HttpOnly é revalidado pelo MCP em toda abertura;
- falha do MCP nunca cai para o guia público;
- CSS, fontes e screenshots sanitizados podem permanecer públicos;
- brain instalado continua local e não faz phone-home.

## Fora do escopo

- DRM ou impedir redistribuição do ZIP já baixado;
- mexer no checkout, preço ou conteúdo do pacote;
- login social ou senha própria.
