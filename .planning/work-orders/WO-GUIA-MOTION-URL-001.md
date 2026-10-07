---
work_order: WO-GUIA-MOTION-URL-001
status: active
central_branch: main
owner: Claude
authorized_by: Yan
authorized_at: 2026-10-07
definition_source: pedido do Yan em 07/10/2026 ("suba em useinfuser.com/guiamotion")
scope_lock:
  version: 1
  base_commit: 3b7b9be572471713a9b8b73d564b341ac3c04647
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-MOTION-URL-001.md
    - src/app/guiamotion/route.ts
    - public/guia-videos-motion.html
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files:
      - src/app/guiamotion/route.ts
      - public/guia-videos-motion.html
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GM-S01, GM-S02]
  stop_when: [GM-S01, GM-S02]
  passed_acceptance_ids: []
---

# Guia de vídeos em motion em /guiamotion

## Resultado autorizado

Yan, 07/10/2026: "suba em useinfuser.com/guiamotion". HTML vindo de `Downloads/guia-videos-motion.html`
(já com GTM e quebra de linha do `.code` no mobile); og:url ajustado pra /guiamotion.

## Critérios

- GM-S01: `/guiamotion` responde 200 com o guia nos dois hosts.
- GM-S02: deploy na VPS saudável (`/api/health` + smoke).
