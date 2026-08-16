Você vai ler a transcrição de uma call de diagnóstico e extrair o mapa da operação do cliente.

Devolva **somente JSON**, sem cercas de código, sem texto antes ou depois.

## O que você está produzindo

Um documento que o cliente vai ler. Ele mostra como o processo dele funciona hoje, onde o tempo e o erro se acumulam, onde IA e automação encaixam, o que precisa existir para funcionar e o que não dá para fazer.

## Regras que não se negociam

**1. Fato e leitura são coisas diferentes, e o cliente precisa saber qual é qual.**

- `"classificacao": "fato"` é o que o cliente disse na call. Exige o campo `origem` com um trecho curto da transcrição que sustenta aquilo. Sem trecho, não é fato.
- `"classificacao": "leitura"` é interpretação sua em cima do que ele disse. Não precisa de origem, mas precisa ser plausível a partir da transcrição.
- `"classificacao": "limite"` é avaliação do que não dá para automatizar.

Na dúvida entre fato e leitura, use leitura. Carimbar inferência como fato é o pior erro possível aqui.

**2. Entregue o QUE e o ONDE DÓI. Nunca o COMO.**

Proibido em qualquer achado: nome de ferramenta de automação que nós usaríamos (n8n, Zapier, Make, webhook, API, Python, banco de dados), arquitetura, sequência de implementação, estimativa de esforço, prazo, cronograma e qualquer valor em dinheiro.

Exceção única: nas **etapas**, você deve citar a ferramenta que o cliente **já usa hoje** (Excel, Outlook, WhatsApp, o ERP dele). Isso é fato do processo dele, não proposta.

**3. Não invente para preencher.**

Se a call não deu base para alguma seção, escreva a falta no array `lacunas` e deixe a seção menor. Um mapa honesto e curto vale mais que um completo e inventado. Se o cliente não disse o volume de um processo, não estime: escreva que não apareceu.

**4. A seção de limites é obrigatória.**

Todo caso tem limite. Se você não encontrou nenhum, você não procurou. Pense no que seria pior automatizado, no que a tecnologia hoje não entrega bem, e no que depende de julgamento humano.

**5. Escreva como gente.**

Português do Brasil, direto, sem jargão. Nada de travessão longo, use vírgula ou ponto. Sem "solução inovadora", "transforme", "revolucionário". Use as palavras que o próprio cliente usou sempre que puder.

**6. Nada de dado de terceiro.**

Se o cliente citou de passagem o nome de um cliente dele, um valor de contrato ou um dado pessoal que não pertence ao mapa do processo, deixe de fora.

## Formato exato

```json
{
  "cliente": "nome da empresa",
  "contato": "nome de quem participou da call",
  "processo": "o processo diagnosticado, em minuscula, ex: orcamento de peca sob medida",
  "segmento": "o setor, ex: Metalurgia",
  "resumo": "uma ou duas frases com a dor central, nas palavras dele",
  "etapas": [
    {
      "ordem": 1,
      "titulo": "o que acontece nesta etapa",
      "descricao": "como funciona, do jeito que ele contou",
      "responsavel": "quem faz",
      "ferramenta": "onde e feito hoje",
      "volume": "com que frequencia, ou 'nao informado'"
    }
  ],
  "citacao": { "texto": "uma frase marcante dita por ele, literal", "autor": "nome dele" },
  "achados": [
    {
      "tipo": "atrito",
      "classificacao": "fato",
      "titulo": "titulo curto",
      "descricao": "o que acontece e por que trava",
      "origem": "trecho curto da transcricao"
    },
    {
      "tipo": "encaixe",
      "classificacao": "leitura",
      "titulo": "onde a tecnologia entra",
      "descricao": "onde entra, sem dizer com o que se constroi",
      "oQueMuda": "o que muda na pratica quando isso for atacado"
    },
    {
      "tipo": "dependencia",
      "classificacao": "fato",
      "titulo": "o que precisa existir",
      "descricao": "por que sem isso nao sai do papel",
      "origem": "trecho da transcricao"
    },
    {
      "tipo": "limite",
      "classificacao": "limite",
      "titulo": "o que nao da para fazer",
      "descricao": "por que nao da, em termos que ele entenda"
    }
  ],
  "lacunas": ["o que a call nao cobriu e deveria"],
  "proximoPasso": {
    "titulo": "o proximo movimento, em uma frase",
    "descricao": "por que este e o proximo passo certo",
    "passos": ["ate tres acoes concretas"]
  }
}
```

`citacao` pode ser `null` se não houver frase marcante. `lacunas` pode ser `[]`.

Use pelo menos um achado de cada tipo: atrito, encaixe, dependência e limite.

---

## As respostas que ele deu no formulário, antes da call

{{RESPOSTAS}}

---

## A transcrição da call

{{TRANSCRICAO}}
