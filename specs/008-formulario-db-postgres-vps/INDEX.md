---
tags: [engenharia, definicao, index, migracao, postgres]
status: ready-for-build
definition_version: 1.0
updated: 2026-09-19
---

# O banco do funil sai do Neon para a VPS - pacote de definição

## Manifesto vinculante

| Ordem | Documento | Estado | Versão | Dono | Revisor | Observação |
|---:|---|---|---|---|---|---|
| 0 | [README.md](README.md) | ready | 1.0 | Yan | Claude /codar | Fatos da F0, decisões congeladas, escopo e gate. |
| 1 | [PRD.md](PRD.md) | ready | 1.0 | Yan | Claude /codar | Problema medido, requisitos, métricas e aceite. |
| 2 | [ARQUITETURA.md](ARQUITETURA.md) | ready | 1.0 | Claude /software-engineer | Yan, pelo go explícito | Rede, role, driver, janela e fitness functions. |
| 3 | [CONTRATOS-E-EVENTOS.md](CONTRATOS-E-EVENTOS.md) | ready | 1.0 | Claude /software-engineer | Yan, pelo go explícito | APIs preservadas; contrato do wrapper, do env e da janela. |
| 4 | [DADOS-E-APIS.md](DADOS-E-APIS.md) | ready | 1.0 | Claude /software-engineer | Yan, pelo go explícito | Autoridade, dump/restore, roles, retenção e redaction. |
| 5 | [UX-E-CONTEUDO.md](UX-E-CONTEUDO.md) | not-applicable | 1.0 | Yan | Claude /codar | Nada visível muda; só a janela de 503 tem efeito, descrito lá. |
| 6 | [PLANO-DE-IMPLEMENTACAO.md](PLANO-DE-IMPLEMENTACAO.md) | ready | 1.0 | Claude /codar | Yan, pelo go explícito | DAG F0 a F7, ondas, Scope Lock por fatia, rollout e rollback. |
| 7 | [VERIFICACAO-E-OPERACAO.md](VERIFICACAO-E-OPERACAO.md) | ready | 1.0 | Claude /software-engineer | Yan, pelo go explícito | Invariantes, provas por fatia, runbook da janela e do rollback. |
| 8 | [DECISAO-ARQUITETURAL.md](DECISAO-ARQUITETURAL.md) | ready | 1.0 | Claude /software-engineer | Yan, pelo go explícito | Postgres 17 dedicado na VPS; alternativas rejeitadas. |

Anexo: [INVENTARIO-F0.md](INVENTARIO-F0.md), o inventário só leitura do Neon vivo (19/09/2026).

## Gate antes do build

- [x] Todos os artefatos têm dono, versão e estado.
- [x] Fatos, hipóteses, lacunas e decisões estão separados no `README.md`.
- [x] Nenhuma decisão em aberto bloqueia F1 nem F2.
- [x] Requisitos rastreiam até arquitetura, fatia e prova (`PRD.md` §11).
- [x] O plano declara DAG, caminho crítico, ondas, escopos exclusivos de escrita e checkpoints.
- [x] Segurança, dados, rollout, rollback e operação estão proporcionais ao risco alto.
- [x] O `README.md` declara `definition_status: ready-for-build`.
- [ ] `WO-FORMULARIO-DB-002` (F1) e `-003` (F2) abertas com o Scope Lock do plano §4. Sem elas,
      nenhuma escrita em produção.

## Precedência

1. `AGENTS.md` e `CLAUDE.md` do repositório.
2. Este pacote e sua decisão arquitetural.
3. A work order ativa na branch da frente (`.planning/work-orders/WO-FORMULARIO-DB-00N.md`).
4. Código, testes e evidências que materializam os contratos.
