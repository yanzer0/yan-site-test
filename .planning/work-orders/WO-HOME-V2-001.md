---
work_order: WO-HOME-V2-001
created: 2026-11-19
updated: 2026-11-19
status: completed
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
  passed_acceptance_ids: [AC-01, AC-02, AC-03]
---

# Home useinfuser.com na identidade V2 clara

A home atual mostra so dois caminhos (Kit Segundo Cerebro e diagnostico), fundo preto, e o card do diagnostico fala em 14 perguntas quando o formulario tem 16. Faltam A Legiao, o Estudio de CrIAcao, o Kit de Skills, o JARVIS Kit e a Central gratuita.

Esta ordem troca a home por uma pagina curta na V2 clara (Paper, cards brancos, tinta, teal e Lime de destaque, Inter, Onest, Geist Mono), mantendo o campo de pontos 3D animado como assinatura, agora em teal sobre Paper. Secoes: o que a Infuser faz, produtos a venda com preco e link para a pagina de cada um, Central gratuita com a contagem lida do catalogo, e o diagnostico apontando para /diagnostico.

AC-01: `/` renderiza as secoes acima; todo link de produto aponta para rota existente no site; a contagem da Central vem de `CATALOGO_CENTRAL`; `npm run build` e `npm test` aprovados.

AC-02: QA a 1440 px e a 375 px sem rolagem horizontal, foco visivel, `prefers-reduced-motion` sem animacao; preview aprovado pelo Yan.

AC-03: https://useinfuser.com verificado em producao no navegador depois do deploy, so com o ok do Yan.

Fora do escopo: paginas de produto, Central, formulario de diagnostico, layout global e middleware. Rollback: reverter o merge e redeployar a imagem anterior. Um executor, uma rodada.

## Closeout em 19/11/2026

AC-01 PASS: commits `3aa5d61` e `a9107b0`. A home tem hero, o que a Infuser faz, cinco produtos (Kit Segundo Cerebro, A Legiao, Estudio de CrIAcao, Kit de Skills, JARVIS Kit), a Central com 67 gratuitos lidos de `CATALOGO_CENTRAL` e o diagnostico. `npm run build` exit 0; vitest 768 aprovados e 10 pulados; eslint limpo nos arquivos tocados.

AC-02 PASS: preview local a 1440 px e a 375 px com scrollWidth igual ao clientWidth e console sem erro; a entrada do hero e o campo de pontos respeitam `prefers-reduced-motion`. Yan aprovou o preview ("Pode subir").

AC-03 PASS: `deploy.sh` na VPS com `useinfuser-site release a9107b075ffb is healthy`; `smoke.mjs` exit 0 no apex e no www. Em https://useinfuser.com a pagina nova abre com o titulo novo e sem erro no console; os links de produto, diagnostico, privacidade e termos respondem 200, e a Central, os guias e o Kit VS Code respondem 307 para o cadastro `/guias/acesso`, como antes.
