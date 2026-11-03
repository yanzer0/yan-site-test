---
work_order: WO-ESTUDIO-VENDAS-001
created: 2026-11-03
updated: 2026-11-03
status: complete
classe: conteudo
risco: baixo
central_branch: claude/modest-neumann-93078b
scope_lock:
  version: 1
  base_commit: 7f4a7ebc18bf
  allowed_write_globs:
    - .planning/work-orders/WO-ESTUDIO-VENDAS-001.md
    - public/estudio.html
    - public/estudio/**
    - src/app/estudio/**
    - next.config.ts
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/estudio.html, src/app/estudio/route.ts, next.config.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /estudio]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [AC-01, AC-02, AC-03]
  stop_when: [AC-01, AC-02, AC-03]
  passed_acceptance_ids: [AC-01, AC-02, AC-03]
---
# Página de vendas do Estúdio de CrIAção

Objetivo: publicar `useinfuser.com/estudio`, página de vendas própria do Estúdio de CrIAção (R$ 67, Hotmart `A108157970A`), destino dos anúncios. HTML estático self-contained em identidade v2 clara, servido como o `/legiao`. Fonte dos fatos: `_infoprodutos/estudio-de-criacao/estudio-de-criacao.md` no brain e a interface `mcp.useinfuser.com/estudio` (1.461.0+). Fora: Central, captura, outras páginas.

- AC-01: `/estudio` responde 200 com o HTML; assets em `/estudio/*` com cache imutável sem pegar a página; build de produção sem erro e smoke da VPS cobrindo `/estudio`.
- AC-02: preço e parcelamento iguais ao checkout ao vivo (R$ 67 ou 12x de R$ 6,93) e só na seção de investimento; zero travessão; custo do gerador externo dos quatro agentes dito com clareza.
- AC-03: em produção, conferida em 1440 e 375 sem rolagem lateral e sem erro no console; o CTA abre o checkout.

Closeout 03/11/2026: 490150b no ar (release 490150b266e9 healthy na VPS, smoke com /estudio). SHA-256 do HTML servido igual ao do commit; assets em /estudio/* com cache imutável e a página sem. Conferida em 1440 e 375 sem rolagem lateral, 5 de 5 vídeos tocando, fontes carregadas, console sem erro; o CTA abre pay.hotmart.com/A108157970A com o sck (R$ 67 ou 12x de R$ 6,93 no checkout ao vivo).
