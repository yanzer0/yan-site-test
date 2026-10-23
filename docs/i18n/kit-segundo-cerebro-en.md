# Kit Segundo Cérebro em inglês

Rota: `/en/second-brain-kit`. Branch: `codex/kit-en-20261023`.
Escopo: três arquivos novos, sem alteração dos originais, dependências, tracking, CSS ou outras rotas. Sem push ou deploy.

## Copy e ângulo

- Inglês americano neutro. Sequência preservada: promessa, dor, mecanismo, demonstração, conteúdo, público, restrições, comparação, objeções, suporte, preço e fechamento.
- A promessa vira “Set it up once. Keep your context for good.” O foco passa de “nunca esquece” a contexto persistente, trabalho acumulado e menos repetição. “Mais inteligente” vira acúmulo de contexto, sem sugerir treinamento do modelo.
- Mantidos os 8 comandos, 4 prompts e 9 templates da fonte, além dos mesmos perfis, nomes de compradores e comportamento do toast. Nenhum depoimento ou número de vendas acrescentado. O toast segue a seleção aleatória original; não é um feed de compras verificado em tempo real, ponto que Yan deve validar antes de anunciar.
- Preço aprovado por Yan na correção: Kit a US$ 27, pagamento único. O preço riscado foi removido, pois não existe preço cheio cobrado no exterior. `PRICING` contém somente `price` e `claudeProMonthly`, sem placeholders nem TODOs de preço. Não houve conversão de reais.
- As comparações com jantar, streaming e corte de cabelo saíram, pois não havia fonte de preços para esses mercados. Entrou a comparação entre Claude Pro a US$ 20 por mês no plano mensal dos EUA e o Kit pago uma vez, por US$ 27. A página informa que os preços regionais e impostos variam e que o acesso ao Claude é separado do Kit.
- Fonte primária consultada nesta correção: [What is the Pro plan?](https://support.claude.com/en/articles/8325606-what-is-the-pro-plan), seção “How much does the Pro plan cost?”. A fonte confirma o preço mensal dos EUA e a variação regional. Nenhum preço em euro foi presumido. A página inclui link para a fonte na comparação.
- A conta com R$50/hora, promessa de retorno em duas semanas e “50 semanas de lucro” saiu. Permanece uma hipótese de economia de 1 hora semanal, sem retorno garantido ou valor de hora presumido.
- Os valores brasileiros de consultoria, curso e assinatura saíram. A copy usa “I have sold this as a done-for-you setup for much more”, sem número convertido. A analogia do contrato que vale milhões e a generalização de preço de todo SaaS também saíram.
- TCC e mestrado viram thesis, dissertation e research projects. A FAQ deixa claro que o acesso ao Claude é separado do kit. A promessa de compatibilidade com qualquer versão futura foi ajustada: Markdown permanece editável, mas mudanças nos recursos do Claude Code podem exigir ajuste. Não há PIX, CDC ou garantia brasileira na fonte atual, e nenhuma garantia internacional foi inventada.
- O fechamento usa os mesmos 30-60 minutos de configuração já informados na seção de restrições, evitando prometer conclusão fixa em 30 minutos.
- Botões, alt, aria-label de fechar, FAQ, modal e textos dinâmicos foram adaptados. A raiz do componente tem `lang="en"` e o mesmo wrapper `relative`; o layout raiz permanece intocado.

## Vídeo e assets

A ordem foi corrigida: o MP4 local do hero (`/video-segundo-cerebro.mp4`) é uma demonstração muda em loop, e não uma VSL. O bloco “Video” foi restaurado exatamente como está na fonte portuguesa, no mesmo lugar, incluindo contêiner, classes, `autoPlay`, `loop`, `muted`, `playsInline` e `preload="metadata"`. A chamada estática inserida na primeira entrega saiu. Não há player ou scripts vturb/converteai na fonte. Não há pendência de criar VSL para esta fatia.

As oito imagens foram inspecionadas visualmente e permanecem sem alteração. Todas contêm português; devem ganhar capturas em inglês antes da campanha. A demonstração informa “Examples shown in Portuguese”. Caminhos permanecem em `/segundo-cerebro/`:

| Imagem | Português a refazer |
| --- | --- |
| `daily-briefing.webp` | Data, estado atual, cabeçalhos, prioridades e follow-ups. Também há valores monetários rasterizados do exemplo de pipeline, que não vêm de `PRICING`. |
| `8-comandos.webp` | Cabeçalhos do Explorador: Nome, Data de modificação, Tipo e Tamanho. |
| `claude-md.webp` | Título, regras de idioma, princípios e identidade. Mostra o vault padrão configurado em português. |
| `estrutura-do-vault.webp` | “Pasta de arquivos” e nomes dos guias de instalação, personalização e suporte. |
| `about-me.webp` | Propriedades, títulos, perguntas, exemplos brasileiros, idiomas e dica final. |
| `braindump.webp` | Captura, resumo, lógica estratégica, conexões, desafios e veredito. |
| `end-session.webp` | Fechamento, decisões, aprendizados, prioridades e próximos passos. Também contém valores monetários rasterizados do exemplo. |
| `obsidian-full.webp` | Interface do Obsidian e trechos do estado atual, com mistura de inglês e português. |

A exigência de manter os assets impede eliminar o português e os valores fixos dentro dos pixels nesta fatia. AC-01 cobre o texto do código; não comprova ausência de português nas imagens. O nome técnico real do arquivo de suporte foi substituído na copy por “an AI support prompt”, sem renomear o arquivo entregue.

## Pendências para o Yan

1. Preço e moeda da página aprovados: US$ 27, pagamento único. Não há pendência de preço riscado, âncoras convertidas ou placeholders.
2. Iago está criando as ofertas internacionais. Confirmar checkout internacional, idioma, moeda, meios de pagamento, impostos aplicáveis e entrega correta na URL Hotmart original: `https://pay.hotmart.com/O108099140A?checkoutMode=10&bid=1792518047033`. A constante mantém exatamente esse destino, com `TODO(Yan): confirmar checkout internacional`.
3. Confirmar se o produto entregue, guias, prompts, onboarding e regras de idioma já têm versão em inglês. Esta fatia traduz apenas a página de vendas, sem prometer entrega de materiais já traduzidos.
4. Refazer os oito screenshots em inglês. Validar a procedência e a apresentação temporal do toast de compradores antes de usar tráfego pago.
5. Os erros do `tsc` em `tests/instalar/instalar.test.ts:94` e `:101` foram confirmados pelo solicitante como preexistentes no main. O aceite corrigido exige ausência de erros nos arquivos desta fatia. Os testes permanecem intocados.

## Verificação

O pacote instalado é Next.js 15.5.25 e não contém `node_modules/next/dist/docs/`. Após confirmar a ausência, foram consultados os guias oficiais de [rotas](https://nextjs.org/docs/15/app/getting-started/layouts-and-pages) e [metadata](https://nextjs.org/docs/15/app/api-reference/functions/generate-metadata) da versão 15. Sem mudanças em `node_modules`.

### AC-01 e AC-02: aprovados

Os greps da ordem de trabalho não produziram correspondências nos dois arquivos de código. Saída registrada:

```text
AC-01: no matches
AC-02: no matches
```

### Demo e placeholders: aprovados

```sh
grep -c "<video" src/components/segundo-cerebro-en.tsx
# 1
grep -cF '[price]' src/components/segundo-cerebro-en.tsx
# 0
```

No Windows, `-F` preserva a busca literal de `[price]` sem depender da passagem de barras invertidas pelo runtime MSYS. Código de saída 1 na contagem zero significa nenhuma correspondência. A comparação automatizada confirmou que todo o bloco “Video” do hero é idêntico à fonte. Também confirmou somente os valores US$ 27 e US$ 20 em `PRICING`, ausência de preço riscado, ausência dos antigos campos e manutenção do checkout e de seu TODO.

### AC-03: aprovado conforme o aceite corrigido

Comando: `npx tsc --noEmit`, com permissão escalada. Não há erro nos arquivos desta fatia. O processo global ainda retorna 2 pelos dois erros preexistentes confirmados pelo solicitante:

```text
tests/instalar/instalar.test.ts(94,26): error TS2493: Tuple type '[]' of length '0' has no element at index '0'.
tests/instalar/instalar.test.ts(101,49): error TS2493: Tuple type '[]' of length '0' has no element at index '0'.
AC-03 global exit=2
```

Nenhuma alteração em testes, configuração de tipos ou dependências para contornar esses erros.

### AC-04: aprovado

Comando: `npx eslint src/components/segundo-cerebro-en.tsx src/app/en/second-brain-kit/page.tsx`, com permissão escalada. Final da saída:

```text
C:\dev\wt-site-kit-en\src\components\segundo-cerebro-en.tsx
  89:10  warning  'scrollToFinalCta' is defined but never used  @typescript-eslint/no-unused-vars

✖ 1 problem (0 errors, 1 warning)
AC-04 exit=0
```

A função sem uso já existe na fonte portuguesa e foi mantida conforme a regra de copiar sem refatorar. Zero erros de lint.

### AC-05: aprovado

Comando: `npx next build`, com permissão escalada. Trechos finais relevantes da saída:

```text
 ✓ Compiled successfully in 33.6s
 ✓ Generating static pages (37/37)
├ ○ /en/second-brain-kit                   13 kB         121 kB



ƒ Middleware                             34.5 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
AC-05 exit=0
```

O aviso local `EPERM` de symlink em `.next/standalone/node_modules` permanece no Windows. O build termina com código 0 e lista a rota estática. Não houve alteração na junção original, instalação de dependências, push ou deploy.

A inspeção do HTML estático gerado confirmou exatamente os atributos do demo, os preços aprovados, zero placeholders e ausência de português no texto extraído. As oito imagens mantidas continuam com o português rasterizado já documentado.

Resultado da correção: todos os aceites aprovados conforme o escopo revisado do AC-03. Dois arquivos alterados nesta correção: componente em inglês e este relatório. Rota e metadata permanecem iguais.
