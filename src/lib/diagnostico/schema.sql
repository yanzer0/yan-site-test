-- Schema do funil de diagnóstico.
-- Contrato: specs/001-funil-diagnostico-captura/data-model.md
--
-- Rodar uma vez no Postgres antes do primeiro deploy. É idempotente.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- leads: quem concluiu o formulário
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome              TEXT        NOT NULL,
  empresa           TEXT,
  papel             TEXT,
  porte             TEXT,
  email             TEXT        NOT NULL,
  email_norm        TEXT        NOT NULL,
  whatsapp          TEXT,
  whatsapp_norm     TEXT,
  origem            TEXT        NOT NULL,
  -- Quem indicou, quando `origem` é indicação (2026-09-03). Texto livre e opcional:
  -- é o que permite medir a conversão do canal que o ICP chama de prioritário.
  indicado_por      TEXT,
  tipo              TEXT        NOT NULL CHECK (tipo IN ('empresa', 'pessoal')),
  -- Sem consentimento nada é persistido, então a coluna é NOT NULL de propósito:
  -- o banco é a última linha de defesa da regra, não só a rota.
  consentimento_em  TIMESTAMPTZ NOT NULL,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela que já existia antes de 2026-09-03 ganha a coluna sem recriar nada. Idempotente.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS indicado_por TEXT;

-- Deduplicação de FR-033: reenvio atualiza, não cria segundo lead.
CREATE UNIQUE INDEX IF NOT EXISTS leads_contato_unico
  ON leads (email_norm, COALESCE(whatsapp_norm, ''));

-- FR-027: consultar por origem e por intervalo de data.
CREATE INDEX IF NOT EXISTS leads_origem_idx    ON leads (origem);
CREATE INDEX IF NOT EXISTS leads_criado_em_idx ON leads (criado_em DESC);

-- ─────────────────────────────────────────────────────────────
-- respostas: append-only, preserva o texto literal do lead
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS respostas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id           UUID        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  pergunta_id       TEXT        NOT NULL,
  valor             JSONB       NOT NULL,
  -- Sem a versão, resposta antiga fica órfã de significado quando a copy muda.
  versao_perguntas  TEXT        NOT NULL,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS respostas_lead_idx ON respostas (lead_id, criado_em DESC);

-- ─────────────────────────────────────────────────────────────
-- avaliacoes: uma por submissão, não uma por lead
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS avaliacoes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id               UUID        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  score                 INTEGER     NOT NULL,
  faixa                 TEXT        NOT NULL
                          CHECK (faixa IN ('qualificado','revisao','nao_icp_empresa','nao_icp_pessoal')),
  motivo_corte          TEXT,
  -- Detalhe por critério: quando um qualificado se revelar ruim na call, a
  -- pergunta é qual critério inflou o score. Sem isso, só dá para ver o total.
  pontos_por_criterio   JSONB       NOT NULL,
  versao_score          TEXT        NOT NULL,
  criado_em             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS avaliacoes_faixa_idx ON avaliacoes (faixa, criado_em DESC);
CREATE INDEX IF NOT EXISTS avaliacoes_lead_idx  ON avaliacoes (lead_id, criado_em DESC);

-- ─────────────────────────────────────────────────────────────
-- parciais: quem começou e não terminou. Nunca vira lead.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parciais (
  sessao_id         UUID PRIMARY KEY,
  respostas         JSONB       NOT NULL,
  ultima_pergunta   TEXT,
  origem            TEXT,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Retenção de 30 dias: parcial velho não ensina nada e é dado pessoal parado
-- sem consentimento. A limpeza é uma rotina, este índice a torna barata.
CREATE INDEX IF NOT EXISTS parciais_atualizado_idx ON parciais (atualizado_em);

-- ─────────────────────────────────────────────────────────────
-- agendamentos: vinculados pelo webhook do Cal.com
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agendamentos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id           UUID        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  -- Base da idempotência do webhook: o mesmo evento entregue duas vezes
  -- produz um agendamento, não dois.
  cal_booking_id    TEXT        NOT NULL UNIQUE,
  inicio_em         TIMESTAMPTZ NOT NULL,
  estado            TEXT        NOT NULL DEFAULT 'agendado'
                      CHECK (estado IN ('agendado','cancelado','remarcado','realizado','nao_compareceu')),
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Não há coluna de host: a agenda é única e compartilhada, e quem conduz é
-- combinado fora do sistema (FR-030).

CREATE INDEX IF NOT EXISTS agendamentos_inicio_idx ON agendamentos (inicio_em);

-- ─────────────────────────────────────────────────────────────
-- exclusoes: prova de atendimento ao titular, sem dado pessoal (FR-028)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exclusoes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id       UUID        NOT NULL,
  solicitado_em TIMESTAMPTZ NOT NULL,
  executado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);
