# Funil de Diagnóstico Infuser - Constitution

Governa tudo que for construído para capturar, qualificar, agendar e diagnosticar lead B2B da Infuser. Vale para as features `001-funil-diagnostico-captura` e `002-mapa-diagnostico-gerador` e para qualquer feature futura do mesmo funil.

As fontes de verdade de negócio vivem no brain (`yangalasso-brain`) e não são copiadas para cá. Este documento cita a fonte e a regra derivada. Quando a fonte mudar, esta constitution muda junto.

## Core Principles

### I. Diagnóstico antes de venda (NÃO-NEGOCIÁVEL)

A venda tem duas conversas. A Call 1 é diagnóstico puro: sem demo comercial, sem oferta, sem preço. A Call 2 apresenta proposta, escopo, investimento e caminho de fechamento.

Nenhuma superfície construída aqui pode exibir faixa de preço, tabela, nome de plano ou promessa de entrega antes do diagnóstico. Isso inclui formulário, e-mail de confirmação, página de agendamento, mensagem automática e o próprio mapa de diagnóstico.

**Exceção única, decidida pelo Yan em 30/08/2026 (emenda 1.1.0): o PISO declarado no gate de investimento do formulário.** O que o princípio protege é o lead entrar na Call 1 com uma faixa na cabeça, e faixa é o que ancora. Um piso não ancora: ele não diz quanto o projeto vai custar, diz abaixo de quanto não existe projeto.

A exceção é de **limiar, nunca de cotação**, e a fronteira é literal: **um número só, e nada que descreva como se cobra.** Mensalidade, setup, nome de plano, degrau e faixa continuam proibidos em toda superfície, a pergunta incluída. Dois números já descrevem a estrutura do SKU, e estrutura é tabela: a primeira versão desta pergunta dizia "começa em R$ 3 mil de implantação e R$ 500 por mês depois", que é a Fundação Essencial inteira exposta antes do diagnóstico, e foi corrigida no mesmo dia. O guard `copy.test.ts` prende os dois lados: o valor exato (mudar o piso sem passar pelo `pricing.md` reprova) e o vocabulário de estrutura.

Fonte: `_knowledge/comercial/direcionamento-estrategico.md` (decisão de 02/08/2026), `_empresa/identidade/pricing.md` (política v3, princípio 2) e `_decisions/2026-08-30-gate-de-tempo-e-investimento-no-formulario.md`.

### II. Qualificação é GPCT, nunca BANT

Por texto se pergunta situação: processo, volume, fontes de informação, tentativas anteriores, decisor. Dor, número e urgência ficam para a call, porque o valor está no cliente articular em voz alta.

**Nunca se pede ao lead que ele nomeie uma faixa, um valor ou um orçamento.** É essa a regra, e ela não tem exceção: número dito pelo cliente antes do custo da dor prende a proposta inteira nele, que é o risco 3 da decisão de 25/08/2026.

O que a emenda 1.1.0 permitiu é o movimento inverso, e só ele: **nós declaramos o piso e perguntamos se cabe**, em pergunta que não pontua e existe só para gatear a agenda gratuita. Quem nomeia o número somos nós.

Toda pergunta nova que PONTUA precisa passar no teste original: ela coleta situação verificável, ou está tentando extrair dor e verba por escrito? Se for a segunda, não entra. Pergunta pontuável com valor em dinheiro é reprovada por `perguntas.test.ts`.

Fonte: `_knowledge/comercial/abordagem-leads-dm.md`, seção "Questionário pré-call por WhatsApp" (decisão de 13/08/2026). Ela supera o modelo BANT com âncora de preço desenhado em 16/07/2026.

### II-b. Gate de compromisso não é critério de qualificação

Existem dois gates, e eles são de natureza diferente do score: **tempo** (a hora que a call custa) e **investimento** (o piso que o projeto custa). Eles não pontuam, não mapeiam para critério do ICP e não entram no cálculo. Reprovam.

Três regras que os governam:

1. **Falham fechado.** A rota de submissão é pública. Resposta ausente ou desconhecida reprova, senão o gate se atravessa apagando o campo do POST.
2. **Quem reprova sai da agenda gratuita, nunca do funil.** Fica gravado com respostas, score e motivo, como todo lead (princípio IV), e recebe alternativa honesta sem ler veredito sobre o próprio encaixe (FR-017).
3. **A alternativa corresponde ao que ele disse que não tem.** Quem declarou não ter a hora não recebe oferta de reunião paga: seria devolver o obstáculo com preço. Recebe o produto que usa sozinho.

Fonte: `_decisions/2026-08-30-gate-de-tempo-e-investimento-no-formulario.md`.

### III. O score é derivado do ICP, e o ICP é uma tabela, não uma intuição

Os 6 critérios de entrada do ICP são: operação existente, dor economicamente relevante, informação disponível, patrocinador operacional, caminho de decisão e disposição de colaborar.

Toda pergunta do formulário existe para instrumentar pelo menos um desses critérios, e todo critério precisa de pelo menos uma pergunta que o cubra. Pergunta que não mapeia para critério nenhum é ruído e sai. Critério sem pergunta é buraco de qualificação e precisa ser tapado.

Fonte: `_empresa/identidade/icp.md`.

### IV. Lead desqualificado é dado, não lixo

Quem não passa no corte não é descartado nem some. É gravado com as respostas completas, a origem, o score, o motivo do corte e a data, para reabordagem futura.

O sistema nunca comunica ao lead que ele foi desqualificado. Ele recebe um caminho alternativo honesto, e o registro serve à decisão interna.

Fonte: `_empresa/identidade/icp.md` (seção "Não ICP") e a instrução explícita do Yan em 14/08/2026.

### V. Só se afirma o que foi verificado

Nenhuma superfície pode prometer capacidade técnica não validada. Integração, permissão, escrita em sistema externo e resultado são condicionados à descoberta e ao aceite de escopo.

No mapa de diagnóstico isso é literal: o que foi dito pelo cliente na call e o que é inferência da Infuser aparecem separados e rotulados. Texto que vai para a mão do cliente só contém fato verificado.

Fonte: `CLAUDE.md` do brain, seção "Verifique antes de afirmar" e as 3 travas de diagnóstico de causa. `_empresa/identidade/pricing.md`, princípio 4.

### VI. Identidade e copy da casa

Documento entregue ao cliente e página web usam a identidade v2 completa (`_knowledge/branding/infuser-v2/tokens.css`). Nunca paleta inventada, nunca a v1.1 nesses canais.

Copy sem em-dash. Sem as palavras banidas do tone-of-voice ("transforme sua vida", "solução inovadora", "última chance", "ótima pergunta"). Sem urgência ou escassez fabricada. Sem citar que o material foi gerado por IA.

HTML entregue ao cliente é self-contained: imagens em base64, nada de src relativo que quebra no celular.

Fonte: `_knowledge/branding/`, `_empresa/identidade/tone-of-voice.md`, regras de copy da Infuser.

### VII. Dado mínimo, consentimento explícito

Coleta-se só o que serve à qualificação e ao contato. Consentimento de contato e de tratamento de dados é caixa marcada pelo lead, com link para a política de privacidade, antes do envio. Nunca pré-marcada.

Dado pessoal nunca vai em query string nem em log. Transcrição de call é dado sensível de cliente e não entra em repositório público.

### VIII. O agente precisa de um check que ele mesmo roda

Toda feature entrega junto o que prova que ela funciona: teste, exit code de build, lint, ou uma verificação executável. Sem check verificável, "parece pronto" vira o único sinal de parada e o humano vira o loop de verificação.

Fonte: skill `software-engineer` do brain, referência `ai-collaboration.md`.

## Restrições técnicas

Stack fixada pelo repositório hospedeiro (`yan-site-test`): Next.js App Router, TypeScript, Tailwind, shadcn. Deploy na Vercel, automático no push para `main`. O funil mora em rota do `useinfuser.com`, não em domínio novo.

Regras de código herdadas do global do Yan: `unknown` em vez de `any`, `interface` para formato de objeto, objeto `as const` em vez de `enum`, retorno de API pública tipado explicitamente, classes de erro específicas em vez de catch genérico, query parametrizada, nunca logar dado sensível.

Agendamento via Cal.com, que já é o desenho aprovado do processo comercial. Nenhum agendamento por e-mail manual ou "entramos em contato em 24h".

Persistência: uma decisão de armazenamento serve as duas features e é tomada no `/speckit-plan` da 001. Ela precisa suportar consulta por origem, score e data, porque é isso que responde "de onde vem lead bom".

## Fluxo de trabalho e portões de qualidade

Ordem obrigatória por feature: `/speckit-specify`, `/speckit-clarify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-analyze`, `/speckit-implement`.

O `/speckit-clarify` não é opcional aqui. As duas features tocam copy e regra comercial, que é exatamente onde ambiguidade vira retrabalho caro.

Nada vai para `main` sem build verde na Vercel. Não existe validação de build local garantida no histórico deste repo, então o build do deploy é o portão real.

Mudança em pergunta, peso de score ou corte de qualificação é mudança de spec, não de código. Atualiza-se a spec primeiro e o código depois.

Capacidade é restrição de desenho, não detalhe: quem conduz a substância do diagnóstico é o Yan, e ele é o gargalo. Nenhuma feature pode aumentar volume de call sem que o trabalho por call caia na mesma proporção.

## Governance

Esta constitution supera preferência de implementação e conveniência de prazo. Conflito entre ela e uma spec resolve-se a favor dela, e a spec é corrigida.

Emenda exige: o que muda, por que muda, qual fonte do brain mudou junto, e o que precisa ser refeito no que já existe. Emenda que contradiz decisão registrada no brain só entra depois que a decisão do brain for atualizada ou marcada como superada, nunca antes.

Princípio marcado como NÃO-NEGOCIÁVEL não é flexibilizado por emenda ordinária. Só cai por decisão explícita do Yan, registrada em `_decisions/` no brain.

Todo pull request declara quais princípios ele toca e como os respeita.

## Emendas

### 1.1.0 (2026-08-30) - gate de tempo e de investimento no formulário

**O que muda:** o formulário passa a ter duas perguntas de compromisso no fim da trilha de empresa, e a segunda declara o piso de investimento. Novo princípio II-b. Exceção nomeada no princípio I. Princípio II reescrito para separar "o lead nomeia um número" (proibido, sem exceção) de "nós declaramos o piso" (permitido, só no gate).

**Correção no mesmo dia, e ela aperta a emenda em vez de afrouxar:** a pergunta nasceu dizendo "começa em R$ 3 mil de implantação e R$ 500 por mês depois", o que é a Fundação Essencial descrita antes do diagnóstico. O Yan cortou para **"A sua empresa está disposta a investir pelo menos R$ 3 mil para resolver isso?"**. A regra que ficou é a fronteira entre **limiar** (um número, é o chão) e **cotação** (dois números, vira a estrutura de cobrança), e é ela que o guard cobra.

**Por que muda:** a call gratuita é hora do time, e o gargalo declarado é a agenda. Até aqui o funil não tinha nenhuma pergunta que separasse quem não pode pagar nem comparecer, e essa hora saía do mesmo lugar que a hora de quem fecha.

**Qual fonte do brain mudou junto:** `_decisions/2026-08-30-gate-de-tempo-e-investimento-no-formulario.md`, decisão explícita do Yan, como a governança exige de princípio NÃO-NEGOCIÁVEL. `pricing.md` não mudou: o piso citado é o que já está lá.

**O que precisou ser refeito:** guard de preço em `copy.test.ts` (de "nenhuma pergunta cita valor" para "só o gate cita, e cita o piso exato"), guard de BANT em `perguntas.test.ts`, teto de perguntas de 14 para 16, contagem prometida na abertura, e o desfecho, que ganhou o destino Kit para empresa.

**Risco assumido, declarado:** o lead passa a conhecer o piso antes da Call 1. É piso e não faixa, mas é preço, e o princípio I existia justamente para não haver nenhum. Sinal de reavaliação: taxa de abandono na pergunta 15 e proporção de leads que reprovam só o gate de dinheiro.

**Version**: 1.1.0 | **Ratified**: 2026-08-14 | **Last Amended**: 2026-08-30
