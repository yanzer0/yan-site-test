---
work_order: WO-GUIA-CLICKUP-001
status: active
central_branch: claude/guia-clickup
owner: Claude
authorized_by: Yan
authorized_at: 2026-10-17
definition_source: pedido do Yan em 17/10/2026 (gerar o guia de instalação, uso e casos práticos da skill implementar-com-clickup e subir em useinfuser.com/guia-clickup como entregável de quem comentar no vídeo do mesmo dia)
scope_lock:
  version: 1
  base_commit: 4490803
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-CLICKUP-001.md
    - public/guia-clickup.html
    - public/downloads/implementar-com-clickup.zip
    - src/app/guia-clickup/route.ts
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files:
      - public/guia-clickup.html
      - public/downloads/implementar-com-clickup.zip
      - src/app/guia-clickup/route.ts
      - deploy/vps/smoke.mjs
    runtime_dependencies: []
    public_contracts: [GET /guia-clickup, GET /downloads/implementar-com-clickup.zip]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GCU-01, GCU-02, GCU-03]
  stop_when: [GCU-01, GCU-02, GCU-03]
  passed_acceptance_ids: []
---

# Guia da skill Implementar com ClickUp

## Resultado autorizado

- Página estática self-contained em `/guia-clickup`, no molde de `public/guia-skill.html` (identidade v2),
  com instalação, uso no dia a dia, casos de uso, limites e FAQ da skill.
- O ZIP empacotado da skill (`C:\tmp\implementar-com-clickup.zip`, 7 arquivos, sem dado interno) servido
  em `/downloads/implementar-com-clickup.zip`.
- Rota `src/app/guia-clickup/route.ts` no padrão das outras rotas de guia e `/guia-clickup` no smoke.

## Critérios de aceite

- `GCU-01`: em 375 e 1024 px rolagem lateral 0, console sem erro, zero travessão no texto visível, CTA do
  Segundo Cérebro entre 25% e 35% da altura e os três links de download apontando pro ZIP.
- `GCU-02`: comando e endereço do MCP do ClickUp iguais aos da documentação oficial do ClickUp; ZIP sem
  nome de cliente, ID de workspace, caminho interno ou credencial.
- `GCU-03`: publicado pela VPS com `is healthy` do SHA novo; `/guia-clickup` e
  `/downloads/implementar-com-clickup.zip` respondem 200 no apex e no `www`.
