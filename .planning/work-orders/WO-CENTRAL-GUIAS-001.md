---
work_order: WO-CENTRAL-GUIAS-001
created: 2026-10-28
updated: 2026-10-28
status: active
classe: feature
risco: alto
central_branch: codex/central-guias-20261028
scope_lock:
  version: 1
  base_commit: c212e8848489664012c9e0f1bb0781f185b4b395
  allowed_write_globs:
    - .planning/work-orders/WO-CENTRAL-GUIAS-001.md
    - specs/009-central-guias/UX-E-CONTEUDO.md
    - specs/009-central-guias/CONTRATOS-E-EVENTOS.md
    - specs/009-central-guias/README.md
    - specs/009-central-guias/INDEX.md
    - src/lib/guias/documentos.ts
    - src/app/privacidade/page.tsx
    - src/lib/guias/marketing.ts
    - public/guias/guias.js
    - public/guias/guias.css
    - tests/guias/**
  architecture_delta:
    production_files: [src/lib/guias/documentos.ts, src/lib/guias/marketing.ts, public/guias/guias.js, public/guias/guias.css, src/app/privacidade/page.tsx]
    runtime_dependencies: []
    public_contracts: [GET /guias, GET /guias/acesso, GET /guias/:slug, POST /api/guias/acesso]
    persistence_surfaces: []
    background_jobs: []
  acceptance_ids: [AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07]
  stop_when: [AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07]
  passed_acceptance_ids: [AC-01, AC-02, AC-03, AC-04, AC-06, AC-07]
---
# Central de guias com cadastro obrigatório

Objetivo: biblioteca v2 clara, seis campos obrigatórios persistidos e sessão protegendo os 16 guias, aliases e HTMLs. Fora: conteúdo dos guias, diagnóstico, disparos e gate antigo.
Diagnóstico: `src/middleware.ts:151` cobre só demo/painel; 16 arquivos em `public/` são públicos. Banco e equipe existem. Definição: [manifesto](../../specs/009-central-guias/INDEX.md), v1.0, pronta.
AC-01: inventário completo e todos os caminhos protegidos. Prova: `npm test -- tests/guias/catalogo.test.ts tests/guias/middleware.test.ts`.
AC-02: seis campos validados e falha de persistência não libera. Prova: `npm test -- tests/guias/acesso.test.ts`.
AC-03: cookie válido/adulterado/expirado e middleware anterior preservado. Prova: `npm test -- tests/guias/sessao.test.ts tests/guias/middleware.test.ts`.
AC-04: consulta/export só para equipe aprovada. Prova: `npm test -- tests/guias/leads.test.ts`.
AC-05: suíte, TypeScript e build. Prova: `npm test`, `npx tsc --noEmit`, `npm run build`. QA visual e deploy pelo root, fora desta sessão.
Teto: 2 rodadas ou 90 minutos; preservar modelo/esforço vigente. Revisão e publicação pelo root; não alegar executadas.

## Evidência da execução

RED inicial: `npm test -- tests/guias/catalogo.test.ts`, 2 falhas antes de implementar catálogo/proteção.
AC-01/03: catálogo + middleware, 63 testes aprovados; sessão, 5 aprovados. Todos os links, aliases, sublinks e 16 HTMLs cobertos.
AC-02: `tests/guias/acesso.test.ts`, 27 aprovados, incluindo seis campos, falha de banco, origem, tamanho e limites reais.
AC-04: `tests/guias/leads.test.ts` + `db.test.ts`, 7 aprovados, sem saída anônima e com CSV protegido.
Suíte: `npm test`, 542 aprovados; 9 pulados explicitamente (4 de Postgres descartável e 5 HTTP sem URL). Nenhum assert antigo removido.
HTTP real: suíte permanente em `tests/guias/http.test.ts`; rodada final após build cobre domínio público atrás do proxy.
AC-05 permanece parcialmente pendente: `npx tsc --noEmit` encontra somente TS2493 em `tests/instalar/instalar.test.ts:94,101`, arquivo sem delta. A mesma falha foi reproduzida no checkout principal com `node node_modules/typescript/bin/tsc --noEmit --incremental false --project C:/Users/PC/Documents/GitHub/yan-site-test/tsconfig.json`. Não foi corrigida por estar fora do escopo.
Código pronto para revisão do root; gate não foi relaxado. A revisão visual, a migração, o teste de gravação viva e o deploy não foram executados pelo executor.

Handoff: conteúdo em `c3df1cb`; `npm run build` final concluiu com as rotas novas e middleware 36,9 kB. `TEST_GUIAS_HTTP_URL=http://127.0.0.1:3188 npm test -- tests/guias/http.test.ts`: 5 aprovados, incluindo proxy, variantes percent-encoded, sessão válida, cookie falso e subrequest. `git diff --check` e Scope Lock aprovados. Revisão de simplicidade: sem dependência nova ou abstração descartável; Lean already. Ship. Estado segue active para a revisão do root e a decisão explícita sobre AC-05, sem closeout falso.


## Rodada autorizada: marketing, v1.1

Fonte: novo pedido de Yan para guardar respostas, cookies/localização e dados úteis para públicos semelhantes e contato comercial. Atualização autorizada pelo root antes de uma única publicação. AC-01 mantém catálogo/gates e soma GTM condicionado nos 16 HTMLs; AC-02 soma escolhas opcionais, versão, metadados allowlisted e GeoJS tolerante a falhas; AC-03 soma preferências e revogação; AC-04 soma filtros comercial/Meta e proibição de texto livre no Meta; AC-05 mantém suíte/build e achado TS2493 fora da frente. Prova adicional: `npm test -- tests/guias/marketing.test.ts tests/guias/preferencias.test.ts`. Teto restante: 30 a 35 min sem ultrapassar os 90 min originais.

## Evidência v1.1

- `npm test`: 564 aprovados, 9 pulados por ambiente (4 Postgres descartável e 5 HTTP sem URL). Novos testes cobrem opt-out sem chamada GeoJS, indisponibilidade tolerada no cadastro, whitelist, loader condicionado, preferências/revogação e filtros/export Meta sem respostas livres.
- `tsc --noEmit`: somente os dois TS2493 legados do instalador, preservados fora da frente.
- Escolhas atuais por contato prevalecem sobre capturas antigas, e revogar remove enriquecimentos da base corrente. GTM é carregado uma vez após opt-in, e coleta posterior dos cookies exige autorização ainda vigente no servidor. Formulário e preferências nunca carregam GTM.
- Facto do código: 15 guias tinham o loader inline; `guia-ia-sem-bajulacao.html` não tinha. Nos 15 foi substituído só o script; no restante foi adicionado o mesmo loader funcional condicionado. Textos/botões/conteúdo dos 16 foram preservados.
- Localização é só estimada por IP (GeoJS, timeout 1,5s), sem prompt GPS. Não houve disparo de mensagem, campanha, criação de audiência nem alegação de conversão Meta.
- Migração atualizada é aditiva e repetível: `guias_leads` recebe escolhas/metadados e `guias_consentimentos` guarda histórico com versão/origem/horário do servidor. Aplicar antes da publicação; configuração continua apenas `GUIAS_ACCESS_SECRET`.
- Limite: tags do restante do site React continuam no carregador preexistente, fora desta fatia. A mudança de consentimento cobre central e os 16 guias; a política recebe a seção específica.

Handoff final v1.1: `99cd9b6` contém a implementação. Build final concluiu com `/guias/preferencias` e `/api/guias/preferencias`; HTTP real final: 5/5 aprovados. Preview reiniciado em 127.0.0.1:3188 com segredo sintético e banco local deliberadamente indisponível. São 7 linhas de asserts ajustadas para os argumentos novos, limite de 32KiB e filtro paginado; os 7 cenários foram mantidos e receberam expectativas correspondentes. Nenhum teste ou cenário antigo foi removido. Migração/gravação real, QA visual independente e deploy continuam com o root; AC-05 permanece parcial por TS2493 legado.

## Correção visual pontual do QA

O root comprovou no screenshot de produção que o glifo diagonal era apresentado como emoji azul no Windows. Nesta correção limitada, os cinco usos do ícone na central, gate, preferências e rodapé passaram a um SVG inline com stroke=currentColor, dimensões explícitas e aria-hidden. Sem mudança funcional, de consentimento, dados ou escopo; TS2493 legado permanece. Prova afetada: `npm test -- tests/guias/catalogo.test.ts`. Publicação/revisão ficam com o root.
## Revisão e publicação pelo root

1. Release de código `587ce6e10bdf` publicado na VPS e confirmado em `/api/health` no apex e no `www`.
2. `npm test -- tests/guias`, com HTTP local real habilitado: 129/129 aprovados na revisão.
3. Build Linux de produção aprovado; smoke interno de 99 probes aprovado. Smoke externo: 99/99 em cada host no release funcional anterior ao ajuste exclusivo das setas SVG.
4. Os 16 guias, aliases, sublinks e HTMLs exigem cadastro; variante percent-encoded também foi conferida.
5. Cadastro real de verificação salvou as seis respostas antes de abrir a biblioteca; sem marketing autorizado, não iniciou scripts de terceiros.
6. Captura de marketing real conferiu campanha, cookie permitido e localização aproximada disponível; cookie de login e campos extras ficaram fora da gravação.
7. Alteração e revogação de contato comercial conferidas no navegador e no banco, com três eventos de histórico.
8. QA visual desktop/celular aprovado após trocar os glifos por SVG; busca ClickUp retornou um guia; largura 375 px sem overflow. Dois cadastros de teste removidos e Postgres descartável encerrado.
9. Nenhum assert preexistente foi removido. AC-05 mantém explicitamente os dois TS2493 do instalador, reproduzidos no baseline e fora desta mudança; não houve closeout falso.
10. Aplicados Studio (direção, sourcing, criação e QA), frontend-design, design-taste-frontend, ui-ux-pro-max, awwwards-standards; Codar com software-engineer, event-driven, ponytail e code-craft; Tráfego para atribuição e exportações. Rollback preserva tabelas e dados.


## Nova fatia autorizada pelo usuário, 28/10 às 15h28

O usuário pede as duas opções inicialmente marcadas e o destaque verde ocupando toda a primeira linha. O CTA afirmativo passa a Confirmar escolhas e acessar, com alternativa igualmente visível Continuar sem marketing. Os seis campos continuam necessários para ambos. A negativa ou submitter ausente/desconhecido envia false/false, sem enriquecimento; preferências exibem valores salvos reais e o backend mantém omissão=false. Aviso de dados passa a v2, sem migração.
AC-06: render inicial marcado e preferências falsas preservadas; ações explícitas e negativa sem metadados; os dois botões bloqueiam/restauram em erro. Prova: `npm test -- tests/guias/acoes-formulario.test.ts tests/guias/catalogo.test.ts tests/guias/preferencias.test.ts tests/guias/acesso.test.ts`.
AC-07: destaque grid-column 1 / -1 em todos os breakpoints, mantendo 16 guias/ordem e SVG. Prova: catálogo e CSS afetados, QA vivo pelo root.
Escopo desta fatia restrito aos quatro arquivos de produção do delta, testes afetados e docs listados. Sem DB/auth/outros guias. Teto desta nova autorização: 2 rodadas ou 90 min, alvo 10 min. O achado TS2493 e o estado anterior permanecem visíveis; sem closeout falso.

A base desta nova fatia é o estado publicado c212e88 autorizado no despacho. O range novo exclui as alterações já entregues da v1.1; por isso o lock foi restrito aos arquivos desta revisão.

Evidência da nova fatia: testes afetados 54/54 aprovados, incluindo 10 casos de render/ações de formulário. Defaults do servidor e dados/auth não foram alterados. Sete requisitos de interação e os seis campos foram preservados. O typecheck geral continua com os dois TS2493 anteriores do instalador. Nenhum cenário antigo foi removido; três expectativas de versão foram atualizadas para v2.

Achado de texto fora dos quatro arquivos autorizados de produção: `src/app/privacidade/page.tsx`, seção 3.4, ainda afirma que as opções começam desmarcadas. O root deve alinhar essa frase ao novo fluxo antes da publicação; o executor não alterou arquivo fora da sua propriedade.

Fechamento pontual autorizado pelo root antes da publicação: a frase da política agora descreve seleção inicial, confirmação afirmativa, alternativa sem marketing e preferências efetivamente salvas. O caminho exato da política foi incluído no lock para refletir essa autorização. Documento compartilhado passa a guias.js?v=20261028-3 e guias.css?v=20261028-2 para evitar handler/CSS antigo na nova interação. Nenhum outro código ou comportamento foi alterado; testes afetados de formulário/catálogo, sem build redundante.
