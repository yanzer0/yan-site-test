---
work_order: WO-LEGIAO-HERO-SEM-SUB-001
status: active
central_branch: claude/legiao-hero-sem-sub
owner: Claude
authorized_by: Yan
authorized_at: 2026-10-10
definition_source: pedido do Iago repassado pelo Yan em 10/10/2026 ("tira essa subheadline tbm", print do hero no celular)
scope_lock:
  version: 1
  base_commit: 6ca7ace
  allowed_write_globs:
    - .planning/work-orders/WO-LEGIAO-HERO-SEM-SUB-001.md
    - public/legiao.html
  architecture_delta:
    production_files:
      - public/legiao.html
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [LHS-01, LHS-02]
  stop_when: [LHS-01, LHS-02]
  passed_acceptance_ids: []
---

# Hero sem a subheadline

## Resultado autorizado

Sai do hero o parágrafo "Copy, tráfego, vendas e oferta, cada especialista no seu andar. Você conversa
normal e quem entende do assunto assume." e as regras de CSS dele. O hero fica com o título, a linha
"80 especialistas dentro do seu Claude/Codex" e o botão de compra, no celular e no desktop.

## Critérios de aceite

- `LHS-01`: em 375 e 1440 px o hero não tem `.sub` nem o texto da subheadline; o título, a linha
  Claude/Codex e um botão só seguem visíveis; rolagem lateral 0, 0 travessão e nenhum erro; o QA da
  rodada anterior (preço, CTAs rolando, grafo do celular) continua passando.
- `LHS-02`: publicado pela VPS com a linha `is healthy` do SHA novo e o QA contra produção repete LHS-01.

## Evidência

(preenchida no fechamento)
