---
work_order: WO-ESTUDIO-VENDAS-003
created: 2026-11-13
updated: 2026-11-13
status: active
classe: conteudo
risco: baixo
central_branch: claude/estudio-animacoes
scope_lock:
  version: 1
  base_commit: 1701a92
  allowed_write_globs:
    - .planning/work-orders/WO-ESTUDIO-VENDAS-003.md
    - public/estudio.html
    - public/estudio/**
  architecture_delta:
    production_files: [public/estudio.html]
    runtime_dependencies: []
    public_contracts: [GET /estudio]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [AC-01, AC-02]
  stop_when: [AC-01, AC-02]
  passed_acceptance_ids: []
---
# Página do Estúdio: banco de 84 animações

Pedido do Yan (13/11/2026, "Sim, atualiza"): a página de vendas `/estudio` passa a mostrar o banco de animações que entrou no produto na E10 (aba Animações na 1.550.0, Editor de Reels 1.5.0). Mesmo método da WO-002: interface capturada do origin/master do infuser-mcp, servida localmente, sem dado de comprador.

- AC-01: a seção do Editor mostra a aba Animações em vídeo (`ui-animacoes.mp4` + poster), o destaque "84 animações prontas" e o Editor 1.5.0; agente, oferta e og:description citam 17 efeitos e 84 animações. Zero travessão, preço só no Investimento.
- AC-02: no ar, conferida em 1440 e 375 sem rolagem lateral e sem erro no console; o vídeo novo toca.
