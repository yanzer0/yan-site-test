---
tags: [engenharia, definicao, index, migracao, vps]
status: ready
definition_version: 1.0
updated: 2026-09-09
---

# Migração do useinfuser.com para a VPS - pacote de definição

## Manifesto vinculante

| Ordem | Documento | Estado | Versão | Dono | Revisor | Observação |
|---:|---|---|---|---|---|---|
| 0 | [README.md](README.md) | ready | 1.0 | Yan | Codex /codar | Entidade e decisões congeladas. |
| 1 | [PRD.md](PRD.md) | ready | 1.0 | Yan | Codex /codar | Resultado e aceite. |
| 2 | [ARQUITETURA.md](ARQUITETURA.md) | ready | 1.0 | Codex /software-engineer | Yan, pelo go explícito | Arquitetura ponta a ponta. |
| 3 | [CONTRATOS-E-EVENTOS.md](CONTRATOS-E-EVENTOS.md) | ready | 1.0 | Codex /event-driven | Codex /codar | Contratos preservados e correção do poll. |
| 4 | [DADOS-E-APIS.md](DADOS-E-APIS.md) | ready | 1.0 | Codex /software-engineer | Codex /codar | Sem migration de dados. |
| 5 | [UX-E-CONTEUDO.md](UX-E-CONTEUDO.md) | not-applicable | 1.0 | Yan | Codex /codar | A interface e o conteúdo não mudam; a prova é por paridade de rotas. |
| 6 | [PLANO-DE-IMPLEMENTACAO.md](PLANO-DE-IMPLEMENTACAO.md) | ready | 1.0 | Codex /codar | Yan, pelo go explícito | Fatias, rollout e rollback. |
| 7 | [VERIFICACAO-E-OPERACAO.md](VERIFICACAO-E-OPERACAO.md) | ready | 1.0 | Codex /software-engineer | Codex /codar | Gates de produção. |
| 8 | [DECISAO-ARQUITETURAL.md](DECISAO-ARQUITETURAL.md) | ready | 1.0 | Codex /software-engineer | Yan, pelo go explícito | VPS como host canônico. |

## Gate antes do build

- [x] Todos os artefatos têm dono, versão e estado.
- [x] Fatos, hipóteses, lacunas e decisões estão separados.
- [x] Nenhuma decisão em aberto bloqueia a primeira fatia.
- [x] Requisitos estão rastreados até arquitetura, implementação e verificação.
- [x] O plano declara DAG, caminho crítico, ondas, escopos e checkpoints.
- [x] Segurança, dados, rollout, rollback e operação estão proporcionais ao risco.
- [x] O `README.md` declara `definition_status: ready-for-build`.

## Precedência

1. `AGENTS.md` e `CLAUDE.md` do repositório.
2. Este pacote e sua decisão arquitetural.
3. A work order ativa `.planning/work-orders/WO-USEINFUSER-VPS-001.md`.
4. Código, testes e evidências que materializam os contratos.
