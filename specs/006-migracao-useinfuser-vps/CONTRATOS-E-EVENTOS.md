---
tags: [engenharia, contratos, eventos, fila, webhook]
status: ready
version: 1.0
updated: 2026-09-09
---

# Contratos e eventos: migração do useinfuser.com

## 1. Fronteiras

| Chamador | Chamado | Contrato preservado | Dono |
|---|---|---|---|
| Navegador | Next | URLs, HTML, assets e status | Site |
| Cal/Stripe | Webhooks | URL, assinatura, idempotência e códigos | Funil |
| Worker VPS | Fila de roteiro | Header secreto e JSON atual | Funil |
| Next | Neon/Google/Cal/n8n/MCP | Envs e TLS atuais | Integração |

## 2. Correção do contrato de fila

Estado atual: o worker solicita `?esperar=25`, a rota mantém a conexão e consulta o banco a cada 2 segundos. Isso é query longa, não evento, e foi suficiente para pausar a conta.

Contrato alvo:

- `GET /api/diagnostico/roteiro/fila` responde imediatamente.
- O header `x-roteiro-secret`, o schema JSON e a reserva transacional permanecem iguais.
- O worker espera localmente 60 segundos entre voltas bem-sucedidas.
- Erro de rede ou HTTP mantém backoff de 30 segundos.
- A fila Postgres continua sendo o log durável e a fonte de idempotência.

Não será criado evento CloudEvents nesta correção. Retrofit de barramento ampliaria o incidente sem ser necessário para restaurar o serviço. Se a fila virar integração reutilizável entre produtos, o gatilho de reconsideração é criar evento assinado `roteiro.queued.v1` com dedupe por `(source,id)` e DLQ existente.

## 3. Estado e transições

```mermaid
stateDiagram-v2
  [*] --> pendente
  pendente --> processando: worker reserva
  processando --> concluido: worker conclui
  processando --> falhou: worker reporta falha
  falhou --> processando: retry abaixo do teto
```

## 4. Idempotência, ordem e concorrência

- chave de negócio: `cal_booking_id`.
- reserva: `FOR UPDATE SKIP LOCKED` existente.
- retry preserva o mesmo item e incrementa tentativa na reserva.
- reserva vencida retorna ao consumo conforme regra existente.
- um único supervisor deve executar o worker.

## 5. Versionamento e compatibilidade

| Versão | Mudança | Compatibilidade |
|---|---|---|
| v1 | Resposta imediata e pausa no consumidor | Payload e auth não mudam; consumidor antigo perde apenas a espera. |

## 6. Falhas e erros tipados

| Código/status | Significado | Retry | Remediação |
|---|---|---:|---|
| 401 | Segredo ausente/incorreto | Não | Corrigir secret. |
| 500 `config_missing` | Env ausente | Não automático | Corrigir configuração. |
| 500 `storage_failed` | Neon indisponível/erro | Sim, 30 s | Alertar se persistente. |
| 502/503 | App/upstream indisponível | Sim, 30 s | Health, logs e rollback. |

## 7. Segurança e dados proibidos

- Segredo em header, nunca em URL ou log.
- Nenhum corpo de lead é logado pelo worker ou smoke.
- Webhooks mantêm verificação de assinatura antes de mutação.
- Caddy não cria rota administrativa nova.

## 8. Testes de contrato

- fila sem segredo retorna 401 imediatamente;
- source guard garante ausência de `esperar=25` e presença de pausa local;
- webhooks sem assinatura retornam 4xx e não escrevem;
- `/time` continua reescrevendo para o upstream atual.
