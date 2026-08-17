-- Reembolso do Mapa de IA: liga o pedido ao PaymentIntent do Stripe.
-- Rodar uma vez no Postgres. É idempotente.
--
-- Por que a coluna existe: o evento `charge.refunded` NÃO traz o
-- `checkout.session.id`, que é a chave que usamos até aqui. Ele traz o
-- `payment_intent`. Sem guardar esse identificador no momento do pagamento, o
-- reembolso chega e não há como saber qual pedido ele desfaz sem uma consulta
-- extra à API do Stripe, que pode falhar justamente quando mais importa.

ALTER TABLE pedidos_mapa
  ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT;

-- A pergunta que o webhook de reembolso faz: "qual pedido é este PaymentIntent?".
CREATE INDEX IF NOT EXISTS pedidos_mapa_payment_intent_idx
  ON pedidos_mapa (stripe_payment_intent);

-- Quando o reembolso foi processado. NULL enquanto o pedido está de pé.
ALTER TABLE pedidos_mapa
  ADD COLUMN IF NOT EXISTS reembolsado_em TIMESTAMPTZ;
