# Upsell do Segundo Cérebro Premium em inglês e espanhol

## Escopo e estrutura

Classe: feature. Risco: médio. Execução local, sem publicação e sem push.
Work order: `.planning/work-orders/WO-PREMIUM-UPSELL-I18N-001.md`.
Branch: `codex/premium-upsell-i18n-20261023`.

Rotas: `/en/second-brain-kit/premium` e `/es/kit-segundo-cerebro/premium`.
Cada rota tem metadata própria com `robots: { index: false }` e renderiza um componente independente, com `lang="en"` ou `lang="es"` no `<main>`.

Sequência da página:
1. Faixa confirmando a compra do Kit e o envio do acesso por e-mail.
2. Headline e explicação sobre o abandono do índice e das tarefas no Kit básico.
3. Lista dos nove benefícios do Premium.
4. Nota sobre conteúdo salvo, `/end-session` e aprovação inicial dos hooks no Codex.
5. Uma oferta com `[price]`, aceite `hotmart-upsell-accept` e recusa discreta.

Visual reaproveitado de `src/components/segundo-cerebro.tsx`: fundo preto, verde, `font-punch`, `font-heading`, `font-mono`, `text-gradient-green`, `green-glow` e `useScrollReveal`. Lista em duas colunas no desktop e uma no celular. Foco de teclado visível; o hook e o CSS existentes respeitam movimento reduzido. Sem bibliotecas novas, componentes compartilhados novos, alteração de tracking, layout raiz ou CSS global.

## Argumentos e rastreabilidade

Fonte A: `git show backup/kit-sc-dois-planos-2026-10-05:src/components/segundo-cerebro.tsx`, seção 11, `PREMIUM_ITENS`, `UPSELL_ITENS`, `UpsellModal` e card Premium.
Fonte B: `C:\Users\PC\Documents\INFUSER USE - CONSULTORIA DE IA\yangalasso-brain\_infoprodutos\segundo-cerebro-autonomo\segundo-cerebro-autonomo.md`, seções iniciais anteriores a Pendências, em especial “O que entrega” e “Fronteira honesta”.
Fonte C: `C:\Users\PC\Documents\INFUSER USE - CONSULTORIA DE IA\yangalasso-brain\_infoprodutos\segundo-cerebro-autonomo\pacote\LEIA-ME.md`.

| Benefício adaptado | Origem e limite |
| --- | --- |
| Tudo do básico, mais `/comecar` e `/aprendi` | A, item 1; B, entrega e instalador. Entrevista guiada, sem inventar métricas. |
| Índice, estado e pendências atualizados por sessão | A, item 2; B, harness. A copy restringe a atualização às notas salvas. |
| Contexto do dia antes do primeiro prompt | A, item 3. Data, projetos, tarefas abertas e vencidas. |
| Pendências reaparecem por assunto | A, item 4; B, pendências com gatilho. Somente tarefas relacionadas. |
| Correções salvas reaparecem no assunto relevante | A, item 5; B, memória de aprendizados. Não promete que o modelo jamais erre novamente. |
| Navegação pelo índice antes de buscar | A, item 6; B, guardrail de navegação. Não promete economia numérica nem limita artificialmente todos os tokens. |
| Verificação de formato ao encerrar o turno | A, item 7; B, harness. Cabeçalhos ausentes e tarefas fora do formato, sem prometer revisão semântica infalível. |
| Um cérebro em Claude Code e Codex | A, item 8; B, hooks e comandos espelhados; C, aprovação inicial dos hooks. |
| Instalação pelo agente sem digitar comandos na terminal | A, item 9; B, instalador; C, roteiro. O agente executa e verifica. Não promete ausência de permissões ou avisos do sistema. |

Os nomes reais dos comandos foram preservados. No Codex, os comandos espelhados são invocados como skills com `$`, conforme o guia de instalação.
Não foram incluídos preços brasileiros, conversões, contagens promocionais, urgência, escassez, depoimentos ou garantia de captura de tudo que foi conversado.
Não se promete que dados enviados ao modelo permaneçam exclusivamente no computador.

## Pendências do Yan antes de publicar

- Definir `PRICING.price` por idioma/mercado, substituindo `[price]`, e conferir moeda e condições no checkout.
- Preencher `PREMIUM_CHECKOUT_URL` (`[checkout]`) e `DECLINE_URL` (`[thank-you]`) nos dois componentes.
- Colar o script real do funil one-click da Hotmart no bloco TODO indicado e conferir sua ligação com `hotmart-upsell-accept`.
- Configurar o direcionamento pós-compra do Kit para a rota do idioma correspondente.
- Validar aceite, cobrança e recusa no funil real. Nenhuma compra ou chamada de pagamento foi executada nesta fatia.
- Confirmar a entrega do produto, os guias e as mensagens de acesso em inglês e espanhol com a frente responsável pelo pacote.
- Revisão humana final da copy e do fluxo antes da publicação. Os placeholders tornam esta entrega imprópria para vendas enquanto não forem preenchidos.

## Validação

`node_modules` permaneceu como junção, sem instalação ou remoção. Nesta versão instalada (`Next.js 15.5.25`), `node_modules/next/dist/docs/` não existe. Foram consultadas as fontes oficiais de [page.tsx na versão 15](https://nextjs.org/docs/15/app/api-reference/file-conventions/page) e [metadata na versão 15](https://nextjs.org/docs/15/app/api-reference/functions/generate-metadata).
Scope Lock: `Scope Lock PASS (enforce)`, work order ativa `WO-PREMIUM-UPSELL-I18N-001`.

Os quatro arquivos abaixo são o conjunto usado nos comandos de AC-01, AC-02 e AC-04:

```text
src/components/premium-upsell-en.tsx
src/components/premium-upsell-es.tsx
src/app/en/second-brain-kit/premium/page.tsx
src/app/es/kit-segundo-cerebro/premium/page.tsx
```

### AC-01: idioma

Comando: `grep -nE "\b(você|não|seu|sua|também|então|agora|cérebro|compra)\b|R\$"` nos quatro arquivos.
Saída final do grep nesta instalação Windows:

```text
(sem resultado)
exit=1
```

Como conferência adicional da expressão em UTF-8, a leitura por Node encontrou exclusivamente:

```text
src/components/premium-upsell-es.tsx:27:Tu compra del Kit está confirmada. Recibirás los datos de acceso por correo electrónico.
```

“Compra” é espanhol correto e é a exceção permitida no aceite. Os TODOs em português exigidos pela work order permanecem apenas em comentários, sem aparecer ao comprador.

### AC-02: sem travessão

Comando: `grep -n "—"` nos quatro arquivos.

```text
(sem resultado)
exit=1
```

### AC-03: tipos

Comando: `npx tsc --noEmit`, executado com permissão escalada após a criação das páginas.

```text
tests/instalar/instalar.test.ts(94,26): error TS2493: Tuple type '[]' of length '0' has no element at index '0'.
tests/instalar/instalar.test.ts(101,49): error TS2493: Tuple type '[]' of length '0' has no element at index '0'.
exit=1
```

Sem erro nos quatro arquivos desta fatia. Os dois erros também foram observados antes de os componentes existirem; os testes alheios ao escopo não foram alterados.

### AC-04: lint

Comando: `npx eslint src/components/premium-upsell-en.tsx src/components/premium-upsell-es.tsx src/app/en/second-brain-kit/premium/page.tsx src/app/es/kit-segundo-cerebro/premium/page.tsx`, com permissão escalada.

```text
(sem saída)
exit=0
```

### AC-05: build

Comando: `npx next build`, com permissão escalada.
Primeira tentativa: compilou, mas terminou com `PageNotFoundError: Cannot find module for page: /_document` (`ENOENT`, exit 1). Um preview foi iniciado prematuramente durante essa execução e encerrado antes da segunda tentativa; possível concorrência no diretório gerado `.next`.
Resultado da segunda tentativa: exit 0, ambas as rotas listadas. Após o ajuste do foco de teclado, o build foi repetido para validar a versão final, também com exit 0. Trechos finais relevantes dessa última execução:

```text
✓ Generating static pages (38/38)
├ ○ /en/second-brain-kit/premium         2.23 kB         105 kB
├ ○ /es/kit-segundo-cerebro/premium      2.36 kB         105 kB
ƒ Middleware                             34.7 kB
○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
exit=0
```

Avisos preexistentes de lint em `segundo-cerebro.tsx`, `smoothui/scrollable-card-stack.tsx` e `unlumen-ui/hover-expand.tsx`. Aviso de ambiente no empacotamento standalone: `EPERM: operation not permitted, symlink 'C:\dev\useinfuser-site\node_modules' -> 'C:\dev\wt-site-premium-upsell\.next\standalone\node_modules'`. O build concluiu apesar desse aviso; não se afirma que o pacote standalone deste Windows esteja pronto para deploy. A junção original não foi modificada.

### QA no navegador

Servidor local do build em `http://localhost:3107`, encerrado ao fim do QA, sem acionamento dos links de pagamento.
As duas rotas retornaram páginas válidas, com `lang` correto, meta robots `noindex`, nove itens, `[checkout]` e `[thank-you]` como valores de origem dos links. O tracking herdado pode acrescentar parâmetros aos links após a hidratação; nenhum arquivo de tracking foi alterado.

```text
en 1440px: overflow=false, errors=[]
en 375px: overflow=false, errors=[]
es 1440px: overflow=false, errors=[]
es 375px: overflow=false, errors=[]
en: focusVisible=true, outlineStyle=solid, outlineWidth=2px, reducedMotionOpacity=1
es: focusVisible=true, outlineStyle=solid, outlineWidth=2px, reducedMotionOpacity=1
```

Capturas dos dois idiomas em 1440x900 e 375x900 inspecionadas visualmente: `C:\Users\PC\.dev-browser\tmp\premium-{en,es}-{1440,375}.png`, fora dos arquivos de entrega.

| Antes | Depois | Motivo |
| --- | --- | --- |
| A classe de brilho sobrepunha o ring do foco global; o outline tinha estilo `none`. | `focus-visible:outline-solid` nos links dos dois componentes, validado como `solid 2px`. | Foco de teclado visível sem editar CSS global. |

## Revisão e operação

Revisão de complexidade: dois componentes diretos, um por idioma, sem abstração ou dependência nova. Nenhum assert existente removido. Superfície nova somente de apresentação, sem entrada externa, dados privados, handlers de pagamento ou script executável de terceiros. O script Hotmart real permanece pendente.
Skills: codar, software-engineer, ponytail, code-craft, ponytail-review; Studio nos modos CRIAR/QA com frontend-design e emil-design-eng; dev-browser para preview. Event-driven dispensada porque esta fatia não implementa integração entre sistemas.
Não houve deploy, push ou alteração do pacote do produto. Rollback futuro desta fatia: reverter o commit das duas rotas e dos dois componentes; sem migração de dados.
