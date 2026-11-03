---
work_order: WO-ESTUDIO-VENDAS-002
created: 2026-11-03
updated: 2026-11-03
status: active
classe: conteudo
risco: baixo
central_branch: claude/modest-neumann-93078b
scope_lock:
  version: 1
  base_commit: d84e3b1
  allowed_write_globs:
    - .planning/work-orders/WO-ESTUDIO-VENDAS-002.md
    - public/estudio.html
    - public/estudio/**
    - out/**
  architecture_delta:
    production_files: [public/estudio.html]
    runtime_dependencies: []
    public_contracts: [GET /estudio]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [AC-01, AC-02, AC-03]
  stop_when: [AC-01, AC-02, AC-03]
  passed_acceptance_ids: []
---
# Página do Estúdio v2: interface como estrela

Pedido do Yan (via sessão orquestradora, 03/11): "com a identidade v2 clara, ok? e mostrando bastante a interface, que é o que chama atenção e brilha o olho do cliente". Refaz `/estudio` com os tokens de `_knowledge/branding/infuser-v2/tokens.css` literais e a interface do Estúdio 1.465.0 (abas, cards, rolos "Roda no seu PC" e "Com gerador externo", efeitos) em vídeo e print, capturada sem dado de comprador. Copy, fatos e oferta da WO-001 seguem.

- AC-01: hero e seções mostram a interface real em movimento (vídeo curto) e em print, versão 1.465.0+, sem dado pessoal.
- AC-02: tokens v2 literais (Carbon/Onyx, Lime, rampa Teal, Inter/Onest/Geist Mono, `.glass`), logo canônico do brain; zero travessão; preço só no Investimento.
- AC-03: no ar, conferida em 1440 e 375 sem rolagem lateral e sem erro no console; o CTA abre o checkout.
