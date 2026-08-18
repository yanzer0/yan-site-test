-- O roteiro anexado ao evento passa a ser HTML, e não PDF.
-- Rodar uma vez no Postgres. É idempotente.
--
-- Por que mudou: o roteiro SEMPRE nasceu HTML (é o que o worker grava no brain).
-- O PDF era uma conversão feita só para virar anexo, e para isso o worker
-- chamava o Gotenberg na VPS. Servir o HTML tira essa peça do caminho entre o
-- roteiro pronto e a call, e abre melhor no celular, que é onde ele é lido
-- minutos antes da conversa. Decisão do Yan, 17/08.
--
-- A coluna `pdf` continua com o nome antigo de propósito: renomear coluna com
-- dado dentro é migração de duas fases, e o ganho seria só cosmético. O que
-- passa a mandar é o `mime`.

ALTER TABLE roteiros
  ADD COLUMN IF NOT EXISTS mime TEXT NOT NULL DEFAULT 'application/pdf';

-- Documentos já guardados são PDF: o default acima os cobre sem tocar em linha.
