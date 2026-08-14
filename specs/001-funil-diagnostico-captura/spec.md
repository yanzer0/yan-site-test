# Feature Specification: Funil de diagnóstico - captura, qualificação e agendamento

**Feature Branch**: `001-funil-diagnostico-captura`

**Created**: 2026-08-14

**Status**: Draft

**Input**: Substituir o Google Forms atual por um formulário conversacional que qualifica o lead pelos critérios do ICP, agenda a Call 1 de diagnóstico automaticamente via Cal.com quando há encaixe, e registra quem não tem encaixe em banco próprio para reabordagem futura.

## Contexto e o que existe hoje

O formulário vivo é um Google Forms com 11 perguntas: nome, pessoal ou empresa, cargo, empresa, número de pessoas, faturamento anual, segmento, processos a automatizar, ferramentas em uso, WhatsApp e e-mail. Título: "Responda ao formulário para receber um diagnóstico gratuito em uma call de 30-60 minutos". Descrição: "um membro da nossa equipe entrará em contato em até 24h".

Diagnóstico do que está quebrado, medido contra os 6 critérios de entrada do ICP:

| Critério do ICP | Coberto hoje |
|---|---|
| Operação existente | Parcialmente, pela pergunta de processos a automatizar |
| Dor economicamente relevante | Não |
| Informação disponível | Parcialmente, pela pergunta de ferramentas em uso |
| Patrocinador operacional | Não. Pergunta cargo, não quem responde pelo processo |
| Caminho de decisão | Não |
| Disposição de colaborar | Não |

Três problemas adicionais: aceita "Pessoal", que o ICP lista como não-ICP explícito; promete resposta humana em 24 horas, que é onde o lead esfria; e não tem consentimento de tratamento de dados.

A promessa de valor da call já está no título, mas não é vendida em lugar nenhum e não tem entregável associado.

## Clarifications

### Session 2026-08-14

- Q: Que janela de horários o Cal.com oferece para a Call 1? → A: Todos os dias úteis do mês, blocos de 1 hora, com no mínimo 1 hora de intervalo entre calls. **Quem conduz é Iago e Pedro, seguindo o roteiro, e o Yan pega algumas.** Round robin entre os três, não agenda pessoal.
- Q: O que acontece quando o mesmo contato preenche o formulário duas vezes? → A: Atualiza o registro existente e preserva o histórico das respostas anteriores. Não cria lead duplicado nem descarta o que já havia.
- Q: As duas fases de lançamento saem juntas ou uma depois da outra? → A: **Juntas.** Não existe fase A separada: o formulário só vai ao ar com a promessa do mapa e a oferta do Mapa de IA já funcionando.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Lead com encaixe sai com a call marcada (Priority: P1)

Um sócio de empresa B2B com operação real chega pelo Instagram, abre o formulário, responde as perguntas numa conversa que se adapta ao que ele responde, e ao terminar escolhe o horário da Call 1 direto no calendário, na mesma tela, sem esperar ninguém entrar em contato. Recebe confirmação com o que vai acontecer na call e o que ele leva dela.

**Why this priority**: É a razão da feature existir. Remove a espera de 24 horas, que é a maior fonte de perda conhecida do funil atual, e é a única história que sozinha já entrega valor comercial.

**Independent Test**: Preencher o formulário com respostas de um lead que atende os 6 critérios do ICP e verificar que o agendamento aparece na mesma sessão, o evento cai na agenda, e o registro do lead existe com score e origem.

**Acceptance Scenarios**:

1. **Given** um visitante que responde como empresa com processo recorrente, fontes identificadas, responsável nomeado, decisor conhecido e disposição de dar acesso, **When** ele conclui a última pergunta, **Then** o sistema calcula score na faixa qualificada e apresenta o seletor de horários da Call 1 sem intervenção humana.
2. **Given** um lead qualificado que escolheu um horário, **When** o agendamento confirma, **Then** o lead recebe confirmação que explica que a call é diagnóstico, que não haverá proposta nem preço nela, e que ele recebe o mapa da operação ao final.
3. **Given** um lead qualificado, **When** o registro é gravado, **Then** ele contém todas as respostas, o score, a faixa, a origem e a data, e nenhum dado pessoal aparece em query string ou log.
4. **Given** qualquer lead, **When** ele chega na tela de envio, **Then** o consentimento de contato e tratamento de dados é uma caixa não pré-marcada com link para a política de privacidade, e o envio é bloqueado sem ela.

---

### User Story 2 - Lead sem encaixe é registrado, não descartado (Priority: P2)

Alguém que busca organização pessoal, ou uma empresa ainda sem operação recorrente, responde o formulário. O sistema não oferece a call consultiva, não diz que ele foi reprovado, e apresenta um caminho alternativo honesto. As respostas ficam gravadas com o motivo do corte, para a Infuser reabordar quando fizer sentido.

**Why this priority**: Instrução explícita do Yan e regra do ICP. Sem isso, o funil joga fora o dado que responde de onde vem lead bom, e a Call 1 gratuita fica exposta a quem nunca vai comprar, que é o custo que hoje sangra a agenda.

**Independent Test**: Preencher como uso pessoal e verificar que nenhuma tela de agendamento aparece, que o lead recebe um destino alternativo, e que o registro existe com faixa e motivo de corte preenchidos.

**Acceptance Scenarios**:

1. **Given** um visitante que declara uso pessoal, **When** ele responde essa pergunta, **Then** o formulário encurta para o caminho de não-ICP e nunca apresenta seletor de horário.
2. **Given** um lead na faixa não qualificada, **When** ele conclui, **Then** ele vê um destino alternativo honesto e em nenhum momento lê que foi desqualificado, reprovado ou que não atende critérios.
3. **Given** um lead na faixa intermediária, **When** ele conclui, **Then** o registro é marcado para revisão humana e o time recebe notificação, em vez de agendar automaticamente ou descartar.

---

### User Story 3 - O time enxerga de onde vem lead bom (Priority: P3)

O responsável comercial abre um lugar único e vê os leads que chegaram, com score, faixa, origem, motivo de corte e data, e consegue filtrar por essas dimensões.

**Why this priority**: O direcionamento estratégico lista "taxas de conversão B2B por origem e por etapa" como lacuna aberta. Sem esta história a lacuna continua aberta, mas o funil já funciona sem ela, por isso não é P1.

**Independent Test**: Com pelo menos um lead de cada faixa gravado, consultar por origem, por faixa e por intervalo de datas e obter os registros corretos.

**Acceptance Scenarios**:

1. **Given** leads gravados de origens diferentes, **When** o time consulta por origem, **Then** recebe a contagem e a lista correta por faixa.
2. **Given** um lead marcado para revisão humana, **When** o time decide agendar mesmo assim, **Then** existe um caminho de agendamento manual que grava a decisão e quem decidiu.

---

### User Story 4 - Quem abandona no meio não vira zero (Priority: P3)

Um visitante responde metade das perguntas e sai. O que ele já respondeu é preservado, e se ele voltar pelo mesmo dispositivo continua de onde parou.

**Why this priority**: Formulário conversacional tem mais passos que um formulário de página única, e abandono no meio é o risco estrutural do formato. Sem retomada, a mudança de formato pode piorar a conversão em vez de melhorar.

**Independent Test**: Responder as primeiras perguntas, fechar a aba, reabrir a mesma URL e verificar que a conversa retoma no ponto certo com as respostas anteriores intactas.

**Acceptance Scenarios**:

1. **Given** um visitante que respondeu parte das perguntas e saiu, **When** ele reabre pelo mesmo navegador, **Then** as respostas anteriores estão preservadas e ele continua do ponto onde parou.
2. **Given** um preenchimento parcial que nunca foi concluído, **When** o time consulta os registros, **Then** o parcial aparece separado dos concluídos e não conta como lead capturado.

---

### Edge Cases

- O que acontece quando o Cal.com está fora do ar ou não retorna horários? O lead qualificado não pode ficar sem próximo passo nem ver erro cru.
- O que acontece quando não há nenhum horário disponível na janela oferecida?
- O que acontece quando o mesmo e-mail ou WhatsApp preenche o formulário duas vezes? O segundo registro é duplicata, atualização ou lead novo?
- O que acontece quando o lead qualifica, agenda e não aparece na call?
- O que acontece quando o lead responde tudo com texto vazio, emoji ou lixo? Score alto por acidente não pode ocupar agenda.
- O que acontece quando o lead marca consentimento, envia, e depois pede exclusão dos dados?
- O que acontece com quem abre o formulário pelo navegador embutido do Instagram, que é onde a maior parte do tráfego chega?
- O que acontece quando o lead abandona exatamente na tela de agendamento, já qualificado?

## Requirements *(mandatory)*

### Requisitos funcionais

**Formato e apresentação**

- **FR-001**: O sistema MUST apresentar as perguntas uma por vez, em formato de conversa, com a resposta anterior visível.
- **FR-002**: O sistema MUST funcionar dentro do navegador embutido do Instagram, em tela de celular, sem rolagem horizontal.
- **FR-003**: O sistema MUST declarar ao lead, antes da primeira pergunta, quantas perguntas são, quanto tempo leva, e o que ele ganha ao terminar. A promessa MUST respeitar o faseamento de FR-032: na fase A, uma hora de call de diagnóstico; na fase B, a call mais o mapa da operação ao final.
- **FR-004**: O sistema MUST NOT exibir preço, faixa de preço, nome de plano ou tabela em nenhum ponto do fluxo.

**Perguntas e ramificação**

- **FR-005**: O sistema MUST cobrir os 6 critérios de entrada do ICP com pelo menos uma pergunta cada: operação existente, consequência observável quando o processo falha, onde a informação está, quem responde pelo processo, quem mais decide, e disposição de dar acesso e tempo do time.
- **FR-006**: O sistema MUST NOT perguntar orçamento, faixa de investimento, ou qualquer variação de "quanto você pretende investir".
- **FR-007**: O sistema MUST NOT perguntar dor subjetiva, urgência, ou "o que te fez procurar a gente agora". Esses ficam para a call.
- **FR-008**: O sistema MUST ramificar: quem declara uso pessoal segue caminho curto de não-ICP e nunca vê agendamento.
- **FR-009**: O sistema MUST coletar nome, empresa, papel na empresa, WhatsApp com DDD, e-mail e origem declarada.
- **FR-010**: O sistema MUST perguntar tentativas anteriores de resolver o problema, com opção que identifique cliente que já contratou e se frustrou, porque essa resposta muda a condução da call.
- **FR-011**: O sistema MUST perguntar frequência ou volume do processo, para separar processo recorrente de evento isolado.
- **FR-012**: O total de perguntas apresentado a um lead de empresa MUST ficar entre 10 e 14. O caminho de não-ICP MUST terminar em no máximo 6.

**Score e roteamento**

- **FR-013**: O sistema MUST calcular um score derivado exclusivamente dos 6 critérios do ICP, e roteia em três faixas: qualificado, revisão humana e não-ICP.
- **FR-014**: Lead na faixa qualificada MUST receber o seletor de horários da Call 1 na mesma sessão, sem espera e sem intervenção humana.
- **FR-015**: Lead na faixa de revisão humana MUST ser gravado e notificado ao time, sem agendamento automático e sem mensagem de recusa.
- **FR-016**: Lead na faixa não-ICP MUST ser gravado com motivo de corte e receber destino alternativo honesto.
- **FR-017**: O sistema MUST NOT comunicar ao lead, em nenhuma faixa, que ele foi desqualificado, reprovado ou que não atende aos critérios.
- **FR-018**: Os pesos do score e os limiares das faixas MUST ser configuráveis sem alteração de código, porque serão calibrados com dados reais.

**Agendamento**

- **FR-019**: O sistema MUST integrar com Cal.com para oferecer horários reais e confirmar o agendamento.
- **FR-020**: A confirmação de agendamento MUST explicar que a Call 1 é diagnóstico, que não há proposta nem preço nela, e que o lead recebe o mapa da operação ao final.
- **FR-021**: O sistema MUST tratar indisponibilidade do provedor de agendamento com um caminho alternativo que preserve o lead, nunca com erro cru.
- **FR-022**: O sistema MUST enviar ao responsável comercial as respostas do lead junto com a notificação do agendamento, para a call começar sem repetir pergunta já respondida.

**Dados, consentimento e persistência**

- **FR-023**: O sistema MUST exigir consentimento explícito, em caixa não pré-marcada, com link para a política de privacidade, antes de aceitar o envio.
- **FR-024**: O sistema MUST persistir todo lead concluído com respostas, score, faixa, motivo de corte quando houver, origem e data.
- **FR-025**: O sistema MUST persistir preenchimentos parciais separadamente dos concluídos.
- **FR-026**: O sistema MUST NOT transmitir dado pessoal em query string, e MUST NOT registrar dado pessoal em log.
- **FR-027**: O sistema MUST permitir consulta dos leads por origem, faixa e intervalo de data.
- **FR-028**: O sistema MUST suportar exclusão dos dados de um lead mediante pedido.

**Requisitos com decisão pendente**

- **FR-029**: ✅ Resolvido em 14/08. São **dois** destinos, roteados pela resposta de uso pessoal versus empresa, e nunca mais que isso, porque vitrine de produtos destrói a força da recusa.
  - Quem declara **uso pessoal** recebe o **Kit Segundo Cérebro**, R$ 67 em pagamento único, vivo em `useinfuser.com/kit-segundo-cerebro` com checkout Hubla ativo. Encaixa porque quem quer organizar a própria rotina costuma aceitar a fricção de instalar Claude Code e Obsidian.
  - Quem tem **empresa real mas fica fora do critério da call gratuita** recebe o **Mapa de IA**, R$ 197: o mesmo diagnóstico, pago. Ele quer saber onde a IA encaixa, não um kit de vault.
  - O sistema MUST NOT oferecer o Kit de R$ 67 a lead que declarou empresa. Dono de empresa não-técnico recebendo um produto que exige terminal é reembolso e desgaste de marca.
  - O sistema MUST NOT ofertar Infuser Club nem Esquadrão de Agentes neste fluxo. São de outro funil.
- **FR-030**: ✅ Resolvido em 14/08. A Call 1 é distribuída por **round robin entre Yan, Iago e Pedro**, não em agenda pessoal.
  - Janela: todos os dias úteis do mês corrente, em horário comercial.
  - Duração: 1 hora, com intervalo mínimo de 1 hora entre calls do mesmo host.
  - O Cal.com suporta round robin nativamente, e emite `BOOKING_REASSIGNED` quando o host muda.
  - O sistema MUST enviar ao host sorteado o roteiro e as respostas do lead, e não ao time inteiro.
  - Consequência que a feature 003 herda: o roteiro passa a ser gerado no **modo andaime** por padrão, com falas literais, porque quem conduz na maior parte das vezes não é o Yan.
- **FR-032**: O lançamento é **único**. Decisão de 14/08: as duas fases saem juntas, e não existe versão intermediária no ar.
  - O formulário MUST ir a produção já prometendo o mapa e já oferecendo o Mapa de IA de R$ 197 ao não-ICP de empresa.
  - Consequência direta: a feature `002` é **pré-requisito de produção** da `001`. A ordem de construção (001, 003, 002) continua valendo para o trabalho, mas nada vai ao ar antes das três estarem prontas.
  - O sistema MUST NOT prometer o mapa antes da 002 estar entregando de verdade. Promessa sem lastro é dívida com o lead e contraria o princípio V da constitution.
- **FR-033**: Preenchimento repetido pelo mesmo contato MUST atualizar o registro existente e preservar as respostas anteriores como histórico. Não cria lead duplicado e não descarta o que já havia. A identidade do lead é o par e-mail mais WhatsApp normalizado.
- **FR-031**: ✅ Resolvido, ver FR-033.

### Entidades

- **Lead**: quem preencheu. Identificação, empresa, contato, origem declarada, consentimento com data, e o conjunto de respostas.
- **Resposta**: o que foi respondido em cada pergunta, preservando o texto literal quando a pergunta é aberta, porque a palavra do cliente é insumo da call e do mapa.
- **Avaliação**: score calculado, faixa resultante, motivo de corte quando houver, e a versão do modelo de score usada, para que recalibração não invalide histórico.
- **Agendamento**: referência ao evento criado, horário, quem atende, e estado (agendado, realizado, não compareceu).
- **Configuração de score**: pesos por critério e limiares das faixas, versionados.

## Success Criteria *(mandatory)*

### Resultados mensuráveis

- **SC-001**: O lead qualificado conclui o formulário e sai com horário marcado em uma única sessão, sem espera humana. Hoje o caminho é "entramos em contato em até 24h".
- **SC-002**: Todo lead concluído recebe classificação em uma das três faixas. Nenhum lead termina sem faixa.
- **SC-003**: Os 6 critérios do ICP têm cobertura completa por pergunta. Hoje 2 são cobertos parcialmente e 4 não são cobertos.
- **SC-004**: 100% dos leads não-ICP ficam gravados e consultáveis. Hoje esse dado não é distinguido nem preservado.
- **SC-005**: A taxa de conclusão do formulário conversacional é medida e comparada com a do Google Forms atual em janelas equivalentes de tráfego, e não é inferior.
- **SC-006**: A proporção de calls agendadas que se confirmam como encaixe real de ICP no diagnóstico é medida a partir do primeiro mês, para calibrar os pesos do score.
- **SC-007**: O responsável comercial entra na Call 1 com as respostas do lead em mãos, sem precisar repetir por WhatsApp nenhuma pergunta já respondida no formulário.

## Assumptions

- O tráfego principal chega pelo Instagram, majoritariamente por celular, e boa parte dentro do navegador embutido do app.
- O formulário mora em rota do `useinfuser.com`, servida pelo repositório `yan-site-test`, e não em domínio ou ferramenta externa.
- Cal.com é o provedor de agendamento, conforme o processo comercial aprovado em 02/08/2026.
- A política de privacidade pública já existe no site e serve de destino do link de consentimento.
- O modelo de qualificação segue GPCT, e a spec de 16/07/2026, que usava BANT com âncora de preço, está superada pela decisão de 13/08/2026.
- O questionário pré-call por WhatsApp de 13/08/2026 muda de papel quando esta feature entrar: as perguntas de situação passam a vir do formulário, e o WhatsApp fica para confirmação e vínculo humano. A spec não altera aquele documento, apenas assume a sobreposição.
- Os pesos iniciais do score são chute informado pelo ICP e precisam de calibração com os primeiros leads reais. A spec exige que sejam configuráveis exatamente por isso.
- O mapa de diagnóstico é entregue pela feature `002-mapa-diagnostico-gerador`. Como ela é a última da ordem de construção, o lançamento é faseado por FR-032 e a fase A não promete o mapa.
- A feature `002` não é só entregável de call: ela é o que destrava o **Mapa de IA de R$ 197**, produto desenhado em 24/06 como tripwire B2B e parado desde então por falta do template do PDF. O mesmo gerador serve a call gratuita e ao produto pago.
- A assimetria entre a call gratuita, que tem critério, e o diagnóstico pago, que é aberto a qualquer um, é a forma honesta de comunicar seletividade. Ela substitui a ideia de vagas limitadas, que cairia no anti-padrão de exclusividade fabricada, banido 5 a 5 pelo conselho de 12/06.
