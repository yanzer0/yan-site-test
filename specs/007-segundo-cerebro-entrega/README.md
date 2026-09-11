---
tags: [projeto, segundo-cerebro, hubla, entrega]
status: active
definition_status: ready-for-build
updated: 2026-09-11
---

# Entrega do Segundo Cérebro Autônomo

## Estado da definição

- versão: 1.0
- owner humano: Yan
- modo: executor
- risco: G, rota pública e produto comercial

## Resultado contratado

Quem comprar o Segundo Cérebro Autônomo na Hubla é direcionado imediatamente à área de membros externa em `https://useinfuser.com/instalar`, baixa o ZIP vigente e conclui a instalação pelo wizard.

## Fatos verificados

- O guia local passou 11 testes e nove rotas de navegação.
- O build do pacote passou 12 testes e gera `segundo-cerebro-autonomo.zip`.
- `useinfuser.com` roda em Next 15.5.25 na VPS e publica por `deploy/vps/deploy.sh`.
- A Hubla aceita preço-base e preço promocional na mesma oferta, além de pós-compra e área de membros por link externo.

## Decisões congeladas

1. Produto: Segundo Cérebro Autônomo.
2. Oferta padrão: pagamento único de R$147.
3. Oferta promocional: pagamento único de R$97, aberta diretamente pelo CTA, sem cupom digitável.
4. Entrega: checkout e compras da Hubla como porta; área de membros externa em `/instalar` como experiência.
5. O ZIP é um ativo separado servido pelo mesmo caminho, não base64 dentro do HTML.
6. `/instalar` recebe `noindex, nofollow` e não promete controle contra compartilhamento do arquivo.

## Escopo

- publicar o guia e o ZIP em `/instalar`;
- criar produto, oferta com preço-base e promocional e área externa na Hubla;
- apontar o pós-compra para a Área de Membros;
- provar preço, acesso, download, desktop, mobile e rollback.

## Fora do escopo

- autenticação própria ou DRM;
- webhook customizado para revogação;
- página de vendas completa;
- order bump em outros produtos antes do teste desta oferta.

## Pronto

Rota pública e checkout respondem, a área externa entrega o link correto, o preço promocional de R$97 não exige cupom, o download é o ZIP validado e uma compra de teste percorre o fluxo inteiro.
