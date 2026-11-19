---
work_order: WO-HOME-V2-001
created: 2026-11-19
updated: 2026-11-19
status: active
classe: interface
risco: medio
central_branch: feat/home-v2
owner: Claude
authorized_by: Yan
authorized_at: 2026-11-19
definition_source: pedido do Yan em 19/11/2026, atualizar a home useinfuser.com mantendo o fundo animado de pontos, na identidade V2 clara, com todos os produtos a venda, a Central gratuita, o formulario de diagnostico e um resumo do que a Infuser faz; preview local aprovado por ele antes de producao
scope_lock:
  version: 1
  base_commit: f995cf7256733a4581cadec17a0e488b15fd62ab
  allowed_write_globs:
    - .planning/work-orders/WO-HOME-V2-001.md
    - src/app/page.tsx
    - src/app/home-v2.css
    - src/components/home/**
    - src/components/product-selector.tsx
    - src/components/ui/dotted-surface.tsx
    - src/components/ui/dotted-surface-lazy.tsx
    - tests/home/**
  architecture_delta:
    production_files: [src/app/page.tsx, src/app/home-v2.css, src/components/home/home-v2.tsx, src/components/ui/dotted-surface.tsx]
    runtime_dependencies: []
    public_contracts: [GET /]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [AC-01, AC-02, AC-03]
  stop_when: [AC-01, AC-02, AC-03]
  passed_acceptance_ids: []
---

# Home useinfuser.com na identidade V2 clara

A home atual mostra so dois caminhos (Kit Segundo Cerebro e diagnostico), fundo preto, e o card do diagnostico fala em 14 perguntas quando o formulario tem 16. Faltam A Legiao, o Estudio de CrIAcao, o Kit de Skills, o JARVIS Kit e a Central gratuita.

Esta ordem troca a home por uma pagina curta na V2 clara (Paper, cards brancos, tinta, teal e Lime de destaque, Inter, Onest, Geist Mono), mantendo o campo de pontos 3D animado como assinatura, agora em teal sobre Paper. Secoes: o que a Infuser faz, produtos a venda com preco e link para a pagina de cada um, Central gratuita com a contagem lida do catalogo, e o diagnostico apontando para /diagnostico.

AC-01: `/` renderiza as secoes acima; todo link de produto aponta para rota existente no site; a contagem da Central vem de `CATALOGO_CENTRAL`; `npm run build` e `npm test` aprovados.

AC-02: QA a 1440 px e a 375 px sem rolagem horizontal, foco visivel, `prefers-reduced-motion` sem animacao; preview aprovado pelo Yan.

AC-03: https://useinfuser.com verificado em producao no navegador depois do deploy, so com o ok do Yan.

Fora do escopo: paginas de produto, Central, formulario de diagnostico, layout global e middleware. Rollback: reverter o merge e redeployar a imagem anterior. Um executor, uma rodada.
