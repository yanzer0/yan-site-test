# Kit Segundo Cérebro em espanhol

## Escopo e decisões

- Feature de risco médio, somente três arquivos novos, sem push ou publicação. Base: `340aa29bdb5476090d25556c2f2d678122a65022`, branch `codex/kit-es-20261023`.
- Cópia independente da página original. Mesmas seções, classes, animações, imagens, FAQ, modal e navegação por âncoras. O wrapper `relative` da rota brasileira foi reproduzido na nova rota; a raiz do componente recebe `lang="es"` sem alterar o layout raiz.
- Espanhol neutro, tratamento tú e termo computadora. Benefício central: parar de repetir contexto e recuperar o ponto de partida do trabalho. A promessa absoluta de nunca esquecer foi adaptada para memória persistente e contexto salvo.
- Nomes de compradores e contagens de conteúdo foram mantidos. O toast conserva o mecanismo original, com a frase “Ya tiene el Kit Segundo Cerebro”, sem afirmar compra em tempo real. Nenhuma prova social nova.
- Todos os valores monetários editáveis ficam em `PRICING`, com placeholders e `TODO(Yan): definir`. Moeda e valores não foram convertidos nem presumidos. Jantar, mês de séries e música e corte de cabelo substituem referências brasileiras, sem afirmar que o kit custa menos antes da definição dos preços.
- A comparação por hora é condicional. Saiu a garantia de economia, o retorno em menos de duas semanas e o valor brasileiro por hora. As âncoras de consultoria, curso e mensalidade são hipóteses com placeholders; saiu a afirmação de venda anterior por um valor internacional ainda indefinido.
- Retirada a comparação genérica com qualquer SaaS e a menção a contrato que vale milhões. A FAQ explica que mudanças futuras do Claude Code podem exigir ajustes, em vez de prometer compatibilidade com qualquer versão. O acesso a Claude Code é separado do kit.
- TCC/mestrado foi adaptado para trabalho de fim de curso, tese e pesquisa. A fonte não contém PIX nem garantia do CDC; não foi criada garantia legal ou forma de pagamento local.
- Nomes técnicos de comandos, pastas e arquivos do produto, inclusive `prompt-suporte-llm.md`, permanecem exatos para o comprador encontrá-los.

## Vídeo e imagens

Na fonte desta fatia, o hero usa `/video-segundo-cerebro.mp4`; não há player converteai/vturb nem scripts dele neste componente. O MP4 foi removido da versão espanhola. O mesmo contêiner, borda, animação e proporção 16:9 permanecem, com uma mensagem em espanhol. As referências ao vídeo também foram retiradas da copy. VSL em espanhol fica pendente.

Todas as imagens abaixo continuam intactas em `public/segundo-cerebro/`. Inspeção visual confirmou texto em português nas oito. A legenda da demonstração avisa que os exemplos originais estão em português. AC-01 verifica texto do código, não texto dentro de imagens.

| Imagem | Texto em português a refazer |
| --- | --- |
| `8-comandos.webp` | Cabeçalhos Nome, Data de modificação, Tipo, Tamanho e tipos de arquivo do Windows. |
| `about-me.webp` | Perguntas, instruções, títulos e exemplos da ficha pessoal; interface do Obsidian. |
| `braindump.webp` | Resumo da ideia, conexões, desafios e veredito na saída do comando. |
| `claude-md.webp` | Identidade, regras de idioma, instruções e proteções do CLAUDE.md. |
| `daily-briefing.webp` | Resumo, tabelas, prioridades e próximos passos. Há valores monetários de demonstração embutidos na imagem, preservados pela regra de manter os assets. |
| `end-session.webp` | Fechamento, decisões, aprendizados e próximos passos. Também contém valores monetários de demonstração embutidos, fora do PRICING e não editáveis nesta fatia. |
| `estrutura-do-vault.webp` | Tipos de arquivo e nomes reais dos guias e do prompt de suporte em português. |
| `obsidian-full.webp` | Interface, rótulos como sessão e trechos de notas misturados com inglês. |

## Pendências para o Yan

Definir EUR ou USD e os nove valores de `PRICING`; validar as comparações para os mercados escolhidos; confirmar o checkout internacional no link Hotmart existente; preparar VSL e novas capturas em espanhol; confirmar idioma dos arquivos entregues e do atendimento humano antes de anunciar. A localização do produto em si está fora desta fatia. Não publicar com placeholders. Revisão independente e liberação de tráfego ficam para a etapa de integração.

O pacote Next.js instalado (15.5.25) não fornece `node_modules/next/dist/docs/`. Foram consultadas as guias oficiais de [metadata](https://nextjs.org/docs/15/app/api-reference/functions/generate-metadata) e [page](https://nextjs.org/docs/15/app/api-reference/file-conventions/page) para a mesma versão principal. Nenhuma dependência foi instalada ou modificada.

## Aceites

Execução em Windows/PowerShell no worktree indicado. Node executado com permissão escalada conforme a ordem. O grep do Git Bash exigiu a mesma permissão após falhar com CreateFileMapping no sandbox.

### AC-01: passou

~~~powershell
grep -nE "\b(você|não|seu|sua|também|então|agora|cérebro)|R\$" src/components/segundo-cerebro-es.tsx src/app/es/kit-segundo-cerebro/page.tsx
~~~

Final da saída: sem resultado. Código de saída do grep: 1, correspondente a nenhuma ocorrência. Revisão textual incluiu copy, FAQ, alternativas das imagens, botões e modal; nomes próprios e nomes técnicos reais do produto foram preservados.

### AC-02: passou

~~~powershell
grep -n "—" src/components/segundo-cerebro-es.tsx src/app/es/kit-segundo-cerebro/page.tsx
~~~

Final da saída: sem resultado. Código de saída do grep: 1.

### AC-03: falhou por erro preexistente fora do escopo

~~~text
> npx tsc --noEmit
tests/instalar/instalar.test.ts(94,26): error TS2493: Tuple type '[]' of length '0' has no element at index '0'.
tests/instalar/instalar.test.ts(101,49): error TS2493: Tuple type '[]' of length '0' has no element at index '0'.
exit code: 1
~~~

Contraprova somente leitura usando o compilador TypeScript com a configuração do projeto, excluindo os dois arquivos novos e os tipos gerados de .next, reproduziu os mesmos dois erros. O teste foi comparado ao HEAD da base:

~~~text
BASELINE_DIAGNOSTICS=2
BASELINE_TEST_UNCHANGED=true
~~~

Nenhum erro foi apontado nos dois arquivos novos. A correção do teste não foi feita porque a ordem permite apenas três arquivos novos. AC-03 continua pendente e exige uma correção separada na base.

### AC-04: passou, com aviso herdado da cópia

~~~text
> npx eslint src/components/segundo-cerebro-es.tsx src/app/es/kit-segundo-cerebro/page.tsx
97:10  warning  'scrollToFinalCta' is defined but never used  @typescript-eslint/no-unused-vars
✖ 1 problem (0 errors, 1 warning)
exit code: 0
~~~

A mesma função não usada existe no componente original (linha 82). Foi preservada para respeitar a ordem de copiar sem refatorar.

### AC-05: passou, com aviso do ambiente Windows

~~~text
> npx next build
✓ Compiled successfully in 43s
✓ Generating static pages (37/37)
├ ○ /es/kit-segundo-cerebro              13.5 kB         122 kB
ƒ Middleware                             34.5 kB
○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
exit code: 0
~~~

O build emitiu avisos de lint já existentes e o aviso abaixo na montagem do pacote standalone. Isso não impediu a conclusão nem a geração da rota; o pacote standalone para Windows não foi validado para deploy nesta fatia:

~~~text
⚠ Failed to copy traced files ... EPERM: operation not permitted, symlink
'C:\dev\useinfuser-site\node_modules' -> 'C:\dev\wt-site-kit-es\.next\standalone\node_modules'
~~~

Verificação estrutural adicional, somente leitura, confirmou:

~~~text
SECTION_ORDER_IDENTICAL=true
IMAGE_ASSETS_IDENTICAL=true
NEW_MEDIA_EMBEDS=0
~~~

Nenhum assert de teste foi removido. Sem dependências novas, alterações de tracking, configuração, CSS, layout raiz, backend ou outras rotas. Rollback da fatia: reverter o único commit. Não houve push ou publicação.
