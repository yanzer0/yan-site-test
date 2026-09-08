# ADR - HTML estático servido por Route Handler

## Decisão

Servir cada página com `route.ts` e `force-static`, lendo um HTML completo de `public/` no build.

## Alternativas

- Reescrever em React: rejeitada, amplia o diff sem benefício para páginas prontas e estáticas.
- Rewrite em `next.config.ts`: rejeitada, o padrão dominante do repositório para HTML cru é Route Handler.

## Consequências

O HTML continua portátil e editável isoladamente. O layout raiz do Next não envolve a resposta, então o GTM precisa existir dentro de cada documento. Não há dependência nova.

## Reconsiderar quando

O funil precisar de estado autenticado, experimentação dinâmica ou componentes compartilhados com o restante do site.
