---
work_order: WO-ESTUDIO-VENDAS-004
created: 2026-11-13
updated: 2026-11-13
status: complete
classe: conteudo
risco: baixo
central_branch: claude/estudio-e8-pagina
scope_lock:
  version: 1
  base_commit: e105725
  allowed_write_globs:
    - .planning/work-orders/WO-ESTUDIO-VENDAS-004.md
    - public/estudio.html
    - public/estudio/**
  architecture_delta:
    production_files: [public/estudio.html]
    runtime_dependencies: []
    public_contracts: [GET /estudio]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [AC-01, AC-02]
  stop_when: [AC-01, AC-02]
  passed_acceptance_ids: [AC-01, AC-02]
---
# Página do Estúdio: 12 agentes (Documentário e Formatos de anúncio no ar)

Pedido do Yan (13/11/2026, "Sim, atualiza"): a página `/estudio` ainda dizia 10 agentes e que Documentário e Formatos de anúncio "chegam em breve", mas os dois estão no ar desde a 1.548.1 (E8). Fonte dos fatos: `public/estudio/assets/estudio.js` do origin/master do infuser-mcp (12 agentes; seis `pc`, seis com gerador externo).

- AC-01: título, descrição, hero, seção de agentes, oferta e FAQ dizem 12 agentes; os dois novos entram como cards no grupo com gerador externo; o vídeo do hero e o print dos rolos são recapturados da interface atual, sem "Em breve" e sem dado de comprador. Zero travessão, preço só no Investimento.
- AC-02: no ar, conferida em 1440 e 375 sem rolagem lateral e sem erro no console; vídeos tocando.

Closeout 13/11/2026: e14397b no ar (release e14397b42eb3 healthy). Hero e rolos recapturados do origin/master do infuser-mcp com os scripts da WO-002, sem "Em breve" e sem dado de comprador. QA local em 1440 e 375: zero erro de console, zero rolagem lateral, vídeo do hero tocando. Na produção: textos de 12 agentes e os dois cards novos presentes, nenhum "10 agentes" ou "em breve" restante, ui-agentes.mp4 e ui-rolos.webp servidos byte a byte iguais ao commit.
