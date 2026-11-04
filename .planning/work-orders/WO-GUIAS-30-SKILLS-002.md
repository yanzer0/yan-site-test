---
work_order: WO-GUIAS-30-SKILLS-002
created: 2026-11-04
updated: 2026-11-04
status: active
classe: conteudo
risco: baixo
central_branch: fix/guias-caixa-vazia-20261104
owner: Claude
authorized_by: Yan
authorized_at: 2026-11-04
definition_source: Yan em 04/11/2026, print do guia do skill-creator ("por que esse card 2 tá vazio?")
scope_lock:
  version: 1
  base_commit: 95592e8
  allowed_write_globs:
    - .planning/work-orders/WO-GUIAS-30-SKILLS-002.md
    - public/guia-*.html
  architecture_delta:
    production_files: [public/guia-<9 slugs>.html]
    runtime_dependencies: []
    public_contracts: []
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [G30F-01, G30F-02]
  stop_when: [G30F-01, G30F-02]
  passed_acceptance_ids: []
---
# Guias da série 30 skills sem caixa de comando vazia

Diagnóstico: o gerador desenhava a caixa "Comando" mesmo quando o caminho de instalação não tem comando (Claude.ai, outros agentes, cópia manual). Nove guias mostravam uma caixa vazia com botão Copiar: skill-creator, humanizer, ponytail, frontend-design, mcp-builder, document-skills, obsidian-skills, marketingskills, brand-guidelines.

- G30F-01: nenhum `public/guia-*.html` com `<pre class="ptxt"></pre>`; o texto dos passos continua.
- G30F-02: release novo healthy na VPS e os guias seguem respondendo 307 para o cadastro.