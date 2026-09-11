# Plano integrado

```text
W0 EDP + contratos
  -> W1 MCP
  -> W2 site
W1 + W2 -> W3 n8n/Hubla
W3 -> W4 E2E local
W4 -> W5 deploy MCP, depois site
W5 -> W6 E2E produção e revogação
```

| ID | Onda | Escopo | Gate |
|---|---:|---|---|
| W0 | 0 | dois EDPs e duas WOs | ready-for-build |
| W1 | 1 | backend, e-mail, ZIP e entitlement | teste backend |
| W2 | 1 | proxy, UX e ativos privados | teste + build |
| W3 | 2 | workflow e regra Hubla | pin data e execução controlada |
| W4 | 3 | servidores locais + browser | scanner, ativação, download e revogação |
| W5 | 4 | pipelines oficiais | health e smoke |
| W6 | 5 | produção controlada | link, cookie, ZIP e corte de acesso |

W1 e W2 só são paralelos após este contrato. MCP sobe antes do site. Workflow fica inativo até os
dois releases estarem saudáveis.

## Rollback

Despublicar workflow/regra, promover site anterior e desligar segredo dedicado no MCP.
