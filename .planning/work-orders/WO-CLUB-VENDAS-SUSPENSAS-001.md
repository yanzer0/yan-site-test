---
work_order: WO-CLUB-VENDAS-SUSPENSAS-001
status: active
central_branch: claude/club-vendas-suspensas
owner: Claude
authorized_by: Yan
authorized_at: 2026-10-19
definition_source: pedido do Yan em 19/10/2026 (tirar a página de vendas do Infuser Club do ar e suspender as vendas dele por enquanto; o Club vai virar canal de revenda white-label quando o SaaS estiver pronto)
scope_lock:
  version: 1
  base_commit: 60c3d87
  allowed_write_globs:
    - .planning/work-orders/WO-CLUB-VENDAS-SUSPENSAS-001.md
    - next.config.ts
    - src/components/product-selector.tsx
    - src/components/comunidade-page.tsx
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files:
      - next.config.ts
      - src/components/product-selector.tsx
      - src/components/comunidade-page.tsx
      - deploy/vps/smoke.mjs
    runtime_dependencies: []
    public_contracts: [GET /club, GET /pos, GET /pos/oferta-final, GET /, GET /comunidade]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [CLB-01, CLB-02, CLB-03]
  stop_when: [CLB-01, CLB-02, CLB-03]
  passed_acceptance_ids: []
---

# Vendas do Infuser Club suspensas

## Resultado autorizado

- `/club` redireciona temporariamente (307) para `/`. A fonte da página (`src/app/club/`, `scripts/club/`)
  fica intacta: reabrir é apagar o redirect.
- O funil pós-compra do Kit (`/pos` e `/pos/oferta-final`, que vendem o Club) redireciona para `/pos/obrigado`,
  então quem compra o Kit cai direto na confirmação de entrega.
- O cabeçalho `immutable` de 1 ano dos assets passa de `/club/:path*` para `/club/:path+`: o `*` casava a
  própria página `/club` e congelaria o redirect no navegador.
- Home sem o card do Club (2 cards) e `/comunidade` sem link nem CTA pro Club.

## Critérios de aceite

- `CLB-01`: `/club`, `/pos` e `/pos/oferta-final` respondem 307 com o destino certo e sem `immutable`;
  `/club/infuser-club.webp` segue 200 com `immutable`.
- `CLB-02`: home e `/comunidade` sem nenhum `href="/club"`; 375 e 1440 px sem rolagem lateral e console sem erro.
- `CLB-03`: publicado pela VPS com `is healthy` do SHA novo; smoke verde no apex e no `www`.
