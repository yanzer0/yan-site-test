---
work_order: WO-CENTRAL-GUIAS-001
created: 2026-10-28
updated: 2026-10-28
status: active
classe: feature
risco: alto
central_branch: codex/central-guias-20261028
scope_lock:
  version: 1
  base_commit: 4e3df3314726e5133bc2c7431f865d7583810665
  allowed_write_globs:
    - .planning/work-orders/WO-CENTRAL-GUIAS-001.md
    - specs/009-central-guias/**
    - src/lib/guias/**
    - src/app/guias/**
    - src/app/api/guias/**
    - src/app/leads/guias/**
    - src/app/leads/page.tsx
    - src/middleware.ts
    - public/guias/**
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [src/lib/guias/**, src/app/guias/**, src/app/api/guias/**, src/app/leads/guias/**, src/app/leads/page.tsx, src/middleware.ts, public/guias/**, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guias, GET /guias/acesso, GET /guias/:slug, POST /api/guias/acesso]
    persistence_surfaces: [guias_leads]
    background_jobs: []
  acceptance_ids: [AC-01, AC-02, AC-03, AC-04, AC-05]
  stop_when: [AC-01, AC-02, AC-03, AC-04, AC-05]
  passed_acceptance_ids: []
---
# Central de guias com cadastro obrigatório

Objetivo: biblioteca v2 clara, seis campos obrigatórios persistidos e sessão protegendo os 16 guias, aliases e HTMLs. Fora: conteúdo dos guias, diagnóstico, disparos e gate antigo.
Diagnóstico: `src/middleware.ts:151` cobre só demo/painel; 16 arquivos em `public/` são públicos. Banco e equipe existem. Definição: [manifesto](../../specs/009-central-guias/INDEX.md), v1.0, pronta.
AC-01: inventário completo e todos os caminhos protegidos. Prova: `npm test -- tests/guias/catalogo.test.ts tests/guias/middleware.test.ts`.
AC-02: seis campos validados e falha de persistência não libera. Prova: `npm test -- tests/guias/acesso.test.ts`.
AC-03: cookie válido/adulterado/expirado e middleware anterior preservado. Prova: `npm test -- tests/guias/sessao.test.ts tests/guias/middleware.test.ts`.
AC-04: consulta/export só para equipe aprovada. Prova: `npm test -- tests/guias/leads.test.ts`.
AC-05: suíte, TypeScript e build. Prova: `npm test`, `npx tsc --noEmit`, `npm run build`. QA visual e deploy pelo root, fora desta sessão.
Teto: 2 rodadas ou 90 minutos; preservar modelo/esforço vigente. Revisão e publicação pelo root; não alegar executadas.
