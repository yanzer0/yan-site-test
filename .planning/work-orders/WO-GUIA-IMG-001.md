---
work_order: WO-GUIA-IMG-001
created: 2026-11-05
updated: 2026-11-05
status: completed
classe: conteudo
risco: baixo
central_branch: codex/guia-img-20261105
scope_lock:
  version: 1
  base_commit: 38a9511e9ea5922511d771cb03e2e0698fe2f3ff
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-IMG-001.md
    - public/guia-img.html
    - src/app/guia-img/route.ts
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-img.html, src/app/guia-img/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-img, GET /guia-img.html, GET /guias/imagem]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [AC-01, AC-02, AC-03]
  stop_when: [AC-01, AC-02, AC-03]
  passed_acceptance_ids: [AC-01, AC-02, AC-03]
---

# Publicar guia de imagem enviado por Pedro

Yan solicitou publicar C:/Users/PC/Downloads/guia-imagem-previa.html em useinfuser.com/guia-img e incluir na Central. Autorizacao de deploy explicita no chat. Preservar conteudo, estilo e recursos do HTML; ajustar somente URL de metadata e inserir o loader consentido padrao dos guias. Revisao estatica do anexo: script de copiar pedidos e checklist local, sem requests externos ou formularios.

AC-01: guia no catalogo como imagem, categoria ChatGPT, com tres portas protegidas pelo cadastro existente; tests/guias aprovados.
AC-02: QA desktop e 375px sem overflow, cinco pedidos presentes e botoes de copia funcionais; build e smoke aprovados.
AC-03: pagina e item da Central verificados em producao no apex e www, conteudo autenticado e release correta. Catálogo resultante: 53 guias, 66 itens, 58 gratuitos.

Sem schema, dependencias, consentimentos, ManyChat, DNS, Caddy ou redesenho. Event-driven dispensado: apenas conteudo e rotas existentes. Rollback: imagem anterior 7776ad89e35b pelo compose documentado. Um executor, duas rodadas ou 90 minutos.

## Closeout em 05/11/2026

AC-01 PASS: 291 testes de guias aprovados, seis testes HTTP dependentes de ambiente pulados. Catalogo: 53 guias, 66 itens e 58 gratuitos. AC-02 PASS: corpo do HTML anexado preservado integralmente por comparacao; QA desktop e 375px sem overflow, nove botoes de copia funcionais e checklist de 15 itens persistente. AC-03 PASS: release 6a4b868e153d healthy; build Linux e 186 probes em cada host aprovados. Navegacao real na Central encontrou o card pela busca e abriu https://useinfuser.com/guia-img com titulo e recursos corretos. Sem alteracao do arquivo original em Downloads.
