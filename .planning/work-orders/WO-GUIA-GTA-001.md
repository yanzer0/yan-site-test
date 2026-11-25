---
work_order: WO-GUIA-GTA-001
created: 2026-11-25
updated: 2026-11-25
status: complete
classe: conteudo
risco: baixo
central_branch: claude/guia-gta-20261125
owner: Claude
authorized_by: Yan
authorized_at: 2026-11-25
definition_source: pedido do Yan em 25/11/2026 (guia do Reels do GTA VI, palavra GTA); fonte pronta em _knowledge/conteudo/guias/guia-motion-numeros.html no brain e imagens em C:\dev\motion-design\GTA6-Estudio\out\guia
scope_lock:
  version: 1
  base_commit: edfc508
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-GTA-001.md
    - public/guia-motion-numeros.html
    - public/guias/motion-numeros/**
    - src/app/guia-motion-numeros/**
    - src/app/gta/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-motion-numeros.html, public/guias/motion-numeros/quadro-1.webp, public/guias/motion-numeros/quadro-2.webp, public/guias/motion-numeros/quadro-3.webp, public/guias/motion-numeros/quadro-4.webp, src/app/guia-motion-numeros/route.ts, src/app/gta/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-motion-numeros, GET /gta, GET /guias/motion-numeros]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GGT-01, GGT-02, GGT-03]
  stop_when: [GGT-01, GGT-02, GGT-03]
  passed_acceptance_ids: [GGT-01, GGT-02, GGT-03]
---
# Guia GTA do Reels de números em motion na Central

Objetivo: publicar "Uma conta. 45 segundos. Nenhum programa de edição" em `/guia-motion-numeros`, com atalho `/gta`, protegido pelo cadastro e listado na Central (categoria Conteúdo e criação). Conteúdo copiado sem alteração da fonte do brain: a ideia central com quatro quadros do vídeo, bloco do agente Motion design do Estúdio de CrIAção, checklist de 15 itens, seis etapas com quatro pedidos copiáveis, erros comuns, perguntas rápidas e CTA para `https://useinfuser.com/estudio`. Sem preço. As quatro imagens ficam públicas em `/guias/motion-numeros/`, como as de `chatgpt-critico`. O deploy espera a frente de liberação do agente Motion design para todo comprador.

- GGT-01: `GUIAS` tem 67 itens e os quatro caminhos resolvem para o guia; testes de `tests/guias` com as contagens novas (80 itens, 72 gratuitos) e `tests/guias/motion-numeros.test.ts`.
- GGT-02: build de produção sem erro e smoke da VPS cobrindo `/guia-motion-numeros` e `/gta`.
- GGT-03: em produção, sem sessão as quatro portas redirecionam ao cadastro, o HTML servido é igual ao do commit, as quatro imagens respondem 200 e a Central mostra o card.

Evidência local 25/11/2026: suíte completa 792 testes aprovados (10 pulados, os de HTTP que pedem servidor); `next build` sem erro, com `/gta` e `/guia-motion-numeros` estáticos e SHA-256 dos dois corpos prerenderizados igual ao do HTML (`9671f678...e411c6`). `next start` local com segredo sintético: as quatro portas deram 307 para `/guias/acesso?guia=motion-numeros` com `no-store`, e as quatro imagens 200 `image/webp`.

Closeout 25/11/2026: `aea618b` no main e no ar (release `aea618bd8af5` healthy na VPS, health confirmado no apex e no `www`). Sem sessão, `/guia-motion-numeros`, `/gta`, `/guia-motion-numeros.html` e `/guias/motion-numeros` deram 307 para `/guias/acesso?guia=motion-numeros` com `no-store` nos dois hosts; as quatro imagens deram 200 `image/webp` com os tamanhos do commit. SHA-256 do HTML no container e do servido com sessão igual ao do commit (`9671f678...e411c6`). Central por sessão temporária de 5 minutos criada dentro do container, sem cadastro: antes 79 itens e 71 gratuitos, sem o card; depois 80 itens e 72 gratuitos, com o card `/guias/motion-numeros`.
