# Funil pós-compra do Infuser Club

definition_status: verified

## Resultado desejado

Publicar em `useinfuser.com/pos` o upsell do Infuser Club entregue pelo Iago, com downsell e confirmação final funcionais.

## Fatos verificados

- O domínio roda neste repositório Next.js e publica pela Vercel a partir de `main`.
- O pacote recebido contém duas páginas HTML sem dependências locais.
- O checkout mensal cobra R$97/mês.
- O checkout anual tem preço-base de R$684 e parcelamento opcional com juros.
- O checkout do downsell mostra R$97 antes do cupom; o banner instrui usar o cupom `CLUB` para liberar o desconto.
- Iago definiu que a recusa final deve levar a uma confirmação simples de envio do material por e-mail.

## Decisões congeladas

- Preservar a identidade e a copy do pacote, alterando apenas integração, clareza do cupom e destino final.
- Servir HTML estático pelo padrão `route.ts` já usado no repositório.
- Manter `noindex, nofollow` nas três páginas.
- Inserir o loader de GTM já adotado nas páginas HTML cruas do site.

## Fora de escopo

- Alterar produtos, preços ou cupons na Hubla.
- Redesenhar a página.
- Criar webhook, banco, autenticação ou captura de dados.

## Superfícies protegidas

Todo o site fora de `src/app/pos/**` e `public/pos*.html` permanece intocado.
