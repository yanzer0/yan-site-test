---
work_order: WO-GUIA-SCANNER-001
created: 2026-11-23
updated: 2026-11-23
status: active
classe: conteudo
risco: baixo
central_branch: main
owner: Claude
authorized_by: Pedro
authorized_at: 2026-11-23
definition_source: pedido do Pedro em 23/11/2026 (guia do reels 29), palavra SCANNER; roteiro do Reel 29 e prompt do guia 29 no doc ROTEIROS E PROMPTS · SEMANA 3; fatos conferidos em arXiv 2601.10338, github.com/NVIDIA/SkillSpector, platform.claude.com e code.claude.com
scope_lock:
  version: 1
  base_commit: 136956f
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-SCANNER-001.md
    - public/guia-scanner-de-skills.html
    - src/app/guia-scanner-de-skills/**
    - src/app/scanner/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-scanner-de-skills.html, src/app/guia-scanner-de-skills/route.ts, src/app/scanner/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-scanner-de-skills, GET /scanner]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GSC-01, GSC-02, GSC-03]
  stop_when: [GSC-01, GSC-02, GSC-03]
  passed_acceptance_ids: []
---
# Guia SCANNER do Reel 29 (checklist antes de instalar uma skill) na Central

Objetivo: publicar "Antes de instalar uma skill, confira estas 7 coisas" em `/guia-scanner-de-skills`, com atalho `/scanner`, protegido pelo cadastro e listado na Central em Guias (categoria Claude e agentes). Conteúdo: o risco e os números do estudo com a fonte, as sete conferências, o SkillSpector da NVIDIA (instalar, escanear, ler a nota, limites), dois pedidos prontos, duas travas do Claude Code, o que fazer se a chave vazou, erros comuns, cuidados, checklist, perguntas rápidas e CTA para o diagnóstico.

- GSC-01: `GUIAS` tem 65 itens e os dois caminhos resolvem para o guia; testes de `tests/guias` com as contagens novas (78 itens, 70 gratuitos).
- GSC-02: build de produção sem erro e smoke da VPS cobrindo `/guia-scanner-de-skills` e `/scanner`.
- GSC-03: em produção, sem sessão o guia redireciona ao cadastro.
