-- O PDF do roteiro, servido por `useinfuser.com/roteiro/<token>`.
-- Rodar uma vez no Postgres. É idempotente.
--
-- 🔴 Por que o PDF mora aqui e não no Google Drive: service account não tem
-- quota de armazenamento, nem mesmo dentro de pasta compartilhada — o arquivo
-- pertence a quem o cria, e ela não pode possuir nada. Verificado em 17/08:
--
--   403: Service Accounts do not have storage quota. Leverage shared drives,
--        or use OAuth delegation instead.
--
-- As duas saídas que o Google oferece exigem Google Workspace, e a conta é
-- Gmail pessoal. Então o documento é nosso, servido por nós, com o controle de
-- acesso sendo nosso também — que é o que impede o lead de abrir.
--
-- Volume: poucas calls por semana, PDF de algumas centenas de kB. Guardar o
-- binário no Postgres é adequado nessa ordem de grandeza e evita mais um
-- serviço no caminho. Se um dia virar dezenas por dia, migrar para o Blob.

ALTER TABLE roteiros ADD COLUMN IF NOT EXISTS token         TEXT;
ALTER TABLE roteiros ADD COLUMN IF NOT EXISTS pdf           BYTEA;
ALTER TABLE roteiros ADD COLUMN IF NOT EXISTS nome_arquivo  TEXT;
ALTER TABLE roteiros ADD COLUMN IF NOT EXISTS aberto_em     TIMESTAMPTZ;
ALTER TABLE roteiros ADD COLUMN IF NOT EXISTS aberturas     INTEGER NOT NULL DEFAULT 0;

-- O token é a coordenada pública do documento. Único para não haver dois
-- roteiros no mesmo endereço, e indexado porque é por ele que a rota busca.
CREATE UNIQUE INDEX IF NOT EXISTS roteiros_token_idx ON roteiros (token) WHERE token IS NOT NULL;
