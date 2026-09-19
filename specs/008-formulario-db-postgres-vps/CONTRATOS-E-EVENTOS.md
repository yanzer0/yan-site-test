---
tags: [engenharia, contratos, api, webhooks, migracao, postgres]
status: ready
version: 1.0
updated: 2026-09-19
---

# Contratos e eventos: `formulario-db`

## 1. Fronteiras

| Fronteira | Contrato | Muda? |
|---|---|---|
| Navegador -> `POST /api/diagnostico/submit`, `/parcial` | payload, validação, respostas e erros atuais | Não. |
| Cal.com -> `POST /api/diagnostico/cal-webhook` | HMAC sha256 do raw body, `timingSafeEqual`, upsert por `cal_booking_id` | Não. |
| Stripe -> `POST /api/diagnostico/mapa-pago/webhook` | `stripe-signature`, upsert por `stripe_session_id` | Não. |
| Worker -> `GET /api/diagnostico/roteiro/fila`, `POST /roteiro/concluir` | `ROTEIRO_WORKER_SECRET`, reserva com `SKIP LOCKED`, tentativas | Não. |
| Painel -> `/leads*`, `/api/diagnostico/mapa/*` | sessão, CSP, `no-store`, `MAPA_PUBLICAR_SECRET` | Não. |
| Caddy -> site | `reverse_proxy` com health em `/api/health` | Não; ganha um bloco temporário na janela. |
| Código -> banco | `sql` de `@vercel/postgres` | **Sim**: módulo interno sobre `pg`. |
| Site -> env | `POSTGRES_URL` e `POSTGRES_URL_NON_POOLING` obrigatórios | **Sim**: o segundo vira opcional. |
| cron -> banco | inexistente | **Sim**: dump diário por `docker exec`. |

Nenhum evento novo é emitido ou consumido entre sistemas. A skill `event-driven` não se aplica:
o banco é interno ao produto e os contratos externos ficam byte a byte iguais.

## 2. Contrato do módulo de banco (`src/lib/diagnostico/banco.ts`)

```ts
export interface Resultado<T> { readonly rows: T[]; readonly rowCount: number }
export function sql<T = Record<string, unknown>>(strings: TemplateStringsArray, ...values: unknown[]): Promise<Resultado<T>>;
export namespace sql { function query<T = Record<string, unknown>>(text: string, params?: readonly unknown[]): Promise<Resultado<T>>; }
export function encerrarPool(): Promise<void>;     // testes e scripts encerram o processo limpo

// scripts/diagnostico/banco.mjs (script e .mjs e nao importa TypeScript; o helper mora la)
export function abrirCliente(connectionString?: string): Client;  // um Client TCP por execucao
```

Regras:

- interpolação no tagged template vira sempre parâmetro posicional; nunca concatenação de string
  (regra já escrita em `db.ts` e mantida);
- `undefined` em parâmetro lança `TypeError` antes de ir ao banco (o pacote atual envia `null`
  em silêncio; aqui falha alto);
- erro do driver sobe encapsulado em `ErroPersistencia(operacao, causa)` onde o chamador já faz
  isso; o módulo não loga texto de query nem parâmetro. A única linha que ele escreve é o
  CÓDIGO de um erro em conexão ociosa, que não tem chamador esperando: sem esse listener o `pg`
  derruba o processo inteiro por evento `error` não tratado;
- `POSTGRES_URL` ausente ou sem protocolo `postgres:`/`postgresql:` falha no carregamento do
  módulo, não na primeira query. A trava de carregamento fica de fora quando não há servidor
  atrás (`NEXT_PHASE=phase-production-build` e `NODE_ENV=test`): ali o módulo é importado só
  para ler configuração de rota, ou porque um teste de função pura o arrasta no grafo de
  imports, e travar transformaria variável de EXECUÇÃO em requisito de compilação e de teste.
  Nos dois casos a mesma validação continua valendo na abertura do pool;
- o pool é único por processo (`globalThis` em dev para sobreviver ao HMR do Next);
- `statement_timeout` 15 s e `connectionTimeoutMillis` 5 s; o Neon HTTP não tinha nenhum dos dois.

Mutante que a F2 tem que reprovar: qualquer arquivo em `src/` ou `scripts/` importando
`@vercel/postgres` ou `@neondatabase/serverless`.

## 3. Contrato do env (`deploy/vps/validate-env.mjs`)

| Variável | Hoje | Depois da F2 | Valor na F5 |
|---|---|---|---|
| `POSTGRES_URL` | obrigatória, Neon pooler | obrigatória, TCP | `postgresql://formulario:<senha>@formulario-db:5432/formulario` |
| `POSTGRES_URL_NON_POOLING` | obrigatória, Neon direto | opcional; se ausente, `= POSTGRES_URL` | omitida |
| `POSTGRES_*` restantes do export da Vercel | ignoradas | ignoradas; removidas do env na F7 | removidas |

Até a F2 entrar, os dois nomes continuam exigidos; na F5 o env da VPS traz os dois com o mesmo
valor TCP se a F2 ainda não tiver relaxado o validador. Ordem segura: F2 antes de F5 (é o DAG).

## 4. Contrato da janela de corte

| Rota | Método | Durante a janela | Quem sente | Depois |
|---|---|---|---|---|
| `/api/diagnostico/*` | todos | 503 + `Retry-After: 600` pelo Caddy | lead, Cal, Stripe, worker | normal |
| `/leads`, `/leads/*` | todos | 503 + `Retry-After: 600` | time Infuser | normal |
| `/api/health` | GET | 200 (não toca o banco) | Caddy health | normal |
| demais páginas | GET | normal | ninguém | normal |

Duração alvo: até 15 min; abortar e reverter se passar de 30. Registro obrigatório dos instantes
de fechamento e reabertura (UTC) no closeout da F5, porque a reconciliação usa esses limites.

## 5. Idempotência, reentrega e reconciliação

| Origem | Chave de idempotência | Reentrega | Reconciliação na reabertura |
|---|---|---|---|
| Cal.com | `cal_booking_id` (UNIQUE em `agendamentos` e `roteiros`) | hipótese: reenvia não-2xx | listar bookings da API do Cal com `createdAt` ou `updatedAt` dentro da janela; cada um ausente em `agendamentos` é reprocessado pelo utilitário existente de reset/refazer do roteiro, com o payload buscado na API. Zero ausentes é o esperado em horário morto. |
| Stripe | `stripe_session_id` (UNIQUE em `pedidos_mapa`) | fato: reenvia não-2xx por até 3 dias | painel do Stripe: eventos com falha na janela, todos entregues com 200 depois; um evento de teste disparado manualmente após reabrir. |
| Lead (formulário) | `(email_norm, whatsapp_norm)` em `leads`; `sessao_id` em `parciais` | nenhuma; o lead vê erro | aceito: janela em horário morto, avisado no grupo. |
| Worker | reserva por `SKIP LOCKED`; conclusão por `cal_booking_id` | o próprio laço | nenhuma; nada foi reservado durante o 503. |

## 6. Cadência do worker

`PAUSA_ENTRE_CONSULTAS_MS` volta de `1_800_000` para `60_000` na F5, depois do corte, no mesmo
commit que remove o caso "keeps the Neon compute awake at most 20% of the time" de
`tests/diagnostico/fila-worker.test.ts`. Os outros dois guards do teste (sem long-poll na rota da
fila; `dormir(pausar ? PAUSA_APOS_ERRO_MS : PAUSA_ENTRE_CONSULTAS_MS)`) continuam. A unit
`roteiro` é reiniciada com `systemctl --user restart roteiro` e o processo novo é confirmado.

## 7. Versionamento e compatibilidade

- Schema: versão idêntica (dump carrega o real). `aplicar-schema.mjs` ganha os três `.sql` só
  para ambiente vazio; rodar no banco restaurado tem que ser no-op (todos os statements são
  `IF NOT EXISTS` ou `ADD COLUMN IF NOT EXISTS`; verificar na F2).
- Env: compatível nos dois sentidos entre F2 e F5.
- Sem versão de API, sem header novo.

## 8. Falhas e erros tipados

| Situação | Erro | Resposta | Log |
|---|---|---|---|
| Banco indisponível | `ErroPersistencia` (causa `ECONNREFUSED`/timeout) | 500 `storage_failed` como hoje | operação + código, sem parâmetro |
| `POSTGRES_URL` ausente | falha no boot do módulo | container não fica healthy | mensagem fixa |
| Parâmetro `undefined` | `TypeError` no módulo | 500 | nome da operação |
| Janela | 503 do Caddy | `Retry-After: 600` | access log do Caddy |

## 9. Segurança e dados proibidos

- Nenhum valor de `POSTGRES_URL` em log, teste, smoke, chat ou commit.
- O módulo nunca loga texto de query com parâmetros.
- O dump é o único artefato com PII: 700 no disco, `age` antes de sair, sha256 ao lado.

## 10. Testes de contrato

- estático: nenhum import de `@vercel/postgres` ou `@neondatabase/serverless` em `src/` e
  `scripts/`; `PAUSA_ENTRE_CONSULTAS_MS = 60_000` só depois da F5;
- unidade: tagged template gera `$1..$n` na ordem; `undefined` lança; `sql.query` repassa params;
- integração (quando `TEST_POSTGRES_URL` está definido, senão o caso é pulado com aviso visível):
  `aplicar-schema.mjs` num banco vazio cria as 14 tabelas; segundo run é no-op; reserva com
  `SKIP LOCKED` entrega itens distintos a dois clientes concorrentes;
- produção: smoke da 006 mais webhooks negativos (401 sem assinatura) e fila autenticada.
