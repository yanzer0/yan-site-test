# Kit Segundo Cérebro em inglês

Rota: `/en/second-brain-kit`. Branch: `codex/kit-en-20261023`.
Escopo: três arquivos novos, sem alteração dos originais, dependências, tracking, CSS ou outras rotas. Sem push ou deploy.

## Copy e ângulo

- Inglês americano neutro. Sequência preservada: promessa, dor, mecanismo, demonstração, conteúdo, público, restrições, comparação, objeções, suporte, preço e fechamento.
- A promessa vira “Set it up once. Keep your context for good.” O foco passa de “nunca esquece” a contexto persistente, trabalho acumulado e menos repetição. “Mais inteligente” vira acúmulo de contexto, sem sugerir treinamento do modelo.
- Mantidos os 8 comandos, 4 prompts e 9 templates da fonte, além dos mesmos perfis, nomes de compradores e comportamento do toast. Nenhum depoimento ou número de vendas acrescentado. O toast segue a seleção aleatória original; não é um feed de compras verificado em tempo real, ponto que Yan deve validar antes de anunciar.
- Rodízio japonês vira jantar fora; Netflix + Spotify vira streaming e música; corte de cabelo permanece. Todos os valores monetários editáveis, inclusive comparações, consultoria, curso, assinatura hipotética e preço riscado, estão somente em `PRICING`, com placeholders visíveis e `TODO(Yan): definir`. Moeda e valores não foram estimados nem convertidos.
- A conta com R$50/hora, promessa de retorno em duas semanas e “50 semanas de lucro” saiu. Entrou uma hipótese de economia de 1 hora semanal, sem retorno garantido ou valor de hora presumido. A comparação não afirma que o kit será mais barato que o jantar enquanto os preços estiverem indefinidos.
- O relato de consultoria já vendida por valor brasileiro saiu; as âncoras de consultoria, curso e assinatura são apresentadas como hipotéticas, com placeholders. A analogia do contrato que vale milhões e a generalização de preço de todo SaaS também saíram.
- TCC e mestrado viram thesis, dissertation e research projects. A FAQ deixa claro que o acesso ao Claude é separado do kit. A promessa de compatibilidade com qualquer versão futura foi ajustada: Markdown permanece editável, mas mudanças nos recursos do Claude Code podem exigir ajuste. Não há PIX, CDC ou garantia brasileira na fonte atual, e nenhuma garantia internacional foi inventada.
- O fechamento usa os mesmos 30-60 minutos de configuração já informados na seção de restrições, evitando prometer conclusão fixa em 30 minutos.
- Botões, alt, aria-label de fechar, FAQ, modal e textos dinâmicos foram adaptados. A raiz do componente tem `lang="en"` e o mesmo wrapper `relative`; o layout raiz permanece intocado.

## Vídeo e assets

A fonte atual contém um MP4 local no hero (`/video-segundo-cerebro.mp4`), não um player vturb/converteai. O player foi retirado desta versão. Não havia scripts vturb/converteai a copiar. O contêiner, borda, espaçamento, animação e proporção 16:9 foram mantidos, com chamada estática em inglês. Referências a “como mostro no vídeo” foram removidas dos textos do kit e da FAQ. Yan pode fornecer uma VSL em inglês numa próxima fatia.

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

1. Definir USD ou EUR e preencher os oito campos de `PRICING`. Confirmar validade do preço riscado e das âncoras antes de publicar.
2. Confirmar checkout internacional, idioma, moeda, meios de pagamento, impostos aplicáveis e entrega correta na URL Hotmart original: `https://pay.hotmart.com/O108099140A?checkoutMode=10&bid=1792518047033`. A constante mantém exatamente esse destino, com `TODO(Yan): confirmar checkout internacional`.
3. Confirmar se o produto entregue, guias, prompts, onboarding e regras de idioma já têm versão em inglês. Esta fatia traduz apenas a página de vendas, sem prometer entrega de materiais já traduzidos.
4. Refazer os oito screenshots em inglês e, se desejado, fornecer VSL em inglês. Validar a procedência e a apresentação temporal do toast de compradores antes de usar tráfego pago.
5. Resolver, em outra fatia, os erros preexistentes do `tsc` em `tests/instalar/instalar.test.ts:94` e `:101`. O build conclui, mas o AC-03 permanece reprovado. O arquivo de testes está igual ao HEAD e não foi editado.

## Verificação

O pacote instalado é Next.js 15.5.25 e não contém `node_modules/next/dist/docs/`. Após confirmar a ausência, foram consultados os guias oficiais de [rotas](https://nextjs.org/docs/15/app/getting-started/layouts-and-pages) e [metadata](https://nextjs.org/docs/15/app/api-reference/functions/generate-metadata) da versão 15. Sem mudanças em `node_modules`.

### AC-01: aprovado, nenhuma correspondência

```sh
grep -nE "\b(você|não|seu|sua|também|então|agora|cérebro)|R\$" src/components/segundo-cerebro-en.tsx src/app/en/second-brain-kit/page.tsx
```

Saída do grep vazia. Registro da execução: `AC-01 grep exit=1` (1 significa nenhuma correspondência).

### AC-02: aprovado, nenhuma correspondência

```sh
grep -n "—" src/components/segundo-cerebro-en.tsx src/app/en/second-brain-kit/page.tsx
```

Saída do grep vazia. Registro da execução: `AC-02 grep exit=1`.

Os dois greps inicialmente falharam no sandbox com `CreateFileMapping ... Win32 error 5`. A repetição escalada executou normalmente e retornou os resultados acima.

### AC-03: reprovado por erros preexistentes fora do escopo

Comando: `npx tsc --noEmit`, executado com permissão escalada. Final da saída:

```text

tests/instalar/instalar.test.ts(94,26): error TS2493: Tuple type '[]' of length '0' has no element at index '0'.
tests/instalar/instalar.test.ts(101,49): error TS2493: Tuple type '[]' of length '0' has no element at index '0'.
AC-03 exit=2
```

Os dois erros são de acesso ao primeiro argumento de mocks declarados sem argumentos em testes já existentes. Nenhum erro aponta para os arquivos novos. Não foi alterado o teste, a configuração de tipos ou a instalação de dependências para contornar o bloqueio.

### AC-04: aprovado com um aviso herdado da cópia

Comando: `npx eslint src/components/segundo-cerebro-en.tsx src/app/en/second-brain-kit/page.tsx`, executado com permissão escalada. Final da saída:

```text
C:\dev\wt-site-kit-en\src\components\segundo-cerebro-en.tsx
  94:10  warning  'scrollToFinalCta' is defined but never used  @typescript-eslint/no-unused-vars

✖ 1 problem (0 errors, 1 warning)
AC-04 exit=0
```

A função `scrollToFinalCta` já existe sem uso na fonte portuguesa e foi mantida conforme a regra de copiar sem refatorar. Zero erros de lint.

### AC-05: aprovado, rota gerada

Comando: `npx next build`, executado com permissão escalada. Trechos finais relevantes da saída:

```text
 ✓ Compiled successfully in 54s
 ✓ Generating static pages (37/37)
├ ○ /en/second-brain-kit                 13.1 kB         121 kB



ƒ Middleware                             34.5 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
AC-05 exit=0
```

O build concluiu com um aviso `EPERM` ao tentar criar o symlink de `node_modules` em `.next/standalone` no Windows. Não foi alterada a junção original, instalado pacote ou contornado o aviso. A saída standalone local exige atenção antes de ser usada como pacote de deploy; esta fatia não publica nada.

### Conferências adicionais

A inspeção do HTML estático gerado confirmou textos e alt em inglês, metadata Open Graph em inglês com `en_US`, wrapper `lang="en"`, os oito placeholders de preço e ausência do player de vídeo. A conferência estrutural compara os caminhos das imagens, ordem das seções, lista de compradores, URL de checkout e classes CSS da fonte, preservando-os com a única substituição visual autorizada na área do vídeo. Imagens com texto rasterizado continuam sendo a exceção documentada acima.

Resultado: AC-01, AC-02, AC-04 e AC-05 aprovados; AC-03 reprovado por dois erros preexistentes de testes. Nenhum push ou deploy realizado.
