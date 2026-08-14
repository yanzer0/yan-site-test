# Funil de Diagnóstico Infuser - Constitution

Governa tudo que for construído para capturar, qualificar, agendar e diagnosticar lead B2B da Infuser. Vale para as features `001-funil-diagnostico-captura` e `002-mapa-diagnostico-gerador` e para qualquer feature futura do mesmo funil.

As fontes de verdade de negócio vivem no brain (`yangalasso-brain`) e não são copiadas para cá. Este documento cita a fonte e a regra derivada. Quando a fonte mudar, esta constitution muda junto.

## Core Principles

### I. Diagnóstico antes de venda (NÃO-NEGOCIÁVEL)

A venda tem duas conversas. A Call 1 é diagnóstico puro: sem demo comercial, sem oferta, sem preço. A Call 2 apresenta proposta, escopo, investimento e caminho de fechamento.

Nenhuma superfície construída aqui pode exibir preço, faixa de preço, tabela, nome de plano ou promessa de entrega antes do diagnóstico. Isso inclui formulário, e-mail de confirmação, página de agendamento, mensagem automática e o próprio mapa de diagnóstico.

Fonte: `_knowledge/comercial/direcionamento-estrategico.md` (decisão de 02/08/2026) e `_empresa/identidade/pricing.md` (política v3, princípio 2).

### II. Qualificação é GPCT, nunca BANT

Por texto se pergunta situação: processo, volume, fontes de informação, tentativas anteriores, decisor. Dor, número e urgência ficam para a call, porque o valor está no cliente articular em voz alta. Não se pergunta orçamento em formulário.

Toda pergunta nova precisa passar neste teste antes de entrar: ela coleta situação verificável, ou está tentando extrair dor e verba por escrito? Se for a segunda, não entra.

Fonte: `_knowledge/comercial/abordagem-leads-dm.md`, seção "Questionário pré-call por WhatsApp" (decisão de 13/08/2026). Ela supera o modelo BANT com âncora de preço desenhado em 16/07/2026.

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

**Version**: 1.0.0 | **Ratified**: 2026-08-14 | **Last Amended**: 2026-08-14
