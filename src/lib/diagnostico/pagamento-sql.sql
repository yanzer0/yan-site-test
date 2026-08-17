-- Pedidos pagos do Mapa de IA (R$ 197).
-- Rodar uma vez no Postgres. É idempotente.
--
-- Por que uma tabela e não confiar só no Stripe: quem decide se o lead pode
-- agendar é este banco, não o parâmetro que vem na URL. Sem registro local,
-- "pagou" viraria uma query string que qualquer um edita.

CREATE TABLE IF NOT EXISTS pedidos_mapa (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Idempotência: o Stripe reentrega webhook, e reentrega é normal, não erro.
  stripe_session_id TEXT        NOT NULL UNIQUE,

  -- O lead pode não existir ainda: alguém pode pagar por um link repassado sem
  -- ter preenchido o formulário. Por isso é opcional, e não uma FK obrigatória.
  lead_id           UUID        REFERENCES leads(id) ON DELETE SET NULL,

  email             TEXT        NOT NULL,
  email_norm        TEXT        NOT NULL,

  -- Em centavos, como o Stripe manda. Guardar em reais com ponto flutuante é
  -- como se perde dinheiro em arredondamento.
  valor_centavos    INTEGER     NOT NULL,
  moeda             TEXT        NOT NULL DEFAULT 'brl',

  estado            TEXT        NOT NULL DEFAULT 'pago'
                      CHECK (estado IN ('pago','agendado','reembolsado')),

  cal_booking_id    TEXT,
  pago_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A pergunta que a página de retorno faz: "este e-mail tem pagamento válido?".
CREATE INDEX IF NOT EXISTS pedidos_mapa_email_idx ON pedidos_mapa (email_norm, estado);
CREATE INDEX IF NOT EXISTS pedidos_mapa_pago_idx  ON pedidos_mapa (pago_em DESC);
