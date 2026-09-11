# Verificação e operação: entrega do Segundo Cérebro Autônomo

## Invariantes

| Invariante | Prova | Contraexemplo |
|---|---|---|
| preço promocional é R$97 | abrir checkout | preço diferente bloqueia ativação |
| preço padrão é R$147 | abrir checkout | preço diferente bloqueia ativação |
| guia e ZIP viajam juntos | SHA256 e HTTP 200 | ZIP ausente bloqueia build/deploy |
| nenhuma rota quebra | matriz 3 sistemas por 3 apps | imagem com `naturalWidth=0` falha |
| histórico de progresso é honesto | avançar e voltar | check posterior visível falha |

## Gates

- build do produto: 12/12;
- testes do guia: 11/11;
- testes do site e `npm run build`;
- matriz do wizard em desktop e mobile;
- console sem erro;
- `deploy/vps/smoke.mjs` no apex e www;
- checkout padrão e promocional abertos em janela limpa;
- compra de teste libera o módulo e o botão correto.

## Runbook

1. Confirmar SHA do ZIP e commit do site.
2. Publicar o commit na VPS pelo script canônico.
3. Rodar health e smoke nos dois hosts.
4. Ativar produto e ofertas na Hubla.
5. Executar compra de teste.
6. Em falha do site, restaurar a tag anterior.
7. Em falha comercial, desativar a oferta sem apagar evidência.

## Prontidão

Só marcar verificado depois do UAT com pagamento e acesso reais.

## Evidência local de 2026-09-11

- 4/4 testes específicos do guia passaram;
- build completo do Next.js passou e prerenderizou `/instalar`;
- rota, CSS, JS, logos e ZIP responderam 200;
- o fluxo Windows + Claude exibiu os prints nas etapas internas compartilhadas;
- viewport móvel 390 × 844 sem overflow horizontal;
- ao voltar, os checks posteriores ao passo atual foram removidos;
- console da aplicação sem erro; somente aviso esperado do Meta Pixel por estar em localhost.

## Exceções herdadas do repositório

- o lint global falha em dois `require()` existentes em `scripts/club/build-club-html.js`;
- a suíte global terminou com 401 testes verdes e falhas preexistentes em autenticação do painel, contrato com o brain e parser de ambiente;
- o `npm audit --omit=dev` acusa o PostCSS empacotado pelo Next 15.5.25. Não houve dependência nova e a correção sugerida exige Next 16, fora desta fatia. O guia é estático e não processa CSS ou entrada enviada pelo usuário.
