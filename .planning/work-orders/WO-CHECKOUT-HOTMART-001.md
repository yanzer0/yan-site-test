---
work_order: WO-CHECKOUT-HOTMART-001
status: complete
central_branch: claude/checkout-hotmart
owner: Claude
authorized_by: Yan
authorized_at: 2026-10-20
definition_source: pedido do Iago repassado pelo Yan em 20/10/2026 (trocar os checkouts da A Legião e do Kit Segundo Cérebro nas páginas de venda para os links da Hotmart)
scope_lock:
  version: 1
  base_commit: 2f553ee
  allowed_write_globs:
    - .planning/work-orders/WO-CHECKOUT-HOTMART-001.md
    - public/legiao.html
    - src/components/segundo-cerebro.tsx
  architecture_delta:
    production_files:
      - public/legiao.html
      - src/components/segundo-cerebro.tsx
    runtime_dependencies: []
    public_contracts: [GET /legiao, GET /kit-segundo-cerebro]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [HOT-01, HOT-02]
  stop_when: [HOT-01, HOT-02]
  passed_acceptance_ids: [HOT-01, HOT-02]
---

# Checkouts da A Legião e do Kit Segundo Cérebro na Hotmart

## Resultado autorizado

- `/legiao`: o botão de compra aponta para `https://pay.hotmart.com/J108099057B?checkoutMode=10&bid=1792517396268`.
  O parcelamento passa a ser o da Hotmart (12x de R$10,03, conferido no checkout ao vivo em 20/10) e as
  menções a "Hubla" viram "Hotmart".
- `/kit-segundo-cerebro`: `CHECKOUT_URL` aponta para `https://pay.hotmart.com/O108099140A?checkoutMode=10&bid=1792518047033`
  (R$67 à vista, igual à página) e as menções a "Hubla" viram "Hotmart".
- `pagina.html` do Kit (página antiga do MCP, não servida) e os funis `/pos` ficam como estão.

## Critérios de aceite

- `HOT-01`: em produção, `/legiao` e `/kit-segundo-cerebro` não têm nenhum `pay.hub.la` e têm o link Hotmart certo.
- `HOT-02`: publicado pela VPS com `is healthy` do SHA novo; smoke verde.

## Evidência

- `HOT-01`: em produção `/legiao` e `/kit-segundo-cerebro` com zero `pay.hub.la`; `/legiao` aponta para
  `pay.hotmart.com/J108099057B`, mostra "12x de R$10,03" e "Pagamento pela Hotmart"; `/kit-segundo-cerebro`
  aponta para `pay.hotmart.com/O108099140A` e mostra "via Hotmart". Card de compra conferido em 375 px.
- `HOT-02`: commit `b49c5dd`; `deploy.sh` com `useinfuser-site release b49c5dd43e2f is healthy` (a primeira
  tentativa quebrou no download da fonte do `next/font`, a segunda passou sem mudança de código); smoke
  exit 0 no apex e no `www`.
