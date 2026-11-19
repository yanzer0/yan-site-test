---
work_order: WO-GUIA-REUNIAO-001
created: 2026-11-19
updated: 2026-11-19
status: active
classe: conteudo
risco: baixo
central_branch: main
owner: Claude
authorized_by: Pedro
authorized_at: 2026-11-19
definition_source: pedido do Pedro em 19/11/2026 ("use a skill de guia e crie o entregável do reels 26"), palavra REUNIÃO; roteiro do Reel 26 (Claude Meetings) e prompt do guia 26 no doc ROTEIROS E PROMPTS · SEMANA 3; fatos conferidos em claude.com/resources/articles/claude-meetings (12/11/2026)
scope_lock:
  version: 1
  base_commit: be64361
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-REUNIAO-001.md
    - public/guia-claude-na-reuniao.html
    - src/app/guia-claude-na-reuniao/**
    - src/app/reuniao/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-claude-na-reuniao.html, src/app/guia-claude-na-reuniao/route.ts, src/app/reuniao/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-claude-na-reuniao, GET /reuniao]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GRN-01, GRN-02, GRN-03]
  stop_when: [GRN-01, GRN-02, GRN-03]
  passed_acceptance_ids: []
---
# Guia REUNIÃO do Reel 26 (Claude Meetings e o jeito sem Team) na Central

Objetivo: publicar "Claude na reunião, mesmo sem plano Team" em `/guia-claude-na-reuniao`, com atalho `/reuniao`, protegido pelo cadastro e listado na Central em Guias (categoria Claude e agentes). Parte 1: o que é o Claude Meetings, conforme o anúncio oficial de 12/11/2026 (beta, Team e Enterprise, só Google Meet, participante visível, notas, tarefas e transcrição na página da reunião, regra de convidado de fora por plano, sem áudio). Parte 2: o jeito sem Team, com transcrição do Meet ou do celular e três pedidos prontos (ata, tarefas com prazo, primeira versão da proposta), mais um bônus de mensagem de retorno, aviso de LGPD, erros comuns, cuidados, checklist, perguntas rápidas e CTA para o diagnóstico.

- GRN-01: `GUIAS` tem 63 itens e os dois caminhos resolvem para o guia; testes de `tests/guias` com as contagens novas (76 itens, 68 gratuitos).
- GRN-02: build de produção sem erro e smoke da VPS cobrindo `/guia-claude-na-reuniao` e `/reuniao`.
- GRN-03: em produção, sem sessão o guia redireciona ao cadastro.
