---
work_order: WO-GUIA-FINAL-001
created: 2026-11-25
updated: 2026-11-26
status: complete
classe: conteudo
risco: baixo
central_branch: claude/guia-final-20261125
owner: Claude
authorized_by: Yan
authorized_at: 2026-11-25
definition_source: pedido do Yan em 25/11/2026 ("E o guia?") para o Reels da final da Libertadores, palavra FINAL; fonte pronta em _knowledge/conteudo/guias/guia-motion-libertadores.html no brain e quadros tirados do vídeo final
scope_lock:
  version: 1
  base_commit: de2ca65
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-FINAL-001.md
    - public/guia-motion-libertadores.html
    - public/guias/motion-libertadores/**
    - src/app/guia-motion-libertadores/**
    - src/app/final/**
    - src/lib/guias/catalogo.ts
    - src/middleware.ts
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-motion-libertadores.html, public/guias/motion-libertadores/quadro-1.webp, public/guias/motion-libertadores/quadro-2.webp, public/guias/motion-libertadores/quadro-3.webp, public/guias/motion-libertadores/quadro-4.webp, src/app/guia-motion-libertadores/route.ts, src/app/final/route.ts, src/lib/guias/catalogo.ts, src/middleware.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-motion-libertadores, GET /final, GET /guias/motion-libertadores]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [GFI-01, GFI-02, GFI-03]
  stop_when: [GFI-01, GFI-02, GFI-03]
  passed_acceptance_ids: [GFI-01, GFI-02, GFI-03]
---
# Guia FINAL do Reels de números em motion na Central

Objetivo: publicar "R$ 1 milhão por minuto. Sem programa de edição" em `/guia-motion-libertadores`, com atalho `/final`, protegido pelo cadastro e listado na Central (categoria Conteúdo e criação). É a versão do guia `/gta` com o exemplo do Reels da final da Libertadores: quatro quadros do vídeo, as contas da final na nota do pedido 1, fotos com licença livre no lugar de imagem oficial de marca, cuidado com escudo e logo de campeonato e o aviso de gerar três versões da voz. CTA para `https://useinfuser.com/estudio`. Sem preço.

- GFI-01: `GUIAS` tem 68 itens e os quatro caminhos resolvem para o guia; testes de `tests/guias` com as contagens novas (81 itens, 73 gratuitos) e `tests/guias/motion-libertadores.test.ts`.
- GFI-02: build de produção sem erro e smoke da VPS cobrindo `/guia-motion-libertadores` e `/final`.
- GFI-03: em produção, sem sessão as quatro portas redirecionam ao cadastro, o HTML servido é igual ao do commit, as quatro imagens respondem 200 e a Central mostra o card.

Evidência local 26/11/2026: `tests/guias` 359 aprovados; suíte completa 799 aprovados (10 pulados, os de HTTP que pedem servidor); `next build` sem erro, com `/final` e `/guia-motion-libertadores` estáticos e SHA-256 dos dois corpos prerenderizados igual ao do HTML (`17d6589b7ab55f8e...`). O título no catálogo da Central ficou "Mais de um milhão por minuto. Sem programa de edição", porque o teste da Central recusa valor em R$ ou US$ no catálogo; o H1 do guia segue "R$ 1 milhão por minuto".

Closeout 26/11/2026: `96560a4` no main e no ar (release `96560a4d1d14` healthy na VPS, `/api/health` 200 no apex e no `www`). Sem sessão, `/guia-motion-libertadores`, `/final`, `/guia-motion-libertadores.html` e `/guias/motion-libertadores` deram 307 para `/guias/acesso?guia=motion-libertadores` nos dois hosts; as quatro imagens deram 200 `image/webp` com os tamanhos do commit. SHA-256 do HTML no container e do corpo prerenderizado de `/final` igual ao do commit. O card da Central está no build do container (catálogo no chunk do servidor); não abri a Central com sessão em produção.
