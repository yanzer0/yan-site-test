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
  passed_acceptance_ids: [AC-01, AC-02, AC-03, AC-04]
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

## Evidência da execução

RED inicial: `npm test -- tests/guias/catalogo.test.ts`, 2 falhas antes de implementar catálogo/proteção.
AC-01/03: catálogo + middleware, 63 testes aprovados; sessão, 5 aprovados. Todos os links, aliases, sublinks e 16 HTMLs cobertos.
AC-02: `tests/guias/acesso.test.ts`, 27 aprovados, incluindo seis campos, falha de banco, origem, tamanho e limites reais.
AC-04: `tests/guias/leads.test.ts` + `db.test.ts`, 7 aprovados, sem saída anônima e com CSV protegido.
Suíte: `npm test`, 542 aprovados; 9 pulados explicitamente (4 de Postgres descartável e 5 HTTP sem URL). Nenhum assert antigo removido.
HTTP real: suíte permanente em `tests/guias/http.test.ts`; rodada final após build cobre domínio público atrás do proxy.
AC-05 permanece parcialmente pendente: `npx tsc --noEmit` encontra somente TS2493 em `tests/instalar/instalar.test.ts:94,101`, arquivo sem delta. A mesma falha foi reproduzida no checkout principal com `node node_modules/typescript/bin/tsc --noEmit --incremental false --project C:/Users/PC/Documents/GitHub/yan-site-test/tsconfig.json`. Não foi corrigida por estar fora do escopo.
Código pronto para revisão do root; gate não foi relaxado. A revisão visual, a migração, o teste de gravação viva e o deploy não foram executados pelo executor.
