# Kit Segundo Cérebro em espanhol

## Escopo e decisões

- Feature de risco médio, três arquivos na fatia inicial e correção restrita ao componente espanhol e a este relatório, sem push ou publicação. Base: `340aa29bdb5476090d25556c2f2d678122a65022`, branch `codex/kit-es-20261023`.
- Cópia independente da página original. Mesmas seções, classes, animações, imagens, FAQ, modal e navegação por âncoras. O wrapper `relative` da rota brasileira foi reproduzido na nova rota; a raiz do componente recebe `lang="es"` sem alterar o layout raiz.
- Espanhol neutro, tratamento tú e termo computadora. Benefício central: parar de repetir contexto e recuperar o ponto de partida do trabalho. A promessa absoluta de nunca esquecer foi adaptada para memória persistente e contexto salvo.
- Nomes de compradores e contagens de conteúdo foram mantidos. O toast conserva o mecanismo original, com a frase “Ya tiene el Kit Segundo Cerebro”, sem afirmar compra em tempo real. Nenhuma prova social nova.
- Preços aprovados pelo Yan em PRICING: Kit US$ 17 por padrão, € 19 quando a URL contém ?moneda=eur. Leitura no cliente por window.location, após a montagem, com USD também no HTML estático inicial para evitar divergência de hidratação. A moeda é repassada às seções com preços e aos dois CTAs de checkout. Sem preço riscado, placeholders ou TODOs de preço.
- Saíram jantar, corte de cabelo, streaming, valor por hora e retorno financeiro prometido. A âncora passou a ser a mensalidade do Claude Pro versus o pagamento único do Kit. USD: US$ 20/mês, tarifa nos EUA confirmada em [fonte oficial](https://support.claude.com/en/articles/8325606-what-is-the-pro-plan), com ressalva de região e impostos e link na página. EUR: referência a um mês de Claude Pro sem número, pois € 18 não foi confirmado. São produtos distintos; o acesso ao Claude Code é separado.
- Consultoria, curso e assinatura foram reescritos sem valores. A afirmação de venda anterior como configuração feita pelo Yan, por um importe maior, segue a copy autorizada na correção; nenhuma conversão dos valores brasileiros foi feita.
- Retirada a comparação genérica com qualquer SaaS e a menção a contrato que vale milhões. A FAQ explica que mudanças futuras do Claude Code podem exigir ajustes, em vez de prometer compatibilidade com qualquer versão. O acesso a Claude Code é separado do kit.
- TCC/mestrado foi adaptado para trabalho de fim de curso, tese e pesquisa. A fonte não contém PIX nem garantia do CDC; não foi criada garantia legal ou forma de pagamento local.
- Nomes técnicos de comandos, pastas e arquivos do produto, inclusive `prompt-suporte-llm.md`, permanecem exatos para o comprador encontrá-los.

## Vídeo e imagens

Correção da ordem: a página portuguesa não tem VSL. O hero mostra um demo mudo em loop. O bloco de vídeo /video-segundo-cerebro.mp4 foi restaurado exatamente como está no componente português, no mesmo contêiner e posição, incluindo src, classes, autoPlay, loop, muted, playsInline e preload. A mensagem provisória foi removida. Não há converteai/vturb nem scripts de VSL a remover; VSL em espanhol não é pendência desta fatia.

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

Iago está criando as ofertas internacionais. CHECKOUT_URL é um par usd/eur, cada um com TODO de confirmação e mantendo provisoriamente o link Hotmart existente. Substituir pelos links aprovados de cada moeda antes de liberar tráfego. Preparar novas capturas em espanhol e confirmar o idioma dos arquivos entregues e do atendimento humano. A localização do produto em si está fora desta fatia. Revisão independente e publicação ficam para integração.

O pacote Next.js instalado (15.5.25) não fornece `node_modules/next/dist/docs/`. Foram consultadas as guias oficiais de [metadata](https://nextjs.org/docs/15/app/api-reference/functions/generate-metadata) e [page](https://nextjs.org/docs/15/app/api-reference/file-conventions/page) para a mesma versão principal. Nenhuma dependência foi instalada ou modificada.

## Aceites da correção

Comandos executados no worktree e branch indicados, com permissão escalada para Node e Git Bash no Windows. Os greps foram enviados ao Bash via stdin para preservar exatamente as barras de escape das expressões, que o PowerShell havia alterado na primeira tentativa.

### AC-01 e AC-02: passaram

~~~bash
grep -nE '\b(você|não|seu|sua|também|então|agora|cérebro)|R\$' src/components/segundo-cerebro-es.tsx src/app/es/kit-segundo-cerebro/page.tsx
grep -n '—' src/components/segundo-cerebro-es.tsx src/app/es/kit-segundo-cerebro/page.tsx
~~~

Final da saída de ambos: sem resultado; exit 1, nenhuma ocorrência.

### AC-03: atendido conforme a exceção autorizada

~~~text
> npx tsc --noEmit
tests/instalar/instalar.test.ts(94,26): error TS2493: Tuple type '[]' of length '0' has no element at index '0'.
tests/instalar/instalar.test.ts(101,49): error TS2493: Tuple type '[]' of length '0' has no element at index '0'.
exit code: 1
~~~

Nenhum erro nos arquivos desta fatia. O erro do teste existente foi conferido na base na rodada anterior e aceito explicitamente pelo Yan nesta correção. O teste não foi alterado.

### AC-04: passou

~~~text
> npx eslint src/components/segundo-cerebro-es.tsx src/app/es/kit-segundo-cerebro/page.tsx
95:10  warning  'scrollToFinalCta' is defined but never used  @typescript-eslint/no-unused-vars
✖ 1 problem (0 errors, 1 warning)
exit code: 0
~~~

Aviso da função não usada mantida da cópia portuguesa, sem refatoração fora do escopo.

### AC-05: passou

~~~text
> npx next build
✓ Compiled successfully in 20.2s
✓ Generating static pages (37/37)
├ ○ /es/kit-segundo-cerebro              13.6 kB         122 kB
ƒ Middleware                             34.5 kB
○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
exit code: 0
~~~

Permanece o aviso de montagem standalone no Windows: EPERM ao criar symlink entre o node_modules compartilhado e .next/standalone/node_modules. O comando concluiu; não houve instalação ou mudança na junção existente.

### Demo e placeholders: passaram

~~~bash
grep -c '<video' src/components/segundo-cerebro-es.tsx
# saída: 1; exit 0
grep -c '\[price\]' src/components/segundo-cerebro-es.tsx
# saída: 0; exit 1
~~~

Comparação literal do bloco do vídeo com o componente português: idêntico.

### Conferência no navegador

Build servido somente em 127.0.0.1:3017. Verificação com a skill dev-browser e navegador isolado:

- Rota sem parâmetro: preço US$ 17, CTA final US$ 17, nenhum preço em EUR, um vídeo e nenhum preço riscado.
- ?moneda=eur: preço € 19, CTA final € 19, nenhum US$ e nenhum € 18 no texto; referência sem número a um mês de Claude Pro.
- ?moneda=otra: fallback US$ 17, nenhum preço em EUR.
- Atributos do demo confirmados no DOM: src /video-segundo-cerebro.mp4, autoplay, loop, muted e playsInline ativos; preload metadata.
- Os dois CTAs recebem a entrada da moeda correspondente em CHECKOUT_URL. Por enquanto, as duas entradas usam o mesmo link atual com TODO, aguardando Iago.

Nenhum assert removido, nenhuma dependência nova, nenhuma alteração na fonte portuguesa, tracking, CSS, layout raiz ou outras rotas. Sem push e sem publicação.
