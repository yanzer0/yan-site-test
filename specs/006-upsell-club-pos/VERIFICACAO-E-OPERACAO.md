# Verificação e operação

## Estratégia

- Estática: nenhum placeholder, caminho relativo quebrado, segredo ou script inesperado.
- Build: `npm run lint` e `npm run build`.
- Local: 200 nas três rotas; títulos, `robots`, GTM, cupom e links conferidos.
- Visual: screenshots em 1440 px e 375 px; sem overflow, CTA cortado ou texto ilegível.
- Produção: repetir os smokes e checar console do navegador.

## Casos adversariais

- Abrir `/pos` sem barra final.
- Abrir cada rota diretamente.
- Recusar nas duas ocorrências da página principal.
- Confirmar que o checkout de downsell continua mostrando o banner do cupom `CLUB`.

## Operação

Página estática, sem alerta dedicado. A saúde é o status HTTP e o build da Vercel. Rollback por revert do commit.

## Gate

Bloqueia publicação: placeholder restante, checkout incorreto, build vermelho, rota diferente de 200, erro de console ou regressão visual P0.
