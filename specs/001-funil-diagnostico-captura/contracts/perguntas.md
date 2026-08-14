# Contrato: o conjunto de perguntas

**Feature**: `001-funil-diagnostico-captura` | **Data**: 2026-08-14

Este é o contrato do conteúdo. Mudar pergunta, opção ou ordem é mudança de spec, não de código.

Regras que governam tudo aqui, vindas dos princípios II e III da constitution: pergunta-se **situação**, nunca dor subjetiva, urgência ou orçamento. Toda pergunta pontuável mapeia para um critério do ICP, e todo critério do ICP tem pelo menos uma pergunta.

---

## Tela de abertura, antes da primeira pergunta

> **Uma hora de diagnóstico da sua operação, sem custo.**
>
> São 14 perguntas e leva uns 3 minutos. Se fizer sentido pros dois lados, você escolhe o horário aqui mesmo no final.
>
> Na call a gente mapeia como o seu processo funciona hoje e onde IA e automação encaixam de verdade. Depois você recebe esse mapa por escrito, para usar com a gente ou sem a gente.
>
> Não é apresentação comercial. Não tem proposta nem preço nessa conversa.

Nota de implementação: a última linha é o que separa esta call de tudo que o lead já recebeu de agência. Não cortar.

---

## Caminho de empresa: 14 perguntas

### 1. Como você se chama?

Texto curto. Obrigatória.

### 2. Isso é para uma empresa ou uso pessoal?

Escolha única. Obrigatória. **Esta pergunta ramifica.**

- Para uma empresa
- Uso pessoal
- Ainda não sei dizer

`Uso pessoal` desvia para o caminho curto. `Ainda não sei dizer` segue no caminho de empresa e é tratado no score.

### 3. Qual empresa, e qual o seu papel nela?

Dois campos numa pergunta. Nome em texto curto, papel em escolha única. Obrigatória.

Papel: Dono ou sócio · Diretoria · Gerência · Coordenação · Sou do time

### 4. Quantas pessoas trabalham aí?

Escolha única. Obrigatória.

Só eu · 2 a 5 · 6 a 20 · 21 a 50 · Mais de 50

### 5. Qual processo mais consome tempo do time hoje?

Texto curto. Obrigatória. **Critério ICP: operação existente.**

Placeholder: `cobrança, orçamento, atendimento, relatório, cadastro...`

A partir daqui, todas as perguntas se referem a este processo. A interface repete o que ele escreveu, para a conversa não ficar abstrata.

### 6. Como ele funciona hoje, do começo ao fim?

Texto longo. Obrigatória. **Critério ICP: operação existente.**

Ajuda: `Quem faz, em qual ferramenta, e o que acontece em cada passo. Pode escrever do seu jeito.`

Esta é a pergunta mais valiosa do formulário. É o texto literal dela que alimenta o PREP do roteiro da call.

### 7. Com que frequência isso acontece?

Escolha única. Obrigatória. **Critério ICP: operação existente, dimensão de volume.**

Várias vezes ao dia · Todo dia · Algumas vezes por semana · Semanal · Mensal · É esporádico, não tem ritmo

`É esporádico` é o sinal mais forte de que não existe processo recorrente para automatizar.

### 8. O que costuma acontecer quando esse processo atrasa ou sai errado?

Múltipla escolha. Obrigatória. **Critério ICP: dor economicamente relevante.**

- Alguém precisa refazer o trabalho
- O cliente percebe e reclama
- A gente perde prazo
- Entra dinheiro errado, ou deixa de entrar
- Sobra para uma pessoa só resolver
- Não acontece muito

Nota de método: pergunta-se a **consequência observável**, não "quanto isso te custa" nem "o quanto isso te incomoda". O número e a dor ficam para a call, onde o cliente articula em voz alta. Isso é o que separa esta pergunta de BANT.

### 9. Onde a informação desse processo fica hoje?

Múltipla escolha. Obrigatória. **Critério ICP: informação disponível.**

- Planilha
- Sistema ou ERP
- E-mail
- WhatsApp
- Papel ou na cabeça de alguém
- Sistema próprio, feito para a gente

### 10. Quem responde por esse processo no dia a dia?

Escolha única. Obrigatória. **Critério ICP: patrocinador operacional.**

- Eu mesmo
- Alguém do meu time, que eu sei quem é
- Está espalhado, ninguém responde sozinho
- Ninguém, na prática

### 11. Além de você, quem mais participa de uma decisão dessas?

Escolha única. Obrigatória. **Critério ICP: caminho de decisão.**

- Só eu decido
- Eu e mais um sócio
- Preciso levar para a diretoria
- Preciso de aprovação de outra área, TI ou jurídico
- Não sou eu quem decide

### 12. Vocês já tentaram resolver isso de alguma forma?

Múltipla escolha. Obrigatória.

- Não, é a primeira vez que a gente olha para isso
- Tentamos com ferramenta, não vingou
- Alguém do time tentou montar
- Contratamos alguém e não deu certo
- Usamos ChatGPT ou similar, sem método

`Contratamos alguém e não deu certo` é a cicatriz. Não muda o score, muda a condução da call: quem já gastou e se frustrou compra mais rápido de quem demonstra o que os outros não demonstraram, e o roteiro precisa saber disso antes.

### 13. Para desenhar isso direito, a gente precisa de acesso de leitura às ferramentas que você citou e de algumas horas do time. Isso é possível aí?

Escolha única. Obrigatória. **Critério ICP: disposição de colaborar.**

- Sim, sem problema
- Sim, mas precisa passar por alguém
- Difícil, temos restrição de acesso
- Não sei dizer agora

### 14. Onde eu te chamo?

Três campos numa pergunta. WhatsApp com DDD e e-mail, ambos obrigatórios. Mais: `Como você chegou até aqui?` em escolha única (Instagram · Indicação · YouTube · LinkedIn · Google · Outro).

---

## Tela de envio

Caixa **não pré-marcada**, obrigatória:

> Concordo em ser contatado e com o tratamento dos meus dados conforme a Política de Privacidade.

Com link para a política já publicada no site. O botão de envio fica inativo enquanto a caixa não for marcada.

---

## Caminho de uso pessoal: 5 perguntas

Entra quando a pergunta 2 é respondida como `Uso pessoal`. Nunca chega ao agendamento.

1. Como você se chama?
2. Isso é para uma empresa ou uso pessoal? (a mesma, que ramificou)
3. O que você quer organizar ou automatizar? (texto curto)
4. Você já usa alguma IA no seu dia a dia? (Uso todo dia · Uso às vezes · Já testei e parei · Nunca usei)
5. Qual o seu e-mail?

Mais a caixa de consentimento.

**Destino**: Kit Segundo Cérebro, R$ 67. Ver `score.md` para o texto exato da tela final.

---

## Rastreabilidade: todo critério do ICP tem pergunta

| Critério do ICP | Perguntas que o instrumentam |
|---|---|
| Operação existente | 5, 6, 7 |
| Dor economicamente relevante | 8 |
| Informação disponível | 9 |
| Patrocinador operacional | 10 |
| Caminho de decisão | 11 |
| Disposição de colaborar | 13 |

Nenhum critério sem pergunta. Nenhuma pergunta pontuável fora dos critérios. As perguntas 1, 2, 3, 4, 12 e 14 são identificação, ramificação, porte, contexto de condução e contato: elas não pontuam.

Este teste é executável e mora em `tests/diagnostico/perguntas.test.ts`. Se alguém adicionar pergunta pontuável sem critério, ou remover a última pergunta de um critério, o teste quebra.
