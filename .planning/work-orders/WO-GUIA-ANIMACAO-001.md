---
work_order: WO-GUIA-ANIMACAO-001
created: 2026-11-11
updated: 2026-11-11
status: active
classe: conteudo
risco: baixo
central_branch: main
owner: Claude
authorized_by: Pedro
authorized_at: 2026-11-11
definition_source: pedido do Pedro em 11/11/2026 ("crie o guia dos prompts usando a skill de guias da infuser"), palavra ANIMAÇÃO; reel "10 estilos de animação no Claude"
scope_lock:
  version: 1
  base_commit: 3089613
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-ANIMACAO-001.md
    - public/guia-animacoes-claude.html
    - src/app/guia-animacoes-claude/**
    - src/app/animacao/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-animacoes-claude.html, src/app/guia-animacoes-claude/route.ts, src/app/animacao/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-animacoes-claude, GET /animacao]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GAN-01, GAN-02, GAN-03]
  stop_when: [GAN-01, GAN-02, GAN-03]
  passed_acceptance_ids: []
---
# Guia ANIMAÇÃO do reel "10 estilos de animação no Claude" na Central

Objetivo: publicar "Dez estilos de animação no Claude" em `/guia-animacoes-claude`, com atalho `/animacao`, protegido pelo cadastro e listado na Central em Guias (categoria Conteúdo e criação). Entrega o que o reel promete ("comente Animação e receba os prompts"): o pedido de cena base, os dez pedidos de estilo do vídeo (Pixel Art, Lousa de Giz, Esboço Neon, Estilo PS2, Quadrinhos, Vetor Flat, Linha Minimalista, CGI Motion, Blocos de montar e Explainer 3D), o pedido para renderizar em MP4 e o pedido para montar o reel, além de erros comuns, cuidados com marcas de terceiros, checklist e perguntas. Texto próprio da Infuser, sem reproduzir os prompts de terceiros.

- GAN-01: `GUIAS` tem 60 itens e os dois caminhos resolvem para o guia; testes de `tests/guias` com as contagens novas (73 itens, 65 gratuitos).
- GAN-02: build de produção sem erro e smoke da VPS cobrindo `/guia-animacoes-claude` e `/animacao`.
- GAN-03: em produção, sem sessão o guia redireciona ao cadastro.
