---
work_order: WO-GUIA-KIT-SEGUNDO-CEREBRO-001
created: 2026-11-13
updated: 2026-11-13
status: active
classe: conteudo
risco: baixo
central_branch: guia/kit-segundo-cerebro-20261113
owner: Claude
authorized_by: Yan
authorized_at: 2026-11-13
definition_source: tarefa da sessao principal em 13/11/2026, publicar https://useinfuser.com/guia-kit-segundo-cerebro a partir de _infoprodutos/segundo-cerebro/guia-instalacao.md do yangalasso-brain, para o link "Guia" do card do Kit na central de acessos (BRAIN_BASE_KIT_GUIDE_URL)
scope_lock:
  version: 1
  base_commit: 7bc60eb0a632c811cc30bbadeca75e8a44495087
  allowed_write_globs:
    - .planning/work-orders/WO-GUIA-KIT-SEGUNDO-CEREBRO-001.md
    - public/guia-kit-segundo-cerebro.html
    - src/app/guia-kit-segundo-cerebro/**
    - tests/guias/**
    - deploy/vps/smoke.mjs
  architecture_delta:
    production_files: [public/guia-kit-segundo-cerebro.html, src/app/guia-kit-segundo-cerebro/route.ts, deploy/vps/smoke.mjs]
    runtime_dependencies: []
    public_contracts: [GET /guia-kit-segundo-cerebro, GET /guia-kit-segundo-cerebro.html]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [AC-01, AC-02, AC-03]
  stop_when: [AC-01, AC-02, AC-03]
  passed_acceptance_ids: []
---

# Publicar o guia de instalacao do Kit Segundo Cerebro

O card do Kit na central de acessos (mcp.useinfuser.com/acessos) tem um link "Guia" que aponta para https://useinfuser.com/guia-kit-segundo-cerebro e hoje responde 404, porque a pagina nunca foi escrita. Esta ordem escreve essa pagina a partir de `_infoprodutos/segundo-cerebro/guia-instalacao.md` do yangalasso-brain, mantendo conteudo e ordem.

Duas adaptacoes exigidas pelo novo contexto: o passo 1 comeca no arquivo que a pessoa ja baixou pelo botao "Baixar o kit", sem contradizer quem veio pela area de membros da Hubla; e o wikilink final `[[guia-personalizacao]]`, que nao existe como pagina no site, e resolvido apontando para o arquivo `guia-personalizacao.md` que ja vem dentro do proprio kit, com o resumo do que ele cobre.

A pagina e PUBLICA, sem o portao de captura de e-mail dos guias gratuitos: quem chega nela ja comprou. Por isso ela nao entra no catalogo da Central, nao entra no matcher do middleware e nao carrega o loader de marketing consentido. O guard do smoke que exige portao em todo `public/guia-*.html` ganha uma excecao nomeada para este arquivo.

Nota de estado, fora do escopo: cinco work orders de guias ja publicados seguem com `status: active` e `central_branch: main` (WO-GUIA-CONTEUDO-001, WO-GUIA-CRITICO-001, WO-GUIA-EDICAO-001, WO-GUIA-FABLE-001, WO-GUIA-PROMPT-001), o que bloqueia escrita direta no main por SL002. Esta frente roda em branch propria e nao mexe no lock alheio.

AC-01: `public/guia-kit-segundo-cerebro.html` existe com o conteudo do markdown na mesma ordem, acentuacao correta, charset declarado e funcionando sem JavaScript; a rota `src/app/guia-kit-segundo-cerebro/route.ts` serve o arquivo com `text/html; charset=utf-8`; testes de guias aprovados.

AC-02: QA a 1440 px e a 375 px sem rolagem horizontal, com os comandos quebrando linha no celular; build e smoke aprovados, com `/guia-kit-segundo-cerebro` respondendo 200 sem portao.

AC-03: https://useinfuser.com/guia-kit-segundo-cerebro verificado em producao, com 200, conteudo certo e acentos corretos no navegador, nao pelo codigo de saida do deploy.

Fora do escopo: infuser-mcp, central de acessos, Hubla, n8n, catalogo da Central e middleware. Rollback: reverter o merge da branch e redeployar a imagem anterior. Um executor, uma rodada.
