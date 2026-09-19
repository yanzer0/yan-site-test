---
work_order: WO-FORMULARIO-DB-005
status: active
central_branch: claude/formulario-db-f5
owner: Opus 5 (executor) / Claude (validador)
authorized_by: Yan
authorized_at: 2026-09-19
scope_lock:
  version: 1
  base_commit: 67919c55ce2db33367ad10bb9341730e3e0f9466
  allowed_write_globs:
    - .planning/work-orders/WO-FORMULARIO-DB-005.md
    - scripts/diagnostico/servico-roteiro.mjs
    - tests/diagnostico/fila-worker.test.ts
    - deploy/vps/README.md
    - specs/008-formulario-db-postgres-vps/**
  architecture_delta:
    production_files:
      - scripts/diagnostico/servico-roteiro.mjs
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces:
      - formulario-db recebe os dados do funil (restore do dump final do Neon)
      - env de producao do site passa a apontar para formulario-db
    background_jobs:
      - unit roteiro (cadencia 30 min para 60 s)
  acceptance_ids:
    - AC-07
    - AC-08
    - AC-09
  stop_when:
    - AC-07
    - AC-08
    - AC-09
  passed_acceptance_ids: []
---

# WO-FORMULARIO-DB-005: F5, a janela de corte (Neon para `formulario-db`)

## Autorização

Yan, 19/09/2026: "go pra todas, vá até o fim". Pacote: `specs/008-formulario-db-postgres-vps/`
(`README.md` decisões 5, 6 e 8, superfícies protegidas; `ARQUITETURA.md` §4.4, §5, §8;
`CONTRATOS-E-EVENTOS.md` §3, §4, §5, §6; `DADOS-E-APIS.md` §4 (rito de restore com
`--no-comments --no-acl`); `PLANO-DE-IMPLEMENTACAO.md` §4 F5, §6, §7; `VERIFICACAO-E-OPERACAO.md`
§7 (runbook da janela e rollback) e §8). F1, F2, F3 e F4 estão em `main` (`67919c5`) e provadas:
`formulario-db` healthy e vazio, driver `pg` no código, backup diário com drill.

## Escopo

1. Código: `PAUSA_ENTRE_CONSULTAS_MS` de `1_800_000` para `60_000` em `servico-roteiro.mjs`; o
   caso "keeps the Neon compute awake at most 20% of the time" sai de
   `tests/diagnostico/fila-worker.test.ts` (a premissa morre com o Neon); os outros guards ficam.
   `deploy/vps/README.md`: seção "Corte e rollback do banco" com os instantes reais.
2. VPS, na ordem do runbook §7: `T0`; backup do env e do Caddyfile; bloco de janela no Caddy
   (503 + `Retry-After` em `/api/diagnostico/*` e `/leads*`) com validate + reload (`T1`); dump
   final do Neon; restore no `formulario-db` de produção; diff de contagem zero; Neon
   `default_transaction_read_only = on`; env do site apontando para `formulario-db`;
   `validate-env` verde; `deploy.sh` no commit desta ordem; health; smoke; bloco removido (`T2`);
   worker no commit novo a 60 s; reconciliação; 30 min de observação.

## Fora do escopo

Schema, rotas, payloads, Caddy além do bloco temporário, destruir o Neon, remover
`@vercel/postgres`, `.env.local` do Yan (F7). Nunca `compose down`, nunca `-v`, nunca apagar
`formulario-db-data`, nunca reiniciar o Caddy (só `reload` validado).

## Critérios de aceite

| ID | Critério | Prova exigida |
|---|---|---|
| AC-07 | Janela registrada (`T0`, `T1`, `T2` em UTC, `T2 - T1` ≤ 15 min, abortar acima de 30); 503 provado nas rotas de escrita e 200 no health durante a janela; dump final restaurado com `--exit-on-error` exit 0; diff de contagem por tabela e sequência entre Neon e `formulario-db` vazio; Neon em read-only provado por escrita recusada; env trocado com backup timestampado e `validate-env` verde; site healthy no commit desta ordem | saídas reais coladas na WO, sem segredo |
| AC-08 | Smoke pós-corte verde: `smoke.mjs` nos dois hosts, fila autenticada 200 com latência registrada (< 300 ms interno), `/leads/entrar` 200, webhooks Cal e Stripe com 401/400 sem assinatura, escrita real de teste em `parciais` por `POST /api/diagnostico/parcial` com `sessao_id` sintético visível no banco novo e removida em seguida; reconciliação (bookings do Cal e eventos do Stripe na janela) registrada, com o que não pôde ser verificado nomeado | saídas reais |
| AC-09 | Worker no commit desta ordem com `PAUSA_ENTRE_CONSULTAS_MS = 60_000`, unit `roteiro` reiniciada, primeira fila 200 no log, `fila-worker.test.ts` verde sem o caso do Neon; 30 min sem 5xx novo no access log do Caddy em `/api/diagnostico/*` e sem alerta | saídas reais |

## Evidência

Executada em 2026-09-19 na VPS (`vps-infuser`) como `infuser`. Commit desta ordem:
`79f7f26264e7858bb1e0fddf9df7469d014497f8` (`79f7f26264e7`), a partir de `67919c5`. Checkout de
produção `/home/infuser/useinfuser-site` movido de `fb14957dbd2f` para `79f7f26264e7`; checkout
do worker `/home/infuser/yan-site-funil` movido de `cfb0e9c0cad6` para o mesmo commit. Nenhuma
senha, URL de conexão, conteúdo de env, token, e-mail ou linha de dado aparece abaixo: só nomes
de tabela, contagens, tamanhos, instantes e códigos.

### Código (commit 1)

`PAUSA_ENTRE_CONSULTAS_MS` foi de `1_800_000` para `60_000` e o comentário de CU-hora do Neon
saiu, porque a conta não existe mais: a fila mora na própria VPS e consulta ociosa não compra
compute de nuvem.

O caso `keeps the Neon compute awake at most 20% of the time between empty rounds` foi substituído
por `polls every 60s without long-polling the queue route`. **Nenhum guard foi perdido.** Os
4 asserts do caso antigo eram: o worker sem `?esperar=`; o regex de `PAUSA_ENTRE_CONSULTAS_MS`
casando; `fracaoAtiva <= 0.2` (a premissa do Neon); e a linha
`await dormir(pausar ? PAUSA_APOS_ERRO_MS : PAUSA_ENTRE_CONSULTAS_MS)`. Só o terceiro saiu, e no
lugar dele entrou `toBe(60_000)`, que é mais estrito. Os outros três seguem literalmente iguais.
`npx vitest run tests/diagnostico/fila-worker.test.ts`: 6 testes verdes.

### AC-07: a janela

Pré-condições no instante `T0`: `df -h /` em `81%` (alarme a 85%); `useinfuser-site` e
`formulario-db` ambos `healthy`; `GET /api/health` 200; `formulario-db` com `0` tabelas em
`public`; `0` agendamentos com `inicio_em` nas 3 h seguintes no Neon; `roteiros` sem nada em voo
(`concluido` 21, `falhou` 1).

| Instante | UTC |
|---|---|
| `T0` (backups do env e do Caddyfile) | `2026-09-19T07:51:32Z` |
| `T1` (bloco de janela no ar) | `2026-09-19T07:52:22Z` |
| `T2` (bloco removido) | `2026-09-19T07:56:34Z` |

`T2 - T1` = **4 min e 12 s**, contra o alvo de 15 min e o limite de 30.

**Backups.** `useinfuser.env.bak-20260919T075132Z` (5.738 bytes, `600`, `infuser:infuser`) e
`/opt/infuser-brew/docker/caddy/Caddyfile.bak-20260919T075132Z` (25.631 bytes).

**Caddy.** O bloco vivo era idêntico ao `deploy/vps/Caddyfile.block` do repositório. As 6 linhas
do `@janela` entraram antes do `reverse_proxy` e o `diff` contra o original mostrou exatamente
elas. `caddy validate` devolveu `Valid configuration`, seguido de `caddy reload`. Nunca houve
`restart`.

Prova do 503 com a janela aberta:

```
POST /api/diagnostico/parcial      : 503   (retry-after: 600, corpo "manutencao programada")
GET  /api/health                   : 200
GET  /leads                        : 503
GET  /leads/entrar                 : 503
POST /api/diagnostico/cal-webhook  : 503
GET  /                             : 200
GET  /diagnostico                  : 200
```

O contraexemplo está na própria linha do health: a rota que não toca o banco continuou 200, então
o health check ativo do Caddy não derrubou o upstream durante a janela.

**Dump final.** `docker run --rm -e NEON_URL -v ~/backups/formulario:/out postgres:17.11` com
`pg_dump -Fc`, URL só em variável de ambiente: `neon-final-20260919T075132Z.dump`,
**240.549 bytes**, **14 s**, iniciado às `07:52:51Z`. O tamanho bate com o dump da F3, o que era o
esperado: nada foi escrito no Neon entre uma coisa e outra.

**Restore em produção**, às `07:53:19Z`:

```
docker exec -i formulario-db pg_restore -U postgres -d formulario \
  --no-owner --role=formulario --no-comments --no-acl --exit-on-error < <dump>
exit=0   1s
```

**Diff de contagem origem contra destino: vazio.** As 15 linhas idênticas dos dois lados:

```
agendamentos,23   exclusoes,0     painel_config,1   respostas,536   tentativas_acesso,2
avaliacoes,80     leads,77        parciais,44       roteiros,22     usuarios_painel,3
mapa_achados,0    mapas,0         pedidos_mapa,1    sessoes_painel,17
seq:tentativas_acesso_id_seq,118
```

Soma 806 linhas, igual ao `INVENTARIO-F0.md` e à medição da F3. O `select distinct tableowner`
das tabelas de `public` no destino devolve uma linha só: `formulario`. `pg_extension` tem
`pgcrypto` e `plpgsql`.

**Neon congelado.** `ALTER DATABASE neondb SET default_transaction_read_only = on` (o nome do
banco foi lido de `current_database()`, não chutado). Prova em sessão NOVA:

```
ERROR:  cannot execute CREATE TABLE in a read-only transaction
show default_transaction_read_only -> on
```

**Env.** `POSTGRES_URL` e `POSTGRES_URL_NON_POOLING` reescritos para o `formulario-db` por `awk`
lendo o valor do ambiente, nunca de `argv`. Arquivo final `600 infuser:infuser`, 5.657 bytes. O
diff com o backup, mascarando todo valor, mostra que **nenhuma chave** foi criada, removida ou
reordenada; só esses dois valores mudaram (150 para 106 e 143 para 106 caracteres). As demais
`POSTGRES_*` da Vercel ficaram onde estavam, porque removê-las é F7.
`validate-env.mjs`: `production environment validated`, às `07:54:18Z`.

**Deploy.** `git fetch` do refspec da branch, `git checkout` do commit desta ordem, `deploy.sh`
das `07:54:29Z` às `07:55:58Z` (89 s). Saiu `useinfuser-site release 79f7f26264e7 is healthy`,
com o inventário de rotas do `smoke.mjs` interno verde. `GET /api/health` devolve
`{"ok":true,"service":"useinfuser-site","release":"79f7f26264e7"}`.

**Reabertura.** Caddyfile restaurado do backup (`diff` contra o backup vazio: o arquivo voltou
byte a byte), `validate` verde, `reload`. Depois do `T2`:

```
POST /api/diagnostico/parcial (corpo vazio) : 400   <- validação, não 503
GET  /leads                                 : 307
GET  /leads/entrar                          : 200
```

### AC-08: smoke e reconciliação

**Smoke interno, ainda com o Caddy em 503 para fora** (`docker exec useinfuser-site node` contra
o loopback do container):

```
GET  fila (autenticada)                 : 200  102ms   chaves: trabalhos, emRisco, mortos
GET  fila (sem segredo)                 : 401    7ms
GET  /leads/entrar                      : 200   21ms
POST cal-webhook (sem assinatura)       : 401   12ms
POST mapa-pago/webhook (sem assinatura) : 401    5ms
POST parcial (JSON válido)              : 204   10ms
```

Os 102 ms da fila são contra o `formulario-db`; a WO-004 mediu ~0,9 s pelo Neon, e o orçamento do
AC-08 era 300 ms.

**Escrita real de teste**, com `sessao_id` sintético, provada no banco NOVO e desfeita:

```
select count(*) from parciais where sessao_id = <sintético>  -> 1
delete from parciais where sessao_id = <sintético>           -> DELETE 1
select count(*) from parciais where sessao_id = <sintético>  -> 0
select count(*) from parciais                                -> 44   (o mesmo de antes)
```

**Smoke público**, depois da reabertura: `smoke.mjs` verde em `https://useinfuser.com` e em
`https://www.useinfuser.com`, 69 checagens cada, pior latência 45 ms e 63 ms.

**Reconciliação da janela** (access log JSON do Caddy, parseado por campo, no intervalo de `T1` a
`T2`): 31 requisições no total, e as 6 que bateram nas rotas fechadas foram todas provas desta
ordem (3x `POST /api/diagnostico/parcial`, `GET /leads`, `GET /leads/entrar`,
`POST /api/diagnostico/cal-webhook`, todas 503). **Zero** POST de verdade do Cal ou do Stripe na
janela. **Zero** 5xx fora do 503 desenhado. A contagem de `agendamentos` com `criado_em` depois
do `T1` é `0`; `pedidos_mapa` segue com 1 linha, a mesma de antes.

**O que NÃO pôde ser verificado, e por quê:**

1. **API do Cal.** Não existe chave `CAL_API*` no env da VPS (a contagem por nome de chave dá
   `0`), então não dá para listar bookings criados ou alterados dentro da janela e cruzar com
   `agendamentos`. O que sustenta o zero é indireto: nenhum agendamento nas 3 h seguintes no
   `T0`, nenhuma entrega de webhook do Cal no access log durante a janela, e `agendamentos` sem
   linha nova depois do `T1`.
2. **Evento de teste do Stripe.** Não há CLI do Stripe aqui e o painel é do Yan. O que está
   provado é o negativo: zero POST no `mapa-pago/webhook` durante a janela, e a rota respondendo
   401 a chamada sem assinatura depois dela.

### AC-09: worker e observação

```
/home/infuser/yan-site-funil : cfb0e9c0cad6 -> 79f7f26264e7
grep PAUSA_ENTRE_CONSULTAS_MS servico-roteiro.mjs -> const PAUSA_ENTRE_CONSULTAS_MS = 60_000;
systemctl --user restart roteiro -> active
journalctl: "servico de roteiro de pe | brain=... | api=... | intervalo=60s"
primeira chamada da fila no access log: 200 em 13ms, 11 s depois do T2
```

`npx vitest run tests/diagnostico/fila-worker.test.ts`: 6 verdes, sem o caso do Neon.

**Observação de 30 min a partir do `T2`** (7 amostras de 5 em 5 min):

| amostra | UTC | health | req desde `T2` | em `/api/diagnostico/*` | 5xx no site | `roteiro` |
|---|---|---|---|---|---|---|
| 1 | 07:58:00Z | 200 | 145 | 19 | 0 | active |
| 2 | 08:03:02Z | 200 | 191 | 24 | 0 | active |
| 3 | 08:08:04Z | 200 | 231 | 29 | 0 | active |
| 4 | 08:13:07Z | 200 | 238 | 34 | 0 | active |
| 5 | 08:18:09Z | 200 | 245 | 39 | 0 | active |
| 6 | 08:23:11Z | 200 | 252 | 45 | 0 | active |
| 7 | 08:28:13Z | 200 | 260 | 50 | 0 | active |

Encerrada às `08:28:16Z`: 31 min e 42 s depois do `T2`. **Zero 5xx** em `/api/diagnostico/*` e no
site inteiro, health 200 nas 7 amostras, nenhuma linha de erro no journal do `roteiro` e nenhum
alerta disparado. As colunas 4 e 5 também medem a cadência nova: `/api/diagnostico/*` cresce 5 a
6 por amostra de 5 min, que é exatamente 1 consulta por minuto do worker.

Recursos: `formulario-db` estável em 47 MiB de 512 MiB e CPU abaixo de 0,5%; `useinfuser-site`
subiu de 104 MiB para 452 MiB e estabilizou aí, longe do teto de 1,5 GiB (é o aquecimento normal
do Next depois de recriar o container). `df -h /` foi de 81% para **82%**, abaixo do alarme de
85%, pelo dump novo mais a imagem nova.

### Desvios do pacote

1. **A senha da app tem que ir percent-encoded na URL, e o runbook mandava colá-la crua.** Ela é
   base64 de 44 bytes e contém `/`. Tanto o parser de URI do libpq quanto o do `pg` encerram a
   autoridade no primeiro `/`, então a URL crua vira host `formulario` mais uma porta que é um
   pedaço da senha, e o `psql` falha com `invalid integer value ... for connection option port`.
   Medido antes da janela, contra o `formulario-db` ainda vazio. O env foi escrito com `+`, `/` e
   `=` como `%2B`, `%2F` e `%3D`, e a conexão abriu como `formulario` no banco `formulario`.
   `deploy/vps/README.md` registra a armadilha.
2. **O `sessao_id` sintético precisa ser UUID.** A ordem pedia um identificador em texto livre,
   mas `src/app/api/diagnostico/parcial/route.ts` valida contra um regex de UUID e devolveria 400
   `sessao_invalida` sem escrever nada. Foi usado um UUID sintético reconhecível, apagado em
   seguida.
3. **O 204 do `parcial` não prova escrita nenhuma.** A rota captura `ErroPersistencia` de
   propósito (é telemetria, não caminho crítico) e devolve 204 mesmo quando o banco recusa. A
   prova de AC-08 é a contagem no `formulario-db`, não o código HTTP. Registrado porque um
   executor futuro pode achar que o 2xx basta.
4. **O worker ficou rodando durante a janela, por desenho desta ordem.** O runbook §7 passo 3
   mandava `systemctl --user stop roteiro`; a ordem do orquestrador mandou deixar de pé, porque o
   503 já torna a reserva impossível e o supervisor por cron subiria a unit de volta em até
   5 min. O log não acusou erro repetido.
5. **O `chmod 600` no dump falha, e isso é esperado.** O arquivo nasce de `root` dentro do bind
   mount, então o `infuser` não consegue mudar o modo. Ele fica `644` dentro de um diretório
   `700` do próprio `infuser`, que é a proteção real. O `.resumo`, criado pelo shell, é `600`.
6. **`node` não está no `PATH` de sessão ssh não interativa.** Ele mora em
   `/home/infuser/.local/bin/node` (o mesmo caminho que o unit `roteiro` usa no `ExecStart`).
   `validate-env.mjs` e `smoke.mjs` precisam do caminho completo.

### Achado de segurança fora do escopo

**O header do segredo do worker é gravado em claro no access log do Caddy.** O bloco
`log { format json }` de `useinfuser.com` registra os headers da requisição, então o segredo
aparece em texto em `/var/log/caddy/useinfuser.access.log`, que fica em disco. É anterior a esta
janela e vale para qualquer header sensível que passe pela borda. Remédio barato: redigir os
headers nesse bloco de log. Não foi tocado aqui porque o Caddy está fora do escopo desta ordem
além do bloco temporário.
