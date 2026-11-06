---
work_order: WO-GUIA-SETUP-001
created: 2026-11-06
updated: 2026-11-06
status: active
classe: conteudo
risco: baixo
central_branch: guia-setup
scope_lock:
  version: 1
  base_commit: ea4b181e495fc26c12c4951ee58f5bc8c64fb2bf
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-SETUP-001.md
    - public/guia-claude-instagram.html
    - src/app/guia-claude-instagram/route.ts
    - src/app/setup/route.ts
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-claude-instagram.html, src/app/guia-claude-instagram/route.ts, src/app/setup/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-claude-instagram, GET /setup, GET /guia-claude-instagram.html, GET /guias/claude-instagram]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [AC-01, AC-02, AC-03]
  stop_when: [AC-01, AC-02, AC-03]
  passed_acceptance_ids: []
---

# Publicar guia SETUP do Reel 8

Guia gratuito prometido pelo Reel 8, "O Claude conectado ao Instagram", palavra SETUP. O roteiro cita uma skill sem nome. O guia usa o conector oficial do Metricool, ferramenta já adotada pela Infuser, com caminho alternativo por dados colados. Requisitos conferidos na documentação do Metricool em 06/11/2026.

AC-01: guia no catálogo como claude-instagram, categoria Conteúdo e criação, com portas protegidas pelo cadastro; tests/guias aprovados.
AC-02: QA em desktop e mobile sem rolagem lateral, com pedidos copiáveis e checklist funcionando; build e smoke aprovados.
AC-03: deploy feito por Yan, com as rotas conferidas no apex e no www.
