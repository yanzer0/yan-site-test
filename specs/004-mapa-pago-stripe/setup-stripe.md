# Criar o Mapa de IA de R$ 197 no Stripe, clique a clique

**Verificado na documentação oficial em 17/08/2026.** Cinco passos, uns 10 minutos.

O código do lado do site já está pronto e testado. O que falta é o que só você pode fazer: criar a conta, o produto e as chaves.

**Por que Stripe e não Hubla:** a Hubla é boa no que você já vende nela, que é infoproduto de compra por impulso. O Mapa de IA é serviço com hora marcada e entrega humana, e o pagamento precisa liberar o agendamento — senão alguém paga e some, ou marca e não paga. O Payment Link do Stripe resolve isso com um redirecionamento, sem página de vendas e sem código a mais. Detalhe prático que pesou: o repositório já tem webhook de Kiwify; a Hubla seria a terceira plataforma de pagamento no mesmo código.

---

## Passo 1: a conta

**https://dashboard.stripe.com/register**

Use o CNPJ da Infuser (66.396.412/0001-09). O Stripe pede dados bancários para o repasse, e a validação leva de algumas horas a um dia útil.

🔴 **Dá para fazer tudo o que segue no modo de teste, antes da conta ser aprovada.** O painel tem um interruptor **Test mode** no topo. As chaves de teste começam com `sk_test_` e `pk_test_`, e o cartão `4242 4242 4242 4242` (validade futura, CVC qualquer) simula uma compra aprovada. Recomendo fazer assim: a gente prova o fluxo inteiro hoje e troca as chaves quando a conta for aprovada.

## Passo 2: o produto

**https://dashboard.stripe.com/products/create**

- **Name**: `Mapa de IA`
- **Description**: `Diagnóstico de uma hora da sua operação, com o mapa por escrito de onde a IA encaixa.`
- **Amount**: `197.00`
- **Currency**: `BRL`
- Marque **One-off** (pagamento único), não recorrente

Salve.

## Passo 3: o Payment Link

Na página do produto, **Create payment link**.

Três opções que importam, o resto pode ficar no padrão:

1. Em **After payment**, escolha **Redirect customers to your website** e cole exatamente:

   ```
   https://useinfuser.com/diagnostico/pago?session_id={CHECKOUT_SESSION_ID}
   ```

   🔴 O `{CHECKOUT_SESSION_ID}` vai **literal**, com as chaves. O Stripe substitui pelo id real. Se você digitar outra coisa ali, a página não confirma o pagamento e o comprador vê "não consegui confirmar".

2. Em **Options**, deixe ligado o campo de e-mail. É por ele que a gente liga o pagamento ao lead.

3. Não ligue **Collect addresses** nem **Allow promotion codes** por enquanto. Menos campo, menos abandono no checkout.

Copie a URL gerada. Ela tem a forma `https://buy.stripe.com/xxxxxxxx`.

## Passo 4: as chaves da API

**https://dashboard.stripe.com/apikeys**

Copie a **Secret key**. Em modo de teste ela começa com `sk_test_`; em produção, `sk_live_`.

Não precisa da publishable key: o site não abre checkout próprio, só redireciona para o link.

## Passo 5: o webhook

**https://dashboard.stripe.com/webhooks** → **Add endpoint**

- **Endpoint URL**:

  ```
  https://useinfuser.com/api/diagnostico/mapa-pago/webhook
  ```

- Em **Select events**, marque **apenas** `checkout.session.completed`. Um evento só, de propósito: é o único que garante pagamento concluído, e assinar o resto seria barulho que a rota descarta.

Depois de criar, abra o endpoint e revele o **Signing secret**. Ele começa com `whsec_`.

---

## O que me mandar

Três coisas:

| | |
|---|---|
| URL do Payment Link | `https://buy.stripe.com/...` |
| Secret key | `sk_test_...` ou `sk_live_...` |
| Signing secret do webhook | `whsec_...` |

Eu configuro nos três ambientes da Vercel sem ecoar em lugar nenhum, do mesmo jeito que fiz com a credencial do Google.

**Melhor ainda:** salve num arquivo de texto fora de qualquer pasta de repositório e me diga o caminho. Aí o conteúdo não passa pelo chat. Foi o que funcionou com a service account.

---

## Como o fluxo fica

```
lead sem encaixe    →  card "Mapa de IA · R$ 197"  →  Payment Link do Stripe
                                                             ↓ paga
     webhook grava o pedido no banco   ←──────────────────────┤
                                                             ↓ redireciona
                          /diagnostico/pago  →  confere a sessão NO STRIPE
                                                             ↓ confirmado
                                       calendário do Cal.com na tela
```

Duas travas que já estão no código:

- **A confirmação nunca vem da URL.** O `session_id` é consultado no Stripe a cada carregamento. Editar a query string não libera nada.
- **Um pagamento, uma call.** O pedido sai de `pago` para `agendado` quando a call é marcada, e o link de retorno guardado no histórico do navegador não agenda de novo.

## O que ainda não está decidido

A call paga é a mesma call gratuita, de uma hora. Se você quiser que ela seja diferente — mais curta, ou com escopo próprio — isso muda o event type do Cal.com e o texto da página, e é melhor decidir antes de vender a primeira.
