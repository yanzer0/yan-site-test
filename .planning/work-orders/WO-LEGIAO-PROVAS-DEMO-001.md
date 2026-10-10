---
work_order: WO-LEGIAO-PROVAS-DEMO-001
status: active
central_branch: claude/legiao-provas-demo
owner: Claude
authorized_by: Yan
authorized_at: 2026-10-10
definition_source: pedido do Yan em 10/10/2026 ("diz que vai mostrar o agente trabalhando mas não mostra nada interativo"), opção 1 escolhida (trocar os cartões estáticos pelo chat animado já construído em yangalasso-brain/_infoprodutos/esquadrao-agentes/demo-chat-agentes.html)
scope_lock:
  version: 1
  base_commit: 26f236e
  allowed_write_globs:
    - .planning/work-orders/WO-LEGIAO-PROVAS-DEMO-001.md
    - public/legiao.html
  architecture_delta:
    production_files:
      - public/legiao.html
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [LPD-01, LPD-02, LPD-03]
  stop_when: [LPD-01, LPD-02, LPD-03]
  passed_acceptance_ids: [LPD-01, LPD-02]
---

# A seção de prova mostra o agente trabalhando

## Resultado autorizado

Em `useinfuser.com/legiao#provas`, os três cartões estáticos dão lugar ao chat animado com 5 agentes
(Auditor de Conta Meta, Forja de Página de Vendas, Mestre da Big Idea, Recuperação WhatsApp e Arquiteto
de VSL): abas por agente, conversa que roda sozinha quando a seção aparece e botão de rodar de novo.
Portado na identidade v2 da página. Fora: o chat do Arquiteto de Oferta Grand Slam (fala do produto a
R$97 e cita concorrente pelo nome) e toda menção a comando com barra, porque a página vende "sem comando".

## Critérios de aceite

- `LPD-01`: o texto do demo só usa nomes de agentes que existem na Legião, sem comando com barra, sem
  concorrente, sem preço e sem travessão; o selo diz que são casos de demonstração com output real.
- `LPD-02`: em 1440 px e 375 px a página não rola na horizontal, a conversa anima e troca de agente,
  o chat tem altura fixa (não empurra a página), `prefers-reduced-motion` mostra a conversa sem
  animação e, sem JavaScript, o primeiro caso aparece completo.
- `LPD-03`: publicado pela VPS, `/legiao` responde 200 no apex e no `www` com o demo no lugar dos cartões.

## Evidência

- `LPD-01`: as 5 conversas vêm do demo de 29/06; nomes conferidos contra o catálogo de agentes da
  Legião (Auditor de Conta Meta, Forja de Página de Vendas, Mestre da Big Idea, Estrategista de
  Recuperação WhatsApp, Arquiteto de VSL, e os citados Auditor de Tracking, Minerador de Voz do Cliente
  e Arquiteto de Mecanismo Único). No diff: 0 travessão, 0 comando com barra, 0 concorrente, 0 "R$97".
  Selo: "Casos de demonstração: o output de cada agente é real, recriado em formato de conversa."
- `LPD-02`: Chromium headless contra `public/` local. 1440 e 375 px: rolagem lateral 0, sem erro de
  página, a conversa anima (1 bolha no meio, 6 no fim), a seção mantém a altura durante a animação e a
  aba troca o agente. `reducedMotion: reduce`: 6 bolhas na hora, sem "digitando". Sem JavaScript: o
  primeiro caso completo (6 bolhas). CSS dos cartões removido (sem uso).
