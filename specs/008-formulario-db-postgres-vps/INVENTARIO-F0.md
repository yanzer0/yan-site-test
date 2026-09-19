---
tags: [engenharia, inventario, neon, postgres, f0]
status: ready
version: 1.0
updated: 2026-09-19
---

# Inventário F0: o banco vivo do funil no Neon (só leitura)

Executado em 2026-09-19 às 09:19 UTC contra `POSTGRES_URL_NON_POOLING` (endpoint direto, sem
pooler). Fonte das queries: `information_schema`, `pg_indexes`, `pg_constraint`, `pg_roles`,
`pg_extension`, `pg_settings` e `count(*)` por tabela. Nenhum `SELECT` de coluna de dado foi
executado; este documento não contém e-mail, telefone, nome ou token.

## Servidor

| Item | Valor |
|---|---|
| Versão | PostgreSQL **17.11** (Neon) |
| Banco / role de conexão | `neondb` / `neondb_owner` (createdb, sem superuser) |
| Encoding / timezone do servidor | UTF8 / GMT |
| `max_connections` | 112 |
| Tamanho do banco | 9,20 MB |
| Extensões | `pgcrypto` 1.3, `plpgsql` 1.0 |
| Schemas próprios | `public` |
| Sequências | `public.tentativas_acesso_id_seq` |
| Views / triggers / funções próprias | 0 / 0 / 0 (as funções listadas são todas da `pgcrypto`) |
| Roles visíveis | `cloud_admin` (super), `neon_service`, `neon_superuser`, `neondb_owner` |

Consequência direta: o alvo na VPS é a série **17**, não a 16 da decisão original. `pg_dump` de
17 não tem garantia de restaurar em 16; o contrário é suportado.

## Tabelas (14, todas em `public`)

| Tabela | Linhas | Bytes | Colunas | Índices | Constraints |
|---|---:|---:|---:|---:|---:|
| agendamentos | 23 | 65.536 | 7 | 3 | 4 |
| avaliacoes | 80 | 147.456 | 8 | 3 | 3 |
| exclusoes | 0 | 8.192 | 4 | 1 | 1 |
| leads | 77 | 114.688 | 15 | 4 | 2 |
| mapa_achados | 0 | 81.920 | 8 | 3 | 4 |
| mapas | 0 | 147.456 | 15 | 4 | 4 |
| painel_config | 1 | 32.768 | 3 | 1 | 1 |
| parciais | 44 | 114.688 | 6 | 2 | 1 |
| pedidos_mapa | 1 | 98.304 | 13 | 5 | 4 |
| respostas | 536 | 204.800 | 6 | 2 | 2 |
| roteiros | 22 | 450.560 | 17 | 6 | 4 |
| sessoes_painel | 17 | 81.920 | 6 | 4 | 3 |
| tentativas_acesso | 2 | 81.920 | 5 | 2 | 2 |
| usuarios_painel | 3 | 65.536 | 11 | 3 | 5 |

Total: 806 linhas. A lista bate com `TABELAS_ESPERADAS` de `scripts/diagnostico/aplicar-schema.mjs`.

## Colunas por tabela (nomes, para a prova de restore)

- `agendamentos`: id, lead_id, cal_booking_id, inicio_em, estado, criado_em, atualizado_em
- `avaliacoes`: id, lead_id, score, faixa, motivo_corte, pontos_por_criterio, versao_score, criado_em
- `exclusoes`: id, lead_id, solicitado_em, executado_em
- `leads`: id, nome, empresa, papel, porte, email, email_norm, whatsapp, whatsapp_norm, origem, tipo, consentimento_em, criado_em, atualizado_em, indicado_por
- `mapa_achados`: id, mapa_id, tipo, classificacao, titulo, descricao, ordem, criado_em
- `mapas`: id, lead_id, token, estado, conteudo, html, aprovado_por, aprovado_em, houve_correcao, aberturas, primeira_abertura_em, ultima_abertura_em, versao_template, criado_em, atualizado_em
- `painel_config`: chave, valor, criado_em
- `parciais`: sessao_id, respostas, ultima_pergunta, origem, criado_em, atualizado_em
- `pedidos_mapa`: id, stripe_session_id, lead_id, email, email_norm, valor_centavos, moeda, estado, cal_booking_id, pago_em, atualizado_em, stripe_payment_intent, reembolsado_em
- `respostas`: id, lead_id, pergunta_id, valor, versao_perguntas, criado_em
- `roteiros`: id, cal_booking_id, estado, tentativas, ultimo_erro, google_event_id, caminho_roteiro, enfileirado_em, concluido_em, atualizado_em, token, pdf, nome_arquivo, aberto_em, aberturas, entregue_em, mime
- `sessoes_painel`: id, usuario_id, token_hash, expira_em, criado_em, ultimo_uso_em
- `tentativas_acesso`: id, chave, acao, sucesso, ocorreu_em
- `usuarios_painel`: id, nome, email, email_norm, senha_hash, papel, estado, aprovado_por, aprovado_em, criado_em, atualizado_em

## O que o inventário muda no escopo

1. Imagem alvo: `postgres:17`, minor pinado no dia da F1 (a Neon está em 17.11).
2. As colunas que os três `.sql` ausentes do `aplicar-schema.mjs` acrescentam (`roteiros.pdf`,
   `roteiros.mime`, `roteiros.nome_arquivo`, `pedidos_mapa.reembolsado_em`,
   `pedidos_mapa.stripe_payment_intent`, trava da fila) já existem no banco vivo. O restore por
   `pg_dump` carrega o schema real; completar o aplicador importa para ambiente novo (teste de
   integração da F2), não para a migração de dados.
3. `pgcrypto` precisa existir no banco novo antes do restore; `gen_random_uuid()` é nativo do
   Postgres 13+, mas o schema declara a extensão e o dump a referencia.
4. Volume de dados é trivial (9,2 MB, 806 linhas): dump e restore cabem em segundos; a janela da
   F5 é limitada pelo rito, não pelo dado.
5. Timezone do servidor é GMT. O container novo fica em UTC explícito para `now()` continuar igual.

## Como reproduzir

Script só leitura (em F2 ele passa para `pg` e vira `scripts/diagnostico/inventariar-banco.mjs`,
servindo Neon e VPS com a mesma saída para o diff da F3 e da F5):

```text
information_schema.tables (BASE TABLE, fora de pg_catalog/information_schema)
information_schema.columns por tabela (ordinal_position)
pg_indexes por tabela
pg_constraint por relação (conname, contype, definição)
count(*) e pg_total_relation_size por tabela
pg_extension, pg_namespace, information_schema.sequences/views/triggers, pg_proc, pg_roles
```
