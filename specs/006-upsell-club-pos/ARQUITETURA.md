# Arquitetura

## Contexto

O site é um Next.js hospedado na Vercel. As páginas do funil são documentos HTML completos e não precisam de React.

## Componentes

- `public/pos.html`: upsell principal.
- `public/pos-oferta-final.html`: downsell.
- `public/pos-obrigado.html`: confirmação final.
- `src/app/pos/**/route.ts`: adaptadores estáticos que leem cada documento no build e devolvem `text/html; charset=utf-8`.

## Fronteiras e segurança

As rotas são públicas por intenção. Não recebem entrada, não persistem dados e não fazem chamadas de servidor. Links financeiros saem para a Hubla por HTTPS. O loader do GTM é o mesmo já aprovado no site.

## Falhas e rollback

Falha de leitura impede o build da Vercel e mantém a versão anterior. Regressão pós-deploy é revertida pelo commit de publicação.

## Fitness functions

Build Next verde, status HTTP 200, títulos e links esperados, ausência de placeholder, console sem erro e layout sem overflow em 375/1440 px.
