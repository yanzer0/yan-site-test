---
tags: [engenharia, prd, migracao, postgres, funil]
status: ready
version: 1.0
updated: 2026-09-19
---

# PRD: o banco do funil sai do Neon para um Postgres dedicado na VPS

## 1. Problema verificado

O app do funil roda em Campinas e o banco em `us-east-1`: cada query cruza o Atlântico. O plano
Free do Neon (100 CU-hora) estourou em 18/09 por causa de um poll de 60 s, e a única saída sem
pagar foi alongar a pausa do worker para 30 min, o que atrasa o roteiro da Call 1 em até meia
hora. O driver `@vercel/postgres` está deprecated e amarrado ao proxy HTTP do Neon. A premissa
que sustentava o Neon (o app na Vercel não podia alcançar a VPS sem expor o banco à internet)
morreu em 09/09, quando o app foi para a VPS.

## 2. Usuários e contexto

| Usuário | Necessidade | Risco de dano |
|---|---|---|
| Lead no formulário | Enviar respostas e agendar a Call 1 | Perda do envio na janela de corte; latência. |
| Time Infuser no `/leads` | Ver leads, aprovar contas, acompanhar roteiros | Painel indisponível na janela; dado perdido em restore errado. |
| Worker de roteiro | Reservar e concluir trabalho na fila | Roteiro atrasado ou duplicado. |
| Cal.com e Stripe | Entregar webhooks válidos | Evento perdido se a janela não for idempotente. |
| Yan (operação) | Backup, restore e rollback confiáveis | Banco na VPS sem cópia externa. |

## 3. Job to be done

Quando o funil precisar gravar ou ler um lead, quero que o banco esteja na mesma máquina do app,
com backup e rollback provados, para que latência, plano Free e driver deprecated deixem de
limitar o produto.

## 4. Resultado

- baseline: Neon `us-east-1`, 806 linhas, 9,2 MB, worker a 30 min, `@vercel/postgres` 0.10.
- meta: `formulario-db` na VPS, contagem por tabela idêntica ao dump final, worker a 60 s, zero
  import de `@vercel/postgres`, backup cifrado diário com restore ensaiado, Neon destruído após
  7 dias de soak.
- fonte: `inventariar-banco.mjs` nos dois lados, smoke, logs do Caddy e do container, cron de
  backup e alerta.

## 5. Escopo e não objetivos

Inclui banco, rede, role, driver, dump/restore, backup, janela de corte, soak e aposentadoria.
Não inclui schema novo, rota nova, SSE, redesign, DR completo da VPS ou segunda VPS.

## 6. Requisitos funcionais

| ID | Requisito | Prioridade | Critério de aceite |
|---|---|---|---|
| RF-01 | Postgres 17 dedicado ao funil, em rede própria, sem porta publicada | MUST | `docker inspect` sem `PortBindings`; só `useinfuser-site` e `formulario-db` em `formulario-net`. |
| RF-02 | Role da aplicação sem superuser, CREATEDB ou CREATEROLE | MUST | `pg_roles` do banco novo. |
| RF-03 | Driver TCP (`pg`) atrás de um único módulo, mesmo contrato `sql` e `sql.query` | MUST | `grep -r "@vercel/postgres" src scripts` vazio; teste estático reprova regressão. |
| RF-04 | Dados migrados por dump e restore com prova por contagem por tabela | MUST | 14 tabelas com contagem igual entre origem e destino no instante do corte. |
| RF-05 | Janela de corte sem escrita perdida: 503 nas rotas de escrita, Cal e Stripe reentregam ou são reconciliados | MUST | Nenhum booking ou pagamento da janela ausente após reabertura. |
| RF-06 | Backup cifrado diário e restore drill antes do corte | MUST | Dump + sha256 + `age` em cron; restore em container descartável com contagem igual. |
| RF-07 | Worker de roteiro a 60 s depois do corte | MUST | `PAUSA_ENTRE_CONSULTAS_MS = 60_000`; teste de fração ativa removido. |
| RF-08 | Neon read-only 7 dias, depois revogado, limpo dos envs e destruído | MUST | `default_transaction_read_only = on`; URL ausente do env da VPS e do `.env.local`; projeto inexistente. |

## 7. Requisitos não funcionais

| ID | Requisito | Meta | Como provar |
|---|---|---|---|
| RNF-01 | Latência | `GET /api/diagnostico/roteiro/fila` autenticado < 300 ms interno (hoje ~0,9 s via Neon) | `curl time_total` antes e depois. |
| RNF-02 | Isolamento | Banco invisível para Caddy, n8n e outros containers | `docker network inspect formulario-net`; conexão de fora falha. |
| RNF-03 | Segurança de segredo | Senhas só em arquivo 600 e secret do Compose; nunca em log, chat, git ou imagem | Scan do diff e `docker history`. |
| RNF-04 | Privacidade | Dump, smoke e logs sem e-mail ou WhatsApp | grep nos artefatos de deploy e nos logs. |
| RNF-05 | Capacidade | Container do banco com `mem_limit` 512 MiB e `shm_size` 128 MiB; disco medido antes e depois | Compose e `df -h /`. |
| RNF-06 | Recuperação | Rollback da F5 em menos de 5 min: env de volta e restart do site | Ensaio em staging interno na F5. |
| RNF-07 | Operabilidade | Healthcheck `pg_isready`, backup com alerta em falha, disco com alarme | Compose, cron, `ops-alert.sh`. |

## 8. Dependências e riscos

| Item | Tipo | Estado | Dono | Mitigação |
|---|---|---|---|---|
| Acesso SSH à VPS como `infuser` | dependência | vivo | Yan | Já usado em 09/09. |
| Neon vivo e legível durante F0, F3 e F5 | dependência | vivo | Yan | Compute Free acorda sob demanda; custo trivial. |
| Cap do B2 (R1) | risco | aberto desde 15/08 | Yan | Neon read-only como cópia externa temporária; F7 só após destino offsite definido. |
| Disco da VPS | risco | 78% em 19/09 | Yan | `df` em cada gate; retenção de dumps 14 dias; alarme a 85%. |
| Reboot da VPS sem aviso | risco | causa pendente | Yan | `restart: unless-stopped`, volume persistente, recovery automático do Postgres. |
| Reentrega do Cal.com | hipótese | não provada | Claude | Janela em horário sem agendamento + reconciliação via API do Cal. |

## 9. Métricas e sinais de dano

| Métrica | Meta | Janela | Regra de decisão |
|---|---:|---|---|
| Contagem por tabela origem x destino | 14/14 iguais | corte | Qualquer diferença aborta e volta para o Neon. |
| HTTP 5xx em `/api/diagnostico/*` | 0 novo | corte + 7 dias | 5xx novo abre investigação; recorrente aborta a aposentadoria. |
| Alertas `funil-diagnostico/roteiro` | 0 | 7 dias | Alerta de fila morta bloqueia F7. |
| Latência da fila autenticada | < 300 ms | pós-corte | Acima de 1 s investiga rede/pool. |
| Backup diário | 7/7 com sha256 válido | 7 dias | Falha de backup bloqueia F7. |
| Disco `/` | < 85% | contínuo | Alarme existente; F4 e F5 não rodam acima de 85%. |

## 10. Critérios de aceite

1. O funil inteiro (submit, parcial, webhooks, fila, painel, mapa) opera contra `formulario-db`
   com a mesma suíte de smoke que provou a 006, mais a prova de contagem por tabela.
2. Nenhum código, env ou script de produção referencia o Neon ou `@vercel/postgres` ao fim da F7.
3. O backup do banco novo restaurou num container descartável com contagem igual, antes do corte.
4. O worker voltou a 60 s e a suíte de testes está verde sem o guard de fração ativa.
5. Sete dias de soak sem 5xx novo, sem alerta e sem divergência de leads.

## 11. Rastreabilidade

| Requisito | Arquitetura | Fatia | Prova |
|---|---|---|---|
| RF-01, RF-02, RNF-02, RNF-05 | ARQUITETURA §4, §6 | F1 | AC-02 |
| RF-03, RNF-03 | ARQUITETURA §4; CONTRATOS §2 | F2 | AC-03, AC-04 |
| RF-04 | DADOS §2, §6 | F0, F3, F5 | AC-01, AC-05, AC-07 |
| RF-05 | CONTRATOS §4, §5 | F5 | AC-07, AC-08 |
| RF-06, RNF-07 | DADOS §6; VERIFICAÇÃO §6 | F4 | AC-06 |
| RF-07 | CONTRATOS §6 | F5 | AC-09 |
| RF-08 | DADOS §1; PLANO §4 F6/F7 | F6, F7 | AC-10, AC-11 |
| RNF-01 | VERIFICAÇÃO §5 | F5 | AC-08 |
| RNF-04 | VERIFICAÇÃO §4 | todas | AC-12 |
| RNF-06 | PLANO §7 | F5 | AC-07 |
