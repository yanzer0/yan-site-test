-- Tabelas do mapa de diagnóstico (feature 002).
-- Contrato: specs/002-mapa-diagnostico-gerador/
-- Idempotente. Aplicar com o mesmo script do schema da 001.

-- ─────────────────────────────────────────────────────────────
-- mapas: o documento gerado para um lead
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mapas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         UUID        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

  -- Identificador da URL pública. Opaco de propósito: FR-013a proíbe nome,
  -- e-mail ou empresa no endereço da página.
  token           TEXT        NOT NULL UNIQUE,

  estado          TEXT        NOT NULL DEFAULT 'gerado'
                    CHECK (estado IN ('gerado','aprovado','entregue')),

  -- O JSON de achados. É ele, não o HTML, que serve à Call 2 (FR-013).
  conteudo        JSONB       NOT NULL,
  html            TEXT        NOT NULL,

  -- FR-015 e FR-017: sem aprovação registrada, a página não serve o documento.
  aprovado_por    TEXT,
  aprovado_em     TIMESTAMPTZ,

  -- FR-018: a taxa de correção é o termômetro que decide o futuro do gate.
  -- Sem esta coluna, "o gate ainda é necessário?" vira opinião.
  houve_correcao  BOOLEAN     NOT NULL DEFAULT FALSE,

  -- FR-013a: abertura é sinal de temperatura antes da Call 2.
  aberturas       INTEGER     NOT NULL DEFAULT 0,
  primeira_abertura_em TIMESTAMPTZ,
  ultima_abertura_em   TIMESTAMPTZ,

  versao_template TEXT        NOT NULL,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mapas_lead_idx   ON mapas (lead_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS mapas_estado_idx ON mapas (estado, criado_em DESC);

-- ─────────────────────────────────────────────────────────────
-- mapa_achados: os achados em forma consultável
-- ─────────────────────────────────────────────────────────────
-- Existe separado do JSONB por um motivo prático: responder "quais limites a
-- gente mais encontra" ou "que tipo de encaixe aparece em metalurgia" sem
-- abrir documento nenhum. É o que transforma cada diagnóstico em dado da casa.
CREATE TABLE IF NOT EXISTS mapa_achados (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mapa_id        UUID        NOT NULL REFERENCES mapas(id) ON DELETE CASCADE,
  tipo           TEXT        NOT NULL
                   CHECK (tipo IN ('etapa','atrito','encaixe','dependencia','limite')),
  classificacao  TEXT        NOT NULL CHECK (classificacao IN ('fato','leitura','limite')),
  titulo         TEXT        NOT NULL,
  descricao      TEXT        NOT NULL,
  ordem          INTEGER     NOT NULL DEFAULT 0,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mapa_achados_mapa_idx ON mapa_achados (mapa_id, tipo, ordem);
CREATE INDEX IF NOT EXISTS mapa_achados_tipo_idx ON mapa_achados (tipo, classificacao);

-- Nota deliberada: NÃO existe tabela de transcrição.
-- FR-019 trata transcrição como dado sensível que não entra em repositório nem
-- em banco. Ela fica em arquivo local, ignorada pelo git, e some no prazo de
-- retenção. O que persiste é o achado, que já é texto tratado.
