# Contrato: rotas de API

**Feature**: `001-funil-diagnostico-captura` | **Data**: 2026-08-14

Todas seguem o padrão de `src/app/api/kiwify-webhook/route.ts`: `runtime = "nodejs"`, `dynamic = "force-dynamic"`, payload tipado por interface e nunca `any`, e cabeçalho de comentário documentando fluxo, variáveis de ambiente e teste local.

---

## POST /api/diagnostico/submit

Recebe a submissão completa, pontua, persiste e devolve a faixa.

**Entrada**: respostas do formulário, origem declarada, marca de consentimento com timestamp, e o identificador de sessão do preenchimento.

**Saída**: a faixa resultante e, quando qualificado, os dados necessários para pré-preencher o embed do Cal.com. **Nunca devolve o score numérico**, que é informação interna.

| Situação | HTTP | Corpo |
|---|---|---|
| Sucesso | 200 | faixa, e dados de pré-preenchimento quando qualificado |
| Consentimento ausente | 400 | erro `consent_required` |
| Payload malformado | 400 | erro `invalid_payload` |
| Falha de banco | 500 | erro `storage_failed` |

**Invariantes**:

- O consentimento é validado no servidor. Ausente, nada é persistido.
- O score é calculado aqui, nunca recebido do cliente.
- Dado pessoal não entra em log. Falha registra o identificador de sessão, não o lead.
- Idempotente por identificador de sessão: reenvio do mesmo formulário atualiza, não duplica.
- Deduplicação por e-mail normalizado mais WhatsApp normalizado, conforme FR-033.

---

## POST /api/diagnostico/parcial

Grava o preenchimento parcial ao término de cada seção.

**Entrada**: identificador de sessão, respostas até aqui, índice da última pergunta respondida.

**Saída**: 204 sem corpo.

**Invariantes**:

- Parcial nunca vira lead concluído. É registro separado, conforme FR-025.
- Não exige consentimento, porque ainda não houve envio. Por isso mesmo, parcial **não** é base para contato: é dado de análise de abandono.
- Sobrescreve o parcial anterior da mesma sessão.

---

## POST /api/diagnostico/cal-webhook

Recebe `BOOKING_CREATED` do Cal.com e vincula o agendamento ao lead.

**Autenticação**: HMAC-SHA256 sobre o raw body, comparado em tempo constante com o header `x-cal-signature-256`. Segredo em `CAL_WEBHOOK_SECRET`.

| Situação | HTTP | Corpo |
|---|---|---|
| Sucesso | 200 | ok |
| Assinatura inválida ou ausente | 401 | erro `invalid_signature` |
| Segredo não configurado | 500 | erro `config_missing` |
| Evento que não interessa | 200 | ok, com marca de ignorado |
| Falha ao vincular | 200 | ok falso, com o erro |

**Por que 200 em falha de vínculo**: mesma razão do `kiwify-webhook`, evitar tempestade de retry do terceiro. A falha vai para o log e para o alerta, não para o código de status.

**Consumidor adicional**: a feature `003` consome este mesmo evento para gerar o roteiro e criar o card do lead no brain. Uma integração, dois consumidores. Esta rota não deve embutir a lógica da `003`.

---

## Variáveis de ambiente novas

| Nome | Sensível | Para quê |
|---|---|---|
| `POSTGRES_URL` | sim | Conexão do Vercel Postgres, injetada pela integração |
| `CAL_WEBHOOK_SECRET` | sim | Verificação HMAC do webhook do Cal.com |
| `CAL_EVENT_TYPE` | não | Identificador do tipo de evento da Call 1 no Cal.com |

Nenhuma delas entra em código, log ou repositório.
