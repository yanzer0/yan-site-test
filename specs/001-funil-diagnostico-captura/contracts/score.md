# Contrato: score, faixas e roteamento

**Feature**: `001-funil-diagnostico-captura` | **Data**: 2026-08-14

Os valores abaixo vivem em `src/lib/diagnostico/score-config.json`, versionado em git. Alterar peso ou limiar é mudança de configuração, não de código, conforme FR-018. O cálculo é função pura em `src/lib/diagnostico/score.ts`.

> 🔴 **Estes pesos são chute informado pelo ICP, não verdade medida.** Eles precisam ser calibrados contra os primeiros leads reais, comparando a faixa que o sistema deu com a leitura de quem conduziu a call. A spec exige que sejam configuráveis exatamente por isso, e SC-006 é a métrica que decide o ajuste.

---

## Pontuação por critério

Máximo teórico: **16 pontos**.

### Operação existente, peso até 4

Da pergunta 7, frequência:

| Resposta | Pontos |
|---|---:|
| Várias vezes ao dia, Todo dia | 4 |
| Algumas vezes por semana, Semanal | 3 |
| Mensal | 2 |
| É esporádico, não tem ritmo | 0 |

`É esporádico` é eliminatório na prática: sem recorrência não há o que automatizar. Ver regra de corte duro abaixo.

Da pergunta 6, descrição do processo: soma **1 ponto** se a resposta tiver 120 caracteres ou mais. Quem descreve o processo em detalhe tem processo. Quem responde "vendas" não tem, ou não quer contar.

### Dor economicamente relevante, peso até 3

Da pergunta 8, consequências marcadas:

| Situação | Pontos |
|---|---:|
| 3 ou mais consequências marcadas | 3 |
| 2 consequências | 2 |
| 1 consequência | 1 |
| Só marcou `Não acontece muito` | 0 |

`Entra dinheiro errado, ou deixa de entrar` e `A gente perde prazo` somam **1 ponto extra** cada, com teto de 3 no critério. São as duas consequências que o cliente consegue quantificar na call.

### Informação disponível, peso até 3

Da pergunta 9, onde a informação mora:

| Situação | Pontos |
|---|---:|
| Ao menos uma fonte digital delimitável (Planilha, Sistema ou ERP, E-mail, Sistema próprio) | 2 |
| Duas ou mais fontes digitais | 3 |
| Só `WhatsApp` | 1 |
| Só `Papel ou na cabeça de alguém` | 0 |

Fonte digital é o que dá para ler. Papel e memória não são acessáveis, e é isso que o critério mede.

### Patrocinador operacional, peso até 2

Da pergunta 10:

| Resposta | Pontos |
|---|---:|
| Eu mesmo | 2 |
| Alguém do meu time, que eu sei quem é | 2 |
| Está espalhado, ninguém responde sozinho | 1 |
| Ninguém, na prática | 0 |

### Caminho de decisão, peso até 2

Da pergunta 11:

| Resposta | Pontos |
|---|---:|
| Só eu decido | 2 |
| Eu e mais um sócio | 2 |
| Preciso levar para a diretoria | 1 |
| Preciso de aprovação de outra área, TI ou jurídico | 1 |
| Não sou eu quem decide | 0 |

### Disposição de colaborar, peso até 2

Da pergunta 13:

| Resposta | Pontos |
|---|---:|
| Sim, sem problema | 2 |
| Sim, mas precisa passar por alguém | 1 |
| Difícil, temos restrição de acesso | 0 |
| Não sei dizer agora | 1 |

---

## Cortes duros, avaliados antes do score

Independem de pontuação. Se qualquer um bater, a faixa é decidida na hora.

| Condição | Faixa resultante |
|---|---|
| Pergunta 2 respondida como `Uso pessoal` | Não-ICP, caminho pessoal |
| Pergunta 7 respondida como `É esporádico, não tem ritmo` | Não-ICP de empresa |
| Pergunta 10 respondida como `Ninguém, na prática` **e** pergunta 11 como `Não sou eu quem decide` | Não-ICP de empresa |

O terceiro corte existe porque um lead sem dono do processo e sem poder de decisão não tem como avançar, por melhor que o resto pareça. Ele não é lead ruim, é lead cedo demais.

---

## Faixas

| Faixa | Pontos | O que acontece |
|---|---|---|
| **Qualificado** | 11 a 16 | Vê o seletor de horários do Cal.com na mesma sessão |
| **Revisão humana** | 6 a 10 | Registrado e notificado ao time. Sem agendamento automático e sem mensagem de recusa |
| **Não-ICP de empresa** | 0 a 5, ou corte duro | Registrado com motivo. Recebe a oferta do Mapa de IA |
| **Não-ICP pessoal** | corte duro | Registrado. Recebe o Kit Segundo Cérebro |

---

## Texto de cada final

O princípio IV e o FR-017 mandam: **em nenhuma faixa o lead lê que foi desqualificado, reprovado ou que não atende critérios.** O texto abaixo é o contrato de copy.

### Qualificado

> Fecha bem com o que a gente faz, [Nome]. Escolhe o melhor horário aí embaixo.
>
> A conversa é de uma hora, por vídeo. É diagnóstico: eu quero entender como o [processo] funciona aí dentro e te dizer com sinceridade o que dá e o que não dá para automatizar. Não tem apresentação, proposta nem preço.
>
> No fim da call você recebe o mapa da operação por escrito.

### Revisão humana

> Recebi, [Nome]. Obrigado pelo tempo.
>
> Pelo que você descreveu, faz sentido a gente olhar com calma antes de marcar. Alguém do time te chama no WhatsApp em até um dia útil para entender dois ou três pontos.

Nota: esta faixa não recebe oferta. Vender para quem ainda pode virar call gratuita queima a call.

### Não-ICP de empresa

> Vou ser direto com você, [Nome]: pelo que descreveu, a call de diagnóstico não é o melhor caminho agora, e eu não vou ocupar uma hora sua com uma conversa que não vai te servir.
>
> O que resolve o seu caso hoje é o **Mapa de IA**. É o mesmo diagnóstico, feito em cima do seu processo, e você sai com o mapa por escrito de onde a IA encaixa na sua operação. Custa R$ 197.
>
> Se em algum momento o cenário aí mudar, é só voltar aqui.

### Não-ICP pessoal

> Boa, [Nome]. Pelo que você contou, o que você quer é organizar o seu próprio contexto, e para isso a call de diagnóstico de empresa não serve.
>
> O que serve é o **Kit Segundo Cérebro**. É o sistema que eu uso todo dia para não reexplicar as coisas para a IA a cada conversa. Pagamento único de R$ 67.

---

## Por que a assimetria entre gratuito e pago é honesta

A call gratuita tem critério, o diagnóstico pago é aberto a qualquer um. Isso é verificável e ninguém pode acusar de incoerência.

É o oposto de dizer que há vagas limitadas, que seria **exclusividade fabricada**, listada nos anti-padrões proibidos do método de vendas da Infuser e rejeitada 5 a 5 pelo conselho de 12/06/2026. O motivo registrado lá vale aqui: comprador de 2026 chega pré-pesquisado e pega a incoerência.

---

## Casos de teste obrigatórios

Vivem em `tests/diagnostico/score.test.ts`. Fronteiras primeiro, porque é onde o erro aparece.

| Caso | Entrada | Faixa esperada |
|---|---|---|
| Fronteira inferior de qualificado | soma exata de 11 | Qualificado |
| Fronteira superior de revisão | soma exata de 10 | Revisão humana |
| Fronteira inferior de revisão | soma exata de 6 | Revisão humana |
| Fronteira superior de não-ICP | soma exata de 5 | Não-ICP de empresa |
| Corte duro vence score alto | todas as respostas ótimas, frequência `esporádico` | Não-ICP de empresa |
| Corte duro de dono e decisão | score 12, sem dono e sem decisão | Não-ICP de empresa |
| Uso pessoal ignora tudo | pergunta 2 pessoal | Não-ICP pessoal |
| Teto do critério de dor | 3 consequências incluindo dinheiro e prazo | 3 pontos, nunca 5 |
| Descrição curta não pontua | pergunta 6 com menos de 120 caracteres | sem o ponto de descrição |
