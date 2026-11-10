---
work_order: WO-GUIA-CRITICO-001
created: 2026-11-10
updated: 2026-11-10
status: active
classe: conteudo
risco: baixo
central_branch: main
owner: Claude
authorized_by: Pedro
authorized_at: 2026-11-10
definition_source: pedido do Pedro em 10/11/2026 ("suba o guia do reels 13 com a skill de subir guias da infuser"), palavra CRÍTICO; doc ROTEIROS E PROMPTS · SEMANA 1, item 13 dos guias
scope_lock:
  version: 1
  base_commit: b3a57bc
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-CRITICO-001.md
    - public/guia-chatgpt-critico.html
    - public/guias/chatgpt-critico/**
    - src/app/guia-chatgpt-critico/**
    - src/app/critico/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-chatgpt-critico.html, public/guias/chatgpt-critico/, src/app/guia-chatgpt-critico/route.ts, src/app/critico/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-chatgpt-critico, GET /critico, GET /guias/chatgpt-critico]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GCR-01, GCR-02, GCR-03]
  stop_when: [GCR-01, GCR-02, GCR-03]
  passed_acceptance_ids: []
---
# Guia CRÍTICO do Reel 13 (ChatGPT que concorda com tudo) na Central

Objetivo: publicar "Faça o ChatGPT parar de concordar com tudo" em `/guia-chatgpt-critico`, com atalho `/critico`, protegido pelo cadastro e listado na Central em Guias (categoria ChatGPT). Entrega exatamente o prompt de instruções personalizadas mostrado no Reel 13, o caminho no ChatGPT com as telas reais capturadas para o vídeo, um teste rápido, três usos (decisão, ideia e plano), erros comuns, cuidados (a configuração não elimina erros), checklist e perguntas. O guia antigo `/guia-ia-sem-bajulacao` continua no ar sem mudança.

- GCR-01: `GUIAS` tem 59 itens e os dois caminhos resolvem para o guia; testes de `tests/guias` com as contagens novas (72 itens, 64 gratuitos).
- GCR-02: build de produção sem erro e smoke da VPS cobrindo `/guia-chatgpt-critico` e `/critico`.
- GCR-03: em produção, sem sessão o guia redireciona ao cadastro.
