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
    - src/app/privacidade/page.tsx
    - public/guia*.html
    - public/opus*.html
    - public/agente-que-aprende.html
    - public/protocolo-de-autoria.html
    - public/tutorial-maestri.html
  architecture_delta:
    production_files: [src/lib/guias/**, src/app/guias/**, src/app/api/guias/**, src/app/leads/guias/**, src/app/leads/page.tsx, src/middleware.ts, public/guias/**, deploy/vps/smoke.mjs, src/app/privacidade/page.tsx, public/guia*.html, public/opus*.html, public/agente-que-aprende.html, public/protocolo-de-autoria.html, public/tutorial-maestri.html]
    runtime_dependencies: []
    public_contracts: [GET /guias, GET /guias/acesso, GET /guias/:slug, POST /api/guias/acesso]
    persistence_surfaces: [guias_leads, guias_consentimentos]
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

Handoff: conteúdo em `c3df1cb`; `npm run build` final concluiu com as rotas novas e middleware 36,9 kB. `TEST_GUIAS_HTTP_URL=http://127.0.0.1:3188 npm test -- tests/guias/http.test.ts`: 5 aprovados, incluindo proxy, variantes percent-encoded, sessão válida, cookie falso e subrequest. `git diff --check` e Scope Lock aprovados. Revisão de simplicidade: sem dependência nova ou abstração descartável; Lean already. Ship. Estado segue active para a revisão do root e a decisão explícita sobre AC-05, sem closeout falso.


## Rodada autorizada: marketing, v1.1

Fonte: novo pedido de Yan para guardar respostas, cookies/localização e dados úteis para públicos semelhantes e contato comercial. Atualização autorizada pelo root antes de uma única publicação. AC-01 mantém catálogo/gates e soma GTM condicionado nos 16 HTMLs; AC-02 soma escolhas opcionais, versão, metadados allowlisted e GeoJS tolerante a falhas; AC-03 soma preferências e revogação; AC-04 soma filtros comercial/Meta e proibição de texto livre no Meta; AC-05 mantém suíte/build e achado TS2493 fora da frente. Prova adicional: `npm test -- tests/guias/marketing.test.ts tests/guias/preferencias.test.ts`. Teto restante: 30 a 35 min sem ultrapassar os 90 min originais.

## Evidência v1.1

- `npm test`: 564 aprovados, 9 pulados por ambiente (4 Postgres descartável e 5 HTTP sem URL). Novos testes cobrem opt-out sem chamada GeoJS, indisponibilidade tolerada no cadastro, whitelist, loader condicionado, preferências/revogação e filtros/export Meta sem respostas livres.
- `tsc --noEmit`: somente os dois TS2493 legados do instalador, preservados fora da frente.
- Escolhas atuais por contato prevalecem sobre capturas antigas, e revogar remove enriquecimentos da base corrente. GTM é carregado uma vez após opt-in, e coleta posterior dos cookies exige autorização ainda vigente no servidor. Formulário e preferências nunca carregam GTM.
- Facto do código: 15 guias tinham o loader inline; `guia-ia-sem-bajulacao.html` não tinha. Nos 15 foi substituído só o script; no restante foi adicionado o mesmo loader funcional condicionado. Textos/botões/conteúdo dos 16 foram preservados.
- Localização é só estimada por IP (GeoJS, timeout 1,5s), sem prompt GPS. Não houve disparo de mensagem, campanha, criação de audiência nem alegação de conversão Meta.
- Migração atualizada é aditiva e repetível: `guias_leads` recebe escolhas/metadados e `guias_consentimentos` guarda histórico com versão/origem/horário do servidor. Aplicar antes da publicação; configuração continua apenas `GUIAS_ACCESS_SECRET`.
- Limite: tags do restante do site React continuam no carregador preexistente, fora desta fatia. A mudança de consentimento cobre central e os 16 guias; a política recebe a seção específica.
