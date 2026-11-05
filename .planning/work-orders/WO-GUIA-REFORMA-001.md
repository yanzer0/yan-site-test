---
work_order: WO-GUIA-REFORMA-001
created: 2026-11-05
updated: 2026-11-05
status: completed
classe: conteudo
risco: baixo
central_branch: codex/guia-reforma-tributaria-20261105
scope_lock:
  version: 1
  base_commit: eb7b662e36d1688efa4128abca5f5586041cba54
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-REFORMA-001.md
    - public/guia-reforma-tributaria.html
    - src/app/reforma-tributaria/route.ts
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
    - specs/009-central-guias/VERIFICACAO-E-OPERACAO.md
  architecture_delta:
    production_files: [public/guia-reforma-tributaria.html, src/app/reforma-tributaria/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /reforma-tributaria, GET /guia-reforma-tributaria.html, GET /guias/reforma-tributaria]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [AC-01, AC-02, AC-03]
  stop_when: [AC-01, AC-02, AC-03]
  passed_acceptance_ids: [AC-01, AC-02, AC-03]
report_status: AC-01 PASS: 52 guias e 65 itens na Central. 726 testes aprovados e 10 integracoes de ambiente puladas. AC-02 PASS: QA desktop e 375px, persistencia, copia e navegacao Central-guia-diagnostico. AC-03 PASS: release 7776ad89e35b healthy. 184 probes por host. Tres portas protegidas e HTML autenticado identico. Rollback 7b1f07734812.
code_artifact_commit: ed80dbe
---

# Guia gratuito de reforma tributária

Pedido explícito de Yan neste chat em 05/11: produzir e publicar em useinfuser.com/reforma-tributaria, incluir na Central e apontar ao formulário. Autoriza publicação pelo deploy existente. Isca do carrossel com CTA de comentário OPERAÇÃO. Sem alteração de ManyChat.

Reutilizar o HTML v2 claro do guia EDITAR, catálogo e proteção existentes. 24 perguntas com evidência sugerida, panorama breve 2026/2027/2029-2033, checklist local e roteiro de pendências. CTA /diagnostico. Fontes primárias Receita Federal e Ministério da Fazenda. Não afirmar garantia de regularidade fiscal.

AC-01: guia 52 na Central (65 itens, 57 gratuitos), três portas resolvidas e protegidas; Vitest tests/guias passa sem remoção de asserts.
AC-02: QA em desktop e 375px, checklist persiste e botão leva a /diagnostico; build de produção e smoke aprovados.
AC-03: publicação autorizada, /api/health na release correta, caminhos protegidos sem sessão e conteúdo correto com sessão, Central e formulário acessíveis pelo fluxo existente.

Fora: layout da Central, captura, consentimentos, banco, regras fiscais da empresa, checkout, DNS, Caddy, disparos e automação de comentários. Sem event-driven: não há contrato novo entre sistemas. Sem dependência nova. Teto de duas rodadas ou 90 min.

Rollback: imagem anterior pelo compose já documentado em deploy/vps/README.md. Alterações estáticas e aditivas, sem migration.

## Closeout 2026-11-05

status: completed · report_status: AC-01 PASS: 52 guias e 65 itens na Central. 726 testes aprovados e 10 integracoes de ambiente puladas. AC-02 PASS: QA desktop e 375px, persistencia, copia e navegacao Central-guia-diagnostico. AC-03 PASS: release 7776ad89e35b healthy. 184 probes por host. Tres portas protegidas e HTML autenticado identico. Rollback 7b1f07734812. · code_artifact_commit: ed80dbe
