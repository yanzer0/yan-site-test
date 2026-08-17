-- Fila durável dos roteiros da Call 1 (feature 003).
-- Contrato: specs/003-roteiro-call-automatico/spec.md
--
-- Rodar uma vez no Postgres. É idempotente.
--
-- Por que uma tabela e não uma chamada síncrona no webhook: FR-003. Quem gera o
-- roteiro é a máquina do Yan, onde o brain vive, e ela pode estar desligada na
-- hora em que a call é marcada. O webhook precisa responder rápido e nunca
-- perder o trabalho. A fila é o que permite as duas coisas.

CREATE TABLE IF NOT EXISTS roteiros (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Uma linha por agendamento. É daqui que sai a idempotência de FR-002:
  -- o Cal.com reentregar o mesmo BOOKING_CREATED não cria segundo trabalho.
  cal_booking_id    TEXT        NOT NULL UNIQUE
                      REFERENCES agendamentos(cal_booking_id) ON DELETE CASCADE,

  estado            TEXT        NOT NULL DEFAULT 'pendente'
                      CHECK (estado IN ('pendente','processando','concluido','falhou')),

  -- `falhou` volta a ser elegível, então sem contador uma falha determinística
  -- (modelo devolvendo lixo, validador reprovando sempre) viraria laço infinito
  -- queimando a assinatura. O worker para depois do teto.
  tentativas        INTEGER     NOT NULL DEFAULT 0,
  ultimo_erro       TEXT,

  -- Descoberto na primeira execução e guardado: em remarcação o evento é o
  -- mesmo, e procurar de novo por horário daria no evento errado.
  google_event_id   TEXT,

  -- Caminho do HTML dentro do brain. Fica aqui para o card e o alerta poderem
  -- apontar para o arquivo sem adivinhar o nome.
  caminho_roteiro   TEXT,

  enfileirado_em    TIMESTAMPTZ NOT NULL DEFAULT now(),
  concluido_em      TIMESTAMPTZ,
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- O worker pergunta sempre a mesma coisa: o que está aberto, mais antigo
-- primeiro. Índice parcial porque concluído nunca é consultado por aqui e é o
-- que mais cresce.
CREATE INDEX IF NOT EXISTS roteiros_abertos_idx
  ON roteiros (enfileirado_em)
  WHERE estado IN ('pendente', 'falhou');

-- FR-020: achar call em menos de 24 horas ainda sem roteiro.
CREATE INDEX IF NOT EXISTS roteiros_estado_idx ON roteiros (estado);
