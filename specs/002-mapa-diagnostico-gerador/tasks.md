# Tasks: Gerador do mapa de diagnóstico

**Input**: `plan.md`, `spec.md`

## Phase 1: Foundational

- [x] M001 Criar `src/lib/diagnostico/mapa-tipos.ts` com `Achado`, `TipoAchado`, `Classificacao`, `MapaConteudo` e `EstadoMapa`
- [x] M002 Criar `src/lib/diagnostico/mapa-sql.sql` com as tabelas `mapas` e `mapa_achados`, mais o token único e o contador de aberturas
- [x] M003 Criar `src/lib/diagnostico/mapa-schema.ts`: valida o JSON que o modelo devolve. Rejeita achado sem classificação, seção obrigatória ausente e conteúdo proibido por FR-008
- [x] M004 [P] Criar `tests/diagnostico/mapa-schema.test.ts` provando que o validador reprova cada caso proibido

## Phase 2: Geração

- [x] M005 Criar `src/lib/diagnostico/mapa-prompt.ts` com o prompt de extração, carregando as regras de FR-005 a FR-010 e FR-020
- [x] M006 Criar `src/lib/diagnostico/mapa-render.ts`: JSON mais template canônico vira HTML. Determinístico, sem modelo no caminho
- [x] M007 [P] Criar `tests/diagnostico/mapa-render.test.ts`: identidade v2 presente, fingerprints da v1.1 ausentes, nenhum conteúdo proibido, `.gap-box` quando faltar base
- [x] M008 Criar `scripts/diagnostico/gerar-mapa.mjs`: lê a transcrição e as respostas, chama o modelo, valida, renderiza e publica

## Phase 3: Entrega

- [x] M009 Criar `src/app/api/diagnostico/mapa/publicar/route.ts`, autenticada por segredo, recebendo o mapa gerado localmente
- [x] M010 Criar `src/app/mapa/[token]/page.tsx`: serve só o aprovado, incrementa abertura, `noindex`
- [x] M011 Criar `scripts/diagnostico/aprovar-mapa.mjs`: uma ação, um comando

## Phase 4: Prova

- [x] M012 Aplicar as tabelas novas no banco e verificar no `information_schema`
- [x] M013 Gerar um mapa de ponta a ponta com transcrição de exemplo e conferir o HTML. FEITO em 16/08 com o MODELO REAL via `claude -p`, lendo uma transcrição de call inteira. Três rodadas: a primeira passou no validador de primeira mas perdeu números e escolheu citação ruim; a segunda foi reprovada por em-dash (o guard funcionando); a terceira saiu correta. Prompt ajustado nas três frentes.
- [x] M014 Provar que mapa não aprovado devolve 404 e que aprovado incrementa a abertura

## Dependências

- Phase 1 bloqueia tudo.
- M008 depende de M003, M005 e M006.
- M010 depende de M009.
