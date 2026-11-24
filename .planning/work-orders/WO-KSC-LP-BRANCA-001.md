---
work_order: WO-KSC-LP-BRANCA-001
status: authorized
central_branch: claude/ksc-lp-branca
owner: Claude
authorized_by: Iago
authorized_at: 2026-11-24
scope_lock:
  version: 1
  base_commit: 2e9c776b79aa792dce07fb86261754b2ed8c45c9
  allowed_write_globs:
    - .planning/work-orders/WO-KSC-LP-BRANCA-001.md
    - public/kit-segundo-cerebro.html
    - public/ksc/**
    - src/app/kit-segundo-cerebro/**
  architecture_delta:
    production_files:
      - public/kit-segundo-cerebro.html
      - src/app/kit-segundo-cerebro/route.ts
    runtime_dependencies: []
    public_contracts:
      - GET /kit-segundo-cerebro responde 200 em text/html
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids:
    - AC-01
    - AC-02
    - AC-03
  stop_when:
    - AC-01
    - AC-02
    - AC-03
  passed_acceptance_ids: []
---

# Work order: nova pagina de vendas do Kit Segundo Cerebro

## Objetivo

Substituir a pagina React de `/kit-segundo-cerebro` pela nova pagina de vendas de fundo
claro, servida como HTML estatico pelo padrao `route.ts` ja usado pelas iscas do repo.
Produto, preco e checkout nao mudam: segue o Kit Basico R$ 67 em
`pay.hub.la/6VBtmQtyBG5lFjn12AFO`.

## Aceites

| ID | Criterio | Evidencia esperada |
|---|---|---|
| AC-01 | `/kit-segundo-cerebro` responde 200 em HTML com a pagina nova | Rota no output do build e resposta em producao. |
| AC-02 | Tracking preservado | Loader do GTM (`api.useinfuser.com/etrthkooc.js`) no `<head>` do HTML e encaminhamento de `utm_*` para os links de checkout, equivalentes ao que o layout raiz dava para a rota React. |
| AC-03 | Midia fora do HTML | Videos e imagens em `public/ksc/` com nome versionado por hash; o HTML fica abaixo de 50 KB. |

## Notas

Rota `route.ts` nao passa por `src/app/layout.tsx`, entao o GTM e o encaminhamento de UTM
precisam estar no proprio arquivo de `public/`. Ver a secao de tracking em
`_knowledge/projetos/site-useinfuser-repo.md` no Segundo Cerebro.

O componente `src/components/kit-segundo-cerebro-page.tsx` fica no repo sem uso, para
facilitar o rollback.
