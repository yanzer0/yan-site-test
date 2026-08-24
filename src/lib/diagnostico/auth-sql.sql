-- Contas do painel, sessões e o histórico que alimenta o rate limit.
-- Idempotente: rodar de novo não quebra nada.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- usuarios_painel: quem pode abrir o painel, depois de aprovado
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios_painel (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  email_norm    TEXT        NOT NULL UNIQUE,
  -- Formato versionado (`scrypt$N$r$p$salt$hash`), nunca a senha. O prefixo
  -- permite subir o custo depois sem invalidar quem já tem conta.
  senha_hash    TEXT        NOT NULL,
  papel         TEXT        NOT NULL DEFAULT 'membro' CHECK (papel IN ('admin', 'membro')),
  -- `pendente` é o padrão no BANCO, não só na rota: se alguma rota futura
  -- esquecer de setar, a conta nasce sem poder entrar, nunca com poder entrar.
  estado        TEXT        NOT NULL DEFAULT 'pendente'
                  CHECK (estado IN ('pendente', 'aprovado', 'bloqueado')),
  aprovado_por  UUID REFERENCES usuarios_painel(id) ON DELETE SET NULL,
  aprovado_em   TIMESTAMPTZ,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS usuarios_painel_estado_idx ON usuarios_painel (estado, criado_em DESC);

-- ─────────────────────────────────────────────────────────────
-- sessoes_painel: sessão opaca no servidor, revogável na hora
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessoes_painel (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id    UUID        NOT NULL REFERENCES usuarios_painel(id) ON DELETE CASCADE,
  -- 🔴 O HASH do token, nunca o token. Quem ler esta tabela não consegue
  -- montar o cookie de ninguém: um dump do banco não vira sessão ativa.
  token_hash    TEXT        NOT NULL UNIQUE,
  expira_em     TIMESTAMPTZ NOT NULL,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  ultimo_uso_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessoes_painel_usuario_idx ON sessoes_painel (usuario_id);
CREATE INDEX IF NOT EXISTS sessoes_painel_expira_idx  ON sessoes_painel (expira_em);

-- ─────────────────────────────────────────────────────────────
-- tentativas_acesso: a memória do rate limit
-- ─────────────────────────────────────────────────────────────
-- Postgres e não Redis porque o banco JÁ é o estado compartilhado que falta
-- em serverless. Um `Map` em memória não serve: cada invocação da função pode
-- ser um processo novo, e o atacante que troca de instância zera o contador.
CREATE TABLE IF NOT EXISTS tentativas_acesso (
  id         BIGSERIAL PRIMARY KEY,
  -- 🔴 Nunca o e-mail nem o IP em claro. Guardamos HMAC deles: dá para contar
  -- e agrupar, não dá para ler quem tentou. Rate limit não justifica manter
  -- uma lista de quem acessa de onde.
  chave      TEXT        NOT NULL,
  acao       TEXT        NOT NULL CHECK (acao IN ('login', 'cadastro')),
  sucesso    BOOLEAN     NOT NULL,
  ocorreu_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tentativas_acesso_janela_idx
  ON tentativas_acesso (chave, acao, ocorreu_em DESC);

-- ─────────────────────────────────────────────────────────────
-- painel_config: segredos que o sistema gera para si mesmo
-- ─────────────────────────────────────────────────────────────
-- O HMAC que anonimiza e-mail e IP no freio precisa de uma chave. Ela nasce
-- AQUI, do `gen_random_bytes` do proprio Postgres, em vez de virar mais uma
-- variavel de ambiente para alguem configurar a mao.
--
-- Guardar essa chave fora do banco nao protegeria nada de verdade: o e-mail ja
-- esta em claro em `usuarios_painel` (precisa estar, para o login funcionar) e
-- o telefone dos leads esta em claro em `leads`. Quem chegasse em
-- `tentativas_acesso` ja teria as outras duas. O que a anonimizacao evita e
-- outra coisa, mais modesta e ainda util: que um backup parcial, um log de
-- query ou um dump dessa tabela sozinha carreguem uma lista de quem tentou
-- entrar de onde.
CREATE TABLE IF NOT EXISTS painel_config (
  chave     TEXT PRIMARY KEY,
  valor     TEXT        NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- `ON CONFLICT DO NOTHING` e o que torna isto idempotente E estavel: rodar a
-- migracao de novo nao gera chave nova, e chave nova zeraria todos os
-- contadores de uma vez.
INSERT INTO painel_config (chave, valor)
VALUES ('freio_hmac', encode(gen_random_bytes(32), 'hex'))
ON CONFLICT (chave) DO NOTHING;
