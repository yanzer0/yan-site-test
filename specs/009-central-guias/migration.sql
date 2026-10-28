BEGIN;
CREATE TABLE IF NOT EXISTS guias_leads (
  id uuid PRIMARY KEY,
  nome text NOT NULL CHECK (char_length(btrim(nome)) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 5 AND 254),
  whatsapp text NOT NULL CHECK (whatsapp ~ '^[0-9]{12,13}$'),
  nicho text NOT NULL CHECK (char_length(btrim(nicho)) BETWEEN 2 AND 160),
  interesse text NOT NULL CHECK (char_length(btrim(interesse)) BETWEEN 5 AND 2000),
  impedimento text NOT NULL CHECK (char_length(btrim(impedimento)) BETWEEN 5 AND 2000),
  guia text NOT NULL CHECK (char_length(guia) <= 80),
  origem text NOT NULL CHECK (char_length(origem) <= 512),
  versao_privacidade text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS guias_leads_criado_em_idx ON guias_leads (criado_em DESC, id DESC);
CREATE INDEX IF NOT EXISTS guias_leads_email_idx ON guias_leads (email);
COMMIT;
