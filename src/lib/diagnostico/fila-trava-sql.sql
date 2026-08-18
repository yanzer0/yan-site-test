-- Trava da fila de roteiros: um item, um consumidor.
-- Rodar uma vez no Postgres. É idempotente.
--
-- Por que existe: `reservarTrabalho` devolvia tudo que estava `pendente` ou `falhou` e
-- nada marcava "alguém já pegou". Dois consumidores pegavam o mesmo item e
-- geravam o mesmo roteiro duas vezes, cada um queimando uma execução do modelo.
-- Aconteceu em 17/08: a VPS e uma tarefa agendada no PC do Yan processaram o
-- mesmo booking. O `flock` do supervisor protege contra dois processos no mesmo
-- host, e não contra dois hosts.
--
-- O estado `processando` já existia no CHECK desde o início. Faltava quem o
-- escrevesse, e faltava saber DESDE QUANDO, que é o que permite devolver à fila
-- o item cujo worker morreu no meio.

ALTER TABLE roteiros
  ADD COLUMN IF NOT EXISTS entregue_em TIMESTAMPTZ;

-- A consulta da fila filtra por estado e ordena por chegada.
CREATE INDEX IF NOT EXISTS roteiros_fila_idx
  ON roteiros (estado, enfileirado_em);
