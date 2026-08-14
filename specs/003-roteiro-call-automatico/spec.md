# Feature Specification: Roteiro da Call 1 e card do lead, gerados no agendamento

**Feature Branch**: `003-roteiro-call-automatico`

**Created**: 2026-08-14

**Status**: Draft

**Input**: Quando o lead qualificado marca a Call 1 pelo Cal.com, disparar automaticamente a geração do call-card de diagnóstico a partir das respostas do formulário, e criar o card do lead no brain já com o roteiro vinculado.

## O que já existe e não se reconstrói

Esta feature é quase toda montagem de peças que já estão de pé. O que ela adiciona é o gatilho e a cola.

| Peça | Estado verificado |
|---|---|
| Gatilho | Cal.com dispara `BOOKING_CREATED`, com as respostas do formulário no objeto `responses` e assinatura HMAC-SHA256 no header `x-cal-signature-256` |
| Gerador do roteiro | O comando `/call-roteiro` já existe no brain, versão 3.0 de 02/08/2026, com fontes obrigatórias, ordem de seções fixa e template HTML canônico |
| Portão de qualidade | `scripts/validate-call-card.mjs` no brain, exit 0 obrigatório |
| Schema do card | `scripts/lib/schema-clientes.js`, enum fechado de funil, validação que bloqueia card fora do padrão |
| Motor | Claude Agent SDK ou `claude -p` headless, que carregam o `.claude/` inteiro e consomem a assinatura sem custo extra |
| Orquestração | n8n já rodando na VPS da Infuser |

## Onde roda, e por que isso importa

O `/call-roteiro` lê `_empresa/identidade/pricing.md`, `services.md`, `icp.md` e `positioning.md`. A pasta `_empresa/` é confidencial e está fora da varredura do harness e do MCP. Não existe clone do `yangalasso-brain` na VPS.

Decisão de 14/08: **roda na máquina do Yan**, onde o brain vive. O n8n na VPS recebe o webhook e enfileira; a máquina do Yan consome a fila e executa.

Consequência aceita: se a máquina estiver desligada quando a call for marcada, o roteiro sai atrasado. Isso é tolerável porque a call sempre acontece depois, nunca no instante do agendamento. O que não é tolerável é o trabalho sumir em silêncio.

## Clarifications

### Session 2026-08-14

- Q: Quem conduz a Call 1? → A: **Iago e Pedro na maior parte das vezes, seguindo o roteiro, e o Yan pega algumas.** Isso inverte o default do roteiro: o modo andaime, com falas literais, passa a ser o padrão.
- Q: O sistema precisa saber quem vai conduzir cada call? → A: **Não, e não tem como saber.** A agenda é uma só, compartilhada, e quem estiver disponível pega. Sem round robin não existe host atribuído no agendamento, então o roteiro sai sempre em modo andaime, único e igual para os três.
- Q: Por qual canal chega o aviso de falha da rotina? → A: Pelo **`OPS - alert`** que já existe e está ativo, workflow n8n `M0DVv7r86uqKUjnE`, que recebe `{source, severity, message}` e manda e-mail para o Yan via SMTP Hostinger. Não se cria canal novo.
- Q: O que fazer em cancelamento e remarcação? → A: Cancelamento anota no card e não apaga nada, porque lead que cancelou continua sendo lead. Remarcação atualiza a data e **não** regera o roteiro, já que o conteúdo do diagnóstico não mudou.
- Q: E quando quem preenche é de empresa que já é cliente ativo? → A: Não cria card novo. Avisa pelo `OPS - alert` e registra como interesse vinculado ao cliente existente, para virar conversa de expansão em vez de lead frio duplicado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - O card do lead nasce sozinho (Priority: P1)

O lead qualificado marca a Call 1. Sem ninguém tocar em nada, aparece no brain a pasta do cliente com o card preenchido pelas respostas do formulário, no estágio correto do funil, com origem, contato e próximo passo datado.

**Why this priority**: É a parte determinística e de menor risco. Não depende de julgamento do modelo, é transposição de campo para campo, e sozinha já elimina digitação manual e lead que some por não ter sido registrado.

**Independent Test**: Disparar um `BOOKING_CREATED` de teste com respostas conhecidas e verificar que a pasta e o card existem, que o frontmatter passa na validação do schema, e que os dados batem com o que foi enviado.

**Acceptance Scenarios**:

1. **Given** um agendamento novo de lead qualificado, **When** o webhook chega, **Then** existe `_pipeline/clientes/<slug>/<slug>.md` com frontmatter válido pelo schema e `status: call-marcada`.
2. **Given** um card criado, **When** a validação do schema roda, **Then** passa sem erro, e se não passar o card não é gravado pela metade.
3. **Given** um webhook recebido, **When** a assinatura HMAC não confere, **Then** nada é criado e o evento é registrado como rejeitado.
4. **Given** o mesmo lead agendando duas vezes, **When** o segundo webhook chega, **Then** o card existente é atualizado e não se cria um segundo card.

---

### User Story 2 - O roteiro da Call 1 chega pronto e validado (Priority: P1)

Junto com o card, é gerado o call-card de diagnóstico daquele lead, no formato canônico, com PREP montado a partir do que ele respondeu. O Yan abre e lê antes da call, sem ter escrito nada.

**Why this priority**: É a razão da feature existir. Hoje o roteiro depende de alguém lembrar de rodar o comando, e na prática a call acontece sem ele.

**Independent Test**: Com um conjunto de respostas conhecido, gerar o roteiro e verificar que `validate-call-card.mjs` retorna exit 0 e que a zona ao vivo respeita a ordem e o limite de palavras.

**Acceptance Scenarios**:

1. **Given** um card recém-criado com as respostas do formulário, **When** o gerador roda, **Then** produz `roteiro-call-<slug>-call-1.html` no formato `diagnostic`, com a ordem `frame → diagnosis → decision → door-1 → advance`.
2. **Given** um roteiro gerado, **When** `validate-call-card.mjs` roda, **Then** o exit é 0. Exit diferente de 0 impede a entrega do arquivo como pronto.
3. **Given** um roteiro gerado, **When** ele é inspecionado, **Then** a zona ao vivo tem no máximo 400 palavras e não contém oferta, faixa, SKU, preço nem demo.
4. **Given** um roteiro gerado, **When** o PREP é lido, **Then** o que veio do formulário está separado do que é hipótese da Infuser.
5. **Given** um lead cujo formulário respondeu pouco, **When** o gerador roda, **Then** o PREP registra as lacunas em vez de preencher com suposição.

---

### User Story 3 - A falha aparece, nunca some (Priority: P2)

Quando qualquer etapa falha, alguém fica sabendo a tempo de agir antes da call.

**Why this priority**: Uma rotina que quebra em silêncio é pior que rotina nenhuma, porque cria confiança falsa. O Yan chega na call achando que tem roteiro e não tem.

**Independent Test**: Forçar falha em cada etapa (webhook inválido, máquina offline, validador reprovando, schema rejeitando) e verificar que cada uma produz aviso identificável.

**Acceptance Scenarios**:

1. **Given** a máquina do Yan desligada quando o webhook chega, **When** ela volta, **Then** o agendamento pendente é processado, e não perdido.
2. **Given** o validador reprovando o roteiro, **When** a rotina termina, **Then** ela falha em voz alta com o motivo, e não grava um roteiro inválido como se estivesse pronto.
3. **Given** um agendamento cuja call é em menos de 24 horas e cujo roteiro ainda não saiu, **When** o prazo aperta, **Then** existe aviso, porque roteiro que chega depois da call não serve.

---

### Edge Cases

- O que acontece quando o lead marca a call e cancela minutos depois?
- O que acontece quando o lead remarca? O roteiro é regerado ou continua valendo?
- O que acontece quando o nome da empresa gera um slug que colide com cliente existente?
- O que acontece quando o lead não informou empresa, ou informou algo inútil como "teste"?
- O que acontece quando a mesma empresa já é cliente ativo e alguém de lá preenche o formulário?
- O que acontece quando o modelo gera um roteiro que passa no validador mas está factualmente errado sobre o lead?
- O que acontece se a fila acumular vários agendamentos enquanto a máquina esteve dias offline?

## Requirements *(mandatory)*

### Requisitos funcionais

**Gatilho e segurança**

- **FR-001**: O sistema MUST assinar e verificar o webhook do Cal.com por HMAC-SHA256 usando o header `x-cal-signature-256`, e MUST descartar evento com assinatura inválida.
- **FR-002**: O sistema MUST ser idempotente por identificador de agendamento: o mesmo evento entregue duas vezes produz um resultado, não dois.
- **FR-003**: O sistema MUST enfileirar o agendamento de forma durável, para sobreviver à máquina do Yan estar desligada.

**Card do lead**

- **FR-004**: O sistema MUST criar a pasta e o card em `_pipeline/clientes/<slug>/<slug>.md` seguindo o padrão de organização do brain.
- **FR-005**: O frontmatter MUST satisfazer `schema-clientes.js` integralmente, com `status: call-marcada`.
- **FR-006**: O card MUST registrar origem, contato, data e hora da call, e próximo passo datado.
- **FR-007**: As respostas do formulário MUST ser preservadas com o texto literal do lead nas perguntas abertas.
- **FR-008**: O sistema MUST NOT gravar card que reprove na validação do schema. Falha é falha completa, nunca gravação parcial.
- **FR-009**: Agendamento repetido do mesmo lead MUST atualizar o card existente.

**Roteiro**

- **FR-010**: O sistema MUST gerar o call-card de diagnóstico pelo comando `/call-roteiro` no modo Call 1.
- **FR-011**: O roteiro MUST ser validado por `validate-call-card.mjs` com exit 0 antes de ser considerado entregue.
- **FR-012**: O roteiro MUST NOT conter oferta, faixa, SKU, preço, demo comercial ou negociação, conforme a regra 1 do comando.
- **FR-013**: O PREP MUST separar o que o lead afirmou do que é hipótese da Infuser.
- **FR-014**: Quando o formulário não der base para uma parte do PREP, o sistema MUST registrar a lacuna como pergunta a fazer na call, e MUST NOT preencher com suposição.
- **FR-015**: O roteiro MUST sair **sempre no modo andaime**, com as falas literais. Não há variação por pessoa.
  - Motivo: a agenda é única e compartilhada, sem round robin, então o sistema não sabe nem pode saber quem vai conduzir. Gerar um modo por host exigiria uma informação que o agendamento não carrega.
  - O andaime serve aos três. Iago e Pedro usam as falas prontas; o Yan ignora e usa só os movimentos.
  - O andaime MUST trazer o que o método de vendas prescreve para eles: abertura, ponte de assunto, as respostas das objeções conhecidas e a regra de perguntar de volta e calar.
  - O sistema MUST disponibilizar o roteiro num lugar que os três alcancem, já que qualquer um pode assumir a call.

**Propagação no brain**

- **FR-016**: O sistema MUST propagar o cliente novo no `_pipeline/clientes/INDEX.md`, sob pena de o hook Stop bloquear a sessão seguinte por órfão.
- **FR-017**: O sistema MUST rodar o refresh dos blocos gerados depois de criar o card.

**Observabilidade**

- **FR-018**: Toda execução MUST registrar início, fim e resultado, com identificador do agendamento.
- **FR-019**: Falha em qualquer etapa MUST notificar de forma que alguém veja antes da call, e MUST NOT terminar com sucesso aparente.
- **FR-020**: O sistema MUST avisar quando existir call marcada em menos de 24 horas sem roteiro gerado.
- **FR-021**: O sistema MUST NOT registrar dado pessoal do lead em log.

**Resolvidos em 14/08**

- **FR-022**: ✅ Em `BOOKING_CANCELLED`, o sistema MUST anotar o cancelamento no card e MUST NOT apagar card nem roteiro. Em `BOOKING_RESCHEDULED`, MUST atualizar a data e MUST NOT regerar o roteiro, porque o conteúdo do diagnóstico não mudou e o modo é único.
- **FR-023**: ✅ O aviso de falha MUST usar o canal `OPS - alert` que já existe no n8n (`M0DVv7r86uqKUjnE`), enviando `{source, severity, message}`. O sistema MUST NOT criar canal de alerta novo.
- **FR-024**: ✅ Quando o CNPJ ou o domínio de e-mail casar com cliente ativo, o sistema MUST NOT criar card novo. MUST avisar pelo `OPS - alert` e MUST registrar o interesse vinculado ao cliente existente, para virar conversa de expansão.

### Entidades

- **Agendamento**: identificador do Cal.com, data e hora da call, dados do lead e as respostas do formulário, mais o estado de processamento.
- **Card do cliente**: a entidade do brain, com o frontmatter do schema e as respostas registradas.
- **Roteiro**: o arquivo HTML validado, vinculado ao card.
- **Execução**: registro de cada tentativa, com resultado e motivo da falha quando houver.

## Success Criteria *(mandatory)*

### Resultados mensuráveis

- **SC-001**: Toda call agendada tem card no brain sem digitação manual.
- **SC-002**: Toda call agendada tem roteiro validado disponível antes do horário da call.
- **SC-003**: Nenhum roteiro entregue reprova no `validate-call-card.mjs`.
- **SC-004**: Nenhuma falha da rotina termina em silêncio. Toda quebra é visível antes da call acontecer.
- **SC-005**: O tempo entre o agendamento e o roteiro disponível é medido, e o caso de máquina offline aparece nessa medição em vez de sumir.
- **SC-006**: O Yan entra na Call 1 tendo lido um roteiro que ele não escreveu.

## Assumptions

- O motor roda na máquina do Yan, onde o brain está clonado com acesso a `_empresa/`. Migrar para a VPS exigiria clonar o brain lá, o que é decisão separada e não está nesta spec.
- O volume é baixo, poucas calls por semana, então o consumo da assinatura Max é irrelevante e não há necessidade de API key dedicada.
- A qualidade do PREP é limitada pelo que o formulário coleta. Esta feature não compensa formulário raso, ela expõe a lacuna em vez de inventar. Quando a feature 002 existir, o mapa da Call 1 vira insumo do roteiro da Call 2.
- A Call 1 cai numa agenda única, a do Yan, já conectada ao Cal.com via Google e já compartilhada com Iago e Pedro. Quem estiver disponível pega. Não há pré-requisito de conectar outras agendas, e não há host atribuído pelo sistema.
- 🔴 Quem conduz o diagnóstico na maior parte das vezes não é técnico. O roteiro em modo andaime é o que sustenta a qualidade da call, e é por isso que ele deixa de ser opcional. O material que a feature `002` recebe depois é a transcrição dessa call, então a profundidade técnica do mapa fica limitada pela profundidade do que foi perguntado ao vivo.
- O comando `/call-roteiro` é a fonte do formato e não é reimplementado aqui. Se o método de venda mudar, muda o comando, não esta feature.
- O Claude Agent SDK se autodeclara alpha e quebra em versões menores, então a versão precisa ser fixada e testada antes de subir, do mesmo jeito que já se faz com o `@playwright/mcp` no worker do Auto Select.
