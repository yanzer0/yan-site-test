---
work_order: WO-ESTUDIO-VENDAS-005
created: 2026-11-25
updated: 2026-11-25
status: complete
classe: conteudo
risco: baixo
central_branch: claude/estudio-motion-20261125
owner: Claude
authorized_by: Yan
authorized_at: 2026-11-25
definition_source: pedido do Yan em 25/11/2026 ("atualize também a página de vendas"), repassado pela sessão orquestradora; pendência "Atualizar a página de vendas do Estúdio com o Motion design" e etapa E11 em _infoprodutos/estudio-de-criacao/estudio-de-criacao.md; corpo do agente em _infoprodutos/estudio-de-criacao/agents/motion_design.md; interface em public/estudio/ do origin/master do infuser-mcp (4ac6df7dc, release 1.592.0)
scope_lock:
  version: 1
  base_commit: 47b7be6
  allowed_write_globs:
    - .planning/work-orders/WO-ESTUDIO-VENDAS-005.md
    - public/estudio.html
    - public/estudio/**
  architecture_delta:
    production_files: [public/estudio.html, public/estudio/ag-motion-design.mp4, public/estudio/ag-motion-design.webp, public/estudio/ui-rolos.webp, public/estudio/ui-agentes.mp4, public/estudio/ui-agentes.webp]
    runtime_dependencies: []
    public_contracts: [GET /estudio]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [AC-01, AC-02]
  stop_when: [AC-01, AC-02]
  passed_acceptance_ids: [AC-01, AC-02]
---
# Página do Estúdio: 13 agentes (Motion design para todo comprador)

Pedido do Yan (25/11/2026): a página `/estudio` ainda diz 12 agentes e seis no PC, mas desde a E11 o Motion design está liberado para todo comprador (13 agentes, sete no PC). Fatos do agente vindos do corpo `motion_design.md`: anúncio de 8 a 20 segundos de app, site, produto ou marca, com logo, telas e fonte do comprador em 3D, montado como código no PC e renderizado em 4K, sem gerador de vídeo; storyboard numerado antes de montar; locução e música geradas são opcionais e pagas na conta do comprador. Mídia de exemplo: vídeo do painel Infuser (marca própria, aprovado pelo Yan em 18/11). Nada do Reel do GTA (marca de terceiro). Preço, checkout e link de compra intocados.

- AC-01: título, descrição, og:title, topo, seção de agentes, oferta e FAQ dizem 13 agentes e sete no PC; card do Motion design no grupo do PC; frame novo na faixa de saídas reais com vídeo 360x640 H.264 sem áudio e pôster WebP; print dos rolos e vídeo do topo (com o pôster) recapturados da interface real (origin/master do infuser-mcp) com o card novo, o texto de 13 agentes e sem dado de comprador; o vídeo antigo do topo abria em "12 agentes... Seis rodam no seu PC". Zero travessão; preço e checkout iguais.
- AC-02: no ar, `/estudio` 200 público com title de 13 agentes, card e vídeo novos respondendo 200, nenhum "12 agentes" ou "Doze" no HTML servido; conferida em 1440 e 375 sem rolagem lateral e sem erro no console.

Closeout 25/11/2026: `e0d1441` no ar (release `e0d144162273` healthy, health confirmado no apex e no `www`). Suíte local com 792 testes aprovados e build sem erro. Em produção, nos dois hosts: `/estudio` 200 com o title de 13 agentes, zero "12 agentes" e zero "Doze", card e frame do Motion design presentes, checkout e preço iguais; SHA-256 do HTML servido igual ao do commit; `ag-motion-design.mp4`, `ag-motion-design.webp` e `ui-agentes.mp4`, `ui-agentes.webp` e `ui-rolos.webp` (com `?v=20261125`, porque `/estudio/:path+` é `immutable`) responderam 200 byte a byte iguais ao commit. QA no navegador em 1440 e 375: zero rolagem lateral, zero erro de console, vídeo do topo tocando.
