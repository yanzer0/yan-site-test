---
status: complete
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
  passed_acceptance_ids: [AC-01, AC-02, AC-03, AC-04]
---

# WO-001 - Publicar `/pos`

Objetivo: integrar o pacote do Iago ao padrão estático do site e publicar o fluxo completo.

## Evidências

- AC-01: `/pos` respondeu em produção com o título esperado, os checkouts mensal/anual e as duas recusas ligadas ao downsell.
- AC-02: `/pos/oferta-final` respondeu em produção, mostrou `CLUB`, preservou o checkout `Iz3MwLgkWwk2ejINfXvq` e não teve overflow em 375 px.
- AC-03: a recusa final navegou para `/pos/obrigado`, onde a confirmação ficou visível.
- AC-04: teste escopado 3/3, lint escopado verde, build Next 15.5.14 verde e console das três rotas sem erro. A suíte global teve 375/376 testes verdes; a falha preexistente é `contrato-brain.test.ts`, porque a cópia local do funil ainda não contém `perdido-stand-by`. O lint global também já falha fora da fatia em dois `require()` de `scripts/club/build-club-html.js`.

Deploy: commit `abb69d9`, status Vercel `success` em 2026-09-07.
