---
work_order: WO-KIT-CHECKOUT-INTL-001
status: active
central_branch: claude/kit-checkout-intl-20261023
owner: Yan
authorized_by: Yan
authorized_at: 2026-10-23
scope_lock:
  version: 1
  base_commit: cc9c39c4e72b97e06bcf7dc16a918f48cbb3167f
  allowed_write_globs:
    - .planning/work-orders/WO-KIT-CHECKOUT-INTL-001.md
    - src/components/segundo-cerebro-en.tsx
    - src/components/segundo-cerebro-es.tsx
  architecture_delta:
    production_files: []
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [AC-01, AC-02, AC-03]
  stop_when: [AC-01, AC-02, AC-03]
  passed_acceptance_ids: []
---

# Checkout internacional do Kit nas páginas EN e ES

Iago (23/10, WhatsApp): uma oferta só, "Second Brain Kit" a US$ 17, checkout https://pay.hotmart.com/T108161703R; a Hotmart converte para a moeda do país do comprador (conferido ao vivo: US$ 17,00 nos EUA, 17,68 € com IVA na Espanha). As duas páginas passam a apontar para esse checkout e mostrar US$ 17.

- AC-01: as duas páginas no ar contêm o link T108161703R e nenhum O108099140A.
- AC-02: a página EN mostra US$ 17 e nenhum US$ 27; a ES não mostra mais € 19.
- AC-03: next build conclui com /en/second-brain-kit e /es/kit-segundo-cerebro.
