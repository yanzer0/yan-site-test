---
status: active
scope_lock:
  version: 1
  base_commit: 613e383f20395dc586919477d66e88b1aa0963ec
  allowed_write_globs:
    - specs/006-upsell-club-pos/**
    - public/pos.html
    - public/pos-oferta-final.html
    - public/pos-obrigado.html
    - src/app/pos/**
    - tests/pos/**
  architecture_delta:
    production_files:
      - public/pos.html
      - public/pos-oferta-final.html
      - public/pos-obrigado.html
      - src/app/pos/**
    runtime_dependencies: []
    public_contracts:
      - GET /pos
      - GET /pos/oferta-final
      - GET /pos/obrigado
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [AC-01, AC-02, AC-03, AC-04]
  stop_when: [AC-01, AC-02, AC-03, AC-04]
  passed_acceptance_ids: []
---

# WO-001 - Publicar `/pos`

Objetivo: integrar o pacote do Iago ao padrão estático do site e publicar o fluxo completo.

Evidências serão registradas aqui depois de lint, build, smoke local e smoke de produção.
