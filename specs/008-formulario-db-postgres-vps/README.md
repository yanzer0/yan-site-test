---
tags: [engenharia, definicao, migracao, postgres, neon, vps, funil]
status: ready-for-build
definition_status: ready-for-build
definition_version: 1.0
owner: Yan
updated: 2026-09-19
---

# O banco do funil sai do Neon para um Postgres dedicado na VPS

## Estado da definição

- `definition_status`: `ready-for-build` para as fatias F1 e F2, condicionado à abertura das
  work orders `WO-FORMULARIO-DB-002` e `-003` com o Scope Lock pré-declarado em
  `PLANO-DE-IMPLEMENTACAO.md` §4. Sem work order ativa na branch, nenhuma escrita.
- versão do pacote: `1.0`
- owner humano: Yan
- executor técnico: Claude ou Codex via `/codar`, uma frente por branch e worktree
- risco/altitude: projeto, risco alto (PII de lead, produção, webhooks Stripe e Cal)
- última revisão: 2026-09-19
- decisão de origem: `_decisions/2026-09-19-formulario-b2b-sai-do-neon-para-postgres-na-vps.md`
  (brain); escopo: seção "Migração do banco" de `_projetos/funil-diagnostico-captura.md`

## Resultado contratado

O funil de diagnóstico (formulário, painel `/leads`, fila de roteiro, mapa pago e webhooks do
Cal.com e do Stripe) passa a persistir num Postgres 17 dedicado, rodando na VPS de produção,
alcançável só por rede Docker interna, com backup cifrado e restore ensaiado, e o projeto Neon
`formulario-b2b` é aposentado depois de sete dias de soak. Nenhuma rota, payload, schema ou
comportamento visível muda.

## Contexto confirmado

### Fatos verificados (19/09/2026)

- O app roda no container `useinfuser-site` na VPS desde 09/09 (`specs/006`), na rede
  `useinfuser-net`, sem porta publicada, atrás do Caddy.
- O banco vivo é Neon, projeto `formulario-b2b`, plano Free, região `us-east-1`, **PostgreSQL
  17.11**, 14 tabelas, 806 linhas, 9,20 MB, extensões `pgcrypto` e `plpgsql`, role de conexão
  `neondb_owner` sem superuser. Inventário completo em `INVENTARIO-F0.md`.
- `@vercel/postgres` 0.10.0 está deprecated (aviso no `package-lock.json`). O `sql` dele chama
  `neon()` HTTP (`node_modules/@vercel/postgres/dist/chunk-7IR77QAQ.js:145`) e o `createClient`
  usa o `Client` WebSocket do `@neondatabase/serverless`. Nenhum dos dois conecta a um Postgres
  comum trocando só a URL.
- `sql` é importado direto de `@vercel/postgres` em 8 arquivos de `src/` (`db.ts`, `leads-db.ts`,
  `mapa-db.ts`, `pagamento-db.ts`, `roteiro-db.ts`, `auth-db.ts`, `rate-limit.ts`,
  `app/api/diagnostico/mapa/respostas/route.ts`); `leads-db.ts` e `rate-limit.ts` também usam
  `sql.query(texto, params)`. `createClient` aparece em 8 scripts de `scripts/diagnostico/`.
- `roteiro-db.ts` reserva trabalho com `FOR UPDATE SKIP LOCKED` numa única instrução; não há
  transação explícita em `src/`.
- `deploy/vps/validate-env.mjs` exige `POSTGRES_URL` e `POSTGRES_URL_NON_POOLING`, ambos com
  protocolo `postgres:`/`postgresql:`.
- `deploy/vps/deploy.sh` roda `docker compose up -d --no-deps site` e nunca `down -v`.
- `/api/health` não consulta o banco.
- O worker de roteiro é a unit de usuário `roteiro` na VPS (`scripts/diagnostico/roteiro.service`,
  `WorkingDirectory=/home/infuser/yan-site-funil`), com supervisor por cron. Ele fala só com a
  API (`ROTEIRO_BASE_URL=https://www.useinfuser.com`), nunca com o banco. Pausa entre consultas:
  `PAUSA_ENTRE_CONSULTAS_MS = 1_800_000` (30 min, desde 18/09), travada por
  `tests/diagnostico/fila-worker.test.ts` em fração ativa `<= 0,2`.
- Idempotência já existe no schema: `ON CONFLICT (cal_booking_id)` em `agendamentos` (DO UPDATE)
  e `roteiros` (DO NOTHING); `ON CONFLICT (stripe_session_id)` em `pedidos_mapa`; `ON CONFLICT
  (email_norm, COALESCE(whatsapp_norm, ''))` em `leads`; `ON CONFLICT (sessao_id)` em `parciais`.
  O webhook do Cal valida HMAC com `timingSafeEqual`; o do Stripe lê `stripe-signature`.
- `scripts/diagnostico/aplicar-schema.mjs` aplica 6 dos 9 `.sql` (faltam `documento-html-sql.sql`,
  `fila-trava-sql.sql`, `reembolso-sql.sql`); as colunas que eles acrescentam já existem no vivo.
- A VPS já hospeda três Postgres separados (n8n/infuser, Twenty `twenty-db`, Prospector CNPJ). O
  backup offsite no B2 falha desde 15/08 (`403 storage_cap_exceeded`, R1 do mapa da operação). O
  disco de produção bateu 100% em 14/09 e estava em 78% em 19/09; existe `disk-check.sh` no cron
  com alerta acima de 85%.
- A VPS reiniciou sem aviso em 06/09 (17 min fora) e não há alerta externo definitivo.

### Hipóteses

- O Cal.com reentrega webhooks que receberam resposta não-2xx. Validação: não depender disso.
  A janela fica em horário sem agendamento previsto e a F5 fecha com reconciliação entre a lista
  de bookings da API do Cal e `agendamentos` desde o início da janela.
- O Stripe reentrega eventos não-2xx por até 3 dias (documentação pública). Validação: o evento
  de teste do painel do Stripe depois da reabertura chega e é gravado.
- A imagem `postgres:17` com minor mais recente restaura um dump da 17.11 sem ajuste. Validação:
  F3 (restore drill) antes de qualquer corte.

### Lacunas

- Destino offsite definitivo do dump cifrado: depende de resolver o cap do B2 (R1). Enquanto isso,
  o Neon read-only por 7 dias é a única cópia fora da Hostinger, e é temporária. Dono: Yan.
- Docker não impõe quota em volume local. O teto do banco novo é o alarme de disco existente mais
  a retenção dos dumps; o `df` entra no gate da F1 e da F4.
- A resposta da Hostinger sobre o reboot de 06/09 segue pendente (mapa da operação).

## Decisões congeladas

1. Postgres dedicado, imagem `postgres:17` com minor pinado na F1, volume próprio, rede nova
   `formulario-net`. Não compartilha o Postgres do n8n, o do Twenty nem o do CNPJ.
2. Porta não publicada. Só `useinfuser-site` entra em `formulario-net`. Caddy e n8n não enxergam
   o banco.
3. Superuser fica no `postgres` (só init, dump e restore por `docker exec`). A aplicação conecta
   como `formulario`: LOGIN, dono do banco `formulario`, sem SUPERUSER, CREATEDB ou CREATEROLE.
4. Driver: `@vercel/postgres` sai; entra `pg` atrás de um único módulo interno que expõe o mesmo
   tagged template parametrizado e `sql.query(texto, params)`. Nenhum import de
   `@vercel/postgres` sobrevive em `src/` nem em `scripts/`.
5. Corte por janela curta, sem dual-write. Durante a janela o Caddy responde 503 com
   `Retry-After` em `/api/diagnostico/*` e `/leads*`; o resto do site continua servido.
6. Neon fica com `default_transaction_read_only = on` por 7 dias como rollback e cópia externa.
   Só depois do soak e de um restore drill do dump novo a role é revogada, a string de conexão sai
   do env da VPS e do `.env.local` do Yan, e o projeto é destruído.
7. Backup do banco novo (dump `-Fc`, sha256, cifrado com `age` no mesmo recipient do backup
   principal, retenção 14 dias) e restore drill provado entram antes do corte (F4 antes de F5).
8. A pausa do worker volta de 30 min para 60 s depois do corte, e o teste de fração ativa sai
   junto: a premissa de scale-to-zero morre com o Neon.
9. O SSE do painel `/leads`, redesign, segunda VPS, DR completo da VPS e o worker dentro do
   container do site ficam fora.

## Escopo

- Compose do banco, rede, volume, init de role e extensão, healthcheck, limites, `depends_on` e
  subida própria no `deploy.sh`.
- Wrapper `pg`, reaponte dos 16 imports, `validate-env` aceitando uma URL TCP interna,
  `aplicar-schema.mjs` completo, `inventariar-banco.mjs` comum aos dois lados.
- Dump, restore, prova por contagem de linhas por tabela, backup cifrado com restore drill.
- Janela de corte, smoke, worker a 60 s, soak de 7 dias, aposentadoria do Neon.
- Runbook em `deploy/vps/README.md` e espelho no mapa da operação do brain.

## Não objetivos

- SSE ou `LISTEN/NOTIFY` no painel (a pendência do broker continua no brain).
- Redesign, pergunta nova, Instagram no contato, `live.useinfuser.com`.
- Consertar o DR inteiro da VPS (R1); segunda VPS; mover o worker para o container do site.
- Mudar schema, rota, payload ou comportamento do funil.

## Superfícies protegidas

| Superfície | Papel | Regra de mudança |
|---|---|---|
| Neon `formulario-b2b` | Fonte viva até a F5; rollback até a F7 | Só leitura fora da F5; nunca `DROP` antes do soak e do restore drill. |
| Webhooks Cal/Stripe | Entrada externa de produção | URL, assinatura, respostas e idempotência preservadas; 503 só dentro da janela. |
| `/leads` | Painel com dados pessoais | Auth, CSP, sessão e `no-store` preservados; 503 só dentro da janela. |
| Caddy compartilhado | Borda de todos os serviços | Backup, `caddy validate`, reload; nunca restart. |
| Env de produção | `/home/infuser/.config/useinfuser/useinfuser.env` (600) | Backup timestampado antes de trocar; valores nunca em log, chat ou git. |
| Dump do banco | Contém e-mail e WhatsApp | Só em `~/backups/formulario/` (700) e no destino cifrado; nunca em log, chat, git ou smoke. |
| Disco da VPS | Bateu 100% em 14/09 | `df -h /` antes e depois de F1, F3, F4 e F5. |

## Decisões em aberto

Nenhuma bloqueia F1 ou F2. O destino offsite definitivo (lacuna acima) bloqueia a F7, não a F5.

## Definição de pronto

- O site em produção lê e escreve no `formulario-db` da VPS; nenhum código referencia
  `@vercel/postgres`; a URL do Neon não existe em nenhum env.
- Contagem por tabela igual entre o dump final e o banco novo; smoke verde; worker a 60 s.
- Backup diário cifrado com restore drill provado; alerta em falha entregue.
- Sete dias sem 5xx novo em `/api/diagnostico/*`, sem alerta `funil-diagnostico/roteiro` e sem
  divergência de leads; projeto Neon destruído e runbook atualizado.

## Histórico do gate

| Data | Estado | Versão | Quem revisou | Motivo |
|---|---|---|---|---|
| 2026-09-19 | ready-for-build | 1.0 | Yan (go do escopo) + Claude /codar | Decisão congelada no brain, F0 executada, pacote completo; F1 e F2 aguardam WO própria. |
