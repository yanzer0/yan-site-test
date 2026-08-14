# Feature Specification: Gerador do mapa de diagnóstico da Call 1

**Feature Branch**: `002-mapa-diagnostico-gerador`

**Created**: 2026-08-14

**Status**: Draft

**Input**: Ao final da Call 1 de diagnóstico, o lead recebe um documento com o mapa dos processos da operação dele e onde IA, automação e agentes encaixam. O documento é gerado a partir da transcrição da call somada às respostas do formulário, não escrito à mão.

## Por que isto existe

A Call 1 é gratuita e consome a hora mais cara da Infuser, que é a do Yan. Hoje ela sai da call sem nenhum artefato: o valor fica na memória do lead e evapora até a Call 2.

O mapa resolve três coisas ao mesmo tempo. Ele é a promessa que faz o lead aparecer na call, ele é o material que sustenta a proposta da Call 2, e ele é prova viva do produto, porque o documento sai do mesmo tipo de sistema que a Infuser instala no cliente.

Se for escrito à mão, cada call gratuita passa a consumir tempo de produção do Yan, que já é o gargalo do delivery, e o funil se estrangula sozinho quando o volume subir. Por isso a geração é automática.

## Risco que o desenho precisa endereçar

Um documento com os processos mapeados e onde a IA encaixa é exatamente o que um lead consegue levar para outro implementador executar mais barato.

A mitigação é de conteúdo, não de contrato: o mapa entrega o **o quê** e o **onde dói**, nunca o **como**. Ele nomeia os pontos de encaixe, as dependências e os limites. Ele não traz arquitetura, ferramenta específica por etapa, sequência de implementação nem estimativa de esforço. Isso é o que se compra.

## Clarifications

### Session 2026-08-14

- Q: De onde vem a transcrição da Call 1? → A: A call continua no Google Meet, e a transcrição é feita na GPU local do Yan pelo `/video-gpu`, que já é hábito e roda offline. Não se depende da transcrição do Cal Video, cuja disponibilidade e custo a documentação não confirma.
- Q: Quanto tempo depois da call o lead recebe o mapa? → A: No mesmo dia. Dá folga para transcrever, gerar e aprovar, e ainda chega com a conversa quente.
- Q: Por onde o mapa chega ao lead? → A: Link para uma página própria no `useinfuser.com`, identidade v2. Permite medir abertura, que é sinal de temperatura antes da Call 2, e evita anexo pesado no celular.
- Q: Qual o prazo de retenção da transcrição? → A: Enquanto o lead estiver no funil, mais 90 dias após a última interação. Depois disso, apaga-se a transcrição e mantém-se o mapa e os achados estruturados, que já não contêm áudio nem fala bruta.
- Q: O mapa herda a identidade de qual canal? → A: Documento entregue ao cliente, portanto identidade v2 completa, e ele ganha template canônico próprio no registry do brain.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - O lead recebe o mapa e ele reflete a própria call (Priority: P1)

Terminada a Call 1, o lead recebe em pouco tempo um documento com o processo dele desenhado do começo ao fim, os pontos onde o tempo e o erro se acumulam, onde IA e automação encaixam, o que precisa existir para funcionar e o que não dá para fazer. Ele reconhece a própria operação ali dentro, com as palavras que ele usou.

**Why this priority**: É a promessa feita na captura. Sem ela, a feature 001 promete algo que não é entregue, o que é pior do que não prometer.

**Independent Test**: Rodar o gerador contra uma transcrição real de Call 1 mais as respostas do formulário do mesmo lead e verificar que o documento produzido contém o processo mapeado, os pontos de encaixe, as dependências e os limites, e que cada afirmação sobre a operação do cliente tem origem rastreável na transcrição.

**Acceptance Scenarios**:

1. **Given** uma transcrição de Call 1 e as respostas do formulário do mesmo lead, **When** o gerador roda, **Then** produz um documento com as seis seções obrigatórias preenchidas.
2. **Given** um documento gerado, **When** ele é inspecionado, **Then** tudo que é fato dito pelo cliente está separado e rotulado como tal, e tudo que é leitura da Infuser está separado e rotulado como inferência.
3. **Given** um documento gerado, **When** ele é aberto no celular, **Then** é self-contained, com imagens embutidas, sem quebra de layout e sem rolagem horizontal.
4. **Given** um documento gerado, **When** ele é revisado contra a regra de conteúdo, **Then** não contém arquitetura de solução, nome de ferramenta por etapa, sequência de implementação, estimativa de esforço, prazo ou preço.

---

### User Story 2 - O Yan aprova em um clique antes de sair (Priority: P1)

Antes de chegar ao lead, o documento passa por uma tela de aceite onde o Yan lê e aprova, ou marca correção. A aprovação é um clique, não uma reescrita.

**Why this priority**: Documento gerado por modelo que vai direto para a mão do cliente viola a lei da casa de que texto client-facing só contém fato verificado. Errar aqui queima o Yan com o cliente, que é o dano mais caro do funil inteiro, e já aconteceu antes.

Isto não é o desenho híbrido em que o agente rascunha e o humano escreve. O agente produz o documento completo e pronto para envio. O humano só dá o aceite.

**Independent Test**: Gerar um documento e verificar que ele não é entregável ao lead enquanto não houver registro de aprovação, e que aprovar é uma ação única.

**Acceptance Scenarios**:

1. **Given** um documento gerado, **When** ninguém aprovou ainda, **Then** ele não é enviável ao lead por nenhum caminho do sistema.
2. **Given** um documento aprovado, **When** a aprovação é registrada, **Then** ficam gravados quem aprovou e quando.
3. **Given** uma sequência de documentos, **When** a taxa de documentos que precisaram de correção é medida, **Then** o número fica disponível para decidir se o gate continua necessário.

---

### User Story 3 - O mapa alimenta a Call 2 (Priority: P2)

Quando a proposta da Call 2 é montada, o conteúdo do mapa está disponível como insumo estruturado, e não como um PDF que alguém precisa reler e transcrever.

**Why this priority**: É o que transforma o custo da call gratuita em ativo comercial. Depende da P1 existir, por isso vem depois.

**Independent Test**: A partir de um mapa aprovado, obter os pontos de encaixe, as dependências e os limites em formato estruturado, prontos para virar escopo.

**Acceptance Scenarios**:

1. **Given** um mapa aprovado, **When** o escopo da proposta é montado, **Then** os pontos de encaixe e as dependências estão disponíveis em formato consultável, não apenas no documento renderizado.

---

### Edge Cases

- O que acontece quando a transcrição vem ruim, cortada, ou com áudio ruim em parte da call?
- O que acontece quando a call revela que não há processo recorrente nenhum, ou seja, o lead não era ICP e o formulário errou?
- O que acontece quando o cliente cita nomes de pessoas, números de contrato, valores ou dados de terceiros na call? Isso não pode entrar no documento nem em log.
- O que acontece quando o modelo não encontra base na transcrição para uma das seis seções? Seção vazia é honesto, seção inventada é o pior resultado possível.
- O que acontece quando o Yan reprova o documento? Regera, edita à mão, ou descarta?
- O que acontece quando o lead pede o mapa e a call foi gravada sem que ele tenha consentido com a gravação?

## Requirements *(mandatory)*

### Requisitos funcionais

**Entrada**

- **FR-001**: O gerador MUST aceitar como entrada a transcrição da Call 1 e as respostas do formulário do mesmo lead.
- **FR-002**: O gerador MUST vincular o documento ao registro de lead criado pela feature 001.
- **FR-003**: O sistema MUST exigir consentimento de gravação registrado antes de processar qualquer transcrição.

**Conteúdo do documento**

- **FR-004**: O documento MUST conter seis seções: o processo como ele funciona hoje, onde o tempo e o erro se acumulam, onde IA e automação encaixam, o que precisa existir para funcionar, o que não dá para fazer, e o próximo passo.
- **FR-005**: Toda afirmação sobre a operação do cliente MUST ser rastreável à transcrição ou ao formulário.
- **FR-006**: O documento MUST separar e rotular visualmente o que é fato dito pelo cliente e o que é inferência da Infuser.
- **FR-007**: O documento MUST usar as palavras do próprio cliente onde ele descreveu o processo, preservadas como citação.
- **FR-008**: O documento MUST NOT conter arquitetura de solução, ferramenta específica por etapa, sequência de implementação, estimativa de esforço, prazo de entrega ou qualquer valor.
- **FR-009**: A seção de limites MUST nomear o que a Infuser avalia que não dá para automatizar naquele caso, e por quê.
- **FR-010**: Quando não houver base na entrada para uma seção, o gerador MUST deixar registrado que não houve base, e MUST NOT preencher com conteúdo genérico.

**Forma**

- **FR-011**: O documento MUST usar a **identidade v2 completa** da Infuser, lida de `_knowledge/branding/infuser-v2/tokens.css` no brain. O canal é documento entregue ao cliente, e nesse canal a v2 é obrigatória.
  - Tipografia da v2: `Inter` para display, `Onest` para corpo, `Geist Mono` para mono.
  - O documento MUST NOT usar `Fraunces`, `JetBrains Mono` ou `Cabinet Grotesk`, nem declarar `--green: #A8E84C`. Essas são as assinaturas da identidade v1.1, superada para este canal, e são exatamente os fingerprints que o guard do brain rejeita.
  - A identidade **não se herda do artefato vizinho**. Mesmo reaproveitando gerador existente, os tokens da v2 precisam ser confirmados na fonte antes de gerar.
- **FR-011a**: O mapa MUST nascer de um **template canônico próprio**, registrado como classe nova em `scripts/lib/templates-registry.js` no brain, com o `legado` preenchido com os fingerprints da v1.1. Sem entrada no registry, o guard não cobre esta classe de documento e a identidade errada passa silenciosamente.
  - 🔴 **A ordem importa e não pode ser invertida.** O guard 5 do `pretool-guardrails.js` só libera a escrita de um documento depois que o template canônico daquela classe foi **lido** na sessão. Registrar a classe apontando para um template que ainda não existe torna o arquivo impossível de ler, e portanto impossível de escrever: o guard trava a própria implementação, para sempre.
  - Sequência obrigatória: criar `_knowledge/templates/mapa-diagnostico/mapa-diagnostico.template.html` com a identidade v2 **primeiro**, e só então adicionar a entrada no registry.
  - `saida` sugerida para a entrada: `/_pipeline\/clientes\/.*mapa-diagnostico[^/]*\.html$/i`, coerente com as outras classes de deliverable de cliente.
- **FR-012**: O documento MUST ser self-contained, com imagens embutidas em base64, e legível em celular sem rolagem horizontal.
- **FR-012a**: O documento MUST ser **no-JS-safe**: todo o conteúdo visível por padrão, com animação apenas como realce progressivo. Visualizador sem JavaScript não pode resultar em página em branco.
- **FR-013**: A entrega ao lead MUST ser por **link para página própria** no `useinfuser.com`, com a identidade v2. O mesmo conteúdo MUST ficar disponível em forma estruturada para consumo interno da Call 2.
- **FR-013a**: A página do mapa MUST registrar abertura e número de visitas, porque isso é sinal de temperatura antes da Call 2. O registro MUST NOT expor dado pessoal na URL: o endereço da página usa identificador opaco, nunca nome, e-mail ou empresa.
- **FR-013b**: A página do mapa MUST ser privada por link não listado e MUST NOT ser indexável por buscador.
- **FR-014**: A copy MUST seguir as regras da casa: sem em-dash, sem palavra banida do tone-of-voice, sem urgência fabricada, sem mencionar que o material foi gerado por IA. Todo texto que o cliente lê MUST estar em português correto e acentuado.

**Aprovação e envio**

- **FR-015**: O documento MUST passar por aprovação humana registrada antes de ficar disponível ao lead.
- **FR-016**: A aprovação MUST ser uma ação única, sem exigir reescrita do documento.
- **FR-017**: O sistema MUST registrar quem aprovou, quando, e se houve correção antes da aprovação.
- **FR-018**: O sistema MUST medir a proporção de documentos que precisaram de correção, para que o gate de aprovação possa ser reavaliado com dado em vez de opinião.

**Dados sensíveis**

- **FR-019**: Transcrição de call MUST ser tratada como dado sensível de cliente: não entra em repositório versionado, não vai para log, e tem prazo de retenção definido.
- **FR-020**: O gerador MUST remover do documento nomes de terceiros, valores de contrato e identificadores que o cliente tenha citado de passagem e que não pertençam ao mapa do processo.

**Resolvidos em 14/08**

- **FR-021**: ✅ A call acontece no **Google Meet** e a transcrição é gerada na **GPU local do Yan** pelo `/video-gpu`, que roda offline e já é hábito. O sistema MUST aceitar a transcrição como arquivo de entrada, e MUST NOT depender de transcrição de provedor de vídeo. Consequência aceita: existe um passo humano entre a call e a geração, que é baixar a gravação e rodar a transcrição.
- **FR-022**: ✅ O mapa MUST ser entregue ao lead **no mesmo dia da call**. O sistema MUST avisar quando o dia estiver acabando e um mapa ainda não tiver sido aprovado.
- **FR-023**: ✅ A entrega é por link de página própria, ver FR-013.
- **FR-024**: ✅ A transcrição MUST ser retida enquanto o lead estiver no funil, mais 90 dias após a última interação. Passado esse prazo, o sistema MUST apagar a transcrição e MUST preservar o mapa e os achados estruturados, que já não contêm fala bruta. O lead MUST poder pedir a exclusão antes do prazo.

### Entidades

- **Transcrição**: o texto da call, com data, duração, participantes e o registro de consentimento de gravação.
- **Mapa**: o documento gerado. Vinculado ao lead, com versão, estado (gerado, aprovado, entregue) e o registro de quem aprovou.
- **Achado**: cada item estruturado do mapa. Tipo (processo, ponto de atrito, ponto de encaixe, dependência, limite), o texto, a classificação entre fato e inferência, e a referência à origem na entrada.
- **Registro de aprovação**: quem, quando, se houve correção, e qual.

## Success Criteria *(mandatory)*

### Resultados mensuráveis

- **SC-001**: O tempo de produção humano por mapa é medido e fica limitado ao tempo de leitura e aprovação, não ao de redação.
- **SC-002**: Todo lead que faz a Call 1 recebe o mapa. Nenhuma call de diagnóstico termina sem entregável.
- **SC-003**: Nenhum mapa entregue contém afirmação sobre a operação do cliente sem origem rastreável na entrada.
- **SC-004**: A proporção de mapas que precisaram de correção antes da aprovação é medida desde o primeiro, e serve de base para decidir o futuro do gate.
- **SC-005**: A Call 2 é montada a partir do mapa sem que ninguém precise reler a transcrição inteira.
- **SC-006**: A taxa de comparecimento na Call 1 é comparada antes e depois da promessa do mapa entrar no formulário, para saber se a promessa realmente aumenta o show-up.

## Assumptions

- A Call 1 é gravada e transcrita com consentimento do lead. Sem consentimento não há mapa, e isso precisa estar dito na confirmação de agendamento da feature 001.
- 🔴 **A qualidade do mapa é limitada pela qualidade da call.** A decisão de 14/08 é que Iago e Pedro conduzem a maior parte dos diagnósticos, e nenhum dos dois é técnico. O gerador não inventa profundidade que não foi perguntada ao vivo: se a call não levantou sistemas, volumes e exceções, o mapa registra a lacuna em vez de preencher. Isso é o comportamento correto, mas significa que o mapa fica mais fino, e o gate de aprovação vai pegar mais correção no começo. A taxa de correção medida em FR-018 é o termômetro disso.
- O volume inicial é baixo, na ordem de poucas calls por semana, o que torna o gate de aprovação humana barato agora. A premissa muda se o volume subir, e é por isso que a taxa de correção é medida desde o começo.
- O mapa é entregue depois da Call 1 e antes da Call 2, e é insumo da proposta, não substituto dela.
- A identidade v2 e o padrão de HTML self-contained já existem no brain e são reaproveitados, não redesenhados aqui.
- O documento não é uma proposta e não cria obrigação de entrega. O texto precisa deixar isso claro sem soar defensivo.
- A feature 001 é pré-requisito, porque é ela que cria o registro de lead ao qual o mapa se vincula e é ela que faz a promessa que este documento cumpre.
