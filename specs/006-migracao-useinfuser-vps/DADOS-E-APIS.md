---
tags: [engenharia, dados, api, migracao]
status: ready
version: 1.0
updated: 2026-09-09
---

# Dados e APIs: migração do useinfuser.com

## 1. Autoridade e ciclo de vida

| Dado | Autoridade | Mudança nesta fatia | Classificação |
|---|---|---|---|
| Leads, respostas, agenda, roteiros e mapas | Neon existente | Nenhuma | Sensível |
| Sessão/admin do painel | Cookies + Neon/código existente | Nenhuma | Sensível |
| Assets e páginas | Git/release da aplicação | Empacotamento Docker | Público |
| Configuração de produção | Env exportado da Vercel | Movida para arquivo 600 | Secreta/mista |

## 2. Modelo e migrations

Nenhuma tabela, coluna, constraint, índice, linha ou retenção será alterada. A migration é de runtime e borda.

## 3. APIs e autorização

Todas as APIs existentes preservam método, path, input, output e auth. A única API nova é:

| Método | Auth | Output | Erros | Limite |
|---|---|---|---|---|
| `GET /api/health` | Público | `{ok,service,release}` | 503 se boot inválido | Caddy/infra pode limitar futuramente |

O health não consulta dados, não revela configuração e não substitui smoke de dependências.

## 4. Redaction e exposição

- Smoke registra apenas path, status, latência e release.
- Nenhum valor de env ou corpo protegido é impresso.
- Arquivo de env não entra no contexto do Docker nem no Git.

## 5. Performance e capacidade

| Operação | Volume | Orçamento | Como medir |
|---|---:|---:|---|
| Health | baixo | < 200 ms interno | curl time_total |
| Página pública | tráfego atual | Sem regressão visual/HTTP | smoke e logs |
| Poll da fila | 1/min | Resposta imediata | log e duração do curl |

## 6. Backup, restore e exclusão

O banco permanece no Neon, sem migration de dados. O rollback não restaura banco porque nenhuma escrita de schema ou backfill acontece.
