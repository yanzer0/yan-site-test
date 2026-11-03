---
work_order: WO-GUIA-PROMPT-001
created: 2026-11-03
updated: 2026-11-03
status: active
classe: conteudo
risco: baixo
central_branch: guia-prompt
scope_lock:
  version: 1
  base_commit: 49fa7ef
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-PROMPT-001.md
    - public/guia-videos-gemini.html
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - src/app/guia-videos-gemini/**
    - src/app/prompt/**
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-videos-gemini.html, src/lib/guias/catalogo.ts, src/middleware.ts, src/app/guia-videos-gemini/route.ts, src/app/prompt/route.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-videos-gemini, GET /prompt, GET /guias/videos-gemini]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [AC-01, AC-02, AC-03]
  stop_when: [AC-01, AC-02, AC-03]
  passed_acceptance_ids: []
---
# Guia PROMPT na Central

Objetivo: publicar o guia "4 prompts de vídeo no Gemini", entrega do Reel dos quatro prompts do Gemini (palavra-chave PROMPT), em identidade v2 clara, como 20º guia da Central, protegido pelo cadastro como os demais. Fonte do conteúdo: roteiro e prompts enviados no pedido de 03/11/2026. Fora: mudança de layout da Central e da captura; o middleware só ganha as três portas do guia na lista protegida.

- AC-01: `GUIAS` tem 20 itens e `/guia-videos-gemini`, `/prompt` e `/guias/videos-gemini` resolvem para o guia; testes de `tests/guias` verdes com as contagens novas.
- AC-02: build de produção sem erro e smoke da VPS cobrindo `/guia-videos-gemini` e `/prompt`.
- AC-03: em produção, sem sessão o guia redireciona ao cadastro; com sessão serve o HTML, e a Central mostra 32 itens.
