---
tags: [engenharia, adr, arquitetura, postgres, neon, vps]
status: ready
version: 1.0
updated: 2026-09-19
---

# ADR: Postgres 17 dedicado na VPS substitui o Neon do funil

## Status

`accepted` (decisão do Yan em 19/09/2026, registrada no brain em
`_decisions/2026-09-19-formulario-b2b-sai-do-neon-para-postgres-na-vps.md`; a série do Postgres
foi corrigida de 16 para 17 pelo inventário F0).

## Contexto

O funil persiste no Neon (`us-east-1`, Free, PostgreSQL 17.11) porque em 14/08 o app rodava na
Vercel e o Postgres da VPS teria que ser exposto à internet. Desde 09/09 o app roda na VPS.
Sobrou latência intercontinental, um plano Free no teto (worker a 30 min para o compute dormir) e
um driver deprecated preso ao proxy HTTP do Neon. A VPS já roda três Postgres separados por
produto, tem backup offsite quebrado desde 15/08 e caiu 17 min em 06/09 sem alerta externo.

## Decisão

Um Postgres 17 dedicado ao funil, em container próprio no Compose do site, rede Docker
`internal` sem porta publicada, role de aplicação sem privilégio de cluster, driver `pg` atrás de
um único módulo. Migração por dump e restore numa janela curta com escrita recusada na borda,
sem dual-write. Backup cifrado com restore drill antes do corte. Neon read-only por sete dias e
destruído depois, com o offsite definitivo como lacuna nomeada.

## Raciocínio e trade-offs

- Dedicado, não compartilhado: PII de lead e blast radius. Custo aceito: mais um container e
  mais um cron na VPS.
- `pg`, não `@neondatabase/serverless` em modo TCP nem `postgres` (porsager): o pacote atual já
  é um wrapper sobre o ecossistema `pg`, a API de `Pool`/`Client` é a mesma que os scripts usam,
  e a dependência é a mais auditada do ecossistema. Custo: uma dependência nova até a F7 (duas
  com `@types/pg`).
- Janela curta, não dual-write: dezenas de leads por mês não pagam o código extra, e sem
  dual-write o rollback é apontar o env de volta. Custo: até 15 min de 503 nas rotas de escrita.
- Restore com `--exit-on-error` e prova por contagem: restaurar pela metade é pior que abortar.

## Consequências positivas

- Latência de rede do funil deixa de cruzar o Atlântico; worker volta a 60 s.
- Fim do teto de CU-hora e do driver deprecated.
- Backup e restore passam a ser provados pela Infuser, não presumidos do provedor.
- O mesmo rito (dump, `age`, drill) serve para os outros Postgres da VPS.

## Custos e riscos residuais

- A VPS concentra mais um dado crítico e continua ponto único de falha; o Neon deixa de ser a
  cópia fora da Hostinger. Mitigação: Neon read-only no soak; F7 só com destino offsite (R1).
- Dump com PII passa a existir em disco: diretório 700, `age`, retenção 14 dias.
- Docker não impõe quota em volume: o teto é alarme de disco e retenção.

## Alternativas consideradas

### Manter o Neon e pagar o plano Launch

Rejeitada: paga para manter latência intercontinental e um driver deprecated; a premissa de
exposição à internet que justificava o Neon não existe mais.

### Usar o Postgres compartilhado do n8n (`pgvector 16`)

Rejeitada: viola a lei de um banco por produto, mistura PII de lead com dados do n8n, e a versão
16 não restaura um dump de 17.

### Supabase

Rejeitada de novo (já tinha sido em 14/08): plataforma a mais para operar, e o MCP conectado
serve projeto de cliente, não infra da Infuser.

### Dual-write durante a transição

Rejeitada: superfície extra no caminho de PII, dois estados a reconciliar, e nenhuma
necessidade com dezenas de escritas por mês.

### Trocar só a URL e manter `@vercel/postgres`

Rejeitada por fato: o `sql` do pacote fala HTTP com o proxy do Neon e o `createClient` fala
WebSocket; nenhum alcança um Postgres comum. Um teste estático impede a regressão.

## Compatibilidade, migração e rollback

Nenhum contrato público, schema ou payload muda. `POSTGRES_URL_NON_POOLING` vira opcional.
Rollback até a F7: env de volta ao Neon read-only + restart do site + remover o bloco de janela.
Depois da F7: restore do dump cifrado.

## Critérios para reconsiderar

- a VPS deixar de ser o host do site (voltaria a valer a questão de exposição);
- necessidade de alta disponibilidade ou réplica fora da Hostinger sem custo compatível;
- o funil passar a exigir recursos que o Postgres puro não dá (busca vetorial, multi-região);
- o backup offsite não voltar antes do fim do soak: a F7 espera, e a decisão continua válida.
